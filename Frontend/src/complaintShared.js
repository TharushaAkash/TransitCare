export const apiBaseFallback = 'http://localhost:5049'

export const complaintTypeOptions = [
  'All',
  'Service delay',
  'Capacity issue',
  'Cleanliness',
  'Staff behavior',
  'Information issue',
]

export const statusOptions = ['All', 'Submitted', 'InReview', 'Resolved', 'Rejected']

export const emptyCreateForm = {
  title: '',
  description: '',
  complaintType: 'Service delay',
  routeNumber: '',
  location: '',
}

export const emptyFilters = {
  keyword: '',
  complaintType: 'All',
  routeNumber: 'All',
  location: 'All',
  status: 'All',
  date: '',
}

export const emptyRegisterForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  nicNumber: '',
  password: '',
}

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const formatDate = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
  }).format(new Date(value))

export const safeStorageRead = (key, fallback = '') => {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export const joinUrl = (baseUrl, path) => `${baseUrl.replace(/\/$/, '')}${path}`

export const buildQueryString = (filters) => {
  const params = new URLSearchParams()

  if (filters.keyword.trim()) params.set('Keyword', filters.keyword.trim())
  if (filters.complaintType !== 'All') params.set('ComplaintType', filters.complaintType)
  if (filters.routeNumber !== 'All') params.set('RouteNumber', filters.routeNumber)
  if (filters.location !== 'All') params.set('Location', filters.location)
  if (filters.status !== 'All') params.set('Status', filters.status)
  if (filters.date) params.set('Date', filters.date)

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const hasActiveFilters = (filters) =>
  Boolean(
    filters.keyword.trim() ||
      filters.complaintType !== 'All' ||
      filters.routeNumber !== 'All' ||
      filters.location !== 'All' ||
      filters.status !== 'All' ||
      filters.date,
  )

export const statusClassName = (status) => `status-${String(status).toLowerCase().replace(/\s+/g, '-')}`

export const statusLabel = (status) => String(status).replace(/([a-z])([A-Z])/g, '$1 $2')
