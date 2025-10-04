import React from 'react'

export function Filters({ filters, onChange }) {
  const set = (key, value) => onChange(prev => ({ ...prev, [key]: value }))
  return (
    <div className="card">
      <h2>Filters</h2>
      <div className="row">
        <label>
          <span>Category</span>
          <select value={filters.category} onChange={e => set('category', e.target.value)}>
            <option value="all">All</option>
            <option>Bug</option>
            <option>Feature</option>
            <option>UI/UX</option>
            <option>Performance</option>
            <option>Billing</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select value={filters.priority} onChange={e => set('priority', e.target.value)}>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>
      <label>
        <span>Search</span>
        <input value={filters.search} onChange={e => set('search', e.target.value)} placeholder="Search title/description" />
      </label>
    </div>
  )
}


