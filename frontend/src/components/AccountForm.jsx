import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import Input from "./ui/Input.jsx";
import Select from "./ui/Select.jsx";

const PRESET_TYPES = ["Cash", "UPI", "Savings"];

const AccountForm = ({ initial, existingAccounts = [], onSaved, onCancel }) => {
  // Merge presets with any custom types the user has already created,
  // so a type like "PhonePe" becomes a normal dropdown option after first use.
  const typeOptions = useMemo(() => {
    const usedTypes = existingAccounts
      .map((a) => a.type)
      .filter((t) => t && !PRESET_TYPES.includes(t));

    const uniqueCustom = [...new Set(usedTypes)].sort((a, b) =>
      a.localeCompare(b),
    );

    return [...PRESET_TYPES, ...uniqueCustom];
  }, [existingAccounts]);

  const initialIsKnown = initial ? typeOptions.includes(initial.type) : true;

  const [form, setForm] = useState({
    name: initial?.name || "",
    type: initial && !initialIsKnown ? "Custom" : initial?.type || "Bank",
    customType: initial && !initialIsKnown ? initial.type : "",
    openingBalance: initial?.opening_balance ?? "",
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Account name is required");
      return;
    }

    const resolvedType =
      form.type === "Custom" ? form.customType.trim() : form.type;

    if (form.type === "Custom" && !resolvedType) {
      toast.error("Please enter a custom account type");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: resolvedType,
        openingBalance: Number(form.openingBalance) || 0,
      };

      if (initial) {
        await api.put(API_PATHS.ACCOUNTS.UPDATE(initial.id), payload);
        toast.success("Account updated");
      } else {
        await api.post(API_PATHS.ACCOUNTS.CREATE, payload);
        toast.success("Account created");
      }

      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Account Name"
        placeholder="e.g. HDFC Savings"
        required
        value={form.name}
        onChange={update("name")}
      />

      <Select label="Account Type" value={form.type} onChange={update("type")}>
        {typeOptions.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
        <option value="Custom">+ Add new type…</option>
      </Select>

      {form.type === "Custom" && (
        <Input
          label="New Type Name"
          placeholder="e.g. PhonePe, Emergency Fund"
          required
          value={form.customType}
          onChange={update("customType")}
        />
      )}

      <Input
        label="Opening Balance"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={form.openingBalance}
        onChange={update("openingBalance")}
      />

      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 text-[12px] font-semibold tracking-[0.08em] uppercase hover:border-gray-400 hover:text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {saving ? "Saving..." : initial ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default AccountForm;
