import React, { useState, useRef } from 'react';
import { 
  ScanLine, 
  UploadCloud, 
  Loader2, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Crown
} from 'lucide-react';
import jsPDF from 'jspdf';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

const DiseaseDetection = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    setError(null);
    setResult(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image file is too large (maximum 10 MB).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const { data } = await api.post('/api/disease-detection', formData);
      setResult(data);
    } catch (err) {
      if (err.response?.status === 402) {
        setError('Free scan quota reached (3 scans). Please upgrade to Pro for unlimited scans.');
        setUpgradeModalOpen(true);
      } else {
        setError(getErrorMessage(err, 'Could not diagnose the leaf image. Try with a clearer photo.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const parseSolutionPoints = (solution) => {
    if (!solution) return [];
    if (Array.isArray(solution)) return solution.map((s) => String(s).trim()).filter(Boolean);

    const text = String(solution).trim();
    if (!text) return [];

    // Check if text has numbered points inline like "1. ... 2. ... 3. ..."
    const inlineNumbered = text.split(/(?:^|\s+)(?=\d+[\.\)]\s+)/).map((s) => s.trim()).filter(Boolean);
    if (inlineNumbered.length > 1) {
      return inlineNumbered.map((item) => item.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean);
    }

    // Check if text has newlines
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return lines.map((l) => l.replace(/^(\d+[\.\)]|[-*•])\s+/, '').trim()).filter(Boolean);
    }

    return [text];
  };

  const downloadPdfReport = () => {
    if (!result) return;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(21, 128, 61);
    doc.text('AgroSense AI — Leaf Disease Diagnosis', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`File: ${selectedFile?.name ?? 'Uploaded Leaf Photo'}`, 14, 36);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 42, 196, 42);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Identified Plant: ${result.plant_name}`, 14, 54);
    doc.text(`Condition / Disease: ${result.disease_name}`, 14, 64);
    doc.text(`Severity Level: ${result.severity}`, 14, 74);

    doc.setFontSize(13);
    doc.setTextColor(21, 128, 61);
    doc.text('Recommended Treatment & Solution:', 14, 90);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const points = parseSolutionPoints(result.solution);
    let currentY = 100;
    points.forEach((point, idx) => {
      const formatted = `${idx + 1}. ${point}`;
      const splitLines = doc.splitTextToSize(formatted, 180);
      doc.text(splitLines, 14, currentY);
      currentY += (splitLines.length * 5) + 3;
    });

    doc.save(`AgroSense-${result.plant_name}-${result.disease_name}.pdf`.replace(/\s+/g, '-').toLowerCase());
  };

  const getSeverityBadge = (severity) => {
    const s = (severity ?? '').toLowerCase();
    if (s.includes('high') || s.includes('severe')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Severe</span>;
    }
    if (s.includes('mod')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Moderate</span>;
    }
    if (s.includes('low') || s.includes('mild')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Mild</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Healthy</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <ScanLine className="w-4 h-4 text-teal-600" />
          <span>Gemini Vision AI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3">
          Leaf Disease Scanner
          <ScanLine className="w-8 h-8 text-teal-600 inline shrink-0" />
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Upload a clear photo of an affected leaf. Our AI identifies the plant, the pathogen, severity, and treatment methods.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        {!previewUrl ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition flex flex-col items-center justify-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Click or drag & drop leaf image</p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP (Max 10 MB)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden max-h-96 bg-slate-100 flex items-center justify-center border border-slate-200">
              <img src={previewUrl} alt="Leaf Preview" className="max-h-96 object-contain" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-slate-600 hover:text-emerald-700 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                Change Image
              </button>

              <button
                onClick={handleScan}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Leaf with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Diagnosis
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {error.includes('quota') && (
              <button
                onClick={() => setUpgradeModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
              >
                <Crown className="w-3.5 h-3.5" /> Upgrade
              </button>
            )}
          </div>
        )}
      </div>

      {/* Result Diagnosis Card */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Diagnosis Result
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                {result.plant_name}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {getSeverityBadge(result.severity)}
              <button
                onClick={downloadPdfReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Detected Condition
              </span>
              <p className="text-base font-bold text-slate-900">{result.disease_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Severity Rating
              </span>
              <p className="text-base font-bold text-slate-900">{result.severity}</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Action & Treatment
            </h3>
            
            <div className="space-y-2.5">
              {parseSolutionPoints(result.solution).map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-emerald-100/90 shadow-2xs transition hover:border-emerald-300"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          setError(null);
        }}
      />
    </div>
  );
};

export default DiseaseDetection;
