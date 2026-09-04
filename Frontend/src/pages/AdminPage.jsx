import { useEffect, useMemo, useState } from 'react'
import {
  formatDate,
  statusClassName,
  statusLabel,
  complaintTypeOptions,
  statusOptions,
} from '../complaintShared.js'

const sidebarItems = [{ label: 'Dashboard', active: true }]

const statusOrder = ['Submitted', 'InReview', 'Resolved', 'Rejected']

const countBy = (items, selector) =>
  items.reduce((acc, item) => {
    const key = selector(item)
    if (!key) return acc
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

const getTopEntry = (counts) => {
  const entries = Object.entries(counts)
  if (entries.length === 0) return 'None'
  entries.sort((left, right) => right[1] - left[1])
  return entries[0][0]
}

function ComplaintStatusCard({ complaint, onStatusChange, statusSavingId }) {
  const [selectedStatus, setSelectedStatus] = useState(complaint.status)

  useEffect(() => {
    setSelectedStatus(complaint.status)
  }, [complaint.status])

  return (
    <article className="admin-complaint-card">
      <div className="admin-card-head">
        <div>
          <p className="complaint-id">{complaint.referenceNumber}</p>
          <h3>{complaint.title}</h3>
        </div>
        <span className={`status-badge ${statusClassName(complaint.status)}`}>{statusLabel(complaint.status)}</span>
      </div>

      <p className="complaint-description">{complaint.description}</p>

      <div className="admin-card-meta">
        <div>
          <span>User</span>
          <strong>{complaint.userName}</strong>
          <small>{complaint.userId}</small>
        </div>
        <div>
          <span>Route</span>
          <strong>{complaint.routeOrLocation}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{complaint.district}</strong>
        </div>
        <div>
          <span>Created</span>
          <strong>{formatDate(complaint.createdAt)}</strong>
        </div>
      </div>

      <div className="admin-status-editor">
        <label className="field">
          <span>Update status</span>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            {statusOptions
              .filter((option) => option !== 'All')
              .map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
          </select>
        </label>
        <button
          type="button"
          className="secondary-btn light-btn"
          onClick={() => onStatusChange({ id: complaint.id, status: selectedStatus })}
          disabled={statusSavingId === complaint.id}
        >
          {statusSavingId === complaint.id ? 'Saving...' : 'Update status'}
        </button>
      </div>
    </article>
  )
}

function StatusBoard({ complaints, onStatusChange, statusSavingId }) {
  return (
    <div className="status-board">
      {statusOrder.map((status) => {
        const items = complaints.filter((item) => item.status === status)

        return (
          <section key={status} className="status-column">
            <div className="status-column-head">
              <div>
                <p className="eyebrow">{statusLabel(status)}</p>
                <h3>{items.length} complaints</h3>
              </div>
            </div>

            <div className="status-column-list">
              {items.length === 0 ? (
                <div className="empty-state compact">
                  <h3>No complaints</h3>
                  <p>This status currently has no records.</p>
                </div>
              ) : (
                items.map((complaint) => (
                  <ComplaintStatusCard
                    key={complaint.id}
                    complaint={complaint}
                    onStatusChange={onStatusChange}
                    statusSavingId={statusSavingId}
                  />
                ))
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function AdminPage({
  session,
  onLogout,
  filters,
  onFiltersChange,
  complaints,
  loading,
  error,
  statusUpdateError,
  statusUpdateMessage,
  statusSavingId,
  onStatusChange,
  onRefresh,
  onReset,
}) {
  const stats = useMemo(() => {
    const complaintTypes = countBy(complaints, (item) => item.category)
    const routes = countBy(complaints, (item) => item.routeOrLocation)

    return {
      total: complaints.length,
      pending: complaints.filter((item) => item.status === 'Submitted').length,
      underReview: complaints.filter((item) => item.status === 'InReview').length,
      resolved: complaints.filter((item) => item.status === 'Resolved').length,
      mostCommonType: getTopEntry(complaintTypes),
      mostReportedRoute: getTopEntry(routes),
    }
  }, [complaints])

  const activeFilters = [
    filters.keyword.trim(),
    filters.complaintType !== 'All',
    filters.routeNumber !== 'All',
    filters.location !== 'All',
    filters.status !== 'All',
    filters.date,
  ].filter(Boolean).length

  const statusTabs = [
    { label: 'All Complaints', value: 'All' },
    { label: 'Pending', value: 'Submitted' },
    { label: 'Under Review', value: 'InReview' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Rejected', value: 'Rejected' },
  ]

  return (
    <section className="admin-shell admin-shell-white">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-brand-block">
            <span className="admin-brand">Complaint Control Hub</span>
            <p className="admin-brand-sub">White dashboard mode</p>
          </div>

          <nav className="admin-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={item.active ? 'admin-nav-item active' : 'admin-nav-item'}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <p className="admin-muted">Signed in as</p>
          <strong>{session.name || 'Admin'}</strong>
          <span>{session.role || 'Admin'}</span>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <p className="eyebrow admin-eyebrow">Admin dashboard</p>
            <h1>All complaints by users</h1>
            <p className="admin-subtitle">Search, filter, and update complaint status directly from the dashboard.</p>
          </div>

          <div className="admin-header-actions">
            <div className="admin-profile">
              <div className="admin-profile-copy">
                <strong>{session.name || 'Admin user'}</strong>
                <span>{session.userId || 'ID unavailable'}</span>
              </div>
              <div className="admin-avatar">{(session.name || 'A').slice(0, 1).toUpperCase()}</div>
            </div>
            <button type="button" className="secondary-btn light-btn admin-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="admin-metrics">
          <div className="metric-card metric-blue">
            <span>Total Complaints</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="metric-card metric-orange">
            <span>Pending Complaints</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="metric-card metric-yellow">
            <span>Under Review Complaints</span>
            <strong>{stats.underReview}</strong>
          </div>
          <div className="metric-card metric-green">
            <span>Resolved Complaints</span>
            <strong>{stats.resolved}</strong>
          </div>
          <div className="metric-card metric-indigo">
            <span>Most Common Complaint Type</span>
            <strong className="metric-text">{stats.mostCommonType}</strong>
          </div>
          <div className="metric-card metric-slate">
            <span>Most Reported Route</span>
            <strong className="metric-text">{stats.mostReportedRoute}</strong>
          </div>
        </section>

        <section className="admin-table-card">
          <div className="admin-table-head">
            <div>
              <p className="eyebrow admin-eyebrow">Global complaint registry</p>
              <h2>Search and filter complaints</h2>
            </div>

            <div className="admin-head-actions">
              <button type="button" className="secondary-btn light-btn" onClick={onRefresh} disabled={loading || !session.token}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button type="button" className="primary-btn" onClick={onReset}>
                Clear filters
              </button>
            </div>
          </div>

          <div className="admin-status-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={filters.status === tab.value ? 'admin-status-tab active' : 'admin-status-tab'}
                onClick={() => onFiltersChange({ status: tab.value })}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span>Search complaints</span>
              <input
                type="search"
                value={filters.keyword}
                onChange={(event) => onFiltersChange({ keyword: event.target.value })}
                placeholder="Search by keyword, user id, route, status..."
              />
            </label>

            <div className="admin-filter-row">
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
                <span>Route</span>
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
                  {statusOrder.map((option) => (
                    <option key={option} value={option}>
                      {statusLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) => onFiltersChange({ date: event.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="admin-summary-line">
            <span>{activeFilters} active filters</span>
            <span>{complaints.length} complaints shown</span>
          </div>

          {error ? <p className="error-box">{error}</p> : null}
          {statusUpdateError ? <p className="error-box">{statusUpdateError}</p> : null}
          {statusUpdateMessage ? <p className="success-banner">{statusUpdateMessage}</p> : null}

          <StatusBoard complaints={complaints} onStatusChange={onStatusChange} statusSavingId={statusSavingId} />

          {complaints.length === 0 && !loading ? (
            <div className="empty-state" style={{ marginTop: '18px' }}>
              <h3>No complaints found</h3>
              <p>Try different search terms or remove filters.</p>
            </div>
          ) : null}
        </section>
      </section>
    </section>
  )
}
