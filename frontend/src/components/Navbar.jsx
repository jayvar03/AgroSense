import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Wheat, 
  Layers, 
  ScanLine, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Sprout },
  { to: '/crop-recommendation', label: 'Crop Advisor', icon: Wheat },
  { to: '/soil-restoration', label: 'Soil Health', icon: Layers },
  { to: '/disease-detection', label: 'Leaf Scanner', icon: ScanLine },
  { to: '/history', label: 'History', icon: History, protected: true },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
                AgroSense
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon, protected: isProtected }) => {
              if (isProtected && !isAuthenticated) return null;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Side / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">
                    {user?.username}
                  </span>
                  {user?.is_pro ? (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">
                      <Crown className="w-3 h-3 text-amber-600" /> Pro
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold">
                      Free
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100/70 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 rounded-lg transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {NAV_LINKS.map(({ to, label, icon: Icon, protected: isProtected }) => {
            if (isProtected && !isAuthenticated) return null;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                {label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-800">{user?.username}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">{user?.is_pro ? 'PRO' : 'FREE'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
