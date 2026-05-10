import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type FacadeSceneProps = {
  onEnter: () => void;
  onHotspot: (id: string) => void;
  notice: string | null;
};

const pink = '#f1848c';
const pinkSide = '#d9697c';
const yellow = '#ffc724';
const cream = '#f0d8b8';
const grass = '#6fa51c';
const brown = '#5b2411';
const windowFrame = '#6c6262';
const louver = '#9b8580';

function mat(color: string, roughness = 0.76) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addBox(
  group: THREE.Group | THREE.Scene,
  size: [number, number, number],
  position: [number, number, number],
  color: string,
  roughness = 0.76,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color, roughness));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addRoundedTopArch(group: THREE.Group, x: number, z: number, width: number, height: number) {
  const radius = width / 2;
  const topY = -0.42 + height - radius;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= 28; i += 1) {
    const angle = Math.PI - (Math.PI * i) / 28;
    points.push(new THREE.Vector3(x + Math.cos(angle) * radius, topY + Math.sin(angle) * radius, z));
  }

  const arch = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 34, 0.075, 14, false),
    mat(pink, 0.68),
  );
  arch.castShadow = true;
  group.add(arch);

  addBox(group, [0.16, height - radius, 0.16], [x - radius, -0.42 + (height - radius) / 2, z], pink, 0.68);
  addBox(group, [0.16, height - radius, 0.16], [x + radius, -0.42 + (height - radius) / 2, z], pink, 0.68);
}

function addWindow(group: THREE.Group, x: number, y: number, z: number, width: number, height: number, side = false) {
  const holder = new THREE.Group();
  addBox(holder, [width + 0.12, height + 0.12, 0.08], [0, 0, 0], windowFrame, 0.82);
  addBox(holder, [width, height, 0.09], [0, 0, 0.04], '#443734', 0.86);
  addBox(holder, [0.04, height, 0.1], [0, 0, 0.1], '#302927', 0.82);

  for (let i = 0; i < 5; i += 1) {
    addBox(holder, [width * 0.86, 0.04, 0.11], [0, -height * 0.34 + i * (height / 5.8), 0.12], louver, 0.7);
  }

  holder.position.set(x, y, z);
  if (side) holder.rotation.y = Math.PI / 2;
  group.add(holder);
}

function addDoor(group: THREE.Group) {
  addBox(group, [0.52, 1.36, 0.1], [0.54, -0.56, 1.2], brown, 0.72);
  addBox(group, [0.42, 0.03, 0.11], [0.54, -0.28, 1.26], '#7b3618', 0.72);
  addBox(group, [0.42, 0.03, 0.11], [0.54, -0.72, 1.26], '#7b3618', 0.72);
  addBox(group, [0.03, 1.14, 0.11], [0.3, -0.56, 1.26], '#6b2b14', 0.72);
  addBox(group, [0.04, 0.04, 0.04], [0.74, -0.58, 1.29], yellow, 0.54);
}

function addRoof(group: THREE.Group) {
  addBox(group, [5.9, 0.24, 3.18], [-0.1, 0.78, 0], yellow, 0.58);

  const roofGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -3.12, 0.9, 1.72,
    2.95, 0.9, 1.72,
    2.58, 0.9, -1.58,
    -2.74, 0.9, -1.72,
    -2.56, 1.48, 0,
    2.5, 1.38, 0,
  ]);
  const indices = [
    0, 1, 5, 0, 5, 4,
    1, 2, 5,
    2, 3, 4, 2, 4, 5,
    3, 0, 4,
    0, 3, 2, 0, 2, 1,
  ];
  roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  roofGeometry.setIndex(indices);
  roofGeometry.computeVertexNormals();
  const roof = new THREE.Mesh(roofGeometry, mat(yellow, 0.58));
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  addBox(group, [6.22, 0.14, 0.22], [-0.1, 0.79, 1.84], '#e2a712', 0.62);
  addBox(group, [0.22, 0.14, 3.42], [-3.23, 0.78, 0.02], '#e2a712', 0.62);
}

