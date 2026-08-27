import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closable = true,
  footer,
  children
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closable) onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, closable]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200" onClick={closable ? onClose : undefined}>
      <div 
        className={`w-full bg-[var(--color-surface)] rounded-xl shadow-2xl overflow-hidden flex flex-col ${sizeClasses[size]} animate-in zoom-in-95 duration-200`}
        onClick={e => e.stopPropagation()} // Prevent clicking inside from closing
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-white">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
          {closable && (
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-[var(--color-text-secondary)] hover:bg-slate-100 hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-white">
          {children}
        </div>
        
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
