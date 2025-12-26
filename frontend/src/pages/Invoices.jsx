import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import ExportButton from '../components/ExportButton';
import { toast } from 'react-hot-toast';
import { FaPlus, FaMoneyBillWave, FaBell, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Invoices = () => {
    const { currencySymbol } = useSettings();
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ client: '', product: '', amount: '', description: '', dueDate: '', isRecurring: false, frequency: 'monthly' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = invoices.filter(invoice =>
        invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportColumns = [
        { header: 'Client', key: 'client.name' },
        { header: 'Amount', key: 'amount' },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Status', key: 'status' }
    ];

    useEffect(() => {
        fetchInvoices();
        fetchClients();
        fetchProducts();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data } = await api.get('/invoices');
            setInvoices(data);
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

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(Array.isArray(data) ? data.filter(p => p.isActive) : []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p._id === productId);
        if (product) {
            setFormData(prev => ({
                ...prev,
                product: productId,
                amount: product.price,
                description: product.name
            }));
        } else {
            setFormData(prev => ({ ...prev, product: '', amount: '', description: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/invoices', {
                client: formData.client,
                amount: formData.amount,
                dueDate: formData.dueDate,
                isRecurring: formData.isRecurring,
                frequency: formData.frequency,
                items: [{
                    description: formData.description || 'Service',
                    price: Number(formData.amount),
                    product: formData.product || null
                }]
            });
            setShowModal(false);
            setFormData({ client: '', product: '', amount: '', description: '', dueDate: '', isRecurring: false, frequency: 'monthly' });
            toast.success('Invoice created successfully');
            fetchInvoices();
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to create invoice';
            toast.error(message);
        }
    };

    const markPaid = async (id) => {
        try {
            await api.put(`/invoices/${id}`, { status: 'paid' });
            toast.success('Invoice marked as paid');
            fetchInvoices();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update invoice');
        }
    };

    const sendReminders = async () => {
        if (!confirm('Send email reminders to all clients with unpaid invoices?')) return;

        const toastId = toast.loading('Sending reminders...');
        try {
            const { data } = await api.post('/reminders/invoices');
            toast.success(data.message, { id: toastId });
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to send reminders';
            toast.error(message, { id: toastId });
        }
    };

    const generatePDF = (invoice) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('INVOICE', 14, 22);

        doc.setFontSize(10);
        doc.text(`Invoice #: ${invoice._id.slice(-6).toUpperCase()}`, 14, 30);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 35);
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, 40);

        // Client Details
        doc.text('Bill To:', 14, 50);
        doc.setFontSize(12);
        doc.text(invoice.client?.name || 'Client Name', 14, 55);
        doc.setFontSize(10);
        doc.text(invoice.client?.email || '', 14, 60);
        doc.text(invoice.client?.address || '', 14, 65);

        // Items Table
        const tableColumn = ["Description", "Product", "Price"];
        const tableRows = [];

        invoice.items.forEach(item => {
            const ticketData = [
                item.description,
                item.product?.name || 'N/A',
                `${currencySymbol}${item.price}`,
            ];
            tableRows.push(ticketData);
        });

        autoTable(doc, {
            startY: 75,
            head: [tableColumn],
            body: tableRows,
        });

        // Total
        const finalY = doc.lastAutoTable.finalY || 75;
        doc.text(`Total Amount: ${currencySymbol}${invoice.amount}`, 14, finalY + 10);

        // Footer
        doc.text('Thank you for your business!', 14, finalY + 20);

        doc.save(`invoice_${invoice._id.slice(-6)}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Invoices</h1>
                    <p className="text-textMuted">Manage and track your invoices</p>
                </div>
                <button
                    onClick={sendReminders}
                    className="btn-secondary flex items-center gap-2 mr-2"
                >
                    <FaBell /> Send Reminders
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <FaPlus /> Create Invoice
                </button>
            </div>

            <div className="flex gap-4">
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search invoices..." />
                <ExportButton data={invoices} filename="invoices_export" columns={exportColumns} />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-textMuted border-b border-gray-200">
                            <th className="pb-4 pl-4">Client</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Due Date</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 pl-4 font-medium text-textPrimary">{invoice.client?.name}</td>
                                <td className="py-4 font-bold text-textPrimary">{currencySymbol}{invoice.amount}</td>
                                <td className="py-4 text-textMuted">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                                        }`}>
                                        {invoice.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="py-4">
                                    {invoice.status === 'unpaid' && (
                                        <button
                                            onClick={() => markPaid(invoice._id)}
                                            className="text-primary hover:text-teal-700 text-sm font-medium mr-3"
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                    <button
                                        onClick={() => generatePDF(invoice)}
                                        className="text-gray-500 hover:text-gray-700"
                                        title="Download PDF"
                                    >
                                        <FaDownload />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.length === 0 && (
                    <div className="text-center py-10 text-textMuted">No invoices found.</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-white">
                        <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
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

                            <select
                                className="input-field"
                                value={formData.product}
                                onChange={handleProductChange}
                            >
                                <option value="">Select Product (Optional)</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name} - {currencySymbol}{p.price}</option>)}
                            </select>

                            <input
                                type="text"
                                placeholder="Description"
                                className="input-field"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />

                            <input
                                type="number"
                                placeholder={`Amount (${currencySymbol})`}
                                className="input-field"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                className="input-field"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">Recurring Invoice?</label>
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
                                    Create
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Invoices;
