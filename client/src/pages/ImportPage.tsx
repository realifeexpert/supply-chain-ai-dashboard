import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
// --- CHANGE 1: Import the new 'uploadOrdersCSV' function ---
import { uploadInventoryCSV, uploadOrdersCSV } from "@/services/api";

// --- New Dropzone Component (For cleaner code) ---
interface DropzoneProps {
  onDrop: (files: File[]) => void;
  loading: boolean;
  title: string;
}

const FileDropzone: React.FC<DropzoneProps> = ({ onDrop, loading, title }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center transition-colors cursor-pointer",
        isDragActive
          ? "border-cyan-500 bg-zinc-800/50"
          : "hover:border-zinc-500"
      )}
    >
      <input {...getInputProps()} />
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader className="mx-auto h-12 w-12 text-cyan-400 animate-spin" />
          <p className="mt-4 text-sm text-zinc-400">
            Uploading, please wait...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="mx-auto h-12 w-12 text-zinc-500" />
          <p className="mt-4 text-sm text-zinc-400">{title}</p>
          <p className="mt-1 text-xs text-zinc-500">.csv files only</p>
        </div>
      )}
    </div>
  );
};

// --- Main Import Page Component ---
const ImportPage: React.FC = () => {
  // --- CHANGE 2: Separate states for both uploaders ---
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);
  const [invSuccess, setInvSuccess] = useState<string | null>(null);

  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Handler for inventory upload
  const onInventoryDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setInvLoading(true);
    setInvError(null);
    setInvSuccess(null);

    try {
      const response = await uploadInventoryCSV(file);
      const added = response.data.products_added || 0;
      const errors = response.data.errors || [];

      let successMessage = `${added} products were successfully added.`;
      if (errors.length > 0) {
        successMessage += ` ${errors.length} rows had errors.`;
        setInvError(`First error: ${errors[0]}`);
      }
      setInvSuccess(successMessage);
    } catch (err: any) {
      // (Error handling logic is the same)
      let errorMessage = "File upload failed. Please try again.";
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        errorMessage = detail;
      } else if (typeof detail === "object" && detail !== null) {
        errorMessage =
          detail.message || "An unknown error occurred during upload.";
        if (detail.errors && detail.errors.length > 0) {
          errorMessage += ` (Details: ${detail.errors[0]})`;
        }
      }
      setInvError(errorMessage);
    } finally {
      setInvLoading(false);
    }
  }, []);

  // --- CHANGE 3: New handler for Orders upload ---
  const onOrdersDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setOrderLoading(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      const response = await uploadOrdersCSV(file); // Call new API function
      const added = response.data.orders_created || 0;
      const errors = response.data.errors || [];

      let successMessage = `${added} orders were successfully created.`;
      if (errors.length > 0) {
        successMessage += ` ${errors.length} orders had errors.`;
        setOrderError(`First error: ${errors[0]}`);
      }
      setOrderSuccess(successMessage);
    } catch (err: any) {
      let errorMessage = "File upload failed. Please try again.";
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") errorMessage = detail;
      else if (typeof detail === "object" && detail !== null) {
        errorMessage = detail.message || "An unknown error occurred.";
        if (detail.errors && detail.errors.length > 0)
          errorMessage += ` (Details: ${detail.errors[0]})`;
      }
      setOrderError(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  }, []);

  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Import & Export Data</h1>
        <p className="text-sm text-zinc-400">
          Bulk upload your products or orders via CSV.
        </p>
      </div>

      {/* --- CHANGE 4: Now there are two separate sections --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Inventory Import */}
        <div className="border-t border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Import Inventory from CSV
          </h2>
          <FileDropzone
            onDrop={onInventoryDrop}
            loading={invLoading}
            title="Drag & drop Inventory CSV here"
          />
          {invSuccess && (
            <div className="mt-4 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 flex items-center gap-3">
              <CheckCircle size={16} /> <p className="text-sm">{invSuccess}</p>
            </div>
          )}
          {invError && (
            <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
              <AlertCircle size={16} /> <p className="text-sm">{invError}</p>
            </div>
          )}
        </div>

        {/* Section 2: Orders Import */}
        <div className="border-t border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Import Orders from CSV
          </h2>
          <FileDropzone
            onDrop={onOrdersDrop}
            loading={orderLoading}
            title="Drag & drop Orders CSV here"
          />
          {orderSuccess && (
            <div className="mt-4 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 flex items-center gap-3">
              <CheckCircle size={16} />{" "}
              <p className="text-sm">{orderSuccess}</p>
            </div>
          )}
          {orderError && (
            <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
              <AlertCircle size={16} /> <p className="text-sm">{orderError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
