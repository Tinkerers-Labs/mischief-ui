"use client"

import * as React from "react"
import * as THREE from "three"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type GlobeMarker = {
  id?: string
  lat: number
  lng: number
  label: string
}

export type GlobeArc = {
  from: { lat: number; lng: number }
  to: { lat: number; lng: number }
}

export type WireframeGlobeProps = React.HTMLAttributes<HTMLDivElement> & {
  markers?: readonly GlobeMarker[]
  arcs?: readonly GlobeArc[]
  /** Colour of the sphere's lines. */
  color?: string
  /** Colour of the markers and the arcs. */
  accent?: string
  /** Turns per second. */
  speed?: number
  /** Lets the pointer spin it. */
  interactive?: boolean
  paused?: boolean
  surfaceClassName?: string
}

type Scene = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  world: THREE.Group
  wireMaterial: THREE.LineBasicMaterial
  accentMaterial: THREE.MeshBasicMaterial
  arcMaterial: THREE.LineBasicMaterial
  disposables: { dispose: () => void }[]
  width: number
  height: number
  dpr: number
}

const LATITUDES = 7
const MERIDIANS = 12

function onSphere(lat: number, lng: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + 180) * Math.PI) / 180

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function toThree([r, g, b]: SurfaceColor) {
  return new THREE.Color(r, g, b)
}

/**
 * A wireframe world with points on it. The list of places is also rendered as
 * text for anything that does not read a canvas, so the globe illustrates the
 * data rather than being the only copy of it.
 */
export function WireframeGlobe({
  markers = [],
  arcs = [],
  color = "--border",
  accent = "--primary",
  speed = 0.06,
  interactive = true,
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: WireframeGlobeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef({ spin: 0, velocity: 0, last: 0, active: false })

  const tokens = React.useMemo(
    () => [color, accent].filter((entry) => entry.startsWith("--")),
    [accent, color]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const lineColor = color.startsWith("--") ? resolved[color] : undefined
  const accentColor = accent.startsWith("--") ? resolved[accent] : undefined
  const ready = lineColor !== undefined && accentColor !== undefined

  const setup = React.useCallback(
    ({
      canvas,
      size,
    }: {
      canvas: HTMLCanvasElement
      size: { width: number; height: number; dpr: number }
    }): Scene => {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      })

      renderer.setPixelRatio(size.dpr)
      renderer.setSize(size.width, size.height, false)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        38,
        size.width / Math.max(size.height, 1),
        0.1,
        100
      )
      camera.position.set(0, 0, 3.6)

      const world = new THREE.Group()
      scene.add(world)

      const disposables: { dispose: () => void }[] = []

      // Latitude and longitude rings rather than a wireframe of the sphere's
      // triangles, which reads as a mesh and crowds into a knot at the poles.
      const wireMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.55,
      })
      disposables.push(wireMaterial)

      const ring = (points: THREE.Vector3[], closed: boolean) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        world.add(
          closed
            ? new THREE.LineLoop(geometry, wireMaterial)
            : new THREE.Line(geometry, wireMaterial)
        )
        disposables.push(geometry)
      }

      for (let index = 1; index <= LATITUDES; index += 1) {
        const lat = -90 + (index * 180) / (LATITUDES + 1)
        const points: THREE.Vector3[] = []
        for (let step = 0; step <= 64; step += 1) {
          points.push(onSphere(lat, (step / 64) * 360 - 180, 1))
        }
        ring(points, true)
      }

      for (let index = 0; index < MERIDIANS; index += 1) {
        const lng = (index * 360) / MERIDIANS - 180
        const points: THREE.Vector3[] = []
        for (let step = 0; step <= 48; step += 1) {
          points.push(onSphere(-90 + (step / 48) * 180, lng, 1))
        }
        ring(points, false)
      }

      const accentMaterial = new THREE.MeshBasicMaterial()
      const markerGeometry = new THREE.SphereGeometry(0.028, 12, 12)
      disposables.push(accentMaterial, markerGeometry)

      for (const marker of markers) {
        const dot = new THREE.Mesh(markerGeometry, accentMaterial)
        dot.position.copy(onSphere(marker.lat, marker.lng, 1.01))
        world.add(dot)
      }

      const arcMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.75,
      })
      disposables.push(arcMaterial)

      for (const arc of arcs) {
        const start = onSphere(arc.from.lat, arc.from.lng, 1.01)
        const end = onSphere(arc.to.lat, arc.to.lng, 1.01)
        const lift = 1.15 + start.distanceTo(end) * 0.22
        const middle = start.clone().add(end).normalize().multiplyScalar(lift)

        const curve = new THREE.QuadraticBezierCurve3(start, middle, end)
        const geometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(48)
        )

        world.add(new THREE.Line(geometry, arcMaterial))
        disposables.push(geometry)
      }

      world.rotation.x = 0.32

      return {
        renderer,
        scene,
        camera,
        world,
        wireMaterial,
        accentMaterial,
        arcMaterial,
        disposables,
        width: size.width,
        height: size.height,
        dpr: size.dpr,
      }
    },
    [arcs, markers]
  )

  const draw = React.useCallback(
    ({
      size,
      state,
      delta,
    }: {
      size: { width: number; height: number; dpr: number }
      state: Scene
      delta: number
    }) => {
      if (
        size.width !== state.width ||
        size.height !== state.height ||
        size.dpr !== state.dpr
      ) {
        state.width = size.width
        state.height = size.height
        state.dpr = size.dpr
        state.renderer.setPixelRatio(size.dpr)
        state.renderer.setSize(size.width, size.height, false)
        state.camera.aspect = size.width / Math.max(size.height, 1)
        state.camera.updateProjectionMatrix()
      }

      if (lineColor) state.wireMaterial.color.copy(toThree(lineColor))
      if (accentColor) {
        state.accentMaterial.color.copy(toThree(accentColor))
        state.arcMaterial.color.copy(toThree(accentColor))
      }

      if (!drag.current.active) {
        drag.current.spin += delta * speed * Math.PI * 2
        drag.current.spin += drag.current.velocity * delta
        drag.current.velocity *= 1 - Math.min(1, delta * 2.4)
      }

      state.world.rotation.y = drag.current.spin
      state.renderer.render(state.scene, state.camera)
    },
    [accentColor, lineColor, speed]
  )

  const teardown = React.useCallback((state: Scene) => {
    for (const item of state.disposables) item.dispose()
    state.renderer.dispose()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="wireframe-globe"
      className={cn("relative isolate", className)}
      onPointerDown={(event) => {
        if (!interactive) return
        drag.current.active = true
        drag.current.last = event.clientX
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!interactive || !drag.current.active) return
        const delta = (event.clientX - drag.current.last) * 0.01
        drag.current.last = event.clientX
        drag.current.spin += delta
        drag.current.velocity = delta * 24
      }}
      onPointerUp={() => {
        drag.current.active = false
      }}
      onPointerCancel={() => {
        drag.current.active = false
      }}
      {...rootProps}
    >
      {ready && (
        <RenderSurface<Scene, "none">
          contextType="none"
          setup={setup}
          draw={draw}
          teardown={teardown}
          rebuildOnResize={false}
          paused={paused}
          className={cn("absolute inset-0 -z-10 touch-none", surfaceClassName)}
        />
      )}

      {markers.length > 0 && (
        <ul className="sr-only">
          {markers.map((marker) => (
            <li key={marker.id ?? `${marker.lat},${marker.lng}`}>
              {marker.label}
            </li>
          ))}
        </ul>
      )}

      {children}
    </div>
  )
}
