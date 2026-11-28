(function(){
var $=function(i){return document.getElementById(i)};
var VID=[["Qu’est-ce qu’une carte réseau ?","0:57"],["OSI et TCP/IP","0:47"],["Anatomie de la carte","0:53"],["Voyage d’une trame","0:52"],["MAC, IP et ARP","0:58"],["Types de cartes et choix","0:59"],["IA, Big Data et sécurité","1:01"]];
var views=["site","videos","slides","doc"],cur="site",ovs={videos:$("ov-videos"),devices:$("ov-devices"),slides:$("ov-slides"),doc:$("ov-doc")};
function mark(v){[].forEach.call(document.querySelectorAll("#hubbar button[data-v]"),function(b){var k=b.dataset.v;b.classList.toggle("on",k===v||(k==="pc"&&pcOn&&false))});$("hpc").classList.toggle("on",pcOn)}
function view(v){
  Object.keys(ovs).forEach(function(k){ovs[k].hidden=k!==v});
  if(cur==="videos"&&v!=="videos"){var vv=document.querySelector("#ov-videos video");if(vv)vv.pause()}
  if(v==="devices"){if(window.DEVICES)DEVICES.open()}else if(window.DEVICES)DEVICES.close();
  cur=v;mark(v);
  if(v==="doc"&&!$("fr-doc").src){$("fr-doc").src="doc/Expose-Carte-Reseau-Groupe21.pdf#view=FitH"}
  if(v==="slides"){ensureSlides()}
}
var sLoaded=false;
var sPend=null,pcFlag=false;
function sPost(m){try{$("fr-slides").contentWindow.postMessage(m,"*")}catch(e){}}
function ensureSlides(id){var f=$("fr-slides");if(!f.getAttribute("src")){f.onload=function(){sLoaded=true;sPost({pc:pcFlag?1:0});if(sPend){sPost({go:sPend});sPend=null}try{f.contentWindow.focus()}catch(e){}};f.src="slides/index.html"+(id?"#"+id:"");}
  else if(id){if(sLoaded)sPost({go:id});else sPend=id}}
function slide(id){view("slides");ensureSlides(id);setTimeout(function(){try{$("fr-slides").contentWindow.focus()}catch(e){}},300)}
/* Vidéos */
function grid(){var o=ovs.videos;o.innerHTML='<div class="ovh"><h2>Vidéos explicatives</h2><p>7 courtes vidéos (environ 1 minute chacune). Cliquez sur une vidéo pour la lire.</p></div><div class="vg"></div>';
  VID.forEach(function(v,i){var b=document.createElement("button");b.className="vc";b.innerHTML='<div class="th"><img loading="lazy" alt="" src="media/poster'+(i+1)+'.jpg"><span class="pl">▶</span><span class="du">'+v[1]+'</span></div><div class="nm"><b>VIDÉO '+(i+1)+'</b><span>'+v[0]+'</span></div>';b.onclick=function(){play(i+1)};b.onmouseenter=b.onfocus=function(){prewarm(i+1)};o.querySelector(".vg").appendChild(b)})}
function play(n){view("videos");var o=ovs.videos,v=VID[n-1];
  o.innerHTML='<div class="vp"><div class="vt">Vidéo '+n+' · '+v[0]+'</div><video controls controlsList="nofullscreen noremoteplayback" disablePictureInPicture autoplay playsinline preload="auto" poster="media/poster'+n+'.jpg" src="media/video'+n+'.mp4"></video><div class="vb"><button id="vL">← Liste des vidéos</button><button id="vP"'+(n<2?" disabled":"")+'>◀ Précédente</button><button id="vN"'+(n>6?" disabled":"")+'>Suivante ▶</button></div></div>';
  $("vL").onclick=grid;$("vP").onclick=function(){play(n-1)};$("vN").onclick=function(){play(n+1)};
  var vd=o.querySelector("video");vd.onended=function(){if(pcOn&&ST[pi]&&ST[pi].opt&&ST[pi].a&&String(ST[pi].h).indexOf("Vidéo "+n)>-1)setTimeout(function(){if(pcOn&&ST[pi].opt)go(nextI(pi,1))},1200)};vd.addEventListener("canplaythrough",function(){if(n<7)prewarm(n+1)},{once:true});var p=vd.play();if(p&&p.catch)p.catch(function(){vd.muted=true;var q=vd.play();if(q&&q.catch)q.catch(function(){});var m=document.createElement("button");m.className="vmute";m.textContent="🔊 Activer le son";m.onclick=function(){vd.muted=false;vd.play();m.remove()};o.querySelector(".vp").appendChild(m)})}
grid();
/* Barre du bas */
[].forEach.call(document.querySelectorAll("#hubbar button[data-v]"),function(b){b.onclick=function(){var k=b.dataset.v;
  if(k==="pc"){pcOn?pcStop():pcStart();return}
  if(k==="site"){view("site");return}
  if(k==="videos"){grid()}view(k)}});
/* Parcours guidé : groupe 21, 10 minutes */
var M="Michelle (cheffe)",O="Oumate",E="Élisée",L="Lucrèce",T="Théodore";
function site(fn){return function(){view("site");var S=window.SITE;if(S)fn(S)}}
function sl(id){var f=function(){slide(id)};f.id=id;return f}
function vd(n){return function(){play(n)}}
/* [qui, titre, à dire, secondes, action, facultatif] */
var RAW=[
[M,"Ouverture : titre, équipe, plan","Bonjour, groupe 21. Sujet : la carte réseau. Présenter l’équipe et l’ordre de passage (diapos 1 à 3). Avancer avec la flèche →.",20,sl("s01-titre")],
[M,"Contexte et problématique","Tout passe par le réseau (WhatsApp, API, IA). Une seule pièce le rend possible. Lire la problématique, puis passer la parole à Oumate.",30,sl("s04-contexte")],
[O,"1 · Définition et noms","Composant matériel qui relie la machine au câble, à la fibre ou à la radio, et lui donne une adresse MAC. Noms : NIC, adaptateur, eth0.",25,sl("s06-definition")],
[O,"1 · Où, exemples, histoire","Elle est partout : ordinateur, téléphone, box. Ethernet naît en 1973 ; les débits ont été multipliés par 40 000.",15,sl("s08-ou")],
[O,"Vidéo 1 · C’est quoi une carte réseau ? (facultatif)","À lancer seulement s’il reste du temps : elle résume la définition.",57,vd(1),1],
[O,"2 · Modèles OSI et TCP/IP","La carte travaille aux couches 1 (physique) et 2 (liaison) : bits, signaux, trames, adresses MAC.",20,sl("s11-osi")],
[O,"Vidéo 2 · OSI et TCP/IP (facultatif)","Résume les couches, après l’explication.",47,vd(2),1],
[O,"3 · Composition : les neuf pièces","RJ45, SFP+, contrôleur MAC+PHY, dissipateur, PCIe, flash, alimentation. Puis firmware et pilote.",20,sl("s13-anatomie")],
[O,"3 · Site 3D : la carte en vrai","Faire tourner la carte, cliquer « Vue éclatée » : les pièces s’écartent. Cliquer deux pastilles pour lire leur rôle.",15,site(function(S){S.reset();setTimeout(function(){S.explode(true)},900)})],
[O,"Vidéo 3 · Anatomie de la carte (facultatif)","Revoir les pièces en animation, après la démonstration.",53,vd(3),1],
[O,"4 · Types de cartes","Ethernet (stable), Wi-Fi (mobile), fibre (très haut débit), Bluetooth, intégrée, PCIe, USB. Exemple : quelle carte pour quel besoin.",15,sl("s31-ethernet")],
[O,"Vidéo 6 · Types de cartes et choix (facultatif)","Résume les types, après l’explication.",59,vd(6),1],
[O,"5 · Caractéristiques techniques","Débit, latence, duplex, MTU : lire une fiche technique. Passer la parole à Élisée.",10,sl("s37-caract")],
[O,"BONUS · La carte réseau dans les autres appareils (diapos)","Facultatif, hors des 10 minutes : mettre le chrono en pause (bouton ⏸). Chaque appui sur Suivant montre la diapo suivante. Montrer que téléphone, montre, voiture, imprimante… ont la même fonction sous d’autres formes.",0,sl("x8-annexe-mobiles"),2],
[O,"BONUS · Les 11 appareils en 3D","Facultatif, hors chrono : cliquer un appareil à gauche, laisser les rayons X, cliquer les pièces ambrées, puis « Action » et « Comparer ». Appuyer sur Suivant : Élisée enchaîne.",0,function(){view("devices");if(window.DEVICES)DEVICES.open("phone")},2],
[E,"6 · Les cinq étapes du fonctionnement","Préparation, traitement, transmission, circulation, réception. Dire chaque étape en une phrase.",25,sl("x1-etapes")],
[E,"6 · Encapsulation et trame Ethernet","Données, segment, paquet, trame. La trame : MAC destination, MAC source, type, données, CRC.",25,sl("s16-encapsulation")],
[E,"6 · Émission, réception, exemple de 4 000 octets","Application, noyau, pilote, DMA, carte. Un fichier de 4 000 octets devient trois trames.",20,sl("s19-emission")],
[E,"6 · Site 3D : les flux F1 à F4","Cliquer F1 (réception cuivre), F2 (fibre), F3 (vers l’ordinateur), F4 (depuis l’ordinateur) : les données se suivent en couleur.",15,site(function(S){S.reset();S.selectFlow(0)})],
[E,"Vidéo 4 · Voyage d’une trame (facultatif)","Le trajet complet d’une donnée, après l’explication.",52,vd(4),1],
[E,"6 · DMA, accès au support, négociation","Le DMA écrit en mémoire sans le processeur. Un mauvais câble fait négocier 100 Mbit/s : 80 s au lieu de 8 s pour 1 Go.",20,sl("s22-dma")],
[E,"7 · Fonctions avancées","Offload (la carte travaille à la place du processeur), virtualisation (une carte, plusieurs machines), SmartNIC et DPU. Passer à Michelle.",15,sl("s38-offload")],
[M,"8 · Adresse MAC et modes de diffusion","48 bits en hexadécimal, gravée en usine : 00-1A-2B-3C-4D-5E. Unicast, multicast, broadcast.",25,sl("s25-mac")],
[M,"8 · Adresse IP et comparaison","L’IP dit où est la machine (couche 3), la MAC dit qui elle est (couche 2). IPv4 : 32 bits ; IPv6 : 128 bits.",20,sl("s27-ip")],
[M,"8 · ARP et ce qui change à chaque saut","« Qui a 192.168.1.1 ? » en broadcast, le routeur répond. Les IP restent, les MAC changent à chaque saut.",25,sl("s29-arp")],
[M,"8 · Site 3D : la MAC d’usine","Cliquer « Action Firmware » : l’adresse MAC gravée est chargée dans le contrôleur.",10,site(function(S){S.reset();S.actStart("firmware")})],
[M,"Vidéo 5 · MAC, IP et ARP (facultatif)","Résume l’adressage, après l’explication.",58,vd(5),1],
[L,"9 · Avantages et inconvénients","Avantages : accès, partage, débit, évolutivité. Inconvénients : sans pilote, rien ne marche ; chaleur ; coût ; sécurité.",60,sl("s41-bilan")],
[L,"9 · Site 3D : le refroidissement","Cliquer « Action Dissipateur » : une carte rapide chauffe, il faut la refroidir.",20,site(function(S){S.reset();S.actStart("dissipateur")})],
[L,"9 · Site 3D : l’alimentation","Cliquer « Action Alimentation » : les régulateurs transforment le 12 V du slot PCIe en basse tension pour la puce. Passer à Théodore.",20,site(function(S){S.reset();S.actStart("alim")})],
[T,"10 · Développeur, IA, Big Data","Latence et débit comptent pour les API. En IA, les GPU attendent le réseau : 8 s à 10 Gbit/s, 0,2 s à 400 Gbit/s.",45,sl("s42-dev")],
[T,"Vidéo 7 · IA, Big Data et sécurité (facultatif)","Illustre l’importance de la carte, après l’explication.",61,vd(7),1],
[T,"10 · Synthèse","Petit composant, grand impact : sans elle, pas de réseau ; elle fixe débit et latence.",10,sl("s45-synthese")],
[T,"11 · Choisir et installer","Ethernet pour la stabilité, Wi-Fi 6+ pour la mobilité, fibre pour un serveur. Installer : brancher, pilote, vérifier la vitesse.",20,sl("s46-choix")],
[T,"11 · Diagnostiquer : la LED éteinte","Câble, port, ip a, ping. Puis montrer les LED en 3D.",15,sl("s48-diag")],
[T,"11 · Site 3D : les LED","Cliquer « Action LED » : lien absent, lien établi, activité.",15,site(function(S){S.reset();S.actStart("leds")})],
[T,"11 · Sécuriser","802.1X, VLAN, chiffrement WPA3 et TLS, mises à jour du pilote et du firmware.",10,sl("s49-securite")],
[T,"Conclusion et merci","Quatre idées à retenir, puis « Merci, des questions ? ».",15,sl("s51-conclusion")],
[M,"Questions de la classe (hors chrono)","FAQ (diapo 57), quiz, glossaire, ou retour au site 3D. Le site est remis à la classe.",0,function(){slide("s50-faq")}]
];
/* Diapos montrées par chaque étape (chaque appui sur Suivant = une diapo) */
var SL={"s01-titre":["s01-titre","s02-equipe","s03-sommaire"],"s04-contexte":["s04-contexte","s05-problematique"],"s06-definition":["s06-definition","s07-noms"],"s08-ou":["s08-ou","s09-exemples","s10-histoire"],"s11-osi":["s11-osi","s12-couches"],"s13-anatomie":["s13-anatomie","s14-pieces","s15-logiciel"],"s31-ethernet":["s31-ethernet","s32-wifi","s33-fibre","s34-bluetooth","s35-formes","s36-comparatif","x4-ex-choix"],"s37-caract":["s37-caract"],"x1-etapes":["x1-etapes"],"s16-encapsulation":["s16-encapsulation","s17-trame","s18-champs"],"s19-emission":["s19-emission","s20-reception","s21-chemin","x2-ex-trames"],"s22-dma":["s22-dma","s23-acces","s24-negociation","x7-ex-negociation"],"s38-offload":["s38-offload","s39-virtualisation","s40-dpu"],"s25-mac":["s25-mac","s26-modes"],"s27-ip":["s27-ip","s28-mac-ip"],"s29-arp":["s29-arp","x3-ex-arp","s30-local"],"s41-bilan":["s41-bilan"],"s42-dev":["s42-dev","s43-ia","s44-bigdata","x5-ex-ia"],"s45-synthese":["s45-synthese"],"s46-choix":["s46-choix","s47-installer"],"s48-diag":["s48-diag","x6-ex-diag"],"s49-securite":["s49-securite"],"s51-conclusion":["s51-conclusion"],"x8-annexe-mobiles":["x8-annexe-mobiles","x9-annexe-maison"],"s50-faq":["s50-faq"]};
var ST=RAW.map(function(r){return{w:r[0],h:r[1],x:r[2],t:r[3],a:r[4],opt:r[5]===1,bonus:r[5]===2,sl:r[4].id?(SL[r[4].id]||[r[4].id]):null}});
var si=0;
function showSl(){var s=ST[pi];if(s.sl)slide(s.sl[si])}
function pcNext(){var s=ST[pi];if(s.sl&&si<s.sl.length-1){si++;render();showSl()}else if(pi===ST.length-1)pcStop();else go(nextI(pi,1))}
function pcPrev(){var s=ST[pi];if(s.sl&&si>0){si--;render();showSl()}else{var k=nextI(pi,-1);if(k!==pi)go(k,true)}}
var vidsOn=true,T0=0,tmr=null,paused=false,El=0,SLOW=1.5; /* 15 min réelles = 10:00 affichées */
function fmt(n){n=Math.max(0,Math.floor(n));return Math.floor(n/60)+":"+("0"+(n%60)).slice(-2)}
var CUM=[];(function(){var c=0;ST.forEach(function(s,i){if(!s.opt&&!s.bonus)c+=s.t;CUM[i]=c})})();
var pcOn=false,pi=0,pc=$("pc");
function vn(i){var c=0;for(var k=0;k<=i;k++)if(vis(k))c++;return c}
function vis(i){return !(ST[i].opt&&!vidsOn)}
function nextI(i,d){var k=i+d;while(k>=0&&k<ST.length&&!vis(k))k+=d;return(k<0||k>=ST.length)?i:k}
var PRE={};function prewarm(n){if(PRE[n])return;var v=document.createElement("video");v.preload="auto";v.muted=true;v.src="media/video"+n+".mp4";PRE[n]=v}
function nextVid(i){for(var k=i;k<ST.length;k++){if(ST[k].opt){var m=/Vidéo (\d)/.exec(ST[k].h);if(m)return +m[1]}}return 0}
function clk(){var vp=pcOn&&ST[pi]&&ST[pi].opt,e=$("pcT"),b=$("pcPz");if(e){e.classList.toggle("paused",!!vp||paused);e.textContent=(paused?"⏸ pause · ":vp?"⏸ vidéo · ":"⏱ ")+fmt(El)+" / 10:00";e.classList.toggle("late",El>CUM[CUM.length-2]+20)}if(b){b.textContent=paused?"▶ Reprendre":"⏸ Pause";b.classList.toggle("on",paused)}}
function tick(){var vp=pcOn&&ST[pi]&&ST[pi].opt;if(!paused&&!vp)El+=1/SLOW;clk()}
function render(){var s=ST[pi],last=pi===ST.length-1&&(!s.sl||si>=s.sl.length-1);
  pc.innerHTML='<div class="pb"><b>'+vn(pi)+'/'+vn(ST.length-1)+'</b><span>ÉTAPE</span></div><div class="pt"><div class="pw">'+(s.opt?'FACULTATIF · ':s.bonus?'BONUS FACULTATIF · HORS DES 10 MINUTES · ':'')+'PARLE : '+s.w.toUpperCase()+' · MANIPULE : OUMATE'+(s.sl&&s.sl.length>1?' · DIAPO '+(si+1)+'/'+s.sl.length:'')+(s.opt||s.bonus?'':' · CIBLE '+fmt(CUM[pi]))+'</div><div class="ph">'+s.h+'</div><div class="px">'+s.x+'</div></div><div class="pk"><button class="tm" id="pcT" title="Chronomètre (double-clic : remise à zéro)">⏱ '+fmt(El)+' / 10:00</button><button id="pcPz" class="pz" title="Mettre le chronomètre en pause (interruption)">⏸ Pause</button><button id="pcV" class="'+(vidsOn?'on':'')+'" title="Afficher ou sauter les vidéos facultatives">🎬 Vidéos : '+(vidsOn?'OUI':'NON')+'</button><button id="pcF" title="Plein écran (tout le site, barre comprise)">⛶</button><button id="pcP"'+(pi||si?"":" disabled")+'>◀</button><button class="go" id="pcN">'+(last?"Terminer ✓":"Suivant ▶")+'</button><button id="pcX" title="Quitter le parcours">✕</button></div>';
  $("pcF").onclick=togFS;$("pcP").onclick=pcPrev;$("pcN").onclick=pcNext;$("pcX").onclick=pcStop;
  $("pcV").onclick=function(){vidsOn=!vidsOn;if(!vis(pi)){go(nextI(pi,1))}else render()};
  $("pcPz").onclick=function(){paused=!paused;clk()};$("pcT").ondblclick=function(){El=0;paused=false;clk()};clk();
  setH()}
function go(i,end){pi=Math.max(0,Math.min(ST.length-1,i));var s=ST[pi];si=(end&&s.sl)?s.sl.length-1:0;render();if(window.SITE)window.SITE.actStop();if(s.sl)showSl();else s.a();if(vidsOn){var n=nextVid(pi);if(n)prewarm(n)}}
/* Plein écran : toujours sur la page entière (jamais sur la vidéo seule, sinon les boutons disparaissent) */
function togFS(){var d=document;try{if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen()}catch(e){}}
function refocus(){setTimeout(function(){try{var a=document.activeElement;if(cur==="slides"){var f=$("fr-slides");if(f&&f.contentWindow)f.contentWindow.focus()}else if(a&&a!==document.body&&a.tagName!=="INPUT"&&a.tagName!=="SELECT"){a.blur()}}catch(e){}},120)}
document.addEventListener("fullscreenchange",function(){var fe=document.fullscreenElement;if(fe&&fe!==document.documentElement){try{document.exitFullscreen().then(function(){return document.documentElement.requestFullscreen()}).catch(function(){})}catch(e){}}setH();refocus()});
function setH(){requestAnimationFrame(function(){document.documentElement.style.setProperty("--hubh",$("hub").offsetHeight+"px")})}
function pcStart(){pcOn=true;pcFlag=true;sPost({pc:1});pc.hidden=false;mark(cur);if(!tmr)tmr=setInterval(tick,1000);go(vis(pi)?pi:nextI(pi,1))}
function pcStop(){pcOn=false;pcFlag=false;sPost({pc:0});pc.hidden=true;mark(cur);setH()}
window.PARCOURS={start:pcStart,go:go,steps:ST};
addEventListener("keydown",function(e){if(!pcOn||e.ctrlKey||e.metaKey||e.altKey)return;var t=(e.target.tagName||"");if(t==="INPUT"||t==="SELECT"||t==="TEXTAREA")return;if(e.key==="n"||e.key==="N"){e.preventDefault();e.stopImmediatePropagation();pcNext()}else if(e.key==="p"||e.key==="P"){e.preventDefault();e.stopImmediatePropagation();pcPrev()}else if(cur==="slides"&&(e.key==="ArrowRight"||e.key==="PageDown"||e.key===" ")){e.preventDefault();e.stopImmediatePropagation();pcNext()}else if(cur==="slides"&&(e.key==="ArrowLeft"||e.key==="PageUp")){e.preventDefault();e.stopImmediatePropagation();pcPrev()}},true);
addEventListener("message",function(e){var m=e.data||{};if(!pcOn)return;if(m.nav==="next")pcNext();else if(m.nav==="prev")pcPrev();else if(m.at){var q=ST[pi].sl,k=q?q.indexOf(m.at):-1;if(k>=0&&k!==si){si=k;render()}}});
addEventListener("resize",setH);setH();
if(innerWidth<900||/Mobi|Android|iPhone/i.test(navigator.userAgent)){var nb=document.createElement("div");nb.style.cssText="position:fixed;left:8px;right:8px;top:8px;z-index:200;background:#fbbf24;color:#06121f;border-radius:12px;padding:10px 14px;font:700 15px 'Times New Roman',serif;display:flex;gap:10px;align-items:center";nb.innerHTML="<span style='flex:1'>Ce site est conçu pour un ordinateur. Ouvrez-le sur un ordinateur pour un affichage correct.</span><button style='border:0;background:#06121f;color:#fff;border-radius:8px;padding:6px 12px;font:700 14px serif'>OK</button>";nb.querySelector("button").onclick=function(){nb.remove()};document.body.appendChild(nb)}
})();

