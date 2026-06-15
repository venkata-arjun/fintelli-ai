import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  Activity,
  Wallet,
  Clock,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { formatCurrency, timeAgo } from "../utils/format.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import InsightCard from "../components/InsightCard.jsx";
import KpiCard from "../components/KpiCard.jsx";

const ActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  generating,
  lastGenerated,
}) => (
  <button
    onClick={onClick}
    disabled={generating}
    className="group relative overflow-hidden p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-50 text-left hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
        <Icon size={17} strokeWidth={1.75} className="text-white" />
      </div>
      {generating ? (
        <Spinner size="sm" />
      ) : (
        <Sparkles
          size={16}
          strokeWidth={1.75}
          className="text-gray-300 group-hover:text-gray-500 transition-colors"
        />
      )}
    </div>
    <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{title}</h3>
    <p className="text-[14px] sm:text-[15px] text-gray-500 mb-5 leading-7">
      {description}
    </p>
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-700 group-hover:text-gray-900 transition-colors">
        {generating ? "Analyzing..." : "Generate Insight"}
        {!generating && (
          <ArrowRight
            size={14}
            strokeWidth={1.75}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        )}
      </span>
      {lastGenerated && (
        <span className="text-[11px] text-gray-400">
          Last: {timeAgo(lastGenerated)}
        </span>
      )}
    </div>
  </button>
);

const Insights = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATHS.INSIGHTS.LIST);
      setInsights(res.data);
    } catch (err) {
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const generate = async (type) => {
    setGenerating(type);
    try {
      await api.post(API_PATHS.INSIGHTS.GENERATE, { type });
      toast.success("Insight generated");
      fetchInsights();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate");
    } finally {
      setGenerating(null);
    }
  };

  const stats = useMemo(() => {
    const latestMonthly = insights.find(
      (i) => i.insight_type === "monthly_summary",
    );
    const monthly = latestMonthly?.content_json;
    const savingsOpportunity =
      typeof monthly?.estimatedAdditionalSavings === "number"
        ? monthly.estimatedAdditionalSavings
        : null;

    return {
      total: insights.length,
      healthScore: monthly?.healthScore ?? null,
      savingsOpportunity,
      lastAt: insights[0]?.created_at || null,
      latestMonthlyAt: latestMonthly?.created_at,
      latestTipsAt: insights.find((i) => i.insight_type === "savings_tips")
        ?.created_at,
    };
  }, [insights]);

  const healthAccent =
    stats.healthScore == null
      ? "slate"
      : stats.healthScore >= 70
        ? "emerald"
        : stats.healthScore >= 40
          ? "amber"
          : "rose";

  return (
    <div className="space-y-6 sm:space-y-10">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
          Analysis
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          AI Insights
        </h1>
        <p className="text-[14px] sm:text-[15px] text-gray-500 leading-7 mt-1">
          Get personalized money insights - Understand your spending and save
          smarter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          label="Generated"
          value={stats.total}
          icon={Sparkles}
          accent="violet"
        />
        <KpiCard
          label="Health Score"
          value={stats.healthScore != null ? `${stats.healthScore}/100` : "—"}
          icon={Activity}
          accent={healthAccent}
        />
        {stats.savingsOpportunity > 0 && (
          <KpiCard
            label="Savings Opportunity"
            value={`${formatCurrency(stats.savingsOpportunity, currency).replace(/\.00$/, "")}/mo`}
            icon={Wallet}
            accent="orange"
          />
        )}
        <KpiCard
          label="Last Analysis"
          value={stats.lastAt ? timeAgo(stats.lastAt) : "—"}
          icon={Clock}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <ActionCard
          title="Monthly Summary"
          description="A full breakdown of this month's income, expenses, and a personalized health score with actionable recommendations."
          icon={TrendingUp}
          onClick={() => generate("monthly_summary")}
          generating={generating === "monthly_summary"}
          lastGenerated={stats.latestMonthlyAt}
        />
        <ActionCard
          title="Savings Tips"
          description="Tailored, ranked ways to save money based on your top spending categories from the last 30 days."
          icon={Lightbulb}
          onClick={() => generate("savings_tips")}
          generating={generating === "savings_tips"}
          lastGenerated={stats.latestTipsAt}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Recent Analyses
          </h2>
          {!loading && insights.length > 0 && (
            <span className="text-[11px] text-gray-400">
              {insights.length}{" "}
              {insights.length === 1 ? "analysis" : "analyses"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50">
            <EmptyState
              icon={Sparkles}
              title="No insights yet"
              description="Generate your first AI analysis using one of the cards above."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((i, idx) => (
              <InsightCard key={i.id} insight={i} defaultExpanded={idx === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
