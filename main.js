import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ---------- Contenu pédagogique ---------- */
const PARTS = [
  { id: 'rj45', name: 'Port RJ45', layer: 'COUCHE 1 · PHYSIQUE',
    def: 'Connecteur cuivre à 8 broches qui reçoit un câble Ethernet (Cat 5e, 6 ou 6A).',
    role: 'Il fournit le lien physique : des paires torsadées transportent les signaux électriques. Des transformateurs d’isolation protègent la carte et la machine.',
    keep: 'Selon la carte et la catégorie du câble : 1, 2,5, 5 ou 10 Gbit/s.',
    look: [-3.2, 0.6, -0.8], dist: 6.5, dir: [-0.8, 0.45, 0.75], explode: [-1.8, 0.9, 0] },
  { id: 'sfp', name: 'Cage SFP+', layer: 'COUCHE 1 · PHYSIQUE',
    def: 'Emplacement qui accueille un module optique (fibre) ou un câble DAC en cuivre.',
    role: 'Le module convertit les signaux électriques en lumière et inversement. Il est interchangeable : le même port accepte plusieurs types de fibre.',
    keep: 'SFP+ : 10 Gbit/s, SFP28 : 25 Gbit/s, QSFP28 : 100 Gbit/s.',
    look: [-3.2, 0.5, 1.0], dist: 6.5, dir: [-0.8, 0.45, 0.75], explode: [-1.8, 0.9, 0.2] },
  { id: 'controleur', name: 'Contrôleur MAC + PHY', layer: 'COUCHES 1 ET 2',
    def: 'Le circuit intégré au cœur de la carte : son « cerveau ».',
    role: 'La partie MAC construit les trames, gère les adresses et calcule le CRC (couche 2). La partie PHY encode les bits en signaux (couche 1). Il pilote aussi le DMA.',
    keep: 'Les fonctions avancées (offload, RSS, SR-IOV) sont implémentées dans cette puce.',
    look: [0.4, 0.2, 0], dist: 5.8, dir: [0.3, 0.9, 0.55], explode: [0, 0.9, 0] },
  { id: 'dissipateur', name: 'Dissipateur thermique', layer: 'THERMIQUE',
    def: 'Radiateur à ailettes posé sur le contrôleur.',
    role: 'À 10 Gbit/s et plus, la puce chauffe. Le dissipateur évacue la chaleur pour éviter un bridage thermique du débit.',
    keep: 'Les cartes de serveur sont refroidies par le flux d’air du châssis.',
    look: [0.4, 0.7, 0], dist: 5, dir: [0.5, 0.6, 0.8], explode: [0, 2.2, 0] },
  { id: 'pcie', name: 'Connecteur PCI Express', layer: 'BUS · VERS L’HÔTE',
    def: 'Bande de contacts dorés qui s’insère dans la carte mère.',
    role: 'Il relie la carte au processeur et à la mémoire. Grâce au DMA, la carte écrit et lit les trames directement en RAM.',
    keep: 'Plus de lignes (x1, x4, x8) et une version PCIe plus récente donnent plus de bande passante.',
    look: [1.1, 0, 2.3], dist: 5.8, dir: [0.3, 0.5, 1], explode: [0, -0.3, 1] },
  { id: 'firmware', name: 'Mémoire flash (firmware)', layer: 'MICROLOGICIEL',
    def: 'Petite mémoire non volatile soudée sur la carte.',
    role: 'Elle stocke le micrologiciel, la configuration et l’adresse MAC d’usine (BIA, burned-in address).',
    keep: 'Mettre à jour le firmware peut corriger des bugs et améliorer la compatibilité.',
    look: [2.6, 0.15, -1.3], dist: 4.6, dir: [0.3, 0.9, 0.5], explode: [0, 1.1, -0.6] },
  { id: 'alim', name: 'Régulateurs et condensateurs', layer: 'ALIMENTATION',
    def: 'Le circuit d’alimentation de la carte.',
    role: 'Ils convertissent et stabilisent les tensions du bus PCIe (3,3 V et 12 V) vers les tensions dont la puce a besoin.',
    keep: 'Un filtrage propre est indispensable pour des signaux haute vitesse fiables.',
    look: [2.9, 0.3, 0.5], dist: 5, dir: [0.4, 0.8, 0.7], explode: [0.9, 1.2, 0.5] },
  { id: 'pistes', name: 'Pistes différentielles', layer: 'COUCHE 1 · SIGNAL',
    def: 'Lignes de cuivre gravées sur le circuit imprimé.',
    role: 'Les signaux haute vitesse circulent par paires différentielles, de longueur et d’impédance contrôlées, entre le PHY, le MAC et le bus PCIe.',
    keep: 'Une piste mal conçue ajoute du bruit et limite le débit.',
    look: [-1.6, 0.1, -0.3], dist: 5.2, dir: [0.2, 1, 0.4], explode: [0, 0.35, 0] },
  { id: 'leds', name: 'Voyants LED', layer: 'DIAGNOSTIC',
    def: 'Indicateurs d’état visibles sur l’équerre de la carte.',
    role: 'Une LED indique la présence du lien (link), l’autre l’activité du trafic. Sa couleur peut indiquer la vitesse négociée.',
    keep: 'Premier réflexe de diagnostic : lien éteint = vérifier câble, port et négociation.',
    look: [-4.2, 1.25, -0.8], dist: 4.2, dir: [-1, 0.4, 0.6], explode: [-1.2, 0.6, 0] }
];


