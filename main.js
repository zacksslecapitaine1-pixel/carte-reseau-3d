import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './devices.js';

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

/* Point d’ancrage de chaque numéro : posé SUR la pièce (et non en l’air) */
const PIN = {
  rj45: [-3.25, 1.2, -0.8], sfp: [-3.25, 0.98, 1.0], controleur: [-0.3, 0.32, 0.97],
  dissipateur: [0.4, 0.98, 0], pcie: [1.1, 0.22, 2.28], firmware: [2.6, 0.24, -1.3],
  alim: [2.6, 0.5, 0.7], pistes: [-1.4, 0.16, -0.55], leds: [-4.2, 1.36, -0.8]
};
PARTS.forEach((p) => { p.pin = PIN[p.id]; });

/* Les 4 flux de données, nommés et numérotés */
const FLOWS = [
  { n: 1, short: 'RJ45 → Contrôleur', name: 'Flux 1 · Réception par le câble cuivre', col: '#fbbf24',
    desc: 'Les trames arrivent du câble Ethernet : le port RJ45 isole le signal électrique et l’envoie vers le contrôleur (PHY puis MAC).', via: 'Port RJ45 → pistes → Contrôleur MAC + PHY' },
  { n: 2, short: 'SFP+ → Contrôleur', name: 'Flux 2 · Réception par la fibre optique', col: '#fbbf24',
    desc: 'Le module optique transforme la lumière en signal électrique. Le contrôleur reçoit ensuite les bits comme pour le cuivre.', via: 'Cage SFP+ → pistes → Contrôleur MAC + PHY' },
  { n: 3, short: 'Contrôleur → PCIe', name: 'Flux 3 · Vers l’ordinateur (DMA)', col: '#38bdf8',
    desc: 'Une fois la trame vérifiée (CRC), le contrôleur l’écrit directement en mémoire RAM grâce au DMA, via le bus PCI Express.', via: 'Contrôleur → Connecteur PCI Express → RAM' },
  { n: 4, short: 'PCIe → Contrôleur', name: 'Flux 4 · Depuis l’ordinateur (émission)', col: '#a78bfa',
    desc: 'Pour envoyer des données, le pilote place les paquets en RAM ; la carte les lit par le bus PCIe, puis le contrôleur construit les trames.', via: 'RAM → Connecteur PCI Express → Contrôleur' }
];

/* ---------- Scène ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const renderer_ = renderer;
renderer_.shadowMap.enabled = true;
renderer_.shadowMap.type = THREE.PCFShadowMap;
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

key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -7; key.shadow.camera.right = 7;
key.shadow.camera.top = 7; key.shadow.camera.bottom = -7;
key.shadow.camera.near = 1; key.shadow.camera.far = 24;
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
const ambient = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambient);

const grid = new THREE.GridHelper(40, 80, 0x1d4ed8, 0x14233f);
grid.position.y = -1.3;
grid.material.transparent = true;
grid.material.opacity = 0.55;
scene.add(grid);

/* Sol du mode Réaliste (reçoit les ombres) */
const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.6, metalness: 0.1 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.3;
floor.receiveShadow = true;
floor.visible = false;
scene.add(floor);

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
const pcb = box(8, 0.15, 4, new THREE.MeshPhysicalMaterial({ color: 0x0a6b63, roughness: 0.5, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.35 }), 0, 0, 0, statics);
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
let chipTop;
{
  const g = new THREE.Group();
  box(2.0, 0.14, 2.0, dark(), 0.4, 0.145, 0, g);
  chipTop = box(1.1, 0.08, 1.1, std({ color: 0x9aa7bd, metalness: 1, roughness: 0.3 }), 0.4, 0.255, 0, g);
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


/* ---------- Variantes de matériaux : 2D · 3D · Réaliste ---------- */
function makeTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const prime = (m) => { m.userData.e0 = m.emissive ? m.emissive.getHex() : 0; m.userData.i0 = m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1; return m; };

const pcbTex = makeTex(2048, 1024, (x, W, H) => {
  const X = (wx) => ((wx + 4) / 8) * W, Z = (wz) => ((wz + 2) / 4) * H;
  x.fillStyle = '#0c6b50'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { x.fillStyle = 'rgba(' + (Math.random() < .5 ? '255,255,255' : '0,0,0') + ',' + (Math.random() * .035).toFixed(3) + ')'; x.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 5, 2); }
  x.lineCap = 'round'; x.lineJoin = 'round';
  PATHS.forEach((p) => {
    for (const k of [-1, 0, 1]) {
      x.strokeStyle = 'rgba(70,190,150,.8)'; x.lineWidth = 6;
      x.beginPath();
      p.pts.forEach(([wx, wz], i) => { const px = X(wx + p.off[0] * k * 0.1), pz = Z(wz + p.off[1] * k * 0.1); i ? x.lineTo(px, pz) : x.moveTo(px, pz); });
      x.stroke();
    }
  });
  x.strokeStyle = 'rgba(70,190,150,.45)'; x.lineWidth = 4;
  for (let i = 0; i < 26; i++) { const z0 = Z(-1.8 + i * 0.14); x.beginPath(); x.moveTo(X(1.9), z0); x.lineTo(X(2.0 + (i % 3) * 0.1), z0); x.lineTo(X(2.4), z0 + (i % 2 ? 24 : -24)); x.stroke(); }
  x.fillStyle = '#e8c15a';
  for (let i = 0; i < 70; i++) { x.beginPath(); x.arc(X(-2 + Math.random() * 5.8), Z(-1.8 + Math.random() * 3.6), 5, 0, 7); x.fill(); }
  x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 4;
  x.strokeRect(X(-0.75), Z(-1.05), X(1.55) - X(-0.75), Z(1.05) - Z(-1.05));
  x.strokeRect(X(2.2), Z(-1.65), X(3.0) - X(2.2), Z(-0.95) - Z(-1.65));
  x.fillStyle = '#fff'; x.font = 'bold 40px "Times New Roman", serif';
  x.fillText('ESGIS · GROUPE 21', X(-1.9), Z(1.85));
  x.font = '30px "Times New Roman", serif';
  x.fillText('NIC 10G · PCIe x4 · REV 1.0', X(0.7), Z(1.62));
  x.fillText('U1', X(-0.7), Z(-1.1)); x.fillText('FLASH', X(2.2), Z(-1.7)); x.fillText('J1', X(-3.9), Z(-0.4));
});
const chipTex = makeTex(512, 512, (x, W, H) => {
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#c4ccda'); g.addColorStop(1, '#8e99ad');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { x.fillStyle = 'rgba(255,255,255,' + (Math.random() * .08).toFixed(3) + ')'; x.fillRect(0, Math.random() * H, W, 1); }
  x.fillStyle = '#2a3347'; x.textAlign = 'center';
  x.font = 'bold 64px "Times New Roman", serif'; x.fillText('ESGIS', W / 2, 190);
  x.font = '38px "Times New Roman", serif'; x.fillText('NIC-X10 · MAC + PHY', W / 2, 252); x.fillText('10 GbE · IEEE 802.3', W / 2, 304); x.fillText('L1 · L2 · DMA', W / 2, 356);
  x.beginPath(); x.arc(52, 52, 14, 0, 7); x.fill();
});
{
  const side = std({ color: 0x0a5a42, roughness: 0.5, metalness: 0.1 });
  const top = new THREE.MeshPhysicalMaterial({ map: pcbTex, roughness: 0.42, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.22 });
  pcb.userData.mReal = [side, side, top, side, side, side].map(prime);
  const cs = std({ color: 0xb9c2d1, metalness: 1, roughness: 0.28 });
  const ct = std({ map: chipTex, metalness: 0.85, roughness: 0.32 });
  chipTop.userData.mReal = [cs, cs, ct, cs, cs, cs].map(prime);
}

