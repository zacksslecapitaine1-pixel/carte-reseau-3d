/* Autres appareils : où se cache la « carte réseau » dans un téléphone, une voiture, une console… (option) */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const COMMON = 'Même rôle que la carte réseau d’un ordinateur : mettre les données en trames, leur donner une adresse MAC et les envoyer sur le réseau (couches 1 et 2). Seule la forme change.';
const AMB = 0xfbbf24, CY = 0x38bdf8;
const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.5, metalness: 0.25 }, o));
const put = (p, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); p.add(o); return o; };
const box = (p, w, h, d, x, y, z, c, o) => put(p, new THREE.BoxGeometry(w, h, d), mat(c, o), x, y, z);
const cyl = (p, r, h, x, y, z, c, o) => put(p, new THREE.CylinderGeometry(r, r, h, 32), mat(c, o), x, y, z);
function rrect(w, h, r, d) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -d / 2); return g;
}

/* Fabrique de scène : H.shell = boîtier transparent, H.in = pièce interne, H.part = pièce expliquée */
function maker(g) {
  const shells = [], parts = [];
  const H = {
    shell(geo, x, y, z, c = 0x9fb0cc, rot) {
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.4, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
      m.position.set(x, y, z); if (rot) m.rotation.set(...rot); g.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: CY, transparent: true, opacity: 0.55 }));
      e.position.copy(m.position); e.rotation.copy(m.rotation); g.add(e); shells.push({ m, e }); return m;
    },
    box: (w, h, d, x, y, z, c, o) => box(g, w, h, d, x, y, z, c, o),
    cyl: (r, h, x, y, z, c, o) => cyl(g, r, h, x, y, z, c, o),
    part(name, text, meshes, label, net = false) {
      const p = { id: parts.length, name, text, meshes: [].concat(meshes), label, net }; p.meshes.forEach(m => { m.userData.part = p; m.material = m.material.clone(); m.material.emissive = new THREE.Color(net ? AMB : 0x000000); m.material.emissiveIntensity = net ? 0.45 : 0; m.userData.base = net ? 0.45 : 0; });
      parts.push(p); return p;
    },
    board(w, d, x, y, z, rot) { const b = box(g, w, 0.05, d, x, y, z, 0x14634a, { roughness: 0.6 }); if (rot) b.rotation.set(...rot); return b; },
  };
  return { H, shells, parts };
}

