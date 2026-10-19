import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function cv(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------- графика деки рисуется кодом, 256x1024 ---------- */
function deckTexture(o){
  const W = 256, H = 1024, c = cv(W, H), g = c.getContext('2d');
  g.fillStyle = o.deck; g.fillRect(0, 0, W, H);
  const ink = o.ink;

  if (o.graphic === 'stripe'){
    g.save(); g.translate(W/2, H/2); g.rotate(-0.38); g.fillStyle = ink;
    for (let i = -8; i < 8; i++) g.fillRect(-460, i*104, 920, 34);
    g.restore();
    g.fillStyle = o.deck; g.fillRect(0, H*0.40, W, H*0.20);
    g.save(); g.translate(W/2, H/2); g.rotate(-Math.PI/2);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 92px Impact, "Arial Black", sans-serif';
    g.fillText('BANAN', 0, 0);
    g.restore();
  }

  if (o.graphic === 'banana'){
    g.strokeStyle = ink; g.lineWidth = 52; g.lineCap = 'round';
    g.beginPath(); g.moveTo(74, 232);
    g.bezierCurveTo(34, 520, 118, 716, 196, 806); g.stroke();
    g.lineWidth = 14;
    g.beginPath(); g.moveTo(74, 232); g.lineTo(58, 176); g.stroke();
    g.save(); g.translate(W/2, H*0.12); g.rotate(-Math.PI/2);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 54px Impact, "Arial Black", sans-serif';
    g.fillText('BOARD SHOP', 0, 0); g.restore();
  }

  if (o.graphic === 'mono'){
    g.strokeStyle = ink; g.lineWidth = 2.2;
    for (let i = 0; i < 24; i++){
      g.globalAlpha = 0.28 + 0.5 * Math.abs(Math.sin(i * 0.7));
      g.beginPath();
      for (let x = -10; x <= W + 10; x += 6){
        const y = i*46 + Math.sin(x*0.028 + i*0.9)*13 + Math.sin(x*0.011)*6;
        if (x === -10) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    g.globalAlpha = 1;
    g.strokeStyle = ink; g.lineWidth = 3;
    g.beginPath(); g.arc(W/2, H*0.5, 56, 0, Math.PI*2); g.stroke();
    g.beginPath(); g.arc(W/2, H*0.5, 10, 0, Math.PI*2); g.fillStyle = ink; g.fill();
  }

  if (o.graphic === 'gold'){
    g.strokeStyle = ink; g.lineWidth = 1.7; g.globalAlpha = 0.85;
    for (let i = -14; i < 26; i++){
      g.beginPath(); g.moveTo(-40, i*80); g.lineTo(W+40, i*80 - 420); g.stroke();
      g.beginPath(); g.moveTo(-40, i*80); g.lineTo(W+40, i*80 + 420); g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = o.deck; g.beginPath(); g.ellipse(W/2, H/2, 96, 210, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = ink; g.lineWidth = 2;
    g.beginPath(); g.ellipse(W/2, H/2, 96, 210, 0, 0, Math.PI*2); g.stroke();
    g.save(); g.translate(W/2, H/2); g.rotate(-Math.PI/2);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'italic 700 150px Georgia, "Times New Roman", serif';
    g.fillText('B', 0, 6); g.restore();
  }

  if (o.graphic === 'ice'){
    g.fillStyle = ink; g.globalAlpha = 0.14;
    g.fillRect(0, H*0.30, W, H*0.40);
    g.globalAlpha = 0.5; g.strokeStyle = ink; g.lineWidth = 1.4;
    for (let i = 0; i < 44; i++){
      const y = i*24 + 8;
      g.beginPath(); g.moveTo(18, y); g.lineTo(18 + (i%5===0 ? 60 : 22), y); g.stroke();
    }
    g.globalAlpha = 1;
    g.save(); g.translate(W/2, H*0.5); g.rotate(-Math.PI/2);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 42px "Courier New", monospace';
    g.fillText('[ 01 / ЧЕЛЯБИНСК ]', 0, -58);
    g.font = '900 104px Impact, "Arial Black", sans-serif';
    g.fillText('BANAN', 0, 24);
    g.restore();
    g.fillStyle = ink;
    for (let i = 0; i < 26; i++){
      g.fillRect(40 + i*7, H*0.88, (i % 3 === 0) ? 5 : 2, 44);
    }
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- форма доски: боковой вырез, закруглённые нос и хвост ---------- */
function boardShape(L, waist, tip){
  const N = 150, right = [], left = [];
  for (let i = 0; i <= N; i++){
    const y = -L + 2*L*(i/N);
    const a = Math.abs(y)/L;
    let hw = waist + (tip - waist) * Math.pow(a, 1.9);
    const edge = 0.86;
    if (a > edge){
      const k = (a - edge) / (1 - edge);
      hw *= Math.sqrt(Math.max(0, 1 - k*k));
    }
    right.push(new THREE.Vector2(hw, y));
    left.push(new THREE.Vector2(-hw, y));
  }
  const s = new THREE.Shape();
  s.moveTo(right[0].x, right[0].y);
  for (let i = 1; i < right.length; i++) s.lineTo(right[i].x, right[i].y);
  for (let i = left.length - 1; i >= 0; i--) s.lineTo(left[i].x, left[i].y);
  s.closePath();
  return s;
}

function bindingMesh(color, accent){
  const gp = new THREE.Group();
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, metalness: 0.25, clearcoat: 0.6 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.30, 0.035), m);
  gp.add(base);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.045, 0.20), m);
  hb.position.set(0, -0.14, 0.10); gp.add(hb);
  const strapM = new THREE.MeshPhysicalMaterial({ color: accent, roughness: 0.6, metalness: 0.1 });
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.215, 0.055, 0.03), strapM);
  s1.position.set(0, 0.07, 0.055); gp.add(s1);
  const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.215, 0.042, 0.03), strapM);
  s2.position.set(0, -0.04, 0.055); gp.add(s2);
  return gp;
}

