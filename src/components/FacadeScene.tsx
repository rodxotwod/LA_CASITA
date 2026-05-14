import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { CasitaModel } from './CasitaModel';

type FacadeSceneProps = {
  onEnter: () => void;
  onHotspot: (id: string) => void;
  notice: string | null;
};

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const isPortrait = size.width / size.height < 0.78;
    camera.fov = isPortrait ? 64 : 38;
    camera.position.set(isPortrait ? 6.2 : 4.9, isPortrait ? 3.2 : 2.75, isPortrait ? 12.2 : 5.8);
    camera.lookAt(0, 0.92, 0.25);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

export function FacadeScene({ onEnter, onHotspot, notice }: FacadeSceneProps) {
  return (
    <section className="facade-screen facade-screen-3d" aria-label="La Casita exterior">
      <Canvas
        className="facade-canvas"
        camera={{ fov: 38, position: [4.9, 2.75, 5.8] }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={['#8a63c7']} />
        <fog attach="fog" args={['#8a63c7', 10, 22]} />
        <ResponsiveCamera />
        <hemisphereLight args={['#fff0d0', '#5c3c86', 2.1]} />
        <directionalLight
          castShadow
          color="#fff1c7"
          intensity={4.2}
          position={[-4.2, 6.4, 5.8]}
          shadow-camera-bottom={-5}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <CasitaModel onEnter={onEnter} onHotspot={onHotspot} />
        <ContactShadows
          blur={2.6}
          color="#43265b"
          far={5}
          opacity={0.35}
          position={[0, -0.36, 0]}
          resolution={1024}
          scale={8}
        />
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={14}
          maxPolarAngle={Math.PI * 0.48}
          minDistance={4.7}
          minPolarAngle={Math.PI * 0.18}
          target={[0, 0.92, 0.25]}
        />
      </Canvas>

      <div className="facade-fallback-actions" aria-label="La Casita actions">
        <button type="button" onClick={onEnter} aria-label="Enter La Casita">
          Pasa
        </button>
        <button type="button" onClick={() => onHotspot('chair')} aria-label="Preview the porch chair">
          Silla
        </button>
        <button type="button" onClick={() => onHotspot('window')} aria-label="Peek through the window">
          Mirar
        </button>
      </div>

      {notice ? <div className="facade-notice">{notice}</div> : null}
    </section>
  );
}
