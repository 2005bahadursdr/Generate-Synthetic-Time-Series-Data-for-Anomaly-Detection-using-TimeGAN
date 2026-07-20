import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/DataUpload';
import TrainTimeGAN from './pages/TrainTimeGAN';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/train-timegan" element={<TrainTimeGAN />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
