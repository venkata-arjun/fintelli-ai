import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  ShieldCheck,
  BarChart3,
  PieChart,
  Headset,
  ArrowUpRight,
} from "lucide-react";
import contactImg from "../assets/contact_img.jpg";
import Footer from "../components/Footer";

/* ─────────────────────────────────────────
   Shared Section Header
───────────────────────────────────────── */
const SectionHeader = ({ label, title, subtitle }) => (
  <div className="flex flex-col items-center text-center gap-3 mb-16">
    <div className="flex items-center gap-3 w-full max-w-xs">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap text-gray-400">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight max-w-2xl">
      {title}
    </h1>
    {subtitle && (
      <p className="text-[15px] text-gray-500 leading-7 max-w-lg">{subtitle}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────
   Sub-section label
───────────────────────────────────────── */
const SubLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="flex-1 h-px bg-gray-100" />
    <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-gray-400 whitespace-nowrap">
      {children}
    </span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const Contact = () => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
          {/* ── Page Heading ── */}
          <SectionHeader
            label="Support"
            title="Get in touch"
            subtitle="Have a question about your account, budgeting, or expense tracking? We're here and happy to help."
          />

          {/* Content grid */}
          <div className="grid lg:grid-cols-[520px_1fr] gap-16 items-start">
            {/* Left — full image */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <img
                src={contactImg}
                alt="Contact Fintelli AI"
                className="w-full h-full object-cover min-h-[500px] lg:min-h-[720px]"
              />
            </div>

            {/* Right — all info */}
            <div className="flex flex-col gap-10">
              {/* Office */}
              <div>
                <SubLabel>Our Office</SubLabel>
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin
                      size={14}
                      strokeWidth={1.75}
                      className="text-gray-500"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px]">
                      Fintelli AI
                    </h3>
                    <p className="mt-1.5 text-[13px] text-gray-500 leading-6">
                      Bhimavaram, Andhra Pradesh, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Why Fintelli */}
              <div>
                <SubLabel>Why Fintelli AI</SubLabel>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: BarChart3, label: "Smart expense tracking" },
                    { icon: ShieldCheck, label: "Secure data storage" },
                    { icon: PieChart, label: "Budget analytics" },
                    { icon: Headset, label: "Dedicated support" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <Icon
                        size={15}
                        strokeWidth={1.75}
                        className="text-gray-500 flex-shrink-0"
                      />
                      <span className="text-[13px] font-medium text-gray-700">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get in touch */}
              {/* Get in touch */}
              <div>
                <SubLabel>Get in Touch</SubLabel>

                <div className="flex flex-col gap-3">
                  <a
                    href="tel:+919876543210"
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <Phone
                          size={14}
                          strokeWidth={1.75}
                          className="text-white"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                          Call us
                        </p>

                        <p className="mt-0.5 text-[13px] font-semibold text-gray-800">
                          +91 98765 43210
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      size={15}
                      strokeWidth={1.75}
                      className="text-gray-300 transition-colors group-hover:text-gray-600"
                    />
                  </a>

                  <a
                    href="mailto:support@fintelliai.com"
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <Mail
                          size={14}
                          strokeWidth={1.75}
                          className="text-white"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                          Email us
                        </p>

                        <p className="mt-0.5 text-[13px] font-semibold text-gray-800">
                          support@fintelliai.com
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      size={15}
                      strokeWidth={1.75}
                      className="text-gray-300 transition-colors group-hover:text-gray-600"
                    />
                  </a>
                </div>
              </div>

              {/* Support hours */}
              <div>
                <SubLabel>Support Hours</SubLabel>
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock3
                      size={14}
                      strokeWidth={1.75}
                      className="text-gray-500"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px]">
                      Monday – Saturday
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      9:00 AM – 8:00 PM IST
                    </p>
                    <p className="text-[13px] text-gray-400 leading-6 mt-3 max-w-sm">
                      Need help with budgets, transactions, or managing your
                      finances? Our support team aims to respond within a few
                      hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;
