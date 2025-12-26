import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import ExportButton from '../components/ExportButton';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportColumns = [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Address', key: 'address' }
    ];

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this client?')) {
            try {
                await api.delete(`/clients/${id}`);
                toast.success('Client deleted successfully');
                fetchClients();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete client');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/clients', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', phone: '', address: '' });
            toast.success('Client added successfully');
            fetchClients();
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to add client';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Clients</h1>
                    <p className="text-textMuted">Manage your client base</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FaPlus /> Add Client
                </button>
            </div>

            <div className="flex gap-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search clients..." />
                <ExportButton data={clients} filename="clients_export" columns={exportColumns} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <Card key={client._id} className="hover:-translate-y-1 transition-transform cursor-default">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                                {client.name.charAt(0)}
                            </div>
                            <button
                                onClick={() => handleDelete(client._id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FaTrash />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-textPrimary mb-2">{client.name}</h3>
                        <div className="space-y-2 text-sm text-textMuted">
                            <p>📧 {client.email}</p>
                            <p>📞 {client.phone}</p>
                            <p>📍 {client.address}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-white">
                        <h2 className="text-2xl font-bold mb-4">Add New Client</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Name"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Email"
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                placeholder="Phone"
                                className="input-field"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <input
                                placeholder="Address"
                                className="input-field"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                                    Save
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Clients;
