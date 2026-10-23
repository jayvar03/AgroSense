import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const FOOTER_LINKS = [
  { to: '/crop-recommendation', label: 'Crop Advisor' },
  { to: '/soil-restoration', label: 'Soil Health' },
  { to: '/disease-detection', label: 'Disease Scanner' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200/80 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">AgroSense</span>
            <span className="text-xs text-slate-400 hidden sm:inline">• Smart Agriculture Intelligence</span>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs sm:text-sm font-medium text-slate-600">
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="hover:text-emerald-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-400 text-center md:text-right">
            © {currentYear} AgroSense. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
