import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Calendar from './pages/Calendar';
import Quotes from './pages/Quotes';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/clients" element={<Clients />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/expenses" element={<Expenses />} />
                            <Route path="/quotes" element={<Quotes />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                    <Toaster position="top-right" toastOptions={{
                        style: {
                            background: '#333',
                            color: '#fff',
                            fontFamily: 'Inter, sans-serif'
                        },
                        success: {
                            style: {
                                background: '#F0FDF4',
                                color: '#166534',
                                border: '1px solid #BBF7D0'
                            },
                            iconTheme: {
                                primary: '#166534',
                                secondary: '#F0FDF4'
                            }
                        },
                        error: {
                            style: {
                                background: '#FEF2F2',
                                color: '#991B1B',
                                border: '1px solid #FECACA'
                            },
                            iconTheme: {
                                primary: '#991B1B',
                                secondary: '#FEF2F2'
                            }
                        }
                    }} />
                </Router>
            </SettingsProvider>
        </AuthProvider>

    );
}

export default App;
