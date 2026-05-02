import { RiBellLine } from 'react-icons/ri'
import styles from './Hero.module.scss'

const appointments = [
  { initials: 'MG', name: 'Martina González', type: 'Consulta general',  time: '09:00', status: 'Confirmado', color: '#00d4c8' },
  { initials: 'LR', name: 'Luis Ramírez',     type: 'Control de rutina', time: '10:30', status: 'Pendiente',  color: '#7f77dd' },
  { initials: 'VP', name: 'Valentina Pérez',  type: 'Primera consulta',  time: '12:00', status: 'Confirmado', color: '#1d9e75' },
]

const calDays = [
  { day: '28', active: false, dot: false },
  { day: '29', active: false, dot: true  },
  { day: '30', active: false, dot: false },
  { day: '31', active: false, dot: true  },
  { day: '1',  active: true,  dot: false },
  { day: '2',  active: false, dot: true  },
  { day: '3',  active: false, dot: false },
]

const calLabels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

function AppMockup() {
  return (
    <div className={styles.mockupWrapper}>
      <div className={styles.appFrame}>

        {/* Header */}
        <div className={styles.appHeader}>
          <div>
            <p className={styles.appTitle}>Mis turnos</p>
            <p className={styles.appSub}>Viernes, 1 de mayo</p>
          </div>
          <span className={styles.todayBadge}>Hoy</span>
        </div>

        {/* Mini calendario */}
        <div className={styles.miniCal}>
          <div className={styles.calGrid}>
            {calLabels.map(l => (
              <span key={l} className={styles.calLabel}>{l}</span>
            ))}
            {calDays.map(({ day, active, dot }) => (
              <span
                key={day}
                className={`${styles.calDay} ${active ? styles.calActive : ''} ${dot ? styles.calDot : ''}`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Lista de turnos */}
        <p className={styles.sectionLabel}>Próximos turnos</p>
        <div className={styles.apptList}>
          {appointments.map(({ initials, name, type, time, status, color }) => (
            <div key={name} className={styles.apptCard}>
              <div
                className={styles.apptAvatar}
                style={{ background: `${color}22`, color }}
              >
                {initials}
              </div>
              <div className={styles.apptInfo}>
                <p className={styles.apptName}>{name}</p>
                <p className={styles.apptType}>{type}</p>
              </div>
              <div className={styles.apptMeta}>
                <p className={styles.apptTime}>{time}</p>
                <p className={styles.apptStatus}>{status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div className={styles.cardFooter}>
          {[['8', 'Hoy'], ['3', 'Pendientes'], ['0', 'Cancelados']].map(([num, lbl]) => (
            <div key={lbl} className={styles.cardStat}>
              <span
                className={styles.cardStatNum}
                style={lbl === 'Pendientes' ? { color: '#00d4c8' } : {}}
              >
                {num}
              </span>
              <span className={styles.cardStatLabel}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notificación flotante */}
      <div className={styles.notif}>
        <div className={styles.notifIcon}>
          <RiBellLine size={16} />
        </div>
        <div>
          <p className={styles.notifTitle}>Nuevo turno</p>
          <p className={styles.notifSub}>Carlos V. · Mañana 14:00</p>
        </div>
      </div>
    </div>
  )
}

export default AppMockup