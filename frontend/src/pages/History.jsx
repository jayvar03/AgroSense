import React, { useEffect, useState } from 'react';
import { 
  History as HistoryIcon, 
  Wheat, 
  Layers, 
  ScanLine, 
  Loader2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';

const FILTER_TABS = [
  { key: 'all', label: 'All Activities' },
  { key: 'crop_recommendation', label: 'Crop Advisor' },
  { key: 'soil_restoration', label: 'Soil Health' },
  { key: 'disease_detection', label: 'Leaf Scans' },
];

const History = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await api.get('/api/history', { params: { limit: 100 } });
        setItems(data.items ?? []);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your history.'));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const parseSolutionPoints = (solution) => {
    if (!solution) return [];
    if (Array.isArray(solution)) return solution.map((s) => String(s).trim()).filter(Boolean);
    const text = String(solution).trim();
    if (!text) return [];

    const inlineNumbered = text.split(/(?:^|\s+)(?=\d+[\.\)]\s+)/).map((s) => s.trim()).filter(Boolean);
    if (inlineNumbered.length > 1) {
      return inlineNumbered.map((item) => item.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean);
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return lines.map((l) => l.replace(/^(\d+[\.\)]|[-*•])\s+/, '').trim()).filter(Boolean);
    }

    return [text];
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <HistoryIcon className="w-4 h-4 text-emerald-600" />
          <span>Activity Timeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
          Your Advisory History
          <HistoryIcon className="w-8 h-8 text-emerald-600 inline shrink-0" />
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          All your past crop recommendations, rotation plans, and leaf disease analyses in one place.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              filter === key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your history...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No predictions recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Start by trying out the crop recommendation tool to see your predictions logged here automatically.
          </p>
          <Link
            to="/crop-recommendation"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition"
          >
            Try Crop Advisor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(({ id, type, input, result, created_at }) => (
            <div
              key={id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {type === 'crop_recommendation' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900">
                      <Wheat className="w-3.5 h-3.5" /> Crop Recommendation
                    </span>
                  )}
                  {type === 'soil_restoration' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900">
                      <Layers className="w-3.5 h-3.5" /> Soil Restoration
                    </span>
                  )}
                  {type === 'disease_detection' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-900">
                      <ScanLine className="w-3.5 h-3.5" /> Disease Detection
                    </span>
                  )}
                </div>

                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(created_at)}
                </span>
              </div>

              {/* Crop recommendation content */}
              {type === 'crop_recommendation' && (
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 capitalize">
                    {result?.crop}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">{result?.tip}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-500">
                    {Object.entries(input ?? {}).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-slate-100">
                        {k}: <b>{String(v)}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soil restoration content */}
              {type === 'soil_restoration' && (
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Harvested: <span className="capitalize text-emerald-700">{input?.last_crop}</span>
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Matched {result?.total_matches ?? result?.recommendations?.length ?? 0} rotation options.
                  </p>
                </div>
              )}

              {/* Disease detection content */}
              {type === 'disease_detection' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900">{result?.plant_name}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {result?.disease_name}
                    </span>
                    {result?.severity && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                        {result.severity}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 mt-2">
                    {parseSolutionPoints(result?.solution).slice(0, 3).map((pt, pIdx) => (
                      <div key={pIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold shrink-0">{pIdx + 1}.</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                    {parseSolutionPoints(result?.solution).length > 3 && (
                      <p className="text-xs text-slate-400 italic">
                        +{parseSolutionPoints(result?.solution).length - 3} more recommended steps
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
