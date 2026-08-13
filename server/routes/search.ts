import express from "express";
import { protect } from "../middleware/auth.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Exam from "../models/Exam.js";

const router = express.Router();

router.get("/", protect, async (req: any, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.json({ tasks: [], notes: [], exams: [] });
    }

    const regex = new RegExp(query, "i");

    const [tasks, notes, exams] = await Promise.all([
      Task.find({ userId: req.user._id, $or: [{ title: regex }, { subject: regex }] }).limit(3),
      Note.find({ userId: req.user._id, $or: [{ title: regex }, { content: regex }] }).limit(3),
      Exam.find({ userId: req.user._id, $or: [{ examName: regex }, { subject: regex }, { syllabus: regex }] }).limit(3)
    ]);

    res.json({ tasks, notes, exams });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
