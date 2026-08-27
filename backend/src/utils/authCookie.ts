import type { Response } from "express";

const COOKIE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_AGE,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};
