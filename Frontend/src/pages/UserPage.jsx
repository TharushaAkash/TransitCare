import { useEffect, useMemo, useState } from 'react'
import {
  complaintTypeOptions,
  formatDateTime,
  statusClassName,
  statusLabel,
} from '../complaintShared.js'

function ComplaintCard({ complaint }) {
  return (
    <article className="complaint-card">
      <div className="card-top">
        <div>
          <p className="complaint-id">{complaint.referenceNumber}</p>
          <h3>{complaint.title}</h3>
        </div>
        <span className={`status-badge ${statusClassName(complaint.status)}`}>{statusLabel(complaint.status)}</span>
      </div>

      <p className="complaint-description">{complaint.description}</p>

      <div className="info-grid">
        <div>
          <span>User ID</span>
          <strong>{complaint.userId}</strong>
        </div>
        <div>
          <span>User name</span>
          <strong>{complaint.userName}</strong>
        </div>
        <div>
          <span>Complaint type</span>
          <strong>{complaint.category}</strong>
        </div>
        <div>
          <span>Route number</span>
          <strong>{complaint.routeOrLocation}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{complaint.district}</strong>
        </div>
        <div>
          <span>Created</span>
          <strong>{formatDateTime(complaint.createdAt)}</strong>
        </div>
      </div>

      {complaint.adminResponse ? (
        <div className="response-box">
          <span>Admin response</span>
          <p>{complaint.adminResponse}</p>
        </div>
      ) : null}
    </article>
  )
}