/* ---------- Appareils ---------- */
const DEVICES = [
  { id: 'phone', e: '📱', name: 'Téléphone', tag: 'Pas de carte : une puce Wi‑Fi/Bluetooth et un modem 4G/5G soudés sur la carte mère.',
    where: 'Puce « combo » Wi‑Fi + Bluetooth, modem mobile et antennes dans le cadre.', net: 'Wi‑Fi, Bluetooth, 4G/5G', form: 'Puces soudées (aucune carte amovible)',
    build(H) {
      H.shell(rrect(1.7, 3.4, 0.25, 0.3), 0, 0, 0, 0xaec3e8);
      const b1 = H.box(1.35, 2.2, 0.05, 0, 0.5, -0.05, 0x14634a);
      const soc = H.box(0.5, 0.5, 0.07, 0.0, 1.0, -0.1, 0x222a3b);
      const wifi = H.box(0.34, 0.26, 0.06, -0.35, 0.45, -0.1, 0x303a52);
      const bat = H.box(1.2, 1.1, 0.12, 0, -0.75, -0.04, 0x44516e);
      const ant = [H.box(1.5, 0.05, 0.06, 0, 1.6, 0, 0xd6dbe8), H.box(1.5, 0.05, 0.06, 0, -1.6, 0, 0xd6dbe8), H.box(0.05, 1.2, 0.06, 0.78, 0.2, 0, 0xd6dbe8)];
      const sim = H.box(0.4, 0.3, 0.05, 0.4, 0.45, -0.1, 0xb8863b);
      H.part('Puce Wi‑Fi + Bluetooth', 'Une seule petite puce gère souvent le Wi‑Fi et le Bluetooth : c’est le « contrôleur réseau » du téléphone.', wifi, [-0.35, 0.45, 0.1], true);
      H.part('Modem 4G / 5G', 'Intégré au processeur ou placé à côté, il parle au réseau mobile de l’opérateur. Il utilise la carte SIM.', soc, [0, 1.0, 0.1], true);
      H.part('Antennes dans le cadre', 'Des fines bandes métalliques le long du cadre envoient et reçoivent les ondes radio.', ant, [0, 1.6, 0.15]);
      H.part('Carte SIM', 'Elle identifie l’abonné auprès de l’opérateur (équivalent mobile de l’adresse du réseau).', sim, [0.4, 0.45, 0.1]);
      H.part('Batterie', 'La plus grosse pièce : elle alimente aussi les puces réseau.', bat, [0, -0.75, 0.15]);
      return { kind: 'wifi', from: [-0.35, 0.45, 0.2], steps: [['Applications', 'L’application demande d’envoyer un message.'], ['Puce Wi‑Fi', 'La puce transforme les données en trames puis en signal radio.'], ['Antenne', 'L’antenne du cadre envoie l’onde dans l’air.'], ['Point d’accès', 'La box ou l’antenne de l’opérateur reçoit le signal.']] };
    } },
  { id: 'tablet', e: '📲', name: 'Tablette', tag: 'Comme un grand téléphone : puces Wi‑Fi/Bluetooth (et 4G/5G selon le modèle).',
    where: 'Puce Wi‑Fi/Bluetooth sur la carte mère, antennes dans le cadre ; modem mobile en option.', net: 'Wi‑Fi, Bluetooth, 4G/5G (option)', form: 'Puces soudées',
    build(H) {
      H.shell(rrect(3.4, 4.4, 0.3, 0.3), 0, 0, 0, 0xaec3e8);
      H.box(2.2, 1.6, 0.05, 0.4, 1.3, -0.05, 0x14634a);
      const wifi = H.box(0.5, 0.35, 0.06, 0.2, 1.4, -0.1, 0x303a52);
      const soc = H.box(0.7, 0.7, 0.07, 0.9, 1.5, -0.1, 0x222a3b);
      const bat = H.box(2.9, 1.9, 0.12, 0, -0.9, -0.04, 0x44516e);
      const ant = [H.box(3.0, 0.06, 0.06, 0, 2.05, 0, 0xd6dbe8), H.box(0.06, 3.2, 0.06, -1.6, 0, 0, 0xd6dbe8)];
      H.part('Puce Wi‑Fi + Bluetooth', 'Même principe que le téléphone, avec plus de place pour de meilleures antennes.', wifi, [0.2, 1.4, 0.1], true);
      H.part('Processeur (et modem)', 'Sur les modèles « cellulaires », il contient aussi le modem 4G/5G.', soc, [0.9, 1.5, 0.1], true);
      H.part('Antennes dans le cadre', 'Elles longent les bords de l’écran.', ant, [0, 2.05, 0.15]);
      H.part('Batterie', 'Très grande : elle occupe la moitié de l’appareil.', bat, [0, -0.9, 0.15]);
      return { kind: 'wifi', from: [0.2, 1.4, 0.2], steps: [['Application', 'Une vidéo en ligne est demandée.'], ['Puce Wi‑Fi', 'Elle fabrique les trames et le signal radio.'], ['Antenne', 'Le signal part vers la box.'], ['Box', 'La box le reçoit et le renvoie vers Internet.']] };
    } },
  { id: 'watch', e: '⌚', name: 'Montre connectée', tag: 'Une minuscule puce Bluetooth (parfois Wi‑Fi ou 4G) et une antenne dans le boîtier.',
    where: 'Puce Bluetooth sur la mini carte mère, antenne placée autour du cadran.', net: 'Bluetooth (+ Wi‑Fi ou 4G selon le modèle)', form: 'Puce soudée',
    build(H) {
      H.shell(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 40), 0, 0, 0, 0xaec3e8, [Math.PI / 2, 0, 0]);
      H.shell(new THREE.BoxGeometry(0.9, 1.6, 0.25), 0, 1.9, -0.1, 0xaec3e8); H.shell(new THREE.BoxGeometry(0.9, 1.6, 0.25), 0, -1.9, -0.1, 0xaec3e8);
      const board = cyl(H.g, 0.8, 0.05, 0, 0, -0.05, 0x14634a); board.rotation.x = Math.PI / 2;
      const ble = H.box(0.38, 0.3, 0.06, -0.2, 0.2, 0.0, 0x303a52);
      const bat = cyl(H.g, 0.55, 0.1, 0, -0.1, -0.18, 0x44516e); bat.rotation.x = Math.PI / 2;
      const ring = put(H.g, new THREE.TorusGeometry(0.95, 0.025, 8, 48), mat(0xd6dbe8)); ring.position.z = -0.02;
      const sens = H.box(0.3, 0.3, 0.05, 0.35, -0.35, 0, 0xb8863b);
      H.part('Puce Bluetooth', 'Elle relie la montre au téléphone. Certains modèles ajoutent le Wi‑Fi ou une eSIM 4G.', ble, [-0.2, 0.2, 0.15], true);
      H.part('Antenne', 'Un anneau métallique près du bord capte et émet les ondes.', ring, [0.8, 0.5, 0.1]);
      H.part('Capteurs', 'Cœur, mouvement : leurs données partent ensuite par Bluetooth.', sens, [0.35, -0.35, 0.1]);
      H.part('Batterie', 'Minuscule : le Bluetooth basse consommation est choisi pour économiser l’énergie.', bat, [0, -0.1, 0.0]);
      return { kind: 'wifi', from: [-0.2, 0.2, 0.2], steps: [['Capteurs', 'La montre mesure votre rythme cardiaque.'], ['Puce Bluetooth', 'Elle met la mesure en trame radio.'], ['Antenne', 'Le signal part, sur quelques mètres seulement.'], ['Téléphone', 'Le téléphone reçoit la mesure et l’affiche.']] };
    } },
  { id: 'laptop', e: '💻', name: 'Ordinateur portable', tag: 'Une vraie petite carte Wi‑Fi (format M.2) avec deux fils vers des antennes, et une puce Ethernet.',
    where: 'Carte Wi‑Fi M.2 vissée sur la carte mère, fils d’antenne dans l’écran, puce Ethernet près du port RJ45.', net: 'Wi‑Fi, Bluetooth, Ethernet', form: 'Carte M.2 amovible + puce Ethernet',
    build(H) {
      H.shell(new THREE.BoxGeometry(4, 0.25, 2.8), 0, 0, 0, 0xaec3e8);
      const scr = H.shell(new THREE.BoxGeometry(4, 2.6, 0.12), 0, 1.4, -1.4, 0xaec3e8); scr.rotation.x = -0.15;
      H.box(3.4, 0.05, 2.3, 0, -0.05, 0, 0x14634a);
      const wifi = H.box(0.9, 0.06, 0.35, -0.6, 0.0, 0.2, 0xd9a441);
      const eth = H.box(0.45, 0.06, 0.45, 1.3, 0.0, 0.7, 0x303a52);
      const rj = H.box(0.6, 0.2, 0.5, 1.7, 0.0, 0.8, 0x9aa5b8);
      const bat = H.box(2.2, 0.12, 0.8, 0, -0.1, 0.95, 0x44516e);
      const fan = cyl(H.g, 0.4, 0.1, 0.9, 0.0, -0.5, 0x222a3b);
      const c1 = box(H.g, 0.04, 0.04, 1.8, -1.1, 0.35, -0.7, 0xff7a59), c2 = box(H.g, 0.04, 0.04, 1.8, -0.9, 0.35, -0.7, 0x38bdf8);
      const ant = [H.box(0.25, 0.1, 0.06, -1.7, 2.4, -1.45, 0xd6dbe8), H.box(0.25, 0.1, 0.06, 1.7, 2.4, -1.45, 0xd6dbe8)];
      H.part('Carte Wi‑Fi (M.2)', 'Petite carte rectangulaire, amovible : c’est la « vraie » carte réseau sans fil de l’ordinateur.', wifi, [-0.6, 0.15, 0.2], true);
      H.part('Fils d’antenne', 'Deux fils fins montent dans l’écran jusqu’aux antennes.', [c1, c2], [-1.0, 0.4, -0.7]);
      H.part('Antennes dans l’écran', 'Placées en haut de l’écran pour mieux capter.', ant, [1.7, 2.4, -1.3]);
      H.part('Puce Ethernet + port RJ45', 'Pour le câble : une puce soudée à la carte mère, reliée au port sur le côté.', [eth, rj], [1.5, 0.15, 0.75], true);
      H.part('Ventilateur', 'Il refroidit le processeur, pas le réseau.', fan, [0.9, 0.15, -0.5]);
      H.part('Batterie', 'Elle alimente tout, y compris la carte Wi‑Fi.', bat, [0, 0.0, 0.95]);
      return { kind: 'wifi', from: [-0.6, 0.15, 0.2], steps: [['Système', 'Le navigateur demande une page.'], ['Carte Wi‑Fi', 'Elle fabrique les trames et le signal.'], ['Antennes', 'Les antennes de l’écran émettent.'], ['Routeur', 'Le routeur reçoit puis relaie.']] };
    } },
  { id: 'desktop', e: '🖥️', name: 'Ordinateur de bureau', tag: 'Soit la carte PCIe vue sur le site, soit une puce intégrée près du port RJ45.',
    where: 'Carte réseau PCIe dans un slot, ou puce Ethernet intégrée à la carte mère, à côté des ports à l’arrière.', net: 'Ethernet (+ Wi‑Fi en option)', form: 'Carte PCIe amovible ou puce intégrée',
    build(H) {
      H.shell(new THREE.BoxGeometry(2, 3.6, 3.4), 0, 0, 0, 0xaec3e8);
      H.box(0.06, 3.2, 3.0, -0.7, 0, 0, 0x14634a);
      const eth = H.box(0.1, 0.4, 0.4, -0.62, 0.9, 1.1, 0x303a52);
      const io = H.box(0.3, 0.5, 0.6, -0.55, 1.0, 1.4, 0x9aa5b8);
      const nic = H.box(0.08, 0.5, 1.5, -0.62, -0.1, 0.5, 0xd9a441);
      const brk = H.box(0.3, 0.7, 0.05, -0.5, -0.1, 1.3, 0xb7bfcc);
      const gpu = H.box(0.3, 0.7, 2.2, -0.45, -0.9, 0.2, 0x303a52);
      const cpu = H.box(0.5, 0.7, 0.7, -0.5, 0.5, -0.4, 0x8a93a8);
      const psu = H.box(1.4, 0.9, 1.6, 0.2, -1.35, -0.9, 0x44516e);
      H.part('Carte réseau PCIe', 'Carte amovible enfichée dans un slot PCIe : c’est celle que nous avons étudiée en 3D.', [nic, brk], [-0.6, -0.1, 0.5], true);
      H.part('Puce Ethernet intégrée', 'Sur beaucoup de cartes mères, une puce Ethernet est soudée et remplace la carte.', eth, [-0.6, 0.9, 1.1], true);
      H.part('Ports à l’arrière', 'Le port RJ45 est relié à la puce Ethernet intégrée.', io, [-0.5, 1.0, 1.4]);
      H.part('Carte graphique', 'À ne pas confondre avec la carte réseau : elle gère l’image.', gpu, [-0.4, -0.9, 0.2]);
      H.part('Processeur', 'Il prépare les données avant qu’elles passent à la carte réseau.', cpu, [-0.5, 0.5, -0.4]);
      H.part('Alimentation', 'Elle fournit le courant à toutes les cartes.', psu, [0.2, -1.35, -0.9]);
      return { kind: 'wire', path: [[-0.6, -0.1, 1.3], [-0.6, -0.1, 2.0], [0.2, -0.1, 2.8], [1.6, -0.1, 3.6]], steps: [['Processeur', 'Les données sont préparées.'], ['Carte réseau', 'La carte les transforme en signaux électriques.'], ['Câble', 'Les signaux sortent par le port RJ45.'], ['Switch', 'Le commutateur du réseau les dirige.']] };
    } },
  { id: 'printer', e: '🖨️', name: 'Imprimante', tag: 'Un petit module Wi‑Fi/Ethernet sur sa carte électronique.',
    where: 'Module réseau sur la carte de contrôle, port Ethernet et antenne Wi‑Fi à l’arrière.', net: 'Wi‑Fi, Ethernet, (Wi‑Fi Direct)', form: 'Module soudé ou enfiché',
    build(H) {
      H.shell(new THREE.BoxGeometry(4, 1.6, 3), 0, 0, 0, 0xaec3e8);
      H.box(3.6, 0.04, 0.4, 0, -0.2, 1.1, 0x44516e);
      const ctl = H.box(1.4, 0.05, 1.0, 1.0, 0.1, 0.3, 0x14634a);
      const mod = H.box(0.6, 0.08, 0.35, 1.2, 0.17, 0.3, 0xd9a441);
      const rj = H.box(0.55, 0.3, 0.5, 1.7, 0.1, -1.3, 0x9aa5b8);
      const ant = H.box(0.1, 0.5, 0.1, 1.2, 0.3, -1.45, 0xd6dbe8);
      const ink = H.box(0.9, 0.3, 0.6, -1.2, 0.2, -0.1, 0x6d4aa6);
      const roll = cyl(H.g, 0.18, 3.2, 0, 0.1, 0.9, 0x222a3b); roll.rotation.z = Math.PI / 2;
      H.part('Module Wi‑Fi / Ethernet', 'Un petit module soudé à la carte de contrôle permet d’imprimer depuis le réseau.', mod, [1.2, 0.3, 0.3], true);
      H.part('Port Ethernet', 'Pour brancher l’imprimante directement à la box ou au switch.', rj, [1.7, 0.3, -1.3], true);
      H.part('Antenne Wi‑Fi', 'Souvent une antenne imprimée sur la carte, parfois une petite tige.', ant, [1.2, 0.6, -1.45]);
      H.part('Carte de contrôle', 'Elle commande la tête d’impression et reçoit les travaux.', ctl, [1.0, 0.3, 0.3]);
      H.part('Cartouches', 'Réservoirs d’encre : sans rapport avec le réseau.', ink, [-1.2, 0.4, -0.1]);
      H.part('Rouleau d’entraînement', 'Il fait avancer la feuille.', roll, [0, 0.3, 0.9]);
      return { kind: 'wifi', from: [1.2, 0.3, 0.3], steps: [['Ordinateur', 'Vous envoyez un document à imprimer.'], ['Réseau', 'Il arrive à l’imprimante par Wi‑Fi ou câble.'], ['Module réseau', 'Il remet les trames en données.'], ['Impression', 'La carte de contrôle lance l’impression.']] };
    } },
  { id: 'router', e: '📶', name: 'Box / routeur', tag: 'Plusieurs ports : une puce de commutation joue le rôle de plusieurs cartes réseau.',
    where: 'Puce « switch » reliée aux ports LAN, puce Wi‑Fi et modem de la ligne (fibre ou ADSL).', net: 'Ethernet (4 ports), Wi‑Fi, fibre/ADSL', form: 'Puces soudées sur une carte unique',
    build(H) {
      H.shell(new THREE.BoxGeometry(3.4, 0.8, 2.2), 0, 0, 0, 0xaec3e8);
      H.box(3.0, 0.04, 1.8, 0, -0.2, 0, 0x14634a);
      const sw = H.box(0.6, 0.1, 0.6, 0.2, -0.1, 0.1, 0x303a52);
      const wf = H.box(0.5, 0.1, 0.5, -0.8, -0.1, -0.3, 0xd9a441);
      const modem = H.box(0.6, 0.1, 0.5, -1.0, -0.1, 0.5, 0x222a3b);
      const ports = []; for (let i = 0; i < 4; i++) ports.push(H.box(0.4, 0.25, 0.35, 1.5, -0.1, -0.8 + i * 0.5, 0x9aa5b8));
      const ants = [cyl(H.g, 0.05, 1.6, -1.4, 1.1, -0.9, 0xd6dbe8), cyl(H.g, 0.05, 1.6, 1.4, 1.1, -0.9, 0xd6dbe8)];
      const leds = []; for (let i = 0; i < 5; i++) leds.push(H.box(0.12, 0.05, 0.05, -0.6 + i * 0.3, 0.2, 1.1, i % 2 ? 0x34d399 : 0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.5 }));
      H.part('Puce switch', 'Elle dirige les trames entre les 4 ports : c’est plusieurs cartes réseau en une.', sw, [0.2, 0.0, 0.1], true);
      H.part('Puce Wi‑Fi', 'Elle gère le Wi‑Fi de la maison, avec ses antennes.', wf, [-0.8, 0.0, -0.3], true);
      H.part('Modem de la ligne', 'Il parle à la fibre optique ou à la ligne ADSL de l’opérateur.', modem, [-1.0, 0.0, 0.5], true);
      H.part('Ports Ethernet (LAN)', 'Quatre prises RJ45 pour brancher ordinateurs, console, imprimante.', ports, [1.5, 0.1, -0.2]);
      H.part('Antennes', 'Elles diffusent le Wi‑Fi dans la maison.', ants, [-1.4, 1.9, -0.9]);
      H.part('Voyants', 'Les LED montrent le lien et l’activité, comme sur une carte réseau.', leds, [0, 0.35, 1.1]);
      return { kind: 'wire', path: [[1.5, -0.1, -0.3], [0.2, -0.1, 0.1], [-1.0, -0.1, 0.5], [-3.2, -0.1, 0.8]], steps: [['Port LAN', 'Un ordinateur branché envoie ses trames.'], ['Puce switch', 'Elle lit l’adresse MAC et choisit la sortie.'], ['Modem', 'Le modem convertit pour la ligne de l’opérateur.'], ['Internet', 'Les données partent vers Internet.']] };
    } },
  { id: 'server', e: '🗄️', name: 'Serveur', tag: 'Des cartes très rapides (SFP+, 25 ou 100 Gbit/s) et parfois des SmartNIC.',
    where: 'Carte réseau PCIe à l’arrière, avec cages SFP+ pour la fibre ; SmartNIC/DPU dans les grands centres de données.', net: 'Ethernet 10/25/100 Gbit/s, fibre SFP+', form: 'Carte PCIe amovible (souvent 2 cartes)',
    build(H) {
      H.shell(new THREE.BoxGeometry(4.2, 0.7, 3.2), 0, 0, 0, 0xaec3e8);
      H.box(3.8, 0.04, 2.8, 0, -0.25, 0, 0x14634a);
      const nic = H.box(0.9, 0.06, 0.5, 1.5, -0.1, 0.9, 0xd9a441);
      const sfp = [H.box(0.22, 0.18, 0.3, 1.9, -0.05, 1.35, 0x9aa5b8), H.box(0.22, 0.18, 0.3, 1.9, -0.05, 1.05, 0x9aa5b8)];
      const cpu = [H.box(0.7, 0.35, 0.7, -0.4, -0.05, 0.1, 0x8a93a8), H.box(0.7, 0.35, 0.7, 0.8, -0.05, 0.1, 0x8a93a8)];
      const ram = []; for (let i = 0; i < 4; i++) ram.push(H.box(0.06, 0.3, 0.9, -1.4 + i * 0.12, -0.05, 0.1, 0x303a52));
      const fans = []; for (let i = 0; i < 3; i++) fans.push(cyl(H.g, 0.28, 0.2, -1.6 + i * 0.7, -0.05, -1.1, 0x222a3b));
      const psu = H.box(1.0, 0.45, 0.7, -1.5, -0.05, 1.05, 0x44516e);
      H.part('Carte réseau SFP+', 'Carte PCIe à deux cages : on y enfiche des modules de fibre optique de 10 à 100 Gbit/s.', [nic], [1.5, 0.15, 0.9], true);
      H.part('Cages SFP+ (fibre)', 'Chaque cage reçoit un petit module qui convertit les signaux électriques en lumière.', sfp, [1.9, 0.15, 1.2], true);
      H.part('Deux processeurs', 'Ils préparent les données avant la carte réseau.', cpu, [0.2, 0.3, 0.1]);
      H.part('Mémoire', 'Là où le DMA de la carte écrit les données reçues.', ram, [-1.2, 0.2, 0.1]);
      H.part('Ventilateurs', 'Rangée de ventilateurs : un serveur chauffe beaucoup.', fans, [-0.6, 0.2, -1.1]);
      H.part('Alimentation', 'Souvent doublée pour ne jamais s’éteindre.', psu, [-1.5, 0.2, 1.05]);
      return { kind: 'wire', path: [[1.9, -0.05, 1.3], [2.4, -0.05, 2.0], [3.6, -0.05, 2.6], [5.0, -0.05, 3.0]], steps: [['Mémoire', 'Les données à envoyer sont prêtes.'], ['Carte SFP+', 'Elle les prend par DMA et fabrique les trames.'], ['Module fibre', 'Il transforme l’électrique en lumière.'], ['Réseau du centre', 'La fibre les emporte vers les autres serveurs.']] };
    } },
  { id: 'iot', e: '💡', name: 'Objet connecté', tag: 'Un module Wi‑Fi de la taille d’un timbre (type ESP32) avec une antenne imprimée.',
    where: 'Module radio minuscule sur la carte de l’objet, avec une antenne dessinée directement sur le circuit.', net: 'Wi‑Fi (parfois Bluetooth, Zigbee)', form: 'Module soudé',
    build(H) {
      H.shell(new THREE.SphereGeometry(1.4, 32, 24), 0, 1.0, 0, 0xaec3e8); H.shell(new THREE.CylinderGeometry(0.8, 0.9, 1.4, 24), 0, -0.8, 0, 0xaec3e8);
      const board = cyl(H.g, 0.7, 0.05, 0, -0.5, 0, 0x14634a);
      const mod = H.box(0.55, 0.08, 0.4, -0.2, -0.45, 0, 0xd9a441);
      const pts = []; for (let i = 0; i < 6; i++) { pts.push(new THREE.Vector3(0.1 + i * 0.1, -0.42, i % 2 ? 0.12 : -0.12)); }
      const ant = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff })); ant.material.emissive = new THREE.Color(0xffffff); H.g.add(ant);
      const antm = H.box(0.65, 0.04, 0.3, 0.45, -0.45, 0, 0x2b8f6f);
      const leds = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; leds.push(H.box(0.12, 0.12, 0.12, Math.cos(a) * 0.7, 0.9, Math.sin(a) * 0.7, 0xfff1b0, { emissive: 0xffe08a, emissiveIntensity: 0.9 })); }
      const drv = H.box(0.4, 0.3, 0.3, 0.0, -1.2, 0, 0x44516e);
      H.part('Module Wi‑Fi (type ESP32)', 'Une puce + sa mémoire dans un boîtier de quelques millimètres. C’est toute la « carte réseau » de l’objet.', mod, [-0.2, -0.3, 0.1], true);
      H.part('Antenne imprimée', 'Un zigzag de cuivre gravé sur le circuit sert d’antenne.', antm, [0.45, -0.3, 0.1]);
      H.part('LED', 'Ce que l’on commande à distance.', leds, [0, 1.2, 0]);
      H.part('Alimentation', 'Transforme le courant de la maison en tension pour la puce et les LED.', drv, [0, -1.2, 0.2]);
      return { kind: 'wifi', from: [-0.2, -0.3, 0.1], steps: [['Application', 'Vous appuyez sur « allumer » dans l’application.'], ['Box', 'La commande arrive par le Wi‑Fi de la maison.'], ['Module Wi‑Fi', 'Il reçoit la trame et lit la commande.'], ['LED', 'Il allume les LED.']] };
    } },
  { id: 'car', e: '🚗', name: 'Voiture', tag: 'Un boîtier « télématique » avec modem 4G/5G, une antenne sur le toit et un réseau interne.',
    where: 'Boîtier télématique (TCU) avec modem mobile et GPS, antenne « aileron » sur le toit, écran multimédia Wi‑Fi/Bluetooth.', net: '4G/5G, GPS, Wi‑Fi, Bluetooth, Ethernet interne', form: 'Boîtiers électroniques dans le véhicule',
    build(H) {
      H.shell(new THREE.BoxGeometry(5, 0.9, 2), 0, 0.7, 0, 0xaec3e8); H.shell(new THREE.BoxGeometry(2.6, 0.7, 1.8), -0.1, 1.5, 0, 0xaec3e8);
      [[-1.6, -1], [1.6, -1], [-1.6, 1], [1.6, 1]].forEach(w => { const c = cyl(H.g, 0.4, 0.3, w[0], 0.4, w[1], 0x222a3b); c.rotation.x = Math.PI / 2; });
      const fin = put(H.g, new THREE.ConeGeometry(0.22, 0.45, 4), mat(0xd6dbe8), -0.4, 2.05, 0); fin.rotation.z = -0.3;
      const tcu = H.box(0.7, 0.3, 0.8, 0.9, 1.1, 0.0, 0xd9a441);
      const scr = H.box(0.1, 0.5, 0.9, 0.8, 1.5, 0.0, 0x303a52);
      const bat = H.box(0.8, 0.4, 0.6, 2.0, 0.8, 0.0, 0x44516e);
      const w1 = H.box(1.8, 0.05, 0.05, 0.0, 0.62, 0.3, 0x38bdf8), w2 = H.box(0.05, 0.05, 1.0, 0.9, 0.62, 0, 0x38bdf8), w3 = H.box(1.7, 0.05, 0.05, -1.0, 0.62, -0.3, 0xff7a59);
      H.part('Antenne aileron (toit)', 'Une seule antenne rassemble souvent 4G/5G, GPS et radio.', fin, [-0.4, 2.2, 0], false);
      H.part('Boîtier télématique (TCU)', 'Le « modem » de la voiture : appels d’urgence, mises à jour à distance, suivi.', tcu, [0.9, 1.1, 0], true);
      H.part('Écran multimédia', 'Connecte le téléphone en Bluetooth ou Wi‑Fi (Apple CarPlay, Android Auto).', scr, [0.8, 1.5, 0], true);
      H.part('Réseau interne', 'Les calculateurs communiquent par bus CAN et par Ethernet automobile, avec leurs propres contrôleurs réseau.', [w1, w2, w3], [0, 0.65, 0.3]);
      H.part('Batterie', 'Alimente tous les boîtiers.', bat, [2.0, 0.8, 0]);
      return { kind: 'wifi', from: [-0.4, 2.2, 0], steps: [['Capteurs', 'La voiture détecte un événement (ou une mise à jour).'], ['Boîtier TCU', 'Le modem prépare le message pour l’opérateur.'], ['Antenne', 'L’antenne du toit émet vers le réseau mobile.'], ['Constructeur', 'Les serveurs du constructeur répondent.']] };
    } },
  { id: 'console', e: '🎮', name: 'Console de jeu', tag: 'Un module Wi‑Fi/Bluetooth et une puce Ethernet, comme un petit PC.',
    where: 'Module Wi‑Fi + Bluetooth sur la carte mère, puce Ethernet reliée au port RJ45 à l’arrière.', net: 'Ethernet, Wi‑Fi, Bluetooth (manettes)', form: 'Module soudé + puce Ethernet',
    build(H) {
      H.shell(new THREE.BoxGeometry(3.6, 0.9, 2.4), 0, 0, 0, 0xaec3e8);
      H.box(3.2, 0.04, 2.0, 0, -0.3, 0, 0x14634a);
      const soc = H.box(0.9, 0.2, 0.9, 0.2, -0.15, 0.1, 0x222a3b);
      const sink = H.box(1.1, 0.25, 1.1, 0.2, 0.1, 0.1, 0x8a93a8, { transparent: true, opacity: 0.7 });
      const wf = H.box(0.55, 0.08, 0.35, -1.0, -0.22, 0.6, 0xd9a441);
      const eth = H.box(0.4, 0.08, 0.4, 1.2, -0.22, -0.6, 0x303a52);
      const rj = H.box(0.5, 0.3, 0.5, 1.6, -0.1, -0.9, 0x9aa5b8);
      const fan = cyl(H.g, 0.5, 0.1, -1.0, -0.1, -0.5, 0x222a3b);
      const psu = H.box(0.9, 0.4, 0.8, 1.2, -0.1, 0.7, 0x44516e);
      H.part('Module Wi‑Fi + Bluetooth', 'Il relie la console au Wi‑Fi et aux manettes sans fil.', wf, [-1.0, 0.0, 0.6], true);
      H.part('Puce Ethernet', 'Pour le câble : plus stable, très utilisé pour le jeu en ligne.', eth, [1.2, 0.0, -0.6], true);
      H.part('Port RJ45', 'La prise du câble réseau, à l’arrière.', rj, [1.6, 0.15, -0.9]);
      H.part('Processeur graphique et central', 'Calcule le jeu ; la carte réseau lui apporte les données des autres joueurs.', [soc, sink], [0.2, 0.3, 0.1]);
      H.part('Ventilateur', 'Évite que la console ne chauffe.', fan, [-1.0, 0.1, -0.5]);
      H.part('Alimentation', 'Intégrée dans le boîtier.', psu, [1.2, 0.2, 0.7]);
      return { kind: 'wire', path: [[1.6, -0.1, -0.9], [2.3, -0.1, -1.6], [3.2, -0.1, -2.6], [4.4, -0.1, -3.4]], steps: [['Jeu', 'Le jeu envoie votre position.'], ['Puce Ethernet', 'Elle met la position dans une trame.'], ['Câble', 'La trame part par le port RJ45.'], ['Serveur de jeu', 'Le serveur la reçoit et répond avec les autres joueurs.']] };
    } },
];
window.DEVICES_DATA = DEVICES.map(d => ({ id: d.id, name: d.name, where: d.where, net: d.net, form: d.form }));

