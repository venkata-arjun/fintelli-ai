import { TrendingUp, TrendingDown } from "lucide-react";

const gradients = {
  violet: "from-violet-400 to-violet-600",
  orange: "from-orange-400 to-orange-600",
  emerald: "from-emerald-400 to-emerald-600",
  rose: "from-rose-400 to-rose-600",
  blue: "from-blue-400 to-blue-600",
  amber: "from-amber-400 to-amber-600",
  slate: "from-slate-400 to-slate-600",
};

const KpiCard = ({ label, value, delta, icon: Icon, accent = "slate" }) => {
  const hasDelta = delta != null && Number.isFinite(delta);
  const positive = hasDelta && delta >= 0;
  const gradient = gradients[accent] || gradients.slate;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-4 min-w-0">
      {Icon && (
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient}`}
        >
          <Icon size={26} className="text-white" strokeWidth={2} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>

        {/* Wrapped in a flex container that allows wrap for very long content */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
          <h3 className="text-2xl md:text-[2rem] font-bold text-slate-900 leading-none break-all">
            {value}
          </h3>

          {hasDelta && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold shrink-0 ${positive ? "text-emerald-600" : "text-rose-600"}`}
            >
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
