import { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        currency: 'USD',
        language: 'en',
        emailDigest: 'daily',
        pushNotifications: true
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const updateSettings = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('appSettings', JSON.stringify(newSettings));
    };

    const currencySymbol = (() => {
        switch (settings.currency) {
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'INR': return '₹';
            default: return '$';
        }
    })();

    const value = {
        settings,
        updateSettings,
        currencySymbol
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
