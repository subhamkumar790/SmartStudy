import express from "express";
import Note from "../models/Note.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(protect, async (req: any, res) => {
    try {
      const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 });
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req: any, res) => {
    try {
      const note = new Note({ ...req.body, userId: req.user._id });
      const createdNote = await note.save();
      res.status(201).json(createdNote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

router.route("/:id")
  .get(protect, async (req: any, res) => {
    try {
      const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
      if (note) res.json(note);
      else res.status(404).json({ message: "Note not found" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(protect, async (req: any, res) => {
    try {
      const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
      if (note) {
        Object.assign(note, req.body);
        const updatedNote = await note.save();
        res.json(updatedNote);
      } else {
        res.status(404).json({ message: "Note not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete(protect, async (req: any, res) => {
    try {
      const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (note) {
        res.json({ message: "Note removed" });
      } else {
        res.status(404).json({ message: "Note not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
