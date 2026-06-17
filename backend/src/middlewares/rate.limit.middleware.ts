import rateLimit from "express-rate-limit";

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes tracking
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error:
      "Too many message from this IP address, please try again in 15 minutes",
  },
});

export const authLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hr tracking
  limit: 5,
  message: {
    error:
      "Too many login attempts. Account protection triggered. Try again in an hour.",
  },
});
