import express from "express";
import linkRoutes from "./routes/link.routes.js";
import cookieParser from "cookie-parser";
import {
  authLimit,
  globalRateLimit,
} from "./middlewares/rate.limit.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { redirectToOriginalUrlController } from "./controllers/link.controller";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authLimit, authRoutes);
app.use("/api/links", globalRateLimit, linkRoutes);

app.get("/:code", redirectToOriginalUrlController);

app.all("*path", (req, res) => {
  if (req.accepts("json") || req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }

  return res.status(404).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>404 - Link Not Found</h1>
      <p>The short link you are looking for doesn't exist.</p>
    </div>
  `);
});

export default app;
