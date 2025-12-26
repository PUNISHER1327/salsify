import { FaDownload } from 'react-icons/fa';

const ExportButton = ({ data, filename = 'export', columns }) => {
    const handleExport = () => {
        if (!data || !data.length) return;

        const csvContent = [
            columns.map(col => col.header).join(','),
            ...data.map(row => columns.map(col => {
                // Handle nested properties (e.g., 'client.name')
                const value = col.key.split('.').reduce((obj, key) => obj?.[key], row);
                // Handle null/undefined and escape quotes
                const safeValue = value === null || value === undefined ? '' : String(value);
                return `"${safeValue.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={!data || !data.length}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl hover:bg-white hover:shadow-sm text-textPrimary transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
            <FaDownload className="text-primary text-sm" />
            <span>Export</span>
        </button>
    );
};

export default ExportButton;
