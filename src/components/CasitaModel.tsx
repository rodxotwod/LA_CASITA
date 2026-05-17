import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

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
};

const crowdColors = ['#24212b', '#ffcf7a', '#f26f6f', '#3f7bd5', '#62a25d', '#f2eee2', '#8d5bd1'];
const singerRoofBounds = {
  maxX: 3.02,
  maxZ: 1.66,
  minX: -3.02,
  minZ: -1.66,
  y: 2.64,
};

type PersonInstance = {
  bodyColor: string;
  bodyMatrix: THREE.Matrix4;
  headMatrix: THREE.Matrix4;
};

function InstancedPeople({ people }: { people: PersonInstance[] }) {
  const bodyGroups = useMemo(
    () => crowdColors.map((color) => ({
      color,
      matrices: people.filter((person) => person.bodyColor === color).map((person) => person.bodyMatrix),
    })),
    [people],
  );
  const headMatrices = useMemo(() => people.map((person) => person.headMatrix), [people]);

  return (
    <group>
      {bodyGroups.map((group) => (
        <InstanceBatch key={group.color} color={group.color} geometry="body" matrices={group.matrices} />
      ))}
      <InstanceBatch color="#d39a68" geometry="head" matrices={headMatrices} />
    </group>
  );
}

function InstanceBatch({
  color,
  geometry,
  matrices,
}: {
  color: string;
  geometry: 'body' | 'head';
  matrices: THREE.Matrix4[];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    matrices.forEach((matrix, index) => meshRef.current?.setMatrixAt(index, matrix));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  if (matrices.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]} castShadow>
      {geometry === 'body' ? <capsuleGeometry args={[0.035, 0.22, 4, 6]} /> : <sphereGeometry args={[0.048, 8, 6]} />}
      <meshStandardMaterial color={color} roughness={0.78} />
    </instancedMesh>
  );
}

function Roof() {
  return (
    <group>
      <RoundedBox args={[6.95, 0.26, 4.05]} position={[0, 2.43, 0.05]} radius={0.04} smoothness={4}>
        <meshBasicMaterial color={colors.yellow} toneMapped={false} />
      </RoundedBox>
      <mesh position={[0, 2.25, 2.11]} castShadow>
        <boxGeometry args={[6.86, 0.08, 0.09]} />
        <meshStandardMaterial color="#5a3320" roughness={0.78} />
      </mesh>
    </group>
  );
}