function addRockingChair(group: THREE.Group) {
  const chair = new THREE.Group();
  addBox(chair, [0.56, 0.09, 0.48], [0, -0.08, 0], '#d87d10', 0.7);
  addBox(chair, [0.56, 0.72, 0.1], [0, 0.38, -0.18], '#f0a01b', 0.68);
  addBox(chair, [0.1, 0.62, 0.1], [-0.28, 0.18, 0.02], '#d87d10', 0.68);
  addBox(chair, [0.1, 0.62, 0.1], [0.28, 0.18, 0.02], '#d87d10', 0.68);
  addBox(chair, [0.72, 0.1, 0.1], [0, 0.1, 0.28], '#d87d10', 0.68);
  addBox(chair, [0.12, 0.1, 0.76], [-0.44, -0.08, 0.02], '#d87d10', 0.68);
  addBox(chair, [0.12, 0.1, 0.76], [0.44, -0.08, 0.02], '#d87d10', 0.68);

  const rockerMat = mat('#c66e0d', 0.68);
  for (const x of [-0.34, 0.34]) {
    const points = [
      new THREE.Vector3(x, -0.43, -0.42),
      new THREE.Vector3(x, -0.5, -0.1),
      new THREE.Vector3(x, -0.48, 0.36),
    ];
    const rocker = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.035, 8), rockerMat);
    rocker.castShadow = true;
    chair.add(rocker);
  }

  chair.position.set(2.18, -0.62, 1.52);
  chair.rotation.y = -0.28;
  chair.scale.setScalar(1.28);
  group.add(chair);
}

function addLamp(group: THREE.Group) {
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), mat('#ffd45a', 0.4));
  lamp.position.set(0.04, 0.03, 1.27);
  lamp.castShadow = true;
  group.add(lamp);
}

function addPlantCluster(group: THREE.Group, x: number, z: number, scale: number, type: 'cactus' | 'shrub' | 'agave') {
  const greens = type === 'agave' ? ['#2d6d4e', '#356d55', '#1d513d'] : ['#2f862e', '#4f9f25', '#1d6b2c'];

  if (type === 'shrub') {
    for (let i = 0; i < 8; i += 1) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 12, 10), mat(greens[i % greens.length], 0.82));
      sphere.position.set(x + Math.sin(i) * 0.24 * scale, -1.08 + (i % 3) * 0.15 * scale, z + Math.cos(i * 1.7) * 0.14 * scale);
      sphere.scale.y = 0.82;
      sphere.castShadow = true;
      group.add(sphere);
    }
    return;
  }

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.15, 0.28, 0.14, 0.6, 0, 0.92);
  leafShape.bezierCurveTo(-0.14, 0.6, -0.15, 0.28, 0, 0);
  const leafGeometry = new THREE.ShapeGeometry(leafShape);

  for (let i = 0; i < 8; i += 1) {
    const leaf = new THREE.Mesh(leafGeometry, mat(greens[i % greens.length], 0.84));
    leaf.position.set(x + Math.sin(i) * 0.2 * scale, -1.16 + (i % 3) * 0.05 * scale, z + Math.cos(i) * 0.14 * scale);
    leaf.scale.setScalar(scale * (type === 'cactus' ? 0.6 : 0.72));
    leaf.rotation.set(0.55, i * 0.75, -0.65 + i * 0.16);
    leaf.castShadow = true;
    group.add(leaf);
  }
}

