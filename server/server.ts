import "dotenv/config";

import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer as createViteServer } from "vite";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import noteRoutes from "./routes/notes.js";
import aiRoutes from "./routes/ai.js";
import flashcardRoutes from "./routes/flashcards.js";
import examRoutes from "./routes/exams.js";
import quizRoutes from "./routes/quizzes.js";
import searchRoutes from "./routes/search.js";
import studySessionRoutes from "./routes/studySessions.js";

const app = express();
const PORT = 3000;

// Check environment variables
console.log("MONGODB_URI loaded:", !!process.env.MONGODB_URI);
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Database connection
let dbConnected = false;

const connectDB = async () => {
  if (dbConnected) return;

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error(
        "❌ WARNING: MONGODB_URI is not set. Database operations will fail."
      );
      mongoose.set("bufferCommands", false);
      return;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/study-sessions", studySessionRoutes);

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server Error:", err.stack);

    res.status(500).json({
      message: err.message || "Internal Server Error",
    });
  }
);

// Vite Middleware
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});