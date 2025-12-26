const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addComment
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/comments').post(protect, addComment);

module.exports = router;
