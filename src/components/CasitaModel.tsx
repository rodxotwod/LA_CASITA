import { Html, RoundedBox, useCursor } from '@react-three/drei';
import { useMemo, useState } from 'react';
import * as THREE from 'three';

type CasitaModelProps = {
  onEnter: () => void;
  onHotspot: (id: string) => void;
};

type HotspotProps = {
  label: string;
  onSelect: () => void;
  position: [number, number, number];
};

const colors = {
  base: '#6ca326',
  baseDark: '#4f8420',
  chair: '#d98513',
  cream: '#f0d4b2',
  door: '#622611',
  lamp: '#ffd75e',
  louver: '#9b8580',
  pink: '#ee858a',
  pinkDark: '#cf6877',
  shadowPink: '#dd7380',
  window: '#473c3a',
  windowFrame: '#756a68',
  yellow: '#ffc51e',
  yellowDark: '#d99d11',
};

function Roof() {
  const geometry = useMemo(() => {
    const roof = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -3.35, 2.36, 1.95,
      3.35, 2.36, 1.95,
      -3.15, 2.3, -1.86,
      3.15, 2.3, -1.86,
      -3.08, 3.05, 0,
      3.08, 2.94, 0,
    ]);
    roof.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    roof.setIndex([
      0, 1, 5, 0, 5, 4,
      2, 4, 5, 2, 5, 3,
      0, 4, 2,
      1, 3, 5,
      0, 2, 3, 0, 3, 1,
    ]);
    roof.computeVertexNormals();
    return roof;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={colors.yellow} roughness={0.58} />
      </mesh>
      <RoundedBox args={[6.95, 0.22, 0.28]} position={[0, 2.26, 2.03]} radius={0.045} smoothness={5} castShadow>
        <meshStandardMaterial color={colors.yellow} roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[6.55, 0.18, 0.24]} position={[0, 2.23, -1.93]} radius={0.04} smoothness={5} castShadow>
        <meshStandardMaterial color={colors.yellowDark} roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.18, 3.95]} position={[-3.42, 2.22, 0.06]} radius={0.04} smoothness={5} castShadow>
        <meshStandardMaterial color={colors.yellowDark} roughness={0.62} />
      </RoundedBox>
    </group>
  );
}

function Arch({ x, width }: { x: number; width: number }) {
  const points = useMemo(() => {
    const radius = width / 2;
    const topY = 1.16;
    const curvePoints: THREE.Vector3[] = [];

    for (let i = 0; i <= 26; i += 1) {
      const angle = Math.PI - (Math.PI * i) / 26;
      curvePoints.push(new THREE.Vector3(x + Math.cos(angle) * radius, topY + Math.sin(angle) * radius, 1.63));
    }

    return curvePoints;
  }, [width, x]);

  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 34, 0.085, 14, false]} />
        <meshStandardMaterial color={colors.pink} roughness={0.7} />
      </mesh>
      <RoundedBox args={[0.2, 1.64, 0.2]} position={[x - width / 2, 0.66, 1.63]} radius={0.09} smoothness={8} castShadow>
        <meshStandardMaterial color={colors.pink} roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.2, 1.64, 0.2]} position={[x + width / 2, 0.66, 1.63]} radius={0.09} smoothness={8} castShadow>
        <meshStandardMaterial color={colors.pink} roughness={0.72} />
      </RoundedBox>
    </group>
  );
}

