const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
  body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
  .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
  .page { padding: 25px 20px; box-sizing: border-box; }
  .photo { width: 110px; height: 110px; border-radius: 50%; margin: 20px auto; background: #eee center/cover; border: 2px dashed #ff416c; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .input { width: 100%; padding: 14px; margin-top: 10px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8f9fa; box-sizing: border-box; font-size: 1rem; }
  .btn { background: #ff416c; color: white; border: none; padding: 18px; width: 100%; border-radius: 50px; margin-top: 25px; font-weight: bold; cursor: pointer; font-size: 1.1rem; }
  .card { background: white; border-radius: 15px; margin: 15px 0; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
  .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f1f1; }
  .oath-box { background: #fff5f7; border: 1px solid #ffd1d9; border-radius: 10px; padding: 15px; margin-top: 20px; display: flex; gap: 10px; align-items: center; text-align: left; }
  .loader-screen { position: absolute; inset: 0; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 100; }
  .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
`;

// --- ROUTE RACINE (CORRIGE L'ERREUR CANNOT GET /) ---
app.get("/", (req, res) => {
  res.redirect("/signup");
});

// --- PAGE D'INSCRIPTION (D'APRÈS TA MAQUETTE) ---
app.get("/signup", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="page">
    <h2 style="color:#ff416c; text-align:center;">Configuration Santé</h2>
    <form onsubmit="handleSave(event)">
      <div class="photo" id="photoView" onclick="document.getElementById('fileIn').click()"><span>📸 Photo *</span></div>
      <input id="fileIn" type="file" style="display:none" onchange="preview(event)">
      
      <input class="input" id="fn" placeholder="Prénom" required>
      <input class="input" id="ln" placeholder="Nom" required>
      <input class="input" id="dob" type="text" onfocus="(this.type='date')" placeholder="Date de naissance" required>
      <input class="input" id="res" placeholder="Résidence/Région actuelle" required>
      
      <select class="input" id="gt" required>
        <option value="">Génotype (Obligatoire)</option>
        <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
      </select>
      
      <div style="display:flex; gap:10px;">
        <select class="input" id="gs" style="flex:2;" required><option value="">Groupe Sanguin</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
        <select class="input" id="rh" style="flex:1;" required><option value="+">+</option><option value="-">-</option></select>
      </div>

      <select class="input" id="child"><option value="">Projet de vie (Désir d'enfant ?)</option><option>Oui</option><option>Non</option></select>

      <div class="oath-box">
        <input type="checkbox" id="oath" required>
        <label for="oath" style="font-size:0.85rem;">Je jure que les données fournies sont exactes et sincères.</label>
      </div>

      <button type="submit" class="btn">🚀 Valider mon profil</button>
    </form>
  </div></div>
  <script>
    let b64 = "";
    function preview(e) {
      const r = new FileReader();
      r.onload = () => { b64 = r.result; document.getElementById('photoView').style.backgroundImage = 'url('+b64+')'; document.getElementById('photoView').innerHTML=''; };
      r.readAsDataURL(e.target.files[0]);
    }
    function handleSave(e) {
      e.preventDefault();
      localStorage.setItem("u_img", b64);
      localStorage.setItem("u_fn", document.getElementById('fn').value);
      localStorage.setItem("u_gt", document.getElementById('gt').value);
      window.location.href = "/validate";
    }
  </script></body></html>`);
});

// --- PAGE DE VALIDATION (LOADER 5S) ---
app.get("/validate", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="loader-screen">
    <div class="spinner"></div>
    <h3>Validation sécurisée...</h3>
    <p style="color:#666;">Analyse de compatibilité et protection des données en cours.</p>
  </div></div>
  <script>setTimeout(() => { window.location.href = "/profile"; }, 5000);</script>
  </body></html>`);
});

// --- PAGE PROFIL AVEC RÈGLE SS ---
app.get("/profile", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="page">
    <h2 style="color:#ff416c; text-align:center;">Mon Profil</h2>
    <div class="photo" id="pImg"></div>
    <div class="card">
      <div class="item"><span>Utilisateur</span><b id="pName"></b></div>
      <div class="item"><span>Génotype</span><b id="pGeno"></b></div>
    </div>
    <p id="matchNotice" style="font-size:0.8rem; color:#666; font-style:italic;"></p>
    <button class="btn" onclick="alert('Recherche de partenaires compatibles...')">🔍 Trouver un partenaire</button>
  </div></div>
  <script>
    const geno = localStorage.getItem("u_gt");
    document.getElementById('pName').innerText = localStorage.getItem("u_fn");
    document.getElementById('pGeno').innerText = geno;
    document.getElementById('pImg').style.backgroundImage = 'url(' + localStorage.getItem("u_img") + ')';
    
    // RÈGLE DE SÉCURITÉ AUTOMATIQUE
    if(geno === "SS") {
      document.getElementById('matchNotice').innerText = "🛡️ Mode Sécurité activé : Les profils SS sont automatiquement masqués pour vous.";
    }
  </script></body></html>`);
});

app.listen(port, () => console.log("Genlove V60.7 prête sur le port " + port));
