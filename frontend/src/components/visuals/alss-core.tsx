"use client"

import { useEffect, useRef, useState } from "react"

// Lightweight Canvas "ALSS Eye" with organic fiber network.
// - Pulsing core (eye)
// - Procedural fibers (particles + lines)
// - API: window.ALSSCore.absorb() -> animates an orb into the core
// - Respects prefers-reduced-motion

export default function ALSSCore({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    try {
      const m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')
      const update = () => setReduceMotion(!!m?.matches)
      update()
      m?.addEventListener?.('change', update)
      return () => m?.removeEventListener?.('change', update)
    } catch {}
  }, [])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ctxMaybe = el.getContext("2d", { alpha: true })
    if (!ctxMaybe) return
    const ctx = ctxMaybe

    let raf = 0
    let w = el.clientWidth
    let h = el.clientHeight
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    el.width = Math.floor(w * dpr)
    el.height = Math.floor(h * dpr)
    ctx.scale(dpr, dpr)

    const center = { x: w / 2, y: h / 2 }
    let mode: "calm" | "warn" | "danger" = "calm"
    const mouse = { x: -9999, y: -9999, f: 0 }

    // Fiber nodes
    const N = reduceMotion ? 80 : 160
    const nodes: { x: number; y: number; a: number; r: number; s: number }[] = []
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * Math.min(w, h) * 0.48 + 20
      nodes.push({ x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r, a, r, s: 0.0008 + Math.random() * 0.0018 })
    }

    // Absorption orb state
    let orbActive = false
    let orb = { x: 0, y: 0, life: 0, duration: 900 }

    // Expose API on window
    ;(window as any).ALSSCore = (window as any).ALSSCore || {}
    ;(window as any).ALSSCore.setMode = (m: "calm" | "warn" | "danger") => { mode = m }
    ;(window as any).ALSSCore.absorb = () => {
      if (!el) return Promise.resolve()
      const angle = Math.random() * Math.PI * 2
      const radius = Math.max(w, h) * 0.6
      orb.x = center.x + Math.cos(angle) * radius
      orb.y = center.y + Math.sin(angle) * radius
      orb.life = 0
      orbActive = true
      return new Promise<void>((resolve) => {
        const check = () => {
          if (!orbActive) resolve()
          else setTimeout(check, 60)
        }
        check()
      })
    }

    function resize() {
      if (!el) return
      const rect = el.getBoundingClientRect()
      w = rect.width
      h = rect.height
      el.width = Math.floor(w * dpr)
      el.height = Math.floor(h * dpr)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      center.x = w / 2
      center.y = h / 2
    }

    const onResize = () => resize()
    const onMove = (ev: PointerEvent) => {
      mouse.x = ev.clientX
      mouse.y = ev.clientY
      const dx = mouse.x - (el.getBoundingClientRect().left + center.x)
      const dy = mouse.y - (el.getBoundingClientRect().top + center.y)
      const d = Math.hypot(dx, dy)
      const r = Math.min(w, h) * 0.45
      const f = Math.max(0, 1 - d / r)
      mouse.f = isFinite(f) ? f : 0
    }
    window.addEventListener("resize", onResize)
    window.addEventListener("pointermove", onMove)

    function drawCore(t: number) {
      const pulse = reduceMotion ? 0.04 : (Math.sin(t * 0.002) * 0.08 + 0.12)
      const rX = Math.min(w, h) * (0.10 + pulse)
      const rY = rX * 0.62

      // Glow
      const g = ctx.createRadialGradient(center.x, center.y, 2, center.x, center.y, rX * 1.6)
      const edge = mode === 'danger' ? 'rgba(239,68,68,0.08)' : mode === 'warn' ? 'rgba(245,158,11,0.08)' : 'rgba(25,245,159,0.05)'
      g.addColorStop(0, "rgba(255,255,255,0.9)")
      g.addColorStop(1, edge)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(center.x, center.y, rX * 1.2, rY * 1.2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Focus glow (pointer proximity)
      if (mouse.f > 0.02) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const fg = mode === 'danger' ? '255,64,64' : mode === 'warn' ? '255,196,64' : '0,224,184'
        ctx.fillStyle = `rgba(${fg},${0.12 * mouse.f})`
        ctx.beginPath()
        ctx.ellipse(center.x, center.y, rX * (1.4 + mouse.f * 0.6), rY * (1.4 + mouse.f * 0.6), 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Eye
      ctx.fillStyle = "rgba(255,255,255,0.9)"
      ctx.beginPath()
      ctx.ellipse(center.x, center.y, rX, rY, 0, 0, Math.PI * 2)
      ctx.fill()

      // Pupil soft
      const pg = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, rY * 0.65)
      pg.addColorStop(0, "rgba(0,0,0,0.45)")
      pg.addColorStop(1, "rgba(0,0,0,0.0)")
      ctx.fillStyle = pg
      ctx.beginPath()
      ctx.ellipse(center.x, center.y, rX * 0.75, rY * 0.75, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawFibers(t: number) {
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.a += n.s
        const jitter = mode === 'danger' ? 0.12 : mode === 'warn' ? 0.06 : 0.02
        n.r += Math.sin(t * 0.0003 + i) * jitter
        n.x = center.x + Math.cos(n.a) * n.r
        n.y = center.y + Math.sin(n.a) * n.r

        // color drift based on mode
        let hueBase = 160
        let hueAmp = 40
        if (mode === 'warn') { hueBase = 40; hueAmp = 20 }
        if (mode === 'danger') { hueBase = 0; hueAmp = 18 }
        const hue = hueBase + Math.sin((t * 0.0002) + i * 0.13) * hueAmp
        const alpha = mode === 'danger' ? 0.16 : mode === 'warn' ? 0.14 : 0.12
        ctx.strokeStyle = `hsla(${hue}, 80%, 55%, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(n.x, n.y)
        const cx = (n.x + center.x) / 2 + Math.sin(t * 0.001 + i) * 12
        const cy = (n.y + center.y) / 2 + Math.cos(t * 0.0012 + i) * 12
        ctx.quadraticCurveTo(cx, cy, center.x, center.y)
        ctx.stroke()

        // tiny node glow
        const na = mode === 'danger' ? 0.22 : 0.18
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${na})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function drawOrb(t: number) {
      if (!orbActive) return
      const toCenter = Math.hypot(center.x - orb.x, center.y - orb.y)
      const speed = Math.max(2.2, toCenter * 0.04)
      const ang = Math.atan2(center.y - orb.y, center.x - orb.x)
      orb.x += Math.cos(ang) * speed
      orb.y += Math.sin(ang) * speed
      orb.life += 16

      const alpha = Math.max(0.1, Math.min(1, toCenter / 140))
      ctx.fillStyle = `rgba(0, 224, 184, ${0.35 * alpha})`
      ctx.beginPath()
      ctx.arc(orb.x, orb.y, 5 + Math.sin(t * 0.02) * 1.2, 0, Math.PI * 2)
      ctx.fill()

      if (toCenter < 8) {
        orbActive = false
      }
    }

    function tick(t: number) {
      ctx.clearRect(0, 0, w, h)
      // soft dark backdrop
      ctx.fillStyle = "rgba(11,15,20,0.35)"
      ctx.fillRect(0, 0, w, h)

      drawFibers(t)
      drawCore(t)
      drawOrb(t)

      raf = reduceMotion ? 0 : requestAnimationFrame(tick)
    }

    if (!reduceMotion) raf = requestAnimationFrame(tick)
    else {
      // Static render
      tick(0)
    }

    resize()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onMove)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className={className} />
}