export function createBoardScene(canvas, opts = {}){
  const o = Object.assign({
    deck: '#101522', ink: '#eaff3d', graphic: 'stripe',
    side: '#0a0a0c', env: ['#2b313d', '#05060a'],
    key: '#ffffff', keyI: 2.6, rim: '#8ab4ff', rimI: 2.0, fill: '#ffffff', fillI: 0.45,
    glow: null, glowSize: 3.6, exposure: 1.05,
    autoSpin: 0.0022, yaw: -0.55, pitch: 0.10, fit: 3.75, fov: 26,
    bindings: false, bindColor: '#1a1d24', bindAccent: '#3a3f4b', float: true, roll: 0
  }, opts);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(DPR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov, 1, 0.1, 100);
  /* камера отходит ровно настолько, чтобы доска влезла в кадр целиком */
  const fitDist = () => (o.fit / 2) / Math.tan((o.fov * Math.PI / 180) / 2);
  camera.position.set(0, 0, fitDist());

  const ec = cv(8, 64), eg = ec.getContext('2d');
  const grd = eg.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, o.env[0]); grd.addColorStop(1, o.env[1]);
  eg.fillStyle = grd; eg.fillRect(0, 0, 8, 64);
  const etex = new THREE.CanvasTexture(ec);
  etex.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromEquirectangular(etex).texture;
  pm.dispose(); etex.dispose();

  const kl = new THREE.DirectionalLight(o.key, o.keyI); kl.position.set(2.6, 3.4, 4.2); scene.add(kl);
  const rl = new THREE.DirectionalLight(o.rim, o.rimI); rl.position.set(-3.2, -1.4, 2.2); scene.add(rl);
  const fl = new THREE.DirectionalLight(o.fill, o.fillI); fl.position.set(0, -2.4, -3.4); scene.add(fl);

  /* frame задаёт наклон в кадре, root крутится вокруг длинной оси доски */
  const tilt = new THREE.Group(); tilt.rotation.z = o.roll; scene.add(tilt);
  const root = new THREE.Group(); tilt.add(root);
  const board = new THREE.Group(); root.add(board);

  const L = 1.52, THICK = 0.034;
  const geo = new THREE.ExtrudeGeometry(boardShape(L, 0.132, 0.158), {
    depth: THICK, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006,
    bevelSegments: 2, curveSegments: 2
  });
  geo.translate(0, 0, -THICK/2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox, sw = bb.max.x - bb.min.x, sh = bb.max.y - bb.min.y;
  const uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++){
    uv.setXY(i, (pos.getX(i) - bb.min.x)/sw, (pos.getY(i) - bb.min.y)/sh);
  }
  for (let i = 0; i < pos.count; i++){
    const y = pos.getY(i), z = pos.getZ(i);
    pos.setZ(i, z + 0.26 * Math.pow(Math.abs(y)/L, 5.5) - 0.02 * Math.pow(1 - Math.abs(y)/L, 2));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const topMat = new THREE.MeshPhysicalMaterial({
    map: deckTexture(o), roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.07
  });
  const sideMat = new THREE.MeshPhysicalMaterial({ color: o.side, roughness: 0.45, metalness: 0.35 });
  board.add(new THREE.Mesh(geo, [topMat, sideMat]));

  if (o.bindings){
    [0.40, -0.40].forEach(y => {
      const b = bindingMesh(o.bindColor, o.bindAccent);
      b.position.set(0, y, THICK/2 + 0.02); b.rotation.z = -0.28; board.add(b);
    });
  }

  if (o.glow){
    const gc = cv(256, 256), gg = gc.getContext('2d');
    const rg = gg.createRadialGradient(128, 128, 0, 128, 128, 128);
    rg.addColorStop(0, 'rgba(255,255,255,0.9)');
    rg.addColorStop(0.45, 'rgba(255,255,255,0.25)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    gg.fillStyle = rg; gg.fillRect(0, 0, 256, 256);
    const glowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(o.glowSize, o.glowSize),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(gc), transparent: true,
        blending: THREE.AdditiveBlending, color: new THREE.Color(o.glow), depthWrite: false
      })
    );
    glowMesh.position.z = -1.3; scene.add(glowMesh);
  }

  /* ---------- вращение пальцем и мышью ---------- */
  let yaw = o.yaw, pitch = o.pitch, vYaw = 0, vPitch = 0;
  let dragging = false, lx = 0, idle = 0;
  canvas.style.touchAction = 'pan-y';

  function down(e){
    dragging = true; idle = 0;
    const p = e.touches ? e.touches[0] : e;
    lx = p.clientX; ly = p.clientY;
  }
  let ly = 0;
  function move(e){
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    vYaw = (p.clientX - lx) * 0.006;
    vPitch = (p.clientY - ly) * 0.004;
    yaw += vYaw;
    pitch = Math.max(-0.75, Math.min(0.75, pitch + vPitch));
    lx = p.clientX; ly = p.clientY;
  }
  function up(){ dragging = false; }
  canvas.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  canvas.addEventListener('touchstart', down, { passive: true });
  window.addEventListener('touchmove', move, { passive: true });
  window.addEventListener('touchend', up);

  function resize(){
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(canvas);

  let t = 0;
  function frame(){
    requestAnimationFrame(frame);
    if (!visible) return;
    t += 0.016;
    if (!dragging){
      vYaw *= 0.93; vPitch *= 0.9;
      yaw += vYaw;
      pitch = Math.max(-0.75, Math.min(0.75, pitch + vPitch));
      idle += 0.016;
      if (!REDUCED && idle > 0.6) yaw += o.autoSpin;
    }
    root.rotation.y = yaw;
    root.rotation.x = pitch;
    if (!REDUCED && o.float) root.position.y = Math.sin(t * 0.8) * 0.035;
    renderer.render(scene, camera);
  }
  frame();

  return {
    setDeck(next){
      Object.assign(o, next);
      topMat.map.dispose();
      topMat.map = deckTexture(o);
      topMat.needsUpdate = true;
      if (next.side) sideMat.color.set(next.side);
    },
    setLengthScale(k){ board.scale.y = k; },
    setYaw(v){ yaw = v; }
  };
}
