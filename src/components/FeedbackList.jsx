import React from 'react'

function badgeClass(score) {
  if (score >= 8) return 'badge high'
  if (score >= 4) return 'badge medium'
  return 'badge low'
}

export function FeedbackList({ items }) {
  if (!items.length) {
    return <div className="card">No feedback yet. Add some or load demo data.</div>
  }
  return (
    <div className="list">
      {items.map(item => (
        <article key={item.id} className="card item">
          <div className="item-head">
            <h3>{item.title}</h3>
            <span className={badgeClass(item.priorityScore)}>{item.priorityScore.toFixed(1)}</span>
          </div>
          <p className="muted">{new Date(item.createdAt ?? Date.now()).toLocaleString()}</p>
          <p>{item.description}</p>
          <div className="meta">
            <span className="pill">{item.category}</span>
            <span className="pill">Urgency: {item.urgency}</span>
            {item.sentiment && <span className={`pill ${item.sentiment}`}>Sentiment: {item.sentiment}</span>}
          </div>
        </article>
      ))}
    </div>
  )
}


