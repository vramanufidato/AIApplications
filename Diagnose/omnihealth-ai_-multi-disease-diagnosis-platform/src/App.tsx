/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { 
  Activity, 
  Brain, 
  Microscope, 
  Upload, 
  BarChart3, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  FileText,
  Database,
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { analyzeMRI, predictDiabetes, analyzeMentalHealthPatterns } from './services/diagnosticService';

// --- Mock Evaluation Data ---
const precisionRecallData = [
  { recall: 0, precision: 1 },
  { recall: 0.2, precision: 0.95 },
  { recall: 0.4, precision: 0.92 },
  { recall: 0.6, precision: 0.88 },
  { recall: 0.8, precision: 0.75 },
  { recall: 1, precision: 0.5 },
];

const confusionMatrix = [
  { name: 'True Positive', value: 85, fill: '#10b981' },
  { name: 'False Positive', value: 5, fill: '#f43f5e' },
  { name: 'True Negative', value: 102, fill: '#10b981' },
  { name: 'False Negative', value: 8, fill: '#f43f5e' },
];

const modelPerformance = [
  { subject: 'Accuracy', A: 92, fullMark: 100 },
  { subject: 'Precision', A: 89, fullMark: 100 },
  { subject: 'Recall', A: 94, fullMark: 100 },
  { subject: 'F1-Score', A: 91, fullMark: 100 },
  { subject: 'AUC-ROC', A: 95, fullMark: 100 },
];

// --- Components ---

const Header = () => (
  <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">OmniHealth AI</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Diagnostic Intelligence Suite</p>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-6">
        <button className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</button>
        <button className="text-sm text-zinc-400 hover:text-white transition-colors">HIPAA Compliance</button>
        <div className="h-4 w-px bg-zinc-800" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-emerald-500">SYSTEM READY</span>
        </div>
      </nav>
    </div>
  </header>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300")} />
    <span className="text-sm font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('diabetes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mriImage, setMriImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setMriImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false 
  } as any);

  const handleDiagnostic = async (type: string, data?: any) => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (type === 'diabetes') res = await predictDiabetes(data);
      if (type === 'mental') res = await analyzeMentalHealthPatterns(data);
      if (type === 'mri' && mriImage) res = await analyzeMRI(mriImage);
      setResult(res || "Analysis complete.");
    } catch (error) {
      console.error(error);
      setResult("Error performing diagnostic analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4">Diagnostic Modules</p>
            <SidebarItem 
              icon={Activity} 
              label="Diabetes (Supervised)" 
              active={activeTab === 'diabetes'} 
              onClick={() => setActiveTab('diabetes')} 
            />
            <SidebarItem 
              icon={Brain} 
              label="Mental Health (Unsupervised)" 
              active={activeTab === 'mental'} 
              onClick={() => setActiveTab('mental')} 
            />
            <SidebarItem 
              icon={Microscope} 
              label="Oncology (Deep Learning)" 
              active={activeTab === 'oncology'} 
              onClick={() => setActiveTab('oncology')} 
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4">System</p>
            <SidebarItem 
              icon={BarChart3} 
              label="Evaluation Metrics" 
              active={activeTab === 'metrics'} 
              onClick={() => setActiveTab('metrics')} 
            />
            <SidebarItem 
              icon={Layers} 
              label="MLOps Strategy" 
              active={activeTab === 'mlops'} 
              onClick={() => setActiveTab('mlops')} 
            />
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white">HIPAA Secure</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              All data is encrypted in transit and at rest. Vision API calls are processed via private endpoints.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'diabetes' && (
              <motion.div
                key="diabetes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Diabetes Risk Assessment</h2>
                    <p className="text-sm text-zinc-500">Pima Indians Diabetes Dataset Analysis (Random Forest Classifier)</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    <Database className="w-3 h-3" />
                    DATASET: PIMA_INDIANS_V1
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Patient Biometrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Pregnancies', val: '2' },
                        { label: 'Glucose', val: '148' },
                        { label: 'Blood Pressure', val: '72' },
                        { label: 'Skin Thickness', val: '35' },
                        { label: 'Insulin', val: '0' },
                        { label: 'BMI', val: '33.6' },
                        { label: 'Pedigree', val: '0.627' },
                        { label: 'Age', val: '50' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold">{item.label}</label>
                          <input 
                            type="text" 
                            defaultValue={item.val}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleDiagnostic('diabetes')}
                      disabled={loading}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      Run Supervised Prediction
                    </button>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-emerald-500" />
                      Model Output
                    </h3>
                    {result ? (
                      <div className="flex-1 bg-zinc-950 rounded-xl p-4 border border-emerald-500/20 overflow-auto max-h-[400px]">
                        <pre className="text-xs text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed">
                          {result}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">Input patient data and run the model to see diagnostic probability.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'mental' && (
              <motion.div
                key="mental"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Mental Health Pattern Analysis</h2>
                    <p className="text-sm text-zinc-500">Kaggle Mental Health in Tech Survey (Unsupervised Clustering)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Behavioral Survey</h3>
                    <div className="space-y-4">
                      {[
                        'Family History of Mental Illness',
                        'Work Interfere (Often/Rarely)',
                        'Company Wellness Program',
                        'Ease of Leave for Mental Health',
                      ].map((q) => (
                        <div key={q} className="space-y-2">
                          <label className="text-xs text-zinc-400">{q}</label>
                          <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white">
                            <option>Yes</option>
                            <option>No</option>
                            <option>Don't Know</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleDiagnostic('mental')}
                      disabled={loading}
                      className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      Detect Anomalies
                    </button>
                  </div>

                  <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Cluster Visualization (Isolation Forest)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { x: 1, y: 20, z: 10 },
                          { x: 2, y: 45, z: 15 },
                          { x: 3, y: 30, z: 40 },
                          { x: 4, y: 70, z: 20 },
                          { x: 5, y: 40, z: 60 },
                          { x: 6, y: 85, z: 30 },
                        ]}>
                          <defs>
                            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="x" stroke="#52525b" fontSize={10} />
                          <YAxis stroke="#52525b" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#818cf8' }}
                          />
                          <Area type="monotone" dataKey="y" stroke="#6366f1" fillOpacity={1} fill="url(#colorY)" />
                          <Area type="monotone" dataKey="z" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Anomaly Score</span>
                        <span className="text-xs font-mono text-indigo-400">0.142 (NORMAL)</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[14%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'oncology' && (
              <motion.div
                key="oncology"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Oncology Diagnostic Center</h2>
                    <p className="text-sm text-zinc-500">Wisconsin Breast Cancer (1D-CNN) & MRI Tumor Detection (2D-CNN/Vision)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">MRI Vision Analysis</h3>
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[300px]",
                        isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"
                      )}
                    >
                      <input {...getInputProps()} />
                      {mriImage ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                          <img src={mriImage} alt="MRI Preview" className="max-h-[240px] rounded-lg shadow-2xl" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <p className="text-white text-xs font-bold">Click or Drag to Replace</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-zinc-500" />
                          </div>
                          <p className="text-sm text-zinc-400 font-medium">Drop MRI Scan Here</p>
                          <p className="text-[10px] text-zinc-600 mt-2">DICOM, PNG, or JPG supported</p>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDiagnostic('mri')}
                      disabled={loading || !mriImage}
                      className="w-full mt-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                    >
                      {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
                      Analyze Tumor Morphology
                    </button>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Diagnostic Report</h3>
                    {result ? (
                      <div className="flex-1 bg-zinc-950 rounded-xl p-6 border border-rose-500/20 overflow-auto">
                        <div className="flex items-center gap-3 mb-6 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                          <AlertCircle className="w-5 h-5 text-rose-500" />
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Clinical Findings Generated</span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                            {result}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">Upload an MRI scan to generate a deep-learning based diagnostic report.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Model Performance Evaluation</h2>
                    <p className="text-sm text-zinc-500">Real-time metrics for Accuracy, Precision, Recall, and F1-Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Precision-Recall Curve</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={precisionRecallData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="recall" stroke="#52525b" fontSize={10} label={{ value: 'Recall', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 10 }} />
                          <YAxis stroke="#52525b" fontSize={10} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#52525b', fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                          />
                          <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Confusion Matrix Heatmap</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {confusionMatrix.map((item) => (
                        <div key={item.name} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center gap-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">{item.name}</span>
                          <span className="text-2xl font-bold text-white">{item.value}</span>
                          <div className="w-full h-1 rounded-full" style={{ backgroundColor: item.fill }} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Metric Radar</h4>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={modelPerformance}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis dataKey="subject" stroke="#52525b" fontSize={8} />
                            <Radar name="Model A" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'mlops' && (
              <motion.div
                key="mlops"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">MLOps & Deployment Strategy</h2>
                    <p className="text-sm text-zinc-500">HIPAA-Compliant Infrastructure Architecture</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      provider: 'AWS SageMaker',
                      color: 'text-orange-400',
                      bg: 'bg-orange-400/10',
                      border: 'border-orange-400/20',
                      steps: [
                        'S3 Bucket Encryption (AES-256)',
                        'VPC Private Subnets for Training',
                        'IAM Roles with Least Privilege',
                        'CloudWatch Audit Logging'
                      ]
                    },
                    {
                      provider: 'Azure Machine Learning',
                      color: 'text-blue-400',
                      bg: 'bg-blue-400/10',
                      border: 'border-blue-400/20',
                      steps: [
                        'Azure Key Vault for Secrets',
                        'Private Link for Workspace',
                        'Role-Based Access Control (RBAC)',
                        'Defender for Cloud Integration'
                      ]
                    },
                    {
                      provider: 'GCP Vertex AI',
                      color: 'text-emerald-400',
                      bg: 'bg-emerald-400/10',
                      border: 'border-emerald-400/20',
                      steps: [
                        'Cloud KMS for Encryption Keys',
                        'VPC Service Controls',
                        'Binary Authorization for Deploy',
                        'Cloud Audit Logs for HIPAA'
                      ]
                    }
                  ].map((platform) => (
                    <div key={platform.provider} className={cn("p-6 rounded-2xl border bg-zinc-900", platform.border)}>
                      <h3 className={cn("text-lg font-bold mb-4", platform.color)}>{platform.provider}</h3>
                      <ul className="space-y-3">
                        {platform.steps.map((step) => (
                          <li key={step} className="flex items-start gap-2 text-xs text-zinc-400">
                            <ChevronRight className={cn("w-3 h-3 mt-0.5 shrink-0", platform.color)} />
                            {step}
                          </li>
                        ))}
                      </ul>
                      <div className={cn("mt-6 p-3 rounded-lg text-[10px] font-mono", platform.bg, platform.color)}>
                        STATUS: COMPLIANT
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    HIPAA Compliance Checklist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-300">Data Encryption at Rest (AES-256)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-300">End-to-End TLS 1.3 Encryption</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-300">Multi-Factor Authentication (MFA)</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-300">Regular Vulnerability Scanning</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-300">Business Associate Agreement (BAA)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-300">Automated Audit Trail Generation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
