import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(protect, async (req: any, res) => {
    try {
      const tasks = await Task.find({ userId: req.user._id }).sort({ dueDate: 1 });
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req: any, res) => {
    try {
      const task = new Task({ ...req.body, userId: req.user._id });
      const createdTask = await task.save();
      res.status(201).json(createdTask);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

router.route("/:id")
  .put(protect, async (req: any, res) => {
    try {
      const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
      if (task) {
        Object.assign(task, req.body);
        const updatedTask = await task.save();
        res.json(updatedTask);
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete(protect, async (req: any, res) => {
    try {
      const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (task) {
        res.json({ message: "Task removed" });
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