const EXTRA={
 rj45:{ana:'La porte d’entrée en cuivre : chaque paire torsadée est une voie de circulation.',ex:'Le câble Ethernet entre votre PC et la box se branche ici. Cat 5e pour 1 Gbit/s, Cat 6A pour 10 Gbit/s.'},
 sfp:{ana:'Une prise universelle : on change l’adaptateur, pas la prise.',ex:'Un serveur de datacenter relié par fibre à un commutateur avec un module SFP+ de 10 Gbit/s.'},
 controleur:{ana:'Le chef d’orchestre et le traducteur : il emballe les données et les met dans la bonne « langue » du câble.',ex:'Quand vous envoyez un message, c’est lui qui forme la trame, ajoute les adresses MAC et calcule le CRC.'},
 dissipateur:{ana:'Le ventilateur d’un sportif : sans refroidissement, la performance baisse.',ex:'Une carte 100 Gbit/s sans flux d’air peut ralentir par protection thermique.'},
 pcie:{ana:'L’autoroute entre la carte et le cerveau de l’ordinateur.',ex:'Une carte 10 GbE en PCIe x4 ; plus de lignes = plus de bande passante disponible.'},
 firmware:{ana:'Le carnet de notes de la carte : son programme et sa carte d’identité.',ex:'La commande ip link montre l’adresse MAC gravée ici à la fabrication.'},
 alim:{ana:'Le transformateur d’un chargeur : il adapte la tension reçue à ce dont la puce a besoin.',ex:'Le slot PCIe fournit 3,3 V et 12 V ; la carte les convertit en tensions de 1 V ou moins pour la puce.'},
 pistes:{ana:'Des rails de train parallèles, de longueur identique pour que les signaux arrivent ensemble.',ex:'Les paires différentielles réduisent le bruit : indispensable à 10 Gbit/s et plus.'},
 leds:{ana:'Le tableau de bord : il montre en un coup d’œil si le lien fonctionne.',ex:'LED éteinte après branchement : vérifiez le câble, le port, puis le pilote.'}
};
PARTS.forEach(p=>Object.assign(p,EXTRA[p.id]));

