import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { CasitaModel } from './CasitaModel';

type FacadeSceneProps = {
  controlsFrozen?: boolean;
  experienceActive?: boolean;
  singerPerforming?: boolean;
};

function ResponsiveCamera({ experienceActive }: { experienceActive: boolean }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const isPortrait = size.width / size.height < 0.78;
    camera.fov = isPortrait ? (experienceActive ? 72 : 66) : (experienceActive ? 50 : 44);
    camera.position.set(
      isPortrait ? 3.8 : 4.2,
      isPortrait ? (experienceActive ? 5.2 : 4.6) : (experienceActive ? 4.4 : 3.8),
      isPortrait ? (experienceActive ? 17.4 : 15.2) : (experienceActive ? 13.8 : 11.8),
    );
    camera.lookAt(0, experienceActive ? 1.35 : 0.9, 0);
    camera.updateProjectionMatrix();
  }, [camera, experienceActive, size.height, size.width]);

  return null;
}

export function FacadeScene({
  controlsFrozen = false,
  experienceActive = false,
  singerPerforming = false,
}: FacadeSceneProps) {
  return (
    <section className="facade-screen" aria-label="La Casita exterior">
      <Canvas
        className="facade-canvas"
        camera={{ fov: 44, position: [4.2, 3.8, 11.8] }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={['#090806']} />
        <fog attach="fog" args={['#090806', 10, 28]} />
        <ResponsiveCamera experienceActive={experienceActive} />
        <hemisphereLight args={['#ffe6b0', '#050403', 1.35]} />
        <directionalLight
          castShadow
          color="#fff1c7"
          intensity={4.8}
          position={[-5.2, 7.2, 6.8]}
          shadow-camera-bottom={-5}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <CasitaModel interactionsDisabled={controlsFrozen} singerPerforming={singerPerforming} />
        <ContactShadows
          blur={2.6}
          color="#120c05"
          far={10}
          opacity={0.42}
          position={[0, -0.36, 0]}
          resolution={1024}
          scale={18}
        />
        <OrbitControls
          enableDamping
          enabled={!controlsFrozen}
          enablePan
          enableRotate
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          maxDistance={28}
          maxPolarAngle={Math.PI * 0.82}
          minDistance={6}
          minPolarAngle={Math.PI * 0.05}
          target={[0, experienceActive ? 1.35 : 0.9, 0]}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </section>
  );
}
