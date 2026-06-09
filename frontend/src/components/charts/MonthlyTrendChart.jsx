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

  // Calculate dynamic width to keep bars readable on mobile
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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} // Abbreviate thousands
              width={40}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                fontSize: 13,
                padding: "12px",
              }}
              formatter={(value) => formatCurrency(value, currency)}
            />
            <Legend
              wrapperStyle={{ fontSize: 13, paddingTop: 20 }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              fill="url(#incomeGradient)"
              radius={[6, 6, 6, 6]}
              barSize={20}
            />
            <Bar
              dataKey="expense"
              fill="url(#expenseGradient)"
              radius={[6, 6, 6, 6]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
