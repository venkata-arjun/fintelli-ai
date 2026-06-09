import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Target,
  CalendarDays,
  LayoutGrid,
} from "lucide-react";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";
import KpiCard from "../components/KpiCard.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart.jsx";
import CategoryBreakdownChart from "../components/charts/CategoryBreakdownChart.jsx";
import Spinner from "../components/Spinner.jsx";

// ─── Toggle pill ────────────────────────────────────────────────────────────
const ViewToggle = ({ view, onChange }) => (
  <div
    role="group"
    aria-label="Dashboard time range"
    className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-1"
  >
    {[
      { id: "monthly", label: "This Month", Icon: CalendarDays },
      { id: "overall", label: "All Time", Icon: LayoutGrid },
    ].map(({ id, label, Icon }) => {
      const active = view === id;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={active}
          className={[
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
            active
              ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
          {label}
        </button>
      );
    })}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const currency = user?.currency || "INR";

  // ── view mode ──
  const [view, setView] = useState("monthly"); // "monthly" | "overall"

  // ── data ──
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [overallSummary, setOverallSummary] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [overallTrend, setOverallTrend] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [overallBreakdown, setOverallBreakdown] = useState([]);
  const [recent, setRecent] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ms, os, mt, ot, mb, ob, r, bd] = await Promise.all([
          api.get(API_PATHS.DASHBOARD.SUMMARY),

          api.get(API_PATHS.DASHBOARD.OVERALL_SUMMARY),

          api.get(API_PATHS.DASHBOARD.MONTHLY_TREND),

          api.get(API_PATHS.DASHBOARD.MONTHLY_TREND, {
            params: { period: "overall" },
          }),

          api.get(API_PATHS.DASHBOARD.CATEGORY_BREAKDOWN),

          api.get(API_PATHS.DASHBOARD.CATEGORY_BREAKDOWN, {
            params: { period: "overall" },
          }),

          api.get(API_PATHS.TRANSACTIONS.LIST, {
            params: { limit: 5 },
          }),

          api.get(API_PATHS.BUDGETS.LIST),
        ]);

        setMonthlySummary(ms.data);
        setOverallSummary(os.data);
        setMonthlyTrend(mt.data);
        setOverallTrend(ot.data);
        setMonthlyBreakdown(mb.data);
        setOverallBreakdown(ob.data);
        setRecent(r.data);
        setBudgets(bd.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── derived values based on active view ──
  const summary = view === "monthly" ? monthlySummary : overallSummary;
  const trend = view === "monthly" ? monthlyTrend : overallTrend;
  const breakdown = view === "monthly" ? monthlyBreakdown : overallBreakdown;

  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const aggPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const aggColor =
    aggPct >= 100 ? "#F43F5E" : aggPct >= 70 ? "#F59E0B" : "#10B981";

  if (loading || !monthlySummary || !overallSummary) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── income / expense labels ──
  const incomeLabel = view === "monthly" ? "Income" : "Total Income";
  const expenseLabel = view === "monthly" ? "Expenses" : "Total Expenses";
  const balanceLabel = view === "monthly" ? "Net Balance" : "Net Balance";
  const savingsLabel = view === "monthly" ? "Savings Rate" : "Savings Rate";

  const incomeValue =
    view === "monthly" ? summary.incomeThisMonth : summary.totalIncome;
  const expenseValue =
    view === "monthly" ? summary.expenseThisMonth : summary.totalExpense;
  const balanceValue =
    view === "monthly"
      ? summary.balance
      : (summary.netBalance ?? summary.balance);

  return (
    <div className="space-y-6">
      {/* ── Header row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {view === "monthly"
              ? "An overview of your finances this month"
              : "An overview of all your transactions"}
          </p>
        </div>
        <div className="self-start sm:self-center mt-0.5">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* ── KPI cards ── */}
      {/* Animated wrapper: key forces re-mount / fade when view changes */}
      <div
        key={view}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in"
        style={{ animation: "fadeSlideUp 0.25s ease both" }}
      >
        <KpiCard
          label={balanceLabel}
          value={formatCurrency(balanceValue, currency)}
          icon={Wallet}
          accent="violet"
        />
        <KpiCard
          label={incomeLabel}
          value={formatCurrency(incomeValue, currency)}
          delta={view === "monthly" ? summary.incomeDelta : undefined}
          icon={TrendingUp}
          accent="orange"
        />
        <KpiCard
          label={expenseLabel}
          value={formatCurrency(expenseValue, currency)}
          delta={view === "monthly" ? summary.expenseDelta : undefined}
          icon={TrendingDown}
          accent="rose"
        />
        <KpiCard
          label={savingsLabel}
          value={`${summary.savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          accent="blue"
        />
      </div>

      {/* ── Charts row ── */}
      <div
        key={`charts-${view}`}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        style={{ animation: "fadeSlideUp 0.3s ease both" }}
      >
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {view === "monthly" ? "Monthly Trend" : "All-time Trend"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {view === "monthly"
                ? "Income vs expenses, last 6 months"
                : "Income vs expenses across all recorded months"}
            </p>
          </div>
          <MonthlyTrendChart data={trend} currency={currency} />
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Top Categories
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {view === "monthly" ? "Spending this month" : "Spending all time"}
            </p>
          </div>
          <CategoryBreakdownChart data={breakdown} currency={currency} />
        </div>
      </div>

      {/* ── Bottom row: Recent transactions + Budget status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Transactions
            </h2>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-1">
              {recent.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryBadge
                      icon={t.category_icon}
                      color={t.category_color}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {t.description || t.category_name || "Untitled"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.category_name || "Uncategorized"} ·{" "}
                        {formatDate(t.transaction_date)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      t.type === "income"
                        ? "text-emerald-600"
                        : "text-orange-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget status */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Budget Status
            </h2>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Target size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                No budgets yet
              </p>
              <Link
                to="/budgets"
                className="text-xs text-violet-600 font-medium hover:text-violet-700"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-slate-900">
                      {formatCurrency(totalSpent, currency)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      of {formatCurrency(totalBudget, currency)} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-sm font-bold"
                      style={{ color: aggColor }}
                    >
                      {aggPct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-slate-500">used</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(aggPct, 100)}%`,
                      backgroundColor: aggColor,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => {
                  const spent = parseFloat(b.spent);
                  const total = parseFloat(b.amount);
                  const pct =
                    total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                  const color =
                    pct >= 100 ? "#F43F5E" : pct >= 70 ? "#F59E0B" : "#10B981";
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-700 font-medium truncate">
                          {b.category_name}
                        </span>
                        <span className="text-slate-500 shrink-0 ml-2 text-[11px]">
                          {formatCurrency(spent, currency)} /{" "}
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Keyframe animation (injected once) ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);  }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
