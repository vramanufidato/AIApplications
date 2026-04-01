import React, { useState, useEffect } from 'react';
import './styles/index.css';
import { generateAIBleuprint, generateLocalBlueprint } from './utils/generators';

function App() {
  const [topic, setTopic] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [activeTab, setActiveTab] = useState('script');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Persist API Key in LocalStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setShowSettings(false);
  };

  const handleGenerate = async (useAI = false) => {
    if (!topic) return;
    setError('');
    setIsGenerating(true);
    setBlueprint(null);

    try {
      if (useAI) {
        if (!apiKey) {
          setShowSettings(true);
          throw new Error("Gemini API Key needed for AI orchestration.");
        }
        const result = await generateAIBleuprint(topic, apiKey);
        setBlueprint(result);
      } else {
        // Fallback or "Demo Mode"
        setTimeout(() => {
          const result = generateLocalBlueprint(topic);
          setBlueprint(result);
          setIsGenerating(false);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(useAI ? false : undefined); // Local uses timeout logic
    }
  };

  return (
    <div className="app-container fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #3b82f6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Architect Pro
          </h1>
          <p style={{ color: 'var(--text-dim)' }}>Orchestrate 10-Minute Narrative Masterpieces in Seconds</p>
        </div>
        <button 
          className="tab-btn" 
          onClick={() => setShowSettings(!showSettings)}
          style={{ border: '1px solid var(--border)', padding: '0.8rem 1rem' }}
        >
          {apiKey ? '⚙️ Settings' : '🔑 Setup AI'}
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass-card fade-in" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <h3>Gemini API Configuration</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            To generate 1,500-word scripts and 60+ prompts, provide your Google AI Studio key.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="password" 
              placeholder="Paste your Gemini 1.5 Flash Key..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ flex: 1, padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--border)' }}
            />
            <button className="btn-primary" onClick={saveApiKey}>Save & Connect</button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <section className="glass-card" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <input 
            type="text" 
            className="big-input"
            placeholder="What should your 10-minute masterpiece be about? (e.g. History of Rome, Future of AGI...)" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border)', 
              borderRadius: '0.75rem', 
              padding: '1.5rem', 
              color: 'white',
              fontSize: '1.2rem'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-primary" 
              style={{ flex: 1 }}
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
            >
              {isGenerating ? 'AI ARCHITECTING...' : '🚀 Generate with Google Gemini AI'}
            </button>
            <button 
              className="tab-btn" 
              style={{ color: 'var(--text-dim)', textDecoration: 'underline' }}
              onClick={() => handleGenerate(false)}
            >
              Run Local Demo
            </button>
          </div>
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>⚠️ {error}</p>}
      </section>

      {blueprint && (
        <div className="fade-in">
          <nav className="nav-tabs">
            <button className={`tab-btn ${activeTab === 'script' ? 'active' : ''}`} onClick={() => setActiveTab('script')}>
              📜 1,500-Word Script
            </button>
            <button className={`tab-btn ${activeTab === 'visuals' ? 'active' : ''}`} onClick={() => setActiveTab('visuals')}>
              🎨 Visual Assets (60+)
            </button>
            <button className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>
              📡 Metadata & SEO
            </button>
          </nav>

          <main>
            {activeTab === 'script' && (
              <div style={{ display: 'grid', gap: '2rem' }}>
                <div className="glass-card" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed var(--primary)' }}>
                   <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Pro Tip: Pro Tip: Copy these 2-minute sections exactly into Google AI Studio TTS.</p>
                </div>
                {blueprint.chapters.map(chapter => (
                  <div key={chapter.id} className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.5rem' }}>Ch {chapter.id}: {chapter.title}</h2>
                      <span className="badge" style={{ background: '#3b82f6', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}>{chapter.timestamp}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                      {chapter.script || chapter.description}
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                      <button className="tab-btn" onClick={() => navigator.clipboard.writeText(chapter.script || chapter.description)}>
                        📋 Copy Section
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'visuals' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Leonardo.ai (60 High-Quality Prompts)</h3>
                  {blueprint.chapters.map(ch => (
                    <div key={ch.id} style={{ marginBottom: '2rem' }}>
                      <h4 style={{ opacity: 0.7, marginBottom: '1rem' }}>Chapter {ch.id} Imagery</h4>
                      <ul style={{ listStyle: 'none' }}>
                        {ch.imagePrompts.map((p, i) => (
                          <li key={i} style={{ marginBottom: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.5rem', color: '#a855f7' }}>CapCut Hero Video Clips (12 Clips)</h3>
                  {blueprint.chapters.map(ch => (
                    <div key={ch.id} style={{ marginBottom: '2rem' }}>
                      <h4 style={{ opacity: 0.7, marginBottom: '1rem' }}>Chapter {ch.id} Video</h4>
                      {ch.videoPrompts.map((p, i) => (
                        <div key={i} style={{ marginBottom: '0.8rem', padding: '1rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(168, 85, 247, 0.2)', fontSize: '0.9rem' }}>
                          {p}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
               <div className="glass-card" style={{ display: 'grid', gap: '2rem' }}>
               <div>
                 <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>CTR Titles (Under 70 Chars)</h3>
                 {blueprint.seo.titles.map((title, i) => (
                   <div key={i} style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.2rem', borderRadius: '0.8rem', marginBottom: '0.8rem', border: '1px solid var(--primary)' }}>
                     {title}
                   </div>
                 ))}
               </div>
               <div>
                 <h3 style={{ marginBottom: '1rem' }}>Full SEO Summary (500 Words)</h3>
                 <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '1rem', lineHeight: '1.6', color: 'var(--text-dim)' }}>
                   {blueprint.seo.summary}
                 </div>
               </div>
               <div>
                  <h3 style={{ marginBottom: '1rem' }}>Recommended Tags</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {blueprint.seo.tags.map((tag, i) => (
                      <span key={i} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
               </div>
             </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
