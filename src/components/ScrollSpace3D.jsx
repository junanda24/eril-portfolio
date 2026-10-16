import { useEffect, useRef } from "react";
import * as THREE from "three";

const NEON = 0x22d3ee;
const ELECTRIC = 0x5b8cff;
const AMBER = 0xf5a524;
const VOID = 0x05070d;

/**
 * ScrollSpace3D — a fixed, full-page 3D backdrop: starfield points plus
 * floating wireframe geometries. The camera dives as you scroll, so the
 * whole site feels like flying through deep space. Subtle by design —
 * content stays readable.
 */
export default function ScrollSpace3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(VOID, 0.028);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0x8ab4ff, VOID, 0.5));

    // starfield
    const S = 850;
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(S * 3);
    for (let i = 0; i < S; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 70;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 90;
      sPos[i * 3 + 2] = -Math.random() * 45 - 2;
    }
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const stars = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({
        color: 0x9fd8e8, size: 0.09, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    scene.add(stars);

    // floating wireframe shapes scattered through scroll depth
    const geos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1.1, 0),
      new THREE.TetrahedronGeometry(1.2, 0),
      new THREE.TorusGeometry(0.9, 0.28, 10, 28),
      new THREE.BoxGeometry(1.3, 1.3, 1.3),
      new THREE.TorusKnotGeometry(0.7, 0.2, 48, 8),
    ];
    const cols = [NEON, ELECTRIC, AMBER];
    const shapes = [];
    for (let i = 0; i < 16; i++) {
      const c = cols[i % cols.length];
      const m = new THREE.Mesh(
        geos[i % geos.length],
        new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.13 + Math.random() * 0.12 })
      );
      m.position.set(
        (Math.random() - 0.5) * 30,
        14 - i * 4.4 - Math.random() * 2,
        -6 - Math.random() * 16
      );
      const s = 0.5 + Math.random() * 1.1;
      m.scale.setScalar(s);
      m.userData = {
        rx: (Math.random() - 0.5) * 0.4,
        ry: (Math.random() - 0.5) * 0.5,
        ph: Math.random() * Math.PI * 2,
        baseY: m.position.y,
      };
      scene.add(m);
      shapes.push(m);
    }

    // scroll → camera dive
    let targetY = 0;
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetY = (window.scrollY / max) * 62;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let hidden = document.hidden;
    const onVis = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;

    const frame = () => {
      if (!alive) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (!hidden) {
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.rotation.z = Math.sin(t * 0.05) * 0.01;
        stars.rotation.y = t * 0.008;
        shapes.forEach((m) => {
          m.rotation.x += m.userData.rx * dt;
          m.rotation.y += m.userData.ry * dt;
          m.position.y = m.userData.baseY + Math.sin(t * 0.4 + m.userData.ph) * 0.5;
        });
        renderer.render(scene, camera);
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      const dom = renderer.domElement;
      if (dom.parentNode === mount) mount.removeChild(dom);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}
