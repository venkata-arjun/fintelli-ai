import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/format.js";

const COLORS = ["#111827", "#6b7280", "#9ca3af", "#d1d5db", "#10b981"];

const CategoryBreakdownChart = ({ data, currency }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[13px] text-gray-400">
        No expenses yet
      </div>
    );
  }

  const top = data.slice(0, 5);
  const formatted = top.map((d, i) => ({
    name: d.category_name,
    value: parseFloat(d.total),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formatted}
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {formatted.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f3f4f6",
                boxShadow: "0 4px 12px rgba(107, 114, 128, 0.15)",
                fontSize: 12,
              }}
              formatter={(v) => formatCurrency(v, currency)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 space-y-2">
        {formatted.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between text-[13px]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-[11px] text-gray-700 truncate">
                {c.name}
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-900 shrink-0 ml-2">
              {formatCurrency(c.value, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;
