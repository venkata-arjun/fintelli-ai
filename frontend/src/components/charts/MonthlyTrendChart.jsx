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
      className="bg-white rounded-2xl border border-gray-100 p-4 min-w-[190px]"
      style={{
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
      }}
    >
      <p className="text-[15px] font-semibold text-gray-900 mb-3">{label}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-gray-500">Income</span>
          <span className="font-semibold text-emerald-600">
            {formatCurrency(income, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-gray-500">Expense</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(expense, currency)}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-[13px]">
          <span className="font-medium text-gray-700">Balance</span>

          <span
            className={`font-bold ${
              balance >= 0 ? "text-emerald-600" : "text-red-500"
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
// Y-axis tick formatter
// Below 1000, "k" notation just rounds everything to "0k" — show the
// plain number instead. At/above 1000, keep the compact "Nk" form.
// ─────────────────────────────────────────────────────────────
const formatAxisTick = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const scaled = value / 1000;
    return `${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}k`;
  }
  return `${value}`;
};

// ─────────────────────────────────────────────────────────────
// Chart
// ─────────────────────────────────────────────────────────────
const MonthlyTrendChart = ({ data, currency }) => {
  const scrollRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[13px] text-gray-400">
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
              tickFormatter={formatAxisTick}
            />

            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              content={<CustomTooltip currency={currency} />}
            />

            <Legend
              wrapperStyle={{
                fontSize: 13,
                paddingTop: 20,
                color: "#6b7280",
              }}
              iconType="circle"
            />

            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              barSize={20}
            />

            <Bar
              dataKey="expense"
              name="Expense"
              fill="#111827"
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
