import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BarChart2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-white px-5 py-10"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <span className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <BarChart2 size={18} strokeWidth={1.75} className="text-white" />
          </span>

          <span className="font-bold text-xl text-gray-900">Fintelli AI</span>
        </Link>

        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-3 text-center">
          Welcome back
        </p>

        <h2 className="text-4xl font-bold text-gray-900 tracking-tight text-center mb-2">
          Sign in
        </h2>

        <p className="text-[14px] text-gray-500 text-center mb-10">
          Enter your credentials to access your account.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-gray-400">
              Email
            </label>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-gray-400">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-[13px] text-gray-800 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 focus:outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff size={15} strokeWidth={1.75} />
                ) : (
                  <Eye size={15} strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-1 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[12px] font-semibold uppercase tracking-[0.08em] transition-all ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-black"
            }`}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-gray-900 hover:underline"
          >
            Create one
          </Link>
        </p>

        <div className="mt-12 flex justify-center gap-6 text-[11px] text-gray-400">
          <a className="cursor-pointer hover:text-gray-900 transition">
            Privacy Policy
          </a>
          <a className="cursor-pointer hover:text-gray-900 transition">Terms</a>
          <a className="cursor-pointer hover:text-gray-900 transition">FAQ</a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
