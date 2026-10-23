import React, { useState } from 'react';
import { 
  Wheat, 
  MapPin, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  TrendingUp
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';

const INITIAL_FORM = {
  N: '',
  P: '',
  K: '',
  ph: '',
  temperature: '',
  humidity: '',
  rainfall: '',
};

const SOIL_FIELDS = [
  { name: 'N', label: 'Nitrogen (N) kg/ha', placeholder: 'e.g. 90', min: '0', step: 'any' },
  { name: 'P', label: 'Phosphorus (P) kg/ha', placeholder: 'e.g. 42', min: '0', step: 'any' },
  { name: 'K', label: 'Potassium (K) kg/ha', placeholder: 'e.g. 43', min: '0', step: 'any' },
  { name: 'ph', label: 'Soil pH (4.5 - 9.0)', placeholder: 'e.g. 6.5', min: '4.5', max: '9.0', step: '0.01' },
];

const WEATHER_FIELDS = [
  { name: 'temperature', label: 'Temperature (°C)', placeholder: '10 - 45', min: '10', max: '45' },
  { name: 'humidity', label: 'Humidity (%)', placeholder: '14 - 95', min: '14', max: '95' },
  { name: 'rainfall', label: 'Rainfall (mm)', placeholder: '20 - 400', min: '20', max: '400' },
];

const CropRecommendation = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSuccess, setWeatherSuccess] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const [predictLoading, setPredictLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiData, setMandiData] = useState(null);
  const [mandiError, setMandiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Live weather detection via Open-Meteo
  const handleDetectWeather = () => {
    setWeatherError(null);
    setWeatherSuccess(false);

    if (!('geolocation' in navigator)) {
      setWeatherError('Geolocation is not supported by your browser.');
      return;
    }

    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&past_days=30&forecast_days=1&timezone=auto`;
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to fetch weather');
          const data = await res.json();

          const temp = data?.current?.temperature_2m;
          const humidity = data?.current?.relative_humidity_2m;
          const daily = data?.daily?.precipitation_sum ?? [];
          const totalRain = daily.reduce((sum, v) => sum + (Number(v) || 0), 0);
          const clampedRain = Math.min(400, Math.max(20, Math.round(totalRain)));

          setFormData((prev) => ({
            ...prev,
            temperature: temp != null ? String(temp) : prev.temperature,
            humidity: humidity != null ? String(humidity) : prev.humidity,
            rainfall: String(clampedRain),
          }));

          setWeatherSuccess(true);
        } catch {
          setWeatherError('Could not fetch weather for your location. Please enter values manually.');
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherLoading(false);
        setWeatherError('Location permission was denied. You can manually enter weather values.');
      },
      { timeout: 10000 }
    );
  };

  // Submit to ML model
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setMandiData(null);
    setMandiError(null);
    setPredictLoading(true);

    try {
      const payload = {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        ph: parseFloat(formData.ph),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        rainfall: parseFloat(formData.rainfall),
      };

      const { data } = await api.post('/api/predict', payload);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not calculate crop prediction. Please check your inputs.'));
    } finally {
      setPredictLoading(false);
    }
  };

  // Mandi rate fetch
  const handleFetchMandi = async (cropName) => {
    setMandiLoading(true);
    setMandiError(null);
    try {
      const { data } = await api.get('/api/mandi-price', { params: { crop: cropName } });
      setMandiData(data);
    } catch (err) {
      setMandiError(getErrorMessage(err, 'Failed to retrieve mandi price.'));
    } finally {
      setMandiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
          <Wheat className="w-4 h-4 text-amber-600" />
          <span>Machine Learning Agronomy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
          Smart Crop Recommendation
          <Wheat className="w-8 h-8 text-amber-500 inline shrink-0" />
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Enter your soil mineral levels and weather conditions to determine the crop with the highest yield potential.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Soil Section */}
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
              Soil Nutrient Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SOIL_FIELDS.map(({ name, label, placeholder, min, max, step }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    required
                    min={min}
                    max={max}
                    step={step}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Weather Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
                Environmental & Weather Parameters
              </h2>

              <button
                type="button"
                onClick={handleDetectWeather}
                disabled={weatherLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
              >
                {weatherLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Fetching weather...
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Auto-Fill My Local Weather
                  </>
                )}
              </button>
            </div>

            {weatherSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Weather and 30-day rainfall estimates retrieved from your location!</span>
              </div>
            )}

            {weatherError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{weatherError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WEATHER_FIELDS.map(({ name, label, placeholder, min, max }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    required
                    min={min}
                    max={max}
                    step="any"
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={predictLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/25 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {predictLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculating Best Match...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Recommend Best Crop
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Recommended Crop Choice
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-emerald-950 capitalize mt-1">
                {result.crop}
              </h2>
            </div>

            <button
              onClick={() => handleFetchMandi(result.crop)}
              disabled={mandiLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
            >
              {mandiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching Mandi Price...
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" /> Check Live Mandi Rates
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
              Agronomic Growing Advice
            </h3>
            <p className="text-sm sm:text-base text-slate-800 font-medium">
              {result.tip}
            </p>
          </div>

          {/* Mandi Price Panel */}
          {mandiData && (
            <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Mandi Market Quote (Agmarknet)
                </span>
                {mandiData.market && (
                  <span className="text-xs font-medium text-slate-500">
                    {mandiData.market}, {mandiData.state}
                  </span>
                )}
              </div>

              {mandiData.price ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{mandiData.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {mandiData.unit ?? '₹/quintal'}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  {mandiData.message ?? 'Price data is currently unavailable for this crop.'}
                </p>
              )}
            </div>
          )}

          {mandiError && (
            <p className="text-xs text-red-600">{mandiError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
