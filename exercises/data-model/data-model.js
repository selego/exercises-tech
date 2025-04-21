const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'Due date must be in the future'
    }
  },
  comments: [commentSchema]
}, { timestamps: true });

// Add indexes for better query performance
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

// middleware/validators.js
const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      data: null,
      error: 'Invalid ID format'
    });
  }
  next();
};

const validateUser = async (req, res, next) => {
  const { userId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      data: null,
      error: 'Invalid user ID format'
    });
  }
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      data: null,
      error: 'User not found'
    });
  }
  
  req.user = user;
  next();
};

// middleware/responseHandler.js
const handleResponse = (res, data, status = 200) => {
  res.status(status).json({
    data,
    error: null
  });
};

const handleError = (res, error, status = 500) => {
  res.status(status).json({
    data: null,
    error: error.message || 'An unexpected error occurred'
  });
};

// controllers/taskController.js
const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { validateObjectId, validateUser } = require('../middleware/validators');
const { handleResponse, handleError } = require('../middleware/responseHandler');

// Create a new task
router.post('/', validateUser, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: req.user._id
    });
    
    await task.save();
    handleResponse(res, task, 201);
  } catch (error) {
    handleError(res, error);
  }
});

// Get tasks with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;

    const tasks = await Task.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('createdBy assignedTo')
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(filter);

    handleResponse(res, {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Get a single task
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy assignedTo');
    
    if (!task) {
      return handleError(res, new Error('Task not found'), 404);
    }
    
    handleResponse(res, task);
  } catch (error) {
    handleError(res, error);
  }
});

// Update a task
router.patch('/:id', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return handleError(res, new Error('Task not found'), 404);
    }
    
    const updates = Object.keys(req.body);
    updates.forEach(update => task[update] = req.body[update]);
    
    await task.save();
    handleResponse(res, task);
  } catch (error) {
    handleError(res, error);
  }
});

// Assign task to user
router.post('/:id/assign', validateObjectId, validateUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return handleError(res, new Error('Task not found'), 404);
    }
    
    task.assignedTo = req.user._id;
    await task.save();
    
    handleResponse(res, task);
  } catch (error) {
    handleError(res, error);
  }
});

// Add a comment to a task
router.post('/:id/comments', validateObjectId, validateUser, async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return handleError(res, new Error('Task not found'), 404);
    }
    
    task.comments.push({
      text,
      user: req.user._id
    });
    
    await task.save();
    handleResponse(res, task, 201);
  } catch (error) {
    handleError(res, error);
  }
});

// Get task comments with pagination
router.get('/:id/comments', validateObjectId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('comments.user');
    
    if (!task) {
      return handleError(res, new Error('Task not found'), 404);
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const comments = task.comments
      .slice(skip, skip + limit)
      .sort((a, b) => b.createdAt - a.createdAt);
    
    handleResponse(res, {
      comments,
      pagination: {
        page,
        limit,
        total: task.comments.length,
        pages: Math.ceil(task.comments.length / limit)
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;