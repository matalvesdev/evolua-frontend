/**
 * ScrollBasedVelocity — MagicUI (local copy)
 * Text scrolls horizontally at a speed proportional to scroll velocity.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { cn } from '../../lib/utils'

interface ScrollBasedVelocityProps {
  texts: string[]
  velocity?: number
  className?: string
  textClassName?: string
  separator?: string
}

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

export function ScrollBasedVelocity({
  texts,
  velocity = 5,
  className,
  textClassName,
  separator = '•',
}: ScrollBasedVelocityProps) {
  return (
    <section className={cn('overflow-hidden', className)}>
      {texts.map((text, i) => (
        <VelocityText
          key={i}
          text={text}
          baseVelocity={i % 2 === 0 ? velocity : -velocity}
          textClassName={textClassName}
          separator={separator}
        />
      ))}
    </section>
  )
}

function VelocityText({
  text,
  baseVelocity,
  textClassName,
  separator,
}: {
  text: string
  baseVelocity: number
  textClassName?: string
  separator?: string
}) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false })

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)

  const directionFactor = useRef<number>(1)
  const [isMounted, setIsMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- detecção SSR/CSR (componente vendored magicui)
  useEffect(() => { setIsMounted(true) }, [])

  useAnimationFrame((_t, delta) => {
    if (!isMounted) return
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get()
    baseX.set(baseX.get() + moveBy)
  })

  const repeated = `${text} ${separator} ${text} ${separator} ${text} ${separator} ${text} ${separator} `

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className={cn('flex whitespace-nowrap', textClassName)} style={{ x }}>
        <span className="block">{repeated}</span>
        <span className="block">{repeated}</span>
      </motion.div>
    </div>
  )
}
