import express from "express";
import healthRoute from "./routes/health.js";

const app = express();

app.use(express.json());

app.use("/health", healthRoute);

export default app;
