import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import CropRecommendation from './pages/CropRecommendation';
import SoilRestoration from './pages/SoilRestoration';
import DiseaseDetection from './pages/DiseaseDetection';
import History from './pages/History';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import { Sprout } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-7xl font-black text-emerald-800">404</h1>
    <h2 className="text-xl font-bold text-slate-800 mt-2 flex items-center justify-center gap-2">
      Field Not Found <Sprout className="w-5 h-5 text-emerald-600" />
    </h2>
    <p className="text-slate-500 text-sm mt-1 max-w-sm">
      The page you are looking for does not exist or has been relocated.
    </p>
    <Link
      to="/"
      className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
    >
      Back to AgroSense Home
    </Link>
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/crop-recommendation"
              element={
                <ProtectedRoute>
                  <CropRecommendation />
                </ProtectedRoute>
              }
            />
            <Route path="/soil-restoration" element={<SoilRestoration />} />
            <Route
              path="/disease-detection"
              element={
                <ProtectedRoute>
                  <DiseaseDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