const solids = [];
statics.traverse((o) => { if (o.isMesh) solids.push(o); });
partMeshes.forEach((o) => solids.push(o));
const edgeMat = new THREE.LineBasicMaterial({ color: 0xd6ecff, transparent: true, opacity: 0.9 });
solids.forEach((m) => {
  m.userData.m3 = m.material;
  m.castShadow = true; m.receiveShadow = true;
  if (m.geometry.type !== 'TubeGeometry') {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 28), edgeMat);
    e.visible = false; e.userData.edge = true; m.add(e);
  }
});
const flatCache = new Map();
function flatOf(m) {
  if (!flatCache.has(m)) {
    const f = new THREE.MeshStandardMaterial({ color: m.color.clone().lerp(new THREE.Color(0xffffff), 0.08), roughness: 1, metalness: 0, emissive: m.emissive ? m.emissive.clone() : new THREE.Color(0), emissiveIntensity: m.emissive ? m.emissiveIntensity : 0 });
    flatCache.set(m, prime(f));
  }
  return flatCache.get(m);
}
function setLive(m, v) { m.emissiveIntensity = v; m.userData.i0 = v; const f = flatCache.get(m); if (f) { f.emissiveIntensity = v; f.userData.i0 = v; } }
function matFor(mesh, md) {
  if (md === '2d') return flatOf(mesh.userData.m3);
  if (md === 'real' && mesh.userData.mReal) return mesh.userData.mReal;
  return mesh.userData.m3;
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
PATHS.forEach((p, fi) => {
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
    particles.push({ core, pts, segs, total, offset: n / 4, flow: fi });
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
  pin.innerHTML = '<span class="nn">' + p.n + '</span><span class="pl">' + p.name + '</span>';
  pin.title = p.name;
  // un glissement qui démarre sur une pastille fait tourner la carte ; un simple clic sélectionne la pièce
  pin.addEventListener('pointerdown', (e) => {
    const x0 = e.clientX, y0 = e.clientY;
    renderer.domElement.dispatchEvent(new PointerEvent('pointerdown', { pointerId: e.pointerId, clientX: x0, clientY: y0, button: e.button, buttons: e.buttons, pointerType: e.pointerType, isPrimary: e.isPrimary, bubbles: true }));
    const up = (ev) => { removeEventListener('pointerup', up, true); if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) select(p.id); };
    addEventListener('pointerup', up, true);
  });
  pin.addEventListener('keydown', (e) => { if (e.key === 'Enter') select(p.id); });
  pinsEl.appendChild(pin);
  pinEls[p.id] = pin;
});

/* Légende et étiquettes des flux */
const legendEl = document.getElementById('legend');
const flowLbl = [];
legendEl.innerHTML = '<div class="lt">FLUX DE DONNÉES</div>';
FLOWS.forEach((f, i) => {
  const b = document.createElement('button');
  b.dataset.i = i;
  b.innerHTML = '<span class="fn" style="background:' + f.col + '">F' + f.n + '</span><span>' + f.short + '</span>';
  b.addEventListener('click', () => selectFlow(i));
  legendEl.appendChild(b);
  const l = document.createElement('div');
  l.className = 'flowlbl';
  l.style.setProperty('--c', f.col);
  l.textContent = 'Flux ' + f.n;
  l.title = f.name;
  l.dataset.i = i;
  l.addEventListener('click', () => selectFlow(i));
  pinsEl.appendChild(l);
  flowLbl.push({ el: l, pos: new THREE.Vector3(...[[-1.95, 0.3, -1.15], [-1.95, 0.3, 1.35], [-0.05, 0.3, 1.45], [1.45, 0.3, 1.95]][i]) });
});

function intro() {
  detailEl.innerHTML =
    '<span class="layer">EXPLORATEUR 3D</span><h2>Qu’est-ce qu’une carte réseau ?</h2>' +
    '<p>La carte réseau (NIC, Network Interface Card) est l’interface matérielle entre une machine et le réseau. Elle fonctionne aux couches 1 et 2 du modèle OSI : elle transforme les données en signaux et les structure en trames.</p>' +
    '<h4>COMMENT EXPLORER</h4><p>Cliquez sur une pièce ou sur un numéro pour afficher sa définition et son rôle. Lancez la <b>visite guidée</b>, la <b>vue éclatée</b> ou le <b>flux de données</b> avec les boutons du bas.</p>' +
    '<div class="keep">Les <b>flux numérotés F1 à F4</b> montrent le trajet des données : F1 et F2 (jaune) arrivent du câble ou de la fibre, F3 (bleu) monte vers l’ordinateur, F4 (violet) en descend. Cliquez sur un flux pour le suivre.</div>';
}
function select(id) {
  if (quiz && quiz.target) { answer(id); return; }
  stopAuto();
  setFlow(-1);
  selected = id;
  const p = PARTS.find((x) => x.id === id);
  detailEl.innerHTML =
    '<span class="layer">' + p.layer + '</span><h2>' + p.n + '. ' + p.name + '</h2>' +
    '<h4>DÉFINITION</h4><p>' + p.def + '</p><h4>RÔLE</h4><p>' + p.role + '</p><h4>ANALOGIE</h4><p>' + p.ana + '</p><h4>EXEMPLE</h4><p>' + p.ex + '</p><div class="keep"><b>À retenir :</b> ' + p.keep + '</div><button class="actbtn" data-act="' + p.id + '">⚡ Action : voir « ' + p.name + ' » en fonctionnement</button>';
  detailEl.scrollTop = 0;
  listEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
  Object.entries(pinEls).forEach(([k, el]) => el.classList.toggle('on', k === id));
  flyTo(p);
}
function deselect() {
  selected = null;
  setFlow(-1);
  intro();
  listEl.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
  Object.values(pinEls).forEach((el) => el.classList.remove('on'));
}
intro();

let activeFlow = -1;
function setFlow(i) {
  activeFlow = i;
  legendEl.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
}
function selectFlow(i) {
  if (quiz) return;
  stopAuto(); stopTour();
  selected = null;
  listEl.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
  Object.values(pinEls).forEach((el) => el.classList.remove('on'));
  setFlow(i);
  flowOn = true; $('bFlow').classList.add('on');
  explodeGoal = 0; $('bExplode').classList.remove('on');
  const f = FLOWS[i];
  detailEl.innerHTML = '<span class="layer">FLUX ' + f.n + ' SUR 4</span><h2>' + f.name + '</h2>' +
    '<h4>TRAJET</h4><p>' + f.via + '</p><h4>EXPLICATION</h4><p>' + f.desc + '</p>' +
    '<div class="keep"><b>Repère :</b> les points lumineux de couleur ' + (i < 2 ? 'jaune' : i === 2 ? 'bleue' : 'violette') + ' sur la carte suivent ce flux.</div>';
  detailEl.scrollTop = 0;
  const m = flowLbl[i].pos;
  flyTo({ look: [m.x, 0.2, m.z], dist: mode === '2d' ? 6 : 5.5, dir: [0.35, 0.9, 0.55] });
}

