import { useEffect, useRef } from "react";
import * as THREE from "three";

const NEON = 0x22d3ee;
const AMBER = 0xf5a524;
const VOID = 0x05070d;

/**
 * HeroScene3D — an interactive "digital sea": two layered point-waves plus
 * drifting motes, with mouse parallax on the camera. Replaces the YouTube
 * background video (unreliable embeds) with something guaranteed to render.
 */
export default function HeroScene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = Math.min(window.innerWidth, 900) < 640;

    const W = mount.clientWidth || 800;
    const H = mount.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setSize(W, H);
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(VOID, 0.03);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.set(0, 3.4, 9.5);
    camera.lookAt(0, 0.4, 0);

    const mkWave = (w, h, cols, rows, color, size, opacity, yOff) => {
      const geo = new THREE.PlaneGeometry(w, h, cols, rows);
      geo.rotateX(-Math.PI / 2);
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color, size, transparent: true, opacity,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      pts.position.y = yOff;
      pts.userData.base = geo.attributes.position.array.slice();
      scene.add(pts);
      return pts;
    };

    const wave1 = mkWave(30, 18, small ? 64 : 110, small ? 38 : 64, NEON, 0.06, 0.5, -0.9);
    const wave2 = mkWave(30, 18, small ? 40 : 70, small ? 24 : 40, AMBER, 0.05, 0.28, -0.55);

    // floating motes
    const P = small ? 90 : 170;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(P * 3);
    const pSpd = new Float32Array(P);
    for (let i = 0; i < P; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = Math.random() * 7 - 1;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      pSpd[i] = 0.1 + Math.random() * 0.3;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const motes = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: NEON, size: 0.05, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    scene.add(motes);

    // mouse parallax (window-level; canvas itself is pointer-events-none)
    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(mount);

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 600;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;

    const displace = (pts, t, f1, f2, f3, a1, a2, a3, sp1, sp2, sp3) => {
      const arr = pts.geometry.attributes.position.array;
      const base = pts.userData.base;
      for (let i = 0; i < arr.length; i += 3) {
        const x = base[i], z = base[i + 2];
        arr[i + 1] =
          Math.sin(x * f1 + t * sp1) * a1 +
          Math.cos(z * f2 + t * sp2) * a2 +
          Math.sin((x + z) * f3 + t * sp3) * a3;
      }
      pts.geometry.attributes.position.needsUpdate = true;
    };

    const frame = () => {
      if (!alive) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (!visible) {
        // Off-screen: keep the loop alive but do no work.
        raf = requestAnimationFrame(frame);
        return;
      }

      displace(wave1, t, 0.32, 0.45, 0.2, 0.5, 0.38, 0.3, 0.9, 0.7, 0.5);
      displace(wave2, t + 40, 0.4, 0.55, 0.26, 0.42, 0.3, 0.26, -0.7, 0.9, -0.6);

      const marr = pGeo.attributes.position.array;
      for (let i = 0; i < P; i++) {
        marr[i * 3 + 1] += pSpd[i] * dt;
        marr[i * 3] += Math.sin(t * 0.6 + i) * dt * 0.12;
        if (marr[i * 3 + 1] > 6.5) marr[i * 3 + 1] = -1;
      }
      pGeo.attributes.position.needsUpdate = true;

      tx += (mx - tx) * 0.045;
      ty += (my - ty) * 0.045;
      camera.position.x = tx * 1.4;
      camera.position.y = 3.4 - ty * 0.9;
      camera.lookAt(0, 0.4, 0);

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
      // reduced-motion: single static frame, then stop
    };
    frame();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
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

  return <div ref={mountRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}
