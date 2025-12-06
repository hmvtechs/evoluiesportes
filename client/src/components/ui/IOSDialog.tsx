import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface DialogButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onClick?: () => void;
}

interface DialogOptions {
    title: string;
    message?: string;
    buttons?: DialogButton[];
}

interface DialogContextType {
    showAlert: (title: string, message?: string) => Promise<void>;
    showConfirm: (title: string, message?: string) => Promise<boolean>;
    showDialog: (options: DialogOptions) => Promise<number>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

interface DialogState {
    isOpen: boolean;
    title: string;
    message?: string;
    buttons: DialogButton[];
    resolve?: (value: number) => void;
}

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        title: '',
        message: '',
        buttons: []
    });

    const showDialog = useCallback((options: DialogOptions): Promise<number> => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title: options.title,
                message: options.message,
                buttons: options.buttons || [{ text: 'OK', style: 'default' }],
                resolve
            });
        });
    }, []);

    const showAlert = useCallback((title: string, message?: string): Promise<void> => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                buttons: [{ text: 'OK', style: 'default' }],
                resolve: () => resolve()
            });
        });
    }, []);

    const showConfirm = useCallback((title: string, message?: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                buttons: [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Confirmar', style: 'default' }
                ],
                resolve: (index) => resolve(index === 1)
            });
        });
    }, []);

    const handleButtonClick = (index: number) => {
        dialog.resolve?.(index);
        setDialog(prev => ({ ...prev, isOpen: false }));
    };

    const handleBackdropClick = () => {
        dialog.resolve?.(0);
        setDialog(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, showDialog }}>
            {children}

            {/* iOS-style Dialog Overlay */}
            {dialog.isOpen && (
                <div
                    onClick={handleBackdropClick}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    {/* Dialog Box */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(45, 45, 48, 0.95)',
                            borderRadius: '14px',
                            minWidth: '270px',
                            maxWidth: '320px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'scaleIn 0.2s ease-out'
                        }}
                    >
                        {/* Content */}
                        <div style={{
                            padding: '20px 16px 16px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '17px',
                                fontWeight: 600,
                                color: 'white',
                                lineHeight: 1.3
                            }}>
                                {dialog.title}
                            </h3>
                            {dialog.message && (
                                <p style={{
                                    margin: '8px 0 0',
                                    fontSize: '13px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    lineHeight: 1.4
                                }}>
                                    {dialog.message}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: dialog.buttons.length <= 2 ? 'flex' : 'block'
                        }}>
                            {dialog.buttons.map((button, index) => {
                                const isCancel = button.style === 'cancel';
                                const isDestructive = button.style === 'destructive';

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleButtonClick(index)}
                                        style={{
                                            flex: dialog.buttons.length <= 2 ? 1 : undefined,
                                            width: dialog.buttons.length > 2 ? '100%' : undefined,
                                            padding: '11px 10px',
                                            background: 'none',
                                            border: 'none',
                                            borderRight: dialog.buttons.length === 2 && index === 0
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : 'none',
                                            borderTop: dialog.buttons.length > 2 && index > 0
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : 'none',
                                            fontSize: '17px',
                                            fontWeight: isCancel ? 400 : 600,
                                            color: isDestructive
                                                ? '#FF453A'
                                                : isCancel
                                                    ? 'rgba(255, 255, 255, 0.7)'
                                                    : '#0A84FF',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'none';
                                        }}
                                    >
                                        {button.text}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </DialogContext.Provider>
    );
};

export default DialogProvider;
