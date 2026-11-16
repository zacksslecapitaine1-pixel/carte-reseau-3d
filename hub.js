(function(){
var $=function(i){return document.getElementById(i)};
var VID=[["Qu’est-ce qu’une carte réseau ?","0:57"],["OSI et TCP/IP","0:47"],["Anatomie de la carte","0:53"],["Voyage d’une trame","0:52"],["MAC, IP et ARP","0:58"],["Types de cartes et choix","0:59"],["IA, Big Data et sécurité","1:01"]];
var views=["site","videos","slides","doc"],cur="site",ovs={videos:$("ov-videos"),slides:$("ov-slides"),doc:$("ov-doc")};
function mark(v){[].forEach.call(document.querySelectorAll("#hubbar button[data-v]"),function(b){var k=b.dataset.v;b.classList.toggle("on",k===v||(k==="pc"&&pcOn&&false))});$("hpc").classList.toggle("on",pcOn)}
function view(v){
  Object.keys(ovs).forEach(function(k){ovs[k].hidden=k!==v});
  if(cur==="videos"&&v!=="videos"){var vv=document.querySelector("#ov-videos video");if(vv)vv.pause()}
  cur=v;mark(v);
  if(v==="doc"&&!$("fr-doc").src){$("fr-doc").src="doc/Expose-Carte-Reseau-Groupe17.pdf#view=FitH"}
  if(v==="slides"){ensureSlides()}
}
var sLoaded=false;
function ensureSlides(id){var f=$("fr-slides");if(!f.getAttribute("src")){f.onload=function(){sLoaded=true;try{f.contentWindow.focus()}catch(e){}};f.src="slides/index.html"+(id?"#"+id:"");}
  else if(id){f.contentWindow.postMessage({go:id},"*")}}
function slide(id){view("slides");ensureSlides(id);setTimeout(function(){try{$("fr-slides").contentWindow.focus()}catch(e){}},300)}
/* Vidéos */
function grid(){var o=ovs.videos;o.innerHTML='<div class="ovh"><h2>Vidéos explicatives</h2><p>7 courtes vidéos (environ 1 minute chacune). Cliquez sur une vidéo pour la lire.</p></div><div class="vg"></div>';
  VID.forEach(function(v,i){var b=document.createElement("button");b.className="vc";b.innerHTML='<div class="th"><img loading="lazy" alt="" src="media/poster'+(i+1)+'.jpg"><span class="pl">▶</span><span class="du">'+v[1]+'</span></div><div class="nm"><b>VIDÉO '+(i+1)+'</b><span>'+v[0]+'</span></div>';b.onclick=function(){play(i+1)};o.querySelector(".vg").appendChild(b)})}
function play(n){view("videos");var o=ovs.videos,v=VID[n-1];
  o.innerHTML='<div class="vp"><div class="vt">Vidéo '+n+' · '+v[0]+'</div><video controls autoplay playsinline poster="media/poster'+n+'.jpg" src="media/video'+n+'.mp4"></video><div class="vb"><button id="vL">← Liste des vidéos</button><button id="vP"'+(n<2?" disabled":"")+'>◀ Précédente</button><button id="vN"'+(n>6?" disabled":"")+'>Suivante ▶</button></div></div>';
  $("vL").onclick=grid;$("vP").onclick=function(){play(n-1)};$("vN").onclick=function(){play(n+1)};
  var vd=o.querySelector("video");vd.onended=function(){};var p=vd.play();if(p&&p.catch)p.catch(function(){})}
grid();
/* Barre du bas */
[].forEach.call(document.querySelectorAll("#hubbar button[data-v]"),function(b){b.onclick=function(){var k=b.dataset.v;
  if(k==="pc"){pcOn?pcStop():pcStart();return}
  if(k==="site"){view("site");return}
  if(k==="videos"){grid()}view(k)}});
/* Parcours guidé */
var P1="Personne 1",P2="Personne 2",P3="Personne 3",P4="Personne 4",P5="Personne 5",P6="Personne 6";
function site(fn){return function(){view("site");var S=window.SITE;if(S)fn(S)}}
var ST=[
{w:P1,h:"Ouverture",x:"Diaporama : titre, équipe, sommaire, contexte et problématique (diapos 1 à 5). Pas encore de site : on pose d’abord le sujet.",a:function(){slide("s01-titre")}},
{w:P1,h:"Vidéo 1 · Qu’est-ce qu’une carte réseau ?",x:"Lancer la vidéo 1, tout le monde regarde. Elle fixe la définition avant d’entrer dans le détail.",a:function(){play(1)}},
{w:P2,h:"Définition, noms, lieux, exemples, histoire",x:"Diaporama, diapos 6 à 10 (définition, noms, où on la trouve, trois exemples, évolution des débits).",a:function(){slide("s06-definition")}},
{w:P2,h:"Vidéo 2 · OSI et TCP/IP",x:"Lancer la vidéo 2 pour introduire les couches.",a:function(){play(2)}},
{w:P2,h:"Modèle OSI et TCP/IP",x:"Diaporama, diapos 11 et 12 : la carte travaille aux couches 1 et 2.",a:function(){slide("s11-osi")}},
{w:P3,h:"Vidéo 3 · Anatomie de la carte",x:"Lancer la vidéo 3 : première vue d’ensemble de la carte et de ses pièces.",a:function(){play(3)}},
{w:P3,h:"Composition : le diaporama",x:"Diaporama, diapos 13 à 15 (anatomie, neuf pièces, firmware et pilote). À la fin, on passe au site.",a:function(){slide("s13-anatomie")}},
{w:P3,h:"Site 3D · la carte complète",x:"Première apparition du site : montrer la carte entière, la faire tourner, puis basculer 2D, Réaliste, 3D avec les boutons du haut. Cliquer sur quelques numéros pour lire les définitions.",a:site(function(S){S.reset()})},
{w:P3,h:"Site 3D · vue éclatée",x:"Cliquer « Vue éclatée » : les neuf pièces s’écartent, on voit le rôle de chacune. Cliquer « Réinitialiser » ensuite.",a:site(function(S){S.reset();setTimeout(function(){S.explode(true)},200)})},
{w:P3,h:"Site 3D · Action du port RJ45",x:"Le câble vient se brancher dans le port RJ45. Expliquer les étapes affichées. Puis cliquer « Action SFP+ » pour la fibre.",a:site(function(S){S.reset();S.actStart("rj45")})},
{w:P3,h:"Site 3D · Action du contrôleur et du dissipateur",x:"Cliquer « Action Contrôleur » (construction de la trame) puis « Action Dissipateur » (refroidissement).",a:site(function(S){S.reset();S.actStart("controleur")})},
{w:P3,h:"Site 3D · Action du PCIe, de l’alimentation, du firmware",x:"Cliquer « Action PCIe » (DMA vers la RAM), puis « Alimentation », « Firmware », « Pistes » et « LED ».",a:site(function(S){S.reset();S.actStart("pcie")})},
{w:P3,h:"Vidéo 4 · Voyage d’une trame",x:"Lancer la vidéo 4 : le trajet d’une donnée de l’application au câble.",a:function(){play(4)}},
{w:P3,h:"Encapsulation, trame, émission, réception",x:"Diaporama, diapos 16 à 21, puis l’exemple « Envoyer un fichier de 4 000 octets ».",a:function(){slide("s16-encapsulation")}},
{w:P3,h:"Site 3D · les flux F1 à F4",x:"Cliquer F1 (réception cuivre), F2 (fibre), F3 (vers l’ordinateur), F4 (depuis l’ordinateur). Chaque flux se suit en couleur sur la carte.",a:site(function(S){S.reset();S.selectFlow(0)})},
{w:P4,h:"DMA, accès au support, négociation",x:"Diaporama, diapos 22 à 24, puis l’exemple « Un mauvais câble ralentit tout ».",a:function(){slide("s22-dma")}},
{w:P4,h:"Site 3D · le PCIe et le DMA",x:"Relancer « Action PCIe » : le contrôleur écrit en RAM sans le processeur.",a:site(function(S){S.reset();S.actStart("pcie")})},
{w:P4,h:"Vidéo 5 · MAC, IP et ARP",x:"Lancer la vidéo 5.",a:function(){play(5)}},
{w:P4,h:"Adresse MAC, adresse IP, ARP",x:"Diaporama, diapos 25 à 30, puis l’exemple ARP.",a:function(){slide("s25-mac")}},
{w:P4,h:"Site 3D · le firmware et l’adresse MAC d’usine",x:"Cliquer « Action Firmware » : l’adresse MAC gravée est chargée dans le contrôleur.",a:site(function(S){S.reset();S.actStart("firmware")})},
{w:P5,h:"Vidéo 6 · Types de cartes et choix",x:"Lancer la vidéo 6.",a:function(){play(6)}},
{w:P5,h:"Ethernet, Wi-Fi, fibre, Bluetooth, formes",x:"Diaporama, diapos 31 à 36, puis l’exemple « Quelle carte pour quel besoin ? ».",a:function(){slide("s31-ethernet")}},
{w:P5,h:"Site 3D · cuivre et fibre",x:"Montrer « Action RJ45 » puis « Action SFP+ » côte à côte : câble cuivre contre fibre optique.",a:site(function(S){S.reset();S.actStart("sfp")})},
{w:P5,h:"Fiche technique, offload, virtualisation, DPU, bilan",x:"Diaporama, diapos 37 à 41.",a:function(){slide("s37-caract")}},
{w:P5,h:"Site 3D · refroidissement des cartes rapides",x:"Cliquer « Action Dissipateur » : une carte rapide chauffe, d’où le refroidissement.",a:site(function(S){S.reset();S.actStart("dissipateur")})},
{w:P6,h:"Vidéo 7 · IA, Big Data et sécurité",x:"Lancer la vidéo 7.",a:function(){play(7)}},
{w:P6,h:"Développement, IA, Big Data, synthèse, choix, diagnostic",x:"Diaporama, diapos 42 à 50, avec les exemples « IA » et « La LED est éteinte ».",a:function(){slide("s42-dev")}},
{w:P6,h:"Site 3D · diagnostic avec les LED",x:"Cliquer « Action LED » : lien absent, lien établi, activité, démarche de diagnostic.",a:site(function(S){S.reset();S.actStart("leds")})},
{w:P6,h:"Site 3D · le quiz",x:"Cliquer « Quiz » : la classe retrouve les pièces sur la carte.",a:site(function(S){S.reset();S.quiz(true)})},
{w:P1,h:"Conclusion, quiz, glossaire, sources, merci",x:"Diaporama, diapos 51 à 55 : ce qu’il faut retenir, puis questions de la classe.",a:function(){if(window.SITE)window.SITE.reset();slide("s51-conclusion")}},
{w:P1,h:"Document remis",x:"Ouvrir « Document » : montrer le texte complet, le bouton de téléchargement du Word. Fin de l’exposé.",a:function(){view("doc")}}
];
var pcOn=false,pi=0,pc=$("pc");
function render(){var s=ST[pi];pc.innerHTML='<div class="pb"><b>'+(pi+1)+'/'+ST.length+'</b><span>ÉTAPE</span></div><div class="pt"><div class="pw">PARLE : '+s.w.toUpperCase()+' · MANIPULE : PERSONNE 1</div><div class="ph">'+s.h+'</div><div class="px">'+s.x+'</div></div><div class="pk"><button id="pcP"'+(pi?"":" disabled")+'>◀ Précédent</button><button class="go" id="pcN">'+(pi<ST.length-1?"Suivant ▶":"Terminer ✓")+'</button><button id="pcX" title="Quitter le parcours">✕</button></div>';
  $("pcP").onclick=function(){go(pi-1)};$("pcN").onclick=function(){pi<ST.length-1?go(pi+1):pcStop()};$("pcX").onclick=pcStop;
  setH()}
function go(i){pi=Math.max(0,Math.min(ST.length-1,i));render();var s=ST[pi];if(window.SITE)window.SITE.actStop();s.a()}
function setH(){requestAnimationFrame(function(){document.documentElement.style.setProperty("--hubh",$("hub").offsetHeight+"px")})}
function pcStart(){pcOn=true;pc.hidden=false;mark(cur);go(pi)}
function pcStop(){pcOn=false;pc.hidden=true;mark(cur);setH()}
window.PARCOURS={start:pcStart,go:go,steps:ST};
addEventListener("keydown",function(e){if(!pcOn||e.ctrlKey||e.metaKey||e.altKey)return;var t=(e.target.tagName||"");if(t==="INPUT"||t==="SELECT"||t==="TEXTAREA")return;if(e.key==="n"||e.key==="N"||e.key==="PageDown"){e.preventDefault();e.stopImmediatePropagation();if(pi<ST.length-1)go(pi+1)}else if(e.key==="p"||e.key==="P"||e.key==="PageUp"){e.preventDefault();e.stopImmediatePropagation();go(pi-1)}},true);
addEventListener("message",function(e){var m=e.data||{};if(m.nav==="next"&&pcOn)go(pi+1)});
addEventListener("resize",setH);setH();
})();
