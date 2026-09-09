"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePointerTracking, getPointerPosition } from "@/hooks/usePointer";
import { useMounted } from "@/hooks/useMounted";
import { useIsSmallScreen } from "@/hooks/useMediaQuery";

const DESKTOP = {
  nodeCount: 46,
  connectionDistance: 2.8,
  pulseCount: 5,
  pointerRadius: 2.1,
};

const MOBILE = {
  nodeCount: 22,
  connectionDistance: 3.4,
  pulseCount: 0,
  pointerRadius: 0,
};

const NODE_SIZE = 0.045;
const DRIFT_AMPLITUDE = 0.13;
const DRIFT_SPEED = 0.22;
const ORBIT_SPEED = 0.014;

function buildGraph(config) {
  const nodes = [];
  for (let i = 0; i < config.nodeCount; i += 1) {
    nodes.push({
      base: new THREE.Vector3(
        (Math.random() - 0.5) * 8.4,
        (Math.random() - 0.5) * 6.2,
        (Math.random() - 0.5) * 4
      ),
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 0.6,
      hub: Math.random() > 0.72,
    });
  }

  const connections = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const distance = nodes[i].base.distanceTo(nodes[j].base);
      if (distance < config.connectionDistance) {
        connections.push({
          from: i,
          to: j,
          phase: Math.random() * Math.PI * 2,
          speed: 0.25 + Math.random() * 0.35,
        });
      }
    }
  }

  return { nodes, connections };
}

// Packets live in a ref and mutate every frame, so they are built outside the
// render path rather than in a memo.
function buildPulses(count, linkCount) {
  if (!count || !linkCount) return [];
  return Array.from({ length: count }, () => ({
    link: Math.floor(Math.random() * linkCount),
    progress: Math.random(),
    speed: 0.28 + Math.random() * 0.22,
    wait: Math.random() * 3,
  }));
}

function NetworkGraph({ isDark, reducedMotion, config, scrollRef }) {
  const groupRef = useRef();
  const nodesRef = useRef();
  const linesRef = useRef();
  const packetMeshRef = useRef();
  const clock = useRef(0);

  const { nodes, connections } = useMemo(() => buildGraph(config), [config]);

  const palette = useMemo(
    () =>
      isDark
        ? {
            node: new THREE.Color("#6366f1"),
            hub: new THREE.Color("#a855f7"),
            line: new THREE.Color("#4a6fa5"),
            pulse: new THREE.Color("#7dd3fc"),
            lineOpacity: 0.22,
            nodeOpacity: 0.74,
          }
        : {
            node: new THREE.Color("#818cf8"),
            hub: new THREE.Color("#c084fc"),
            line: new THREE.Color("#a5b4fc"),
            pulse: new THREE.Color("#6366f1"),
            lineOpacity: 0.24,
            nodeOpacity: 0.5,
          },
    [isDark]
  );

  const nodeGeometry = useMemo(
    () => new THREE.SphereGeometry(NODE_SIZE, 8, 8),
    []
  );
  const pulseGeometry = useMemo(
    () => new THREE.SphereGeometry(NODE_SIZE * 1.35, 8, 8),
    []
  );

  // Line geometry carries per-vertex colour so individual links can breathe
  // without allocating a material per connection.
  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(connections.length * 6);
    const colors = new Float32Array(connections.length * 6);
    connections.forEach((connection, index) => {
      const from = nodes[connection.from].base;
      const to = nodes[connection.to].base;
      positions.set([from.x, from.y, from.z, to.x, to.y, to.z], index * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [nodes, connections]);

  // Data packets that travel one link at a time, then hop to another link.
  const pulseCount = connections.length ? config.pulseCount : 0;
  const pulsesRef = useRef([]);

  const scratch = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      color: new THREE.Color(),
      live: new THREE.Vector3(),
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
    }),
    []
  );

  const livePositions = useMemo(
    () => nodes.map(() => new THREE.Vector3()),
    [nodes]
  );

  useFrame((state, delta) => {
    const { dummy, color, live, from, to } = scratch;
    const meshes = nodesRef.current;
    if (!meshes) return;

    const t = reducedMotion ? 0 : (clock.current += Math.min(delta, 0.05));

    // Pointer -> world space on the z=0 plane.
    let pointerX = 0;
    let pointerY = 0;
    if (config.pointerRadius > 0 && !reducedMotion) {
      const pointer = getPointerPosition();
      pointerX = pointer.x * (state.viewport.width / 2);
      pointerY = -pointer.y * (state.viewport.height / 2);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = t * ORBIT_SPEED;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.02;
      // Depth: the field drifts slightly against the page scroll.
      groupRef.current.position.y = scrollRef.current * 0.9;
    }

    // Nodes: drift + pointer proximity, in one pass, one draw call.
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const wobble = t * DRIFT_SPEED * node.speed + node.phase;
      live.set(
        node.base.x + Math.sin(wobble) * DRIFT_AMPLITUDE,
        node.base.y + Math.cos(wobble * 0.8) * DRIFT_AMPLITUDE * 0.7,
        node.base.z
      );
      livePositions[i].copy(live);

      let proximity = 0;
      if (config.pointerRadius > 0) {
        const dx = live.x - pointerX;
        const dy = live.y - pointerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < config.pointerRadius) {
          proximity = 1 - distance / config.pointerRadius;
        }
      }

      const breathe = node.hub ? 0.5 + 0.5 * Math.sin(t * 1.1 + node.phase) : 0;
      const scale = 1 + breathe * 0.35 + proximity * 0.9;

      dummy.position.copy(live);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshes.setMatrixAt(i, dummy.matrix);

      color
        .copy(node.hub ? palette.hub : palette.node)
        .multiplyScalar(0.75 + breathe * 0.25 + proximity * 0.6);
      meshes.setColorAt(i, color);
    }
    meshes.instanceMatrix.needsUpdate = true;
    if (meshes.instanceColor) meshes.instanceColor.needsUpdate = true;

    // Lines follow the drifted node positions and vary in opacity via colour.
    const lines = linesRef.current;
    if (lines) {
      const position = lines.geometry.attributes.position.array;
      const colorAttr = lines.geometry.attributes.color.array;
      for (let i = 0; i < connections.length; i += 1) {
        const connection = connections[i];
        const a = livePositions[connection.from];
        const b = livePositions[connection.to];
        const offset = i * 6;

        position[offset] = a.x;
        position[offset + 1] = a.y;
        position[offset + 2] = a.z;
        position[offset + 3] = b.x;
        position[offset + 4] = b.y;
        position[offset + 5] = b.z;

        const wave =
          0.55 + 0.45 * Math.sin(t * connection.speed + connection.phase);
        colorAttr[offset] = palette.line.r * wave;
        colorAttr[offset + 1] = palette.line.g * wave;
        colorAttr[offset + 2] = palette.line.b * wave;
        colorAttr[offset + 3] = palette.line.r * wave;
        colorAttr[offset + 4] = palette.line.g * wave;
        colorAttr[offset + 5] = palette.line.b * wave;
      }
      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.attributes.color.needsUpdate = true;
    }

    // Packets in flight.
    const packets = packetMeshRef.current;
    if (packets && pulseCount) {
      if (pulsesRef.current.length !== pulseCount) {
        pulsesRef.current = buildPulses(pulseCount, connections.length);
      }
      const pulses = pulsesRef.current;
      for (let i = 0; i < pulses.length; i += 1) {
        const pulse = pulses[i];
        if (pulse.wait > 0) {
          pulse.wait -= delta;
          dummy.scale.setScalar(0);
          dummy.position.set(0, 0, 0);
          dummy.updateMatrix();
          packets.setMatrixAt(i, dummy.matrix);
          continue;
        }

        pulse.progress += delta * pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.link = Math.floor(Math.random() * connections.length);
          pulse.speed = 0.28 + Math.random() * 0.22;
          pulse.wait = 1.2 + Math.random() * 3.5;
        }

        const connection = connections[pulse.link];
        from.copy(livePositions[connection.from]);
        to.copy(livePositions[connection.to]);
        dummy.position.lerpVectors(from, to, pulse.progress);
        // Fade in and out at the ends of the hop.
        const envelope = Math.sin(pulse.progress * Math.PI);
        dummy.scale.setScalar(envelope);
        dummy.updateMatrix();
        packets.setMatrixAt(i, dummy.matrix);
      }
      packets.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={palette.lineOpacity}
        />
      </lineSegments>

      <instancedMesh
        ref={nodesRef}
        args={[nodeGeometry, undefined, nodes.length]}
      >
        <meshBasicMaterial transparent opacity={palette.nodeOpacity} />
      </instancedMesh>

      {pulseCount > 0 && (
        <instancedMesh
          ref={packetMeshRef}
          args={[pulseGeometry, undefined, pulseCount]}
        >
          <meshBasicMaterial
            color={palette.pulse}
            transparent
            opacity={isDark ? 0.85 : 0.6}
          />
        </instancedMesh>
      )}
    </group>
  );
}

