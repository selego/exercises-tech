// Backend Data Modeling Exercise
//
// This code contains several data modeling issues to address.
// Look for problems related to:
// - Nested vs. flat data structures
// - Route organization
// - Data duplication
// - API consistency
//
// Your task is to refactor this code following proper data modeling principles
// from the Selego Style Guide. Consider the tradeoffs between different approaches.

// models/task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Core task data
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: Date,

  // User references with essential data
  createdBy: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    avatar: String
  },
  assignedTo: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    avatar: String
  },

  // Comments with user references
  comments: [{
    text: String,
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: String,
      avatar: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Basic metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;

// controllers/taskController.js
const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const User = require('../models/user');

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, user_id, priority, dueDate } = req.body;
    
    if (!title || !user_id) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Title and user_id are required' 
      });
    }
    
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ 
        ok: false, 
        error: 'User not found' 
      });
    }
    
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      }
    });
    
    await task.save();
    res.status(201).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Assign task to user
router.post('/:id/assign', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ 
        ok: false, 
        error: 'user_id is required' 
      });
    }
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Task not found' 
      });
    }
    
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ 
        ok: false, 
        error: 'User not found' 
      });
    }
    
    task.assignedTo = {
      _id: user._id,
      name: user.name,
      avatar: user.avatar
    };
    task.updatedAt = new Date();
    
    await task.save();
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Add a comment to a task
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, user_id } = req.body;
    
    if (!text || !user_id) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Text and user_id are required' 
      });
    }
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Task not found' 
      });
    }
    
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ 
        ok: false, 
        error: 'User not found' 
      });
    }
    
    const comment = {
      text,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      createdAt: new Date()
    };
    
    task.comments.push(comment);
    task.updatedAt = new Date();
    
    await task.save();
    res.status(201).json({ ok: true, data: comment });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;