/* Caméra animée */
let goal = null;
function flyTo(p) {
  const look = new THREE.Vector3(...p.look);
  const flat = mode === '2d';
  const dir = new THREE.Vector3(...(flat ? [0, 1, 0.001] : p.dir)).normalize();
  goal = { pos: look.clone().addScaledVector(dir, flat ? Math.max(4, p.dist * 0.8) : p.dist), look };
}
function homeGoal() {
  return mode === '2d'
    ? { pos: new THREE.Vector3(0.55, 13.8, 0.001), look: new THREE.Vector3(0.55, 0, 0) }
    : { pos: HOME.pos.clone(), look: HOME.look.clone() };
}
function goHome() {
  goal = homeGoal();
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
    goal = mode === '2d' ? { pos: new THREE.Vector3(0.55, 15, 0.001), look: new THREE.Vector3(0.55, 0, 0) } : { pos: new THREE.Vector3(8.5, 7, 11), look: new THREE.Vector3(0, 0.8, 0) };
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
  controls.autoRotate = mode !== '2d';
};
$('bFull').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};
addEventListener('keydown', (e) => {
  if (document.querySelector('.ov:not([hidden])') || document.getElementById('welcome').style.display !== 'none' && getComputedStyle(document.getElementById('welcome')).display !== 'none') return;
  if (e.key === 'ArrowRight') { stopTour(); step(1); }
  else if (e.key === 'ArrowLeft') { stopTour(); step(-1); }
  else if (e.key === 't' || e.key === 'T') $('bTour').click();
  else if (e.key === 'e' || e.key === 'E') $('bExplode').click();
  else if (e.key === 'f' || e.key === 'F') $('bFlow').click();
  else if (e.key === 'q' || e.key === 'Q') $('bQuiz').click();
  else if (e.key === 'm' || e.key === 'M') setMode(MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % 3]);
  else if (/^[1-9]$/.test(e.key) && PARTS[+e.key - 1]) { stopTour(); select(PARTS[+e.key - 1].id); }
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

/* ---------- Modes d’affichage : 2D · 3D · Réaliste ---------- */
const MODE_ORDER = ['2d', '3d', 'real'];
const envTex = scene.environment;
const MODES = {
  '3d': { bg: 0x0b1220, fog: [0x0b1220, 16, 36], envI: 1, exp: 1.15, tone: THREE.ACESFilmicToneMapping, key: [1.5, 0xffffff, [3, 7, 5]], cyan: 140, violet: 110, amb: 0, grid: true, gridOp: 0.55, floor: false, shadow: false },
  real: { bg: 0x101319, fog: [0x101319, 18, 42], envI: 0.9, exp: 0.95, tone: THREE.ACESFilmicToneMapping, key: [2.4, 0xfff1dc, [4, 8, 5]], cyan: 22, violet: 16, amb: 0.05, grid: false, gridOp: 0, floor: true, shadow: true },
  '2d': { bg: 0x0a2a4a, fog: null, envI: 0, exp: 1, tone: THREE.NoToneMapping, key: [0.45, 0xffffff, [0, 10, 0.01]], cyan: 0, violet: 0, amb: 0.85, grid: true, gridOp: 0.45, floor: false, shadow: false }
};
let mode = '3d';
function refreshMats() {
  const flat = mode === '2d';
  for (const m of solids) {
    m.material = matFor(m, mode);
    for (const c of m.children) if (c.userData.edge) c.visible = flat;
  }
  for (const p of PARTS) {
    const set = new Set();
    partGroups[p.id].group.traverse((o) => {
      if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((x) => set.add(x));
    });
    partGroups[p.id].mats = set;
  }
}
function setMode(md) {
  const prev = mode;
  mode = md;
  const c = MODES[md];
  scene.background.setHex(c.bg);
  scene.fog = c.fog ? new THREE.Fog(c.fog[0], c.fog[1], c.fog[2]) : null;
  scene.environment = c.envI ? envTex : null;
  scene.environmentIntensity = c.envI;
  renderer.toneMapping = c.tone;
  renderer.toneMappingExposure = c.exp;
  key.intensity = c.key[0]; key.color.setHex(c.key[1]); key.position.set(...c.key[2]);
  key.castShadow = c.shadow;
  cyan.intensity = c.cyan; violet.intensity = c.violet; ambient.intensity = c.amb;
  grid.visible = c.grid; grid.material.opacity = c.gridOp;
  floor.visible = c.floor;
  refreshMats();
  scene.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.needsUpdate = true; }); });
  floor.material.needsUpdate = true;
  document.body.classList.toggle('m2d', md === '2d');
  document.body.dataset.mode = md;
  MODE_ORDER.forEach((k) => $('mode-' + k).classList.toggle('on', k === md));
  // caméra
  const flat = md === '2d';
  controls.enableRotate = !flat;
  controls.minPolarAngle = flat ? 0 : 0;
  controls.maxPolarAngle = flat ? 0.0001 : Math.PI * 0.56;
  controls.screenSpacePanning = flat;
  controls.mouseButtons = flat ? { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN } : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.touches = flat ? { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN } : { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  if (flat) controls.autoRotate = false;
  else if (prev === '2d' && !selected && activeFlow < 0) controls.autoRotate = true;
  const p = PARTS.find((x) => x.id === selected);
  if (p) flyTo(p); else if (activeFlow >= 0) selectFlow(activeFlow); else goHome();
}
MODE_ORDER.forEach((k) => { $('mode-' + k).onclick = () => setMode(k); });

/* Numéros : visibles seulement si la pièce est vue, jamais sous l’interface */
const occRay = new THREE.Raycaster();
const occDir = new THREE.Vector3();
function occluded(world) {
  occDir.copy(world).sub(camera.position);
  const d = occDir.length();
  occDir.divideScalar(d);
  occRay.set(camera.position, occDir);
  occRay.far = d - 0.05;
  return occRay.intersectObjects(solids, false).length > 0;
}
let uiRects = [];
function measureUI() {
  uiRects = ['panel', 'bar', 'legend', 'modes', 'brand'].map((id) => document.getElementById(id)).filter((e) => e && e.getClientRects().length > 0).map((e) => e.getBoundingClientRect());
}
addEventListener('resize', measureUI);
const underUI = (x, y) => uiRects.some((r) => x > r.left - 16 && x < r.right + 16 && y > r.top - 16 && y < r.bottom + 16);

