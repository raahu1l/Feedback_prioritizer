import React, { useState } from 'react'

const CATEGORIES = ['Bug', 'Feature', 'UI/UX', 'Performance', 'Billing', 'Other']

export function FeedbackForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [urgency, setUrgency] = useState('low')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      return
    }
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      onAdd({ title: title.trim(), description: description.trim(), category, urgency })
      setTitle('')
      setDescription('')
      setCategory(CATEGORIES[0])
      setUrgency('low')
      setSubmitting(false)
    }, 200)
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Add Feedback</h2>
      {error && <div className="alert">{error}</div>}
      <label>
        <span>Title</span>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief summary" />
      </label>
      <label>
        <span>Description</span>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What happened or what's needed?" rows={4} />
      </label>
      <div className="row">
        <label>
          <span>Category</span>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span>Urgency</span>
          <select value={urgency} onChange={e => setUrgency(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Feedback'}</button>
    </form>
  )
}


