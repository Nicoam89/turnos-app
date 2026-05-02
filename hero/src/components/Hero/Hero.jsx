import { motion } from 'framer-motion'
import { RiArrowRightLine, RiPlayCircleLine } from 'react-icons/ri'
import { Link } from 'react-scroll'
import AppMockup from './AppMockup'
import styles from './Hero.module.scss'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay },
  }),
}

const stats = [
  { number: '+5K',  label: 'Profesionales activos' },
  { number: '98%',  label: 'Satisfacción de usuarios' },
  { number: '40%',  label: 'Menos ausentismo' },
]

function Hero() {
  return (
    <section className={styles.hero} id="hero">

      {/* Orbs de fondo */}
      <div className={styles.orbTop} />
      <div className={styles.orbBottom} />

      <div className={styles.container}>

        {/* ── Columna izquierda ── */}
        <div className={styles.left}>

          <motion.div
            className={styles.badge}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className={styles.badgeDot} />
            Nuevo · Recordatorios automáticos por WhatsApp
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            Gestioná tus turnos<br />
            <span className={styles.gradientText}>sin complicaciones</span>
          </motion.h1>

          <motion.p
            className={styles.desc}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            La plataforma de gestión de turnos diseñada para médicos y
            profesionales de la salud. Menos papel, menos llamadas,
            más tiempo para lo que importa.
          </motion.p>

          <motion.div
            className={styles.actions}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            <Link to="pricing" smooth duration={500} offset={-80}>
              <button className={styles.btnPrimary}>
                Empezar gratis
                <RiArrowRightLine size={18} />
              </button>
            </Link>

            <button className={styles.btnSecondary}>
              <span className={styles.playCircle}>
                <RiPlayCircleLine size={20} />
              </span>
              Ver demo
            </button>
          </motion.div>

          <motion.div
            className={styles.stats}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
          >
            {stats.map(({ number, label }) => (
              <div key={label} className={styles.statItem}>
                <span className={styles.statNumber}>{number}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Columna derecha ── */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          <AppMockup />
        </motion.div>

      </div>
    </section>
  )
}

export default Hero