/* Boucle */
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const tmp = new THREE.Vector3();
let frameN = 0;
function frame(ms) {
  requestAnimationFrame(frame);
  if (window.__devOpen) return; // l’option « Autres appareils » a sa propre scène
  const t = ms / 1000;

  const arWanted = controls.autoRotate;
  if (goal) {
    if (!goal.t0) goal.t0 = ms;
    const k = act ? 0.12 : 0.07;
    camera.position.lerp(goal.pos, k);
    controls.target.lerp(goal.look, k);
    if (camera.position.distanceTo(goal.pos) < 0.05 || ms - goal.t0 > 2200) goal = null;
    controls.autoRotate = false;
  }
  controls.update();
  controls.autoRotate = arWanted;

  explode += (explodeGoal - explode) * 0.07;
  const e = explode * explode * (3 - 2 * explode);
  for (const p of PARTS) {
    partGroups[p.id].group.position.set(p.explode[0] * e, p.explode[1] * e, p.explode[2] * e);
  }

  setLive(ledA, 1.4 + Math.sin(t * 2) * 0.5);
  setLive(ledB, Math.sin(t * 13) > 0.2 ? 2 : 0.25);

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
      const sc = activeFlow < 0 ? 1 : pt.flow === activeFlow ? 1.9 : 0.55;
      pt.core.scale.setScalar(sc);
    }
  }

  frameN = (frameN + 1) % 4;
  if (frameN === 0) measureUI();
  for (const p of PARTS) {
    tmp.set(p.pin[0], p.pin[1], p.pin[2]).add(partGroups[p.id].group.position);
    const wp = tmp.clone();
    tmp.project(camera);
    const el = pinEls[p.id];
    if (tmp.z > 1 || Math.abs(tmp.x) > 1.05 || Math.abs(tmp.y) > 1.05) { el.style.display = 'none'; continue; }
    const sx = (tmp.x * 0.5 + 0.5) * innerWidth, sy = (-tmp.y * 0.5 + 0.5) * innerHeight;
    el.style.display = 'grid';
    el.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
    el.style.zIndex = String(Math.round((1 - tmp.z) * 4000));
    el.classList.toggle('up', p.id === 'alim');
    el.classList.toggle('flip', p.id !== 'alim' && sx > innerWidth - 640);
    const hide = underUI(sx, sy);
    if (frameN === 0 || el._occ === undefined) el._occ = occluded(wp);
    el.classList.toggle('gone', hide);
    el.classList.toggle('occ', !hide && el._occ);
  }
  const showFlowLbl = flowOn && e < 0.05;
  flowLbl.forEach((f) => {
    tmp.copy(f.pos).project(camera);
    const sx = (tmp.x * 0.5 + 0.5) * innerWidth, sy = (-tmp.y * 0.5 + 0.5) * innerHeight;
    f.el.style.display = showFlowLbl && tmp.z < 1 && !underUI(sx, sy) ? 'block' : 'none';
    f.el.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
    f.el.classList.toggle('act', FLOWS.indexOf(FLOWS[+f.el.dataset.i]) === activeFlow);
  });

  if (typeof actTick === 'function') actTick(t);
  renderer.render(scene, camera);
}
setMode('3d');
measureUI();
requestAnimationFrame(frame);

/* =====================================================================
   ACTIONS : mise en fonctionnement réelle des connecteurs et composants
   ===================================================================== */
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => x * x * (3 - 2 * x);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function mkGlow(hex, s, op = 1) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: hex, blending: THREE.AdditiveBlending, depthTest: false, transparent: true, opacity: op }));
  m.scale.setScalar(s); m.renderOrder = 20; return m;
}
function mkLabel(text, col, w = 1.7) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(6,18,31,.93)'; x.strokeStyle = col; x.lineWidth = 7;
  x.beginPath(); x.roundRect(5, 5, 502, 118, 26); x.fill(); x.stroke();
  x.fillStyle = '#fff'; x.font = 'bold 56px "Times New Roman",serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(w, w / 4, 1); s.renderOrder = 30; return s;
}
const polyCurve = (pts, y) => new THREE.CatmullRomCurve3(pts.map(([x, z]) => V3(x, y, z)), false, 'catmullrom', 0.2);
const pathCurve = (i, y = 0.17) => polyCurve(PATHS[i].pts, y);
function setCable(mesh, pts, r) {
  mesh.geometry.dispose();
  mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, r, 8, false);
  return mesh.userData.curve = new THREE.CatmullRomCurve3(pts);
}
function packets(g, n, col, size) {
  return Array.from({ length: n }, () => { const s = mkGlow(col, size); s.visible = false; g.add(s); return s; });
}
function runPackets(arr, curve, t, t0, speed, t1 = 1e9, rev = false) {
  arr.forEach((s, k) => {
    const on = t >= t0 && t < t1;
    s.visible = on;
    if (!on) return;
    let u = (((t - t0) * speed) + k / arr.length) % 1;
    if (rev) u = 1 - u;
    s.position.copy(curve.getPoint(u));
  });
}
const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: 0.5, roughness: 0.4 }, o));
const ledColor = (m, hex) => { m.emissive.setHex(hex); const f = flatCache.get(m); if (f) f.emissive.setHex(hex); };

const ACT = {};

/* ---- RJ45 : le câble Ethernet vient se brancher ---- */
ACT.rj45 = {
  title: 'Connecteur RJ45', cam: { look: [-4.3, 0.7, -0.8], dist: 8.8, dir: [-1, 0.35, 0.85] },
  steps: [
    [0, 'Le câble arrive', 'Un câble Ethernet (4 paires torsadées, Cat 5e à 6A) est amené devant le port RJ45 de la carte.'],
    [3.4, 'Branchement : clic', 'Le connecteur mâle s’enfonce dans le port. Ses 8 contacts dorés touchent les 8 broches et le clip se verrouille.'],
    [6, 'Lien détecté', 'Les deux extrémités échangent des impulsions : la LED « lien » (verte) s’allume et la vitesse est négociée.'],
    [8.6, 'Le signal part vers le contrôleur', 'Les transformateurs d’isolation protègent la carte, puis le signal électrique suit les pistes jusqu’au contrôleur MAC + PHY qui le décode en bits.']
  ],
  build(g) {
    const plug = new THREE.Group(); g.add(plug);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.8), mat(0xdfe6f2, { transparent: true, opacity: 0.92, metalness: 0.1, roughness: 0.2 }));
    plug.add(body);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.66), mat(0x1f78b4, { metalness: 0.1 })); boot.position.x = -0.78; plug.add(boot);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.3), mat(0xcfd8e8)); clip.position.set(0.1, 0.28, 0); plug.add(clip);
    for (let i = 0; i < 8; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.06), mat(0xe0a82e, { metalness: 1, roughness: 0.2 })); c.position.set(0.5, 0.22, -0.3 + i * 0.086); plug.add(c); }
    const cable = new THREE.Mesh(new THREE.BufferGeometry(), mat(0x1f78b4, { metalness: 0.1, roughness: 0.5 })); g.add(cable);
    const lbl = mkLabel('Câble Ethernet', '#38bdf8', 1.7); g.add(lbl);
    const ring = mkGlow(0x38bdf8, 1, 0); ring.position.set(-4.25, 0.55, -0.8); g.add(ring);
    const hA = mkGlow(0x34d399, 0.9, 0); hA.position.set(-4.25, 1.25, -1.2); g.add(hA);
    const hB = mkGlow(0xfbbf24, 0.9, 0); hB.position.set(-4.25, 1.25, -0.4); g.add(hB);
    const chipG = mkGlow(0x38bdf8, 2.2, 0); chipG.position.set(0.4, 0.5, 0); g.add(chipG);
    const pk = packets(g, 6, 0xfbbf24, 0.5), curve = pathCurve(0, 0.2);
    const lbl2 = mkLabel('Signal électrique', '#fbbf24', 1.8); lbl2.position.set(-2.2, 1.2, -1.3); lbl2.visible = false; g.add(lbl2);
    return (t) => {
      const px = t < 3.4 ? -10 + 4 * ease(seg(t, 0, 3.2)) : -6 + 1.6 * ease(seg(t, 3.4, 4.4));
      plug.position.set(px, 0.55, -0.8);
      const sway = (1 - seg(t, 3.4, 4.4)) * Math.sin(t * 2) * 0.05;
      const back = px - 0.55;
      setCable(cable, [V3(back, 0.55, -0.8), V3(back - 1.6, 0.5 + sway, -0.9), V3(back - 4, 0.1, -1.6), V3(-15, -0.6, -4)], 0.09);
      lbl.position.set(px - 1.4, 1.3, -0.8); lbl.visible = t < 3.4;
      const click = seg(t, 4.3, 4.9);
      ring.material.opacity = click > 0 && click < 1 ? 1 - click : 0; ring.scale.setScalar(0.6 + click * 1.6);
      const link = seg(t, 6, 6.4);
      hA.material.opacity = link * (0.75 + 0.25 * Math.sin(t * 3)); hB.material.opacity = link * (Math.sin(t * 13) > 0.2 ? 0.9 : 0.15);
      runPackets(pk, curve, t, 8.6, 0.3);
      lbl2.visible = t > 8.6;
      chipG.material.opacity = t > 10.2 ? 0.35 + 0.2 * Math.sin(t * 5) : 0;
    };
  }
};

