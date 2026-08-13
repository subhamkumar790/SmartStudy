import express from "express";
import { protect } from "../middleware/auth.js";
import StudySession from "../models/StudySession.js";

const router = express.Router();

// Start a new study session
router.post("/start", protect, async (req: any, res) => {
  try {
    const { subject, topic, taskId } = req.body;

    // Check if there's already an active or paused session
    const existingSession = await StudySession.findOne({
      userId: req.user._id,
      status: { $in: ["Active", "Paused"] }
    });

    if (existingSession) {
      return res.status(400).json({ message: "You already have an active study session.", session: existingSession });
    }

    const now = new Date();
    const session = await StudySession.create({
      userId: req.user._id,
      subject,
      topic,
      taskId,
      status: "Active",
      startTime: now,
      lastResumedAt: now,
      duration: 0
    });

    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get current active session
router.get("/active", protect, async (req: any, res) => {
  try {
    const session = await StudySession.findOne({
      userId: req.user._id,
      status: { $in: ["Active", "Paused"] }
    });
    res.json(session || null);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Pause session
router.put("/:id/pause", protect, async (req: any, res) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "Active") return res.status(400).json({ message: "Session is not active" });

    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - new Date(session.lastResumedAt).getTime()) / 1000);
    
    session.duration += elapsedSeconds;
    session.status = "Paused";
    session.lastResumedAt = null;

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Resume session
router.put("/:id/resume", protect, async (req: any, res) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "Paused") return res.status(400).json({ message: "Session is not paused" });

    session.status = "Active";
    session.lastResumedAt = new Date();

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Finish session
router.put("/:id/finish", protect, async (req: any, res) => {
  try {
    const session = await StudySession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status === "Finished") return res.status(400).json({ message: "Session already finished" });

    const now = new Date();
    if (session.status === "Active") {
      const elapsedSeconds = Math.floor((now.getTime() - new Date(session.lastResumedAt).getTime()) / 1000);
      session.duration += elapsedSeconds;
    }

    session.status = "Finished";
    session.endTime = now;

    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get history
router.get("/history", protect, async (req: any, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id, status: "Finished" }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
