import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaTasks, FaFileInvoice, FaSignOutAlt, FaCog, FaMoneyBillWave, FaCalendarAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
        { name: 'Clients', path: '/clients', icon: <FaUsers /> },
        { name: 'Products', path: '/products', icon: <FaTasks /> },
        { name: 'Tasks', path: '/tasks', icon: <FaTasks /> },
        { name: 'Calendar', path: '/calendar', icon: <FaCalendarAlt /> },
        { name: 'Invoices', path: '/invoices', icon: <FaFileInvoice /> },
        { name: 'Estimates', path: '/quotes', icon: <FaFileInvoiceDollar /> },
        { name: 'Expenses', path: '/expenses', icon: <FaMoneyBillWave /> }, // Using Money icon
        { name: 'Settings', path: '/settings', icon: <FaCog /> },
    ];

    return (
        <div className="h-screen w-64 bg-white/50 backdrop-blur-md border-r border-gray-200 flex flex-col p-6 fixed left-0 top-0 transition-all duration-300 z-10">
            <div className="mb-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                    S
                </div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">SaaSify</h1>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-textMuted hover:bg-white hover:text-primary hover:shadow-sm'
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-textMuted hover:bg-red-50 hover:text-red-500 transition-all mt-auto"
            >
                <FaSignOutAlt />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
