import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { lucideIconByName } from "../utils/icons.js";
import Input from "./ui/Input.jsx";
import Select from "./ui/Select.jsx";

const ICONS = [
  "tag",
  "utensils",
  "shopping-cart",
  "shopping-bag",
  "car",
  "home",
  "zap",
  "film",
  "heart",
  "book-open",
  "plane",
  "briefcase",
  "gift",
  "laptop",
  "trending-up",
  "sparkles",
];

const COLORS = [
  "#10B981",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#64748B",
];

const CategoryForm = ({ initial, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    type: initial?.type || "expense",
    icon: initial?.icon || "tag",
    color: initial?.color || "#10B981",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) {
        await api.put(API_PATHS.CATEGORIES.UPDATE(initial.id), {
          name: form.name,
          icon: form.icon,
          color: form.color,
        });
        toast.success("Category updated");
      } else {
        await api.post(API_PATHS.CATEGORIES.CREATE, form);
        toast.success("Category created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Name"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      {!initial && (
        <Select
          label="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      )}

      <div>
        <label className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-gray-400">
          Icon
        </label>
        <div className="grid grid-cols-8 gap-2 mt-2">
          {ICONS.map((name) => {
            const Icon = lucideIconByName(name);
            const selected = form.icon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setForm({ ...form, icon: name })}
                className={`h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  selected
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                <Icon size={17} strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-gray-400">
          Color
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm({ ...form, color })}
              className={`h-8 w-8 rounded-full transition-all duration-200 ring-offset-2 ${
                form.color === color ? "ring-2 ring-gray-900" : "ring-0"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 text-[12px] font-semibold tracking-[0.08em] uppercase hover:border-gray-400 hover:text-gray-900 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
