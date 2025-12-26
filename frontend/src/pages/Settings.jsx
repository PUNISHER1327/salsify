import { useState } from 'react';
import { FaGlobe, FaBell, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
    const { settings, updateSettings } = useSettings();

    const handleChange = (key, value) => {
        updateSettings(key, value);
    };

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Settings</h1>
            <p className="text-textMuted mb-8">Customize your application preferences</p>

            <div className="space-y-6">
                {/* Localization Section */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
                        <FaGlobe className="text-primary" /> Localization
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="input-field"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Language</label>
                            <select
                                value={settings.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="input-field"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
                        <FaBell className="text-primary" /> Notifications
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Email Digest</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="emailDigest"
                                        value="daily"
                                        checked={settings.emailDigest === 'daily'}
                                        onChange={(e) => handleChange('emailDigest', e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    Daily
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="emailDigest"
                                        value="weekly"
                                        checked={settings.emailDigest === 'weekly'}
                                        onChange={(e) => handleChange('emailDigest', e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    Weekly
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="emailDigest"
                                        value="off"
                                        checked={settings.emailDigest === 'off'}
                                        onChange={(e) => handleChange('emailDigest', e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    Off
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-textMuted">Push Notifications</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.pushNotifications}
                                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <FaSave /> Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
