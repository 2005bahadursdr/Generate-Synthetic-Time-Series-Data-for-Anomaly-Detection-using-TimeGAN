import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Play, Server, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

const TrainTimeGAN = () => {
  const navigate = useNavigate();
  const [training, setTraining] = useState(false);
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(128);
  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState('');

  React.useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/datasets/list`);
        setDatasets(res.data.datasets);
        if (res.data.datasets.length > 0) {
          setDatasetId(res.data.datasets[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch datasets", err);
      }
    };
    fetchDatasets();
  }, []);

  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('Ready');

  React.useEffect(() => {
    let interval;
    if (training) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/models/timegan-status`);
          setLogs(res.data.logs || []);
          setStatus(res.data.status);
          
          if (res.data.status === 'Complete') {
            setTraining(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Failed to poll status", err);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [training]);

  const startTraining = async () => {
    if (!datasetId) {
      alert("Please select a dataset first.");
      return;
    }
    setTraining(true);
    setLogs([]);
    setStatus('Starting...');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/models/train-timegan`, {
        dataset_id: datasetId,
        epochs,
        batch_size: batchSize,
        hidden_dim: 24
      });
    } catch (err) {
      console.error(err);
      alert('Failed to start training');
      setTraining(false);
      setStatus('Ready');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">TimeGAN Training Studio</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Configure hyperparameters and train the GAN to generate synthetic sequences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center"><Settings className="mr-2" size={20}/> Hyperparameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Select Dataset</label>
                <select 
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  {datasets.length === 0 && <option value="">Loading datasets...</option>}
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.id}>{ds.name} ({ds.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Epochs</label>
                <input 
                  type="number" 
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Batch Size</label>
                <select 
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full bg-white dark:bg-surface border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                  <option value={128}>128</option>
                  <option value={256}>256</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Hidden Dimensions</label>
                <input 
                  type="number" 
                  value={24}
                  disabled
                  className="w-full bg-slate-50 dark:bg-surface/50 border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-2 text-slate-400 dark:text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              onClick={startTraining}
              disabled={training}
              className={`w-full mt-8 flex items-center justify-center space-x-2 py-3 rounded-lg font-bold transition-all ${
                training 
                  ? 'bg-gray-700 text-slate-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
              }`}
            >
              {training ? <Clock className="animate-spin" size={20} /> : <Play size={20} />}
              <span>{training ? 'Training in Progress...' : 'Start Training'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass p-6 rounded-2xl h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center"><Server className="mr-2" size={20}/> Training Logs</h2>
            
            <div className="flex-1 bg-white dark:bg-surface rounded-xl border border-slate-300 dark:border-gray-800 p-4 font-mono text-sm overflow-y-auto text-slate-500 dark:text-gray-400 space-y-2">
              {logs.length > 0 || training ? (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-2">
                    {logs.map((log, idx) => (
                      <p key={idx} className={log.includes('complete') ? "text-emerald-400 font-bold" : "text-primary"}>
                        {log}
                      </p>
                    ))}
                    {training && <p className="text-yellow-400 animate-pulse mt-4">Processing...</p>}
                  </div>
                  
                  {!training && logs.some(l => l.includes('complete')) && (
                    <div className="mt-8 pt-4 border-t border-slate-300 dark:border-gray-800 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <CheckCircle size={20} />
                        <span className="font-semibold">Model is ready for deployment!</span>
                      </div>
                      <button 
                        onClick={() => navigate('/')} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center space-x-2"
                      >
                        <Play size={18} />
                        <span>Deploy & Go to Dashboard</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">
                  Ready to start training. Configure hyperparameters and click start.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainTimeGAN;
