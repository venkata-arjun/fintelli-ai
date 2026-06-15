import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { todayDateString } from "../utils/format.js";
import Input from "./ui/Input.jsx";
import Select from "./ui/Select.jsx";
import Textarea from "./ui/Textarea.jsx";
import Button from "./ui/Button.jsx";

const TransactionForm = ({ initial, categories, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    type: initial?.type || "expense",
    amount: initial?.amount || "",
    categoryId: initial?.category_id || "",
    description: initial?.description || "",
    notes: initial?.notes || "",
    transactionDate:
      initial?.transaction_date?.split("T")[0] || todayDateString(),
  });
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId || null,
        description: form.description || null,
        notes: form.notes || null,
        transactionDate: form.transactionDate,
      };
      if (initial) {
        await api.put(API_PATHS.TRANSACTIONS.UPDATE(initial.id), payload);
        toast.success("Transaction updated");
      } else {
        await api.post(API_PATHS.TRANSACTIONS.CREATE, payload);
        toast.success("Transaction added");
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
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, type: "expense", categoryId: "" })}
          className={`py-3 px-4 rounded-xl text-[12px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 ${
            form.type === "expense"
              ? "bg-gray-900 text-white shadow-sm shadow-gray-200"
              : "border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, type: "income", categoryId: "" })}
          className={`py-3 px-4 rounded-xl text-[12px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 ${
            form.type === "income"
              ? "bg-gray-900 text-white shadow-sm shadow-gray-200"
              : "border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
          }`}
        >
          Income
        </button>
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0.01"
        required
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />

      <Select
        label="Category"
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
      >
        <option value="">Uncategorized</option>
        {filteredCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        label="Description"
        placeholder="e.g. Coffee at Starbucks"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Input
        label="Date"
        type="date"
        required
        value={form.transactionDate}
        onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
      />

      <Textarea
        label="Notes (optional)"
        rows={3}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

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

export default TransactionForm;
