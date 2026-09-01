import type { Response } from "express";

const COOKIE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    // Prod is multi-origin (app on Vercel, API on Render) so the session
    // cookie must travel cross-site. "none" requires secure:true, which is
    // always on in prod. Dev proxies /api same-origin, so the cookie still
    // works there too.
    sameSite: "none",
    maxAge: COOKIE_AGE,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};
