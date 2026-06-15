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
    className="inline-flex items-center bg-white border border-gray-100 rounded-full p-1 gap-1"
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
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10",
            active
              ? "bg-gray-900 text-white shadow-sm shadow-gray-200"
              : "text-gray-500 hover:text-gray-900",
          ].join(" ")}
        >
          <Icon size={13} strokeWidth={1.75} />
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
    aggPct >= 100 ? "#EF4444" : aggPct >= 70 ? "#F59E0B" : "#10B981";

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
    <div className="space-y-6 sm:space-y-10">
      {/* ── Header row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
            Overview
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray-500 leading-7 mt-1">
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
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 animate-fade-in"
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
        className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6"
        style={{ animation: "fadeSlideUp 0.3s ease both" }}
      >
        <div className="xl:col-span-2 p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">
              {view === "monthly" ? "Monthly Trend" : "All-time Trend"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {view === "monthly"
                ? "Income vs expenses, last 6 months"
                : "Income vs expenses across all recorded months"}
            </p>
          </div>
          <MonthlyTrendChart data={trend} currency={currency} />
        </div>

        <div className="p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Top Categories
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {view === "monthly" ? "Spending this month" : "Spending all time"}
            </p>
          </div>
          <CategoryBreakdownChart data={breakdown} currency={currency} />
        </div>
      </div>

      {/* ── Bottom row: Recent transactions + Budget status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-7 p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-700 hover:text-gray-900 transition-colors"
            >
              View all
              <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-[13px] text-gray-500 py-6 text-center">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-1">
              {recent.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryBadge
                      icon={t.category_icon}
                      color={t.category_color}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-gray-900 truncate">
                        {t.description || t.category_name || "Untitled"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {t.category_name || "Uncategorized"} ·{" "}
                        {formatDate(t.transaction_date)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[13px] font-semibold shrink-0 ${
                      t.type === "income" ? "text-emerald-600" : "text-red-500"
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
        <div className="lg:col-span-5 p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Budget Status
            </h2>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-700 hover:text-gray-900 transition-colors"
            >
              View all
              <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-3">
                <Target
                  size={17}
                  strokeWidth={1.75}
                  className="text-gray-600"
                />
              </div>
              <p className="text-[15px] font-semibold text-gray-900 mb-1">
                No budgets yet
              </p>
              <Link
                to="/budgets"
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-700 hover:text-gray-900 transition-colors"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-gray-900">
                      {formatCurrency(totalSpent, currency)}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      of {formatCurrency(totalBudget, currency)} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-[13px] font-bold"
                      style={{ color: aggColor }}
                    >
                      {aggPct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-gray-400">used</div>
                  </div>
                </div>
                <div className="h-2 bg-white border border-gray-100 rounded-full overflow-hidden">
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
                    pct >= 100 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#10B981";
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between items-center text-[11px] mb-1.5">
                        <span className="text-gray-700 font-medium truncate">
                          {b.category_name}
                        </span>
                        <span className="text-gray-400 shrink-0 ml-2 text-[11px]">
                          {formatCurrency(spent, currency)} /{" "}
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white border border-gray-100 rounded-full overflow-hidden">
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
