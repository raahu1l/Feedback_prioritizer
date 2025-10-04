// Local storage helpers
const STORAGE_KEY = 'feedback-prioritizer:v1'

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

// Priority scoring using keyword matches + urgency and category weights
const KEYWORDS = {
  outage: 3,
  crash: 3,
  error: 2,
  broken: 2,
  slow: 1.5,
  performance: 1.5,
  billing: 2,
  payment: 2,
  security: 3,
  accessibility: 2,
  confusing: 1.5,
  bug: 2,
  feature: 1
}

const CATEGORY_WEIGHTS = {
  'Bug': 2,
  'Performance': 1.5,
  'Billing': 2,
  'UI/UX': 1,
  'Feature': 1,
  'Other': 0.5
}

const URGENCY_WEIGHTS = { low: 1, medium: 1.5, high: 2 }

export function applyPriorityScore(item) {
  const text = (item.title + ' ' + item.description).toLowerCase()
  let score = 0
  for (const [kw, weight] of Object.entries(KEYWORDS)) {
    if (text.includes(kw)) score += weight
  }
  const categoryWeight = CATEGORY_WEIGHTS[item.category] ?? 1
  const urgencyWeight = URGENCY_WEIGHTS[item.urgency] ?? 1
  // Normalize and cap at 10 for display
  let finalScore = Math.min(10, (score * categoryWeight * urgencyWeight) / 2)
  return { ...item, priorityScore: finalScore }
}

// Basic sentiment using word lists
const POSITIVE = ['love', 'great', 'excellent', 'amazing', 'fast', 'intuitive', 'happy']
const NEGATIVE = ['hate', 'bad', 'terrible', 'slow', 'confusing', 'broken', 'bug', 'crash']

export function applySentiment(item) {
  const text = (item.title + ' ' + item.description).toLowerCase()
  let score = 0
  POSITIVE.forEach(w => { if (text.includes(w)) score += 1 })
  NEGATIVE.forEach(w => { if (text.includes(w)) score -= 1 })
  const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
  return { ...item, sentiment }
}

// CSV export
export function exportToCsv(items) {
  const headers = ['Title','Description','Category','Urgency','PriorityScore','Sentiment','CreatedAt']
  const rows = items.map(i => [
    escapeCsv(i.title),
    escapeCsv(i.description),
    i.category,
    i.urgency,
    i.priorityScore?.toFixed(1) ?? '',
    i.sentiment ?? '',
    i.createdAt ? new Date(i.createdAt).toISOString() : ''
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'feedback_export.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeCsv(value) {
  const v = String(value ?? '')
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replaceAll('"', '""') + '"'
  }
  return v
}

// Demo data
export function loadDemoData() {
  const samples = [
    { title: 'Checkout crashes on submit', description: 'Users see crash after clicking pay. Affects billing.', category: 'Bug', urgency: 'high' },
    { title: 'App feels slow on dashboard', description: 'Performance issues with graphs loading.', category: 'Performance', urgency: 'medium' },
    { title: 'Dark mode feature request', description: 'Customers would love a dark theme for late hours.', category: 'Feature', urgency: 'low' },
    { title: 'Confusing onboarding flow', description: 'New users find setup confusing and give up.', category: 'UI/UX', urgency: 'medium' },
    { title: 'Payment declined errors', description: 'Frequent billing errors when using certain cards.', category: 'Billing', urgency: 'high' },
    { title: 'Accessibility improvements', description: 'Screen reader support is terrible on settings page.', category: 'UI/UX', urgency: 'medium' },
    { title: 'Security concern on tokens', description: 'Possible token leak in logs.', category: 'Other', urgency: 'high' },
    { title: 'Great feature but slow', description: 'Love the new export but it is slow with large data.', category: 'Performance', urgency: 'medium' },
    { title: 'Bug: profile picture upload broken', description: 'Broken upload on Safari.', category: 'Bug', urgency: 'medium' },
    { title: 'Improve mobile navigation', description: 'Hard to reach actions on small screens.', category: 'UI/UX', urgency: 'low' },
    { title: 'Crash on Android 14', description: 'App crash reported after latest update.', category: 'Bug', urgency: 'high' },
    { title: 'Billing invoice download', description: 'Request to export invoices as PDF.', category: 'Feature', urgency: 'low' },
    { title: 'Add SSO login', description: 'Enterprises want SSO capability.', category: 'Feature', urgency: 'medium' },
    { title: 'Confusing error messages', description: 'Errors are not intuitive; users hate reading them.', category: 'UI/UX', urgency: 'medium' },
    { title: 'Improve search speed', description: 'Search is slow for large datasets.', category: 'Performance', urgency: 'high' },
    { title: 'Great onboarding video', description: 'Excellent tutorial, users are happy.', category: 'Other', urgency: 'low' },
    { title: 'Two-factor auth issues', description: '2FA codes sometimes fail; security risk.', category: 'Other', urgency: 'high' },
    { title: 'Bug: notifications duplicated', description: 'Users get duplicate notifications.', category: 'Bug', urgency: 'low' },
    { title: 'Intuitive reports', description: 'Reports look great and are intuitive, but slow.', category: 'Performance', urgency: 'medium' },
    { title: 'Terrible lag on uploads', description: 'Uploads are slow and sometimes error out.', category: 'Performance', urgency: 'high' },
    { title: 'Love the new UI', description: 'Excellent refresh, feels modern.', category: 'UI/UX', urgency: 'low' },
    { title: 'Broken link on pricing', description: 'Bug: Pricing page link is broken.', category: 'Bug', urgency: 'medium' },
    { title: 'Payment flow confusing', description: 'Checkout steps are confusing; users abandon.', category: 'Billing', urgency: 'high' },
    { title: 'Crash after importing CSV', description: 'Crash occurs with large CSV files.', category: 'Bug', urgency: 'high' },
    { title: 'Happy with customer support', description: 'Great response times!', category: 'Other', urgency: 'low' },
    { title: 'Bad experience on tablet', description: 'UI elements overlap; terrible layout.', category: 'UI/UX', urgency: 'medium' },
    { title: 'Security: password reset bug', description: 'Bug in reset flow may expose data.', category: 'Other', urgency: 'high' },
    { title: 'Feature: bulk edit', description: 'Request bulk editing capabilities.', category: 'Feature', urgency: 'medium' },
    { title: 'Confusing permissions model', description: 'Role management is confusing.', category: 'Other', urgency: 'medium' },
    { title: 'Crash when opening settings', description: 'App crash after tapping settings icon.', category: 'Bug', urgency: 'high' }
  ]
  return samples.map(s => ({
    ...s,
    id: crypto.randomUUID(),
    createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)
  }))
}