function GradientOverlays({ isDark }) {
  return (
    <>
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,0.19) 0%, rgba(56,189,248,0.10) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(129,140,248,0.12) 0%, rgba(196,181,253,0.08) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(192,132,252,0.1) 0%, rgba(165,180,252,0.05) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse, rgba(56,189,248,0.10) 0%, rgba(99,102,241,0.05) 50%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(165,180,252,0.08) 0%, rgba(99,102,241,0.04) 50%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
    </>
  );
}

export default function AnimatedBackground() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSmallScreen = useIsSmallScreen();
  const scrimRef = useRef(null);
  const scrollRef = useRef(0);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const config = isSmallScreen ? MOBILE : DESKTOP;

  usePointerTracking(!isSmallScreen && !prefersReducedMotion);

  // The network is the loudest behind the hero and calms down over content.
  // Written straight to the DOM inside one coalesced rAF - no re-render.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const viewport = window.innerHeight || 1;
        const progress = Math.min(
          Math.max((window.scrollY - viewport * 0.45) / (viewport * 0.75), 0),
          1
        );
        scrollRef.current = progress * 0.55;
        if (scrimRef.current) {
          scrimRef.current.style.opacity = (progress * 0.42).toFixed(3);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #0a1020 0%, #101018 50%, #0a0f1e 100%)"
            : "linear-gradient(180deg, #f5f7ff 0%, #F4F5FB 50%, #eef1f8 100%)",
        }}
      />

      <GradientOverlays isDark={isDark} />

      {mounted && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
          dpr={isSmallScreen ? 1 : [1, 1.5]}
          frameloop={prefersReducedMotion ? "demand" : "always"}
          gl={{ antialias: !isSmallScreen, alpha: true, powerPreference: "low-power" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <NetworkGraph
            isDark={isDark}
            reducedMotion={prefersReducedMotion}
            config={config}
            scrollRef={scrollRef}
          />
        </Canvas>
      )}

      {/* Readability scrim: fades the network back once content starts. */}
      <div
        ref={scrimRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: isDark
            ? "linear-gradient(180deg, rgba(10,16,32,0.22) 0%, rgba(10,16,32,0.60) 45%, rgba(10,16,32,0.66) 100%)"
            : "linear-gradient(180deg, rgba(244,245,251,0.4) 0%, rgba(244,245,251,0.88) 45%, rgba(244,245,251,0.92) 100%)",
          transition: "background-color 300ms ease",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
