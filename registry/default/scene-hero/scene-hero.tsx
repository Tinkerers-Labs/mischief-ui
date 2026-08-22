"use client"

import * as React from "react"
import * as THREE from "three"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type SceneHeroShape =
  "torus-knot" | "icosahedron" | "capsule" | "box" | "torus"

export type SceneHeroProps = React.HTMLAttributes<HTMLDivElement> & {
  shape?: SceneHeroShape
  /** Colour of the object. A theme custom property or a CSS colour. */
  color?: string
  /** Colour of the light that rims it. */
  rim?: string
  metalness?: number
  roughness?: number
  /** Turns per second at rest. */
  speed?: number
  /** How far the object leans toward the pointer, in radians. */
  sway?: number
  paused?: boolean
  surfaceClassName?: string
}

type Scene = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  key: THREE.DirectionalLight
  fill: THREE.PointLight
  width: number
  height: number
  dpr: number
}

function geometryFor(shape: SceneHeroShape): THREE.BufferGeometry {
  switch (shape) {
    case "icosahedron":
      return new THREE.IcosahedronGeometry(1.15, 0)
    case "capsule":
      return new THREE.CapsuleGeometry(0.7, 1.1, 12, 32)
    case "box":
      return new THREE.BoxGeometry(1.5, 1.5, 1.5, 2, 2, 2)
    case "torus":
      return new THREE.TorusGeometry(1, 0.38, 24, 64)
    default:
      return new THREE.TorusKnotGeometry(0.9, 0.3, 160, 24)
  }
}

function toThree([r, g, b]: SurfaceColor) {
  return new THREE.Color(r, g, b)
}

/**
 * A lit object on a transparent background, sized to its box and steered by
 * the pointer. This is the one component that asks for three, because the
 * geometry, the material and the two lights are the point of it.
 */
export function SceneHero({
  shape = "torus-knot",
  color = "--primary",
  rim = "--foreground",
  metalness = 0.55,
  roughness = 0.25,
  speed = 0.12,
  sway = 0.35,
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: SceneHeroProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pointer = React.useRef({ x: 0, y: 0 })

  const tokens = React.useMemo(
    () => [color, rim].filter((entry) => entry.startsWith("--")),
    [color, rim]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const bodyColor = color.startsWith("--") ? resolved[color] : undefined
  const rimColor = rim.startsWith("--") ? resolved[rim] : undefined
  const ready = bodyColor !== undefined && rimColor !== undefined

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
        42,
        size.width / Math.max(size.height, 1),
        0.1,
        100
      )
      camera.position.set(0, 0, 4.6)

      const material = new THREE.MeshStandardMaterial({
        metalness,
        roughness,
      })

      const mesh = new THREE.Mesh(geometryFor(shape), material)
      scene.add(mesh)

      const key = new THREE.DirectionalLight(0xffffff, 2.4)
      key.position.set(2.5, 3, 4)
      scene.add(key)

      const fill = new THREE.PointLight(0xffffff, 18, 20)
      fill.position.set(-3, -1.5, 2)
      scene.add(fill)

      scene.add(new THREE.AmbientLight(0xffffff, 0.5))

      return {
        renderer,
        scene,
        camera,
        mesh,
        material,
        key,
        fill,
        width: size.width,
        height: size.height,
        dpr: size.dpr,
      }
    },
    [metalness, roughness, shape]
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

      if (bodyColor) state.material.color.copy(toThree(bodyColor))
      if (rimColor) state.fill.color.copy(toThree(rimColor))

      state.mesh.rotation.y += delta * speed * Math.PI * 2
      state.mesh.rotation.x +=
        (pointer.current.y * sway - state.mesh.rotation.x) *
        Math.min(1, delta * 4)
      state.mesh.position.x +=
        (pointer.current.x * 0.3 - state.mesh.position.x) *
        Math.min(1, delta * 4)

      state.renderer.render(state.scene, state.camera)
    },
    [bodyColor, rimColor, speed, sway]
  )

  const teardown = React.useCallback((state: Scene) => {
    state.mesh.geometry.dispose()
    state.material.dispose()
    state.renderer.dispose()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="scene-hero"
      data-shape={shape}
      className={cn("relative isolate", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        pointer.current.y = ((event.clientY - rect.top) / rect.height) * 2 - 1
      }}
      onPointerLeave={() => {
        pointer.current.x = 0
        pointer.current.y = 0
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
          className={cn("absolute inset-0 -z-10", surfaceClassName)}
        />
      )}
      {children}
    </div>
  )
}
