import { type Request, type Response } from "express";
import { AuthService } from "src/services/auth.service";
import { clearAuthCookie, setAuthCookie } from "src/utils/authCookie";
import jwt from "jsonwebtoken";

const { login, register, deleteAccount, getMe, updateProfile, changePassword } =
  new AuthService();

export async function LoginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    const { token, user } = await login(email, password);

    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login Successful",
      user: user,
    });
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function RegisterController(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const validationErrors: Record<string, string> = {};

  if (!name || name.length < 3) {
    validationErrors.name = "Name must be at least 3 characters long";
  }
  if (!password || password.length < 6) {
    validationErrors.password = "Password must be at least 6 characters long";
  }
  if (!email || !email.includes("@") || email.length < 5) {
    validationErrors.email = "Invalid email address format";
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  try {
    const { token, user } = await register(name, email, password);

    setAuthCookie(res, token);

    return res
      .status(201)
      .json({ message: "Account created Successfully", user });
  } catch (error: any) {
    if (error.message === "Email already in use") {
      return res.status(409).json({ error: error.message });
    }

    // 🔑 FIX: Log it to your terminal console so you can read it instantly
    console.error("Registration Crash Detail:", error);

    // 🔑 FIX: Send back the string message instead of the raw instance object
    return res.status(500).json({
      error: error.message || "Internal Server Error",
      details: error,
    });
  }
}

export async function LogoutController(req: Request, res: Response) {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully" });
}

export async function meController(req: any, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No session token provided." });
  }

  try {
    const userId = req.user_id;
    // get the user from the database using the userId
    const user = await getMe(userId);
    res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export async function DeleteAccountController(req: any, res: Response) {
  const user_id = req.user_id;

  try {
    await deleteAccount(user_id);

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Failed to delete account",
    });
  }
}

export async function LogoutAllController(req: any, res: Response) {
  // Implement logic to invalidate all sessions for the user
  clearAuthCookie(res);
  res.json({ message: "Logged out from all sessions successfully" });
}

export async function updateUserController(req: any, res: Response) {
  const user_id = req.user_id;

  console.log("User ID from token:", user_id);

  const { name, email } = req.body;

  if (email) {
    return res.status(400).json({
      message: "Email cannot be updated",
    });
  }

  if (name && name.length < 3) {
    return res.status(400).json({
      message: "Name must be at least 3 characters long",
    });
  }

  const validationErrors: Record<string, string> = {};

  if (name && name.length < 3) {
    validationErrors.name = "Name must be at least 3 characters long";
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  const data: { name?: string; email?: string } = {};
  if (name) data.name = name;

  await updateProfile(user_id, data);

  console.log(user_id);

  // Implement logic to update user information
  res.json({ message: "User updated successfully" });
}

export async function ChangePasswordController(req: any, res: Response) {
  const user_id = req.user_id;
  const { currentPassword, newPassword } = req.body;
  console.log(req.body);

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "All password fields are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });
  }
  try {
    await changePassword(user_id, currentPassword, newPassword);

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error: any) {
    if (error.message === "Current password is incorrect") {
      return res.status(401).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Unable to change password.",
    });
  }
}
