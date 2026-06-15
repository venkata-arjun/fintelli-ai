import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Wallet,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency, formatDate, formatDateLong } from "../utils/format.js";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import StatusPill from "../components/StatusPill.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import TransactionTrendChart from "../components/charts/TransactionTrendChart.jsx";

const Transactions = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const PAGE_SIZE = 20;

  const fetchData = async () => {
    const params = { limit: 2000 };
    const search = filters.search.trim();
    if (search) params.search = search;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    try {
      setLoading(true);
      const [tRes, cRes] = await Promise.all([
        api.get(API_PATHS.TRANSACTIONS.LIST, { params }),
        api.get(API_PATHS.CATEGORIES.LIST),
      ]);
      setAllTransactions(tRes.data);
      setCategories(cRes.data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.search, filters.categoryId]);
  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, sortDir]);

  // Base list: only date filters applied (no type filter yet)
  // Used for counts so badges reflect date range but still show per-type totals
  const dateFilteredTransactions = useMemo(() => {
    let list = allTransactions;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      list = list.filter(
        (t) => new Date((t.transaction_date || "").split("T")[0]) >= from,
      );
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      list = list.filter(
        (t) => new Date((t.transaction_date || "").split("T")[0]) <= to,
      );
    }
    return list;
  }, [allTransactions, filters.dateFrom, filters.dateTo]);

  // Counts derived from date-filtered list so badges update on date change
  const counts = useMemo(
    () => ({
      all: dateFilteredTransactions.length,
      income: dateFilteredTransactions.filter((t) => t.type === "income")
        .length,
      expense: dateFilteredTransactions.filter((t) => t.type === "expense")
        .length,
    }),
    [dateFilteredTransactions],
  );

  // Full filtered + sorted list for the table
  const transactions = useMemo(() => {
    let list = dateFilteredTransactions;

    if (filters.type) list = list.filter((t) => t.type === filters.type);

    list = [...list].sort((a, b) => {
      let valA, valB;
      if (sortBy === "amount") {
        valA = parseFloat(a.amount);
        valB = parseFloat(b.amount);
      } else {
        valA = new Date(a.transaction_date).getTime();
        valB = new Date(b.transaction_date).getTime();
      }
      return sortDir === "desc" ? valB - valA : valA - valB;
    });

    return list;
  }, [dateFilteredTransactions, filters.type, sortBy, sortDir]);

  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trendData = useMemo(() => {
    const now = new Date();
    const txnKey = (t) => (t.transaction_date || "").split("T")[0];
    const addAmount = (entry, t) => {
      const amount = parseFloat(t.amount);
      if (t.type === "income") entry.income += amount;
      else entry.expense += amount;
    };

    if (timeRange === "30d" || timeRange === "3m") {
      const totalDays = timeRange === "30d" ? 30 : 90;
      const buckets = [];
      for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
        );
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        buckets.push({
          key,
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          income: 0,
          expense: 0,
        });
      }
      const map = new Map(buckets.map((b) => [b.key, b]));
      allTransactions.forEach((t) => {
        const e = map.get(txnKey(t));
        if (e) addAmount(e, t);
      });
      return buckets;
    }

    if (timeRange === "monthly") {
      const buckets = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets.push({
          key,
          label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
          income: 0,
          expense: 0,
        });
      }
      const map = new Map(buckets.map((b) => [b.key, b]));
      allTransactions.forEach((t) => {
        const [year, month] = txnKey(t).split("-");
        const e = map.get(`${year}-${month}`);
        if (e) addAmount(e, t);
      });
      return buckets;
    }

    if (timeRange === "yearly") {
      const buckets = [];
      for (let i = 4; i >= 0; i--) {
        const y = String(now.getFullYear() - i);
        buckets.push({ key: y, label: y, income: 0, expense: 0 });
      }
      const map = new Map(buckets.map((b) => [b.key, b]));
      allTransactions.forEach((t) => {
        const year = txnKey(t).split("-")[0];
        const e = map.get(year);
        if (e) addAmount(e, t);
      });
      return buckets;
    }

    return [];
  }, [allTransactions, timeRange]);

  const chartInterval = timeRange === "30d" ? 3 : timeRange === "3m" ? 10 : 0;

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginated = transactions.slice(startIdx, startIdx + PAGE_SIZE);

  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (safePage >= totalPages - 3)
      return [
        1,
        "…",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, "…", safePage - 1, safePage, safePage + 1, "…", totalPages];
  };

  const hasDateFilter = filters.dateFrom || filters.dateTo;
  const activeFilterCount = [filters.categoryId, hasDateFilter].filter(
    Boolean,
  ).length;
  const clearDateFilter = () =>
    setFilters((f) => ({ ...f, dateFrom: "", dateTo: "" }));

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  };

  const onEdit = (t) => {
    setEditing(t);
    setModalOpen(true);
  };
  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const onDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(API_PATHS.TRANSACTIONS.DELETE(id));
      toast.success("Transaction deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };
  const onSaved = () => {
    setModalOpen(false);
    fetchData();
  };

  const generateInsight = async () => {
    if (transactions.length === 0) {
      toast.error("No transactions in view to analyze");
      return;
    }
    setAnalysisLoading(true);
    try {
      const ids = transactions.slice(0, 50).map((t) => t.id);
      const res = await api.post(API_PATHS.TRANSACTIONS.ANALYZE, {
        transactionIds: ids,
      });
      setAnalysis(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const tabs = [
    {
      value: "",
      label: "All",
      count: counts.all,
      badge: "bg-gray-100 text-gray-600",
    },
    {
      value: "income",
      label: "Income",
      count: counts.income,
      badge: "bg-emerald-50 text-emerald-600",
    },
    {
      value: "expense",
      label: "Expense",
      count: counts.expense,
      badge: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
            Activity
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Transactions
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray-500 leading-7 mt-1">
            All your income and expenses
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200 w-full sm:w-fit justify-center"
        >
          <Plus size={14} strokeWidth={1.75} /> Add Transaction
        </button>
      </div>

      {/* Trend chart */}
      <div className="p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Transaction Trend
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Income vs expenses over time
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-1 bg-white border border-gray-100 p-1 rounded-full sm:shrink-0 overflow-x-auto">
            {[
              { value: "30d", label: "30D" },
              { value: "3m", label: "3M" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => setTimeRange(r.value)}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 whitespace-nowrap ${
                  timeRange === r.value
                    ? "bg-gray-900 text-white shadow-sm shadow-gray-200"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <TransactionTrendChart
          data={trendData}
          currency={currency}
          interval={chartInterval}
        />
      </div>

      {/* AI Insights */}
      <div className="px-5 py-4 sm:p-7 rounded-2xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200">
        {!analysis ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                <Sparkles size={17} strokeWidth={1.75} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  AI Spending Insights
                </h3>
                <p className="text-[13px] text-gray-500">
                  Analyze {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""} in this view
                </p>
              </div>
            </div>
            <button
              onClick={generateInsight}
              disabled={analysisLoading || transactions.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none w-full sm:w-auto justify-center"
            >
              {analysisLoading ? (
                <>
                  <Spinner size="sm" /> Analyzing
                </>
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={1.75} /> Generate
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                <Sparkles size={17} strokeWidth={1.75} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
                    AI Spending Insights
                  </h3>
                  {analysis.highlight && (
                    <span className="inline-flex items-center bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-semibold tracking-[0.08em] uppercase px-2.5 py-0.5 rounded-full">
                      {analysis.highlight}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setAnalysis(null)}
                className="text-gray-400 hover:text-gray-600 shrink-0 p-1 transition-colors"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] sm:text-[15px] text-gray-500 leading-7 break-words">
                {analysis.insight}
              </p>
              <button
                onClick={generateInsight}
                disabled={analysisLoading}
                className="mt-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {analysisLoading ? "Re-analyzing..." : "Re-analyze"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions table card */}
      <div className="p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Row 1: search + mobile filter toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search
                size={15}
                strokeWidth={1.75}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search transactions…"
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 text-gray-800 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`sm:hidden h-[42px] px-4 flex items-center gap-1.5 rounded-xl border text-[12px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 shrink-0 ${
                activeFilterCount > 0
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              <CalendarDays size={14} strokeWidth={1.75} />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-white text-gray-900 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: type tabs — counts reflect date filter */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-full w-full overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value || "all"}
                onClick={() => setFilters({ ...filters, type: tab.value })}
                className={`flex-1 px-3 py-1.5 rounded-full text-[12px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  filters.type === tab.value
                    ? "bg-gray-900 text-white shadow-sm shadow-gray-200"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold normal-case ${
                    filters.type === tab.value
                      ? "bg-white/15 text-white"
                      : tab.badge
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Row 3: date range + category */}
          <div
            className={`flex-col sm:flex-row sm:items-center gap-2 ${filtersOpen ? "flex" : "hidden sm:flex"}`}
          >
            <div className="relative flex-1 min-w-0">
              <CalendarDays
                size={14}
                strokeWidth={1.75}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 text-gray-800 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200"
              />
            </div>

            <span className="text-gray-400 text-[11px] text-center shrink-0">
              to
            </span>

            <div className="relative flex-1 min-w-0">
              <CalendarDays
                size={14}
                strokeWidth={1.75}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 text-gray-800 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200"
              />
            </div>

            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                className="flex items-center gap-1 text-[11px] text-red-500 hover:bg-red-50 rounded-full shrink-0 px-2 py-1 transition-all duration-200"
              >
                <X size={13} strokeWidth={1.75} /> Clear dates
              </button>
            )}

            <select
              value={filters.categoryId}
              onChange={(e) =>
                setFilters({ ...filters, categoryId: e.target.value })
              }
              className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pr-10 text-[13px] focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200 cursor-pointer"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active date badge */}
          {hasDateFilter && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-white border border-gray-100 rounded-full px-3 py-1.5 w-fit">
              <CalendarDays
                size={12}
                strokeWidth={1.75}
                className="text-gray-400"
              />
              {filters.dateFrom && filters.dateTo
                ? `${formatDateLong(filters.dateFrom)} To ${formatDateLong(filters.dateTo)}`
                : filters.dateFrom
                  ? `From ${formatDateLong(filters.dateFrom)}`
                  : `Until ${formatDateLong(filters.dateTo)}`}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No transactions"
            description="Try adjusting filters, or add a new transaction."
            action={
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200"
              >
                <Plus size={14} strokeWidth={1.75} /> Add Transaction
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="text-left text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400 border-b border-gray-100">
                  <th className="pb-3 pr-3">Category</th>
                  <th className="pb-3 pr-3">Description</th>
                  <th className="pb-3 pr-3">
                    <button
                      onClick={() => toggleSort("date")}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Date
                      <ArrowUpDown
                        size={11}
                        strokeWidth={1.75}
                        className={
                          sortBy === "date" ? "text-gray-900" : "text-gray-400"
                        }
                      />
                    </button>
                  </th>
                  <th className="pb-3 pr-3">Type</th>
                  <th className="pb-3 pr-3 text-right">
                    <button
                      onClick={() => toggleSort("amount")}
                      className="flex items-center gap-1 ml-auto hover:text-gray-700 transition-colors"
                    >
                      Amount
                      <ArrowUpDown
                        size={11}
                        strokeWidth={1.75}
                        className={
                          sortBy === "amount"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  </th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-white transition-colors">
                    <td className="py-3 pr-3">
                      <CategoryBadge
                        name={t.category_name || "Uncategorized"}
                        icon={t.category_icon}
                        color={t.category_color}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-gray-700 max-w-[140px] truncate">
                      {t.description || "—"}
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-gray-500 whitespace-nowrap">
                      {formatDate(t.transaction_date)}
                    </td>
                    <td className="py-3 pr-3">
                      <StatusPill
                        variant={t.type === "income" ? "income" : "expense"}
                      >
                        {t.type}
                      </StatusPill>
                    </td>
                    <td
                      className={`py-3 pr-3 text-[13px] font-semibold text-right whitespace-nowrap ${
                        t.type === "income"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, currency)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(t)}
                          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                        >
                          <Pencil size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-5 border-t border-gray-100">
                <div className="text-[11px] text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {startIdx + 1}–
                    {Math.min(startIdx + PAGE_SIZE, transactions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {transactions.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} strokeWidth={1.75} />
                  </button>
                  {getPageNumbers().map((p, i) =>
                    p === "…" ? (
                      <span
                        key={`gap-${i}`}
                        className="px-1.5 text-gray-400 text-[13px]"
                      >
                        {p}
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 min-w-8 px-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                          safePage === p
                            ? "bg-gray-900 text-white shadow-sm shadow-gray-200"
                            : "text-gray-600 hover:bg-white"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Transaction" : "New Transaction"}
      >
        <TransactionForm
          initial={editing}
          categories={categories}
          onSaved={onSaved}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Transactions;
