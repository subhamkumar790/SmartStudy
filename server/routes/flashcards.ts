import express from "express";
import Flashcard from "../models/Flashcard.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(protect, async (req: any, res) => {
    try {
      const flashcards = await Flashcard.find({ userId: req.user._id });
      res.json(flashcards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req: any, res) => {
    try {
      const flashcard = new Flashcard({ ...req.body, userId: req.user._id });
      const createdFlashcard = await flashcard.save();
      res.status(201).json(createdFlashcard);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

router.route("/:id")
  .put(protect, async (req: any, res) => {
    try {
      const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
      if (flashcard) {
        Object.assign(flashcard, req.body);
        const updatedFlashcard = await flashcard.save();
        res.json(updatedFlashcard);
      } else {
        res.status(404).json({ message: "Flashcard not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete(protect, async (req: any, res) => {
    try {
      const flashcard = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (flashcard) {
        res.json({ message: "Flashcard removed" });
      } else {
        res.status(404).json({ message: "Flashcard not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