/* ---------- Scène ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);
scene.fog = new THREE.Fog(0x0b1220, 16, 36);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const HOME = { pos: new THREE.Vector3(7.2, 6.4, 9.6), look: new THREE.Vector3(0, 0, 0) };
camera.position.copy(HOME.pos);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.56;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;
controls.target.copy(HOME.look);

const key = new THREE.DirectionalLight(0xffffff, 1.5);
key.position.set(3, 7, 5);
scene.add(key);
const cyan = new THREE.PointLight(0x38bdf8, 140, 0, 2);
cyan.position.set(-6, 3, 3);
scene.add(cyan);
const violet = new THREE.PointLight(0xa78bfa, 110, 0, 2);
violet.position.set(6, 2.5, -4);
scene.add(violet);

const grid = new THREE.GridHelper(40, 80, 0x1d4ed8, 0x14233f);
grid.position.y = -1.3;
grid.material.transparent = true;
grid.material.opacity = 0.55;
scene.add(grid);

/* ---------- Matériaux et aides ---------- */
const std = (o) => new THREE.MeshStandardMaterial(o);
const metal = () => std({ color: 0xc3ccdc, metalness: 1, roughness: 0.28 });
const gold = () => std({ color: 0xe0a82e, metalness: 1, roughness: 0.22 });
const dark = () => std({ color: 0x131a2b, metalness: 0.4, roughness: 0.4 });
const blueMetal = () => std({ color: 0x1f78b4, metalness: 0.9, roughness: 0.32 });
const glow = (hex, i = 1) => std({ color: 0x0a0f1c, emissive: hex, emissiveIntensity: i, roughness: 0.4 });

