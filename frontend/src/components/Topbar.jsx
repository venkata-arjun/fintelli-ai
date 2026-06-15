import { useState, useRef, useEffect } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const firstName = user?.name?.split(" ")[0] || "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <header className="h-[70px] bg-white border-b border-slate-100 flex items-center justify-between px-5 lg:px-8 shrink-0">
      {/* Left */}

      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition lg:hidden flex items-center justify-center"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-slate-900 truncate">
            {greeting()}
            {firstName && `, ${firstName}`}
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">{formatToday()}</p>
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-900 leading-none">
            {user?.name || "Guest"}
          </p>

          <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm ring-2 ring-slate-100 hover:opacity-90 transition"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden z-50">
                <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {user.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={18} className="text-slate-500" />
                  My Profile
                </Link>

                <div className="mx-4 border-t border-slate-100" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
