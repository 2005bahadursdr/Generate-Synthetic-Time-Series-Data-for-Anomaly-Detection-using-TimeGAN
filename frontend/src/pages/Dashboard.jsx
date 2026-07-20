import React, { useState, useEffect } from 'react';
import { Activity, Database, Zap, AlertTriangle, MapPin, Thermometer, Gauge, Droplets, Battery, Wifi, Wind, Settings, Flame, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

const DetailItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center space-x-3 bg-slate-100 dark:bg-surface/30 p-2.5 rounded-lg border border-slate-300 dark:border-gray-800/50">
    <div className={`p-1.5 rounded-md bg-white dark:bg-surface border border-slate-300 dark:border-gray-700 ${color}`}>
      <Icon size={16} />
    </div>
    <div className="overflow-hidden">
      <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass p-6 rounded-2xl flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon size={24} className="text-slate-900 dark:text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  </div>
);

const SensorChart = ({ data, dataKey, title, color, unit }) => (
  <div className="bg-slate-50 dark:bg-surface/30 border border-slate-300 dark:border-gray-800/50 rounded-xl p-4 flex flex-col h-56 shadow-sm">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">{title} <span className="text-slate-400 text-xs font-normal">({unit})</span></h3>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 10}} />
          <YAxis stroke="#94a3b8" tick={{fontSize: 10}} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', padding: '4px 8px' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const Dashboard = () => {
  const [liveData, setLiveData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [anomaliesCount, setAnomaliesCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeSensors, setActiveSensors] = useState(0);
  const [syntheticSamples, setSyntheticSamples] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [sensorMode, setSensorMode] = useState('simulated');
  const [waitingForHardware, setWaitingForHardware] = useState(false);
  const lastProcessedTimeRef = React.useRef(null);

  useEffect(() => {
    // Fetch base dynamic stats from the server
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/datasets/stats`);
        setTotalPoints(res.data.total_data_points);
        setActiveSensors(res.data.active_sensors);
        setSyntheticSamples(res.data.synthetic_samples);
        setAnomaliesCount(res.data.anomalies_detected);
      } catch (err) {
        console.error("Failed to fetch initial stats", err);
      }
    };
    fetchStats();

    // Initial static population to look good immediately
    const initialData = Array.from({ length: 20 }).map((_, i) => {
      const t = Date.now() / 1000 - (20 - i);
      return {
        time: new Date(t * 1000).toLocaleTimeString([], { hour12: false }),
        temperature: Math.sin(t / 5) * 10 + 50 + Math.random() * 5,
        pressure: Math.cos(t / 5) * 5 + 30 + Math.random() * 2,
        humidity: Math.sin(t / 10) * 20 + 40 + Math.random() * 5,
        voltage: Math.cos(t / 8) * 2 + 12 + Math.random() * 0.5,
        vibration: Math.sin(t / 2) * 1 + 2 + Math.random() * 0.2,
        rpm: Math.cos(t / 3) * 500 + 3000 + Math.random() * 100,
        is_anomaly: false
      };
    });
    setLiveData(initialData);

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/datasets/live?mode=${sensorMode}`);
        const newPoint = res.data;
        
        setIsLive(true);
        setWaitingForHardware(false);
        
        // Prevent duplicates if hardware hasn't pushed new data yet
        if (sensorMode === 'hardware' && lastProcessedTimeRef.current === newPoint.time) {
          return; // Skip completely, don't update chart or metrics
        }
        
        lastProcessedTimeRef.current = newPoint.time;

        setLatestData(newPoint);

        setLiveData(prev => {
          const updated = [...prev, newPoint];
          if (updated.length > 50) updated.shift();
          return updated;
        });
        
        setTotalPoints(prev => prev + 1);
        if (newPoint.is_anomaly) {
          setAnomaliesCount(prev => prev + 1);
        }
      } catch (err) {
        if (err.response && err.response.status === 404 && sensorMode === 'hardware') {
           setWaitingForHardware(true);
           setIsLive(false);
        } else {
           console.error("Failed to fetch live data", err);
           setIsLive(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sensorMode]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Overview</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Live monitoring of IoT sensors and anomaly detection performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Sensors" value={activeSensors.toLocaleString()} icon={Activity} colorClass="bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
        <MetricCard title="Total Data Points" value={totalPoints > 1000000 ? (totalPoints / 1000000).toFixed(2) + "M" : totalPoints.toLocaleString()} icon={Database} colorClass="bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <MetricCard title="Synthetic Samples" value={syntheticSamples > 0 ? (syntheticSamples > 1000 ? (syntheticSamples/1000).toFixed(1) + "K" : syntheticSamples) : "0"} icon={Zap} colorClass="bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
        <MetricCard title="Anomalies Detected" value={anomaliesCount} icon={AlertTriangle} colorClass={anomaliesCount > 0 ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2 glass p-6 rounded-2xl flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Live Sensor Feed</h2>
            
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <div className="flex items-center space-x-2 bg-white dark:bg-surface border border-slate-300 dark:border-gray-800 p-1 rounded-lg">
              <button 
                onClick={() => { setSensorMode('simulated'); setWaitingForHardware(false); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sensorMode === 'simulated' ? 'bg-primary text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
              >
                Simulated
              </button>
              <button 
                onClick={() => setSensorMode('hardware')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sensorMode === 'hardware' ? 'bg-primary text-white shadow' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`}
              >
                Hardware
              </button>
            </div>

            {isLive && !waitingForHardware && (
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Live</span>
              </div>
            )}
            {waitingForHardware && (
              <div className="flex items-center space-x-2 text-yellow-500">
                <Activity size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Waiting for Device...</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-6 w-full relative">
          {waitingForHardware && (
            <div className="absolute inset-0 z-10 bg-white/80 dark:bg-surface/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-gray-700">
              <AlertTriangle className="text-yellow-500 mb-3 animate-bounce" size={32} />
              <p className="text-slate-900 dark:text-white font-medium text-lg">Waiting for Hardware Connection</p>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 max-w-md text-center">
                Send a POST request to <code className="bg-slate-200 dark:bg-gray-800 px-2 py-1 rounded text-primary">/api/datasets/live-push</code> with your physical sensor data.
              </p>
            </div>
          )}
          
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                <Line name="Core Temp (°C)" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line name="Pressure (PSI)" type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <SensorChart data={liveData} dataKey="humidity" title="Humidity" unit="%" color="#06b6d4" />
            <SensorChart data={liveData} dataKey="voltage" title="Voltage" unit="V" color="#eab308" />
            <SensorChart data={liveData} dataKey="vibration" title="Vibration" unit="g" color="#a855f7" />
            <SensorChart data={liveData} dataKey="rpm" title="RPM" unit="rev/min" color="#10b981" />
          </div>
        </div>
        </div>

        {/* Live Details Card */}
        <div className="glass p-6 rounded-2xl flex flex-col">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Live Sensor Details</h2>
          {latestData ? (
             <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {/* Header with status */}
                <div className={`p-4 rounded-xl border ${latestData.is_anomaly ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} flex justify-between items-center`}>
                   <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <div className="flex items-center space-x-2">
                         {latestData.is_anomaly ? <AlertTriangle size={18} className="text-red-400" /> : <CheckCircle2 size={18} className="text-emerald-400" />}
                         <span className={`font-semibold ${latestData.is_anomaly ? 'text-red-400' : 'text-emerald-400'}`}>{latestData.status}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">Anomaly Score</p>
                      <span className={`font-mono font-bold text-lg ${latestData.anomaly_score > 0.5 ? 'text-red-400' : 'text-slate-900 dark:text-white'}`}>{latestData.anomaly_score.toFixed(2)}</span>
                   </div>
                </div>
                
                {/* ID and Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-surface/40 p-3 rounded-xl border border-slate-300 dark:border-gray-800/50">
                     <p className="text-xs text-slate-500 dark:text-gray-400 mb-1 flex items-center"><MapPin size={12} className="mr-1" /> Sensor ID</p>
                     <p className="text-sm font-medium text-slate-900 dark:text-white">{latestData.sensor_id}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-surface/40 p-3 rounded-xl border border-slate-300 dark:border-gray-800/50">
                     <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">Location</p>
                     <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={latestData.location}>{latestData.location}</p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon={Thermometer} label="Core Temp" value={`${latestData.temperature} °C`} color="text-orange-400" />
                  <DetailItem icon={Gauge} label="Pressure" value={`${latestData.pressure} PSI`} color="text-blue-400" />
                  <DetailItem icon={Droplets} label="Humidity" value={`${latestData.humidity} %`} color="text-cyan-400" />
                  <DetailItem icon={Zap} label="Voltage" value={`${latestData.voltage} V`} color="text-yellow-400" />
                  <DetailItem icon={Battery} label="Battery" value={`${latestData.battery} %`} color="text-green-400" />
                  <DetailItem icon={Wifi} label="Signal" value={`${latestData.signal_strength} dBm`} color="text-indigo-400" />
                  <DetailItem icon={Wind} label="Air Quality" value={latestData.air_quality} color="text-teal-400" />
                  <DetailItem icon={Activity} label="Vibration" value={`${latestData.vibration} g`} color="text-purple-400" />
                  <DetailItem icon={Settings} label="RPM" value={latestData.rpm} color="text-slate-600 dark:text-gray-300" />
                  <DetailItem icon={Flame} label="Gas Level" value={`${latestData.gas_level} ppm`} color="text-rose-400" />
                </div>
                
                {/* Prediction */}
                <div className="mt-2 bg-slate-50 dark:bg-surface/40 p-4 rounded-xl border border-slate-300 dark:border-gray-800/50 flex justify-between items-center">
                   <span className="text-sm text-slate-500 dark:text-gray-400 uppercase tracking-wider font-medium">Prediction</span>
                   <span className={`text-sm font-semibold px-3 py-1 rounded-full ${latestData.is_anomaly ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{latestData.prediction}</span>
                </div>
             </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 h-64">
                <Activity size={32} className="animate-pulse mb-3" />
                <p>Waiting for data...</p>
             </div>
          )}
        </div>
      </div>

      {/* Educational Section below the chart - Only visible when anomalies are detected */}
      {anomaliesCount > 0 && (
        <div className="glass p-6 rounded-2xl mt-8 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Understanding Anomalies in Your Data</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            In industrial and IoT environments, an <strong>anomaly</strong> is a rare, sudden deviation from normal baseline behavior. The TimeGAN AI model detects these events in real-time by analyzing historical sensor patterns and flagging any readings that break those patterns.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface p-5 rounded-xl border border-slate-300 dark:border-gray-800">
              <h4 className="text-emerald-400 text-sm font-medium mb-3 flex items-center">
                <Activity size={18} className="mr-2" />
                Normal Behavior
              </h4>
              <p className="text-slate-400 dark:text-gray-500 text-sm leading-relaxed mb-2">
                When the dashboard is running smoothly without red spikes, you will see natural, rhythmic fluctuations.
              </p>
              <p className="text-slate-400 dark:text-gray-500 text-sm leading-relaxed">
                This represents a healthy machine operating under stable conditions, such as standard engine RPMs, steady ambient lab temperatures, or consistent oil pressure.
              </p>
            </div>
            
            <div className="bg-white dark:bg-surface p-5 rounded-xl border border-slate-300 dark:border-gray-800">
              <h4 className="text-red-400 text-sm font-medium mb-3 flex items-center">
                <AlertTriangle size={18} className="mr-2" />
                Why Anomalies Occur
              </h4>
              <ul className="text-slate-400 dark:text-gray-500 text-sm leading-relaxed list-disc list-inside space-y-2">
                <li><strong>Hardware Degradation:</strong> A bearing failing or a filter clogging, causing unexpected friction and extreme temperature spikes.</li>
                <li><strong>Environmental Shocks:</strong> Sudden changes in external pressure or humidity that the engine is not calibrated to handle.</li>
                <li><strong>Sensor Malfunctions:</strong> The IoT device itself loses calibration, breaks down, and starts sending erratic "noise" to the system.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