function SingingPulse({ performing }: { performing: boolean }) {
  const firstRingRef = useRef<THREE.Mesh>(null);
  const secondRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const rings = [firstRingRef.current, secondRingRef.current];

    rings.forEach((ring, index) => {
      if (!ring) return;

      const phase = (state.clock.elapsedTime * 2.4 + index * 0.55) % 1;
      const scale = performing ? 0.55 + phase * 1.25 : 0.18;
      ring.visible = performing;
      ring.scale.setScalar(scale);
      ring.position.z = 0.28 + phase * 0.08;

      const material = ring.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = performing ? 0.7 * (1 - phase) : 0;
      }
    });
  });

  return (
    <group position={[0.3, 1.04, 0.2]} rotation-y={-0.18}>
      <pointLight color="#ffc51e" distance={1.5} intensity={performing ? 1.4 : 0} />
      {[firstRingRef, secondRingRef].map((ringRef, index) => (
        <mesh key={index} ref={ringRef} rotation-x={Math.PI / 2} visible={false}>
          <torusGeometry args={[0.12, 0.01, 8, 28]} />
          <meshBasicMaterial color="#ffc51e" transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Singer({
  active,
  disabled,
  onSelect,
  performing,
}: {
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
  performing: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const micHandRef = useRef<THREE.Mesh>(null);
  const micRef = useRef<THREE.Mesh>(null);
  const keysRef = useRef(new Set<string>());
  const positionRef = useRef(new THREE.Vector3(0, singerRoofBounds.y, 0.24));
  const directionRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!disabled && active && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        keysRef.current.add(event.code);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active, disabled]);

  useFrame((state, delta) => {
    if (!active || disabled) {
      keysRef.current.clear();
    }

    const movement = new THREE.Vector3();
    const keys = keysRef.current;

    if (keys.has('ArrowUp') || keys.has('KeyW')) movement.z -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) movement.z += 1;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) movement.x -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) movement.x += 1;

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(delta * 1.45);
      positionRef.current.add(movement);
      positionRef.current.x = THREE.MathUtils.clamp(positionRef.current.x, singerRoofBounds.minX, singerRoofBounds.maxX);
      positionRef.current.z = THREE.MathUtils.clamp(positionRef.current.z, singerRoofBounds.minZ, singerRoofBounds.maxZ);
      directionRef.current = Math.atan2(movement.x, movement.z);
    }

    if (!groupRef.current) return;
    const performanceBeat = performing ? Math.sin(state.clock.elapsedTime * 7.2) : 0;
    groupRef.current.position.copy(positionRef.current);
    groupRef.current.position.y += performanceBeat * 0.035;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, directionRef.current, 0.18);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, performing ? performanceBeat * 0.045 : 0, 0.2);

    if (micHandRef.current) {
      micHandRef.current.rotation.z = -0.7 + (performing ? performanceBeat * 0.16 : 0);
      micHandRef.current.position.y = 1.04 + (performing ? performanceBeat * 0.035 : 0);
    }

    if (micRef.current) {
      micRef.current.rotation.z = performing ? performanceBeat * 0.08 : 0;
      micRef.current.position.y = 1.14 + (performing ? performanceBeat * 0.035 : 0);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, singerRoofBounds.y, 0.24]}
      scale={0.98}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        onSelect();
      }}
    >
      <RoundedBox args={[0.48, 0.58, 0.32]} position={[0, 0.7, 0]} radius={0.035} smoothness={3} castShadow>
        <meshStandardMaterial color="#f4f0e8" roughness={0.72} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.34, 0.36]} position={[0, 1.22, 0.02]} radius={0.055} smoothness={4} castShadow>
        <meshStandardMaterial color="#b8784d" roughness={0.66} />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.14, 0.38]} position={[0, 1.44, -0.01]} radius={0.07} smoothness={5} castShadow>
        <meshStandardMaterial color="#11100f" roughness={0.86} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.15, 0.16]} position={[0, 1.35, 0.02]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color="#11100f" roughness={0.86} />
      </RoundedBox>
      <mesh position={[-0.09, 1.24, 0.21]} castShadow>
        <boxGeometry args={[0.055, 0.105, 0.018]} />
        <meshStandardMaterial color="#0f0c0b" roughness={0.6} />
      </mesh>
      <mesh position={[0.09, 1.24, 0.21]} castShadow>
        <boxGeometry args={[0.055, 0.105, 0.018]} />
        <meshStandardMaterial color="#0f0c0b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.12, 0.22]} castShadow>
        <torusGeometry args={[0.115, 0.012, 8, 28, Math.PI]} />
        <meshStandardMaterial color="#14100f" roughness={0.62} />
      </mesh>
      {[-0.17, -0.12, -0.07, -0.02, 0.03, 0.08, 0.13, 0.18].map((x, index) => (
        <mesh key={x} position={[x, 1.11 + (index % 3) * 0.035, 0.22]} castShadow>
          <boxGeometry args={[0.028, 0.028, 0.018]} />
          <meshStandardMaterial color="#14100f" roughness={0.68} />
        </mesh>
      ))}
      <SingingPulse performing={performing} />
      <mesh ref={micRef} position={[0.24, 1.14, 0.1]} castShadow>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
        <meshStandardMaterial color="#11100f" roughness={0.7} />
      </mesh>
      <mesh ref={micHandRef} position={[0.3, 1.04, 0.16]} rotation-z={-0.7} castShadow>
        <boxGeometry args={[0.16, 0.028, 0.028]} />
        <meshStandardMaterial color="#11100f" roughness={0.7} />
      </mesh>
      <mesh position={[-0.31, 0.75, 0]} rotation-z={-0.08} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.72} />
      </mesh>
      <mesh position={[0.31, 0.75, 0]} rotation-z={0.08} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.72} />
      </mesh>
      <RoundedBox args={[0.22, 0.12, 0.18]} position={[-0.31, 0.44, 0.02]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color="#b8784d" roughness={0.66} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.12, 0.18]} position={[0.31, 0.44, 0.02]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color="#b8784d" roughness={0.66} />
      </RoundedBox>
      <mesh position={[-0.12, 0.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.42, 0.2]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.74} />
      </mesh>
      <mesh position={[0.12, 0.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.42, 0.2]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.74} />
      </mesh>
      <mesh position={[-0.12, -0.06, 0.04]} castShadow>
        <boxGeometry args={[0.2, 0.08, 0.26]} />
        <meshStandardMaterial color="#171717" roughness={0.86} />
      </mesh>
      <mesh position={[0.12, -0.06, 0.04]} castShadow>
        <boxGeometry args={[0.2, 0.08, 0.26]} />
        <meshStandardMaterial color="#171717" roughness={0.86} />
      </mesh>
    </group>
  );
}

