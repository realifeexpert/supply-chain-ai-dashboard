import { useEffect, useState } from "react";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/services/api";

/* ---------- FIELD COMPONENT OUTSIDE (IMPORTANT) ---------- */
const Field = ({ label, value, onChange, color = "cyan", maxLength }: any) => {
  return (
    <div className="relative">
      <label className="block text-xs text-zinc-400 mb-1 ml-1">{label}</label>
      <input
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-white outline-none transition
        ${
          color === "amber"
            ? "border-amber-600 focus:border-amber-400 focus:ring-amber-400/30"
            : "border-zinc-800 focus:border-cyan-500 focus:ring-cyan-500/30"
        } focus:ring-1`}
      />
    </div>
  );
};

export const AddressSelector = ({ onSelect }: any) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    full_name: "",
    phone_number: "",
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    is_default: false,
  };

  const [form, setForm] = useState(emptyForm);

  const fetchAddresses = async () => {
    const res = await getMyAddresses();
    setAddresses(res.data);

    if (res.data.length > 0) {
      const defaultAddr =
        res.data.find((a: any) => a.is_default) || res.data[0];
      setSelectedId(defaultAddr.id);
      onSelect(defaultAddr);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSelect = (addr: any) => {
    setSelectedId(addr.id);
    onSelect(addr);
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setForm(addr);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id);
    setEditingId(null);
    setShowForm(false);
    fetchAddresses();
  };

  const handleSave = async () => {
    if (!form.full_name || !form.phone_number || !form.city)
      return alert("Please fill required fields");

    if (!form.flat.trim()) return alert("Please enter House / Flat / Building");

    if (editingId) {
      await updateAddress(editingId, form);
    } else {
      await createAddress(form);
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    fetchAddresses();
  };

  return (
    <div className="space-y-6">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`p-px rounded-2xl
          ${
            selectedId === addr.id
              ? "bg-linear-to-r from-cyan-500 to-blue-500"
              : "bg-zinc-800/50"
          }`}
        >
          <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800">
            <div
              className="flex gap-4 cursor-pointer"
              onClick={() => handleSelect(addr)}
            >
              <input
                type="radio"
                checked={selectedId === addr.id}
                readOnly
                className="mt-1 accent-cyan-500"
              />

              <div className="flex-1">
                <p className="font-semibold text-white text-lg">
                  {addr.full_name}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {addr.phone_number}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {addr.flat}, {addr.area}, {addr.city}, {addr.state} -{" "}
                  {addr.pincode}
                </p>
              </div>
            </div>

            <div className="flex gap-6 mt-4 text-sm">
              <button
                onClick={() => handleEdit(addr)}
                className="text-blue-400"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(addr.id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="w-full py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 text-black font-semibold"
        >
          + Add New Address
        </button>
      )}

      {showForm && (
        <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <Field
            label="Full Name"
            value={form.full_name}
            onChange={(e: any) =>
              setForm({ ...form, full_name: e.target.value })
            }
          />

          <Field
            label="Phone Number"
            maxLength={10}
            value={form.phone_number}
            onChange={(e: any) =>
              setForm({
                ...form,
                phone_number: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
          />

          <Field
            label="Flat / House No / Building Name"
            color="amber"
            maxLength={40}
            value={form.flat}
            onChange={(e: any) =>
              setForm({
                ...form,
                flat: e.target.value
                  .replace(/[^a-zA-Z0-9\- ]/g, "") // allow letters, numbers, space, hyphen
                  .slice(0, 40),
              })
            }
          />

          <Field
            label="Area / Street"
            value={form.area}
            onChange={(e: any) => setForm({ ...form, area: e.target.value })}
          />

          <Field
            label="Landmark"
            value={form.landmark}
            onChange={(e: any) =>
              setForm({ ...form, landmark: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City"
              value={form.city}
              onChange={(e: any) => setForm({ ...form, city: e.target.value })}
            />

            <Field
              label="State"
              value={form.state}
              onChange={(e: any) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <Field
            label="Pincode"
            maxLength={6}
            value={form.pincode}
            onChange={(e: any) =>
              setForm({
                ...form,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
          />

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg bg-linear-to-r from-green-500 to-emerald-500 text-black font-semibold"
          >
            {editingId ? "Update Address" : "Save Address"}
          </button>
        </div>
      )}
    </div>
  );
};
