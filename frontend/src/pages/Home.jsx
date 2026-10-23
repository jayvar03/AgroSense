import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wheat, 
  Layers, 
  ScanLine, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CloudSun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Wheat,
    title: 'Precision Crop Advisor',
    desc: 'Calculate the highest yielding crop for your field based on soil Nitrogen, Phosphorus, Potassium, pH, and local rainfall.',
    link: '/crop-recommendation',
    color: 'from-amber-500 to-yellow-400',
    tag: 'Machine Learning',
  },
  {
    icon: ScanLine,
    title: 'AI Leaf Disease Scanner',
    desc: 'Snap a leaf photo to diagnose plant diseases, evaluate severity, and get immediate organic or chemical remedies.',
    link: '/disease-detection',
    color: 'from-emerald-500 to-teal-400',
    tag: 'Computer Vision',
  },
  {
    icon: Layers,
    title: 'Soil Rotation & Health',
    desc: 'Replenish depleted soil nutrients. Discover ideal rotation crops, fertilizer recipes, and green manure options for your last harvest.',
    link: '/soil-restoration',
    color: 'from-blue-500 to-cyan-400',
    tag: 'Agronomy Data',
  },
  {
    icon: TrendingUp,
    title: 'Live Mandi Market Rates',
    desc: 'Access real-time commodity trading rates from government Mandis across India before choosing what to sow.',
    link: '/crop-recommendation',
    color: 'from-purple-500 to-indigo-400',
    tag: 'Agmarknet API',
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Next-Gen Agricultural Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Grow Smarter, Yield Higher with{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent">
            AgroSense AI
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          The all-in-one assistant for farmers. Predict optimal crops, diagnose leaf diseases from a photo, restore soil fertility, and check live mandi rates.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/crop-recommendation"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition hover:-translate-y-0.5"
            >
              Start Crop Recommendation
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition hover:-translate-y-0.5"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-xs transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 22 Indian Crops Supported
          </div>
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-emerald-600" /> GPS Live Weather Sync
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Fast & Accurate ML Models
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Empowering Every Farming Decision</h2>
          <p className="mt-2 text-slate-600">Everything you need to turn soil and weather into harvest success.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({ title, desc, link, color, tag, icon: Icon }) => (
            <div
              key={title}
              className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between border border-slate-200/80 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{desc}</p>
              </div>

              <Link
                to={link}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 group"
              >
                Explore Tool
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-green-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-96 h-96 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Ready to plan your next agricultural season?
            </h2>
            <p className="text-emerald-100 text-base mb-8">
              Join thousands of farmers using AgroSense to increase crop yield, reduce fertilizer waste, and prevent crop losses.
            </p>
            <Link
              to={isAuthenticated ? '/crop-recommendation' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition shadow-md"
            >
              {isAuthenticated ? 'Go to Crop Advisor' : 'Sign Up Free'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
