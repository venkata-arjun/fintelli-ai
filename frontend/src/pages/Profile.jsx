import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import { API_PATHS } from "../utils/apiPaths";

/* ─────────────────────────────────────────
   Field
───────────────────────────────────────── */
const Field = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly,
  hint,
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-gray-400">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon
          size={13}
          strokeWidth={1.75}
          className="absolute left-3.5 text-gray-400 pointer-events-none"
        />
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full pl-9 ${isPassword ? "pr-10" : "pr-4"} py-3 text-[13px] rounded-xl border transition-all duration-200 outline-none font-normal
            ${
              readOnly
                ? "bg-gray-50 border-gray-100 text-gray-400 cursor-default select-none"
                : "bg-white border-gray-200 text-gray-800 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 text-gray-300 hover:text-gray-500 transition-colors"
          >
            {show ? (
              <EyeOff size={13} strokeWidth={1.75} />
            ) : (
              <Eye size={13} strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-gray-400 pl-1">{hint}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────
   Section
───────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div className="flex flex-col gap-5">
    <div className="flex items-center gap-3">
      <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-gray-400">
        {title}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────
   Stat card
───────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, iconClass, valueClass }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-gray-100 shadow-sm shadow-gray-100">
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconClass}`}
    >
      <Icon size={15} strokeWidth={1.75} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400">
        {label}
      </p>
      <p
        className={`text-base font-semibold tracking-tight mt-1 truncate leading-none ${valueClass || "text-gray-800"}`}
      >
        {value}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   AI Chat Panel
───────────────────────────────────────── */
const AIChatPanel = ({ onClose, summary, userName, currency }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi ${userName || "there"}! I'm your financial AI assistant. Ask me anything about your spending, savings, or financial health.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const systemPrompt = `You are Fintelli AI, a strict personal finance assistant embedded in a financial dashboard.

The user's financial summary:
- Net Balance: ${fmt(summary?.netBalance)}
- Total Income: ${fmt(summary?.totalIncome)}
- Total Expenses: ${fmt(summary?.totalExpense)}
- Savings Rate: ${summary?.totalIncome ? Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100) : 0}%

STRICT RULES:
1. You ONLY answer questions related to: personal finance, income, expenses, budgeting, savings, investments, money management, financial planning, tax basics, and math/percentage calculations.
2. If the user asks ANYTHING outside these topics (e.g. cooking, sports, coding, general knowledge, entertainment, relationships, health), respond with EXACTLY this JSON:
   {"off_topic": true}
