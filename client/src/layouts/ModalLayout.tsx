import React from "react";
import { X } from "lucide-react";

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "max-w-sm" | "max-w-md" | "max-w-3xl";
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "max-w-md", // Default size
}) => {
  // If the modal is not open, render nothing.
  if (!isOpen) return null;

  return (
    // This is the backdrop. Clicking it will trigger the onClose function.
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
    >
      {/* This is the main modal panel. Clicking inside it will stop the click from reaching the backdrop. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-zinc-900 rounded-lg shadow-xl p-6 w-full relative border border-zinc-700 ${size}`}
      >
        {/* This is the close button, now managed by the layout. */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* The title is passed as a prop for reusability. */}
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

        {/* The unique content of each modal (like forms) will be rendered here. */}
        {children}
      </div>
    </div>
  );
};