/* ---- SFP+ : module optique + fibre ---- */
ACT.sfp = {
  title: 'Cage SFP+', cam: { look: [-4.2, 0.6, 1.0], dist: 9, dir: [-1, 0.4, 0.8] },
  steps: [
    [0, 'Insertion du module', 'Le module optique (transceiver SFP+) glisse dans la cage jusqu’au clic : il est interchangeable à chaud.'],
    [3.6, 'Branchement de la fibre', 'Le connecteur LC (deux brins : émission et réception) vient se verrouiller dans la face avant du module.'],
    [7, 'La lumière entre', 'Des impulsions lumineuses voyagent dans le cœur de verre de la fibre jusqu’au module.'],
    [9.4, 'Lumière → électricité', 'Le module convertit la lumière en signaux électriques et les envoie par les pistes au contrôleur. À l’émission, il fait l’inverse avec un laser.']
  ],
  build(g) {
    const mod = new THREE.Group(); g.add(mod);
    mod.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 0.62), mat(0xaeb9cc, { metalness: 1, roughness: 0.25 })));
    const bail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.5), mat(0x38bdf8, { metalness: 0.2 })); bail.position.set(-0.78, 0, 0); mod.add(bail);
    for (const z of [-0.14, 0.14]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.16), mat(0x06121f)); h.position.set(-0.86, 0, z); mod.add(h); }
    const lc = new THREE.Group(); g.add(lc);
    for (const z of [-0.13, 0.13]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.22), mat(z < 0 ? 0xfb923c : 0x34d399, { metalness: 0.1 })); lc.add(b); const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 10), mat(0xffffff)); f.rotation.z = Math.PI / 2; f.position.x = 0.3; f.position.z = z; lc.add(f); b.position.z = z; }
    const cable = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xfbbf24, { metalness: 0.1, roughness: 0.5 })); g.add(cable);
    const lbl = mkLabel('Fibre optique', '#fbbf24', 1.7); g.add(lbl);
    const lblM = mkLabel('Module SFP+', '#38bdf8', 1.6); lblM.position.set(-4.4, 1.35, 1.0); lblM.visible = false; g.add(lblM);
    const ring = mkGlow(0x38bdf8, 1, 0); ring.position.set(-4.5, 0.45, 1.0); g.add(ring);
    const light = packets(g, 7, 0x7dd3fc, 0.42);
    const lblL = mkLabel('Lumière', '#7dd3fc', 1.2); lblL.visible = false; g.add(lblL);
    const mg = mkGlow(0x38bdf8, 1.5, 0); mg.position.set(-3.9, 0.5, 1.0); g.add(mg);
    const el = packets(g, 6, 0xfbbf24, 0.5), curve = pathCurve(1, 0.2);
    const chipG = mkGlow(0x38bdf8, 2.2, 0); chipG.position.set(0.4, 0.5, 0); g.add(chipG);
    return (t) => {
      const mx = -9 + 5.25 * ease(seg(t, 0, 3.2));
      mod.position.set(mx, 0.45, 1.0);
      lblM.visible = t > 3.2;
      const ring_ = seg(t, 3.0, 3.6); ring.material.opacity = ring_ > 0 && ring_ < 1 ? 1 - ring_ : 0; ring.scale.setScalar(0.6 + ring_ * 1.4);
      const cx = t < 3.6 ? -11 : -11 + 6.15 * ease(seg(t, 3.6, 6.4));
      lc.position.set(cx, 0.45, 1.0);
      const back = cx - 0.25;
      const cv = setCable(cable, [V3(back, 0.45, 1.0), V3(back - 1.8, 0.4, 1.2), V3(back - 4.5, 0.05, 2.2), V3(-16, -0.6, 4.5)], 0.05);
      lbl.position.set(cx - 1.4, 1.2, 1.0); lbl.visible = t < 7;
      light.forEach((s, k) => { const on = t > 7; s.visible = on; if (on) { const u = (((t - 7) * 0.5) + k / light.length) % 1; s.position.copy(cv.getPoint(Math.max(0, 0.32 * (1 - u)))); const p = s.position; p.y += 0; } });
      lblL.visible = t > 7 && t < 9.6; lblL.position.set(-6.2, 1.1, 1.5);
      mg.material.opacity = t > 8.6 ? 0.5 + 0.3 * Math.sin(t * 6) : 0;
      runPackets(el, curve, t, 9.4, 0.3);
      chipG.material.opacity = t > 11 ? 0.35 + 0.2 * Math.sin(t * 5) : 0;
    };
  }
};

