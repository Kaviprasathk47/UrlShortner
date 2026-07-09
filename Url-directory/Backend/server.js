import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import apiRoute from "./routes/apiRoute.js";
import route from "./routes/route.js";
import { getBaseUrl } from "./utils/config.js";
import "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// JSON lookup must be registered before the catch-all /:alias redirect route.
app.use("/api", apiRoute);
app.use("/", route);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ output: "Failed", message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`PORT CONNECTED AT ${PORT}`);
  console.log(`BASE_URL configured as ${getBaseUrl()}`);
});
