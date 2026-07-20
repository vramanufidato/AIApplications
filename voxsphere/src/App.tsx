import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  Trash2,
  Share2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Terminal,
  Database,
  Code,
  FileText,
  Copy,
  Check,
  Globe,
  Layers,
  Info,
  Server,
  Sparkles,
  Search,
  MessageSquare,
  X,
  Play,
  Pause,
  Clock,
  ShieldCheck,
  Heart,
  CloudLightning,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AudioPod, VoiceReply, AuditLog } from "./types";

export default function App() {
  // Developer Panel State
  const [activeTab, setActiveTab] = useState<"TDD" | "SPECS" | "REACT_NATIVE" | "AUDIT_LOGS">("TDD");
  const [selectedNativeFile, setSelectedNativeFile] = useState<"PodCard" | "FeedScreen" | "RecordPodModal">("PodCard");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Schema & OpenAPI Specs cache
  const [prismaSchema, setPrismaSchema] = useState("");
  const [openapiYaml, setOpenapiYaml] = useState("");

  // Simulator App State
  const [pods, setPods] = useState<AudioPod[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingPods, setLoadingPods] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // App filters
  const [appCategory, setAppCategory] = useState<string>("ALL");
  const [appLanguage, setAppLanguage] = useState<string>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Active audio player state
  const [playingPodId, setPlayingPodId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [playingReplyId, setPlayingReplyId] = useState<string | null>(null);

  // Recording State (Simulator)
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordTitle, setRecordTitle] = useState("");
  const [recordCategory, setRecordCategory] = useState("MENTAL_HEALTH");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [simulatedTranscript, setSimulatedTranscript] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"IDLE" | "UPLOADING" | "SUCCESS" | "FAILED">("IDLE");
  const [moderationReason, setModerationReason] = useState("");
  const [recordingWaves, setRecordingWaves] = useState<number[]>([]);

  // Reply State (Simulator)
  const [replyingToPod, setReplyingToPod] = useState<AudioPod | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyDuration, setReplyDuration] = useState(12);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Web Speech Synthesis (Speech Simulation)
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Microphone stream for visual waveform
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [liveMicVolume, setLiveMicVolume] = useState<number>(0);

  // React Native component contents to export
  const [nativeCodes, setNativeCodes] = useState({
    PodCard: "",
    FeedScreen: "",
    RecordPodModal: ""
  });

  // Calculate current custom pods count
  const myPodsCount = pods.filter(p => p.userId === "u-current").length;

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    fetchPods();
    fetchAuditLogs();
    fetchDocFiles();

    return () => {
      stopAllAudio();
      stopMicrophoneStream();
    };
  }, []);

  // Sync feed with database
  const fetchPods = async () => {
    setLoadingPods(true);
    try {
      const response = await fetch(`/api/pods/feed?category=${appCategory}&language=${appLanguage}`);
      const data = await response.json();
      if (data.success) {
        setPods(data.pods);
      }
    } catch (err) {
      console.error("Error fetching pods:", err);
    } finally {
      setLoadingPods(false);
      setRefreshing(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/moderation/logs");
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  const fetchDocFiles = async () => {
    try {
      const response = await fetch("/api/developer/docs");
      const data = await response.json();
      setPrismaSchema(data.prisma);
      setOpenapiYaml(data.openapi);
    } catch (err) {
      console.error("Error fetching docs files:", err);
    }

    // Fetch the written React Native components for display in code tabs
    try {
      const pCard = await fetch("/src/components/react-native/PodCard.tsx").then(r => r.text());
      const fScreen = await fetch("/src/components/react-native/FeedScreen.tsx").then(r => r.text());
      const rModal = await fetch("/src/components/react-native/RecordPodModal.tsx").then(r => r.text());
      setNativeCodes({
        PodCard: pCard,
        FeedScreen: fScreen,
        RecordPodModal: rModal
      });
    } catch {
      console.log("Could not load native source codes.");
    }
  };

  useEffect(() => {
    fetchPods();
  }, [appCategory, appLanguage]);

  // Handle Play/Pause podcast using SpeechSynthesis (reading transcript to sound real)
  const togglePlayPod = (pod: AudioPod) => {
    if (playingPodId === pod.id) {
      stopAllAudio();
    } else {
      stopAllAudio();
      setPlayingPodId(pod.id);
      setPlaybackProgress(0);

      if (synthRef.current) {
        synthRef.current.cancel();
        
        // Use speech synthesis to play transcript
        const utterance = new SpeechSynthesisUtterance(pod.transcript);
        utteranceRef.current = utterance;

        // Visual progress updates during speaking
        const totalDurationMs = pod.duration * 1000;
        const startTime = Date.now();
        
        const progressInterval = setInterval(() => {
          if (!synthRef.current?.speaking || playingPodId !== pod.id) {
            clearInterval(progressInterval);
            return;
          }
          const elapsed = Date.now() - startTime;
          const pct = Math.min(1, elapsed / totalDurationMs);
          setPlaybackProgress(pct);
        }, 100);

        utterance.onend = () => {
          clearInterval(progressInterval);
          setPlayingPodId(null);
          setPlaybackProgress(0);
        };

        utterance.onerror = () => {
          clearInterval(progressInterval);
          setPlayingPodId(null);
          setPlaybackProgress(0);
        };

        // Select a pleasant female voice for VoxSphere support if possible
        const voices = synthRef.current.getVoices();
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google us english") || v.lang.startsWith("en"));
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        synthRef.current.speak(utterance);
      }
    }
  };

  const togglePlayReply = (reply: VoiceReply) => {
    if (playingReplyId === reply.id) {
      stopAllAudio();
    } else {
      stopAllAudio();
      setPlayingReplyId(reply.id);

      if (synthRef.current) {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(reply.transcript);
        utteranceRef.current = utterance;
        
        utterance.onend = () => setPlayingReplyId(null);
        utterance.onerror = () => setPlayingReplyId(null);

        const voices = synthRef.current.getVoices();
        const femaleVoice = voices.find(v => v.lang.startsWith("en"));
        if (femaleVoice) utterance.voice = femaleVoice;

        synthRef.current.speak(utterance);
      }
    }
  };

  const stopAllAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setPlayingPodId(null);
    setPlayingReplyId(null);
    setPlaybackProgress(0);
  };

  // Microphone capture for live waveform animation
  const startMicrophoneStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      setIsRecordingMic(true);

      const updateLiveWaves = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average volume level
        let total = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          total += dataArrayRef.current[i];
        }
        const avg = total / dataArrayRef.current.length;
        setLiveMicVolume(avg);

        // Populate beautiful live wave heights (max 20 bars)
        setRecordingWaves(prev => {
          const currentWave = Math.max(5, Math.floor(avg * 0.45));
          const updated = [...prev, currentWave];
          if (updated.length > 22) updated.shift();
          return updated;
        });

        animationFrameId.current = requestAnimationFrame(updateLiveWaves);
      };

      updateLiveWaves();
    } catch (err) {
      console.warn("Browser mic access not available or denied. Simulating waves.");
      setIsRecordingMic(true);
      // Fallback timer simulation
      let timer = setInterval(() => {
        setRecordingWaves(prev => {
          const currentWave = Math.floor(Math.random() * 25) + 5;
          const updated = [...prev, currentWave];
          if (updated.length > 22) updated.shift();
          return updated;
        });
      }, 100);
      (window as any).simulatedWaveTimer = timer;
    }
  };

  const stopMicrophoneStream = () => {
    setIsRecordingMic(false);
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if ((window as any).simulatedWaveTimer) {
      clearInterval((window as any).simulatedWaveTimer);
    }
    setLiveMicVolume(0);
  };

  // Start Mic recording session
  const startRecordingPod = async () => {
    if (myPodsCount >= 10) {
      alert("Storage quota exceeded! You have reached your local threshold of 10 active pods or drafts. Please delete an older pod to free up a slot.");
      return;
    }
    setRecordingSeconds(0);
    setRecordedAudioUrl(null);
    setSimulatedTranscript("");
    setUploadStatus("IDLE");
    await startMicrophoneStream();

    // Start 30-second timer
    const interval = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev >= 29) {
          clearInterval(interval);
          stopRecordingPodInstance();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
    (window as any).recordingTimerInterval = interval;
  };

  const stopRecordingPodInstance = () => {
    stopMicrophoneStream();
    if ((window as any).recordingTimerInterval) {
      clearInterval((window as any).recordingTimerInterval);
    }
    setRecordedAudioUrl("simulated_recorded_file.wav");
    
    // Auto populate suggested transcript based on chosen category to help testing
    const defaultTranscripts: { [key: string]: string } = {
      MENTAL_HEALTH: "Today, let's normalize asking for therapy and prioritizing our emotional peace. As sisters, we carry heavy loads, but we don't have to carry them in silence. Take 30 seconds for self-care.",
      CAREER: "Mahila Money gave me the courage to initiate my retail boutique. Negotiating is about understanding your unique value, planning facts, and presenting with confidence.",
      CLIMATE: "Water harvesting protects our land. In my village, we restored five traditional wells. Local climate action starts when women take the lead in ecosystem management.",
      LEGAL_RIGHTS: "The Maternity Benefit Amendment provides paid off-work leave. Document every single work communication, know your statutory rights, and never settle.",
      INTERGENERATIONAL_WISDOM: "My grandmother taught me that true power is not loud, but deep like oak roots. When storms blow, bend gracefully but stand rooted in your history."
    };
    setSimulatedTranscript(defaultTranscripts[recordCategory] || "Raising my voice today to empower sisters around the world on VoxSphere!");
  };

  // Upload micro-pod
  const handleUploadSubmit = async () => {
    if (!recordTitle.trim()) {
      alert("Please enter a podcast title!");
      return;
    }

    setUploadStatus("UPLOADING");
    try {
      const response = await fetch("/api/pods/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recordTitle.trim(),
          category: recordCategory,
          duration: recordingSeconds || 15,
          transcript: simulatedTranscript.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUploadStatus("SUCCESS");
        setModerationReason(data.moderationResult.reason);
        fetchPods();
        fetchAuditLogs();
        
        // Reset record state
        setTimeout(() => {
          setShowRecordModal(false);
          setRecordTitle("");
          setRecordedAudioUrl(null);
          setRecordingSeconds(0);
          setUploadStatus("IDLE");
        }, 3000);
      } else {
        setUploadStatus("FAILED");
        setModerationReason(data.error || "Failed to upload.");
      }
    } catch (err) {
      setUploadStatus("FAILED");
      setModerationReason("Error reaching server moderation services.");
    }
  };

  // Delete pod to free up storage space quota
  const handleDeletePod = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this pod and free up a storage slot?")) return;

    try {
      const response = await fetch(`/api/pods/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        fetchPods();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit voice reply
  const handlePostReply = async () => {
    if (!replyingToPod || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/pods/${replyingToPod.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: replyDuration,
          transcript: replyText.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.moderationResult.status === "FLAGGED") {
          alert(`Your voice reply was posted, but was FLAGGED by automated filters:\n\n${data.moderationResult.reason}`);
        } else {
          alert("Your 30-second voice reply passed moderation and is live!");
        }
        setReplyText("");
        setReplyingToPod(null);
        fetchPods();
        fetchAuditLogs();
      } else {
        alert(data.error || "Failed to post reply.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText("Copied!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Professional Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display text-white tracking-tight">VoxSphere</h1>
                <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 font-medium rounded-full border border-pink-500/30">
                  MVP Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Voice-First Women Community Empowerment Micro-Podcasting (30s) Architecture & Prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            {/* Server Status metrics */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
              <Server className="h-4 w-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-slate-400 block font-mono text-[9px] uppercase">Express API Status</span>
                <span className="text-slate-200 font-semibold font-mono">ONLINE - 3000</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
              <Database className="h-4 w-4 text-pink-400" />
              <div>
                <span className="text-slate-400 block font-mono text-[9px] uppercase">Prisma / PG Store</span>
                <span className="text-slate-200 font-semibold font-mono">SIMULATED ACTIVE</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div>
                <span className="text-slate-400 block font-mono text-[9px] uppercase">Moderation Intelligence</span>
                <span className="text-slate-200 font-semibold font-mono">GEMINI DUAL CORE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: GORGEOUS INTERACTIVE PHONE SIMULATOR (45%) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center sticky top-24">
          <div className="w-full max-w-[390px] aspect-[9/19.2] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 shadow-pink-500/5 relative overflow-hidden flex flex-col">
            
            {/* Phone Top Notch Spacer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="h-1.5 w-12 bg-slate-800 rounded-full mb-1"></div>
            </div>

            {/* Simulated Phone Screen Contents */}
            <div className="flex-1 bg-slate-50 text-slate-800 rounded-[36px] overflow-hidden flex flex-col relative z-20">
              
              {/* App Internal Header */}
              <div className="bg-white px-4 pt-8 pb-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <h2 className="text-lg font-bold font-display text-pink-600 tracking-tight">VoxSphere</h2>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Sisterhood Audio Byte</p>
                </div>

                {/* Language selection dropdown simulator */}
                <div className="relative">
                  <button 
                    onClick={() => setShowLangMenu(!showLangMenu)} 
                    className="flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold px-2 py-1 rounded-full text-[10px] border border-pink-200 transition"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{appLanguage === "en" ? "English" : appLanguage === "hi" ? "Hindi" : appLanguage === "ta" ? "Tamil" : "Telugu"}</span>
                  </button>
                  
                  {showLangMenu && (
                    <div className="absolute right-0 top-7 w-28 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
                      {["en", "hi", "ta", "te"].map(lang => (
                        <button
                          key={lang}
                          onClick={() => {
                            setAppLanguage(lang);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition block ${appLanguage === lang ? "text-pink-600 font-bold bg-pink-50" : "text-slate-700"}`}
                        >
                          {lang === "en" ? "English" : lang === "hi" ? "हिंदी (Hindi)" : lang === "ta" ? "தமிழ் (Tamil)" : "తెలుగు (Telugu)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quota limit warnings inside app */}
              <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-[11px] text-blue-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                  <span>Your Pod Space: <strong className="font-bold">{myPodsCount} / 10</strong> used</span>
                </div>
                <button 
                  onClick={() => alert("VoxSphere optimizes storage and limits noise by enforcing a 10 active pods/drafts threshold per member. Delete outdated recordings anytime.")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Horizontal scroll category filters inside app */}
              <div className="bg-white border-b border-slate-100 py-1.5 px-2 flex gap-1 overflow-x-auto scrollbar-none scroll-smooth">
                {[
                  { id: "ALL", label: "All Pods" },
                  { id: "MENTAL_HEALTH", label: "Mental Health" },
                  { id: "CAREER", label: "Career" },
                  { id: "CLIMATE", label: "Climate" },
                  { id: "LEGAL_RIGHTS", label: "Legal" },
                  { id: "INTERGENERATIONAL_WISDOM", label: "Sankofa" }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setAppCategory(cat.id)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition font-medium ${appCategory === cat.id ? "bg-pink-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Feed Area inside app */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
                {loadingPods ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <RefreshCw className="h-6 w-6 text-pink-500 animate-spin" />
                    <span className="text-xs text-slate-400">Loading audio pods...</span>
                  </div>
                ) : pods.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <p className="text-slate-400 text-sm mb-4">No pods yet in this category.</p>
                    <button 
                      onClick={() => setShowRecordModal(true)} 
                      className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-xs px-4 py-2 rounded-full font-bold transition shadow-md"
                    >
                      <Mic className="h-3.5 w-3.5" /> Record First Byte
                    </button>
                  </div>
                ) : (
                  pods.map(pod => {
                    const isMyPod = pod.userId === "u-current";
                    const isCurrentPlaying = playingPodId === pod.id;
                    const displayProgress = isCurrentPlaying ? playbackProgress : 0;

                    // Waveform visual lines
                    const barCount = 18;
                    const visualBars = [];
                    for (let i = 0; i < barCount; i++) {
                      const h = 10 + Math.sin(i * 1.3) * 10 + Math.cos(i * 0.8) * 6;
                      const isActive = i / barCount < displayProgress;
                      visualBars.push(
                        <div 
                          key={i} 
                          className="w-1.5 rounded-full transition-all duration-100"
                          style={{
                            height: `${Math.max(4, h)}px`,
                            backgroundColor: isActive ? "#10b981" : "#cbd5e1"
                          }}
                        />
                      );
                    }

                    return (
                      <div key={pod.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-md transition">
                        
                        {/* Feed Card Top Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700 text-xs shadow-inner">
                            {pod.user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{pod.user.name}</h4>
                              {pod.user.role !== "USER" && <ShieldCheck className="h-3 w-3 text-pink-600" />}
                            </div>
                            <span className="text-[8px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded uppercase">
                              {pod.user.role === "USER" ? "Sister" : pod.user.role === "VERIFIED_CREATOR" ? "Verified" : "NGO Partner"}
                            </span>
                          </div>

                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-pink-50 text-pink-700 border border-pink-100">
                            {pod.category.replace("_", " ")}
                          </span>
                        </div>

                        {/* Audio Details */}
                        <h3 className="text-xs font-bold text-slate-900 mb-1 leading-tight">{pod.title}</h3>
                        <p className="text-[11px] text-slate-500 italic mb-3 leading-snug">
                          "{pod.transcript}"
                        </p>

                        {/* Interactive Wave Player */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100">
                          <button 
                            onClick={() => togglePlayPod(pod)}
                            className="h-8 w-8 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition shadow-md shadow-pink-500/10 shrink-0"
                          >
                            {isCurrentPlaying ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white ml-0.5" />}
                          </button>
                          
                          {/* Animated Wave representation */}
                          <div className="flex-1 flex items-center justify-between h-8 px-1">
                            {visualBars}
                          </div>

                          <span className="text-[9px] font-mono text-slate-400 shrink-0 select-none">
                            {isCurrentPlaying ? `0:${Math.floor(displayProgress * pod.duration).toString().padStart(2, "0")}` : `0:${pod.duration}`}
                          </span>
                        </div>

                        {/* Actions line */}
                        <div className="flex items-center justify-between text-slate-400 text-[10px] pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 hover:text-red-500 transition">
                              <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400" />
                              <span>24</span>
                            </button>
                            <button 
                              onClick={() => setReplyingToPod(pod)}
                              className="flex items-center gap-1 hover:text-pink-600 transition"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                              <span>{pod.replies?.length || 0} Replies</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {pod.partnerLink && (
                              <a 
                                href={pod.partnerLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[9px] transition"
                              >
                                <ExternalLink className="h-3 w-3" /> Partner
                              </a>
                            )}

                            {isMyPod && (
                              <button 
                                onClick={(e) => handleDeletePod(pod.id, e)}
                                className="p-1 hover:text-red-500 hover:bg-red-50 rounded transition"
                                title="Delete pod"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nested Replies Drawer if active */}
                        {pod.replies && pod.replies.length > 0 && (
                          <div className="mt-2 pl-3 border-l-2 border-pink-100 space-y-1.5 pt-1.5 bg-slate-50/50 p-2 rounded-lg">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Voice Replies</p>
                            {pod.replies.map(reply => (
                              <div key={reply.id} className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-1.5 rounded-md border border-slate-50 shadow-xs">
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  <button 
                                    onClick={() => togglePlayReply(reply)}
                                    className="p-1 text-pink-600 hover:bg-pink-50 rounded"
                                  >
                                    {playingReplyId === reply.id ? <Pause className="h-3 w-3 fill-pink-600" /> : <Play className="h-3 w-3 fill-pink-600 ml-0.5" />}
                                  </button>
                                  <span className="truncate italic">"{reply.transcript}"</span>
                                </div>
                                <span className="text-[8px] font-mono text-slate-400 shrink-0 pl-1">
                                  0:{reply.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* FLOATING ACTION RECORD BUTTON */}
              <button 
                onClick={() => setShowRecordModal(true)} 
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-bold px-5 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-pink-600/30 transition z-40"
              >
                <Mic className="h-4.5 w-4.5" />
                <span className="text-sm">Record Pod</span>
              </button>

              {/* SIMULATOR RECORD MODAL OVERLAY */}
              <AnimatePresence>
                {showRecordModal && (
                  <motion.div 
                    initial={{ opacity: 0, y: 150 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 150 }}
                    className="absolute inset-x-0 bottom-0 top-16 bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col p-4 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Mic className="h-4 w-4 text-pink-600" /> Record 30s Byte
                      </h3>
                      <button onClick={() => { stopRecordingPodInstance(); setShowRecordModal(false); }} className="p-1.5 hover:bg-slate-100 rounded-full transition">
                        <X className="h-4.5 w-4.5 text-slate-500" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4 text-xs">
                      {/* Storage indicator */}
                      <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-100 text-purple-800 text-center text-[10px]">
                        Active Slots: <strong>{myPodsCount} / 10 used</strong>. {10 - myPodsCount} remaining.
                      </div>

                      {/* Title input */}
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Pod Title</label>
                        <input 
                          type="text" 
                          placeholder='e.g., Understanding Maternity Benefits'
                          value={recordTitle}
                          onChange={(e) => setRecordTitle(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
                        />
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Empowerment Category</label>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: "MENTAL_HEALTH", label: "Mental Health" },
                            { id: "CAREER", label: "Career & Money" },
                            { id: "CLIMATE", label: "Climate & Eco" },
                            { id: "LEGAL_RIGHTS", label: "Legal Rights" },
                            { id: "INTERGENERATIONAL_WISDOM", label: "Sankofa Wisdom" }
                          ].map(c => (
                            <button
                              key={c.id}
                              onClick={() => setRecordCategory(c.id)}
                              className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium transition ${recordCategory === c.id ? "bg-pink-50 text-pink-700 border-pink-300 font-semibold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recording interface area */}
                      <div className="bg-pink-50/50 rounded-2xl border border-pink-100 p-4 flex flex-col items-center justify-center min-h-[140px]">
                        {recordedAudioUrl === null && !isRecordingMic ? (
                          // Initial state
                          <div className="text-center">
                            <button 
                              onClick={startRecordingPod}
                              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center transition shadow-lg shadow-red-500/20 mx-auto mb-2"
                            >
                              <Mic className="h-6 w-6 text-white" />
                            </button>
                            <span className="text-slate-600 block font-medium">Tap to Record Mic</span>
                            <span className="text-[10px] text-slate-400 block mt-1">Maximum 30 seconds</span>
                          </div>
                        ) : isRecordingMic ? (
                          // Active recording state
                          <div className="text-center w-full">
                            <button 
                              onClick={stopRecordingPodInstance}
                              className="h-14 w-14 rounded-full bg-red-700 hover:bg-red-800 active:scale-95 text-white flex items-center justify-center transition animate-pulse mx-auto mb-2"
                            >
                              <div className="h-5 w-5 bg-white rounded-sm"></div>
                            </button>
                            <span className="text-red-600 block font-bold uppercase tracking-wider text-[10px]">RECORDING AUDIO POD</span>
                            <span className="text-xl font-bold font-mono text-slate-800 block mt-1">
                              0:{recordingSeconds.toString().padStart(2, "0")} / 0:30
                            </span>

                            {/* Active Waves visualization bar container */}
                            <div className="flex items-center justify-center gap-1 h-12 mt-3 overflow-hidden px-4">
                              {recordingWaves.map((h, i) => (
                                <div 
                                  key={i} 
                                  className="w-1 bg-red-500 rounded-full transition-all duration-75"
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Recorded preview state
                          <div className="text-center w-full">
                            <span className="text-emerald-600 block font-bold text-[11px] mb-2">Recording Successful ({recordingSeconds}s)</span>
                            
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <button 
                                onClick={() => {
                                  // Quick preview voice synth
                                  if (synthRef.current) {
                                    synthRef.current.cancel();
                                    const utter = new SpeechSynthesisUtterance(simulatedTranscript);
                                    synthRef.current.speak(utter);
                                  }
                                }}
                                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
                              >
                                <Volume2 className="h-3.5 w-3.5 text-pink-600" /> Preview Audio
                              </button>
                              
                              <button 
                                onClick={startRecordingPod}
                                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
                              >
                                <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Redo
                              </button>
                            </div>

                            <textarea 
                              value={simulatedTranscript}
                              onChange={(e) => setSimulatedTranscript(e.target.value)}
                              rows={3}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-600 font-sans focus:ring-1 focus:ring-pink-500 focus:outline-none"
                              placeholder="Simulated spoken transcript..."
                            />
                            
                            <div className="mt-2.5 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg p-1.5 text-[9px] text-left">
                              <CloudLightning className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span>Submitting uploads triggers automated Gemini context checks and double anti-spam loops filtering!</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Display Submit feedback status */}
                      {uploadStatus === "UPLOADING" && (
                        <div className="flex items-center justify-center py-2 bg-pink-50 rounded-xl gap-2 text-pink-700">
                          <RefreshCw className="h-4 w-4 animate-spin text-pink-600" />
                          <span className="font-semibold text-[11px]">Running AI moderation and word-loop filters...</span>
                        </div>
                      )}

                      {uploadStatus === "SUCCESS" && (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-2.5 text-center">
                          <strong className="block font-bold text-[11px]">PASSED AUTOMATED SPEECH MODERATION!</strong>
                          <span className="text-[10px] block mt-0.5">{moderationReason}</span>
                        </div>
                      )}

                      {uploadStatus === "FAILED" && (
                        <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-2.5 text-center">
                          <strong className="block font-bold text-[11px] flex items-center justify-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" /> UPLOAD FLAGGED OR BLOCKED!
                          </strong>
                          <span className="text-[10px] block mt-0.5">{moderationReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                      <button 
                        onClick={() => { stopRecordingPodInstance(); setShowRecordModal(false); }}
                        className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-center hover:bg-slate-200 transition"
                      >
                        Close
                      </button>
                      <button 
                        disabled={recordedAudioUrl === null || !recordTitle || uploadStatus === "UPLOADING"}
                        onClick={handleUploadSubmit}
                        className={`flex-2 bg-pink-600 text-white font-bold py-2 rounded-xl text-center shadow-md transition ${(!recordTitle || recordedAudioUrl === null || uploadStatus === "UPLOADING") ? "opacity-50 cursor-not-allowed bg-pink-300" : "hover:bg-pink-700"}`}
                      >
                        Upload to Community
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SIMULATOR REPLY MODAL PANEL */}
              <AnimatePresence>
                {replyingToPod && (
                  <motion.div 
                    initial={{ y: 150 }}
                    animate={{ y: 0 }}
                    exit={{ y: 150 }}
                    className="absolute inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-2xl z-50 p-4 border-t border-slate-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <h4 className="font-bold text-slate-800 text-xs">Reply with 30s Voice Clip</h4>
                      <button onClick={() => setReplyingToPod(null)} className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <p className="text-slate-400 text-[10px]">Replying to: <strong className="font-semibold text-slate-700">"{replyingToPod.title}"</strong></p>
                      
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type voice reply transcript simulation here... e.g., Let's support each other! bolo na bolo na"
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-pink-500 focus:outline-none"
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">Duration (seconds):</span>
                        <input 
                          type="number" 
                          min={2} 
                          max={30}
                          value={replyDuration}
                          onChange={(e) => setReplyDuration(Math.min(30, parseInt(e.target.value) || 5))}
                          className="w-14 border border-slate-200 rounded-lg p-1 text-center font-mono"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => setReplyingToPod(null)}
                        className="flex-1 bg-slate-100 text-slate-700 font-semibold py-1.5 rounded-lg text-center text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={!replyText.trim() || isSubmittingReply}
                        onClick={handlePostReply}
                        className="flex-2 bg-pink-600 text-white font-bold py-1.5 rounded-lg text-center text-xs shadow hover:bg-pink-700 transition"
                      >
                        {isSubmittingReply ? "Analyzing..." : "Post Voice Reply"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Bottom physical home button bar */}
            <div className="h-1.5 w-32 bg-slate-800 rounded-full mx-auto mt-2"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFESSIONAL TECHNICAL ARCHITECT SYSTEM PANELS (58%) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl min-h-[680px]">
          
          {/* Tabs header bar */}
          <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 pt-3 flex-wrap gap-2">
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: "TDD", label: "TDD Architect Document", icon: FileText },
                { id: "SPECS", label: "Prisma & Swagger Specs", icon: Database },
                { id: "REACT_NATIVE", label: "Production Native Code", icon: Code },
                { id: "AUDIT_LOGS", label: "Moderation Pipeline Logs", icon: Terminal }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition ${isSelected ? "border-pink-500 text-pink-400 bg-slate-950/40" : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab viewport area */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[720px]">
            
            {/* TAB 1: TECHNICAL DESIGN DOCUMENT (TDD) */}
            {activeTab === "TDD" && (
              <div className="prose prose-invert prose-pink max-w-none text-slate-300 text-sm space-y-6">
                
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-500" /> Technical Design Document: VoxSphere
                  </h3>
                  <p className="text-xs text-slate-400">
                    A secure, voice-first community micro-podcasting platform designed for women's empowerment.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base border-b border-slate-800 pb-1.5 flex items-center gap-2">
                    <span className="text-xs h-5 w-5 bg-pink-500/10 text-pink-400 font-mono flex items-center justify-center rounded">1</span>
                    Low-Latency Audio Streaming on Mobile Networks (3G/4G)
                  </h4>
                  <p>
                    Ensuring barrier-free audio loading for low-bandwidth networks in rural and semi-urban environments requires a strict optimization pipeline:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
                    <li>
                      <strong className="text-slate-200">High-Efficiency Encoding (AAC-HEv2):</strong> Raw audio captured via <code className="text-pink-400 bg-slate-900 px-1 py-0.5 rounded font-mono">expo-av</code> is converted to AAC-HEv2 format on the client, or compressed via a server-side FFmpeg pipeline, targeting a bit rate of <code className="text-emerald-400 font-bold">32-48 kbps</code> (mono). A 30-second audio clip consumes only ~120KB to 180KB of data, meaning loading completes in under <strong className="text-slate-200">250ms</strong> even on congested 3G networks.
                    </li>
                    <li>
                      <strong className="text-slate-200">HLS Segmented Streaming:</strong> For long-form responses or creators, audio is partitioned into 2-second HTTP Live Streaming (HLS) chunks. Playback begins instantly when the first segment resolves, bypasses buffering delays, and scales adaptively according to active packet delivery metrics.
                    </li>
                    <li>
                      <strong className="text-slate-200">CDN Infrastructure Routing:</strong> Audio files are cached at edge locations globally via CloudFront or Fastly. We leverage standard cache-control parameters (<code className="text-pink-400 font-mono">public, max-age=31536000</code>) because micro-podcasts are static and immutable once moderated, minimizing database read overhead.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base border-b border-slate-800 pb-1.5 flex items-center gap-2">
                    <span className="text-xs h-5 w-5 bg-pink-500/10 text-pink-400 font-mono flex items-center justify-center rounded">2</span>
                    Automated Speech Moderation & Cognitive Anti-Spam Pipeline
                  </h4>
                  <p>
                    Since VoxSphere is a supportive, safe space exclusively for women, we implement an asynchronous, double-key moderation queue:
                  </p>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Terminal className="h-4 w-4" />
                      <span>Moderation Engine Flowchart:</span>
                    </div>
                    <div className="space-y-1 text-slate-400 pl-4">
                      <p>1. [User Mic Recording] → base64 audio submitted to Server</p>
                      <p>2. [Storage check] → Confirm current active count &lt; 10 pods threshold</p>
                      <p>3. [Speech-to-Text conversion] → Handled via Gemini Whisper API / GCS</p>
                      <p>4. [Strict Rule Scan] → Heuristic filter checking word repeats (e.g. "bolo na" loops)</p>
                      <p>5. [Cognitive Context Check] → Gemini AI evaluation for community safety & category fit</p>
                      <p>6. [Database Commit] → Set APPROVED or FLAGGED state (saved, audit logging updated)</p>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
                    <li>
                      <strong className="text-slate-200">The "Bolo Na" Loop & Spam Filter:</strong> Users attempting to loop repetitive phrases to farm engagement or gamify systems are filtered out via standard suffix-tree and sliding-window repetition analyzers. Words matched sequentially 3 times or excessive single word clusters flag the post as SPAM immediately, saving server processing costs.
                    </li>
                    <li>
                      <strong className="text-slate-200">Asynchronous processing:</strong> High concurrency uploads do not block Express response threads. File upload triggers a pub-sub message inside Cloud Tasks, returning a 202 Accepted status immediately. The moderation script completes within seconds, updating database state and pushing live socket updates to client feeds.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base border-b border-slate-800 pb-1.5 flex items-center gap-2">
                    <span className="text-xs h-5 w-5 bg-pink-500/10 text-pink-400 font-mono flex items-center justify-center rounded">3</span>
                    Prisma PostgreSQL Relational Model & Draft Constraints
                  </h4>
                  <p>
                    To ensure high consistency for community statistics, contests, and creator roles, PostgreSQL is structured with standard relational constraints:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
                    <li>
                      <strong className="text-slate-200">Role-Based Access (RBAC):</strong> Separated roles (<code className="text-pink-400 font-mono">Role.USER</code>, <code className="text-pink-400 font-mono">VERIFIED_CREATOR</code>, <code className="text-pink-400 font-mono">NGO_PARTNER</code>) govern creation capabilities, allow NGO partners to embed external links, and bypass draft constraints.
                    </li>
                    <li>
                      <strong className="text-slate-200">Draft / Storage Quota (10 Pod threshold):</strong> To optimize cloud storage usage and combat noise, non-premium users are restricted to maximum 10 active pods or drafts. The schema facilitates index-backed scanning of active pods, allowing Express controllers to instantly reject uploads when <code className="text-pink-400 font-mono">pods.count &gt;= 10</code>.
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {/* TAB 2: PRISMA & OPENAPI SPECIFICATIONS */}
            {activeTab === "SPECS" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-4.5 w-4.5 text-pink-500" />
                      <h4 className="text-white font-bold text-sm">Prisma Database Schema (schema.prisma)</h4>
                    </div>
                    <button 
                      onClick={() => handleCopyCode(prismaSchema)}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      {copiedText === "Copied!" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedText || "Copy Schema"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[250px] scrollbar-thin">
                    <code>{prismaSchema}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4.5 w-4.5 text-emerald-500" />
                      <h4 className="text-white font-bold text-sm">OpenAPI 3.0 YAML specification</h4>
                    </div>
                    <button 
                      onClick={() => handleCopyCode(openapiYaml)}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      {copiedText === "Copied!" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedText || "Copy API Spec"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[350px] scrollbar-thin">
                    <code>{openapiYaml}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTION READY REACT NATIVE EXPORTER */}
            {activeTab === "REACT_NATIVE" && (
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-bold text-sm">React Native Expo + TypeScript Codebase</h4>
                    <p className="text-xs text-slate-400">
                      Fully-typed components incorporating <code className="text-pink-400 font-mono">expo-av</code>, audio wave simulation, and quota constraints.
                    </p>
                  </div>

                  <div className="flex gap-1.5">
                    {["PodCard", "FeedScreen", "RecordPodModal"].map(file => (
                      <button
                        key={file}
                        onClick={() => setSelectedNativeFile(file as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedNativeFile === file ? "bg-pink-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                      >
                        {file}.tsx
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-mono">
                      Location: /src/components/react-native/{selectedNativeFile}.tsx
                    </span>
                    <button 
                      onClick={() => handleCopyCode(nativeCodes[selectedNativeFile])}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      {copiedText === "Copied!" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedText || "Copy Code"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[460px] scrollbar-thin">
                    <code>{nativeCodes[selectedNativeFile] || "// Code loading..."}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: AUTOMATED AUDIT LOGS VIEW */}
            {activeTab === "AUDIT_LOGS" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-sm">Live Audio Moderation Queue</h4>
                    <p className="text-xs text-slate-400">Audit trace of upload transcripts, loop analyses, and safety ratings.</p>
                  </div>
                  <button 
                    onClick={fetchAuditLogs}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Logs
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl border transition ${log.status === "APPROVED" ? "bg-slate-900/60 border-emerald-950" : "bg-red-950/25 border-red-950"}`}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${log.type === "UPLOAD" ? "bg-pink-500/10 text-pink-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                            {log.type}
                          </span>
                          <span className="text-slate-400 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${log.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {log.status}
                        </span>
                      </div>

                      {log.podTitle && (
                        <h5 className="text-white text-xs font-bold mb-1">Title: "{log.podTitle}"</h5>
                      )}
                      
                      <p className="text-slate-300 text-xs italic mb-3 bg-slate-950 p-2.5 rounded border border-slate-900 font-mono">
                        "{log.transcript}"
                      </p>

                      <div className="text-[10px] space-y-1.5 text-slate-400">
                        <div className="flex items-center gap-1">
                          <strong className="text-slate-300 font-bold">Rules Scanned:</strong>
                          <span>{log.rulesChecked.join(", ")}</span>
                        </div>

                        {log.geminiAnalysis && (
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-900 space-y-1 mt-2 font-mono text-[9px]">
                            <p className="text-pink-400 font-bold">GEMINI COGNITIVE SCAN SUMMARY:</p>
                            <p className="text-slate-300">Decision: {log.geminiAnalysis.reason || log.geminiAnalysis.note || "Safe text verified"}</p>
                            {log.geminiAnalysis.safetyScore !== undefined && (
                              <p className="text-slate-400">Safety Score: <strong className={log.geminiAnalysis.safetyScore >= 0.75 ? "text-emerald-400" : "text-amber-400"}>{log.geminiAnalysis.safetyScore}</strong></p>
                            )}
                            {log.geminiAnalysis.categoryMatch && (
                              <p className="text-slate-400">Category Tagged: <strong className="text-pink-400">{log.geminiAnalysis.categoryMatch}</strong></p>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Dev Panel Footer */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 text-xs flex justify-between items-center text-slate-500">
            <span>Powered by Gemini-3.5-Flash</span>
            <span>Principal Full-Stack Architect Console</span>
          </div>

        </div>

      </main>

      {/* Portal Global Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 mt-12 bg-slate-950 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 VoxSphere. Crafted with perfect system scaling constraints & dual-moderation engines.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition">Security Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition">Dev Sandbox API Docs</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