/* ---- Contrôleur : construction d’une trame ---- */
ACT.controleur = {
  title: 'Contrôleur MAC + PHY', cam: { look: [0.4, 1.0, 0], dist: 7.5, dir: [0.25, 0.65, 0.85] },
  steps: [
    [0, 'Les données arrivent', 'Les bits à envoyer arrivent de la mémoire (DMA). Le contrôleur MAC prépare la trame.'],
    [1.2, 'Adresses MAC', 'Il écrit d’abord l’adresse MAC de destination, puis celle de la source (l’adresse d’usine de la carte), puis le type de protocole.'],
    [4.4, 'Données et CRC', 'Il ajoute les données utiles, puis calcule le CRC : un code de contrôle qui permettra au destinataire de détecter une erreur.'],
    [7, 'Le PHY envoie', 'La partie PHY encode la trame en signal sur le support. Aucune ligne de code du système n’a eu à construire cette trame : c’est le matériel qui travaille.']
  ],
  build(g) {
    const defs = [['MAC dest.', 0xfbbf24, 0.42], ['MAC src.', 0x38bdf8, 0.42], ['Type', 0xa78bfa, 0.26], ['Données', 0x3b82f6, 1.0], ['CRC', 0xf87171, 0.3]];
    const fr = new THREE.Group(); g.add(fr);
    let off = 0; const total = defs.reduce((a, d) => a + d[2] + 0.03, 0);
    const parts = defs.map((d, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(d[2], 0.14, 0.5), mat(d[1], { emissive: d[1], emissiveIntensity: 0.5 }));
      const lx = -total / 2 + off + d[2] / 2; off += d[2] + 0.03; m.userData.lx = lx; m.userData.from = V3((i % 2 ? 1 : -1) * 3.2, 1.2 + i * 0.25, (i - 2) * 0.9);
      m.visible = false; fr.add(m);
      const l = mkLabel(d[0], '#' + d[1].toString(16).padStart(6, '0'), 0.9); l.position.set(lx, 0.34 + (i % 2) * 0.22, 0); l.visible = false; fr.add(l); m.userData.l = l;
      return m;
    });
    const ring = mkGlow(0x38bdf8, 3, 0); ring.position.set(0.4, 0.45, 0); g.add(ring);
    const curve = polyCurve([[0.4, 0], [0.5, 1.0], [0.6, 2.0], [0.6, 2.7]], 1.7);
    const start = V3(0.4, 1.7, 0);
    return (t) => {
      parts.forEach((m, i) => {
        const t0 = 0.8 + i * 1.2, k = ease(seg(t, t0, t0 + 0.9));
        m.visible = t >= t0; m.userData.l.visible = t >= t0 + 0.9 && t < 7.2;
        m.position.set(m.userData.lx, 0, 0);
        m.position.lerp(V3(m.userData.lx, 0, 0), 1); m.position.x = m.userData.from.x * (1 - k) + m.userData.lx * k; m.position.y = m.userData.from.y * (1 - k); m.position.z = m.userData.from.z * (1 - k);
      });
      const go = ease(seg(t, 7, 11));
      if (t < 7) fr.position.copy(start); else fr.position.copy(curve.getPoint(Math.min(0.999, go)));
      ring.material.opacity = 0.35 + 0.25 * Math.sin(t * 4) * (t > 0.5 ? 1 : 0);
    };
  }
};

/* ---- Dissipateur : chaleur évacuée ---- */
ACT.dissipateur = {
  title: 'Dissipateur thermique', cam: { look: [0.4, 0.8, 0], dist: 6.5, dir: [0.7, 0.55, 0.9] },
  steps: [
    [0, 'La puce chauffe', 'À 10 Gbit/s et plus, le contrôleur dissipe plusieurs watts : sa température monte.'],
    [3, 'La chaleur monte', 'La chaleur passe dans la base métallique puis dans les ailettes, qui multiplient la surface d’échange avec l’air.'],
    [6, 'L’air l’emporte', 'Le flux d’air du boîtier traverse les ailettes et évacue la chaleur.'],
    [9.5, 'Sans dissipateur', 'Sans refroidissement, la puce ralentit pour se protéger : c’est le bridage thermique, et le débit baisse.']
  ],
  build(g) {
    const hot = mkGlow(0xff5522, 2.6, 0); hot.position.set(0.4, 0.3, 0); g.add(hot);
    const heat = Array.from({ length: 16 }, (_, i) => { const s = mkGlow(i % 2 ? 0xff8a3d : 0xffb347, 0.7, 0); s.userData = { x: -0.5 + (i % 8) * 0.14 + 0.4, z: -0.6 + ((i * 5) % 8) * 0.17, p: i / 16 }; g.add(s); return s; });
    const air = Array.from({ length: 12 }, (_, i) => { const s = mkGlow(0x7dd3fc, 0.45, 0); s.userData = { x: -0.16 + (i % 6) * 0.14 + 0.4, p: i / 12, y: 0.5 + (i % 2) * 0.12 }; g.add(s); return s; });
    const lbl = mkLabel('Chaleur', '#ff8a3d', 1.2); lbl.position.set(0.4, 2.4, 0); g.add(lbl);
    const lblA = mkLabel('Air frais', '#7dd3fc', 1.3); lblA.position.set(0.4, 1.35, -2.4); lblA.visible = false; g.add(lblA);
    return (t) => {
      hot.material.opacity = (t < 9.5 ? Math.min(1, t / 3) * (t > 6 ? 0.5 : 1) : 1) * (0.7 + 0.3 * Math.sin(t * 3));
      hot.scale.setScalar(t > 9.5 ? 4 : 2.6);
      heat.forEach((s) => { const on = t > 2.5; const u = ((t - 2.5) * 0.28 + s.userData.p) % 1; s.visible = on; s.position.set(s.userData.x + Math.sin(t * 2 + s.userData.p * 9) * 0.05, 0.4 + u * 1.9, s.userData.z); s.material.opacity = on ? Math.sin(u * Math.PI) * (t > 6 ? 0.55 : 0.9) : 0; });
      air.forEach((s) => { const on = t > 6 && t < 9.5; s.visible = on; const u = ((t - 6) * 0.35 + s.userData.p) % 1; s.position.set(s.userData.x, s.userData.y, -2.4 + u * 4.8); s.material.opacity = on ? Math.sin(u * Math.PI) : 0; });
      lbl.visible = t > 2.5; lblA.visible = t > 6 && t < 9.5;
      lbl.position.y = t > 9.5 ? 2.6 : 2.4; lbl.material.opacity = 1;
    };
  }
};

