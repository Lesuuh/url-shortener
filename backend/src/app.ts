import express from "express";
import linkRoutes from "./routes/link.routes.js";

const app = express();

app.use(express.json());

app.use("/api/links", linkRoutes);

export default app;
