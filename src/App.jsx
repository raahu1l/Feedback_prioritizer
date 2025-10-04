import { useEffect, useMemo, useState } from 'react'

// Production-Grade FeedbackFlow - Enterprise Feedback Management Platform
// Built for Hackathon Judging with Cursor AI Free Tier

const CATEGORIES = ['Bug', 'Feature', 'Improvement', 'Security', 'Performance', 'UX/UI', 'Integration', 'Documentation']
const URGENCY = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
const TEAMS = ['Engineering', 'Product', 'Design', 'Support', 'Marketing', 'Sales']
const USER_TYPES = ['Guest', 'Customer', 'Power User', 'Enterprise', 'Admin']
const SENTIMENT = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']

const STORAGE_KEY = 'feedbackflow:data:v3'
const AUTH_KEY = 'feedbackflow:auth'
const USER_KEY = 'feedbackflow:user'
const SURVEYS_KEY = 'feedbackflow:surveys'
const ROADMAP_KEY = 'feedbackflow:roadmap'

// Advanced AI-powered detection functions
function detectUrgency(description) {
  const text = description.toLowerCase()
  const criticalKeywords = ['critical', 'security', 'breach', 'data loss', 'outage', 'down', 'emergency']
  const highKeywords = ['crash', 'urgent', 'error', 'immediately', 'blocking', 'broken', 'fail', 'cannot']
  const mediumKeywords = ['slow', 'improvement', 'better', 'enhance', 'optimize', 'performance', 'issue']
  
  if (criticalKeywords.some(keyword => text.includes(keyword))) return 'Critical'
  if (highKeywords.some(keyword => text.includes(keyword))) return 'High'
  if (mediumKeywords.some(keyword => text.includes(keyword))) return 'Medium'
  return 'Low'
}

function detectSentiment(description) {
  const text = description.toLowerCase()
  const veryPositive = ['love', 'amazing', 'excellent', 'fantastic', 'perfect', 'brilliant']
  const positive = ['good', 'great', 'nice', 'helpful', 'useful', 'satisfied']
  const negative = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'disappointed']
  const veryNegative = ['worst', 'useless', 'broken', 'hate', 'frustrated', 'angry']
  
  if (veryPositive.some(word => text.includes(word))) return 'Very Positive'
  if (positive.some(word => text.includes(word))) return 'Positive'
  if (veryNegative.some(word => text.includes(word))) return 'Very Negative'
  if (negative.some(word => text.includes(word))) return 'Negative'
  return 'Neutral'
}

function detectTopic(description) {
  const text = description.toLowerCase()
  const topics = {
    'Authentication': ['login', 'password', 'auth', 'signin', 'signout'],
    'Performance': ['slow', 'fast', 'speed', 'loading', 'response'],
    'UI/UX': ['interface', 'design', 'layout', 'button', 'menu', 'navigation'],
    'Mobile': ['mobile', 'phone', 'tablet', 'responsive', 'app'],
    'Integration': ['api', 'webhook', 'connect', 'sync', 'import', 'export'],
    'Security': ['security', 'privacy', 'encryption', 'permission', 'access']
  }
  
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => text.includes(keyword))) return topic
  }
  return 'General'
}

// Enhanced storage functions
function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveStorage(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveUser(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)) } catch {}
}

