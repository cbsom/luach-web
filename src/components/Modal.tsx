import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  subHeader?: React.ReactNode;
  maxWidth?: string;
  height?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  subHeader,
  maxWidth = "450px",
  height = "auto",
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, children]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className={`modal-content glass-panel shadow-2xl flex flex-col scroll-affordance ${className} ${
          isAtBottom ? "at-bottom" : "has-more"
        }`}
        style={{
          maxWidth,
          maxHeight: "90vh",
          height,
          padding: 0,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col">
            {title && <h3 className="text-xl font-black">{title}</h3>}
            {subtitle && <div className="text-accent-amber font-bold text-sm">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="close-btn settings-close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Optional Fixed SubHeader */}
        {subHeader && <div className="px-8 pb-4 flex-shrink-0">{subHeader}</div>}

        {/* Scrollable Body */}
        <div ref={scrollRef} onScroll={checkScroll} className="flex-grow overflow-y-auto px-8 pb-8">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="p-8 pt-4 border-t border-glass-border flex-shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
};
