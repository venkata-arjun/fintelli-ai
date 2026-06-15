import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BarChart2, Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

const inputClass =
  "w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all duration-200 placeholder:text-gray-400";

const labelClass =
  "text-[10.5px] font-semibold tracking-[0.14em] uppercase text-gray-400";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    currency: "INR",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordsMatched =
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (form.password.length < 6) newErrors.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col bg-white"
    >
      {/* ── Top Bar ── */}
      <div className="w-full px-5 sm:px-8 py-6 flex justify-center sm:justify-start">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <span className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
            <BarChart2 size={16} strokeWidth={1.75} className="text-white" />
          </span>
          <span className="font-bold text-[17px] text-gray-900">
            Fintelli AI
          </span>
        </Link>
      </div>

      {/* ── Centered Form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-6">
        <div className="w-full max-w-[420px]">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-3 text-center">
            Get started
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2 text-center">
            Create account
          </h2>
          <p className="text-[14px] text-gray-500 mb-10 text-center">
            Set up your Fintelli AI account in seconds.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 pl-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Email</label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
              {errors.email && (
                <p className="text-[11px] text-red-500 pl-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={14} strokeWidth={1.75} />
                  ) : (
                    <Eye size={14} strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 pl-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                placeholder="Re-enter your password"
                className={inputClass}
              />
              {errors.confirmPassword ? (
                <p className="text-[11px] text-red-500 pl-1">
                  {errors.confirmPassword}
                </p>
              ) : (
                passwordsMatched && (
                  <p className="flex items-center gap-1 text-[11px] text-emerald-600 pl-1">
                    <Check size={11} strokeWidth={2.5} /> Passwords match
                  </p>
                )
              )}
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Currency</label>
              <div className="relative">
                <select
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-[12px] font-semibold tracking-[0.08em] uppercase transition-all duration-200 mt-1
                ${
                  loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-black active:scale-[0.985] shadow-sm shadow-gray-200"
                }`}
            >
              {loading ? (
                <>
                  <Spinner size="sm" /> Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[13px] text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gray-900 font-semibold hover:underline transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-center gap-6 text-[11.5px] text-gray-400 px-5 py-6">
        <a className="hover:text-gray-900 transition cursor-pointer">
          Privacy Policy
        </a>
        <a className="hover:text-gray-900 transition cursor-pointer">Terms</a>
        <a className="hover:text-gray-900 transition cursor-pointer">FAQ</a>
      </div>
    </motion.div>
  );
};

export default Register;
