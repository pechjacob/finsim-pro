import React from 'react';

interface FlipIconProps {
    size?: number;
    className?: string;
}

export const FlipIcon: React.FC<FlipIconProps> = ({ size = 16, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Left Bracket */}
            <path d="M8 5H5V19H8" />
            {/* Right Bracket */}
            <path d="M16 5H19V19H16" />
            {/* Dotted Line */}
            <path d="M12 4V6" />
            <path d="M12 9V11" />
            <path d="M12 14V16" />
            <path d="M12 19V21" />
        </svg>
    );
};
