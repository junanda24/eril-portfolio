import { useEffect, useRef } from "react";
import * as THREE from "three";

const NEON = 0x22d3ee;
const RED = 0xff4d5e;
const VOID = 0x05070d;

/**
 * Drone3D — a small inspection quadcopter: spinning props, blinking LED,
 * hover bob. Click it for a barrel roll.
 */
export default function Drone3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const W = mount.clientWidth || 320;
    const H = mount.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(VOID, 0.06);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 50);
    camera.position.set(2.7, 1.7, 3.6);
    camera.lookAt(0, 0.85, 0);

    scene.add(new THREE.HemisphereLight(0x8ab4ff, VOID, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 5, 2);
    scene.add(key);
    const under = new THREE.PointLight(NEON, 6, 6, 1.6);
    under.position.set(0, 0.2, 0);
    scene.add(under);

    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x141b2c, metalness: 0.8, roughness: 0.4 });
    const neonMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: NEON, emissiveIntensity: 2.2 });
    const ledMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: RED, emissiveIntensity: 3 });
    const propMat = new THREE.MeshBasicMaterial({ color: 0x9fd8e8, transparent: true, opacity: 0.55 });

    const drone = new THREE.Group();
    drone.position.y = 0.95;
    scene.add(drone);
    const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

    // body
    const body = box(0.52, 0.2, 0.52, darkMetal);
    drone.add(body);
    const stripe = box(0.54, 0.045, 0.54, neonMat);
    stripe.position.y = 0.02;
    drone.add(stripe);
    // camera gimbal
    const gim = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 14), darkMetal);
    gim.position.y = -0.16;
    drone.add(gim);
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.045, 20),
      new THREE.MeshBasicMaterial({ color: NEON })
    );
    lens.rotation.x = Math.PI / 2.6;
    lens.position.set(0, -0.2, 0.07);
    drone.add(lens);
    // LED
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), ledMat);
    led.position.set(0, 0.13, 0);
    drone.add(led);

    // arms + motors + props (X config)
    const props = [];
    const armLen = 0.52;
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) + (i * Math.PI) / 2;
      const dx = Math.cos(a), dz = Math.sin(a);
      const arm = box(armLen, 0.055, 0.09, darkMetal);
      arm.position.set(dx * armLen * 0.5, 0.03, dz * armLen * 0.5);
      arm.rotation.y = -a;
      drone.add(arm);
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.09, 14), darkMetal);
      motor.position.set(dx * armLen, 0.06, dz * armLen);
      drone.add(motor);
      const prop = new THREE.Group();
      prop.position.set(dx * armLen, 0.12, dz * armLen);
      const b1 = box(0.46, 0.012, 0.055, propMat);
      const b2 = box(0.055, 0.012, 0.46, propMat);
      prop.add(b1, b2);
      // motion-blur disc
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.23, 24),
        new THREE.MeshBasicMaterial({ color: 0x9fd8e8, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })
      );
      disc.rotation.x = -Math.PI / 2;
      prop.add(disc);
      drone.add(prop);
      props.push({ g: prop, dir: i % 2 === 0 ? 1 : -1 });
    }

    // soft glow disc under drone
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 32),
      new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.07, depthWrite: false })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.02;
    scene.add(glow);
    const grid = new THREE.GridHelper(8, 16, NEON, 0x16222f);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    scene.add(grid);

    // click → barrel roll
    let rollT = -1;
    const dom = renderer.domElement;
    const onClick = () => { if (rollT < 0 && !reduced) rollT = 0; };
    dom.addEventListener("click", onClick);
    dom.style.cursor = "pointer";

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(mount);
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || 320;
      const h = mount.clientHeight || 300;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;
    const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

    const frame = () => {
      if (!alive) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (!visible) {
        raf = requestAnimationFrame(frame);
        return;
      }

      // hover
      drone.position.y = 0.95 + Math.sin(t * 1.7) * 0.11;
      const baseTiltX = Math.sin(t * 0.8) * 0.05;
      const baseTiltZ = Math.cos(t * 0.66) * 0.06;
      drone.rotation.x = baseTiltX;
      // barrel roll
      if (rollT >= 0) {
        rollT += dt / 0.85;
        if (rollT >= 1) {
          rollT = -1;
          drone.rotation.z = baseTiltZ;
        } else {
          drone.rotation.z = baseTiltZ + easeInOut(rollT) * Math.PI * 2;
        }
      } else {
        drone.rotation.z = baseTiltZ;
      }
      drone.rotation.y = Math.sin(t * 0.4) * 0.25;

      props.forEach((p) => { p.g.rotation.y += p.dir * dt * 38; });
      ledMat.emissiveIntensity = 1.2 + Math.max(0, Math.sin(t * 6)) * 3;
      glow.material.opacity = 0.05 + Math.sin(t * 1.7) * 0.02;

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      dom.removeEventListener("click", onClick);
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
    <div className="relative overflow-hidden rounded-3xl border border-line bg-abyss/60">
      <div ref={mountRef} className="relative h-[280px] w-full md:h-[320px]" />
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-muted">
        <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-neon" aria-hidden="true" />
        INSPECTION DRONE
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.24em] text-muted/70">
        CLICK TO FLIP
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.24em] text-muted/70">
        THREE.JS · WEBGL
      </div>
    </div>
  );
}
