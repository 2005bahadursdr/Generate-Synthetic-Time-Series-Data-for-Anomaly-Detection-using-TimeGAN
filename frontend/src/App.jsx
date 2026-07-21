import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/DataUpload';
import TrainTimeGAN from './pages/TrainTimeGAN';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative z-10 w-64 h-full bg-slate-50 dark:bg-background">
              <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <button className="absolute top-6 right-6 z-20 p-2 bg-slate-800/50 rounded-full text-white backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Top Header */}
          <div className="md:hidden flex items-center justify-between p-4 glass border-b border-slate-300 dark:border-gray-800 z-10">
            <h1 className="text-xl font-bold tracking-wider text-slate-900 dark:text-white">TimeGAN<span className="text-primary">.ai</span></h1>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors">
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<DataUpload />} />
              <Route path="/train-timegan" element={<TrainTimeGAN />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
