/* fahadhasn.com — ambient particle field (Three.js, module) */
import * as THREE from 'three';

const canvas = document.getElementById('dust');
if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
    camera.position.z = 26;

    // Soft round sprite
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const cx = c.getContext('2d');
    const g = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(c);

    const palettes = {
      gold:  ['#e0a82e', '#f5d255', '#fff3c4', '#8a6a1d'],
      green: ['#00c853', '#5ee6a8', '#aef7d4', '#0e6e3c']
    };
    const tints = (palettes[canvas.dataset.tint] || palettes.gold).map(h => new THREE.Color(h));

    const isMobile = matchMedia('(max-width: 720px)').matches;

    function makeField(count, size, opacity, spread) {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * spread[0];
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
        const tint = tints[(Math.random() * tints.length) | 0];
        col[i * 3] = tint.r; col[i * 3 + 1] = tint.g; col[i * 3 + 2] = tint.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size, map: sprite, transparent: true, opacity,
        vertexColors: true, depthWrite: false,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
      });
      return new THREE.Points(geo, mat);
    }

    const group = new THREE.Group();
    group.add(makeField(isMobile ? 450 : 1100, 0.22, 0.55, [70, 44, 36]));
    group.add(makeField(isMobile ? 60 : 130, 0.55, 0.8, [60, 36, 24]));
    scene.add(group);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    addEventListener('pointermove', e => {
      mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      group.rotation.y = t * 0.02 + mouse.x * 0.12;
      group.rotation.x = Math.sin(t * 0.05) * 0.04 + mouse.y * 0.08;
      camera.position.y = -(window.scrollY || 0) * 0.0035;
      renderer.render(scene, camera);
      canvas.classList.add('on');
    });
  } catch (e) { /* WebGL unavailable — CSS glow carries the backdrop */ }
}
