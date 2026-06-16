import prisma from "src/config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
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
        password: hashPassword,
      } as any,
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
  }

  async login(email: string, password: string): Promise<AuthResult> {
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
  }

  async deleteAccount(user_id: string): Promise<void> {
    if (!user_id) {
      throw new Error("Invalid user");
    }

    await prisma.user.delete({
      where: { id: user_id },
    });
  }
}