/* ---- PCIe : le bus vers la RAM (DMA) ---- */
ACT.pcie = {
  title: 'Connecteur PCI Express', cam: { look: [1.0, -0.2, 3.4], dist: 11, dir: [0.45, 0.85, 0.9] },
  steps: [
    [0, 'La carte mère apparaît', 'Le connecteur doré s’insère dans un slot PCI Express de la carte mère, relié au processeur et à la mémoire.'],
    [3, 'Contacts et lignes', 'Chaque contact sert une ligne de données (x1, x4, x8…) : plus il y en a, plus la bande passante est grande.'],
    [5.6, 'Réception : DMA', 'Le contrôleur écrit les trames directement en RAM par le bus, sans mobiliser le processeur : c’est le DMA.'],
    [10, 'Émission', 'Dans l’autre sens, le pilote dépose les paquets en RAM et la carte vient les lire pour les envoyer sur le réseau.']
  ],
  build(g) {
    const mb = new THREE.Group(); g.add(mb);
    const board = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 5.4), mat(0x14532d, { metalness: 0.2 })); board.position.set(0.8, -0.66, 4.3); mb.add(board);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.6, 0.5), mat(0x1f2937)); slot.position.set(0.7, -0.3, 2.28); mb.add(slot);
    const cpu = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 1.3), mat(0x9aa7bd, { metalness: 1, roughness: 0.3 })); cpu.position.set(-2.2, -0.45, 4.6); mb.add(cpu);
    for (const z of [4.3, 4.9]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 1.6), mat(0x0e7490)); r.position.set(3.6, -0.3, z); mb.add(r); for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.24), mat(0x06121f)); c.position.set(3.6, -0.15, z - 0.55 + i * 0.37); mb.add(c); } }
    const lc = mkLabel('Processeur', '#a78bfa', 1.5); lc.position.set(-2.2, 0.35, 4.6); mb.add(lc);
    const lr = mkLabel('Mémoire RAM', '#38bdf8', 1.7); lr.position.set(3.6, 0.7, 4.6); mb.add(lr);
    const ls = mkLabel('Slot PCIe', '#fbbf24', 1.3); ls.position.set(-1.3, -0.1, 2.9); mb.add(ls);
    const fg = Array.from({ length: 10 }, (_, i) => { const s = mkGlow(0xfbbf24, 0.55, 0); s.position.set(-0.7 + i * 0.35, 0.05, 2.28); g.add(s); return s; });
    const dma = polyCurve([[0.4, 0], [0.5, 1.2], [0.6, 2.35], [0.7, 3.1], [2.4, 3.8], [3.5, 4.3]], 0.0);
    const pts = dma.points; pts[3].y = -0.45; pts[4].y = -0.5; pts[5].y = -0.3; pts[2].y = 0.0;
    const dmaC = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3);
    const line = new THREE.Mesh(new THREE.TubeGeometry(dmaC, 50, 0.025, 6, false), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })); line.visible = false; g.add(line);
    const down = packets(g, 7, 0x38bdf8, 0.5), up = packets(g, 7, 0xa78bfa, 0.5);
    const ld = mkLabel('Sans le processeur', '#34d399', 1.9); ld.position.set(0.8, 0.7, 3.3); ld.visible = false; g.add(ld);
    return (t) => {
      const k = ease(seg(t, 0, 2.4)); mb.position.y = -3.2 * (1 - k);
      fg.forEach((s, i) => { s.material.opacity = t > 3 ? 0.5 + 0.4 * Math.sin(t * 6 - i * 0.7) : 0; });
      line.visible = t > 5.6;
      runPackets(down, dmaC, t, 5.6, 0.22, 10);
      runPackets(up, dmaC, t, 10, 0.22, 1e9, true);
      ld.visible = t > 6.5 && t < 10; lc.material.opacity = t > 5.6 ? 0.45 : 1;
    };
  }
};

/* ---- Firmware : la carte démarre ---- */
ACT.firmware = {
  title: 'Mémoire flash (firmware)', cam: { look: [1.8, 0.2, -0.8], dist: 6.2, dir: [0.4, 0.9, 0.7] },
  steps: [
    [0, 'Mise sous tension', 'L’ordinateur démarre : la carte reçoit son alimentation par le bus PCIe.'],
    [2.6, 'Lecture du firmware', 'Le contrôleur lit dans la mémoire flash son micrologiciel et sa configuration.'],
    [5.5, 'Adresse MAC d’usine', 'La flash contient aussi l’adresse MAC gravée à la fabrication (BIA). Elle est chargée dans le contrôleur.'],
    [8.5, 'Carte prête', 'La carte est configurée : le pilote du système peut maintenant la prendre en charge.']
  ],
  build(g) {
    const fl = mkGlow(0xffffff, 1.4, 0); fl.position.set(2.6, 0.2, -1.3); g.add(fl);
    const pk = packets(g, 6, 0xffffff, 0.4), curve = polyCurve([[2.6, -1.3], [2.0, -1.0], [1.3, -0.5], [0.9, -0.1]], 0.2);
    const mac = mkLabel('MAC 3C:52:82:1A:9B:07', '#34d399', 3.0); mac.position.set(2.6, 1.0, -1.3); mac.visible = false; g.add(mac);
    const pk2 = packets(g, 4, 0x34d399, 0.5);
    const lf = mkLabel('Firmware', '#fff', 1.3); lf.position.set(2.6, 0.7, -1.9); g.add(lf);
    const cg = mkGlow(0x34d399, 2.2, 0); cg.position.set(0.4, 0.5, 0); g.add(cg);
    return (t) => {
      fl.material.opacity = t < 0.4 ? 0 : 0.5 + 0.4 * Math.sin(t * 5);
      runPackets(pk, curve, t, 2.6, 0.35, 5.5);
      mac.visible = t > 5.5; mac.position.y = 1.0 + 0.05 * Math.sin(t * 3);
      runPackets(pk2, curve, t, 5.5, 0.3, 8.5);
      cg.material.opacity = t > 8.5 ? 0.5 + 0.2 * Math.sin(t * 4) : 0;
    };
  }
};

/* ---- Alimentation : 12 V → tension de la puce ---- */
ACT.alim = {
  title: 'Régulateurs et condensateurs', cam: { look: [2.0, 0.2, 1.2], dist: 7.5, dir: [0.5, 0.85, 0.75] },
  steps: [
    [0, 'Tension du bus', 'Le slot PCIe apporte 12 V et 3,3 V à la carte.'],
    [3, 'Régulation', 'Les régulateurs abaissent la tension et les condensateurs lissent les à-coups.'],
    [6.5, 'Tension de la puce', 'La puce reçoit environ 1 V, propre et stable : indispensable pour des signaux haute vitesse fiables.']
  ],
  build(g) {
    const A = polyCurve([[1.9, 2.3], [2.4, 1.7], [2.8, 1.1]], 0.2), B = polyCurve([[2.6, 0.5], [1.7, 0.3], [1.2, 0.1]], 0.2);
    const r = packets(g, 6, 0xf87171, 0.5), b = packets(g, 6, 0x7dd3fc, 0.3);
    const l1 = mkLabel('12 V · 3,3 V', '#f87171', 1.7); l1.position.set(1.4, 0.9, 2.3); g.add(l1);
    const l2 = mkLabel('Régulateurs', '#fbbf24', 1.6); l2.position.set(2.8, 1.1, 0.7); g.add(l2);
    const l3 = mkLabel('≈ 1 V', '#7dd3fc', 1.0); l3.position.set(1.6, 0.8, 0.4); g.add(l3);
    const cg = mkGlow(0xfbbf24, 2.2, 0); cg.position.set(2.8, 0.4, 0.7); g.add(cg);
    return (t) => {
      runPackets(r, A, t, 0, 0.3);
      cg.material.opacity = t > 3 ? 0.45 + 0.25 * Math.sin(t * 4) : 0;
      runPackets(b, B, t, 3, 0.4);
      l2.visible = t > 3; l3.visible = t > 6.5;
    };
  }
};

