import { Link } from "react-router-dom";
import { BarChart2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-24 sm:mt-32 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <span className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <BarChart2 size={15} strokeWidth={1.75} className="text-white" />
            </span>
            <span className="text-[17px] font-bold text-gray-900">
              Fintelli AI
            </span>
          </Link>

          <p className="mt-5 max-w-sm text-[13px] leading-7 text-gray-500">
            Fintelli AI helps you track expenses, manage budgets, and understand
            your financial habits through a clean and intuitive personal finance
            dashboard.
          </p>
        </div>

        {/* Company */}
        <div>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Company
          </p>
          <ul className="flex flex-col gap-3">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/login", label: "Login" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Get in Touch
          </p>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="tel:+919876543210"
                className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
              >
                +91 98765 43210
              </a>
            </li>
            <li>
              <a
                href="mailto:support@fintelliai.com"
                className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
              >
                support@fintelliai.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-gray-400">
            © 2026 Fintelli AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
            <Link
              to="/privacy"
              className="hover:text-gray-900 transition-colors duration-150"
            >
              Privacy Policy
            </Link>
            <span className="w-px h-3 bg-gray-200" />
            <Link
              to="/terms"
              className="hover:text-gray-900 transition-colors duration-150"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