function StadiumCrowd() {
  const { farCrowdGeometry, people, lightGeometry, upperLightGeometry } = useMemo(() => {
    const people: PersonInstance[] = [];
    const farCrowdPositions: number[] = [];
    const farCrowdVertexColors: number[] = [];
    const lightPositions: number[] = [];
    const upperLightPositions: number[] = [];
    const bodyScale = new THREE.Vector3();
    const headScale = new THREE.Vector3();
    const bodyPosition = new THREE.Vector3();
    const headPosition = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const color = new THREE.Color();

    for (let row = 0; row < 54; row += 1) {
      const radiusX = 7.7 + row * 0.19;
      const radiusZ = 5.2 + row * 0.13;
      const y = 0.22 + row * 0.022;
      const count = 72 + Math.floor(row * 2.7);

      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.sin(row * 1.71 + i * 0.37) * 0.012;
        const x = Math.cos(angle) * radiusX + Math.sin(i * 8.31) * 0.06;
        const z = Math.sin(angle) * radiusZ + Math.cos(i * 5.47) * 0.06;
        const isFieldGap = Math.abs(x) < 4.9 && Math.abs(z) < 3.15;

        if (isFieldGap) continue;

        if (row < 36 && i % 2 === 0) {
          const personScale = 0.74 + ((i + row) % 6) * 0.035;
          const rotationY = Math.atan2(-x, -z) + Math.sin(i * 2.13) * 0.32;
          const bodyMatrix = new THREE.Matrix4();
          const headMatrix = new THREE.Matrix4();

          rotation.setFromEuler(new THREE.Euler(0, rotationY, 0));
          bodyScale.set(personScale, personScale, personScale);
          headScale.set(personScale, personScale, personScale);
          bodyPosition.set(x, y + 0.12 * personScale, z);
          headPosition.set(x, y + 0.34 * personScale, z);
          bodyMatrix.compose(bodyPosition, rotation, bodyScale);
          headMatrix.compose(headPosition, rotation, headScale);

          people.push({
            bodyColor: crowdColors[(row + i) % crowdColors.length],
            bodyMatrix,
            headMatrix,
          });
        } else {
          farCrowdPositions.push(x, y, z);
          color.set(crowdColors[(row + i) % crowdColors.length]);
          color.multiplyScalar(0.36 + ((i + row) % 5) * 0.06);
          farCrowdVertexColors.push(color.r, color.g, color.b);
        }

        if ((i + row * 3) % 17 === 0) {
          lightPositions.push(x, y + 0.18, z);
        }
      }
    }

    for (let i = 0; i < 820; i += 1) {
      const side = i % 5;
      const t = (i % 164) / 163;
      const wave = Math.sin(i * 12.989) * 0.5 + 0.5;
      const y = 0.95 + wave * 3.8;

      if (side < 3) {
        upperLightPositions.push(-12 + t * 24, y, -7.2 - wave * 3.6);
      } else if (side === 3) {
        upperLightPositions.push(-10.8 - wave * 1.5, y * 0.82, -5.8 + t * 11.6);
      } else {
        upperLightPositions.push(10.8 + wave * 1.5, y * 0.82, -5.8 + t * 11.6);
      }
    }

    const farCrowdGeometry = new THREE.BufferGeometry();
    farCrowdGeometry.setAttribute('position', new THREE.Float32BufferAttribute(farCrowdPositions, 3));
    farCrowdGeometry.setAttribute('color', new THREE.Float32BufferAttribute(farCrowdVertexColors, 3));

    const lightGeometry = new THREE.BufferGeometry();
    lightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lightPositions, 3));

    const upperLightGeometry = new THREE.BufferGeometry();
    upperLightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(upperLightPositions, 3));

    return { farCrowdGeometry, people, lightGeometry, upperLightGeometry };
  }, []);

  return (
    <group>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[28, 0.08, 18]} />
        <meshStandardMaterial color="#172414" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[10.4, 0.04, 6.7]} />
        <meshStandardMaterial color="#244d22" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[5.55, 10.9, 128, 8]} />
        <meshStandardMaterial color="#121111" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <InstancedPeople people={people} />
      <points geometry={farCrowdGeometry}>
        <pointsMaterial size={0.06} sizeAttenuation vertexColors transparent opacity={0.72} />
      </points>
      <points geometry={lightGeometry}>
        <pointsMaterial color="#fff7d6" size={0.052} sizeAttenuation transparent opacity={0.95} />
      </points>
      <points geometry={upperLightGeometry}>
        <pointsMaterial color="#fff4cf" size={0.044} sizeAttenuation transparent opacity={0.82} />
      </points>
      <mesh position={[0, 1.45, -7.4]} rotation-x={-0.18}>
        <boxGeometry args={[24, 2.4, 0.18]} />
        <meshStandardMaterial color="#0d0c0c" roughness={0.96} transparent opacity={0.68} />
      </mesh>
      <mesh position={[-10.4, 1.16, 0]} rotation-z={-0.12}>
        <boxGeometry args={[0.18, 2.1, 13.4]} />
        <meshStandardMaterial color="#0d0c0c" roughness={0.96} transparent opacity={0.6} />
      </mesh>
      <mesh position={[10.4, 1.16, 0]} rotation-z={0.12}>
        <boxGeometry args={[0.18, 2.1, 13.4]} />
        <meshStandardMaterial color="#0d0c0c" roughness={0.96} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function FrontArch({ x, width }: { x: number; width: number }) {
  const points = useMemo(() => {
    const radius = width / 2;
    const topY = 1.36;
    const curvePoints: THREE.Vector3[] = [];

    for (let i = 0; i <= 28; i += 1) {
      const angle = Math.PI - (Math.PI * i) / 28;
      curvePoints.push(new THREE.Vector3(x + Math.cos(angle) * radius, topY + Math.sin(angle) * radius, 1.82));
    }

    return curvePoints;
  }, [width, x]);

  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 34, 0.075, 14, false]} />
        <meshStandardMaterial color="#f2a28c" roughness={0.74} />
      </mesh>
      <RoundedBox args={[0.17, 1.38, 0.18]} position={[x - width / 2, 0.78, 1.82]} radius={0.075} smoothness={8} castShadow>
        <meshStandardMaterial color="#f2a28c" roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[0.17, 1.38, 0.18]} position={[x + width / 2, 0.78, 1.82]} radius={0.075} smoothness={8} castShadow>
        <meshStandardMaterial color="#f2a28c" roughness={0.74} />
      </RoundedBox>
    </group>
  );
}

