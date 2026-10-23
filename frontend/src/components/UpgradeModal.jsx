import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const UpgradeModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const { data } = await api.get('/api/payment-status');
        setPaymentInfo(data);
      } catch {
        setPaymentInfo({ payments_enabled: false, price_inr: 99 });
      }
    };

    checkPaymentStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!paymentInfo?.payments_enabled) {
        setError('Razorpay payment gateway is not configured on the server.');
        setLoading(false);
        return;
      }

      const { data: order } = await api.post('/api/create-order');
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        setError('Could not load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'AgroSense Pro',
        description: 'Unlimited AI Disease Detection & Farming Analytics',
        theme: { color: '#16a34a' },
        prefill: {
          name: user?.username ?? '',
          email: user?.email ?? '',
        },
        handler: async (response) => {
          try {
            const { data: verifyRes } = await api.post('/api/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              updateUser({ is_pro: true });
              setSuccess(true);
              onSuccess?.();
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            setError(getErrorMessage(err, 'Failed to verify payment.'));
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      setError(getErrorMessage(err, 'Payment initialization failed.'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
              Welcome to AgroSense Pro! <Sparkles className="w-6 h-6 text-amber-500" />
            </h3>
            <p className="text-sm text-slate-600">
              Unlimited AI leaf disease detections, advanced agronomic advice, and priority features are now fully unlocked.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white mx-auto shadow-md shadow-amber-500/20">
                <Crown className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Upgrade to AgroSense Pro</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Unlock unrestricted AI tools and protect your farm all season.
              </p>
            </div>

            {/* Pricing Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">30-Day Pro Pass</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-emerald-950">₹99</span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
            </div>

            {/* Benefits List */}
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><b>Unlimited</b> leaf disease scans (bypass 3 free scan limit)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant downloadable PDF diagnosis reports</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full historical timeline of all predictions & rotations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-time Agmarknet mandi rates integration</span>
              </li>
            </ul>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleUpgrade}
                disabled={loading || !paymentInfo?.payments_enabled}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Pay ₹99 via Razorpay
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
