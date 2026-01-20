const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ================= STYLES GLOBAUX ================= */
const styles = `
<style>
body{margin:0;font-family:Segoe UI;background:#f4f7f6}
.app-shell{max-width:420px;margin:auto;min-height:100vh;background:#fff}
.btn-pink{display:block;margin:15px;padding:14px;text-align:center;
background:#ff416c;color:#fff;border-radius:14px;font-weight:bold;text-decoration:none}
.btn-dark{display:block;margin:15px;padding:14px;text-align:center;
background:#111;color:#fff;border-radius:14px;font-weight:bold;text-decoration:none}
.card{background:#fff;margin:15px;padding:15px;border-radius:16px;
box-shadow:0 4px 10px rgba(0,0,0,.05)}
.blur{filter:blur(8px)}
small{color:#666}
</style>
`;

/* ================= ACCUEIL (INCHANGÉ) ================= */
app.get("/", (req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">
<div class="card">
<h2>Bienvenue sur Genlove</h2>
<p>Trouvez une compatibilité sérieuse et responsable.</p>
</div>
<a href="/register" class="btn-pink">Créer un compte</a>
<small style="text-align:center;display:block">
Avez-vous déjà un compte ? Connectez-vous
</small>
</div>
</body></html>
`);
});

/* ================= INSCRIPTION (EMAIL) ================= */
app.get("/register",(req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">
<form class="card" method="post" action="/register">
<h3>Inscription</h3>
<input name="email" required placeholder="Email" style="width:100%;padding:10px">
<select name="gt" style="width:100%;padding:10px;margin-top:8px" required>
<option value="">Génotype</option>
<option value="AA">AA</option>
<option value="AS">AS</option>
<option value="SS">SS</option>
</select>
<select name="child" style="width:100%;padding:10px;margin-top:8px" required>
<option value="Oui">Désir d'enfant : Oui</option>
<option value="Non">Désir d'enfant : Non</option>
</select>
<button class="btn-pink">Valider</button>
</form>
</div>
</body></html>
`);
});

app.post("/register",(req,res)=>{
// Ici on sauvegarde en localStorage côté client dans la vraie version.
// Pour l'instant, on redirige vers le profil.
res.redirect("/profile");
});

/* ================= PROFIL (AFFICHAGE) ================= */
app.get("/profile",(req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">
<div class="card">
<h3>Mon profil</h3>
<p>Email : utilisateur@email.com</p>
<p>Génotype : AA</p>
<p>Désir d'enfant : Oui</p>
</div>
<a href="/matching" class="btn-pink">🔍 Rechercher un partenaire</a>
<a href="/requests" class="btn-dark">📥 Demandes reçues</a>
<a href="/settings" class="btn-dark">⚙️ Paramètres</a>
</div>
</body></html>
`);
});

/* ================= MATCHING ================= */
app.get("/matching",(req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">
<div class="card">
<h3>Résultats de compatibilité</h3>
<p><b>Note importante :</b> Les résultats concernent seulement la compatibilité.
L'identité complète n'est révélée qu'après consensus mutuel.</p>
</div>

<div id="list"></div>

<a href="/profile" class="btn-dark">Retour</a>

<script>
  const myGt = "AS"; // À remplacer par localStorage.getItem("u_gt")

  const partners = [
    { id:1, gt:"AA", score:82 },
    { id:2, gt:"SS", score:91 },
    { id:3, gt:"AS", score:75 },
    { id:4, gt:"AS", score:88 },
    { id:5, gt:"AA", score:79 }
  ];

  // 🔐 FILTRAGE SS×SS
  const filtered = partners.filter(p => {
    if (myGt === "SS" && p.gt === "SS") return false;
    return true;
  });

  // ⚠️ MESSAGE pédagogique AS×AS
  const warning = (p) => {
    if (myGt === "AS" && p.gt === "AS") {
      return "<p style='color:#ff416c; font-weight:bold'>⚠️ Attention : AS × AS peut augmenter les risques de transmission. Consultez un médecin.</p>";
    }
    return "";
  };

  const list = document.getElementById("list");
  filtered.forEach((p, index) => {
    list.innerHTML += `
      <div class="card">
        <div class="blur" style="height:120px;background:#ddd;border-radius:12px"></div>
        <p><b>Profil ${index+1}</b></p>
        ${warning(p)}
        <p style="color:#ff416c;font-weight:bold">${p.score}% compatible</p>
        <a href="/requests" class="btn-pink">📩 Contacter</a>
      </div>
    `;
  });
</script>

</div>
</body></html>
`);
});

/* ================= DEMANDES REÇUES ================= */
app.get("/requests",(req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">
<div class="card">
<h3>✨ Bonne nouvelle !</h3>
<p>Ce profil partage une bonne compatibilité avec vous sur :
<b>projet de vie, compatibilité médicale</b>.</p>
<p>Voulez-vous accepter la conversation ?</p>
<a href="/chat" class="btn-pink">Oui, accepter</a>
<a href="/profile" class="btn-dark">Non</a>
</div>
</div>
</body></html>
`);
});

/* ================= CHAT SÉCURISÉ ================= */
app.get("/chat",(req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">
<div class="card">
<h3>Chat sécurisé</h3>
<div style="height:150px;background:#f1f1f1;border-radius:10px;margin-bottom:10px">
Chat messages...
</div>
<input placeholder="Écrire un message..." style="width:100%;padding:10px">
<div style="display:flex;gap:10px;margin-top:10px">
<button>🎤 Audio</button>
<button>🎥 Vidéo</button>
<button>📨 Envoyer</button>
</div>
</div>
<a href="/profile" class="btn-dark">Fermer</a>
</div>
</body></html>
`);
});

/* ================= PARAMÈTRES ================= */
app.get("/settings",(req,res)=>{
res.send(`
<html><head>${styles}</head>
<body>
<div class="app-shell">

<div class="card">
<h3>🔐 Confidentialité</h3>
<p>Visibilité profil : Public / Privé</p>
<p>Partage automatique : Oui / Non</p>
</div>

<div class="card">
<h3>🛠️ Mise à jour</h3>
<p>Modifier mon profil ></p>
</div>

<div class="card">
<h3>📦 Sauvegarde & Export</h3>
<p>Historique (Export PDF)</p>
<button>Exporter</button>
<hr>
<p style="color:red">Supprimer le compte</p>
<button>Oui</button>
<button>Non</button>
<button>Plus tard</button>
</div>

<a href="/profile" class="btn-dark">Retour</a>
</div>
</body></html>
`);
});

app.listen(port,()=>console.log("Genlove lancé sur le port "+port));
