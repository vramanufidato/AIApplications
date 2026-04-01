import React, { useState } from 'react'

const ThreadCard = ({ title, status, summary, assets }) => (
  <div className="thread-card">
    <div className="thread-header">
      <div>
        <div className="thread-status">{status}</div>
        <h2 className="thread-title">{title}</h2>
      </div>
    </div>
    <p className="thread-summary">{summary}</p>
    <div className="thread-assets">
      {assets.map((asset, i) => (
        <span key={i} className="asset-tag">{asset}</span>
      ))}
    </div>
  </div>
)

function App() {
  const [threads] = useState([
    {
      title: "2026 EV Trends",
      status: "Researching",
      summary: "Aggregating battery density reports and infrastructure rollout plans for Southeast Asia. AI Agent has summarized 14/20 sources.",
      assets: ["EV_Comparison.pdf", "Grid_Map.svg", "Market_Cap.json"]
    },
    {
      title: "UI System Refactor",
      status: "Creator Mode",
      summary: "Working on the design system documentation. Auto-compiling Rust modules for the core rendering engine in the background.",
      assets: ["main.rs", "core_layout.css", "icon_set.pkg"]
    },
    {
      title: "Tokyo Trip Planner",
      status: "Action Thread",
      summary: "Agent found the cheapest direct flight ($740) and is currently waiting for confirmation on hotel availability in Shibuya.",
      assets: ["itinerary.md", "booking_draft.html"]
    }
  ])

  return (
    <div className="nexus-shell">
      <div className="command-bar-container">
        <div className="command-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            className="command-input" 
            placeholder="Type a task: 'Find a cheap flight to Tokyo...' or search your memory"
            type="text"
          />
        </div>
      </div>

      <div className="workspace-canvas">
        {threads.map((thread, index) => (
          <ThreadCard key={index} {...thread} />
        ))}
      </div>

      <div className="ghost-agent">
        <div className="scanning-glow"></div>
        Agent Active: Shadowing Task "EV Research"
      </div>
    </div>
  )
}

export default App