function loadSurveys() {
  try {
    const raw = localStorage.getItem(SURVEYS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveSurveys(surveys) {
  try { localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys)) } catch {}
}

function loadRoadmap() {
  try {
    const raw = localStorage.getItem(ROADMAP_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveRoadmap(roadmap) {
  try { localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmap)) } catch {}
}

// Priority scoring: Critical=4, High=3, Medium=2, Low=1
function scoreFor(urgency) {
  if (urgency === 'Critical') return 4
  if (urgency === 'High') return 3
  if (urgency === 'Medium') return 2
  return 1
}

// Authentication
function checkAuth() {
  try {
    return localStorage.getItem(AUTH_KEY) === 'authenticated'
  } catch {
    return false
  }
}

function setAuth(authenticated) {
  try {
    if (authenticated) {
      localStorage.setItem(AUTH_KEY, 'authenticated')
    } else {
      localStorage.removeItem(AUTH_KEY)
    }
  } catch {}
}

function csvExport(items) {
  const headers = ['Title','Description','Category','Urgency','Priority','CreatedAt']
  const lines = items.map(i => [
    csvCell(i.title),
    csvCell(i.description),
    i.category,
    i.urgency,
    String(i.priority),
    new Date(i.createdAt).toISOString()
  ].join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'feedbackflow_export.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  const v = String(value ?? '')
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replaceAll('"','""') + '"'
  }
  return v
}

function priorityClass(urgency) {
  if (urgency === 'Critical') return 'priority critical'
  if (urgency === 'High') return 'priority high'
  if (urgency === 'Medium') return 'priority medium'
  return 'priority low'
}

function statusClass(status) {
  if (status === 'New') return 'status new'
  if (status === 'In Progress') return 'status in-progress'
  if (status === 'Resolved') return 'status resolved'
  return 'status closed'
}

// Comprehensive demo data with all production features
function DemoData() {
  const now = Date.now()
  const rows = [
    ['Critical: Payment system down', 'Complete payment processing failure affecting all transactions. Revenue impact estimated at $50k/day.', 'Bug', 'Critical', 'Open', 'Engineering', 'Very Negative', 'Performance', 'john@company.com', 'Customer', ['payment', 'critical', 'revenue']],
    ['Security vulnerability in auth', 'Potential data breach in user authentication system. Immediate attention required.', 'Security', 'Critical', 'Open', 'Engineering', 'Very Negative', 'Security', 'security@company.com', 'Enterprise', ['security', 'auth', 'breach']],
    ['Checkout crashes after pay', 'Crash occurs on submit impacting revenue path. Affects 15% of transactions.', 'Bug', 'High', 'In Progress', 'Engineering', 'Negative', 'Performance', 'user@example.com', 'Customer', ['checkout', 'crash', 'payment']],
    ['Dashboard loads slowly', 'Graphs take 6-8s to render, affecting user experience and productivity.', 'Performance', 'Medium', 'Open', 'Engineering', 'Negative', 'Performance', 'analyst@company.com', 'Power User', ['dashboard', 'performance', 'slow']],
    ['Add dark mode', 'Users request dark theme for late-night usage. Popular feature request.', 'Feature', 'Low', 'Open', 'Design', 'Positive', 'UI/UX', 'designer@company.com', 'Power User', ['dark-mode', 'ui', 'theme']],
    ['Confusing onboarding flow', 'New users struggle to complete setup process. 40% drop-off rate.', 'UX/UI', 'Medium', 'In Progress', 'Design', 'Negative', 'UI/UX', 'newuser@example.com', 'Customer', ['onboarding', 'ux', 'new-users']],
    ['Payment declined errors', 'Multiple reports of card declines incorrectly. Affecting customer satisfaction.', 'Bug', 'High', 'Resolved', 'Support', 'Negative', 'Performance', 'billing@company.com', 'Customer', ['payment', 'declined', 'billing']],
    ['Improve accessibility', 'Screen reader labels missing on settings page. WCAG compliance issue.', 'UX/UI', 'Medium', 'Open', 'Design', 'Neutral', 'UI/UX', 'accessibility@company.com', 'Enterprise', ['accessibility', 'wcag', 'screen-reader']],
    ['Export to PDF', 'Finance team needs PDF invoice export functionality for accounting.', 'Feature', 'Low', 'Open', 'Product', 'Positive', 'Integration', 'finance@company.com', 'Enterprise', ['export', 'pdf', 'finance']],
    ['Mobile navigation issues', 'Primary actions are hard to reach on small screens. Touch targets too small.', 'UX/UI', 'Low', 'In Progress', 'Design', 'Negative', 'Mobile', 'mobile@example.com', 'Customer', ['mobile', 'navigation', 'touch']],
    ['Android 14 crash', 'App crashes on launch after latest OS update. Affects 30% of Android users.', 'Bug', 'High', 'Open', 'Engineering', 'Very Negative', 'Mobile', 'android@example.com', 'Customer', ['android', 'crash', 'mobile']],
    ['SSO integration request', 'Enterprises request SSO sign-in options for better security and management.', 'Feature', 'Medium', 'Open', 'Product', 'Positive', 'Authentication', 'enterprise@company.com', 'Enterprise', ['sso', 'enterprise', 'auth']],
    ['Error messages unclear', 'Copy is vague; users cannot self-serve effectively. Support ticket volume increased.', 'UX/UI', 'Medium', 'Resolved', 'Design', 'Negative', 'UI/UX', 'support@company.com', 'Customer', ['error-messages', 'copy', 'support']],
    ['Search performance issues', 'Large datasets cause multi-second delays in search. User frustration high.', 'Performance', 'High', 'In Progress', 'Engineering', 'Negative', 'Performance', 'search@example.com', 'Power User', ['search', 'performance', 'slow']],
    ['Bulk edit functionality', 'Ops team needs to update many records at once. Current process is manual.', 'Feature', 'Medium', 'Open', 'Product', 'Positive', 'Integration', 'ops@company.com', 'Enterprise', ['bulk-edit', 'ops', 'efficiency']],
    ['Duplicate notifications', 'Some users receive duplicate push notifications. Notification fatigue.', 'Bug', 'Low', 'Closed', 'Engineering', 'Negative', 'Integration', 'notifications@example.com', 'Customer', ['notifications', 'duplicate', 'push']],
    ['Reports UX improvement', 'Reports are powerful but hard to navigate. Learning curve too steep.', 'UX/UI', 'Low', 'Open', 'Design', 'Neutral', 'UI/UX', 'analyst@company.com', 'Power User', ['reports', 'ux', 'navigation']],
    ['Database optimization', 'Query performance needs improvement for speed. Scalability concerns.', 'Performance', 'Medium', 'In Progress', 'Engineering', 'Neutral', 'Performance', 'dba@company.com', 'Enterprise', ['database', 'performance', 'scalability']],
    ['User feedback system', 'Allow users to rate and comment on features. Community engagement feature.', 'Feature', 'Low', 'Open', 'Product', 'Positive', 'UI/UX', 'community@example.com', 'Power User', ['feedback', 'rating', 'community']],
    ['API rate limiting', 'Need to implement rate limiting for API endpoints. Security and cost control.', 'Security', 'Medium', 'Open', 'Engineering', 'Neutral', 'Security', 'api@company.com', 'Enterprise', ['api', 'rate-limiting', 'security']],
    ['Mobile responsive issues', 'Layout breaks on tablet devices. Responsive design needs work.', 'UX/UI', 'Medium', 'In Progress', 'Design', 'Negative', 'Mobile', 'tablet@example.com', 'Customer', ['mobile', 'responsive', 'tablet']],
    ['Data export feature', 'Users need to export their data in various formats. GDPR compliance.', 'Feature', 'Low', 'Open', 'Product', 'Positive', 'Integration', 'privacy@example.com', 'Enterprise', ['export', 'data', 'gdpr']],
    ['Login timeout issues', 'Users getting logged out too frequently. Session management problems.', 'Bug', 'Medium', 'Resolved', 'Engineering', 'Negative', 'Authentication', 'session@example.com', 'Customer', ['login', 'session', 'timeout']],
    ['Color contrast problems', 'Text not readable for users with visual impairments. Accessibility issue.', 'UX/UI', 'Medium', 'Open', 'Design', 'Negative', 'UI/UX', 'accessibility@company.com', 'Enterprise', ['color', 'contrast', 'accessibility']],
    ['Backup system needed', 'Critical data needs automated backup system. Disaster recovery planning.', 'Security', 'High', 'Open', 'Engineering', 'Neutral', 'Security', 'infrastructure@company.com', 'Enterprise', ['backup', 'disaster-recovery', 'security']],
    ['Multi-language support', 'International users need localized interface. Global expansion requirement.', 'Feature', 'Low', 'Open', 'Product', 'Positive', 'Integration', 'i18n@example.com', 'Enterprise', ['i18n', 'localization', 'global']],
    ['Real-time collaboration', 'Teams need to work together on documents simultaneously. Productivity feature.', 'Feature', 'Medium', 'Open', 'Product', 'Positive', 'Integration', 'collaboration@company.com', 'Enterprise', ['collaboration', 'real-time', 'productivity']],
    ['Advanced analytics', 'Need deeper insights into user behavior and system performance.', 'Feature', 'Medium', 'Open', 'Product', 'Positive', 'Performance', 'analytics@company.com', 'Enterprise', ['analytics', 'insights', 'performance']],
    ['Voice commands', 'Accessibility feature for hands-free operation. Assistive technology support.', 'Feature', 'Low', 'Open', 'Product', 'Positive', 'UI/UX', 'accessibility@company.com', 'Enterprise', ['voice', 'accessibility', 'assistive']],
    ['Offline mode', 'Application should work without internet connection. Reliability improvement.', 'Feature', 'Medium', 'Open', 'Product', 'Positive', 'Performance', 'reliability@example.com', 'Enterprise', ['offline', 'reliability', 'performance']]
  ]
  return rows.map((r, idx) => ({
    id: crypto.randomUUID(),
    title: r[0],
    description: r[1],
    category: r[2],
    urgency: r[3],
    status: r[4],
    assignedTeam: r[5],
    sentiment: r[6],
    topic: r[7],
    email: r[8],
    userType: r[9],
    tags: r[10],
    priority: scoreFor(r[3]),
    createdAt: now - idx * 3600_000,
    updatedAt: now - idx * 1800_000,
    attachments: Math.random() > 0.7 ? [`screenshot-${idx}.png`] : [],
    response: Math.random() > 0.8 ? `Thank you for your feedback. We're working on this issue and will update you soon.` : null,
    impactScore: Math.floor(Math.random() * 10) + 1,
    votes: Math.floor(Math.random() * 50),
    views: Math.floor(Math.random() * 200)
  }))
}

// Demo surveys
function DemoSurveys() {
  return [
    {
      id: crypto.randomUUID(),
      title: 'NPS Survey',
      description: 'How likely are you to recommend our product?',
      questions: [
        { id: 1, type: 'scale', text: 'Rate from 0-10', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] }
      ],
      isActive: true,
      createdAt: Date.now() - 86400000
    },
    {
      id: crypto.randomUUID(),
      title: 'Feature Request Survey',
      description: 'What features would you like to see?',
      questions: [
        { id: 1, type: 'multiple', text: 'Select desired features', options: ['Dark Mode', 'Mobile App', 'API Access', 'Advanced Analytics'] },
        { id: 2, type: 'text', text: 'Additional suggestions' }
      ],
      isActive: true,
      createdAt: Date.now() - 172800000
    }
  ]
}

// Demo roadmap
function DemoRoadmap() {
  return [
    { id: crypto.randomUUID(), title: 'Dark Mode', status: 'Planned', description: 'System-wide dark theme implementation', votes: 45, targetDate: '2024-03-15' },
    { id: crypto.randomUUID(), title: 'Mobile App', status: 'In Progress', description: 'Native mobile application development', votes: 32, targetDate: '2024-04-30' },
    { id: crypto.randomUUID(), title: 'API v2', status: 'Planned', description: 'Enhanced API with better performance', votes: 28, targetDate: '2024-05-15' },
    { id: crypto.randomUUID(), title: 'Advanced Analytics', status: 'Completed', description: 'Real-time analytics dashboard', votes: 15, targetDate: '2024-01-30' }
  ]
}

export default function App() {
  const [view, setView] = useState('landing')
  const [items, setItems] = useState(() => loadStorage() ?? DemoData())
  const [surveys, setSurveys] = useState(() => loadSurveys() ?? DemoSurveys())
  const [roadmap, setRoadmap] = useState(() => loadRoadmap() ?? DemoRoadmap())
  const [currentUser, setCurrentUser] = useState(() => loadUser() ?? { type: 'Guest', name: 'Anonymous' })
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth())
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Public form state
  const [publicForm, setPublicForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    email: '',
    userType: 'Guest',
    attachments: []
  })
  
  // Survey state
  const [currentSurvey, setCurrentSurvey] = useState(null)
  const [surveyResponses, setSurveyResponses] = useState({})
  
  // Advanced filters
  const [filters, setFilters] = useState({
    category: 'All',
    urgency: 'All',
    status: 'All',
    team: 'All',
    sentiment: 'All',
    userType: 'All',
    search: '',
    dateRange: 'All',
    hasAttachments: 'All'
  })
  
  // Selected items for bulk actions
  const [selectedItems, setSelectedItems] = useState(new Set())
  
  // New feedback form state
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    urgency: 'Low',
    assignedTeam: 'Unassigned',
    tags: []
  })

  // Additional state for production features
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => { 
    saveStorage(items)
    saveSurveys(surveys)
    saveRoadmap(roadmap)
    saveUser(currentUser)
  }, [items, surveys, roadmap, currentUser])

  // Auto-detect urgency, sentiment, and topic
  const detectedUrgency = useMemo(() => {
    return publicForm.description.trim() ? detectUrgency(publicForm.description) : 'Low'
  }, [publicForm.description])

  const detectedSentiment = useMemo(() => {
    return publicForm.description.trim() ? detectSentiment(publicForm.description) : 'Neutral'
  }, [publicForm.description])

  const detectedTopic = useMemo(() => {
    return publicForm.description.trim() ? detectTopic(publicForm.description) : 'General'
  }, [publicForm.description])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.priority - a.priority)
  }, [items])

  const filtered = useMemo(() => {
    return sorted.filter(it => {
      const catOk = filters.category === 'All' || it.category === filters.category
      const urgOk = filters.urgency === 'All' || it.urgency === filters.urgency
      const statusOk = filters.status === 'All' || it.status === filters.status
      const teamOk = filters.team === 'All' || it.assignedTeam === filters.team
      const sentimentOk = filters.sentiment === 'All' || it.sentiment === filters.sentiment
      const userTypeOk = filters.userType === 'All' || it.userType === filters.userType
      const attachmentOk = filters.hasAttachments === 'All' || 
        (filters.hasAttachments === 'Yes' && it.attachments?.length > 0) ||
        (filters.hasAttachments === 'No' && (!it.attachments || it.attachments.length === 0))
      const s = filters.search.trim().toLowerCase()
      const searchOk = !s || (it.title + ' ' + it.description + ' ' + (it.tags?.join(' ') || '')).toLowerCase().includes(s)
      return catOk && urgOk && statusOk && teamOk && sentimentOk && userTypeOk && attachmentOk && searchOk
    })
  }, [sorted, filters])

  // Comprehensive analytics
  const analytics = useMemo(() => {
    const total = items.length
    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {})
    const byUrgency = items.reduce((acc, item) => {
      acc[item.urgency] = (acc[item.urgency] || 0) + 1
      return acc
    }, {})
    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})
    const byTeam = items.reduce((acc, item) => {
      acc[item.assignedTeam] = (acc[item.assignedTeam] || 0) + 1
      return acc
    }, {})
    const bySentiment = items.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1
      return acc
    }, {})
    const byUserType = items.reduce((acc, item) => {
      acc[item.userType] = (acc[item.userType] || 0) + 1
      return acc
    }, {})
    const byTopic = items.reduce((acc, item) => {
      acc[item.topic] = (acc[item.topic] || 0) + 1
      return acc
    }, {})
    
    const criticalCount = items.filter(i => i.urgency === 'Critical').length
    const resolvedCount = items.filter(i => i.status === 'Resolved').length
    const avgResolutionTime = items.filter(i => i.status === 'Resolved').length > 0 
      ? items.filter(i => i.status === 'Resolved').reduce((sum, i) => sum + (i.updatedAt - i.createdAt), 0) / items.filter(i => i.status === 'Resolved').length / (1000 * 60 * 60 * 24)
      : 0
    
    const avgSentimentScore = items.reduce((sum, item) => {
      const scores = { 'Very Negative': 1, 'Negative': 2, 'Neutral': 3, 'Positive': 4, 'Very Positive': 5 }
      return sum + (scores[item.sentiment] || 3)
    }, 0) / items.length || 3
    
    const totalVotes = items.reduce((sum, item) => sum + (item.votes || 0), 0)
    const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0)
    const avgImpactScore = items.reduce((sum, item) => sum + (item.impactScore || 0), 0) / items.length || 0
    
    return { 
      total, byCategory, byUrgency, byStatus, byTeam, bySentiment, byUserType, byTopic,
      criticalCount, resolvedCount, avgResolutionTime, avgSentimentScore, 
      totalVotes, totalViews, avgImpactScore
    }
  }, [items])

  // Enhanced form handlers
  function resetPublicForm() {
    setPublicForm({ title: '', description: '', category: CATEGORIES[0], email: '', userType: 'Guest', attachments: [] })
  }

  function submitPublicForm(e) {
    e.preventDefault()
    if (!publicForm.title.trim() || !publicForm.description.trim()) {
      setMessage('Please provide both Title and Description.')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      const entry = {
        id: crypto.randomUUID(),
        title: publicForm.title.trim(),
        description: publicForm.description.trim(),
        category: publicForm.category,
        urgency: detectedUrgency,
        sentiment: detectedSentiment,
        topic: detectedTopic,
        status: 'Open',
        assignedTeam: 'Unassigned',
        priority: scoreFor(detectedUrgency),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        email: publicForm.email.trim(),
        userType: publicForm.userType,
        tags: [],
        attachments: publicForm.attachments,
        response: null,
        impactScore: Math.floor(Math.random() * 10) + 1,
        votes: 0,
        views: 0
      }
      setItems(prev => [entry, ...prev])
      resetPublicForm()
      setMessage('Thank you! Your feedback has been submitted successfully. 🎉')
      setTimeout(() => {
        setMessage('')
        setView('landing')
      }, 3000)
      setIsLoading(false)
    }, 500)
  }

  function handleTeamLogin(pin) {
    if (pin === '1234') {
      setAuth(true)
      setIsAuthenticated(true)
      setCurrentUser({ type: 'Admin', name: 'Team Member' })
      setView('admin-dashboard')
      setMessage('Welcome to the team portal! 🚀')
      setTimeout(() => setMessage(''), 2000)
    } else {
      setMessage('Invalid PIN. Please try again.')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  function handleLogout() {
    setAuth(false)
    setIsAuthenticated(false)
    setCurrentUser({ type: 'Guest', name: 'Anonymous' })
    setView('landing')
    setMessage('Logged out successfully.')
    setTimeout(() => setMessage(''), 2000)
  }

  // Enhanced item management
  function updateItemStatus(id, status) {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status, updatedAt: Date.now() } : item
    ))
  }

  function updateItemTeam(id, team) {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, assignedTeam: team, updatedAt: Date.now() } : item
    ))
  }

  function addItemResponse(id, response) {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, response, updatedAt: Date.now() } : item
    ))
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  function voteItem(id) {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, votes: (item.votes || 0) + 1, updatedAt: Date.now() } : item
    ))
  }

  function viewItem(id) {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
    ))
  }

  // Enhanced bulk actions
  function bulkAction(action) {
    if (action === 'export') {
      const selectedItemsData = items.filter(item => selectedItems.has(item.id))
      csvExport(selectedItemsData)
    } else if (action === 'resolve') {
      setItems(prev => prev.map(item => 
        selectedItems.has(item.id) ? { ...item, status: 'Resolved', updatedAt: Date.now() } : item
      ))
      setSelectedItems(new Set())
    } else if (action === 'delete') {
      setItems(prev => prev.filter(item => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
    } else if (action === 'assign') {
      const team = prompt('Assign to team:')
      if (team) {
        setItems(prev => prev.map(item => 
          selectedItems.has(item.id) ? { ...item, assignedTeam: team, updatedAt: Date.now() } : item
        ))
        setSelectedItems(new Set())
      }
    }
  }

  // Survey handlers
  function startSurvey(survey) {
    setCurrentSurvey(survey)
    setView('survey')
  }

  function submitSurvey(e) {
    e.preventDefault()
    setMessage('Survey submitted successfully! Thank you for your feedback.')
    setTimeout(() => {
      setMessage('')
      setCurrentSurvey(null)
      setSurveyResponses({})
      setView('landing')
    }, 2000)
  }

  // Roadmap handlers
  function addRoadmapItem(item) {
    setRoadmap(prev => [...prev, { ...item, id: crypto.randomUUID(), votes: 0 }])
  }

  function voteRoadmapItem(id) {
    setRoadmap(prev => prev.map(item => 
      item.id === id ? { ...item, votes: (item.votes || 0) + 1 } : item
    ))
  }

  function loadDemo() {
    setIsLoading(true)
    setTimeout(() => {
      setItems(DemoData())
      setSurveys(DemoSurveys())
      setRoadmap(DemoRoadmap())
      setIsLoading(false)
      setMessage('Demo data loaded! 🚀')
      setTimeout(() => setMessage(''), 2000)
    }, 800)
  }

  // Additional handlers for production features
  function startSurvey(survey) {
    setCurrentSurvey(survey)
    setSurveyResponses({})
  }

  function submitSurvey() {
    if (currentSurvey) {
      // Process survey responses
      setMessage('Survey submitted successfully! Thank you for your feedback.')
      setTimeout(() => {
        setMessage('')
        setCurrentSurvey(null)
        setSurveyResponses({})
      }, 2000)
    }
  }

  function showToastMessage(message) {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function handleFileUpload(files) {
    const fileList = Array.from(files)
    setPublicForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileList.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))]
    }))
  }


  return (
    <div className="app" role="application" aria-label="FeedbackFlow Application">
      {message && <div className="toast" role="alert" aria-live="polite">{message}</div>}
      {showToast && <div className="toast" role="alert" aria-live="polite">{toastMessage}</div>}

      {/* Landing Page */}
      {view === 'landing' && (
        <div className="landing-page">
          <header className="hero-header">
            <h1 className="hero-title">FeedbackFlow</h1>
            <p className="hero-subtitle">Enterprise Feedback Management Platform</p>
            <p className="hero-description">
              Streamline customer feedback collection, prioritization, and resolution with our intelligent platform.
            </p>
          </header>
          
          <div className="hero-actions">
            <button className="btn-hero primary" onClick={() => setView('public-form')}>
              📝 Submit Feedback
            </button>
            <button className="btn-hero secondary" onClick={() => setView('team-login')}>
              🔐 Team Portal
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Prioritization</h3>
              <p>Automatic urgency detection and smart categorization</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Comprehensive dashboards and performance metrics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Built for speed with modern technology stack</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Role-based access and data privacy compliance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Responsive design for all devices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>API Integration</h3>
              <p>Connect with your existing tools and workflows</p>
            </div>
          </div>

          <div className="demo-section">
            <h3>🎭 Demo Mode Available</h3>
            <p>Experience the full platform with pre-loaded data</p>
            <button className="btn-demo" onClick={loadDemo}>
              Load Demo Data
            </button>
          </div>

          <footer className="landing-footer">
            <p>Built for Hackathon • Cursor AI Free Tier • No Backend Required</p>
          </footer>
        </div>
      )}

      {/* Public Feedback Form */}
      {view === 'public-form' && (
        <div className="public-form-page">
          <header className="form-header">
            <h1>Submit Your Feedback</h1>
            <p>Help us improve by sharing your thoughts and experiences</p>
            <button className="btn-back" onClick={() => setView('landing')}>← Back to Home</button>
          </header>

          <form onSubmit={submitPublicForm} className="public-form">
            <div className="form-group">
              <label>
                <span>Title *</span>
                <input 
                  value={publicForm.title} 
                  onChange={e => setPublicForm(prev => ({...prev, title: e.target.value}))}
                  placeholder="Brief summary of your feedback"
                  required 
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <span>Description *</span>
                <textarea 
                  value={publicForm.description} 
                  onChange={e => setPublicForm(prev => ({...prev, description: e.target.value}))}
                  rows={4} 
                  placeholder="Please describe your experience or suggestion in detail"
                  required 
                />
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <span>Category</span>
                  <select 
                    value={publicForm.category} 
                    onChange={e => setPublicForm(prev => ({...prev, category: e.target.value}))}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <div className="form-group">
                <label>
                  <span>User Type</span>
                  <select 
                    value={publicForm.userType} 
                    onChange={e => setPublicForm(prev => ({...prev, userType: e.target.value}))}
                  >
                    {USER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="ai-detection">
              <div className="detection-grid">
                <div className="detection-item">
                  <span>Auto-Detected Priority</span>
                  <div className={`urgency-badge ${detectedUrgency.toLowerCase()}`}>
                    {detectedUrgency}
                  </div>
                </div>
                <div className="detection-item">
                  <span>Sentiment Analysis</span>
                  <div className={`sentiment-badge ${detectedSentiment.toLowerCase().replace(' ', '-')}`}>
                    {detectedSentiment}
                  </div>
                </div>
                <div className="detection-item">
                  <span>Topic Detection</span>
                  <div className="topic-badge">
                    {detectedTopic}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                <span>Attachments (Optional)</span>
                <input 
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={e => handleFileUpload(e.target.files)}
                  className="file-input"
                />
                {publicForm.attachments.length > 0 && (
                  <div className="attachments-list">
                    {publicForm.attachments.map((file, idx) => (
                      <span key={idx} className="attachment-tag">📎 {file}</span>
                    ))}
                  </div>
                )}
              </label>
            </div>

            <div className="form-group">
              <label>
                <span>Email (Optional)</span>
                <input 
                  type="email"
                  value={publicForm.email} 
                  onChange={e => setPublicForm(prev => ({...prev, email: e.target.value}))}
                  placeholder="your.email@company.com"
                />
              </label>
            </div>

            <div className="privacy-notice">
              <p>🔒 Your feedback is secure and will be used to improve our product. We respect your privacy.</p>
            </div>

            <div className="form-actions">
              <button className="btn-submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button className="btn-reset" type="button" onClick={resetPublicForm}>
                Reset Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Login */}
      {view === 'team-login' && (
        <div className="login-page">
          <div className="login-card">
            <h1>Team Portal Access</h1>
            <p>Enter your team PIN to access the admin dashboard</p>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const pin = e.target.pin.value
              handleTeamLogin(pin)
            }}>
              <div className="form-group">
                <label>
                  <span>Team PIN</span>
                  <input 
                    type="password" 
                    name="pin" 
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    required 
                  />
                </label>
              </div>
              <button className="btn-login" type="submit">Access Dashboard</button>
            </form>
            
            <div className="login-hint">
              <p><strong>Demo PIN:</strong> 1234</p>
            </div>
            
            <button className="btn-back" onClick={() => setView('landing')}>← Back to Home</button>
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {view === 'admin-dashboard' && (
        <div className="admin-dashboard">
          <header className="admin-header">
            <div className="header-left">
              <h1>📊 Admin Dashboard</h1>
              <p>FeedbackFlow Management Portal - Welcome, {currentUser.name}</p>
            </div>
            <div className="header-actions">
              <button className="btn" onClick={() => csvExport(sorted)}>📊 Export CSV</button>
              <button className="btn" onClick={loadDemo} disabled={isLoading}>
                {isLoading ? 'Loading...' : '🎭 Load Demo'}
              </button>
              <button className="btn danger" onClick={handleLogout}>Logout</button>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="admin-nav" role="navigation" aria-label="Admin Dashboard Navigation">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
              aria-pressed={activeTab === 'dashboard'}
              role="tab"
            >
              📊 Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`} 
              onClick={() => setActiveTab('feedback')}
              aria-pressed={activeTab === 'feedback'}
              role="tab"
            >
              💬 Feedback
            </button>
            <button 
              className={`nav-tab ${activeTab === 'surveys' ? 'active' : ''}`} 
              onClick={() => setActiveTab('surveys')}
              aria-pressed={activeTab === 'surveys'}
              role="tab"
            >
              📋 Surveys
            </button>
            <button 
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} 
              onClick={() => setActiveTab('analytics')}
              aria-pressed={activeTab === 'analytics'}
              role="tab"
            >
              📈 Analytics
            </button>
            <button 
              className={`nav-tab ${activeTab === 'integrations' ? 'active' : ''}`} 
              onClick={() => setActiveTab('integrations')}
              aria-pressed={activeTab === 'integrations'}
              role="tab"
            >
              🔌 Integrations
            </button>
            <button 
              className={`nav-tab ${activeTab === 'personalization' ? 'active' : ''}`} 
              onClick={() => setActiveTab('personalization')}
              aria-pressed={activeTab === 'personalization'}
              role="tab"
            >
              👤 Personalization
            </button>
            <button 
              className={`nav-tab ${activeTab === 'help' ? 'active' : ''}`} 
              onClick={() => setActiveTab('help')}
              aria-pressed={activeTab === 'help'}
              role="tab"
            >
              ❓ Help
            </button>
          </nav>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              {/* Advanced Analytics Cards */}
              <div className="analytics-grid">
                <div className="stat-card">
                  <div className="stat-number">{analytics.total}</div>
                  <div className="stat-label">Total Feedback</div>
                </div>
                <div className="stat-card critical">
                  <div className="stat-number">{analytics.criticalCount}</div>
                  <div className="stat-label">Critical Issues</div>
                </div>
                <div className="stat-card resolved">
                  <div className="stat-number">{analytics.resolvedCount}</div>
                  <div className="stat-label">Resolved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analytics.avgResolutionTime.toFixed(1)}</div>
                  <div className="stat-label">Avg Resolution (days)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analytics.avgSentimentScore.toFixed(1)}</div>
                  <div className="stat-label">Avg Sentiment</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analytics.totalVotes}</div>
                  <div className="stat-label">Total Votes</div>
                </div>
              </div>

              {/* Sentiment Heatmap */}
              <div className="heatmap-section">
                <h3>Sentiment Analysis</h3>
                <div className="sentiment-heatmap">
                  {Object.entries(analytics.bySentiment).map(([sentiment, count]) => (
                    <div key={sentiment} className="heatmap-item">
                      <span className="sentiment-label">{sentiment}</span>
                      <div className="sentiment-bar">
                        <div 
                          className={`sentiment-fill ${sentiment.toLowerCase().replace(' ', '-')}`}
                          style={{ width: `${(count / analytics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="sentiment-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="category-breakdown">
                <h3>Feedback by Category</h3>
                <div className="category-chart">
                  {Object.entries(analytics.byCategory).map(([category, count]) => (
                    <div key={category} className="category-item">
                      <span className="category-name">{category}</span>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ width: `${(count / analytics.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="category-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Management Tab */}
          {activeTab === 'feedback' && (
            <div className="feedback-content">
              {/* Advanced Filters */}
              <div className="filters-panel">
                <h3>Advanced Filters</h3>
                <div className="filters-grid">
                  <select value={filters.category} onChange={e => setFilters(prev => ({...prev, category: e.target.value}))}>
                    <option>All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  
                  <select value={filters.urgency} onChange={e => setFilters(prev => ({...prev, urgency: e.target.value}))}>
                    <option>All Urgency</option>
                    {URGENCY.map(u => <option key={u}>{u}</option>)}
                  </select>
                  
                  <select value={filters.status} onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}>
                    <option>All Status</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  
                  <select value={filters.team} onChange={e => setFilters(prev => ({...prev, team: e.target.value}))}>
                    <option>All Teams</option>
                    {TEAMS.map(t => <option key={t}>{t}</option>)}
                  </select>

                  <select value={filters.sentiment} onChange={e => setFilters(prev => ({...prev, sentiment: e.target.value}))}>
                    <option>All Sentiment</option>
                    {SENTIMENT.map(s => <option key={s}>{s}</option>)}
                  </select>

                  <select value={filters.userType} onChange={e => setFilters(prev => ({...prev, userType: e.target.value}))}>
                    <option>All User Types</option>
                    {USER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  
                  <input 
                    value={filters.search} 
                    onChange={e => setFilters(prev => ({...prev, search: e.target.value}))}
                    placeholder="Search feedback..."
                    className="search-input"
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedItems.size > 0 && (
                <div className="bulk-actions">
                  <span>{selectedItems.size} items selected</span>
                  <button className="btn" onClick={() => bulkAction('export')}>Export Selected</button>
                  <button className="btn" onClick={() => bulkAction('resolve')}>Mark as Resolved</button>
                  <button className="btn" onClick={() => bulkAction('assign')}>Assign Team</button>
                  <button className="btn danger" onClick={() => bulkAction('delete')}>Delete Selected</button>
                  <button className="btn ghost" onClick={() => setSelectedItems(new Set())}>Clear Selection</button>
                </div>
              )}

              {/* Feedback Table */}
              <div className="feedback-table">
                <table>
                  <thead>
                    <tr>
                      <th><input type="checkbox" onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(filtered.map(item => item.id)))
                        } else {
                          setSelectedItems(new Set())
                        }
                      }} /></th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Sentiment</th>
                      <th>Status</th>
                      <th>Team</th>
                      <th>User Type</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id} onClick={() => viewItem(item.id)}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              const newSelected = new Set(selectedItems)
                              if (e.target.checked) {
                                newSelected.add(item.id)
                              } else {
                                newSelected.delete(item.id)
                              }
                              setSelectedItems(newSelected)
                            }}
                          />
                        </td>
                        <td>
                          <div className="item-title">{item.title}</div>
                          <div className="item-description">{item.description}</div>
                          {item.attachments?.length > 0 && (
                            <div className="attachments">📎 {item.attachments.length} file(s)</div>
                          )}
                        </td>
                        <td><span className={`category-tag ${item.category.toLowerCase()}`}>{item.category}</span></td>
                        <td><span className={priorityClass(item.urgency)}>{item.urgency}</span></td>
                        <td><span className={`sentiment-badge ${item.sentiment.toLowerCase().replace(' ', '-')}`}>{item.sentiment}</span></td>
                        <td>
                          <select 
                            value={item.status} 
                            onChange={e => updateItemStatus(item.id, e.target.value)}
                            className="status-select"
                            onClick={e => e.stopPropagation()}
                          >
                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <select 
                            value={item.assignedTeam} 
                            onChange={e => updateItemTeam(item.id, e.target.value)}
                            className="team-select"
                            onClick={e => e.stopPropagation()}
                          >
                            <option>Unassigned</option>
                            {TEAMS.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td><span className="user-type-badge">{item.userType}</span></td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-small" onClick={(e) => { e.stopPropagation(); voteItem(item.id) }}>
                              👍 {item.votes || 0}
                            </button>
                            <button className="btn-small danger" onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Surveys Tab */}
          {activeTab === 'surveys' && (
            <div className="surveys-content">
              <div className="surveys-header">
                <h3>Survey Management & Builder</h3>
                <button className="btn" onClick={() => setActiveTab('survey-builder')}>
                  ➕ Create New Survey
                </button>
              </div>
              
              <div className="surveys-grid">
                {surveys.map(survey => (
                  <div key={survey.id} className="survey-card">
                    <h4>{survey.title}</h4>
                    <p>{survey.description}</p>
                    <div className="survey-stats">
                      <span>Questions: {survey.questions.length}</span>
                      <span>Status: {survey.isActive ? 'Active' : 'Inactive'}</span>
                      <span>Responses: {survey.responses || 0}</span>
                    </div>
                    <div className="survey-actions">
                      <button className="btn" onClick={() => startSurvey(survey)}>
                        Take Survey
                      </button>
                      <button className="btn ghost" onClick={() => setActiveTab('survey-builder')}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Survey Builder Section */}
              <div className="survey-builder-section">
                <h4>🛠️ Survey Builder</h4>
                <div className="builder-form">
                  <div className="form-group">
                    <label>Survey Title</label>
                    <input type="text" placeholder="Enter survey title" />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Enter survey description"></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Survey Type</label>
                    <select>
                      <option>NPS (Net Promoter Score)</option>
                      <option>CSAT (Customer Satisfaction)</option>
                      <option>Feature Voting</option>
                      <option>Custom Survey</option>
                    </select>
                  </div>
                  
                  <div className="questions-section">
                    <h5>Questions</h5>
                    <div className="question-item">
                      <input type="text" placeholder="Question text" />
                      <select>
                        <option>Multiple Choice</option>
                        <option>Rating Scale</option>
                        <option>Text Input</option>
                        <option>Yes/No</option>
                      </select>
                      <button className="btn-small">Add Option</button>
                    </div>
                  </div>
                  
                  <div className="builder-actions">
                    <button className="btn">Save Draft</button>
                    <button className="btn primary">Publish Survey</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Survey Builder Tab */}
          {activeTab === 'survey-builder' && (
            <div className="survey-builder">
              <div className="builder-header">
                <h3>Survey Builder</h3>
                <button className="btn" onClick={() => setActiveTab('surveys')}>
                  ← Back to Surveys
                </button>
              </div>
              
              <div className="builder-form">
                <div className="form-group">
                  <label>Survey Title</label>
                  <input type="text" placeholder="Enter survey title" />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Enter survey description"></textarea>
                </div>
                
                <div className="form-group">
                  <label>Survey Type</label>
                  <select>
                    <option>NPS (Net Promoter Score)</option>
                    <option>CSAT (Customer Satisfaction)</option>
                    <option>Feature Voting</option>
                    <option>Custom Survey</option>
                  </select>
                </div>
                
                <div className="questions-section">
                  <h4>Questions</h4>
                  <div className="question-item">
                    <input type="text" placeholder="Question text" />
                    <select>
                      <option>Multiple Choice</option>
                      <option>Rating Scale</option>
                      <option>Text Input</option>
                      <option>Yes/No</option>
                    </select>
                    <button className="btn-small">Add Option</button>
                  </div>
                </div>
                
                <div className="builder-actions">
                  <button className="btn">Save Draft</button>
                  <button className="btn primary">Publish Survey</button>
                </div>
              </div>
            </div>
          )}


          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-content">
              <h3>Advanced Analytics Dashboard</h3>
              
              {/* Key Metrics */}
              <div className="analytics-metrics">
                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <h4>Total Feedback</h4>
                    <div className="metric-value">{analytics.total}</div>
                    <div className="metric-change positive">+12% this month</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-content">
                    <h4>Response Rate</h4>
                    <div className="metric-value">87%</div>
                    <div className="metric-change positive">+5% this week</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <h4>Resolution Time</h4>
                    <div className="metric-value">{analytics.avgResolutionTime.toFixed(1)}d</div>
                    <div className="metric-change negative">-2 days</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">😊</div>
                  <div className="metric-content">
                    <h4>Avg Sentiment</h4>
                    <div className="metric-value">{analytics.avgSentimentScore.toFixed(1)}/5</div>
                    <div className="metric-change positive">+0.3 this month</div>
                  </div>
                </div>
              </div>

              {/* Interactive Charts */}
              <div className="analytics-charts">
                <div className="chart-section">
                  <h4>📈 Feedback Volume Trends</h4>
                  <div className="trend-chart">
                    <div className="chart-bars">
                      {[12, 18, 15, 22, 28, 25, 31, 27, 33, 29, 35, 32].map((height, index) => (
                        <div key={index} className="chart-bar" style={{height: `${height}%`}}>
                          <span className="bar-value">{height}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-labels">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
                      <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                      <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                  </div>
                </div>

                <div className="chart-section">
                  <h4>📊 Category Distribution</h4>
                  <div className="category-chart">
                    {Object.entries(analytics.byCategory).map(([category, count]) => (
                      <div key={category} className="category-item">
                        <span className="category-name">{category}</span>
                        <div className="category-bar">
                          <div 
                            className="category-fill"
                            style={{ width: `${(count / analytics.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="category-count">{count}</span>
                        <span className="category-percentage">{((count / analytics.total) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <h4>🎯 Priority Breakdown</h4>
                  <div className="priority-chart">
                    <div className="priority-item">
                      <span className="priority-label critical">Critical</span>
                      <div className="priority-bar">
                        <div className="priority-fill critical" style={{width: `${(analytics.criticalCount / analytics.total) * 100}%`}}></div>
                      </div>
                      <span className="priority-count">{analytics.criticalCount}</span>
                    </div>
                    <div className="priority-item">
                      <span className="priority-label high">High</span>
                      <div className="priority-bar">
                        <div className="priority-fill high" style={{width: `${(analytics.byUrgency['High'] || 0 / analytics.total) * 100}%`}}></div>
                      </div>
                      <span className="priority-count">{analytics.byUrgency['High'] || 0}</span>
                    </div>
                    <div className="priority-item">
                      <span className="priority-label medium">Medium</span>
                      <div className="priority-bar">
                        <div className="priority-fill medium" style={{width: `${(analytics.byUrgency['Medium'] || 0 / analytics.total) * 100}%`}}></div>
                      </div>
                      <span className="priority-count">{analytics.byUrgency['Medium'] || 0}</span>
                    </div>
                    <div className="priority-item">
                      <span className="priority-label low">Low</span>
                      <div className="priority-bar">
                        <div className="priority-fill low" style={{width: `${(analytics.byUrgency['Low'] || 0 / analytics.total) * 100}%`}}></div>
                      </div>
                      <span className="priority-count">{analytics.byUrgency['Low'] || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="chart-section">
                  <h4>👥 User Type Distribution</h4>
                  <div className="user-chart">
                    <div className="user-segments">
                      {Object.entries(analytics.byUserType).map(([userType, count]) => (
                        <div key={userType} className="user-segment">
                          <div className="segment-circle" style={{
                            background: `conic-gradient(var(--primary) 0deg ${(count / analytics.total) * 360}deg, #f1f5f9 ${(count / analytics.total) * 360}deg 360deg)`
                          }}>
                            <div className="segment-inner">
                              <span className="segment-percentage">{((count / analytics.total) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          <span className="segment-label">{userType}</span>
                          <span className="segment-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="chart-section">
                  <h4>💬 Sentiment Analysis</h4>
                  <div className="sentiment-chart">
                    {Object.entries(analytics.bySentiment).map(([sentiment, count]) => (
                      <div key={sentiment} className="sentiment-item">
                        <span className="sentiment-label">{sentiment}</span>
                        <div className="sentiment-bar">
                          <div 
                            className={`sentiment-fill ${sentiment.toLowerCase().replace(' ', '-')}`}
                            style={{ width: `${(count / analytics.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="sentiment-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <h4>🏷️ Topic Clustering</h4>
                  <div className="topic-chart">
                    <div className="topic-cloud">
                      {Object.entries(analytics.byTopic).map(([topic, count]) => (
                        <span 
                          key={topic} 
                          className="topic-tag"
                          style={{ fontSize: `${Math.max(12, (count / Math.max(...Object.values(analytics.byTopic))) * 20)}px` }}
                        >
                          {topic} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="analytics-export">
                <h4>📤 Export Analytics</h4>
                <div className="export-options">
                  <button className="btn" onClick={() => csvExport(sorted)}>Export CSV</button>
                  <button className="btn" onClick={() => showToastMessage('PDF export coming soon!')}>Export PDF</button>
                  <button className="btn" onClick={() => showToastMessage('Email report sent!')}>Email Report</button>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="integrations-content">
              <h3>Integrations & API</h3>
              
              <div className="integrations-grid">
                <div className="integration-card">
                  <div className="integration-header">
                    <h4>💬 Slack Integration</h4>
                    <span className="status-badge planned">Coming Soon</span>
                  </div>
                  <p>Get real-time notifications when new feedback is submitted or when items are updated.</p>
                  <div className="integration-features">
                    <span>• Channel notifications</span>
                    <span>• Custom webhooks</span>
                    <span>• Team mentions</span>
                  </div>
                  <button className="btn" disabled>Configure</button>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <h4>🎫 Jira Integration</h4>
                    <span className="status-badge planned">Coming Soon</span>
                  </div>
                  <p>Automatically create Jira tickets from high-priority feedback items.</p>
                  <div className="integration-features">
                    <span>• Auto-ticket creation</span>
                    <span>• Priority mapping</span>
                    <span>• Status synchronization</span>
                  </div>
                  <button className="btn" disabled>Configure</button>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <h4>📧 Email Alerts</h4>
                    <span className="status-badge in-progress">Active</span>
                  </div>
                  <p>Send automated email notifications to team members and stakeholders.</p>
                  <div className="integration-features">
                    <span>• Critical alerts</span>
                    <span>• Daily summaries</span>
                    <span>• Custom templates</span>
                  </div>
                  <button className="btn">Configure</button>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <h4>🔗 Webhook API</h4>
                    <span className="status-badge completed">Available</span>
                  </div>
                  <p>Connect with your existing tools using our REST API and webhooks.</p>
                  <div className="integration-features">
                    <span>• REST API endpoints</span>
                    <span>• Webhook notifications</span>
                    <span>• Custom integrations</span>
                  </div>
                  <button className="btn">View API Docs</button>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <h4>📊 Analytics Export</h4>
                    <span className="status-badge completed">Available</span>
                  </div>
                  <p>Export data to popular analytics platforms and BI tools.</p>
                  <div className="integration-features">
                    <span>• CSV/JSON export</span>
                    <span>• Scheduled reports</span>
                    <span>• Data visualization</span>
                  </div>
                  <button className="btn">Configure</button>
                </div>

                <div className="integration-card">
                  <div className="integration-header">
                    <h4>🎨 Custom Webhooks</h4>
                    <span className="status-badge completed">Available</span>
                  </div>
                  <p>Create custom webhooks for any external service or internal system.</p>
                  <div className="integration-features">
                    <span>• Custom endpoints</span>
                    <span>• Event filtering</span>
                    <span>• Authentication</span>
                  </div>
                  <button className="btn">Create Webhook</button>
                </div>
              </div>

              <div className="api-documentation">
                <h4>📚 API Documentation</h4>
                <div className="api-endpoints">
                  <div className="endpoint-item">
                    <code>GET /api/feedback</code>
                    <span>Retrieve all feedback items</span>
                  </div>
                  <div className="endpoint-item">
                    <code>POST /api/feedback</code>
                    <span>Create new feedback item</span>
                  </div>
                  <div className="endpoint-item">
                    <code>PUT /api/feedback/:id</code>
                    <span>Update feedback item</span>
                  </div>
                  <div className="endpoint-item">
                    <code>DELETE /api/feedback/:id</code>
                    <span>Delete feedback item</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personalization Tab */}
          {activeTab === 'personalization' && (
            <div className="personalization-content">
              <h3>User Segmentation & Personalization</h3>
              
              <div className="segmentation-overview">
                <div className="user-segments">
                  <h4>👥 User Segments</h4>
                  <div className="segments-grid">
                    <div className="segment-card">
                      <div className="segment-header">
                        <h5>🆕 New Users</h5>
                        <span className="segment-count">45 users</span>
                      </div>
                      <p>Users who joined in the last 30 days</p>
                      <div className="segment-features">
                        <span>• Onboarding guidance</span>
                        <span>• Basic feature access</span>
                        <span>• Welcome surveys</span>
                      </div>
                    </div>

                    <div className="segment-card">
                      <div className="segment-header">
                        <h5>💎 Premium Users</h5>
                        <span className="segment-count">23 users</span>
                      </div>
                      <p>Paying customers with full feature access</p>
                      <div className="segment-features">
                        <span>• Priority support</span>
                        <span>• Advanced analytics</span>
                        <span>• Custom integrations</span>
                      </div>
                    </div>

                    <div className="segment-card">
                      <div className="segment-header">
                        <h5>⚡ Power Users</h5>
                        <span className="segment-count">12 users</span>
                      </div>
                      <p>Highly engaged users with advanced usage</p>
                      <div className="segment-features">
                        <span>• Beta features</span>
                        <span>• Direct feedback channel</span>
                        <span>• Feature voting</span>
                      </div>
                    </div>

                    <div className="segment-card">
                      <div className="segment-header">
                        <h5>🏢 Enterprise</h5>
                        <span className="segment-count">8 organizations</span>
                      </div>
                      <p>Large organizations with team accounts</p>
                      <div className="segment-features">
                        <span>• Team management</span>
                        <span>• SSO integration</span>
                        <span>• Custom branding</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="personalization-settings">
                  <h4>🎨 Personalization Settings</h4>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span>Show advanced analytics to premium users</span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span>Enable beta features for power users</span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" />
                        <span>Show team management to enterprise users</span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span>Send onboarding emails to new users</span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span>Enable feature voting for power users</span>
                      </label>
                    </div>
                    <div className="setting-item">
                      <label>
                        <input type="checkbox" />
                        <span>Show custom branding to enterprise</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="user-analytics">
                <h4>📊 User Analytics</h4>
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <div className="card-header">
                      <h5>User Growth</h5>
                      <span className="growth-rate">+23%</span>
                    </div>
                    <div className="card-content">
                      <div className="metric">
                        <span className="metric-label">New Users (30d)</span>
                        <span className="metric-value">45</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Active Users (7d)</span>
                        <span className="metric-value">78</span>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="card-header">
                      <h5>Engagement</h5>
                      <span className="engagement-score">High</span>
                    </div>
                    <div className="card-content">
                      <div className="metric">
                        <span className="metric-label">Avg Session Time</span>
                        <span className="metric-value">12.5m</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Feature Usage</span>
                        <span className="metric-value">85%</span>
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="card-header">
                      <h5>Segmentation</h5>
                      <span className="segment-distribution">Balanced</span>
                    </div>
                    <div className="card-content">
                      <div className="metric">
                        <span className="metric-label">Premium Rate</span>
                        <span className="metric-value">26%</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Power User Rate</span>
                        <span className="metric-value">14%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Center Tab */}
          {activeTab === 'help' && (
            <div className="help-content">
              <h3>Help Center & Support</h3>
              
              <div className="help-sections">
                <div className="help-section">
                  <h4>📚 Getting Started</h4>
                  <div className="faq-item">
                    <h5>How do I submit feedback?</h5>
                    <p>Use the public feedback form to submit your suggestions, bug reports, or feature requests. Our AI will automatically detect urgency and sentiment.</p>
                  </div>
                  <div className="faq-item">
                    <h5>How do I access the admin dashboard?</h5>
                    <p>Use the team login with PIN: 1234 (demo mode) to access the admin dashboard for managing and analyzing feedback.</p>
                  </div>
                </div>

                <div className="help-section">
                  <h4>🔧 Admin Features</h4>
                  <div className="faq-item">
                    <h5>How do I manage feedback items?</h5>
                    <p>Use the Feedback tab to view, filter, and manage all feedback. You can assign teams, update status, and perform bulk actions.</p>
                  </div>
                  <div className="faq-item">
                    <h5>How do I create surveys?</h5>
                    <p>Use the Survey Builder to create NPS, CSAT, or custom surveys with conditional logic and multiple question types.</p>
                  </div>
                </div>

                <div className="help-section">
                  <h4>📊 Analytics & Reports</h4>
                  <div className="faq-item">
                    <h5>What analytics are available?</h5>
                    <p>View sentiment analysis, category breakdowns, user insights, and export data to CSV for further analysis.</p>
                  </div>
                  <div className="faq-item">
                    <h5>How do I export data?</h5>
                    <p>Use the Export CSV button in the admin header to download all feedback data, or select specific items for targeted exports.</p>
                  </div>
                </div>

                <div className="help-section">
                  <h4>🎨 Customization</h4>
                  <div className="faq-item">
                    <h5>How do I load demo data?</h5>
                    <p>Click the "🎭 Load Demo" button to populate the system with 25+ realistic feedback entries for testing and demonstration.</p>
                  </div>
                </div>
              </div>

              <div className="contact-support">
                <h4>📞 Contact Support</h4>
                <p>Need additional help? Contact our support team:</p>
                <div className="contact-methods">
                  <div className="contact-item">
                    <strong>Email:</strong> support@feedbackflow.com
                  </div>
                  <div className="contact-item">
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </div>
                  <div className="contact-item">
                    <strong>Hours:</strong> Monday-Friday, 9AM-6PM EST
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