function box(w, h, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
function cyl(r, h, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

/* Carte (circuit imprimé) et équerre : éléments statiques */
const statics = new THREE.Group();
scene.add(statics);
box(8, 0.15, 4, new THREE.MeshPhysicalMaterial({ color: 0x0a6b63, roughness: 0.5, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.35 }), 0, 0, 0, statics);
box(0.08, 2.2, 4.3, std({ color: 0xd3dbe8, metalness: 1, roughness: 0.35 }), -4.04, 0.2, 0, statics);
for (let i = 0; i < 46; i++) {
  const x = -2 + Math.random() * 5.6;
  const z = -1.8 + Math.random() * 3.4;
  if (x > -0.8 && x < 1.6 && z > -1.2 && z < 1.2) continue;
  if (x < -2.1) continue;
  box(0.1 + Math.random() * 0.08, 0.05, 0.06, dark(), x, 0.1, z, statics);
}

/* Pièces interactives */
const partGroups = {};
const partMeshes = [];

function registerPart(id, group) {
  const mats = new Set();
  group.traverse((o) => {
    if (o.isMesh) {
      o.userData.partId = id;
      partMeshes.push(o);
      mats.add(o.material);
    }
  });
  mats.forEach((m) => {
    m.userData.e0 = m.emissive ? m.emissive.getHex() : 0;
    m.userData.i0 = m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1;
  });
  partGroups[id] = { group, mats };
  scene.add(group);
}

// 1. RJ45
{
  const g = new THREE.Group();
  box(1.9, 1.1, 1.4, metal(), -3.25, 0.62, -0.8, g);
  box(0.05, 0.6, 0.95, dark(), -4.2, 0.55, -0.8, g);
  box(0.03, 0.08, 0.8, gold(), -4.19, 0.38, -0.8, g);
  registerPart('rj45', g);
}
// 2. SFP+
{
  const g = new THREE.Group();
  box(1.9, 0.85, 1.1, metal(), -3.25, 0.5, 1.0, g);
  box(0.05, 0.5, 0.8, dark(), -4.2, 0.45, 1.0, g);
  box(0.3, 0.06, 0.9, std({ color: 0x38bdf8, metalness: 0.2, roughness: 0.4 }), -4.3, 0.2, 1.0, g);
  registerPart('sfp', g);
}
// 3. Contrôleur
{
  const g = new THREE.Group();
  box(2.0, 0.14, 2.0, dark(), 0.4, 0.145, 0, g);
  box(1.1, 0.08, 1.1, std({ color: 0x9aa7bd, metalness: 1, roughness: 0.3 }), 0.4, 0.255, 0, g);
  box(0.12, 0.02, 0.12, glow(0x38bdf8, 1.4), -0.45, 0.225, -0.85, g);
  registerPart('controleur', g);
}
// 4. Dissipateur
{
  const g = new THREE.Group();
  const bm = blueMetal();
  box(1.5, 0.1, 1.5, bm, 0.4, 0.34, 0, g);
  for (let i = 0; i < 10; i++) box(0.07, 0.5, 1.5, bm, -0.23 + i * 0.14, 0.64, 0, g);
  registerPart('dissipateur', g);
}
// 5. PCIe
{
  const g = new THREE.Group();
  const gm = gold();
  for (let i = 0; i < 30; i++) {
    if (i === 12) continue;
    box(0.07, 0.2, 0.6, gm, -0.9 + i * 0.105, 0, 2.28, g);
  }
  registerPart('pcie', g);
}
// 6. Firmware
{
  const g = new THREE.Group();
  box(0.7, 0.09, 0.45, dark(), 2.6, 0.12, -1.3, g);
  box(0.08, 0.02, 0.08, glow(0xffffff, 0.9), 2.35, 0.17, -1.45, g);
  registerPart('firmware', g);
}
// 7. Alimentation
{
  const g = new THREE.Group();
  const cm = std({ color: 0x8fa0bf, metalness: 0.9, roughness: 0.3 });
  for (const x of [2.2, 2.6, 3.0, 3.4]) for (const z of [0.2, 0.7, 1.2]) cyl(0.13, 0.35, cm, x, 0.25, z, g);
  box(0.5, 0.3, 0.5, dark(), 3.4, 0.22, -0.5, g);
  box(0.5, 0.3, 0.5, dark(), 2.7, 0.22, -0.5, g);
  box(0.45, 0.08, 0.35, dark(), 2.0, 0.12, -0.5, g);
  registerPart('alim', g);
}
// 8. Pistes
const PATHS = [
  { pts: [[-3.0, -0.8], [-1.7, -0.8], [-1.1, -0.3], [-0.6, -0.3]], col: 0xfbbf24, rev: false, off: [0, 1] },
  { pts: [[-3.0, 1.0], [-1.7, 1.0], [-1.1, 0.4], [-0.6, 0.4]], col: 0xfbbf24, rev: false, off: [0, 1] },
  { pts: [[0.2, 1.0], [0.2, 1.6], [0.6, 2.0], [0.6, 2.6]], col: 0x38bdf8, rev: false, off: [1, 0] },
  { pts: [[1.1, 2.6], [1.1, 1.6], [1.0, 1.0]], col: 0xa78bfa, rev: false, off: [1, 0] }
];
{
  const g = new THREE.Group();
  const tm = std({ color: 0x0a0f1c, emissive: 0x38bdf8, emissiveIntensity: 0.8, roughness: 0.4 });
  PATHS.forEach((p) => {
    for (const k of [-1, 0, 1]) {
      const pts = p.pts.map(([x, z]) => new THREE.Vector3(x + p.off[0] * k * 0.1, 0.09, z + p.off[1] * k * 0.1));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.022, 6, false), tm));
    }
  });
  registerPart('pistes', g);
}
// 9. LED
const ledA = glow(0x34d399, 1.6);
const ledB = glow(0xfbbf24, 1.6);
{
  const g = new THREE.Group();
  box(0.05, 0.1, 0.16, ledA, -4.2, 1.25, -1.2, g);
  box(0.05, 0.1, 0.16, ledB, -4.2, 1.25, -0.4, g);
  registerPart('leds', g);
}

/* Particules de données */
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.3, 'rgba(255,255,255,0.35)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const gtex = glowTexture();
const particles = [];
const flowGroup = new THREE.Group();
scene.add(flowGroup);
PATHS.forEach((p) => {
  const pts = p.pts.map(([x, z]) => new THREE.Vector3(x, 0.14, z));
  let total = 0;
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const l = pts[i].distanceTo(pts[i + 1]);
    segs.push(l);
    total += l;
  }
  for (let n = 0; n < 4; n++) {
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color: p.col }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: p.col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    halo.scale.set(0.5, 0.5, 0.5);
    core.add(halo);
    flowGroup.add(core);
    particles.push({ core, pts, segs, total, offset: n / 4 });
  }
});
function placeParticle(pt, u) {
  let d = u * pt.total;
  for (let i = 0; i < pt.segs.length; i++) {
    if (d <= pt.segs[i] || i === pt.segs.length - 1) {
      pt.core.position.lerpVectors(pt.pts[i], pt.pts[i + 1], Math.min(d / pt.segs[i], 1));
      return;
    }
    d -= pt.segs[i];
  }
}

