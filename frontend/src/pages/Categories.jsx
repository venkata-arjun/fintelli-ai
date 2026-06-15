import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Folder } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import StatusPill from "../components/StatusPill.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import CategoryForm from "../components/CategoryForm.jsx";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATHS.CATEGORIES.LIST);
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onEdit = (c) => {
    setEditing(c);
    setModalOpen(true);
  };

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onDelete = async (id) => {
    if (
      !confirm(
        "Delete this category? Transactions in this category will become uncategorized.",
      )
    )
      return;
    try {
      await api.delete(API_PATHS.CATEGORIES.DELETE(id));
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const onSaved = () => {
    setModalOpen(false);
    fetchCategories();
  };

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
            Organization
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Categories
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray-500 leading-7 mt-1">
            Organize transactions by category
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200 shrink-0 whitespace-nowrap"
        >
          <Plus size={14} strokeWidth={1.75} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No categories"
          description="Add a category to start organizing your transactions."
        />
      ) : (
        <>
          {[
            { label: "Income", items: income },
            { label: "Expense", items: expense },
          ].map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-5">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400">
                  {group.label} ({group.items.length})
                </p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex items-center justify-between"
                  >
                    <CategoryBadge
                      name={c.name}
                      icon={c.icon}
                      color={c.color}
                    />
                    <div className="flex items-center gap-1.5">
                      {c.is_default && (
                        <StatusPill variant="neutral">default</StatusPill>
                      )}
                      <button
                        onClick={() => onEdit(c)}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                      >
                        <Pencil size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "New Category"}
      >
        <CategoryForm
          initial={editing}
          onSaved={onSaved}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Categories;
