import express from "express";
import Exam from "../models/Exam.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(protect, async (req: any, res) => {
    try {
      const exams = await Exam.find({ userId: req.user._id }).sort({ examDate: 1 });
      res.json(exams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req: any, res) => {
    try {
      const exam = new Exam({ ...req.body, userId: req.user._id });
      const createdExam = await exam.save();
      res.status(201).json(createdExam);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

router.route("/:id")
  .put(protect, async (req: any, res) => {
    try {
      const exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
      if (exam) {
        Object.assign(exam, req.body);
        const updatedExam = await exam.save();
        res.json(updatedExam);
      } else {
        res.status(404).json({ message: "Exam not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete(protect, async (req: any, res) => {
    try {
      const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (exam) {
        res.json({ message: "Exam removed" });
      } else {
        res.status(404).json({ message: "Exam not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
