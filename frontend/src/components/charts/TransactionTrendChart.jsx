import { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/format.js";

const TransactionTrendChart = ({ data, currency, interval = 3 }) => {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const chartWidth = Math.min(
    1800,
    Math.max(
      560,
      data?.length ? data.length * (data.length > 45 ? 18 : 56) : 560,
    ),
  );

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Helper to format labels - Now forces the current year (2026)
  const formatDateTime = (value, showYear = true) => {
    if (!value || value === "Invalid Date") return "";

    // If input contains a year (like 2001), we want to ignore it or replace it
    // Create a date object, then force the year to 2026
    let date = new Date(value);

    // Safety check: if date is invalid, try to parse only Month/Day
    if (isNaN(date.getTime())) {
      // Logic for strings like "Jul 25"
      date = new Date(`${value} 2026`);
    } else {
      date.setFullYear(2026);
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: showYear ? "numeric" : undefined,
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[13px] text-gray-400">
        No data yet
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="overflow-x-auto md:overflow-x-visible pb-2">
      <div
        className="h-64"
        style={{ minWidth: isMobile ? chartWidth : "100%" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={interval}
              // Pass 'false' to hide the year on X-axis ticks for cleaner look
              tickFormatter={(val) => formatDateTime(val, false)}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: "#d1d5db", strokeDasharray: "3 3" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f3f4f6",
                boxShadow: "0 4px 12px rgba(107, 114, 128, 0.15)",
                fontSize: 12,
              }}
              // Pass 'true' to show the year in the tooltip hover
              labelFormatter={(val) => formatDateTime(val, true)}
              formatter={(v) => formatCurrency(v, currency)}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12, color: "#6b7280" }}
              iconType="circle"
              payload={[
                { value: "income", type: "circle", color: "#10b981" },
                { value: "expense", type: "circle", color: "#111827" },
              ]}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#incomeArea)"
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#111827"
              strokeWidth={2.5}
              fill="url(#expenseArea)"
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionTrendChart;
