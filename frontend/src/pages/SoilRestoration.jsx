import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Loader2, 
  Sprout, 
  AlertTriangle, 
  FlaskConical, 
  ShieldCheck, 
  Leaf, 
  CheckCircle2,
  Info
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';

const POPULAR_CROPS = [
  'Rice (Paddy)', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Sorghum', 'Mustard'
];

const SoilRestoration = () => {
  const [cropInput, setCropInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (cropToQuery) => {
    const query = cropToQuery ?? cropInput;
    if (!query.trim()) return;

    setError(null);
    setMessage(null);
    setResults(null);
    setLoading(true);

    try {
      const { data } = await api.post('/api/soil-restoration', { last_crop: query });
      setResults(data.recommendations ?? []);
      setMessage(data.message ?? null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch soil restoration data.'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(cropInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Soil Nutrient Recovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
          Soil Restoration & Crop Rotation
          <Sprout className="w-8 h-8 text-emerald-600 inline shrink-0" />
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          What did you last harvest? We analyze nutrient depletions and recommend replenishing rotation crops, fertilizers, and organic matter.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Rice, Wheat, Maize, Cotton..."
              value={cropInput}
              onChange={(e) => setCropInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </>
            ) : (
              'Find Rotation Plan'
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-semibold text-slate-400">Popular:</span>
          {POPULAR_CROPS.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => {
                setCropInput(crop);
                handleSearch(crop);
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition"
            >
              {crop}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Empty / Not Found Message */}
      {message && results?.length === 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-center space-y-1">
          <Info className="w-6 h-6 mx-auto text-amber-600" />
          <p className="font-semibold text-sm">{message}</p>
          <p className="text-xs text-amber-700">Try searching for common names like "Rice", "Wheat", or "Maize".</p>
        </div>
      )}

      {/* Results Cards */}
      {results?.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Matching Rotation & Restoration Plans ({results.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {results.map((rec, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Crop</span>
                    <h3 className="text-2xl font-black text-slate-900 capitalize">{rec.harvested || cropInput}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                    <Sprout className="w-3.5 h-3.5" /> Optimal Rotation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deficiency */}
                  {rec.deficiency && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Soil Deficiency Caused
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{rec.deficiency}</p>
                    </div>
                  )}

                  {/* Recommended Next Crop */}
                  {rec.recommended_crop && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                        <Sprout className="w-4 h-4 text-emerald-600" /> Recommended Crop(s) to Sow
                      </div>
                      <p className="text-sm font-bold text-emerald-950">{rec.recommended_crop}</p>
                    </div>
                  )}
                </div>

                {/* Reason */}
                {rec.reason_for_recommended_crop && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Why this rotation works
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {rec.reason_for_recommended_crop}
                    </p>
                  </div>
                )}

                {/* Fertilizers & Organic Matter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {rec.fertilizers && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-purple-600" /> Fertilizers
                      </span>
                      <p className="text-xs text-slate-600 leading-normal">{rec.fertilizers}</p>
                    </div>
                  )}

                  {rec.pesticides && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Pest Control
                      </span>
                      <p className="text-xs text-slate-600 leading-normal">{rec.pesticides}</p>
                    </div>
                  )}

                  {rec.organic_matter && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Leaf className="w-4 h-4 text-emerald-600" /> Organic Matter
                      </span>
                      <p className="text-xs text-slate-600 leading-normal">{rec.organic_matter}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilRestoration;
