import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
  PieChart,
  ArrowRight,
  Wallet,
  CheckCircle2,
  BadgeCheck,
  Target,
  Sparkles,
} from "lucide-react";
import Footer from "../components/Footer";

/* ═══════════════════════════════════
   UTILITY HOOK
═══════════════════════════════════ */
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ═══════════════════════════════════
   SHARED — Section Header
═══════════════════════════════════ */
const SectionHeader = ({ label, title, subtitle, highlight, dark = false }) => (
  <div className="flex flex-col items-center text-center gap-3 mb-12">
    {/* Label with flanking lines */}
    <div className="flex items-center gap-3 w-full max-w-xs">
      <div className={`flex-1 h-px ${dark ? "bg-white/10" : "bg-gray-100"}`} />
      <span
        className={`text-[10.5px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap ${dark ? "text-gray-500" : "text-gray-400"}`}
      >
        {label}
      </span>
      <div className={`flex-1 h-px ${dark ? "bg-white/10" : "bg-gray-100"}`} />
    </div>

    {/* Main heading */}
    <h2
      className={`text-3xl sm:text-4xl font-bold tracking-tight leading-snug max-w-2xl ${dark ? "text-white" : "text-gray-900"}`}
    >
      {title}
      {highlight && (
        <>
          {" "}
          <span className="relative inline-block">
            {highlight}
            <span
              className={`absolute bottom-[-3px] left-0 w-full h-[3px] rounded-full ${dark ? "bg-white/40" : "bg-gray-900"}`}
            />
          </span>{" "}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold align-middle relative -top-1 ${
              dark
                ? "bg-white/10 border-white/20 text-gray-300"
                : "bg-gray-100 border-gray-200 text-gray-500"
            }`}
          >
            <Sparkles size={10} strokeWidth={1.75} />
            AI
          </span>
        </>
      )}
    </h2>

    {/* Subtitle */}
    {subtitle && (
      <p
        className={`text-[14px] leading-7 max-w-lg ${dark ? "text-gray-400" : "text-gray-500"}`}
      >
        {subtitle}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════════
   HERO
═══════════════════════════════════ */

const typingText = "Powered by AI for Smarter Decisions";

const Hero = () => {
  const [ref, visible] = useInView(0.05);

  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let timer;

    if (!deleting) {
      if (displayText.length < typingText.length) {
        timer = setTimeout(() => {
          setDisplayText(typingText.slice(0, displayText.length + 1));
        }, 70);
      } else {
        timer = setTimeout(() => {
          setDeleting(true);
        }, 1800);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(typingText.slice(0, displayText.length - 1));
        }, 35);
      } else {
        setDeleting(false);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, deleting]);

  return (
    <section ref={ref} className="bg-white border-b border-gray-100">
      <div
        className="max-w-5xl mx-auto px-5 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "all .6s ease",
        }}
      >
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-600 text-[13px] font-medium mb-8">
          <Wallet size={14} strokeWidth={1.75} />
          Personal Finance Made Simple
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl mx-auto text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Track Expenses,
          <span className="block mt-2 text-gray-400 font-semibold min-h-[1.2em]">
            {displayText}
            <span className="ml-1 inline-block animate-pulse text-gray-400">
              |
            </span>
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto mt-7 text-[15px] text-gray-500 leading-8">
          Organize your income and expenses, track your budgets, and use AI
          insights to understand your spending and make better financial
          decisions.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white shadow-sm shadow-gray-200 transition-all duration-200 hover:bg-black active:scale-[0.985]"
          >
            Get Started
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        {/* Bottom badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-[13px] text-gray-400">
          {[
            "Free to get started",
            "Secure data storage",
            "Clean & intuitive dashboard",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                strokeWidth={1.75}
                className="text-gray-400"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════
   FEATURES
═══════════════════════════════════ */
const features = [
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    desc: "View balances, expenses, budgets, and recent activity from a single organised dashboard.",
  },
  {
    icon: Wallet,
    title: "Expense Management",
    desc: "Record and organise transactions effortlessly to stay on top of your daily spending.",
  },
  {
    icon: PieChart,
    title: "Category Analytics",
    desc: "Visualise where your money goes with simple charts and category-wise summaries.",
  },
  {
    icon: Target,
    title: "Budget Planning",
    desc: "Set monthly spending limits and monitor your progress with real-time updates.",
  },
  {
    icon: TrendingUp,
    title: "Financial Reports",
    desc: "Track income, expenses, and savings trends to make smarter financial decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    desc: "Your financial information stays protected with modern security and encrypted storage.",
  },
];

const FeatureCard = ({ icon: Icon, title, desc, index, visible }) => (
  <div
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `all .5s ${index * 0.08}s ease`,
    }}
    className="flex flex-col gap-5 p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200"
  >
    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
      <Icon size={17} strokeWidth={1.75} className="text-gray-600" />
    </div>
    <div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-6">{desc}</p>
    </div>
  </div>
);

const Features = () => {
  const [ref, visible] = useInView();

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <SectionHeader
          label="Features"
          title="Everything you need to manage your finances, powered by AI"
          subtitle="Powerful tools designed to help you track expenses, stay on budget, and gain better visibility into your financial life."
        />
        <div ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              index={index}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════
   BENEFITS
═══════════════════════════════════ */
const benefits = [
  {
    icon: Wallet,
    title: "Expense Tracking",
    desc: "Monitor every transaction in one place with a clear and organised financial overview.",
  },
  {
    icon: PieChart,
    title: "Smart Budgeting",
    desc: "Create monthly budgets, track spending categories, and stay within your financial goals.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "Your financial information is protected with modern security standards and encrypted storage.",
  },
  {
    icon: BadgeCheck,
    title: "Simple Experience",
    desc: "A clean, intuitive interface designed to help you manage money without unnecessary complexity.",
  },
];

const Benefits = () => {
  const [ref, visible] = useInView();

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <SectionHeader
          label="Why Choose Fintelli"
          title="Everything you need to manage your money"
          subtitle="Built with simplicity in mind, Fintelli helps you track expenses, manage budgets, and understand your finances through a clean experience."
        />
        <div ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => (
            <div
              key={item.title}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `all .5s ${index * 0.08}s ease`,
              }}
              className="flex flex-col gap-5 p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                <item.icon
                  size={17}
                  strokeWidth={1.75}
                  className="text-gray-600"
                />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-6">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════
   CTA
═══════════════════════════════════ */
const CTA = () => {
  const [ref, visible] = useInView();

  return (
    <section className="max-w-6xl mx-auto px-5 lg:px-8 py-20">
      <div
        ref={ref}
        className="rounded-2xl bg-gray-900 px-6 py-14 sm:px-10 sm:py-16 lg:px-16"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all .5s ease",
        }}
      >
        <SectionHeader
          label="Get Started Today"
          title="Take control of your finances"
          subtitle="Track expenses, manage budgets, and understand your spending with a simple dashboard designed to help you make better financial decisions."
          dark
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-gray-900 text-[13px] font-semibold tracking-[0.06em] uppercase hover:bg-gray-100 active:scale-[0.985] transition-all duration-200"
          >
            Get Started
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-white/20 text-white text-[13px] font-semibold tracking-[0.06em] uppercase hover:border-white/40 hover:bg-white/5 transition-all duration-200"
          >
            Log In
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════
   PAGE
═══════════════════════════════════ */
const HomePage = () => (
  <div className="min-h-screen bg-white font-sans antialiased">
    <Hero />
    <Features />
    <Benefits />
    <CTA />
    <Footer />
  </div>
);

export default HomePage;
