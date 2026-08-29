import prisma from "src/config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { User } from "src/generated/prisma/client";
import crypto from "node:crypto";
import { sendPasswordResetEmail } from "src/utils/passwordResetEmail";

interface AuthResult {
  token: string;

  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";

  register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      throw new Error("Email already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password_hash: hashPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, this.jwtSecret, {
      expiresIn: "7d",
    });

    return {
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  };

  login = async (email: string, password: string): Promise<AuthResult> => {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!existingUser) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign({ userId: existingUser.id }, this.jwtSecret, {
      expiresIn: "7d",
    });

    return {
      token: token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    };
  };

  async deleteAccount(user_id: string): Promise<void> {
    if (!user_id) {
      throw new Error("Invalid user");
    }

    await prisma.user.delete({
      where: { id: user_id },
    });
  }

  async getMe(user_id: string): Promise<User> {
    if (!user_id) {
      throw new Error("Invalid user");
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateProfile(
    user_id: string,
    data: { name?: string; email?: string },
  ): Promise<User> {
    if (!user_id) {
      throw new Error("Invalid user");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user_id },
      data: data,
    });

    return updatedUser;
  }

  async changePassword(
    user_id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!user_id) {
      throw new Error("Invalid user");
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user_id },
      data: { password_hash: hashNewPassword },
    });
  }

  forgotPassword = async (email: string, baseUrl: string): Promise<void> => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always resolve smoothly without revealing if user exists
    if (!user) {
      return;
    }

    // 1. Generate 32 bytes of secure entropy
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash using fast SHA-256 (not bcrypt!)
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const EXPIRY_DURATION_MS = 15 * 60 * 1000;
    const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);

    // 3. Invalidate any existing unused reset tokens for this user (Best Practice)
    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: user.id,
        used_at: null,
      },
      data: {
        used_at: new Date(),
      },
    });

    // 4. Create the new token record
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token_hash: hashedToken,
        expires_at: expiresAt,
      },
    });

    // 5. Send email containing the RAW token
    await sendPasswordResetEmail(
      user.email,
      rawToken,
      user.name || "User",
      baseUrl,
    );
  };

  resetPassword = async (token: string, newPassword: string) => {

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token_hash: hashedToken,
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });


    const hashNewPassword = await bcrypt.hash(newPassword, 10);

  };
}