/* ---- Pistes : paires différentielles ---- */
ACT.pistes = {
  title: 'Pistes différentielles', cam: { look: [-1.6, 0.1, 0], dist: 7, dir: [0.2, 1, 0.45] },
  steps: [
    [0, 'Deux fils par voie', 'Chaque signal circule sur une paire de pistes : une piste + et une piste −.'],
    [3, 'Signaux opposés', 'Les deux pistes portent des signaux inverses. Le récepteur ne regarde que leur différence.'],
    [6.5, 'Le bruit s’annule', 'Un parasite touche les deux pistes de la même façon : il disparaît dans la différence. D’où des débits très élevés.']
  ],
  build(g) {
    const sets = [];
    [0, 1].forEach((pi) => { const crv = [-1, 1].map((k) => polyCurve(PATHS[pi].pts.map(([x, z]) => [x + PATHS[pi].off[0] * k * 0.1, z + PATHS[pi].off[1] * k * 0.1]), 0.17)); sets.push([crv[0], packets(g, 5, 0xf87171, 0.4)]); sets.push([crv[1], packets(g, 5, 0x7dd3fc, 0.4)]); });
    const lp = mkLabel('Piste +', '#f87171', 1.1); lp.position.set(-2.4, 0.9, -1.3); g.add(lp);
    const lm = mkLabel('Piste −', '#7dd3fc', 1.1); lm.position.set(-2.4, 0.9, -0.3); g.add(lm);
    const noise = mkLabel('Parasite', '#fbbf24', 1.2); noise.position.set(-1.1, 1.1, -0.4); noise.visible = false; g.add(noise);
    return (t) => {
      sets.forEach(([c, p]) => runPackets(p, c, t, 0, 0.28));
      noise.visible = t > 6.5; noise.scale.x = 1.2 * (1 + 0.1 * Math.sin(t * 9));
    };
  }
};

/* ---- LED : diagnostic ---- */
ACT.leds = {
  title: 'Voyants LED', cam: { look: [-4.3, 1.1, -0.8], dist: 5.2, dir: [-1, 0.35, 0.7] },
  steps: [
    [0, 'Pas de lien', 'Câble débranché : les deux voyants sont éteints. Premier réflexe : vérifier le câble et le port.'],
    [2.6, 'Lien établi', 'Câble branché : la LED « lien » (verte) s’allume, fixe.'],
    [5.2, 'Activité', 'La LED « activité » (orange) clignote à chaque passage de trafic.'],
    [8.4, 'Diagnostic', 'Lien éteint malgré le câble ? Tester un autre câble, un autre port, puis vérifier le pilote.']
  ],
  build(g, S) {
    const hA = mkGlow(0x34d399, 0.9, 0); hA.position.set(-4.25, 1.25, -1.2); g.add(hA);
    const hB = mkGlow(0xfbbf24, 0.9, 0); hB.position.set(-4.25, 1.25, -0.4); g.add(hB);
    const lA = mkLabel('LED lien', '#34d399', 1.2); lA.position.set(-4.9, 1.75, -1.2); g.add(lA);
    const lB = mkLabel('LED activité', '#fbbf24', 1.5); lB.position.set(-4.9, 1.75, -0.2); g.add(lB);
    S.ledHold = true;
    return (t) => {
      const link = t > 2.6 && t < 8.4, act_ = t > 5.2 && t < 8.4;
      S.ledA = link ? 1.6 : 0.03; S.ledB = act_ ? (Math.sin(t * 13) > 0.1 ? 2 : 0.2) : 0.03;
      hA.material.opacity = link ? 0.8 + 0.15 * Math.sin(t * 3) : 0; hB.material.opacity = act_ ? (Math.sin(t * 13) > 0.1 ? 0.9 : 0.1) : 0;
    };
  }
};

/* ---- Exécution ---- */
const ACT_SPEED = 1.9;
let act = null;
const actCap = $('actcap');
function actStop() {
  if (!act) return;
  scene.remove(act.g);
  act.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map && o.material.map !== gtex) o.material.map.dispose(); o.material.dispose(); } });
  flowOn = act.flowOn; $('bFlow').classList.toggle('on', flowOn);
  act = null;
  actCap.classList.remove('show');
  document.querySelectorAll('#acts button').forEach((b) => b.classList.remove('on'));
  document.body.classList.remove('acting');
}
function actStart(id) {
  if (quiz) return;
  const D = ACT[id]; if (!D) return;
  const prevFlow = act ? act.flowOn : flowOn;
  actStop(); stopTour();
  explodeGoal = 0; $('bExplode').classList.remove('on');
  select(id);
  flyTo({ look: D.cam.look, dir: D.cam.dir, dist: D.cam.dist * 1.75 });
  const g = new THREE.Group(); scene.add(g);
  const S = {};
  const upd = D.build(g, S);
  act = { id, D, g, upd, S, t0: performance.now() / 1000, step: -1, flowOn: prevFlow };
  flowOn = false; $('bFlow').classList.remove('on');
  document.querySelectorAll('#acts button').forEach((b) => b.classList.toggle('on', b.dataset.act === id));
  document.body.classList.add('acting');
  actCap.classList.add('show');
}
function actTick(t) {
  if (!act) return;
  const tt = Math.max(0, t - act.t0) * ACT_SPEED;
  act.upd(tt, act.S);
  if (act.S.ledHold) { setLive(ledA, act.S.ledA); setLive(ledB, act.S.ledB); }
  let k = 0; act.D.steps.forEach((s, i) => { if (tt >= s[0]) k = i; });
  if (k !== act.step) {
    act.step = k;
    actCap.querySelector('.ac-h').textContent = '⚡ ACTION · ' + act.D.title.toUpperCase();
    actCap.querySelector('.ac-n').textContent = 'Étape ' + (k + 1) + ' / ' + act.D.steps.length;
    const list = actCap.querySelector('.ac-list');
    list.innerHTML = act.D.steps.slice(0, k + 1).map((s, i) => '<div class="st' + (i === k ? ' cur' : '') + '"><b>' + (i + 1) + ' · ' + s[1] + '</b><span>' + s[2] + '</span></div>').join('');
    list.scrollTop = list.scrollHeight;
  }
}
function actReplay() { if (act) { const id = act.id; actStart(id); } }
$('acReplay').onclick = actReplay;
$('acClose').onclick = () => { actStop(); };
const ACT_LIST = [['rj45', 'RJ45'], ['sfp', 'SFP+'], ['controleur', 'Contrôleur'], ['dissipateur', 'Dissipateur'], ['pcie', 'PCIe'], ['firmware', 'Firmware'], ['alim', 'Alimentation'], ['pistes', 'Pistes'], ['leds', 'LED']];
ACT_LIST.forEach(([id, nm]) => {
  const b = document.createElement('button'); b.dataset.act = id; b.textContent = 'Action ' + nm;
  b.title = 'Voir ' + nm + ' en fonctionnement';
  b.onclick = () => (act && act.id === id ? actStop() : actStart(id));
  $('acts').appendChild(b);
});
detailEl.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) actStart(b.dataset.act); });

/* API pour le parcours guidé */
window.SITE = {
  select, deselect, selectFlow, setMode, goHome, actStart, actStop,
  actSeek: (s) => { if (act) act.t0 = performance.now() / 1000 - s; },
  explode: (on) => { if (!!explodeGoal !== !!on) $('bExplode').click(); },
  quiz: (on) => { if (!!quiz !== !!on) $('bQuiz').click(); },
  reset() { actStop(); if (quiz) $('bQuiz').click(); stopTour(); explodeGoal = 0; $('bExplode').classList.remove('on'); setFlow(-1); deselect(); setMode('3d'); goHome(); controls.autoRotate = true; controls.enabled = true; },
  cam: () => ({ p: camera.position.toArray(), t: controls.target.toArray(), goal: !!goal, en: controls.enabled, ar: controls.autoRotate, quiz: !!quiz }),
  get mode() { return mode; }
};

