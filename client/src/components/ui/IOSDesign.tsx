import React from 'react';

// --- iOS Card ---
// --- iOS Card ---
export const IOSCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}> = ({ children, className = '', onClick, style }) => (
    <div
        onClick={onClick}
        className={className}
        style={{
            background: 'rgba(28, 28, 30, 0.6)', // iOS System Gray 6
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            padding: '1.5rem',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth ease-out
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            ...style
        }}
        onMouseEnter={(e) => {
            if (onClick) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.background = 'rgba(44, 44, 46, 0.8)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }
        }}
        onMouseLeave={(e) => {
            if (onClick) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'rgba(28, 28, 30, 0.6)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        }}
        onMouseDown={(e) => {
            if (onClick) {
                e.currentTarget.style.transform = 'scale(0.98)';
            }
        }}
        onMouseUp={(e) => {
            if (onClick) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
            }
        }}
    >
        {children}
    </div>
);

// --- iOS Button ---
export const IOSButton: React.FC<{
    children: React.ReactNode;
    onClick?: (e?: React.MouseEvent) => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, variant = 'primary', disabled, className = '', style, type = 'button' }) => {
    let bg = '#0A84FF';
    let color = '#FFFFFF';
    let border = 'none';

    if (variant === 'secondary') {
        bg = 'rgba(255, 255, 255, 0.1)';
        color = '#FFFFFF';
    } else if (variant === 'ghost') {
        bg = 'transparent';
        color = '#0A84FF';
    } else if (variant === 'danger') {
        bg = 'rgba(255, 69, 58, 0.15)';
        color = '#FF453A';
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={{
                background: disabled ? 'rgba(255, 255, 255, 0.05)' : bg,
                color: disabled ? 'rgba(255, 255, 255, 0.3)' : color,
                border: border,
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like bounce
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                outline: 'none',
                opacity: disabled ? 0.6 : 1,
                transform: 'scale(1)',
                ...style
            }}
            onMouseEnter={(e) => {
                if (!disabled && variant !== 'ghost') {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.filter = 'brightness(1)';
                    e.currentTarget.style.transform = 'scale(1)';
                }
            }}
            onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.94)')}
            onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1.02)')}
        >
            {children}
        </button>
    );
};

// --- iOS Segmented Control ---
export const IOSSegmentedControl: React.FC<{
    options: { value: string; label: string | React.ReactNode }[];
    value: string;
    onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
    <div
        style={{
            background: 'rgba(118, 118, 128, 0.24)',
            borderRadius: '9px',
            padding: '2px',
            display: 'flex',
            position: 'relative',
            userSelect: 'none',
            transition: 'all 0.3s ease'
        }}
    >
        {options.map((option) => {
            const isActive = value === option.value;
            return (
                <div
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '6px 12px',
                        borderRadius: '7px',
                        background: isActive ? '#636366' : 'transparent',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 3px 8px rgba(0, 0, 0, 0.12), 0 3px 1px rgba(0, 0, 0, 0.04)' : 'none',
                        transform: isActive ? 'scale(1)' : 'scale(0.98)',
                        opacity: isActive ? 1 : 0.8
                    }}
                >
                    {option.label}
                </div>
            );
        })}
    </div>
);

// --- iOS Input ---
export const IOSInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid transparent',
            color: '#FFFFFF',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            ...props.style
        }}
        onFocus={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = '#0A84FF';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10, 132, 255, 0.2)';
            if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
            if (props.onBlur) props.onBlur(e);
        }}
    />
);

// --- iOS Modal (Bottom Sheet style on mobile, centered on desktop) ---
export const IOSModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center', // Centered for desktop
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '85vh',
                    background: 'rgba(30, 30, 32, 0.85)', // Darker glass
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(118, 118, 128, 0.24)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8E8E93',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
