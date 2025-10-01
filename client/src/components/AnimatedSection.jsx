
import {motion, useInView}  from "motion/react"
import {useRef} from 'react'

export const AnimatedSection = ({
  children,
  className = "",
  variant = "slideUp",
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const variants = {
    slideUp: { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } },
    slideLeft: { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 } },
    slideRight: { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  }

  return (
    <motion.div
      ref={ref}
      initial={variants[variant].initial}
      animate={isInView ? variants[variant].animate : variants[variant].initial}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}