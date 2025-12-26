import { cn } from '../utils/cn';

const Card = ({ children, className }) => {
    return (
        <div className={cn("glass-card p-6", className)}>
            {children}
        </div>
    );
};

export default Card;
