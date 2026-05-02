import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { RiCheckLine, RiCloseLine, RiArrowRightLine } from 'react-icons/ri'
import styles from './Pricing.module.scss'

const PLANS = [
  {
    name: 'Starter',
    price: '0',
    desc: 'Ideal para profesionales independientes que recién empiezan.',
    features: [
      { text: '1 profesional',           included: true  },
      { text: 'Hasta 50 turnos/mes',     included: true  },
      { text: 'Agenda online',           included: true  },
      { text: 'Recordatorios por email', included: true  },
      { text: 'Recordatorios WhatsApp',  included: false },
      { text: 'Reportes avanzados',      included: false },
      { text: 'Multi-profesional',       included: false },
      { text: 'Soporte prioritario',     included: false },
    ],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '12.990',
    period: '/mes',
    desc: 'Para profesionales que quieren automatizar y crecer sin límites.',
    features: [
      { text: '1 profesional',               included: true },
      { text: 'Turnos ilimitados',            included: true },
      { text: 'Agenda online',                included: true },
      { text: 'Recordatorios por email',      included: true },
      { text: 'Recordatorios WhatsApp',       included: true },
      { text: 'Reportes avanzados',           included: true },
      { text: 'Multi-profesional',            included: false },
      { text: 'Soporte prioritario',          included: false },
    ],
    cta: 'Empezar con Pro',
    highlighted: true,
    badge: 'Más popular',
  },
  {
    name: 'Clínica',
    price: '29.990',
    period: '/mes',
    desc: 'Para clínicas y equipos de salud que gestionan múltiples agendas.',
    features: [
      { text: 'Hasta 10 profesionales',      included: true },
      { text: 'Turnos ilimitados',           included: true },
      { text: 'Agenda online',               included: true },
      { text: 'Recordatorios por email',     included: true },
      { text: 'Recordatorios WhatsApp',      included: true },
      { text: 'Reportes avanzados',          included: true },
      { text: 'Multi-profesional',           included: true },
      { text: 'Soporte prioritario',         included: true },
    ],
    cta: 'Contactar ventas',
    highlighted: false,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

function PlanCard({ plan }) {
  const { name, price, period, desc, features, cta, highlighted, badge } = plan

  return (
    <motion.div
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
      variants={fadeUp}
    >
      {/* Badge popular */}
      {badge && (
        <div className={styles.badge}>{badge}</div>
      )}

      {/* Plan info */}
      <div className={styles.planHeader}>
        <h3 className={styles.planName}>{name}</h3>
        <div className={styles.priceRow}>
          {price === '0' ? (
            <span className={styles.price}>Gratis</span>
          ) : (
            <>
              <span className={styles.currency}>$</span>
              <span className={styles.price}>{price}</span>
              <span className={styles.period}>{period}</span>
            </>
          )}
        </div>
        <p className={styles.planDesc}>{desc}</p>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Features */}
      <ul className={styles.featureList}>
        {features.map(({ text, included }) => (
          <li
            key={text}
            className={`${styles.featureItem} ${!included ? styles.excluded : ''}`}
          >
            <span className={styles.featureIcon}>
              {included
                ? <RiCheckLine size={15} />
                : <RiCloseLine size={15} />
              }
            </span>
            {text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button className={`${styles.cta} ${highlighted ? styles.ctaHighlighted : ''}`}>
        {cta}
        <RiArrowRightLine size={16} />
      </button>
    </motion.div>
  )
}

function Pricing() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>

        {/* Header */}
        <motion.div
          className={styles.header}
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.eyebrow}>Precios</span>
          <h2 className={styles.title}>
            Elegí el plan{' '}
            <span className={styles.gradient}>que mejor se adapta</span>
          </h2>
          <p className={styles.subtitle}>
            Sin contratos. Sin sorpresas. Cambiá de plan cuando quieras.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className={styles.grid}
          variants={stagger}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          className={styles.note}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Todos los planes incluyen 14 días de prueba gratuita. No se requiere tarjeta de crédito.
        </motion.p>

      </div>
    </section>
  )
}

export default Pricing