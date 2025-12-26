import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import Card from '../components/Card';
import { toast } from 'react-hot-toast';
import { FaPlus, FaCheck, FaFileInvoiceDollar, FaTrash } from 'react-icons/fa';

const Quotes = () => {
    const { currencySymbol } = useSettings();
    const [quotes, setQuotes] = useState([]);
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        client: '',
        amount: '',
        validUntil: '',
        items: [{ description: '', price: 0 }]
    });

    useEffect(() => {
        fetchQuotes();
        fetchClients();
    }, []);

    const fetchQuotes = async () => {
        try {
            const { data } = await api.get('/quotes');
            setQuotes(data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/quotes', formData);
            setShowModal(false);
            setFormData({ client: '', amount: '', validUntil: '', items: [{ description: '', price: 0 }] });
            toast.success('Quote created successfully');
            fetchQuotes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create quote');
        }
    };

    const handleConvert = async (id) => {
        try {
            await api.post(`/quotes/${id}/convert`);
            toast.success('Quote converted to Invoice!');
            fetchQuotes();
        } catch (error) {
            toast.error('Failed to convert quote');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this quote?')) {
            try {
                await api.delete(`/quotes/${id}`);
                toast.success('Quote deleted');
                fetchQuotes();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Quotations</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <FaPlus /> New Quote
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quotes.map((quote) => (
                    <Card key={quote._id} className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{quote.client?.name || 'Unknown Client'}</h3>
                                <p className="text-sm text-textMuted">Valid until: {new Date(quote.validUntil).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {quote.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-4">{currencySymbol}{quote.amount}</p>

                        <div className="flex gap-2 mt-4">
                            {quote.status === 'pending' && (
                                <button
                                    onClick={() => handleConvert(quote._id)}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <FaCheck /> Convert to Invoice
                                </button>
                            )}
                            <button onClick={() => handleDelete(quote._id)} className="p-2 text-gray-400 hover:text-red-500">
                                <FaTrash />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg bg-white">
                        <h2 className="text-2xl font-bold mb-4">Create Quote</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <select
                                className="input-field"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                required
                            >
                                <option value="">Select Client</option>
                                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                            <input
                                type="number"
                                placeholder="Amount"
                                className="input-field"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                className="input-field"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                required
                            />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 btn-secondary">Cancel</button>
                                <button type="submit" className="w-1/2 btn-primary">Create</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Quotes;
