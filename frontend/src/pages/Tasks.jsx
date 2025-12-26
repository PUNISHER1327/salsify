import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import { FaPlus, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-hot-toast';

const TaskItem = ({ task, handleDelete, handleTaskClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
            <Card
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative group bg-white"
                onClick={() => handleTaskClick(task)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-textPrimary">{task.title}</h4>
                        <p className="text-xs text-textMuted mt-1">{task.client?.name}</p>
                    </div>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task._id);
                        }}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <FaTrash size={12} />
                    </button>
                </div>
                {task.dueDate && (
                    <div className="mt-2 text-xs text-textMuted">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                )}
                {task.comments?.length > 0 && (
                    <div className="mt-2 text-xs text-primary font-medium">
                        {task.comments.length} comments
                    </div>
                )}
            </Card>
        </div>
    );
};

const TaskColumn = ({ id, title, tasks, handleDelete, handleTaskClick }) => {
    const { setNodeRef } = useSortable({ id });

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[300px] bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <h3 className="font-bold text-lg text-textPrimary mb-4 flex items-center justify-between">
                {title}
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{tasks.length}</span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
                <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskItem key={task._id} task={task} handleDelete={handleDelete} handleTaskClick={handleTaskClick} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
};

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', client: '' });
    const [commentText, setCommentText] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchTasks();
        fetchClients();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(tasks.filter(t => t._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(activeId);

        if (!overContainer || !activeContainer) return;

        if (activeContainer !== overContainer) {
            const newStatus = overContainer;

            setTasks((prev) => {
                return prev.map(t => {
                    if (t._id === activeId) return { ...t, status: overContainer };
                    return t;
                });
            });

            try {
                await api.put(`/tasks/${activeId}`, { status: newStatus });
            } catch (error) {
                console.error("Failed to update status", error);
                fetchTasks(); // Revert on error
            }
        }
    };

    const findContainer = (id) => {
        if (['pending', 'in-progress', 'completed'].includes(id)) return id;
        const task = tasks.find(t => t._id === id);
        return task ? task.status : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/tasks', formData);
            setTasks([...tasks, data]);
            setShowModal(false);
            setFormData({ title: '', description: '', dueDate: '', client: '' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const { data } = await api.post(`/tasks/${selectedTask._id}/comments`, { text: commentText });
            // Update selected task and tasks list
            setSelectedTask(data);
            setTasks(tasks.map(t => t._id === data._id ? data : t));
            setCommentText('');
            toast.success('Comment added');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add comment');
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Task Board</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FaPlus /> New Task
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                    <TaskColumn
                        id="pending"
                        title="To Do"
                        tasks={tasks.filter(t => t.status === 'pending')}
                        handleDelete={handleDelete}
                        handleTaskClick={setSelectedTask}
                    />
                    <TaskColumn
                        id="in-progress"
                        title="In Progress"
                        tasks={tasks.filter(t => t.status === 'in-progress')}
                        handleDelete={handleDelete}
                        handleTaskClick={setSelectedTask}
                    />
                    <TaskColumn
                        id="completed"
                        title="Done"
                        tasks={tasks.filter(t => t.status === 'completed')}
                        handleDelete={handleDelete}
                        handleTaskClick={setSelectedTask}
                    />
                </div>
            </DndContext>

            {/* Create Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-white">
                        <h2 className="text-2xl font-bold mb-4">New Task</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Task Title"
                                className="input-field"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="input-field h-24 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <select
                                className="input-field"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            >
                                <option value="">Select Client</option>
                                <option value="">No Client (Personal)</option>
                                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-1/2 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="w-1/2 btn-primary">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-textPrimary">{selectedTask.title}</h2>
                                <p className="text-sm text-textMuted mt-1">In {selectedTask.status}</p>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-textMuted uppercase mb-2">Description</h3>
                                <div className="p-4 bg-gray-50 rounded-xl text-textPrimary text-sm whitespace-pre-wrap">
                                    {selectedTask.description || 'No description provided.'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-textMuted uppercase mb-2">Client</h3>
                                    <p className="font-medium">{selectedTask.client?.name || 'Personal Task'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-textMuted uppercase mb-2">Due Date</h3>
                                    <p className="font-medium">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-textPrimary mb-4">Comments</h3>

                                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedTask.comments?.map((comment, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {comment.userName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{comment.userName || 'User'}</span>
                                                    <span className="text-xs text-textMuted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-textPrimary mt-1 bg-gray-50 p-2 rounded-lg rounded-tl-none inline-block">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                                        <p className="text-textMuted text-sm italic">No comments yet.</p>
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="flex-1 input-field"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    <button type="submit" className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
                                        <FaPaperPlane />
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="px-6 py-2 rounded-xl bg-gray-100 text-textPrimary hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Tasks;