function buildCasita(scene: THREE.Scene) {
  const group = new THREE.Group();
  scene.add(group);

  addBox(group, [6.2, 0.36, 3.45], [-0.08, -1.38, 0], grass, 0.82);
  addBox(group, [2.0, 0.24, 1.04], [-0.26, -1.14, 0.92], cream, 0.7);
  addBox(group, [0.64, 0.18, 0.58], [0.36, -1.0, 1.8], cream, 0.7);
  addBox(group, [0.72, 0.13, 0.44], [0.36, -0.9, 2.08], cream, 0.7);

  addBox(group, [5.2, 2.15, 2.72], [-0.18, -0.15, -0.06], pink, 0.78);
  addBox(group, [0.1, 2.16, 2.72], [-2.84, -0.15, -0.06], pinkSide, 0.78);
  addBox(group, [2.42, 1.78, 0.16], [1.72, -0.25, 1.22], pink, 0.78);

  addRoof(group);
  addRoundedTopArch(group, 0.38, 1.34, 1.24, 1.66);
  addRoundedTopArch(group, 1.96, 1.34, 1.24, 1.66);
  addWindow(group, -1.72, -0.28, 1.34, 1.0, 0.7);
  addWindow(group, 1.6, -0.28, 1.34, 0.78, 0.62);
  addWindow(group, -2.9, -0.2, -0.36, 1.1, 0.72, true);
  addWindow(group, -0.56, -0.26, 1.34, 0.36, 0.72);
  addDoor(group);
  addLamp(group);
  addRockingChair(group);

  addPlantCluster(group, -2.78, 1.34, 0.86, 'cactus');
  addPlantCluster(group, -1.85, 1.38, 0.78, 'shrub');
  addPlantCluster(group, -1.08, 1.45, 0.86, 'agave');
  addPlantCluster(group, 1.2, 1.58, 0.48, 'shrub');
  addPlantCluster(group, 2.94, 1.14, 0.62, 'cactus');

  return group;
}

export function FacadeScene({ onEnter, onHotspot, notice }: FacadeSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#8c66c7');

    const camera = new THREE.OrthographicCamera(-4.25, 4.25, 3.15, -3.15, 0.1, 50);
    camera.position.set(0, 1.55, 8.3);
    camera.lookAt(0, -0.24, 0.34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#ffecca', '#5a3b83', 2.8));
    const key = new THREE.DirectionalLight('#fff2c7', 4.4);
    key.position.set(-3.8, 6.2, 5.2);
    key.castShadow = true;
    scene.add(key);
    const porchLight = new THREE.PointLight('#ffb23d', 9, 3.2);
    porchLight.position.set(0.04, 0.05, 1.6);
    scene.add(porchLight);

    const casita = buildCasita(scene);
    casita.position.y = 0.18;
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(3.3, 48),
      new THREE.MeshBasicMaterial({ color: '#6b4ca4', transparent: true, opacity: 0.26 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0.05, -1.6, 0.12);
    shadow.scale.set(1.25, 0.56, 1);
    scene.add(shadow);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const aspect = width / height;
      if (aspect < 0.78) {
        const frustumWidth = 6.7;
        camera.left = -frustumWidth / 2;
        camera.right = frustumWidth / 2;
        camera.top = frustumWidth / aspect / 2;
        camera.bottom = -frustumWidth / aspect / 2;
      } else {
        const frustumHeight = 4.2;
        camera.top = frustumHeight / 2;
        camera.bottom = -frustumHeight / 2;
        camera.left = (frustumHeight * aspect) / -2;
        camera.right = (frustumHeight * aspect) / 2;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      casita.rotation.y = Math.sin(elapsed * 0.35) * 0.018;
      porchLight.intensity = 8.2 + Math.sin(elapsed * 1.6) * 1.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frame);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="facade-screen" aria-label="La Casita exterior">
      <div ref={mountRef} className="three-stage" />
      <button className="hotspot hotspot-door" type="button" onClick={onEnter} aria-label="Enter La Casita">
        <span>Pasa</span>
      </button>
      <button className="hotspot hotspot-chair" type="button" onClick={() => onHotspot('chair')} aria-label="Preview the porch chair">
        <span>Silla</span>
      </button>
      <button className="hotspot hotspot-window" type="button" onClick={() => onHotspot('window')} aria-label="Peek through the window">
        <span>Mirar</span>
      </button>
      {notice ? <div className="facade-notice">{notice}</div> : null}
    </section>
  );
}
