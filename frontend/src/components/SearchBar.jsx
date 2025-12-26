import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
    return (
        <div className="flex items-center gap-4 bg-white/50 p-2.5 rounded-xl border border-white/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all flex-1 shadow-sm">
            <FaSearch className="text-textMuted ml-3" />
            <input
                type="text"
                placeholder={placeholder}
                className="bg-transparent border-none focus:outline-none w-full text-textPrimary placeholder-textMuted/70"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
