import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Crown, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Tractor
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

const INITIAL_PROFILE = {
  username: '',
  email: '',
  phone: '',
  location: '',
  about: '',
};

const FREE_SCAN_LIMIT = 3;

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState(INITIAL_PROFILE);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile');
      const u = data.user;
      if (u) {
        setProfileData(u);
        setFormData({
          username: u.username ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          location: u.location ?? '',
          about: u.about ?? '',
        });
        updateUser(u);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch user profile.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await api.put('/api/profile', formData);
      setSuccess('Profile updated successfully!');
      updateUser(data.user);
      setProfileData(data.user);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save profile changes.'));
    } finally {
      setSaving(false);
    }
  };

  const activeUser = profileData ?? user;
  const isPro = Boolean(activeUser?.is_pro);
  const scansUsed = activeUser?.disease_detection_uses ?? 0;
  const scansRemaining = Math.max(0, FREE_SCAN_LIMIT - scansUsed);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <UserIcon className="w-4 h-4 text-emerald-600" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
          Farmer Profile
          <Tractor className="w-8 h-8 text-emerald-700 inline shrink-0" />
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Manage your personal details, farm location, and AgroSense plan status.
        </p>
      </div>

      {/* Subscription Plan Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-emerald-800 via-green-800 to-teal-900 text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-emerald-100">
                  Plan Status
                </span>
                {isPro ? (
                  <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950">
                    <Crown className="w-3.5 h-3.5" /> PRO ACTIVE
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/30 text-white">
                    FREE TIER
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                {isPro ? (
                  <>
                    AgroSense Pro Member
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </>
                ) : (
                  'Free Farmer Tier'
                )}
              </h2>
              <p className="text-emerald-100 text-sm mt-1 max-w-lg">
                {isPro
                  ? 'Unlimited AI leaf disease detections, advanced agronomic advice, and full history are enabled.'
                  : `You get 3 free AI leaf disease scans on the free tier. (${scansRemaining} scan${scansRemaining === 1 ? '' : 's'} remaining)`}
              </p>
            </div>

            {!isPro && (
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                className="self-start sm:self-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-sm shadow-md transition flex items-center gap-2 shrink-0 hover:scale-105"
              >
                <Crown className="w-4 h-4 text-amber-900" />
                Upgrade to Pro (₹99)
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Usage Meter for Free Tier */}
          {!isPro && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
                <span>Free Leaf Disease Scans</span>
                <span>{Math.min(scansUsed, FREE_SCAN_LIMIT)} / {FREE_SCAN_LIMIT} Used</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-950/40 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    scansUsed >= FREE_SCAN_LIMIT ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (scansUsed / FREE_SCAN_LIMIT) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Farm Location / District
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Pune, Maharashtra"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Farm Description / Notes
              </label>
              <textarea
                name="about"
                rows="3"
                placeholder="Details about your farm size, primary soil type, or crops usually grown..."
                value={formData.about}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
              />
            </div>

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          fetchProfile();
        }}
      />
    </div>
  );
};

export default Profile;
