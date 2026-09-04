import { useMemo } from 'react'
import {
  formatDate,
  statusClassName,
  statusLabel,
  complaintTypeOptions,
} from '../complaintShared.js'

const sidebarItems = [
  { label: 'Dashboard', active: true },
  { label: 'All Complaints', active: false },
  { label: 'Pending', active: false },
  { label: 'Under Review', active: false },
  { label: 'Resolved', active: false },
  { label: 'Rejected', active: false },
  { label: 'Settings', active: false },
]

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

export default function AdminPage({
  session,
  filters,
  onFiltersChange,
  complaints,
  loading,
  error,
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

  return (
    <section className="admin-shell admin-shell-white">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-brand-block">
            <span className="admin-brand">Complaint Control Hub</span>
            <p className="admin-brand-sub">Inventory & tracking mode</p>
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
            <p className="admin-subtitle">Search and filter every complaint in a clean registry-style layout.</p>
          </div>

          <div className="admin-profile">
            <div className="admin-profile-copy">
              <strong>{session.name || 'Admin user'}</strong>
              <span>{session.userId || 'ID unavailable'}</span>
            </div>
            <div className="admin-avatar">{(session.name || 'A').slice(0, 1).toUpperCase()}</div>
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
              <h2>Search complaints</h2>
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
                  <option value="Submitted">Pending</option>
                  <option value="InReview">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
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

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Complaint details</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state compact">
                        <h3>No complaints found</h3>
                        <p>Try different search terms or remove filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : null}

                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>
                      <strong>{complaint.referenceNumber}</strong>
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <strong>{complaint.userName}</strong>
                        <span>{complaint.userId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-detail-cell">
                        <strong>{complaint.title}</strong>
                        <span>
                          {complaint.category} | Route {complaint.routeOrLocation} | {complaint.district}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClassName(complaint.status)}`}>
                        {statusLabel(complaint.status)}
                      </span>
                    </td>
                    <td>{formatDate(complaint.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </section>
  )
}
