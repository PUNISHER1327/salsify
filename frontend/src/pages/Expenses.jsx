import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import Card from '../components/Card';
import { FaPlus, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Expenses = () => {
    const { currencySymbol } = useSettings();
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ description: '', amount: '', category: 'Office', date: '', isRecurring: false, frequency: 'monthly' });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const { data } = await api.get('/expenses');
            setExpenses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                setExpenses(expenses.filter(e => e._id !== id));
                toast.success('Expense deleted');
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete expense');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/expenses', formData);
            setExpenses([data, ...expenses]);
            setShowModal(false);
            setFormData({ description: '', amount: '', category: 'Office', date: '', isRecurring: false, frequency: 'monthly' });
            toast.success('Expense added successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add expense');
        }
    };

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Expenses</h1>
                    <p className="text-textMuted">Track your business spending</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FaPlus /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/80 font-medium">Total Expenses</p>
                            <h3 className="text-3xl font-bold mt-1">{currencySymbol}{totalExpenses.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaMoneyBillWave className="text-2xl" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="text-left text-textMuted text-sm font-semibold">
                            <th className="p-4">Description</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map((expense) => (
                            <tr key={expense._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-medium text-textPrimary">{expense.description}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                                        {expense.category}
                                    </span>
                                    {expense.isRecurring && (
                                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                                            Recurring
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-textMuted">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-red-500">-{currencySymbol}{expense.amount}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(expense._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-textMuted">
                                    No expenses recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-white">
                        <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Description"
                                className="input-field"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className="input-field"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                                <select
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Office</option>
                                    <option>Software</option>
                                    <option>Marketing</option>
                                    <option>Personnel</option>
                                    <option>Utilities</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">Recurring Expense?</label>
                            </div>

                            {formData.isRecurring && (
                                <select
                                    className="input-field"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            )}
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-1/2 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="w-1/2 btn-primary">
                                    Add Expense
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Expenses;