function Window({ position, side = false, scale = 1 }: { position: [number, number, number]; side?: boolean; scale?: number }) {
  return (
    <group position={position} rotation-y={side ? Math.PI / 2 : 0} scale={scale}>
      <RoundedBox args={[0.98, 0.78, 0.08]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={colors.windowFrame} roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, 0, 0.055]} castShadow>
        <boxGeometry args={[0.84, 0.64, 0.05]} />
        <meshStandardMaterial color={colors.window} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0.09]} castShadow>
        <boxGeometry args={[0.035, 0.65, 0.07]} />
        <meshStandardMaterial color="#302927" roughness={0.82} />
      </mesh>
      {[-0.24, -0.12, 0, 0.12, 0.24].map((y) => (
        <mesh key={y} position={[0, y, 0.12]} rotation-x={-0.16} castShadow>
          <boxGeometry args={[0.74, 0.045, 0.08]} />
          <meshStandardMaterial color={colors.louver} roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function Door({ onEnter }: { onEnter: () => void }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={[0.4, 0.84, 1.61]}
      onClick={(event) => {
        event.stopPropagation();
        onEnter();
      }}
      onPointerOut={() => setHovered(false)}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
    >
      <RoundedBox args={[0.56, 1.36, 0.1]} radius={0.025} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={hovered ? '#7d3418' : colors.door} roughness={0.72} />
      </RoundedBox>
      {[0.3, -0.06, -0.42].map((y) => (
        <mesh key={y} position={[0, y, 0.065]} castShadow>
          <boxGeometry args={[0.42, 0.035, 0.035]} />
          <meshStandardMaterial color="#7b3618" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0.2, -0.08, 0.09]} castShadow>
        <sphereGeometry args={[0.04, 18, 12]} />
        <meshStandardMaterial color={colors.yellow} roughness={0.46} />
      </mesh>
    </group>
  );
}

function Lamp() {
  return (
    <group position={[-0.18, 1.32, 1.68]}>
      <pointLight color={colors.lamp} intensity={2.4} distance={3.2} />
      <mesh castShadow>
        <sphereGeometry args={[0.16, 28, 18]} />
        <meshStandardMaterial color={colors.lamp} emissive={colors.lamp} emissiveIntensity={1.3} roughness={0.35} />
      </mesh>
    </group>
  );
}

function PlantCluster({ position, scale = 1, type }: { position: [number, number, number]; scale?: number; type: 'agave' | 'cactus' | 'shrub' }) {
  const greens = type === 'agave' ? ['#285f4b', '#36735b', '#1e4d3c'] : ['#2f862e', '#4f9f25', '#1d6b2c'];

  if (type === 'shrub') {
    return (
      <group position={position} scale={scale}>
        {Array.from({ length: 9 }, (_, index) => (
          <mesh
            key={index}
            position={[
              Math.sin(index * 1.7) * 0.28,
              0.12 + (index % 3) * 0.14,
              Math.cos(index * 1.25) * 0.18,
            ]}
            scale={[1.08, 0.82, 0.96]}
            castShadow
          >
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial color={greens[index % greens.length]} roughness={0.82} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={position} scale={scale}>
      {Array.from({ length: type === 'cactus' ? 7 : 10 }, (_, index) => (
        <mesh
          key={index}
          position={[Math.sin(index * 0.9) * 0.18, 0.28, Math.cos(index * 0.85) * 0.12]}
          rotation={[0.72 + (index % 2) * 0.22, index * 0.72, -0.65 + index * 0.15]}
          scale={[0.55, type === 'cactus' ? 0.88 : 0.66, 0.55]}
          castShadow
        >
          <capsuleGeometry args={[0.11, 0.72, 8, 14]} />
          <meshStandardMaterial color={greens[index % greens.length]} roughness={0.84} />
        </mesh>
      ))}
    </group>
  );
}

function RockingChair({ onPreview }: { onPreview: () => void }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const railGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(-0.5, -0.34, -0.44),
      new THREE.Vector3(-0.46, -0.42, -0.08),
      new THREE.Vector3(-0.5, -0.36, 0.38),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.035, 8);
  }, []);

  return (
    <group
      position={[2.36, 0.64, 1.72]}
      rotation-y={-0.22}
      scale={1.15}
      onClick={(event) => {
        event.stopPropagation();
        onPreview();
      }}
      onPointerOut={() => setHovered(false)}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
    >
      <RoundedBox args={[0.58, 0.1, 0.52]} position={[0, -0.1, 0]} radius={0.05} smoothness={6} castShadow>
        <meshStandardMaterial color={hovered ? '#f1a21b' : colors.chair} roughness={0.68} />
      </RoundedBox>
      <RoundedBox args={[0.58, 0.72, 0.11]} position={[0, 0.38, -0.2]} radius={0.18} smoothness={10} castShadow>
        <meshStandardMaterial color="#ee9b1d" roughness={0.68} />
      </RoundedBox>
      <RoundedBox args={[0.36, 0.42, 0.08]} position={[0, 0.42, -0.13]} radius={0.14} smoothness={8} castShadow>
        <meshStandardMaterial color="#d88616" roughness={0.72} />
      </RoundedBox>
      {[-0.34, 0.34].map((x) => (
        <group key={x}>
          <RoundedBox args={[0.1, 0.62, 0.1]} position={[x, 0.18, 0.02]} radius={0.05} smoothness={6} castShadow>
            <meshStandardMaterial color={colors.chair} roughness={0.68} />
          </RoundedBox>
          <mesh geometry={railGeometry} position={[x + 0.5, 0, 0]} castShadow>
            <meshStandardMaterial color="#c86f0c" roughness={0.68} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[0.82, 0.1, 0.1]} position={[0, 0.1, 0.3]} radius={0.05} smoothness={6} castShadow>
        <meshStandardMaterial color={colors.chair} roughness={0.68} />
      </RoundedBox>
    </group>
  );
}

function Hotspot({ label, onSelect, position }: HotspotProps) {
  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[12, 0]}>
      <button
        className="casita-hotspot-label"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        {label}
      </button>
    </Html>
  );
}

export function CasitaModel({ onEnter, onHotspot }: CasitaModelProps) {
  return (
    <group position={[0, -0.34, 0]} rotation-y={-0.1}>
      <RoundedBox args={[6.7, 0.34, 3.75]} position={[0, 0.17, 0]} radius={0.2} smoothness={12} castShadow receiveShadow>
        <meshStandardMaterial color={colors.base} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[1.9, 0.22, 1.15]} position={[0.7, 0.43, 1.1]} radius={0.06} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={colors.cream} roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.16, 0.54]} position={[0.42, 0.52, 1.95]} radius={0.06} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={colors.cream} roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[0.86, 0.12, 0.46]} position={[0.42, 0.65, 2.22]} radius={0.05} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={colors.cream} roughness={0.74} />
      </RoundedBox>

      <RoundedBox args={[5.45, 2.12, 2.75]} position={[-0.22, 1.26, -0.05]} radius={0.08} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={colors.pink} roughness={0.78} />
      </RoundedBox>
      <mesh position={[-2.98, 1.27, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 2.1, 2.72]} />
        <meshStandardMaterial color={colors.pinkDark} roughness={0.78} />
      </mesh>
      <RoundedBox args={[2.55, 1.75, 0.18]} position={[1.62, 1.1, 1.52]} radius={0.06} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={colors.shadowPink} roughness={0.8} />
      </RoundedBox>

      <Roof />
      <Arch x={0.36} width={1.26} />
      <Arch x={1.98} width={1.3} />
      <Door onEnter={onEnter} />
      <Lamp />
      <Window position={[-1.76, 1.3, 1.55]} scale={1.05} />
      <Window position={[-0.58, 1.28, 1.56]} scale={0.78} />
      <Window position={[1.55, 1.3, 1.57]} scale={0.84} />
      <Window position={[-3.04, 1.32, -0.42]} side scale={1.08} />
      <Window position={[2.58, 1.26, -0.42]} side scale={0.9} />
      <RockingChair onPreview={() => onHotspot('chair')} />

      <PlantCluster position={[-2.86, 0.35, 1.36]} scale={0.95} type="cactus" />
      <PlantCluster position={[-1.9, 0.34, 1.42]} scale={0.88} type="shrub" />
      <PlantCluster position={[-1.1, 0.35, 1.5]} scale={0.92} type="agave" />
      <PlantCluster position={[1.22, 0.35, 1.68]} scale={0.5} type="shrub" />
      <PlantCluster position={[3.05, 0.35, 1.12]} scale={0.66} type="cactus" />
      <PlantCluster position={[2.82, 0.35, -1.22]} scale={0.72} type="agave" />

      <Hotspot label="Pasa" onSelect={onEnter} position={[0.4, 1.7, 2.05]} />
      <Hotspot label="Silla" onSelect={() => onHotspot('chair')} position={[2.35, 1.55, 2.05]} />
      <Hotspot label="Mirar" onSelect={() => onHotspot('window')} position={[-1.78, 1.9, 2]} />
    </group>
  );
}
