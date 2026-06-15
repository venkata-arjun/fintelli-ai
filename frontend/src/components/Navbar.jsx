import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  UserCircle,
  BarChart2,
} from "lucide-react";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <div className="flex items-center justify-between py-5 sm:py-6 font-medium border-b border-gray-100 bg-white px-6 sm:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-gray-900 text-[15px]"
        >
          <span className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
            <BarChart2 size={15} strokeWidth={1.75} className="text-white" />
          </span>
          Fintelli AI
        </Link>

        {/* Desktop Nav — centered */}
        <ul className="hidden sm:flex gap-10 absolute left-1/2 -translate-x-1/2">
          {[
            { to: "/", label: "HOME" },
            { to: "/about", label: "ABOUT" },
            { to: "/contact", label: "CONTACT" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 group"
            >
              {({ isActive }) => (
                <>
                  <p
                    className={`transition-colors duration-150 text-[11.5px] tracking-[0.15em] ${
                      isActive
                        ? "text-gray-900 font-semibold"
                        : "text-gray-400 group-hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </p>
                  <hr
                    className={`border-none h-[1.5px] bg-gray-900 transition-all duration-300 ${
                      isActive ? "w-2/4" : "w-0 group-hover:w-2/4"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Profile dropdown — desktop, only when logged in */}
          {token && (
            <div className="group relative hidden sm:block">
              <button
                className="text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="Profile"
              >
                <User size={18} strokeWidth={1.5} />
              </button>

              <div className="absolute right-0 pt-4 hidden group-hover:block z-50">
                <div className="flex flex-col w-48 py-1.5 bg-white border border-gray-100 shadow-lg shadow-gray-200/60 rounded-2xl overflow-hidden">
                  {/* Header hint */}
                  <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 px-4 pt-2 pb-1.5">
                    Account
                  </p>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle
                      size={14}
                      strokeWidth={1.75}
                      className="text-gray-400"
                    />
                    My Profile
                  </Link>

                  <Link
                    to="/"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <BarChart2
                      size={14}
                      strokeWidth={1.75}
                      className="text-gray-400"
                    />
                    Dashboard
                  </Link>

                  <div className="my-1 mx-4 border-t border-gray-100" />

                  <button
                    onClick={logout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut
                      size={14}
                      strokeWidth={1.75}
                      className="text-red-400"
                    />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CTA — desktop, only when not logged in */}
          {!token && (
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gray-900 text-white text-[11.5px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200"
            >
              Get Started
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setVisible(true)}
            className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setVisible(false)}
        className={`fixed inset-0 bg-black/10 z-40 sm:hidden transition-opacity duration-300 ${
          visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out sm:hidden border-l border-gray-100 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link
            to="/"
            onClick={() => setVisible(false)}
            className="flex items-center gap-2.5 font-bold text-gray-900 text-[15px]"
          >
            <span className="w-7 h-7 rounded-xl bg-gray-900 flex items-center justify-center">
              <BarChart2 size={13} strokeWidth={1.75} className="text-white" />
            </span>
            Fintelli AI
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col mt-1 px-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] px-3 pt-3 pb-1">
            Menu
          </p>
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setVisible(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-3 text-[13px] rounded-xl transition-colors duration-150 ${
                  isActive
                    ? "text-gray-900 font-semibold bg-gray-50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{label}</span>
                  <ChevronRight
                    size={13}
                    strokeWidth={1.75}
                    className={isActive ? "text-gray-500" : "text-gray-300"}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Drawer Account */}
        <div className="mt-auto border-t border-gray-100 px-2 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.16em] px-3 pt-2 pb-1">
            Account
          </p>

          {token ? (
            <>
              <Link
                to="/profile"
                onClick={() => setVisible(false)}
                className="flex items-center gap-3 px-3 py-3 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <UserCircle
                  size={15}
                  strokeWidth={1.75}
                  className="text-gray-400"
                />
                My Profile
              </Link>
              <Link
                to="/"
                onClick={() => setVisible(false)}
                className="flex items-center gap-3 px-3 py-3 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <BarChart2
                  size={15}
                  strokeWidth={1.75}
                  className="text-gray-400"
                />
                Dashboard
              </Link>
              <div className="mx-3 my-1 border-t border-gray-100" />
              <button
                onClick={() => {
                  logout();
                  setVisible(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-3 text-[13px] text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={15} strokeWidth={1.75} className="text-red-400" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setVisible(false)}
                className="flex items-center gap-3 px-3 py-3 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <User size={15} strokeWidth={1.75} className="text-gray-400" />
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setVisible(false)}
                className="flex items-center justify-center gap-2 mx-3 mt-2 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
