import { type Request, type Response } from "express";
import { AuthService } from "src/services/auth.service";

const { login, register, deleteAccount } = new AuthService();

export async function LoginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const user = await login(email, password);
  res.json(user);
}

export async function RegisterController(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (name.length < 3) {
    throw new Error("Name must be at least 3 characters long");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  if (!email.includes("@")) {
    throw new Error("Invalid email format");
  }
  if (email.length < 5) {
    throw new Error("Email must be at least 5 characters long");
  }

  const { token, user } = await register(name, email, password);
  res.json({ token, user });
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
