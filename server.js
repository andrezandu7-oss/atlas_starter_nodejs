const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ================= STYLES ================= */
const styles = `
<style>
body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    background: #f2f2f2;
    display: flex;
    justify-content: center;
}
.app-shell {
    width: 100%;
    max-width: 420px;
    min-height: 100vh;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}
.page { padding: 25px 20px; }
.photo {
    width:110px;height:110px;border-radius:50%;
    margin:20px auto;background:#ddd center/cover;
}
.input {
    width:100%;padding:14px;margin-top:10px;
    border-radius:12px;border:1px solid #ddd;
}
.btn {
    background:#ff416c;color:white;border:none;
    padding:16px;width:90%;border-radius:40px;
    margin:25px auto;display:block;font-weight:bold;
}
.item {
    display:flex;justify-content:space-between;
    padding:14px 0;border-bottom:1px solid #eee;
}
.section {
    background:#f9f9f9;padding:15px;
    border-radius:12px;margin-bottom:15px;
}
.toggle {
    appearance:none;width:42px;height:24px;
    background:#ccc;border-radius:20px;
    position:relative;cursor:pointer;
}
.toggle:checked { background:#007bff; }
.toggle::after {
    content:"";width:18px;height:18px;
    background:white;border-radius:50%;
    position:absolute;top:3px;left:3px;
    transition:.2s;
}
.toggle:checked::after { left:21px; }
a { text-decoration:none;color:#007bff; }
.loader {
    display:none;
    position:fixed;
    inset:0;
    background:rgba(255,255,255,0.9);
    justify-content:center;
    align-items:center;
    flex-direction:column;
    font-weight:bold;
    color:#ff416c;
}
</style>
`;

/* ================= ACCUEIL ================= */
app.get('/', (req, res) => {
  res.redirect('/signup');
});

/* ================= INSCRIPTION ================= */
app.get('/signup', (req, res) => {
res.send(`<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
<body><div class="app-shell"><div class="page">
<h2 style="text-align:center;color:#ff416c">Créer un compte</h2>

<form onsubmit="save(event)">
<input class="input" id="fn" placeholder="Prénom" required>
<input class="input" id="ln" placeholder="Nom" required>
<input class="input" id="dob" type="date" required>
<input class="input" id="res" placeholder="Résidence" required>

<select class="input" id="gs">
<option>Groupe sanguin</option><option>A+</option><option>A-</option>
<option>B+</option><option>B-</option><option>O+</option>
</select>

<select class="input" id="gt">
<option>Génotype</option><option>AA</option><option>AS</option><option>SS</option>
</select>

<select class="input" id="child">
<option>Désir d'enfant</option><option>Oui</option><option>Non</option>
</select>

<label style="display:flex;gap:10px;margin-top:15px">
<input type="checkbox" required> Je jure que les données sont exactes
</label>

<button class="btn">🚀 Valider mon profil</button>
</form>

<div id="loader" class="loader">
  Validation et sécurisation de vos données en cours.
  <br>
  Merci de patienter quelques secondes.
</div>

<script>
function save(e){
 e.preventDefault();

 // stocker en local
 localStorage.setItem('fn',fn.value);
 localStorage.setItem('ln',ln.value);
 localStorage.setItem('dob',dob.value);
 localStorage.setItem('res',res.value);
 localStorage.setItem('gs',gs.value);
 localStorage.setItem('gt',gt.value);
 localStorage.setItem('child',child.value);
 localStorage.setItem('visibility','Public');
 localStorage.setItem('share','on');

 // afficher loader 5 secondes
 document.getElementById('loader').style.display = 'flex';
 setTimeout(() => {
   location.href='/profile';
 }, 5000);
}
</script>

</div></div></body></html>`);
});

/* ================= PROFIL ================= */
app.get('/profile', (req, res) => {
res.send(`<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
<body><div class="app-shell"><div class="page">

<h2>❤️ Mon Profil</h2>
<p style="color:#007bff">Genlove</p>

<div class="photo"></div>

<div class="item"><span>Prénom</span><b id="fn"></b></div>
<div class="item"><span>Nom</span><b id="ln"></b></div>
<div class="item"><span>Âge</span><b id="age"></b></div>

<h3>Informations médicales</h3>
<div class="item"><span>Groupe sanguin</span><b id="gs"></b></div>
<div class="item"><span>Génotype</span><b id="gt"></b></div>
<div class="item"><span>Désir d'enfant</span><b id="child"></b></div>

<button class="btn" onclick="location.href='/settings'">⚙️ Paramètres</button>

<script>
if(!localStorage.getItem('fn')) location.href='/signup';

fn.innerText = localStorage.getItem('fn');
ln.innerText = localStorage.getItem('ln');
gs.innerText = localStorage.getItem('gs');
gt.innerText = localStorage.getItem('gt');
child.innerText = localStorage.getItem('child');

age.innerText = new Date().getFullYear() - new Date(localStorage.getItem('dob')).getFullYear();
</script>

</div></div></body></html>`);
});

/* ================= PARAMÈTRES ================= */
app.get('/settings', (req, res) => {
res.send(`<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
<body><div class="app-shell"><div class="page">

<h2>⚙️ Paramètres / Sécurité</h2>
<p style="text-align:center;font-weight:bold">Genlove</p>

<div class="section">
<b>🔒 Confidentialité</b>
<div class="item">
<span>Visibilité du profil</span>
<b id="vis"></b>
</div>
<div class="item">
<span>Partage automatique</span>
<input type="checkbox" class="toggle" id="share">
</div>
</div>

<div class="section">
<b>✏️ Modifier profil</b>
<div class="item"><span>Statut</span><b>Validé</b></div>
</div>

<div class="section">
<b>💾 Sauvegarde & Export</b>
<div class="item"><span>Historique chat</span><a href="#">Export PDF</a></div>
<div class="item"><span>Supprimer</span><a href="#" onclick="clearAll()">Supprimer</a></div>
</div>

<a href="/profile">⬅️ Retour</a>

<script>
vis.innerText = localStorage.getItem('visibility');
share.checked = localStorage.getItem('share') === 'on';
share.onchange = () => localStorage.setItem('share', share.checked ? 'on' : 'off');

function clearAll(){
 if(confirm("Supprimer le compte ?")){
  localStorage.clear();
  location.href='/signup';
 }
}
</script>

</div></div></body></html>`);
});

app.listen(port,()=>console.log("Genlove prototype avec Paramètres prêt 🚀"));
