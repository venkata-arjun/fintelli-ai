const accents = {
  // Net Balance — slate/navy: neutral authority
  balance: {
    bg: "bg-slate-900",
    icon: "text-white",
    label: "text-slate-400",
    value: "text-slate-900",
  },
  // Income — emerald: growth, positive
  income: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    label: "text-emerald-500",
    value: "text-emerald-700",
  },
  // Expenses — rose: caution, spending
  expense: {
    bg: "bg-rose-50",
    icon: "text-rose-500",
    label: "text-rose-400",
    value: "text-rose-600",
  },
  // Savings Rate — violet: aspiration, goals
  savings: {
    bg: "bg-violet-50",
    icon: "text-violet-600",
    label: "text-violet-400",
    value: "text-violet-700",
  },
  // Fallback
  gray: {
    bg: "bg-gray-100",
    icon: "text-gray-600",
    label: "text-gray-400",
    value: "text-gray-900",
  },
};

const KpiCard = ({ label, value, icon: Icon, accent = "gray" }) => {
  const style = accents[accent] || accents.gray;

  return (
    <div className="px-5 py-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 flex items-center gap-4 min-w-0">
      {Icon && (
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}
        >
          <Icon size={17} strokeWidth={1.75} className={style.icon} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-[11px] truncate font-medium ${style.label}`}>
          {label}
        </p>
        <h3
          className={`mt-1 text-2xl md:text-[2rem] font-bold leading-none break-all ${style.value}`}
        >
          {value}
        </h3>
      </div>
    </div>
  );
};

export default KpiCard;
