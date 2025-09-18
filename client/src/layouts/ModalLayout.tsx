import React from "react";
import { X } from "lucide-react";

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?:
    | "max-w-sm"
    | "max-w-md"
    | "max-w-lg"
    | "max-w-xl"
    | "max-w-2xl"
    | "max-w-3xl"
    | "max-w-4xl"; // Added more size options
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
    // --- UI CHANGE: Made the backdrop scrollable and aligned content to the top ---
    // This ensures that long modals don't get cut off and are fully visible.
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start overflow-y-auto p-4 pt-8 md:pt-12"
    >
      {/* This is the main modal panel. Clicking inside it will stop the click from reaching the backdrop. */}
      {/* --- UI CHANGE: Added bottom margin for better scrolling --- */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-zinc-900 rounded-lg shadow-xl p-8 w-full relative border border-zinc-700 mb-8 ${size}`}
      >
        {/* This is the close button, now managed by the layout. */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* --- UI CHANGE: Increased title size and bottom margin for better hierarchy --- */}
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

        {/* The unique content of each modal (like forms) will be rendered here. */}
        <div>{children}</div>
      </div>
    </div>
  );
};