function ComplaintDashboard({
  title,
  session,
  filters,
  onFiltersChange,
  complaints,
  loading,
  error,
  onRefresh,
  onReset,
}) {
  const activeCount = [
    filters.keyword.trim(),
    filters.complaintType !== 'All',
    filters.routeNumber !== 'All',
    filters.location !== 'All',
    filters.status !== 'All',
    filters.date,
  ].filter(Boolean).length

  const statusCounts = useMemo(
    () =>
      complaints.reduce((acc, complaint) => {
        const key = complaint.status
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {}),
    [complaints],
  )

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>Show my complaints</h2>
        </div>
        <span className="pill">{activeCount} filters active</span>
      </div>

      <div className="summary-strip">
        <div className="summary-card compact">
          <span>Total</span>
          <strong>{complaints.length}</strong>
        </div>
        <div className="summary-card compact">
          <span>Submitted</span>
          <strong>{statusCounts.Submitted || 0}</strong>
        </div>
        <div className="summary-card compact">
          <span>In Review</span>
          <strong>{statusCounts.InReview || 0}</strong>
        </div>
        <div className="summary-card compact">
          <span>Resolved</span>
          <strong>{statusCounts.Resolved || 0}</strong>
        </div>
      </div>

      <div className="filter-grid">
        <label className="field full-width">
          <span>Search by keyword</span>
          <input
            type="search"
            value={filters.keyword}
            onChange={(event) => onFiltersChange({ keyword: event.target.value })}
            placeholder="Search title, location, route, status, user..."
          />
        </label>
        <label className="field">
          <span>Complaint type</span>
          <select
            value={filters.complaintType}
            onChange={(event) => onFiltersChange({ complaintType: event.target.value })}
          >
            {complaintTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Route number</span>
          <input
            type="text"
            value={filters.routeNumber}
            onChange={(event) => onFiltersChange({ routeNumber: event.target.value })}
            placeholder="120"
          />
        </label>
        <label className="field">
          <span>Location</span>
          <input
            type="text"
            value={filters.location}
            onChange={(event) => onFiltersChange({ location: event.target.value })}
            placeholder="Colombo Fort"
          />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={filters.status} onChange={(event) => onFiltersChange({ status: event.target.value })}>
            <option value="All">All</option>
            <option value="Submitted">Pending</option>
            <option value="InReview">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" value={filters.date} onChange={(event) => onFiltersChange({ date: event.target.value })} />
        </label>
      </div>

      <div className="button-row">
        <button type="button" className="primary-btn" onClick={onRefresh} disabled={loading || !session.token}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button type="button" className="secondary-btn" onClick={onReset}>
          Clear filters
        </button>
      </div>

      {error ? <p className="error-box">{error}</p> : null}

      <div className="complaint-list">
        {complaints.length === 0 && !loading ? (
          <div className="empty-state">
            <h3>No complaints found</h3>
            <p>Try different filters or log in with the correct role and user.</p>
          </div>
        ) : null}

        {complaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </section>
  )
}

export default function UserPage({
  session,
  apiBaseUrl,
  onLogout,
  createForm,
  onCreateFormChange,
  onCreateSubmit,
  createLoading,
  createError,
  createMessage,
  filters,
  onFiltersChange,
  complaints,
  loading,
  error,
  onRefresh,
  onReset,
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (createMessage) {
      setShowCreateForm(false)
    }
  }, [createMessage])

  return (
    <section className="page-grid dashboard-grid">
      <header className="user-header">
        <div>
          <p className="eyebrow user-eyebrow">User dashboard</p>
          <h1>Welcome back, {session.name || 'User'}</h1>
          <p className="user-subtitle">Signed in as {session.role || 'User'}{session.userId ? ` · ID ${session.userId}` : ''}</p>
        </div>

        <div className="user-header-actions">
          <div className="user-profile">
            <div className="user-profile-copy">
              <strong>{session.name || 'User'}</strong>
              <span>{session.userId || 'ID unavailable'}</span>
            </div>
            <div className="user-avatar">{(session.name || 'U').slice(0, 1).toUpperCase()}</div>
          </div>
          <button type="button" className="secondary-btn light-btn user-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">User dashboard</p>
            <h2>Submit complaint</h2>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setShowCreateForm((current) => !current)}
            disabled={!session.token}
          >
            {showCreateForm ? 'Close form' : 'Submit complaint'}
          </button>
        </div>

        <p className="helper-text">Click the button to open the complaint form.</p>

        {showCreateForm ? (
          <>
            <form className="auth-form" onSubmit={onCreateSubmit} style={{ marginTop: '18px' }}>
              <label className="field">
                <span>Title</span>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(event) => onCreateFormChange({ title: event.target.value })}
                  placeholder="Driver skipped stop"
                  required
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  value={createForm.description}
                  onChange={(event) => onCreateFormChange({ description: event.target.value })}
                  placeholder="Explain what happened..."
                  rows="5"
                  required
                />
              </label>
              <div className="split-grid">
                <label className="field">
                  <span>Complaint type</span>
                  <select
                    value={createForm.complaintType}
                    onChange={(event) => onCreateFormChange({ complaintType: event.target.value })}
                  >
                    {complaintTypeOptions.filter((option) => option !== 'All').map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Route number</span>
                  <input
                    type="text"
                    value={createForm.routeNumber}
                    onChange={(event) => onCreateFormChange({ routeNumber: event.target.value })}
                    placeholder="120"
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span>Location</span>
                <input
                  type="text"
                  value={createForm.location}
                  onChange={(event) => onCreateFormChange({ location: event.target.value })}
                  placeholder="Colombo Fort"
                  required
                />
              </label>

              <div className="button-row">
                <button type="submit" className="primary-btn" disabled={createLoading || !session.token}>
                  {createLoading ? 'Submitting...' : 'Send complaint'}
                </button>
              </div>
            </form>

            {createMessage ? <p className="success-banner" style={{ marginTop: '16px' }}>{createMessage}</p> : null}
            {createError ? <p className="error-box" style={{ marginTop: '16px' }}>{createError}</p> : null}
          </>
        ) : null}
      </section>

      <ComplaintDashboard
        title="My complaints"
        session={session}
        filters={filters}
        onFiltersChange={onFiltersChange}
        complaints={complaints}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
        onReset={onReset}
      />

      <p className="helper-text page-footer-note">API base URL: {apiBaseUrl}</p>
    </section>
  )
}
