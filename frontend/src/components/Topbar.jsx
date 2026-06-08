import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const formatToday = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm">
      {/* ── Left: hamburger + greeting ── */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          title="Open navigation"
          onClick={onMenuClick}
          className="h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors duration-150 lg:hidden shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900 tracking-tight truncate leading-snug">
            {greeting()}
            {firstName && `, ${firstName}`} 👋
          </p>
          <p className="text-xs text-slate-400 font-medium truncate leading-snug mt-0.5">
            {formatToday()}
          </p>
        </div>
      </div>

      {/* ── Right: avatar ── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {user?.name || "Guest"}
          </p>
          <p className="text-xs text-slate-400 leading-snug mt-0.5">
            {user?.role || user?.email || "Welcome back"}
          </p>
        </div>

        <button
          title={user?.name || "Account"}
          className="h-10 w-10 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all duration-150 shrink-0 overflow-hidden ring-2 ring-slate-100"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
