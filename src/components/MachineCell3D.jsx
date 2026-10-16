import { useEffect, useRef } from "react";
import * as THREE from "three";

const NEON = 0x22d3ee;
const ELECTRIC = 0x5b8cff;
const AMBER = 0xf5a524;
const VOID = 0x05070d;

/**
 * MachineCell3D — a simple, clean 3D IoT sensor node: a glowing core in a
 * wireframe shell, orbit rings, and satellite nodes. Drag to orbit.
 * Kept deliberately simple: primitives + good lighting = hard to look bad.
 */
export default function MachineCell3D() {
  const mountRef = useRef(null);
  const statusRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const W = mount.clientWidth || 800;
    const H = mount.clientHeight || 450;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(VOID, 0.035);

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 2.4, 6.6);
    camera.lookAt(0, 1.5, 0);

    // ---- lights ----
    scene.add(new THREE.HemisphereLight(0x8ab4ff, VOID, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 7, 3);
    scene.add(key);
    const coreLight = new THREE.PointLight(NEON, 26, 10, 1.7);
    coreLight.position.y = 1.7;
    scene.add(coreLight);
    const rim = new THREE.PointLight(ELECTRIC, 10, 12, 1.6);
    rim.position.set(-3.5, 2.5, -2.5);
    scene.add(rim);

    // ---- ground ----
    const grid = new THREE.GridHelper(18, 36, NEON, 0x16222f);
    grid.material.transparent = true;
    grid.material.opacity = 0.24;
    scene.add(grid);

    const node = new THREE.Group();
    node.position.y = 1.7;
    scene.add(node);

    // glowing core
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x062a33, emissive: NEON, emissiveIntensity: 1.7,
      metalness: 0.3, roughness: 0.3, flatShading: true,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), coreMat);
    node.add(core);

    // wireframe shell, counter-rotating
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.22, 1),
      new THREE.MeshBasicMaterial({ color: NEON, wireframe: true, transparent: true, opacity: 0.26 })
    );
    node.add(shell);

    // orbit rings
    const ringMatA = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: NEON, emissiveIntensity: 1.6 });
    const ringMatB = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: ELECTRIC, emissiveIntensity: 1.6 });
    const ringMatC = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: AMBER, emissiveIntensity: 1.4 });
    const mkRing = (r, tube, mat, rx, rz) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 72), mat);
      m.rotation.x = rx;
      m.rotation.z = rz;
      node.add(m);
      return m;
    };
    const ringA = mkRing(1.85, 0.028, ringMatA, Math.PI / 2.15, 0.15);
    const ringB = mkRing(2.25, 0.02, ringMatB, Math.PI / 1.75, -0.35);
    const ringC = mkRing(1.5, 0.022, ringMatC, Math.PI / 2.6, 0.5);

    // satellite nodes riding ring A
    const sats = [];
    const satGeo = new THREE.OctahedronGeometry(0.1);
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(
        satGeo,
        new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: i % 2 ? ELECTRIC : NEON, emissiveIntensity: 2 })
      );
      s.userData.a = (i / 5) * Math.PI * 2;
      node.add(s);
      sats.push(s);
    }

    // pedestal + light beam from base to core
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.72, 0.22, 28),
      new THREE.MeshStandardMaterial({ color: 0x0d1322, metalness: 0.7, roughness: 0.5 })
    );
    ped.position.y = 0.11;
    scene.add(ped);
    const pedRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.024, 12, 56),
      new THREE.MeshStandardMaterial({ color: 0x0a0f1c, emissive: NEON, emissiveIntensity: 2.2 })
    );
    pedRing.rotation.x = Math.PI / 2;
    pedRing.position.y = 0.23;
    scene.add(pedRing);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.42, 1.45, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: NEON, transparent: true, opacity: 0.13,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
      })
    );
    beam.position.y = 0.95;
    scene.add(beam);

    // data motes
    const P = 110;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(P * 3);
    const pSpd = new Float32Array(P);
    for (let i = 0; i < P; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 11;
      pPos[i * 3 + 1] = Math.random() * 5.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 11;
      pSpd[i] = 0.1 + Math.random() * 0.28;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: NEON, size: 0.04, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    scene.add(points);

    // ---- drag to orbit ----
    let targetYaw = 0;
    let yaw = 0;
    let dragging = false;
    let lastX = 0;
    const dom = renderer.domElement;
    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      try { dom.setPointerCapture(e.pointerId); } catch { /* noop */ }
    };
    const onMove = (e) => {
      if (!dragging) return;
      targetYaw += (e.clientX - lastX) * 0.009;
      lastX = e.clientX;
    };
    const onUp = () => { dragging = false; };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // ---- resize ----
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 450;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let lastStatus = "";

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      yaw += (targetYaw - yaw) * 0.08;
      node.rotation.y = yaw + (dragging ? 0 : t * 0.18);
      node.position.y = 1.7 + Math.sin(t * 1.1) * 0.1;

      core.rotation.y = t * 0.35;
      core.rotation.x = t * 0.12;
      coreMat.emissiveIntensity = 1.7 + Math.sin(t * 2.2) * 0.45;
      coreLight.intensity = 26 + Math.sin(t * 2.2) * 7;

      shell.rotation.y = -t * 0.22;
      shell.rotation.z = t * 0.1;

      ringA.rotation.z = t * 0.3;
      ringB.rotation.z = -t * 0.22;
      ringC.rotation.z = t * 0.4;

      sats.forEach((s) => {
        s.userData.a += dt * 0.55;
        const a = s.userData.a;
        s.position.set(Math.cos(a) * 1.85, Math.sin(a) * 0.28, Math.sin(a) * 1.85);
        s.rotation.y = t * 1.4;
      });

      beam.material.opacity = 0.1 + Math.sin(t * 2.2) * 0.045;
      pedRing.material.emissiveIntensity = 2.2 + Math.sin(t * 2.2) * 0.6;

      const arr = pGeo.attributes.position.array;
      for (let i = 0; i < P; i++) {
        arr[i * 3 + 1] += pSpd[i] * dt;
        if (arr[i * 3 + 1] > 5.5) arr[i * 3 + 1] = 0;
      }
      pGeo.attributes.position.needsUpdate = true;

      const st = t % 8 < 5.5 ? "TRANSMITTING" : "SYNC OK";
      if (st !== lastStatus) {
        lastStatus = st;
        if (statusRef.current) statusRef.current.textContent = st;
        if (dotRef.current) dotRef.current.style.background = st === "TRANSMITTING" ? "#22d3ee" : "#34d399";
      }

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    if (reduced) frame();
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
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
    <div className="relative overflow-hidden rounded-3xl border border-line bg-abyss/60">
      <div ref={mountRef} className="relative h-[380px] w-full cursor-grab active:cursor-grabbing md:h-[480px]" />
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-muted md:left-6 md:top-6">
        <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-neon" aria-hidden="true" />
        NODE-07 // ONLINE
      </div>
      <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-full border border-line bg-void/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.24em] text-ink backdrop-blur md:right-6 md:top-6">
        <span ref={dotRef} className="h-1.5 w-1.5 rounded-full" style={{ background: "#22d3ee" }} aria-hidden="true" />
        <span ref={statusRef}>TRANSMITTING</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.24em] text-muted/70 md:bottom-6 md:left-6">
        DRAG TO ORBIT
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.24em] text-muted/70 md:bottom-6 md:right-6">
        THREE.JS · WEBGL
      </div>
    </div>
  );
}
