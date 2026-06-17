import express from "express";
import linkRoutes from "./routes/link.routes.js";
import cookieParser from "cookie-parser";
import {
  authLimit,
  globalRateLimit,
} from "./middlewares/rate.limit.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authLimit, authRoutes);
app.use("/api/links", globalRateLimit, linkRoutes);

export default app;