/* ---------- Interface ---------- */
const listEl = document.getElementById('list');
const detailEl = document.getElementById('detail');
const pinsEl = document.getElementById('pins');
const tipEl = document.getElementById('tip');
const pinEls = {};
let selected = null;

PARTS.forEach((p, i) => {
  p.n = i + 1;
  const b = document.createElement('button');
  b.dataset.id = p.id;
  b.innerHTML = '<span class="n">' + p.n + '</span><span>' + p.name + '</span>';
  b.addEventListener('click', () => select(p.id));
  listEl.appendChild(b);

  const pin = document.createElement('div');
  pin.className = 'pin';
  pin.textContent = p.n;
  pin.title = p.name;
  pin.addEventListener('click', () => select(p.id));
  pinsEl.appendChild(pin);
  pinEls[p.id] = pin;
});

function intro() {
  detailEl.innerHTML =
    '<span class="layer">EXPLORATEUR 3D</span><h2>Qu’est-ce qu’une carte réseau ?</h2>' +
    '<p>La carte réseau (NIC, Network Interface Card) est l’interface matérielle entre une machine et le réseau. Elle fonctionne aux couches 1 et 2 du modèle OSI : elle transforme les données en signaux et les structure en trames.</p>' +
    '<h4>COMMENT EXPLORER</h4><p>Cliquez sur une pièce ou sur un numéro pour afficher sa définition et son rôle. Lancez la <b>visite guidée</b>, la <b>vue éclatée</b> ou le <b>flux de données</b> avec les boutons du bas.</p>' +
    '<div class="keep">Les impulsions jaunes représentent les données émises ou reçues ; les bleues et violettes, les échanges avec le processeur par le bus PCIe.</div>';
}
function select(id) {
  if (quiz && quiz.target) { answer(id); return; }
  stopAuto();
  selected = id;
  const p = PARTS.find((x) => x.id === id);
  detailEl.innerHTML =
    '<span class="layer">' + p.layer + '</span><h2>' + p.n + '. ' + p.name + '</h2>' +
    '<h4>DÉFINITION</h4><p>' + p.def + '</p><h4>RÔLE</h4><p>' + p.role + '</p><h4>ANALOGIE</h4><p>' + p.ana + '</p><h4>EXEMPLE</h4><p>' + p.ex + '</p><div class="keep"><b>À retenir :</b> ' + p.keep + '</div>';
  detailEl.scrollTop = 0;
  listEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
  Object.entries(pinEls).forEach(([k, el]) => el.classList.toggle('on', k === id));
  flyTo(p);
}
function deselect() {
  selected = null;
  intro();
  listEl.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
  Object.values(pinEls).forEach((el) => el.classList.remove('on'));
}
intro();

/* Caméra animée */
let goal = null;
function flyTo(p) {
  const look = new THREE.Vector3(...p.look);
  const dir = new THREE.Vector3(...p.dir).normalize();
  goal = { pos: look.clone().addScaledVector(dir, p.dist), look };
}
function goHome() {
  goal = { pos: HOME.pos.clone(), look: HOME.look.clone() };
}
controls.addEventListener('start', () => {
  goal = null;
  controls.autoRotate = false;
  stopTour();
});
function stopAuto() {
  controls.autoRotate = false;
}


