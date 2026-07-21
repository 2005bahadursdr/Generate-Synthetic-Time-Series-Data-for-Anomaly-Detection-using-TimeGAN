import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileType, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const DataUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Assuming FastAPI runs on 8000
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/datasets/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dataset Management</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Upload raw IoT sensor data (CSV) for preprocessing and training.</p>
      </header>

      <div className="glass p-10 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-gray-600 hover:border-primary transition-colors">
        <UploadCloud size={64} className="text-slate-500 dark:text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Drag & Drop your dataset here</h3>
        <p className="text-slate-400 dark:text-gray-500 mb-6">or click to browse from your computer</p>
        
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".csv"
          onChange={handleFileChange}
        />
        <label 
          htmlFor="file-upload" 
          className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors"
        >
          Select File
        </label>
        
        {file && (
          <div className="mt-6 flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-lg">
            <FileType size={20} />
            <span>{file.name}</span>
          </div>
        )}
      </div>

      {file && !result && (
        <div className="flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="bg-accent hover:bg-violet-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50"
          >
            {uploading ? 'Uploading & Processing...' : 'Upload Dataset'}
          </button>
        </div>
      )}

      {result && (
        <div className="glass p-6 rounded-2xl mt-8 border-emerald-500/30">
          <div className="flex items-center space-x-3 text-emerald-400 mb-4">
            <CheckCircle size={24} />
            <h2 className="text-xl font-bold">Upload Successful</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-gray-300">
            <div><strong>Filename:</strong> {result.filename}</div>
            <div><strong>Total Rows:</strong> {result.num_rows.toLocaleString()}</div>
            <div className="col-span-2">
              <strong>Features:</strong> {result.columns.join(', ')}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end border-t border-slate-200 dark:border-gray-800 pt-6">
            <button 
              onClick={() => navigate('/train-timegan')}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              <span>Proceed to Training</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUpload;
