import React, { useState, useEffect } from "react";
import { X, Save, Loader } from "lucide-react";
import type { AppSetting } from "@/types";
import { getSettings, updateSettings } from "@/services/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSave: () => void;
}

const formatSettingKey = (key: string) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSave,
}) => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getSettings();
          setSettings(response.data);
        } catch {
          setError("Failed to load settings.");
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [isOpen]);

  const handleChange = (key: string, value: string) => {
    setSettings((current) =>
      current.map((s) =>
        s.setting_key === key ? { ...s, setting_value: value } : s,
      ),
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateSettings({ settings });
      onSettingsSave();
    } catch {
      setError("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-6 transition-colors">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Application Settings
        </h2>

        {/* LOADER */}
        {loading && !settings.length ? (
          <div className="text-center text-gray-600 dark:text-zinc-400">
            <Loader className="animate-spin inline-block" />
          </div>
        ) : (
          <div className="space-y-4">
            {settings.map(({ setting_key, setting_value }) => (
              <div key={setting_key}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {formatSettingKey(setting_key)}
                </label>

                <input
                  type="number"
                  value={setting_value}
                  onChange={(e) => handleChange(setting_key, e.target.value)}
                  min="0"
                  className="w-full rounded-lg px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center font-semibold">
            {error}
          </p>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-white font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