/* Quiz */
let quiz = null;
function nextQ() {
  if (quiz.n >= 6) {
    const t = quiz.score >= 5 ? 'Excellent !' : quiz.score >= 3 ? 'Bien joué.' : 'Continuez à explorer.';
    detailEl.innerHTML = '<span class="layer">QUIZ TERMINÉ</span><h2>' + quiz.score + ' / 6</h2><p>' + t + ' Relancez le quiz ou explorez les pièces pour progresser.</p>';
    quiz = null; document.body.classList.remove('quiz'); $('bQuiz').classList.remove('on'); return;
  }
  const rest = PARTS.filter((p) => !quiz.done.includes(p.id));
  quiz.target = rest[Math.floor(Math.random() * rest.length)]; quiz.done.push(quiz.target.id);
  detailEl.innerHTML = '<span class="layer">QUIZ · QUESTION ' + (quiz.n + 1) + ' / 6</span><h2>Quelle pièce est-ce ?</h2><p>' + quiz.target.def + ' ' + quiz.target.role + '</p><p style="margin-top:12px"><b>Cliquez sur la bonne pièce dans la scène 3D.</b></p><p>Score : <span id="score">' + quiz.score + '</span></p>';
}
function answer(id) {
  const ok = id === quiz.target.id; const t = quiz.target;
  if (ok) quiz.score++;
  quiz.n++; flyTo(t);
  detailEl.innerHTML = '<span class="layer">' + (ok ? 'BONNE RÉPONSE' : 'PAS TOUT À FAIT') + '</span><h2>' + t.n + '. ' + t.name + '</h2><p>' + (ok ? 'Exact !' : 'La bonne réponse était : ' + t.name + '.') + ' ' + t.keep + '</p><p style="margin-top:12px"><button id="nq" style="background:#38bdf8;color:#06121f;border:0;border-radius:10px;padding:10px 18px;font-size:17px;font-weight:700;font-family:inherit;cursor:pointer">' + (quiz.n >= 6 ? 'Voir le score' : 'Question suivante') + '</button></p>';
  quiz.target = null;
  document.getElementById('nq').onclick = () => { quiz.target = null; nextQ(); };
}

/* Boutons */
let explodeGoal = 0, explode = 0, flowOn = true, tourTimer = null;
const $ = (id) => document.getElementById(id);
function idx() {
  return PARTS.findIndex((p) => p.id === selected);
}
function step(d) {
  const i = idx();
  const n = (i + d + PARTS.length) % PARTS.length;
  select(PARTS[i === -1 ? (d > 0 ? 0 : PARTS.length - 1) : n].id);
}
function stopTour() {
  if (tourTimer) {
    clearInterval(tourTimer);
    tourTimer = null;
    $('bTour').classList.remove('on');
    $('bTour').textContent = '▶ Visite guidée';
  }
}
function startTour() {
  explodeGoal = 0;
  $('bExplode').classList.remove('on');
  select(PARTS[0].id);
  $('bTour').classList.add('on');
  $('bTour').textContent = '❚❚ Arrêter la visite';
  tourTimer = setInterval(() => step(1), 7000);
}
$('bTour').onclick = () => (tourTimer ? stopTour() : startTour());
$('bPrev').onclick = () => { stopTour(); step(-1); };
$('bNext').onclick = () => { stopTour(); step(1); };
$('bExplode').onclick = () => {
  explodeGoal = explodeGoal ? 0 : 1;
  $('bExplode').classList.toggle('on', !!explodeGoal);
  if (!selected) {
    goal = { pos: new THREE.Vector3(8.5, 7, 11), look: new THREE.Vector3(0, 0.8, 0) };
    stopAuto();
  }
};
$('bQuiz').onclick = () => {
  if (quiz) { quiz = null; document.body.classList.remove('quiz'); $('bQuiz').classList.remove('on'); deselect(); return; }
  stopTour(); explodeGoal = 0; $('bExplode').classList.remove('on'); deselect(); goHome(); controls.autoRotate = false;
  quiz = { score: 0, n: 0, target: null, done: [] }; document.body.classList.add('quiz'); $('bQuiz').classList.add('on'); nextQ();
};
$('bFlow').onclick = () => {
  flowOn = !flowOn;
  $('bFlow').classList.toggle('on', flowOn);
};
$('bReset').onclick = () => {
  stopTour();
  explodeGoal = 0;
  $('bExplode').classList.remove('on');
  deselect();
  goHome();
  controls.autoRotate = true;
};
$('bFull').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};
addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { stopTour(); step(1); }
  else if (e.key === 'ArrowLeft') { stopTour(); step(-1); }
  else if (e.key === 't' || e.key === 'T') $('bTour').click();
  else if (e.key === 'e' || e.key === 'E') $('bExplode').click();
  else if (e.key === 'f' || e.key === 'F') $('bFlow').click();
  else if (e.key === 'q' || e.key === 'Q') $('bQuiz').click();
  else if (e.key === 'Escape') $('bReset').click();
});

