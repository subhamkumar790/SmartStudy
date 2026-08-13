import express from "express";
import Quiz from "../models/Quiz.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(protect, async (req: any, res) => {
    try {
      const quizzes = await Quiz.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(quizzes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req: any, res) => {
    try {
      const quiz = new Quiz({ ...req.body, userId: req.user._id });
      const createdQuiz = await quiz.save();
      res.status(201).json(createdQuiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

router.route("/:id")
  .get(protect, async (req: any, res) => {
    try {
      const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
      if (quiz) res.json(quiz);
      else res.status(404).json({ message: "Quiz not found" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
