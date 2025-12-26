import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaBell, FaSearch, FaUser, FaCog, FaSignOutAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const searchRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                try {
                    const { data } = await api.get(`/search?query=${searchTerm}`);
                    setSearchResults(data);
                    setShowSearch(true);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults([]);
                setShowSearch(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearchResultClick = (result) => {
        setShowSearch(false);
        setSearchTerm('');
        if (result.type === 'client') navigate('/clients');
        if (result.type === 'task') navigate('/tasks');
        if (result.type === 'product') navigate('/products');
    };

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return 'Dashboard';
            case '/clients': return 'Clients';
            case '/tasks': return 'Tasks';
            case '/invoices': return 'Invoices';
            case '/products': return 'Products';
            case '/expenses': return 'Expenses';
            case '/calendar': return 'Calendar';
            case '/profile': return 'My Profile';
            case '/settings': return 'Settings';
            default: return 'Overview';
        }
    };

    // Mock Notifications
    const notifications = [
        { id: 1, text: 'New task assigned: "Website Redesign"', time: '2 mins ago', type: 'info' },
        { id: 2, text: 'Invoice #1023 was paid', time: '1 hour ago', type: 'success' },
        { id: 3, text: 'Server usage high (85%)', time: '3 hours ago', type: 'warning' },
    ];

    return (
        <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm px-8 py-4 sticky top-0 z-20 border-b border-gray-100/50 transition-colors duration-300">
            <div>
                <h2 className="text-2xl font-bold text-textPrimary transition-colors">{getPageTitle()}</h2>
                <p className="text-sm text-textMuted">Data overview</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block" ref={searchRef}>
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.length > 1 && setShowSearch(true)}
                        className="pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-64 transition-all text-textPrimary placeholder-gray-400"
                    />

                    {/* Search Results Dropdown */}
                    {showSearch && searchResults.length > 0 && (
                        <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden z-30">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSearchResultClick(result)}
                                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer"
                                >
                                    <p className="text-sm font-semibold text-textPrimary">{result.title}</p>
                                    <p className="text-xs text-textMuted capitalize">{result.type} • {result.subtitle}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {showSearch && searchResults.length === 0 && searchTerm.length > 1 && (
                        <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-4 text-center text-textMuted text-sm animate-fade-in-up z-30">
                            No results found.
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <div
                        className="relative cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <FaBell className="text-xl text-textMuted hover:text-primary transition-colors" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </div>

                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in-up">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-textPrimary">Notifications</h3>
                                <span className="text-xs text-primary font-medium cursor-pointer">Mark all read</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer flex gap-3">
                                        <div className="mt-1">
                                            {notif.type === 'success' ? <FaCheckCircle className="text-green-500" /> :
                                                notif.type === 'warning' ? <FaExclamationCircle className="text-orange-500" /> :
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>}
                                        </div>
                                        <div>
                                            <p className="text-sm text-textPrimary line-clamp-2">{notif.text}</p>
                                            <p className="text-xs text-textMuted mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-gray-100 text-center">
                                <Link to="/notifications" className="text-xs font-medium text-primary hover:underline">View all</Link>
                            </div>
                        </div>
                    )}
                </div>



                {/* Profile */}
                <div className="relative pl-6 border-l border-gray-200" ref={profileRef}>
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-textPrimary group-hover:text-primary transition-colors">{user?.name}</p>
                            <p className="text-xs text-textMuted">{user?.email}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-primary/30 transition-all">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                <p className="text-sm font-semibold text-textPrimary">{user?.name}</p>
                                <p className="text-xs text-textMuted truncate">{user?.email}</p>
                            </div>

                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-textPrimary hover:bg-gray-50 transition-colors"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <FaUser className="text-textMuted" /> My Profile
                            </Link>
                            <Link
                                to="/settings"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-textPrimary hover:bg-gray-50 transition-colors"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <FaCog className="text-textMuted" /> Settings
                            </Link>

                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
