import React from "react";
import {
  TrendingUp,
  Wallet,
  Sparkles,
  PieChart,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import aboutImg from "../assets/about_img.png";
import Footer from "../components/Footer";

const values = [
  {
    icon: TrendingUp,
    title: "Monthly Trends",
    desc: "Track spending patterns over time and understand where your money goes every month.",
  },
  {
    icon: Wallet,
    title: "Budget Tracker",
    desc: "Create budgets, monitor expenses, and stay within your financial goals effortlessly.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    desc: "Receive personalized recommendations and smart summaries to make better financial decisions.",
  },
];

const About = () => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
          {/* Hero */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-4">
              About Fintelli AI
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Smarter personal finance,
              <br />
              built for everyday life.
            </h1>

            <p className="mt-8 max-w-2xl mx-auto text-[16px] text-gray-500 leading-8">
              Fintelli AI helps you understand your money through a simple,
              beautiful, and organized experience that makes budgeting, expense
              tracking, and financial planning effortless.
            </p>
          </div>

          {/* Story */}
          <div className="grid lg:grid-cols-[420px_1fr] gap-12 items-start mb-24">
            {/* Full image left */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 h-full">
              <img
                src={aboutImg}
                alt="About Fintelli AI"
                className="w-full h-full object-cover min-h-[420px] lg:min-h-[520px]"
              />
            </div>

            {/* Right content */}
            <div className="flex flex-col gap-10">
              {/* Our story */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <HeartHandshake
                    size={15}
                    strokeWidth={1.75}
                    className="text-gray-400"
                  />
                  <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-gray-400">
                    Our Story
                  </p>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-6">
                  Finance should be simple, not stressful.
                </h2>

                <div className="flex flex-col gap-5 text-[14px] text-gray-500 leading-7">
                  <p>
                    Fintelli AI was created to make personal finance accessible
                    to everyone. Instead of overwhelming dashboards and
                    complicated reports, we focus on delivering clarity and
                    simplicity.
                  </p>
                  <p>
                    From tracking daily expenses to monitoring budgets and
                    understanding spending patterns, every feature is designed
                    to help you build better financial habits.
                  </p>
                  <p>
                    Our goal is to empower people with the confidence to manage
                    their money through clean design, meaningful insights, and a
                    reliable experience.
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: "10K+", label: "Active users" },
                  { value: "₹2Cr+", label: "Tracked monthly" },
                  { value: "99.9%", label: "Uptime" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-[12px] text-gray-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-100" />

              {/* CTA */}
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] uppercase text-gray-900 hover:gap-3 transition-all duration-200"
              >
                Get in touch
                <ArrowRight size={13} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Values */}
          {/* Values */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-4">
              Why Choose Us
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Built around simplicity and trust
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col gap-5 p-7 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                    <Icon
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
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default About;
