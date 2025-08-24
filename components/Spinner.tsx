
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-16 w-16 border-4',
    };

    return (
        <div className={`
            ${sizeClasses[size]}
            border-primary-light border-t-primary-dark
            rounded-full animate-spin
        `}></div>
    );
};

export default Spinner;
