import { useCallback, useEffect, useMemo, useState } from 'react'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import UserPage from './pages/UserPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import {
  apiBaseFallback,
  buildQueryString,
  emptyCreateForm,
  emptyFilters,
  statusOptions,
  safeStorageRead,
  joinUrl,
  hasActiveFilters,
} from './complaintShared.js'
import './App.css'

function Navigation({ page, session, onNavigate, onLogout }) {
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={() => onNavigate('home')}>
        TransitCare
      </button>

      <nav className="topnav">
        {['home', 'login', 'register', 'user', 'admin'].map((item) => (
          <button
            key={item}
            type="button"
            className={page === item ? 'navlink active' : 'navlink'}
            onClick={() => onNavigate(item)}
          >
            {item === 'user' ? 'User Dashboard' : item === 'admin' ? 'Admin Dashboard' : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <span className="pill">{session.token ? `${session.role} signed in` : 'Guest mode'}</span>
        {session.token ? (
          <button type="button" className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        ) : null}
      </div>
    </header>
  )
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    const saved = safeStorageRead('transitcare_api_base_url', '')
    return saved || import.meta.env.VITE_API_BASE_URL || apiBaseFallback
  })
  const [session, setSession] = useState(() => ({
    token: safeStorageRead('transitcare_token', ''),
    role: safeStorageRead('transitcare_role', ''),
    userId: safeStorageRead('transitcare_user_id', ''),
    name: safeStorageRead('transitcare_name', ''),
  }))
  const [page, setPage] = useState('home')
  const [loginLoading, setLoginLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createMessage, setCreateMessage] = useState('')
  const [userFilters, setUserFilters] = useState(emptyFilters)
  const [adminFilters, setAdminFilters] = useState(emptyFilters)
  const [userComplaints, setUserComplaints] = useState([])
  const [adminComplaints, setAdminComplaints] = useState([])
  const [userLoading, setUserLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [userError, setUserError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminActionError, setAdminActionError] = useState('')
  const [adminActionMessage, setAdminActionMessage] = useState('')
  const [adminSavingId, setAdminSavingId] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem('transitcare_api_base_url', apiBaseUrl)
    } catch {
      // ignore
    }
  }, [apiBaseUrl])

  useEffect(() => {
    try {
      localStorage.setItem('transitcare_token', session.token)
      localStorage.setItem('transitcare_role', session.role)
      localStorage.setItem('transitcare_user_id', session.userId)
      localStorage.setItem('transitcare_name', session.name)
    } catch {
      // ignore
    }
  }, [session])

  const authHeaders = useMemo(() => {
    if (!session.token) {
      return {}
    }

    return { Authorization: `Bearer ${session.token}` }
  }, [session.token])

  const callApi = useCallback(
    async (path, options = {}) => {
      const response = await fetch(joinUrl(apiBaseUrl, path), {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...(options.headers || {}),
        },
        ...options,
      })

      const contentType = response.headers.get('content-type') || ''
      const payload = contentType.includes('application/json') ? await response.json() : await response.text()

      if (!response.ok) {
        const message =
          typeof payload === 'string'
            ? payload
            : payload?.title || payload?.detail || `Request failed with status ${response.status}`
        throw new Error(message)
      }

      return payload
    },
    [apiBaseUrl, authHeaders],
  )

  const loadComplaints = useCallback(
    async (kind, filters) => {
      const baseEndpoint = kind === 'admin' ? '/api/admin-complaints' : '/api/user-complaints'
      const searchEndpoint = kind === 'admin' ? '/api/admin-complaints/search' : '/api/user-complaints/search'
      const setLoading = kind === 'admin' ? setAdminLoading : setUserLoading
      const setError = kind === 'admin' ? setAdminError : setUserError
      const setData = kind === 'admin' ? setAdminComplaints : setUserComplaints

      if (!session.token) {
        setData([])
        setError('Please log in first.')
        return
      }

      setLoading(true)
      setError('')

      try {
        const useSearch = hasActiveFilters(filters)
        const endpoint = useSearch ? searchEndpoint : baseEndpoint
        const data = await callApi(`${endpoint}${useSearch ? buildQueryString(filters) : ''}`, {
          method: 'GET',
        })
        setData(Array.isArray(data) ? data : [])
      } catch (error) {
        setData([])
        setError(error.message)
      } finally {
        setLoading(false)
      }
    },
    [callApi, session.token],
  )

  useEffect(() => {
    if (page === 'user') {
      const timer = window.setTimeout(() => loadComplaints('user', userFilters), 200)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [loadComplaints, page, userFilters])

  useEffect(() => {
    if (page === 'admin') {
      const timer = window.setTimeout(() => loadComplaints('admin', adminFilters), 200)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [adminFilters, loadComplaints, page])

  const onLogin = async ({ email, password }) => {
    setLoginLoading(true)
    setAuthError('')
    setAuthMessage('')

    try {
      const data = await callApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setSession({
        token: data.token,
        role: data.role,
        userId: String(data.id),
        name: data.name,
      })
      setPage(data.role === 'Admin' ? 'admin' : 'user')
      setAuthMessage(`Welcome back, ${data.name}`)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const onRegister = async (form) => {
    setLoginLoading(true)
    setAuthError('')
    setAuthMessage('')

    try {
      const data = await callApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          nicNumber: form.nicNumber,
          password: form.password,
        }),
      })

      setSession({
        token: data.token,
        role: data.role,
        userId: String(data.id),
        name: data.name,
      })
      setPage('user')
      setAuthMessage(`Account created for ${data.name}`)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const onLogout = () => {
    setSession({ token: '', role: '', userId: '', name: '' })
    setPage('home')
    setUserComplaints([])
    setAdminComplaints([])
    setAuthMessage('')
    setAuthError('')
    setCreateError('')
    setCreateMessage('')
    setUserError('')
    setAdminError('')
    setAdminActionError('')
    setAdminActionMessage('')
    setAdminSavingId(null)
  }

  const onCreateSubmit = async (event) => {
    event.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    setCreateMessage('')

    try {
      const created = await callApi('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          category: createForm.complaintType,
          district: createForm.location.trim(),
          routeOrLocation: createForm.routeNumber.trim(),
        }),
      })

      setCreateMessage(`Complaint created successfully: ${created.referenceNumber}`)
      setCreateForm(emptyCreateForm)
      await loadComplaints('user', userFilters)
    } catch (error) {
      setCreateError(error.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const updateUserFilters = (patch) => setUserFilters((current) => ({ ...current, ...patch }))
  const updateAdminFilters = (patch) => setAdminFilters((current) => ({ ...current, ...patch }))

  const refreshUser = () => loadComplaints('user', userFilters)
  const refreshAdmin = () => loadComplaints('admin', adminFilters)

  const clearUserFilters = () => {
    setUserFilters(emptyFilters)
    setUserComplaints([])
  }

  const clearAdminFilters = () => {
    setAdminFilters(emptyFilters)
    setAdminComplaints([])
  }

  const onAdminStatusChange = async ({ id, status }) => {
    if (!id || !status || status === 'All') {
      return
    }

    setAdminSavingId(id)
    setAdminActionError('')
    setAdminActionMessage('')

    try {
      await callApi(`/api/complaints/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })

      setAdminActionMessage(`Complaint #${id} updated to ${status}.`)
      await loadComplaints('admin', adminFilters)
    } catch (error) {
      setAdminActionError(error.message)
    } finally {
      setAdminSavingId(null)
    }
  }

  const shellClassName =
    page === 'admin'
      ? 'app-shell admin-page'
      : page === 'home'
        ? 'app-shell page-home'
        : page === 'login' || page === 'register'
          ? 'app-shell page-auth'
          : 'app-shell'

  return (
    <main className={shellClassName}>
      {page !== 'admin' && page !== 'home' && page !== 'user' && page !== 'login' ? (
        <Navigation
          page={page}
          session={session}
          onNavigate={setPage}
          onLogout={onLogout}
        />
      ) : null}

      {authMessage ? <p className="success-banner">{authMessage}</p> : null}

      {page === 'home' ? (
        <HomePage
          session={session}
          onGoLogin={() => setPage('login')}
          onGoRegister={() => setPage('register')}
          onGoDashboard={() => setPage(session.role === 'Admin' ? 'admin' : 'user')}
        />
      ) : null}

      {page === 'login' ? (
        <LoginPage
          apiBaseUrl={apiBaseUrl}
          error={authError}
          loading={loginLoading}
          onLogin={onLogin}
          onGoHome={() => setPage('home')}
          onGoRegister={() => setPage('register')}
        />
      ) : null}

      {page === 'register' ? (
        <RegisterPage
          apiBaseUrl={apiBaseUrl}
          error={authError}
          loading={loginLoading}
          onRegister={onRegister}
          onGoHome={() => setPage('home')}
          onGoLogin={() => setPage('login')}
        />
      ) : null}

      {page === 'user' ? (
        <UserPage
          session={session}
          apiBaseUrl={apiBaseUrl}
          onLogout={onLogout}
          createForm={createForm}
          onCreateFormChange={(patch) => setCreateForm((current) => ({ ...current, ...patch }))}
          onCreateSubmit={onCreateSubmit}
          createLoading={createLoading}
          createError={createError}
          createMessage={createMessage}
          filters={userFilters}
          onFiltersChange={updateUserFilters}
          complaints={userComplaints}
          loading={userLoading}
          error={userError}
          onRefresh={refreshUser}
          onReset={clearUserFilters}
        />
      ) : null}

      {page === 'admin' ? (
        <AdminPage
          session={session}
          onLogout={onLogout}
          filters={adminFilters}
          onFiltersChange={updateAdminFilters}
          complaints={adminComplaints}
          loading={adminLoading}
          error={adminError}
          statusUpdateError={adminActionError}
          statusUpdateMessage={adminActionMessage}
          statusSavingId={adminSavingId}
          onStatusChange={onAdminStatusChange}
          onRefresh={refreshAdmin}
          onReset={clearAdminFilters}
        />
      ) : null}
    </main>
  )
}