/* Mode hors ligne */
(function(){var b=document.getElementById("offBtn"),st=document.getElementById("offSt");if(!("serviceWorker"in navigator)||!/^https?:$/.test(location.protocol)){return}
navigator.serviceWorker.register("sw.js").then(function(){b.hidden=false}).catch(function(){});
navigator.serviceWorker.addEventListener("message",function(e){var m=e.data||{};if(!m.off)return;st.hidden=false;
 if(m.off==="prog")st.textContent="Téléchargement hors ligne : "+m.n+" / "+m.total+" fichiers…";
 else if(m.off==="ok"){st.textContent="✓ Mode hors ligne prêt : le site fonctionne sans Internet sur cet ordinateur.";b.hidden=true;try{localStorage.setItem("nic_off","1")}catch(x){}}
 else st.textContent="Interrompu (connexion perdue). Relancez le bouton.";});
b.onclick=function(){st.hidden=false;st.textContent="Téléchargement en cours (environ 40 Mo)…";navigator.serviceWorker.ready.then(function(r){(r.active||navigator.serviceWorker.controller).postMessage("precache")})};
try{if(localStorage.getItem("nic_off")){st.hidden=false;st.textContent="✓ Mode hors ligne déjà préparé sur cet ordinateur."}}catch(x){}})();