3. For valid finance questions, respond naturally in plain text. Keep replies under 80 words, friendly and actionable.
4. Never break character. Never discuss other topics even if the user insists.`;

  const OFF_TOPIC_MESSAGES = [
    "I'm focused on your finances! Ask me about budgeting, savings, expenses, or anything money-related.",
    "That's outside my expertise. I'm here to help with income tracking, savings goals, and financial planning.",
    "I only handle finance questions. Try asking about your spending, savings rate, or budget tips!",
  ];

  const ERROR_MESSAGES = [
    "Our AI assistant is taking a short break. Please try again in a moment.",
    "Couldn't connect to the assistant right now. Your data is safe — please retry shortly.",
    "The assistant is temporarily unavailable. Try again in a few seconds.",
  ];

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const apiMessages = next.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const res = await api.post("/insights/chat", {
        system: systemPrompt,
        messages: apiMessages,
      });

      const raw = res.data?.reply || "";

      // Check if model flagged it as off-topic
      let reply;
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.off_topic) {
          reply =
            OFF_TOPIC_MESSAGES[
              Math.floor(Math.random() * OFF_TOPIC_MESSAGES.length)
            ];
        }
      } catch {
        // Not JSON — it's a normal finance reply
        reply = raw;
      }

      if (!reply) {
        reply = "I'm sorry, I couldn't generate a response. Please try again.";
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      const errorMsg =
        ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
      setMessages((prev) => [...prev, { role: "assistant", text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden"
        style={{ maxHeight: "75vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Sparkles size={13} strokeWidth={1.75} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900 leading-none">
                AI Assistant
              </p>
              <p className="text-[10.5px] text-gray-400 mt-0.5">
                Powered by Fintelli AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed
                  ${
                    m.role === "user"
                      ? "bg-gray-900 text-white rounded-br-sm"
                      : "bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-sm"
                  }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Auto-scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your finances…"
            className="flex-1 text-[12.5px] px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-gray-400 focus:bg-white transition-all placeholder:text-gray-300"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              ${
                input.trim() && !loading
                  ? "bg-gray-900 text-white hover:bg-black"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
          >
            <Send size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Profile
───────────────────────────────────────── */
const Profile = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [profileRes, summaryRes] = await Promise.all([
          api.get(API_PATHS.USER.PROFILE),
          api.get(API_PATHS.DASHBOARD.OVERALL_SUMMARY),
        ]);
        const u = profileRes.data;
        setForm({
          name: u.name || "",
          phone: u.phone || "",
          location: u.location || "",
        });
        setSummary(summaryRes.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [user]);

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPass = (key) => (e) =>
    setPasswords((p) => ({ ...p, [key]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const res = await api.post(API_PATHS.USER.UPDATE_PROFILE, {
        name: form.name,
        phone: form.phone,
        location: form.location,
      });
      const u = res.data;
      setForm({
        name: u.name || "",
        phone: u.phone || "",
        location: u.location || "",
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwords.next.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      setPassLoading(true);
      await api.post(API_PATHS.USER.CHANGE_PASSWORD, {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      toast.success("Password updated");
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setPassLoading(false);
    }
  };

  /* ── password strength ── */
  const pwLen = passwords.next.length;
  const strength =
    pwLen === 0
      ? null
      : pwLen < 6
        ? { label: "Too short", bars: 1, barColor: "bg-red-300" }
        : pwLen < 10
          ? { label: "Fair", bars: 2, barColor: "bg-amber-400" }
          : { label: "Strong", bars: 4, barColor: "bg-emerald-400" };

  /* ── derived ── */
  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const currency = user?.currency || "INR";

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n || 0);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const netBalance = summary ? summary.netBalance : null;
  const totalIncome = summary ? summary.totalIncome : null;
  const totalExpense = summary ? summary.totalExpense : null;
  const balancePositive = (netBalance ?? 0) >= 0;

  if (fetching) {
    return (
      <div className="border-t border-gray-100 pt-10 pb-16 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-[12px] text-gray-400 tracking-wide">
            Loading profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showAI && (
        <AIChatPanel
          onClose={() => setShowAI(false)}
          summary={summary}
          userName={form.name}
          currency={currency}
        />
      )}

      <div className="border-t border-gray-100 pt-10 pb-20">
        <div className="max-w-lg mx-auto flex flex-col gap-10">
          {/* ── Identity block ── */}
          <div className="flex flex-row items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[15px] font-semibold tracking-wider">
                {initials}
              </span>
            </div>

            {/* Name + email + AI button */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10.5px] tracking-[0.2em] uppercase text-gray-400 font-medium mb-0.5">
                    Account
                  </p>
                  <h1 className="text-[1.45rem] font-semibold leading-tight tracking-tight text-gray-900 truncate">
                    {form.name || "My Account"}
                  </h1>
                  <p className="text-[13px] text-gray-400 mt-0.5 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Member since {memberSince}
                  </p>
                </div>

                {/* AI Button */}
                <button
                  onClick={() => setShowAI(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm transition-all duration-200 flex-shrink-0 group"
                >
                  <Sparkles
                    size={11}
                    strokeWidth={1.75}
                    className="text-gray-400 group-hover:text-gray-700 transition-colors"
                  />
                  <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-gray-400 group-hover:text-gray-700 transition-colors">
                    Ask AI
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Net Balance"
              value={netBalance !== null ? fmt(netBalance) : "—"}
              icon={Wallet}
              iconClass={
                balancePositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }
              valueClass={balancePositive ? "text-emerald-600" : "text-red-500"}
            />
            <StatCard
              label="Total Income"
              value={totalIncome !== null ? fmt(totalIncome) : "—"}
              icon={TrendingUp}
              iconClass="bg-blue-50 text-blue-600"
              valueClass="text-gray-800"
            />
            <StatCard
              label="Total Spent"
              value={totalExpense !== null ? fmt(totalExpense) : "—"}
              icon={TrendingDown}
              iconClass="bg-orange-50 text-orange-500"
              valueClass="text-gray-800"
            />
          </div>

          {/* ── Personal Details ── */}
          <Section title="Personal Details">
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  icon={User}
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="Your name"
                />
                <Field
                  label="Phone"
                  icon={Phone}
                  value={form.phone}
                  onChange={setField("phone")}
                  placeholder="+91 00000 00000"
                />
              </div>
              <Field
                label="Email"
                icon={Mail}
                value={user?.email || ""}
                readOnly
                hint="Registered email cannot be changed."
              />
              <Field
                label="Location"
                icon={MapPin}
                value={form.location}
                onChange={setField("location")}
                placeholder="City, State"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className={`flex items-center gap-2 text-[11.5px] tracking-[0.1em] font-semibold px-6 py-2.5 rounded-full uppercase transition-all duration-200
                    ${
                      saveLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-black active:scale-[0.985] shadow-sm shadow-gray-200"
                    }`}
                >
                  <Check size={12} strokeWidth={2.5} />
                  {saveLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </Section>

          {/* ── Security ── */}
          <Section title="Security">
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                <ShieldCheck
                  size={14}
                  strokeWidth={1.75}
                  className="text-gray-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  Choose a strong password with at least 6 characters. You'll be
                  asked to re-enter your current password to confirm.
                </p>
              </div>

              <Field
                label="Current Password"
                icon={Lock}
                type="password"
                value={passwords.current}
                onChange={setPass("current")}
                placeholder="••••••••"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="New Password"
                  icon={Lock}
                  type="password"
                  value={passwords.next}
                  onChange={setPass("next")}
                  placeholder="••••••••"
                />
                <Field
                  label="Confirm Password"
                  icon={Lock}
                  type="password"
                  value={passwords.confirm}
                  onChange={setPass("confirm")}
                  placeholder="••••••••"
                />
              </div>

              {strength && (
                <div className="flex items-center gap-2 pl-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 w-8 rounded-full transition-all duration-300 ${i <= strength.bars ? strength.barColor : "bg-gray-100"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {strength.label}
                  </span>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={passLoading}
                  className={`flex items-center gap-2 text-[11.5px] tracking-[0.1em] font-semibold px-6 py-2.5 rounded-full uppercase transition-all duration-200
                    ${
                      passLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-black active:scale-[0.985] shadow-sm shadow-gray-200"
                    }`}
                >
                  <Check size={12} strokeWidth={2.5} />
                  {passLoading ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </Section>
        </div>
      </div>
    </>
  );
};

export default Profile;