/* ---------- Interface et rendu ---------- */
let frames = 0, root, canvas, renderer, scene, camera, controls, cur = null, curG = null, curB = null, running = false, sel = null, actOn = false, actT0 = 0, xray = true, fx = null, ray, built = false;
const $ = (s, el = root) => el.querySelector(s);

function ui() {
  root.innerHTML = '<div class="dv"><aside class="dv-list"><h3>Autres appareils</h3><div id="dvBtns"></div><button id="dvCmp" class="dvb">⚖ Comparer</button></aside>' +
    '<div class="dv-main"><canvas id="dvCv"></canvas><div id="dvPins"></div><div class="dv-tools"><button id="dvX" class="dvb on" title="Rendre le boîtier transparent">🩻 Rayons X</button><button id="dvA" class="dvb am">⚡ Action</button></div><div id="dvCap" class="dv-cap" hidden></div>' +
    '<div id="dvCmpBox" class="dv-cmp" hidden></div></div><aside class="dv-info" id="dvInfo"></aside></div>';
  const bt = $('#dvBtns');
  DEVICES.forEach(d => { const b = document.createElement('button'); b.className = 'dvb'; b.dataset.id = d.id; b.innerHTML = '<span>' + d.e + '</span> ' + d.name; b.onclick = () => show(d.id); bt.appendChild(b); });
  $('#dvX').onclick = () => { xray = !xray; $('#dvX').classList.toggle('on', xray); applyXray(); };
  $('#dvA').onclick = () => startAct();
  $('#dvCmp').onclick = () => { const c = $('#dvCmpBox'); c.hidden = !c.hidden; if (!c.hidden) cmp(); };
  canvas = $('#dvCv');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b1220);
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1a2540, 1.1));
  const k = new THREE.DirectionalLight(0xffffff, 1.6); k.position.set(4, 7, 5); scene.add(k);
  const f = new THREE.DirectionalLight(0x6ea8ff, 0.7); f.position.set(-5, 2, -4); scene.add(f);
  const floor = new THREE.GridHelper(14, 28, 0x2a3c66, 0x1b2a4a); floor.position.y = -2.4; scene.add(floor);
  controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.autoRotate = true; controls.autoRotateSpeed = 1.1; controls.minDistance = 3; controls.maxDistance = 16;
  ray = new THREE.Raycaster();
  let dx = 0, dy = 0;
  canvas.addEventListener('pointerdown', e => { dx = e.clientX; dy = e.clientY; controls.autoRotate = false; });
  canvas.addEventListener('pointerup', e => { if (Math.hypot(e.clientX - dx, e.clientY - dy) < 6) pick(e); });
  new ResizeObserver(resize).observe($('.dv-main'));
  built = true;
}
function resize() {
  if (!built) return; const r = $('.dv-main').getBoundingClientRect(); const w = Math.max(100, r.width), h = Math.max(100, r.height);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
function show(id) {
  const d = DEVICES.find(x => x.id === id); if (!d) return;
  stopAct(); sel = null;
  if (curG) { scene.remove(curG); curG.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose && o.material.dispose(); }); }
  curG = new THREE.Group(); const m = maker(curG); m.H.g = curG; const info = d.build(m.H);
  curB = { d, parts: m.parts, shells: m.shells, act: info }; cur = d; scene.add(curG);
  xray = true; $('#dvX').classList.add('on'); applyXray();
  resize();
  const bb = new THREE.Box3().setFromObject(curG), ct = bb.getCenter(new THREE.Vector3()), rad = bb.getSize(new THREE.Vector3()).length() / 2;
  const dist = Math.max(4, rad / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.95);
  controls.target.copy(ct); camera.position.set(ct.x + dist * 0.55, ct.y + dist * 0.38, ct.z + dist * 0.75); controls.autoRotate = true; controls.update();
  [].forEach.call(root.querySelectorAll('#dvBtns .dvb'), b => b.classList.toggle('on', b.dataset.id === id));
  $('#dvCmpBox').hidden = true;
  const I = $('#dvInfo');
  I.innerHTML = '<h2>' + d.e + ' ' + d.name + '</h2><p class="tag">' + d.tag + '</p><div class="where"><b>Où est la carte réseau ?</b><span>' + d.where + '</span></div>' +
    '<div class="dv-meta"><div><b>Réseaux</b>' + d.net + '</div><div><b>Forme</b>' + d.form + '</div></div><h4>Pièces (cliquez sur l’une d’elles)</h4><ol id="dvParts"></ol><div id="dvDet" class="det"><b>Touchez une pièce.</b> Les pièces ambrées sont celles qui font le travail de carte réseau.</div><p class="common">' + COMMON + '</p>';
  const ol = $('#dvParts');
  curB.parts.forEach(p => { const li = document.createElement('li'); li.className = p.net ? 'net' : ''; li.innerHTML = '<button>' + p.name + '</button>'; li.firstChild.onclick = () => select(p); ol.appendChild(li); });
  buildPins();
}
function buildPins() {
  const P = $('#dvPins'); P.innerHTML = '';
  curB.parts.forEach((p, i) => { const e = document.createElement('div'); e.className = 'dv-pin' + (p.net ? ' net' : ''); e.textContent = i + 1; P.appendChild(e); p.pin = e; });
}
function applyXray() {
  if (!curB) return;
  curB.shells.forEach(s => { s.m.material.opacity = xray ? 0.16 : 0.92; s.m.material.depthWrite = !xray; s.e.material.opacity = xray ? 0.55 : 0.25; });
}
function select(p) {
  sel = p;
  curB.parts.forEach(q => { q.meshes.forEach(m => { m.material.emissive.setHex(q === p ? CY : (q.net ? AMB : 0)); m.userData.base = q === p ? 0.9 : (q.net ? 0.45 : 0); m.material.emissiveIntensity = m.userData.base; }); });
  [].forEach.call(root.querySelectorAll('#dvParts li'), (li, i) => li.classList.toggle('on', curB.parts[i] === p));
  $('#dvDet').innerHTML = '<b>' + (p.id + 1) + ' · ' + p.name + '</b>' + p.text;
  controls.autoRotate = false;
}
function pick(e) {
  if (!curB) return; const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const all = []; curB.parts.forEach(p => p.meshes.forEach(m => all.push(m)));
  const h = ray.intersectObjects(all, false)[0]; if (h && h.object.userData.part) select(h.object.userData.part);
}
function cmp() {
  const rows = DEVICES.map(d => '<tr><td>' + d.e + ' <b>' + d.name + '</b></td><td>' + d.where + '</td><td>' + d.net + '</td><td>' + d.form + '</td></tr>').join('');
  $('#dvCmpBox').innerHTML = '<button class="dvb x" id="dvCx">✕ Fermer</button><h3>Comparaison : même fonction, formes différentes</h3><div class="sc"><table><thead><tr><th>Appareil</th><th>Où se trouve la carte réseau</th><th>Réseaux</th><th>Forme</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  $('#dvCx').onclick = () => { $('#dvCmpBox').hidden = true; };
}
/* Action : signal radio ou câble */
function startAct() {
  if (!curB) return; stopAct(); actOn = true; actT0 = performance.now(); controls.autoRotate = false;
  const a = curB.act, g = new THREE.Group(); curG.add(g); fx = { g, kind: a.kind, rings: [], pk: [] };
  if (a.kind === 'wifi') { for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshBasicMaterial({ color: CY, wireframe: true, transparent: true, opacity: 0 })); s.position.set(...a.from); g.add(s); fx.rings.push(s); } }
  else { const pts = a.path.map(p => new THREE.Vector3(...p)); fx.curve = new THREE.CatmullRomCurve3(pts); g.add(new THREE.Mesh(new THREE.TubeGeometry(fx.curve, 40, 0.035, 6), new THREE.MeshBasicMaterial({ color: CY }))); for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: AMB })); g.add(s); fx.pk.push(s); } }
  const c = $('#dvCap'); c.hidden = false; c.innerHTML = '<div class="h">⚡ ACTION · ' + curB.d.name.toUpperCase() + '</div><div id="dvSt"></div>'; fx.k = -1;
}
function stopAct() { actOn = false; if (fx) { curG && curG.remove(fx.g); fx = null; } const c = root && $('#dvCap'); if (c) c.hidden = true; }
function actTick(now) {
  const t = (now - actT0) / 1000, a = curB.act, steps = a.steps, k = Math.min(steps.length - 1, Math.floor(t / 1.6));
  if (k !== fx.k) { fx.k = k; $('#dvSt').innerHTML = steps.slice(0, k + 1).map((s, i) => '<div class="st' + (i === k ? ' cur' : '') + '"><b>' + (i + 1) + ' · ' + s[0] + '</b><span>' + s[1] + '</span></div>').join(''); }
  if (fx.kind === 'wifi') fx.rings.forEach((s, i) => { const u = ((t * 0.7) + i / 3) % 1; s.scale.setScalar(0.15 + u * 1.9); s.material.opacity = Math.max(0, 0.55 * (1 - u)) * (t > 1.4 ? 1 : 0); });
  else fx.pk.forEach((s, i) => { const u = (((t - 1.4) * 0.35) + i / 5) % 1; s.visible = t > 1.4; s.position.copy(fx.curve.getPoint(Math.max(0, u))); });
}
function loop(now) {
  if (!running) return; requestAnimationFrame(loop);
  if ((++frames % 45) === 0) resize();
  controls.update();
  if (actOn && fx) actTick(now);
  if (curB) {
    const pul = 0.35 + 0.25 * Math.sin(now / 350);
    curB.parts.forEach(p => { if (p === sel) return; p.meshes.forEach(m => { if (p.net) m.material.emissiveIntensity = pul + 0.2; }); });
    const r = canvas.getBoundingClientRect(), v = new THREE.Vector3();
    curB.parts.forEach(p => { v.set(...p.label).applyMatrix4(curG.matrixWorld).project(camera); const x = (v.x * 0.5 + 0.5) * r.width, y = (-v.y * 0.5 + 0.5) * r.height; p.pin.style.transform = 'translate(' + (x - 11) + 'px,' + (y - 11) + 'px)'; p.pin.style.opacity = v.z < 1 ? 1 : 0; p.pin.classList.toggle('on', p === sel); });
  }
  renderer.render(scene, camera);
}
const API = {
  open(id) { root = root || document.getElementById('ov-devices'); if (!built) { ui(); } window.__devOpen = true; running = true; resize(); if (!cur) show(id || DEVICES[0].id); else if (id) show(id); requestAnimationFrame(loop); },
  close() { running = false; window.__devOpen = false; stopAct(); },
  show(id) { API.open(id); },
  act() { startAct(); },
  stopAct,
  state() { return { cur: cur && cur.id, parts: curB && curB.parts.length, act: actOn, xray, running }; },
};
window.DEVICES = API;
