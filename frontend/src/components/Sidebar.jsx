import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Folder,
  Target,
  Sparkles,
  BarChart2,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Folder },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
];

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.[0]?.toUpperCase() || "U";

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 flex flex-col shrink-0`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center gap-2.5 px-6 border-b border-gray-100">
        <span className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
          <BarChart2 size={15} strokeWidth={1.75} className="text-white" />
        </span>
        <span className="font-bold text-[15px] text-gray-900">Fintelli AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {/* Label */}
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 px-4 pt-2 pb-1">
          Menu
        </p>

        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
          onClick={() => {
            onClose?.();
            navigate("/profile");
          }}
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
            {initial}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>

          {/* Logout */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors duration-150 shrink-0"
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button> */}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
