import React from 'react'

export function Landing({ onStart, onDemo, loading }) {
  return (
    <div className="card landing">
      <h2>Prioritize What Matters</h2>
      <p>
        Product teams drown in feedback. This lightweight app scores and sorts feedback using simple, transparent rules so you can focus on high-impact work—no heavy AI or backend required.
      </p>
      <ul>
        <li>Input customer feedback with category and urgency</li>
        <li>Automatic priority scoring and basic sentiment</li>
        <li>Filter, export to CSV, and demo mode with sample data</li>
      </ul>
      <div className="row">
        <button className="btn" onClick={onStart}>Start</button>
        <button className="btn secondary" onClick={onDemo} disabled={loading}>{loading ? 'Loading…' : 'Load Demo Data'}</button>
      </div>
    </div>
  )
}


