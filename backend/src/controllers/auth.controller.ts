import { type Request, type Response } from "express";
import { AuthService } from "src/services/auth.service";

const { login, register, deleteAccount } = new AuthService();

export async function LoginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    const { token, user } = await login(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
}

export async function DeleteAccountController(req: any, res: Response) {
  const user_id = req.userId;
  deleteAccount(user_id);
  res.json({ message: "Account deleted successfully" });
}
