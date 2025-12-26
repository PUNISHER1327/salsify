import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import ExportButton from '../components/ExportButton';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen } from 'react-icons/fa';

const Products = () => {
    const { currencySymbol } = useSettings();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        sku: '',
        category: 'General',
        stockQuantity: 0,
        lowStockThreshold: 5
    });
    const [searchTerm, setSearchTerm] = useState('');

    const exportColumns = [
        { header: 'Name', key: 'name' },
        { header: 'SKU', key: 'sku' },
        { header: 'Category', key: 'category' },
        { header: 'Price', key: 'price' },
        { header: 'Status', key: 'isActive' }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', formData);
            setShowModal(false);
            setFormData({ name: '', description: '', price: '', sku: '', category: 'General', stockQuantity: 0, lowStockThreshold: 5 });
            toast.success('Product created successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Products</h1>
                    <p className="text-textMuted">Manage your inventory and services</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            <div className="glass-card p-6">
                <div className="flex gap-4 mb-6">
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search products..." />
                    <ExportButton data={products} filename="products_export" columns={exportColumns} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-100">
                            <tr>
                                <th className="table-header">Product Name</th>
                                <th className="table-header">SKU</th>
                                <th className="table-header">Category</th>
                                <th className="table-header">Price</th>
                                <th className="table-header">Stock</th>
                                <th className="table-header">Status</th>
                                <th className="table-header text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="table-row group">
                                        <td className="table-cell font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <FaBoxOpen />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-textPrimary">{product.name}</div>
                                                    <div className="text-xs text-textMuted truncate max-w-[200px]">{product.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell text-textMuted">{product.sku || '-'}</td>
                                        <td className="table-cell">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="table-cell font-semibold text-textPrimary">{currencySymbol}{product.price}</td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.stockQuantity <= product.lowStockThreshold ? 'bg-red-100 text-red-600 font-bold' : 'bg-green-100 text-green-600'
                                                }`}>
                                                {product.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-textMuted">
                                        No products found. Add your first product!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card w-full max-w-md p-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-textPrimary">Add Product</h2>
                            <button onClick={() => setShowModal(false)} className="text-textMuted hover:text-textPrimary">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1">Product Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-textMuted mb-1">Price ({currencySymbol})</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textMuted mb-1">SKU</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1">Category</label>
                                <select
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Service">Service</option>
                                    <option value="Physical">Physical Good</option>
                                    <option value="Digital">Digital Product</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                                <textarea
                                    className="input-field min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
