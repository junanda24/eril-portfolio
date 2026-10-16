import { useEffect, useRef } from "react";
import * as THREE from "three";

const NEON = 0x22d3ee;
const ELECTRIC = 0x5b8cff;
const AMBER = 0xf5a524;
const VOID = 0x05070d;

/**
 * Globe3D — a dotted "network globe": fibonacci-sphere points, faint
 * wireframe shell, a few glowing hub nodes. Drag to spin.
 */
export default function Globe3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const W = mount.clientWidth || 340;
    const H = mount.clientHeight || 340;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(VOID, 0.05);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 50);
    camera.position.set(0, 0.4, 6.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0x8ab4ff, VOID, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(4, 3, 4);
    scene.add(key);

    const globe = new THREE.Group();
    scene.add(globe);

    // fibonacci dot sphere
    const N = 700;
    const R = 2;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const cA = new THREE.Color(NEON);
    const cB = new THREE.Color(ELECTRIC);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      const x = Math.cos(th) * rad;
      const z = Math.sin(th) * rad;
      pos[i * 3] = x * R;
      pos[i * 3 + 1] = y * R;
      pos[i * 3 + 2] = z * R;
      // latitude-based color blend: cyan equator → blue poles
      const c = cA.clone().lerp(cB, Math.abs(y) * 0.85);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dotGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const dots = new THREE.Points(
      dotGeo,
      new THREE.PointsMaterial({
        size: 0.045, vertexColors: true, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    globe.add(dots);

    // faint structural shell
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.995, 24, 18),
      new THREE.MeshBasicMaterial({ color: NEON, wireframe: true, transparent: true, opacity: 0.05 })
    );
    globe.add(shell);

    // glowing hub nodes on the surface
    const hubs = [];
    const hubGeo = new THREE.SphereGeometry(0.05, 12, 10);
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(
        hubGeo,
        new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: AMBER, emissiveIntensity: 2.4 })
      );
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      m.position.set(
        R * Math.sin(ph) * Math.cos(th),
        R * Math.cos(ph),
        R * Math.sin(ph) * Math.sin(th)
      );
      m.userData.ph = Math.random() * Math.PI * 2;
      globe.add(m);
      hubs.push(m);
    }

    // equator ring
    const eqRing = new THREE.Mesh(
      new THREE.TorusGeometry(R * 1.18, 0.014, 10, 80),
      new THREE.MeshBasicMaterial({ color: ELECTRIC, transparent: true, opacity: 0.4 })
    );
    eqRing.rotation.x = Math.PI / 2.3;
    globe.add(eqRing);

    // drag to spin
    let targetRY = 0, ry = 0, targetRX = 0.18, rx = 0.18;
    let dragging = false, lx = 0, ly = 0;
    const dom = renderer.domElement;
    const onDown = (e) => {
      dragging = true; lx = e.clientX; ly = e.clientY;
      try { dom.setPointerCapture(e.pointerId); } catch { /* noop */ }
    };
    const onMove = (e) => {
      if (!dragging) return;
      targetRY += (e.clientX - lx) * 0.008;
      targetRX = Math.max(-0.9, Math.min(0.9, targetRX + (e.clientY - ly) * 0.005));
      lx = e.clientX; ly = e.clientY;
    };
    const onUp = () => { dragging = false; };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(mount);
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || 340;
      const h = mount.clientHeight || 340;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;

    const frame = () => {
      if (!alive) return;
      clock.getDelta();
      const t = clock.elapsedTime;
      if (!visible) {
        raf = requestAnimationFrame(frame);
        return;
      }
      ry += (targetRY - ry) * 0.07;
      rx += (targetRX - rx) * 0.07;
      globe.rotation.y = ry + (dragging ? 0 : t * 0.1);
      globe.rotation.x = rx;
      eqRing.rotation.z = t * 0.25;
      hubs.forEach((h) => {
        const s = 1 + Math.sin(t * 3 + h.userData.ph) * 0.35;
        h.scale.setScalar(s);
      });
      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      if (dom.parentNode === mount) mount.removeChild(dom);
    };
  }, []);

  return (
    <div className="pointer-events-auto relative">
      <div ref={mountRef} className="relative h-[300px] w-[300px] cursor-grab active:cursor-grabbing md:h-[360px] md:w-[360px]" />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.24em] text-muted/70">
        DRAG TO SPIN
      </div>
    </div>
  );
}
