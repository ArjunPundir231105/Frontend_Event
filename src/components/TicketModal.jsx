import { useState } from 'react'
import axios from 'axios'
import styles from './TicketModal.module.css'

export default function TicketModal({ event, onClose }) {
  const [email,      setEmail]      = useState('')
  const [consent,    setConsent]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  async function handleSubmit() {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address'); return
    }
    if (!consent) {
      setError('Please accept the opt-in to continue'); return
    }
    setLoading(true); setError('')
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/leads`, {
        email, consent, eventId: event._id
      })
      window.open(event.originalUrl, '_blank')
      onClose()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.topbar}>
          <span className={styles.label}>🎟 GET TICKETS</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.eventName}>{event.title}</div>
        {event.date && (
          <div className={styles.eventDate}>
            📅 {new Date(event.date).toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        )}

        <div className={styles.divider} />

        <label className={styles.fieldLabel}>Your Email Address</label>
        <input
          type="email"
          className={styles.input}
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => { setConsent(e.target.checked); setError('') }}
            className={styles.checkbox}
          />
          <span className={styles.checkText}>
            I agree to receive Sydney event updates via email. Unsubscribe anytime.
          </span>
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            className={styles.ctaBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Redirecting…' : 'Continue to Tickets →'}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}