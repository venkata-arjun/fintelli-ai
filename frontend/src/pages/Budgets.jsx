import { useEffect, useState } from "react";
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency } from "../utils/format.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import BudgetForm from "../components/BudgetForm.jsx";

const statusStyles = {
  good: {
    Icon: CheckCircle2,
    label: "On Track",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    iconColor: "text-emerald-600",
  },
  caution: {
    Icon: AlertTriangle,
    label: "Watch It",
    bg: "bg-gray-50",
    text: "text-gray-600",
    iconColor: "text-gray-500",
  },
  concerning: {
    Icon: AlertOctagon,
    label: "Over Budget",
    bg: "bg-red-50",
    text: "text-red-500",
    iconColor: "text-red-500",
  },
};

const AnalysisSkeleton = () => (
  <div className="mt-4 pt-4 border-t border-gray-100 animate-pulse">
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 h-6 w-6 rounded-full bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-20 bg-gray-100 rounded-full" />
        <div className="h-2.5 bg-gray-100 rounded w-full" />
        <div className="h-2.5 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  </div>
);

const Budgets = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [analyses, setAnalyses] = useState({});
  const [analyzing, setAnalyzing] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        api.get(API_PATHS.BUDGETS.LIST),
        api.get(API_PATHS.CATEGORIES.LIST),
      ]);
      setBudgets(bRes.data);
      setCategories(cRes.data);
    } catch (err) {
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const analyzeAll = async () => {
    setAnalyses({});
    setAnalyzing(true);
    try {
      const res = await api.post(API_PATHS.BUDGETS.ANALYZE);
      const map = {};
      (res.data.analyses || []).forEach((a) => {
        map[a.budgetId] = a;
      });
      setAnalyses(map);
    } catch (err) {
      console.error("Failed to analyze budgets", err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchData();
    analyzeAll();
  }, []);

  const onEdit = (b) => {
    setEditing(b);
    setModalOpen(true);
  };

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await api.delete(API_PATHS.BUDGETS.DELETE(id));
      toast.success("Budget deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const onSaved = () => {
    setModalOpen(false);
    fetchData();
    analyzeAll();
  };

  const hasAnalyses = Object.keys(analyses).length > 0;

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
            Planning
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Budgets
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray-500 leading-7 mt-1 max-w-sm">
            Set spending limits by category - AI automatically scores and tracks
            your budget
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={analyzeAll}
            disabled={analyzing || budgets.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 text-[12px] font-semibold tracking-[0.08em] uppercase hover:border-gray-400 hover:text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-100 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
          >
            {analyzing ? (
              <Spinner size="sm" />
            ) : (
              <Sparkles size={14} strokeWidth={1.75} />
            )}
            {analyzing ? "Analyzing" : hasAnalyses ? "Re-analyze" : "Analyze"}
          </button>
          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200 whitespace-nowrap"
          >
            <Plus size={14} strokeWidth={1.75} /> Add Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets yet"
          description="Create a budget to track spending limits."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {budgets.map((b) => {
            const spent = parseFloat(b.spent);
            const total = parseFloat(b.amount);
            const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
            const over = spent > total;
            const barColor =
              pct >= 100
                ? "bg-red-500"
                : pct >= 70
                  ? "bg-amber-500"
                  : "bg-emerald-500";
            const analysis = analyses[b.id];
            const style = analysis ? statusStyles[analysis.status] : null;

            return (
              <div
                key={b.id}
                className="p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200 min-w-0"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <CategoryBadge
                    name={b.category_name}
                    icon={b.category_icon}
                    color={b.category_color}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(b)}
                      className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                    >
                      <Pencil size={14} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
                <div className="mb-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <span className="text-3xl font-bold tracking-tight text-gray-900 break-words">
                    {formatCurrency(spent, currency)}
                  </span>
                  <span className="text-[13px] text-gray-500 whitespace-nowrap">
                    of {formatCurrency(total, currency)}
                  </span>
                </div>
                <div className="h-2 bg-white border border-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px]">
                  <span className="text-gray-400 capitalize">
                    {b.period} · {pct.toFixed(0)}% used
                  </span>
                  <span
                    className={`${over ? "text-red-500 font-medium" : "text-gray-400"} sm:text-right`}
                  >
                    {over
                      ? `Over by ${formatCurrency(spent - total, currency)}`
                      : `${formatCurrency(total - spent, currency)} left`}
                  </span>
                </div>

                {analysis && style ? (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${style.bg}`}
                      >
                        <style.Icon
                          size={14}
                          strokeWidth={1.75}
                          className={style.iconColor}
                        />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${style.bg} ${style.text} mb-1`}
                        >
                          {style.label}
                        </span>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {analysis.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : analyzing ? (
                  <AnalysisSkeleton />
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Budget" : "New Budget"}
      >
        <BudgetForm
          initial={editing}
          categories={categories.filter((c) => c.type === "expense")}
          onSaved={onSaved}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Budgets;
