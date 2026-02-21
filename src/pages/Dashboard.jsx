import { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Dashboard.module.css'

const STATUS_COLOR = {
  new: 'var(--accent)', updated: 'var(--accent2)',
  inactive: 'var(--muted)', imported: 'var(--purple)'
}
const STATUS_BG = {
  new: 'rgba(200,241,53,0.1)', updated: 'rgba(255,92,58,0.1)',
  inactive: 'rgba(82,82,106,0.15)', imported: 'rgba(155,127,244,0.1)'
}
const STATUS_EMOJI = { new: '🆕', updated: '🔄', inactive: '💤', imported: '✅' }

export default function Dashboard() {
  const [user,          setUser]          = useState(null)
  const [authLoading,   setAuthLoading]   = useState(true)
  const [events,        setEvents]        = useState([])
  const [selected,      setSelected]      = useState(null)
  const [keyword,       setKeyword]       = useState('')
  const [city,          setCity]          = useState('Sydney')
  const [statusFilter,  setStatusFilter]  = useState('all')

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false))
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const r = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/events?city=${city}&keyword=${keyword}`
    ).catch(() => ({ data: [] }))
    setEvents(r.data)
  }

  async function importEvent(ev, e) {
    e?.stopPropagation()
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/events/${ev._id}/import`, {
      importedBy: user?.displayName || 'admin'
    }, { withCredentials: true }).catch(() => {})
    fetchEvents()
    if (selected?._id === ev._id) setSelected({ ...ev, status: 'imported' })
  }

  const filtered = events.filter(ev =>
    (statusFilter === 'all' || ev.status === statusFilter) &&
    (!keyword || [ev.title, ev.venue, ev.description]
      .some(f => f?.toLowerCase().includes(keyword.toLowerCase())))
  )

  const counts = {
    new:      events.filter(e => e.status === 'new').length,
    updated:  events.filter(e => e.status === 'updated').length,
    inactive: events.filter(e => e.status === 'inactive').length,
    imported: events.filter(e => e.status === 'imported').length,
  }

  if (authLoading) return (
    <div className={styles.loader}>Loading…</div>
  )

  if (!user) return (
    <div className={styles.loginScreen}>
      <div className={styles.loginGhost}>ADMIN</div>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>SYD<span>.</span>EVENTS</div>
        <div className={styles.loginSub}>Admin Dashboard · Sign in to continue</div>
        <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className={styles.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </a>
      </div>
    </div>
  )

  return (
    <div className={styles.layout}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoText}>SYD<span>.</span>EVENTS</div>
          <div className={styles.logoSub}>Admin Dashboard</div>
        </div>

        <div className={styles.sidebarNav}>
          <div className={styles.navLabel}>Views</div>
          {[
            { key: 'all',      icon: '⚡', label: 'All Events',  count: events.length },
            { key: 'new',      icon: '🆕', label: 'New',         count: counts.new },
            { key: 'updated',  icon: '🔄', label: 'Updated',     count: counts.updated },
            { key: 'imported', icon: '✅', label: 'Imported',    count: counts.imported },
            { key: 'inactive', icon: '💤', label: 'Inactive',    count: counts.inactive },
          ].map(item => (
            <button
              key={item.key}
              className={`${styles.navItem} ${statusFilter === item.key ? styles.navActive : ''}`}
              onClick={() => setStatusFilter(item.key)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              <span className={`${styles.navCount} ${item.key === 'new' && counts.new > 0 ? styles.navCountHot : ''}`}>
                {item.count}
              </span>
            </button>
          ))}

          <div className={styles.navLabel} style={{ marginTop: 20 }}>Links</div>
          <a href="/" className={styles.navItem}>
            <span className={styles.navIcon}>🌐</span>
            Public Site
          </a>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.avatar}>
            {user.photos?.[0]?.value
              ? <img src={user.photos[0].value} alt="" className={styles.avatarImg} />
              : <span>{user.displayName?.[0] || 'A'}</span>
            }
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.displayName}</div>
            <div className={styles.userRole}>Admin</div>
          </div>
          <a href={`${import.meta.env.VITE_API_URL}/auth/logout`} className={styles.logoutBtn}>↩</a>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>

        {/* TOP BAR */}
        <div className={styles.topbar}>
          <h1 className={styles.topbarTitle}>Events</h1>
          <div className={styles.topbarFilters}>
            <select className={styles.select} value={city} onChange={e => setCity(e.target.value)}>
              <option>Sydney</option>
              <option>Melbourne</option>
              <option>Brisbane</option>
            </select>
            <input
              className={styles.searchBar}
              placeholder="Search title, venue…"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchEvents()}
            />
            <button className={styles.refreshBtn} onClick={fetchEvents}>↻ Refresh</button>
          </div>
        </div>

        {/* STATS */}
        <div className={styles.statsRow}>
          {[
            { label: 'New',      val: counts.new,      color: 'var(--accent)' },
            { label: 'Updated',  val: counts.updated,  color: 'var(--accent2)' },
            { label: 'Inactive', val: counts.inactive, color: 'var(--muted)' },
            { label: 'Imported', val: counts.imported, color: 'var(--purple)' },
            { label: 'Total',    val: events.length,   color: 'var(--text)' },
          ].map(s => (
            <div className={styles.statBox} key={s.label}>
              <div className={styles.statNum} style={{ color: s.color }}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABLE + PREVIEW */}
        <div className={styles.body}>

          {/* TABLE */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Status','Title','Date','Venue','Source','Action'].map(h => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyRow}>No events found</td></tr>
                ) : filtered.map(ev => (
                  <tr
                    key={ev._id}
                    className={`${styles.tr} ${selected?._id === ev._id ? styles.trSelected : ''}`}
                    onClick={() => setSelected(ev)}
                  >
                    <td className={styles.td}>
                      <span className={styles.badge} style={{
                        background: STATUS_BG[ev.status],
                        color: STATUS_COLOR[ev.status]
                      }}>
                        {ev.status}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.tdTitle}`}>{ev.title}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {ev.date ? new Date(ev.date).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'2-digit'}) : '—'}
                    </td>
                    <td className={`${styles.td} ${styles.tdVenue}`}>{ev.venue || '—'}</td>
                    <td className={`${styles.td} ${styles.tdMuted}`}>{ev.sourceWebsite}</td>
                    <td className={styles.td}>
                      {ev.status !== 'imported'
                        ? <button className={styles.importBtn} onClick={e => importEvent(ev, e)}>↑ Import</button>
                        : <span className={styles.importedTag}>✅ Done</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PREVIEW */}
          <aside className={styles.preview}>
            {selected ? (
              <>
                <div className={styles.previewHeader}>
                  <span className={styles.previewLabel}>Event Details</span>
                  <button className={styles.previewClose} onClick={() => setSelected(null)}>✕</button>
                </div>
                {selected.imageUrl
                  ? <img src={selected.imageUrl} alt="" className={styles.previewImg} />
                  : <div className={styles.previewImgPlaceholder}>🎉</div>
                }
                <div className={styles.previewBody}>
                  <span className={styles.badge} style={{
                    background: STATUS_BG[selected.status],
                    color: STATUS_COLOR[selected.status]
                  }}>
                    {STATUS_EMOJI[selected.status]} {selected.status}
                  </span>
                  <h2 className={styles.previewTitle}>{selected.title}</h2>
                  <div className={styles.previewMeta}>
                    <div>📅 {selected.date ? new Date(selected.date).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : 'Date TBA'}</div>
                    <div>📍 {[selected.venue, selected.address].filter(Boolean).join(' · ') || 'Sydney'}</div>
                    {selected.category && <div>🏷️ {selected.category}</div>}
                    <div>🌐 {selected.sourceWebsite}</div>
                  </div>
                  {selected.description && (
                    <p className={styles.previewDesc}>{selected.description.slice(0,200)}{selected.description.length>200?'…':''}</p>
                  )}
                  {selected.status === 'imported' && selected.importedBy && (
                    <p className={styles.importedBy}>✅ Imported by {selected.importedBy}</p>
                  )}
                </div>
                <div className={styles.previewActions}>
                  {selected.status !== 'imported' && (
                    <button className={styles.previewImportBtn} onClick={e => importEvent(selected, e)}>
                      ↑ Import to Platform
                    </button>
                  )}
                  {selected.originalUrl && (
                    <a href={selected.originalUrl} target="_blank" rel="noreferrer" className={styles.previewSourceLink}>
                      View Original ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={styles.previewHeader}>
                  <span className={styles.previewLabel}>Event Details</span>
                </div>
                <div className={styles.previewEmpty}>
                  <div className={styles.previewEmptyIcon}>👈</div>
                  <p>Click any row to preview event details</p>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}