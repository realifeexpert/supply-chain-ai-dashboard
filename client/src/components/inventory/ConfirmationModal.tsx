import React from "react";
import { AlertTriangle } from "lucide-react";
// --- CHANGE 1: Import the reusable ModalLayout component ---
import { ModalLayout } from "@/layouts/ModalLayout";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) => {
  // This check is now also handled by ModalLayout, but keeping it is safe.
  if (!isOpen) return null;

  // --- CHANGE 2: The entire return statement is now wrapped in ModalLayout ---
  // The old manual layout (backdrop, panel, title) has been removed.
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={title} // The title is passed as a prop
      size="max-w-sm"
    >
      {/* The unique content of the confirmation modal remains inside */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />
        </div>

        {/* The main title is now handled by ModalLayout, so the h2 has been removed. We only need the message. */}
        <p className="text-zinc-400 mb-8">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};