/* Survol et clic */
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let hover = null, down = null;
function pick(ev) {
  ptr.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(partMeshes, false)[0];
  return hit ? hit.object.userData.partId : null;
}
canvas.addEventListener('pointermove', (ev) => {
  hover = pick(ev);
  canvas.style.cursor = hover ? 'pointer' : 'grab';
  if (hover) {
    tipEl.textContent = PARTS.find((p) => p.id === hover).name;
    tipEl.style.left = ev.clientX + 14 + 'px';
    tipEl.style.top = ev.clientY + 14 + 'px';
    tipEl.style.opacity = 1;
  } else tipEl.style.opacity = 0;
});
canvas.addEventListener('pointerdown', (ev) => { down = { x: ev.clientX, y: ev.clientY }; });
canvas.addEventListener('pointerup', (ev) => {
  if (down && Math.hypot(ev.clientX - down.x, ev.clientY - down.y) < 5) {
    const id = pick(ev);
    stopTour();
    if (id) select(id);
  }
  down = null;
});

/* Mise en surbrillance */
function highlight(id, boost) {
  const { mats } = partGroups[id];
  mats.forEach((m) => {
    if (!m.emissive) return;
    if (boost > 0) {
      if (m.userData.e0 === 0) { m.emissive.setHex(0x38bdf8); m.emissiveIntensity = boost; }
      else m.emissiveIntensity = m.userData.i0 + boost * 3;
    } else {
      m.emissive.setHex(m.userData.e0);
      m.emissiveIntensity = m.userData.i0;
    }
  });
}

/* Boucle */
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const tmp = new THREE.Vector3();
function frame(ms) {
  requestAnimationFrame(frame);
  const t = ms / 1000;

  if (goal) {
    camera.position.lerp(goal.pos, 0.06);
    controls.target.lerp(goal.look, 0.06);
    if (camera.position.distanceTo(goal.pos) < 0.03) goal = null;
  }
  controls.update();

  explode += (explodeGoal - explode) * 0.07;
  const e = explode * explode * (3 - 2 * explode);
  for (const p of PARTS) {
    partGroups[p.id].group.position.set(p.explode[0] * e, p.explode[1] * e, p.explode[2] * e);
  }

  ledA.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.5;
  ledB.emissiveIntensity = Math.sin(t * 13) > 0.2 ? 2 : 0.25;

  for (const p of PARTS) {
    let b = 0;
    if (p.id === selected) b = 0.38 + 0.2 * Math.sin(t * 3.2);
    else if (p.id === hover) b = 0.3;
    highlight(p.id, b);
  }

  flowGroup.visible = flowOn && e < 0.05;
  if (flowGroup.visible) {
    for (const pt of particles) {
      placeParticle(pt, (t * 0.22 + pt.offset) % 1);
    }
  }

  for (const p of PARTS) {
    tmp.set(p.look[0], p.look[1] + 0.35, p.look[2]).add(partGroups[p.id].group.position).project(camera);
    const el = pinEls[p.id];
    if (tmp.z > 1) { el.style.display = 'none'; continue; }
    el.style.display = 'grid';
    el.style.transform = 'translate(' + ((tmp.x * 0.5 + 0.5) * innerWidth).toFixed(1) + 'px,' + ((-tmp.y * 0.5 + 0.5) * innerHeight).toFixed(1) + 'px)';
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
