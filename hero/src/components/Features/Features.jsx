import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  RiCalendarCheckLine,
  RiNotification3Line,
  RiFileChartLine,
  RiTeamLine,
  RiSmartphoneLine,
  RiLockPasswordLine,
} from 'react-icons/ri'
import styles from './Features.module.scss'

const FEATURES = [
  {
    icon: <RiCalendarCheckLine size={24} />,
    title: 'Agenda online 24/7',
    desc: 'Tus pacientes reservan turnos en cualquier momento desde cualquier dispositivo, sin necesidad de llamar al consultorio.',
  },
  {
    icon: <RiNotification3Line size={24} />,
    title: 'Recordatorios automáticos',
    desc: 'Enviá confirmaciones y recordatorios por WhatsApp o email. Reducí el ausentismo hasta un 40% sin esfuerzo manual.',
  },
  {
    icon: <RiFileChartLine size={24} />,
    title: 'Reportes e historial',
    desc: 'Visualizá métricas clave de tu práctica: turnos atendidos, cancelaciones, ingresos estimados y tendencias mensuales.',
  },
  {
    icon: <RiTeamLine size={24} />,
    title: 'Multi-profesional',
    desc: 'Gestioná una clínica entera desde un solo lugar. Cada profesional tiene su agenda, sus pacientes y sus métricas.',
  },
  {
    icon: <RiSmartphoneLine size={24} />,
    title: 'App para pacientes',
    desc: 'Tus pacientes tienen su propio espacio para ver, confirmar o cancelar turnos desde el celular con un clic.',
  },
  {
    icon: <RiLockPasswordLine size={24} />,
    title: 'Datos seguros',
    desc: 'Toda la información está cifrada y almacenada de forma segura. Cumplimos con las normas de privacidad médica vigentes.',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div className={styles.card} variants={cardVariants}>
      <div className={styles.iconWrap}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{desc}</p>
    </motion.div>
  )
}

function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          ref={ref}
        >
          <span className={styles.eyebrow}>Funcionalidades</span>
          <h2 className={styles.title}>
            Todo lo que necesitás{' '}
            <span className={styles.gradient}>en un solo lugar</span>
          </h2>
          <p className={styles.subtitle}>
            Diseñado específicamente para profesionales de la salud que quieren
            enfocarse en sus pacientes, no en la administración.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default Features