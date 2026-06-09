import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useRef } from "react";
import { formatMonth, formatCurrency } from "../../utils/format.js";

// ─────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;

  const income =
    Number(payload.find((item) => item.dataKey === "income")?.value) || 0;

  const expense =
    Number(payload.find((item) => item.dataKey === "expense")?.value) || 0;

  const balance = income - expense;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-4 min-w-[190px]"
      style={{
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
      }}
    >
      <p className="text-sm font-semibold text-slate-900 mb-3">{label}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Income</span>
          <span className="font-semibold text-violet-600">
            {formatCurrency(income, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Expense</span>
          <span className="font-semibold text-orange-600">
            {formatCurrency(expense, currency)}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Balance</span>

          <span
            className={`font-bold ${
              balance >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatCurrency(balance, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Chart
// ─────────────────────────────────────────────────────────────
const MonthlyTrendChart = ({ data, currency }) => {
  const scrollRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  const formatted = data.map((d) => ({
    month: formatMonth(d.month),
    income: parseFloat(d.income),
    expense: parseFloat(d.expense),
  }));

  const chartWidth = Math.max(500, formatted.length * 60);

  return (
    <div ref={scrollRef} className="overflow-x-auto pb-2">
      <div className="h-72" style={{ minWidth: chartWidth }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formatted}
            barGap={4}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>

              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />

            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={<CustomTooltip currency={currency} />}
            />

            <Legend
              wrapperStyle={{
                fontSize: 13,
                paddingTop: 20,
              }}
              iconType="circle"
            />

            <Bar
              dataKey="income"
              name="Income"
              fill="url(#incomeGradient)"
              radius={[8, 8, 0, 0]}
              barSize={20}
            />

            <Bar
              dataKey="expense"
              name="Expense"
              fill="url(#expenseGradient)"
              radius={[8, 8, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
