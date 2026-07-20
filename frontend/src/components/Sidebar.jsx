import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Settings, Activity, Sun, Moon } from 'lucide-react';

const Sidebar = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark') || !('theme' in localStorage)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    } else {
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Data Upload', path: '/upload', icon: <Upload size={20} /> },
    { name: 'Train TimeGAN', path: '/train-timegan', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-full glass border-r border-slate-300 dark:border-gray-800 flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <Activity className="text-primary" size={28} />
        <h1 className="text-xl font-bold tracking-wider text-slate-900 dark:text-white">TimeGAN<span className="text-primary">.ai</span></h1>
      </div>
      
      <div className="flex-1 px-4 mt-8 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
      
      <div className="p-6 text-sm text-slate-400 dark:text-gray-500 flex items-center justify-between mt-auto">
        <span>Industry 4.0</span>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Toggle Theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