function FrontWindow({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[1.08, 0.62, 0.09]} radius={0.02} smoothness={3} castShadow>
        <meshBasicMaterial color={colors.yellow} toneMapped={false} />
      </RoundedBox>
      <mesh position={[0, 0, 0.065]} castShadow>
        <boxGeometry args={[0.92, 0.46, 0.045]} />
        <meshStandardMaterial color="#323432" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0, 0.098]} castShadow>
        <boxGeometry args={[0.035, 0.47, 0.045]} />
        <meshStandardMaterial color="#c8bd93" roughness={0.78} />
      </mesh>
      {[-0.17, -0.08, 0.01, 0.1, 0.19].map((y) => (
        <mesh key={y} position={[0, y, 0.11]} castShadow>
          <boxGeometry args={[0.82, 0.032, 0.055]} />
          <meshStandardMaterial color="#c9c19e" roughness={0.76} />
        </mesh>
      ))}
    </group>
  );
}

function FrontDoor() {
  return (
    <group position={[-0.35, 0.83, 1.86]}>
      <RoundedBox args={[0.42, 1.24, 0.11]} radius={0.02} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#20140f" roughness={0.76} />
      </RoundedBox>
      <mesh position={[0.24, 0, 0.03]} rotation-y={-0.24} castShadow>
        <boxGeometry args={[0.18, 1.18, 0.07]} />
        <meshStandardMaterial color="#6b2d17" roughness={0.74} />
      </mesh>
      <mesh position={[0.28, -0.02, 0.08]} castShadow>
        <sphereGeometry args={[0.03, 12, 8]} />
        <meshBasicMaterial color={colors.yellow} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FrontStageGear() {
  return (
    <group position={[2.25, 0.72, 1.9]}>
      <RoundedBox args={[1.12, 0.1, 0.34]} position={[0, 0.12, 0]} radius={0.02} smoothness={3} castShadow>
        <meshStandardMaterial color="#443022" roughness={0.82} />
      </RoundedBox>
      {[-0.48, -0.16, 0.16, 0.48].map((x) => (
        <mesh key={x} position={[x, -0.08, 0]} castShadow>
          <boxGeometry args={[0.035, 0.36, 0.035]} />
          <meshStandardMaterial color="#251812" roughness={0.86} />
        </mesh>
      ))}
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.22, 0.02]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.16]} />
          <meshStandardMaterial color="#1d1d1d" roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function PorchDetails() {
  return (
    <group>
      {[-2.8, -0.95, 0.95, 2.72].map((x) => (
        <mesh key={x} position={[x, 0.48, 2.14]} castShadow>
          <boxGeometry args={[0.48, 0.12, 0.16]} />
          <meshStandardMaterial color="#1b1712" roughness={0.86} />
        </mesh>
      ))}
      <group position={[2.46, 1.22, 1.86]}>
        <mesh castShadow>
          <boxGeometry args={[0.98, 0.72, 0.055]} />
          <meshStandardMaterial color="#132746" roughness={0.9} />
        </mesh>
        {[-0.32, 0, 0.32].map((x) => (
          <mesh key={x} position={[x, 0, 0.04]}>
            <boxGeometry args={[0.045, 0.66, 0.025]} />
            <meshStandardMaterial color="#315985" roughness={0.84} />
          </mesh>
        ))}
        {[-0.24, -0.08, 0.08, 0.24].map((y) => (
          <mesh key={y} position={[0, y, 0.05]}>
            <boxGeometry args={[0.88, 0.035, 0.025]} />
            <meshStandardMaterial color="#315985" roughness={0.84} />
          </mesh>
        ))}
      </group>
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

function RockingChair() {
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
    >
      <RoundedBox args={[0.58, 0.1, 0.52]} position={[0, -0.1, 0]} radius={0.05} smoothness={6} castShadow>
        <meshStandardMaterial color={colors.chair} roughness={0.68} />
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

export function CasitaModel({
  interactionsDisabled = false,
  singerPerforming = false,
}: {
  interactionsDisabled?: boolean;
  singerPerforming?: boolean;
}) {
  const sceneRef = useRef<THREE.Group>(null);
  const sceneRotationRef = useRef(-0.1);
  const scenePitchRef = useRef(0);
  const rotateKeysRef = useRef(new Set<string>());
  const [singerControlActive, setSingerControlActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        setSingerControlActive(false);
        rotateKeysRef.current.clear();
        return;
      }

      if (!interactionsDisabled && !singerControlActive && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
        rotateKeysRef.current.add(event.code);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => rotateKeysRef.current.delete(event.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [interactionsDisabled, singerControlActive]);

  useFrame((_, delta) => {
    if (!sceneRef.current) return;

    if (interactionsDisabled) {
      rotateKeysRef.current.clear();
      return;
    }

    const rotationSpeed = 1.45;
    if (rotateKeysRef.current.has('ArrowLeft')) sceneRotationRef.current += delta * rotationSpeed;
    if (rotateKeysRef.current.has('ArrowRight')) sceneRotationRef.current -= delta * rotationSpeed;
    if (rotateKeysRef.current.has('ArrowUp')) scenePitchRef.current += delta * rotationSpeed * 0.52;
    if (rotateKeysRef.current.has('ArrowDown')) scenePitchRef.current -= delta * rotationSpeed * 0.52;

    scenePitchRef.current = THREE.MathUtils.clamp(scenePitchRef.current, -0.38, 0.34);

    sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, sceneRotationRef.current, 0.16);
    sceneRef.current.rotation.x = THREE.MathUtils.lerp(sceneRef.current.rotation.x, scenePitchRef.current, 0.16);
  });

  return (
    <group
      ref={sceneRef}
      position={[0, -0.34, 0]}
      rotation-y={-0.1}
      onClick={() => {
        if (!interactionsDisabled) setSingerControlActive(true);
      }}
    >
      <StadiumCrowd />
      <RoundedBox args={[7.15, 0.34, 3.95]} position={[0, 0.17, 0]} radius={0.12} smoothness={8} castShadow receiveShadow>
        <meshStandardMaterial color={colors.base} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[6.25, 0.18, 0.78]} position={[0, 0.43, 1.74]} radius={0.045} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={colors.cream} roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[6.4, 0.08, 0.5]} position={[0, 0.54, 2.06]} radius={0.035} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#eec9a9" roughness={0.76} />
      </RoundedBox>

      <RoundedBox args={[6.05, 2.02, 2.7]} position={[0, 1.25, -0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={colors.pink} roughness={0.78} />
      </RoundedBox>
      <RoundedBox args={[5.86, 1.55, 0.16]} position={[-0.02, 1.12, 1.57]} radius={0.025} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#ee9b84" roughness={0.8} />
      </RoundedBox>

      <Roof />
      <Singer
        active={singerControlActive}
        disabled={interactionsDisabled}
        onSelect={() => setSingerControlActive(true)}
        performing={singerPerforming}
      />
      <FrontArch x={-2.35} width={1.22} />
      <FrontArch x={-0.05} width={1.78} />
      <FrontArch x={2.25} width={1.3} />
      <FrontWindow position={[-2.18, 1.25, 1.88]} scale={1.1} />
      <FrontWindow position={[0.78, 1.25, 1.88]} scale={0.92} />
      <FrontDoor />
      <Lamp />
      <FrontStageGear />
      <PorchDetails />
      <Window position={[-3.04, 1.32, -0.42]} side scale={1.08} />
      <Window position={[2.58, 1.26, -0.42]} side scale={0.9} />
      <RockingChair />

      <PlantCluster position={[-3.1, 0.35, 1.55]} scale={0.82} type="shrub" />
      <PlantCluster position={[-1.2, 0.35, 1.74]} scale={0.58} type="agave" />
      <PlantCluster position={[1.28, 0.35, 1.72]} scale={0.46} type="shrub" />
      <PlantCluster position={[3.04, 0.35, 1.52]} scale={0.76} type="agave" />
      <PlantCluster position={[2.82, 0.35, -1.22]} scale={0.72} type="agave" />

    </group>
  );
}
