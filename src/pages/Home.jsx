import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import EventCard   from '../components/EventCard'
import TicketModal from '../components/TicketModal'
import styles from './Home.module.css'

const CATEGORIES = ['All', 'Music', 'Sports', 'Arts', 'Food', 'Comedy', 'Family', 'Festival']

export default function Home() {
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    setLoading(true)
    axios.get(`${import.meta.env.VITE_API_URL}/api/events`)
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter(ev => {
    const matchCat = category === 'All' ||
      ev.category?.toLowerCase().includes(category.toLowerCase())
    const q = search.toLowerCase()
    const matchSearch = !q ||
      [ev.title, ev.venue, ev.description].some(f => f?.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>
            SYD<span>.</span>EVENTS
          </a>
          <nav className={styles.nav}>
            <a href="#events" className={styles.navLink}>Events</a>
            <a href="/dashboard" className={styles.dashBtn}>Dashboard →</a>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGhost}>SYDNEY</div>
        <div className={styles.heroContent}>
          <div className={styles.liveTag}>
            <span className={styles.liveDot} />
            Live · Auto-updated
          </div>
          <h1 className={styles.heroTitle}>
            Discover<br /><em>What's On</em>
          </h1>
          <p className={styles.heroSub}>
            Every event happening in Sydney — concerts, food festivals,<br />
            sports, arts and more. Scraped fresh, updated automatically.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{events.length}</span>
              <span className={styles.statLabel}>Events</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>{events.filter(e => e.status === 'new').length}</span>
              <span className={styles.statLabel}>New Today</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>AU</span>
              <span className={styles.statLabel}>Sydney Only</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <div className={styles.filtersBar} id="events">
        <div className={styles.pills}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.pill} ${category === cat ? styles.pillActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search events, venues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── SECTION LABEL ── */}
      <div className={styles.sectionRow}>
        <h2 className={styles.sectionTitle}>All Events</h2>
        <span className={styles.sectionCount}>{filtered.length} results</span>
      </div>

      {/* ── GRID ── */}
      <div className={styles.grid}>
        {loading
          ? Array(8).fill(0).map((_, i) => (
              <div key={i} className={styles.skeleton}
                   style={{ animationDelay: `${i * 0.06}s` }} />
            ))
          : filtered.length === 0
          ? <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No events found</h3>
              <p>Try a different search or category</p>
            </div>
          : filtered.map((ev, i) => (
              <div key={ev._id} style={{ animationDelay: `${i * 0.04}s` }}>
                <EventCard event={ev} onGetTickets={setModal} />
              </div>
            ))
        }
      </div>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>SYD<span>.</span>EVENTS</span>
        <span className={styles.footerText}>Auto-updated from Ticketmaster &amp; more · Sydney, AU</span>
      </footer>

      {/* ── MODAL ── */}
      {modal && <TicketModal event={modal} onClose={() => setModal(null)} />}
    </div>
  )
}