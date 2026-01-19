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
  .input { width: 100%; padding: 14px; margin-top: 10px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8f9fa; box-sizing: border-box; }
  .btn { background: #ff416c; color: white; border: none; padding: 16px; width: 90%; border-radius: 50px; margin: 25px auto; display: block; font-weight: bold; cursor: pointer; text-decoration: none; text-align: center; }
  .card { background: white; border-radius: 15px; margin: 15px 0; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
  .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f1f1; font-size: 0.95rem; }
  .item:last-child { border-bottom: none; }
  .loader { position: absolute; inset: 0; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; z-index: 100; }
  .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .badge-ss { background: #ff416c; color: white; padding: 2px 8px; border-radius: 5px; font-size: 0.8rem; }
</style>
`;

/* ================= 1. INSCRIPTION ================= */
app.get("/signup", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="page">
    <h2 style="color:#ff416c; text-align:center; margin-top:0;">Configuration Santé</h2>
    <form onsubmit="save(event)">
      <div class="photo" id="photo" onclick="file.click()"><span id="photoText">📸 Photo</span></div>
      <input id="file" type="file" accept="image/*" style="display:none" onchange="preview(event)">
      <input class="input" id="fn" placeholder="Prénom" required>
      <input class="input" id="ln" placeholder="Nom" required>
      <input class="input" id="dob" type="date" required title="Date de naissance">
      <input class="input" id="res" placeholder="Résidence / Région" required>
      <select class="input" id="gs" required><option value="">Groupe sanguin</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>O+</option><option>O-</option></select>
      <select class="input" id="gt" required><option value="">Génotype</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
      <select class="input" id="child" required><option value="">Désir d'enfant</option><option>Oui</option><option>Non</option></select>
      <div style="margin-top:15px; display:flex; gap:10px; align-items:center; text-align:left;">
        <input type="checkbox" id="oath" required>
        <label for="oath" style="font-size:0.8rem;">Je jure que les données de santé fournies sont exactes.</label>
      </div>
      <button class="btn">🚀 Valider mon profil</button>
    </form>
  </div></div>
  <script>
    let img = "";
    function preview(e) {
      const reader = new FileReader();
      reader.onload = () => { img = reader.result; photo.style.backgroundImage = 'url(' + img + ')'; photoText.style.display = 'none'; };
      reader.readAsDataURL(e.target.files[0]);
    }
    function save(e) {
      e.preventDefault();
      localStorage.setItem("img", img);
      localStorage.setItem("fn", fn.value); localStorage.setItem("ln", ln.value);
      localStorage.setItem("dob", dob.value); localStorage.setItem("res", res.value);
      localStorage.setItem("gs", gs.value); localStorage.setItem("gt", gt.value);
      localStorage.setItem("child", child.value);
      window.location.href = "/validate";
    }
  </script></body></html>`);
});

/* ================= 2. VALIDATION (LOADER 5s) ================= */
app.get("/validate", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="loader">
    <div class="spinner"></div>
    <h3 style="color:#1a2a44;">Vérification sécurisée...</h3>
    <p style="color:#666; font-size:0.9rem; padding:0 20px;">
      Genlove sécurise vos données médicales.<br>Analyse de compatibilité en cours...
    </p>
  </div></div>
  <script>setTimeout(() => { window.location.href = "/profile"; }, 5000);</script>
  </body></html>`);
});

/* ================= 3. PROFIL ================= */
app.get("/profile", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="page">
    <h2 style="color:#ff416c; text-align:center; margin-top:0;">Mon Profil</h2>
    <div class="photo" id="pPhoto"></div>
    <div class="card">
      <div class="item"><span>Identité</span><b id="pName"></b></div>
      <div class="item"><span>Localisation</span><b id="pRes"></b></div>
      <div class="item"><span>Âge</span><b id="pAge"></b></div>
    </div>
    <div class="card">
      <div class="item"><span>Génotype</span><b id="pGt"></b></div>
      <div class="item"><span>Groupe Sanguin</span><b id="pGs"></b></div>
      <div class="item"><span>Désir d'enfant</span><b id="pChild"></b></div>
    </div>
    <button class="btn" onclick="location.href='/matching'">🔍 Trouver un partenaire</button>
    <div style="text-align:center;"><a href="/settings" style="color:#666; text-decoration:none; font-size:0.9rem;">⚙️ Paramètres du compte</a></div>
  </div></div>
  <script>
    if (!localStorage.getItem("fn")) window.location.href = "/signup";
    const geno = localStorage.getItem("gt");
    pPhoto.style.backgroundImage = 'url(' + localStorage.getItem("img") + ')';
    pName.innerText = localStorage.getItem("fn") + " " + localStorage.getItem("ln");
    pRes.innerText = "📍 " + localStorage.getItem("res");
    pGs.innerText = localStorage.getItem("gs");
    pGt.innerHTML = geno === "SS" ? '<span class="badge-ss">SS</span>' : geno;
    pChild.innerText = localStorage.getItem("child");
    const dob = new Date(localStorage.getItem("dob"));
    pAge.innerText = new Date().getFullYear() - dob.getFullYear() + " ans";
  </script></body></html>`);
});

/* ================= 4. PARAMÈTRES (SIGNATURE V60.6) ================= */
app.get("/settings", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
  <body><div class="app-shell"><div class="page">
    <h2 style="color:#ff416c; text-align:center; margin-top:0;">⚙️ Paramètres</h2>
    <div class="card">
      <div class="item"><span>Visibilité</span><b>Public</b></div>
      <div class="item"><span>Protection SS</span><b>Activée ✅</b></div>
      <div class="item"><span>Export Données</span><a href="#" style="color:#ff416c">PDF</a></div>
      <div class="item" onclick="if(confirm('Supprimer ?')){localStorage.clear();location.href='/signup';}" style="cursor:pointer;"><span style="color:red">Supprimer mon compte</span></div>
    </div>
    <a href="/profile" class="btn" style="background:#1a2a44;">⬅️ Retour au profil</a>
    <div style="text-align:center; font-size:0.7rem; color:#bbb; margin-top:50px;">Version 60.6 - Genlove © 2026</div>
  </div></div></body></html>`);
});

app.listen(port, () => console.log("Genlove V60.6 opérationnelle !"));
