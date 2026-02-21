import styles from './EventCard.module.css'

const CAT_EMOJI = {
  music: '🎵', sports: '⚡', arts: '🎨', food: '🍽️',
  comedy: '😂', family: '👨‍👩‍👧', theatre: '🎭', festival: '🎪'
}

function getCatEmoji(cat = '') {
  const key = cat.toLowerCase()
  for (const [k, v] of Object.entries(CAT_EMOJI)) {
    if (key.includes(k)) return v
  }
  return '🎉'
}

export default function EventCard({ event, onGetTickets }) {
  const { title, date, venue, description, imageUrl, category,
          sourceWebsite, originalUrl, status } = event

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short'
      })
    : 'Date TBA'

  return (
    <article className={styles.card}>
      <div className={styles.imgWrap}>
        {imageUrl
          ? <img src={imageUrl} alt={title} loading="lazy" className={styles.img} />
          : <div className={styles.imgPlaceholder}>{getCatEmoji(category)}</div>
        }
        <span className={`${styles.statusBadge} ${styles['status_' + status]}`}>
          {status}
        </span>
        {sourceWebsite && (
          <span className={styles.sourceBadge}>{sourceWebsite}</span>
        )}
      </div>

      <div className={styles.body}>
        {category && <div className={styles.category}>{category}</div>}
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span>📅 {formattedDate}</span>
          <span>📍 {venue || 'Sydney'}</span>
        </div>
        {description && (
          <p className={styles.desc}>
            {description.slice(0, 88)}{description.length > 88 ? '…' : ''}
          </p>
        )}
        <div className={styles.footer}>
          <button className={styles.ticketBtn} onClick={() => onGetTickets(event)}>
            Get Tickets
          </button>
          {originalUrl && (
            <a href={originalUrl} target="_blank" rel="noreferrer" className={styles.extLink}>
              ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}