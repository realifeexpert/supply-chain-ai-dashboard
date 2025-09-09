import React from "react";
import { AlertTriangle } from "lucide-react";
// ADDED: Importing the new reusable ModalLayout component.
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
  // CHANGED: The entire JSX is now wrapped in the ModalLayout component.
  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={title} // The title is passed as a prop to the layout.
      size="max-w-sm" // The specific size for this modal is passed as a prop.
    >
      {/* All the content below is now passed as 'children' to the ModalLayout. */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        {/* REMOVED: The h2 title element is no longer needed here as ModalLayout handles it. */}
        <p className="text-zinc-400 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full bg-zinc-700 hover:bg-zinc-600 font-semibold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};
