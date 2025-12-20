const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à ta base MongoDB Atlas
const mongoURI = "mongodb+srv://GenloveAdmin:andre09022025@cluster0.6vdjyyo.mongodb.net/eureka?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
.then(() => console.log(" ✅ MODE SÉCURITÉ MAXIMUM ACTIVÉ !"))
.catch(err => console.log(" ❌ Erreur :", err));

// Structure des données
const userSchema = new mongoose.Schema({ 
    nom: String, 
    ville: String,
    statut: { type: String, default: 'Standard' },
    dateCreation: { type: Date, default: Date.now } 
});
const User = mongoose.model('User', userSchema);

// PAGE PRINCIPALE
app.get('/', async (req, res) => {
    try {
        const tousLesUtilisateurs = await User.find().sort({ dateCreation: -1 });
        
        // Statistiques pour le Dashboard
        const total = tousLesUtilisateurs.length;
        const prioritaires = tousLesUtilisateurs.filter(u => u.statut === 'Prioritaire').length;
        const termines = tousLesUtilisateurs.filter(u => u.statut === 'Terminé').length;
        
        // Génération des boutons de ville
        const villes = [...new Set(tousLesUtilisateurs.map(u => (u.ville || 'Inconnue').toLowerCase()))];
        let boutonsVilles = villes.map(v => 
            `<button onclick="filtrerVille('${v}')" style="margin: 2px; padding: 5px 10px; border-radius: 15px; border: 1px solid #1e3c72; cursor: pointer; background: white; font-size: 10px;">${v.toUpperCase()}</button>`
        ).join("");

        let listeHtml = "";
        tousLesUtilisateurs.forEach(user => {
            let couleurStatut = user.statut === 'Prioritaire' ? "#d63031" : (user.statut === 'Terminé' ? "#27ae60" : "#6c757d");
            const villeClasse = (user.ville || 'inconnue').toLowerCase();

            listeHtml += `
            <div class="user-card" data-ville="${villeClasse}" data-nom="${user.nom}" data-city="${user.ville || '?'}" data-status="${user.statut}" style="background: white; margin: 15px 0; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 5px solid ${couleurStatut};">
                <div id="view-${user._id}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <span style="background: ${couleurStatut}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">${user.statut.toUpperCase()}</span><br>
                            <span style="font-size: 18px; color: #1e3c72;">👤 <b>${user.nom}</b></span><br>
                            <span style="font-size: 13px; color: #666;">📍 ${user.ville || 'Non précisée'}</span>
                        </div>
                        <div class="admin-tools" style="display: none; gap: 5px;">
                            <button onclick="document.getElementById('view-${user._id}').style.display='none'; document.getElementById('edit-${user._id}').style.display='block';" style="background: #eee; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✏️</button>
                            <form action="/supprimer/${user._id}" method="POST" style="margin: 0;"><button type="submit" style="background: #ffebee; color: #c0392b; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">🗑️</button></form>
                        </div>
                    </div>
                </div>
                <div id="edit-${user._id}" style="display: none;">
                    <form action="/modifier/${user._id}" method="POST">
                        <input type="text" name="nom" value="${user.nom}" style="width: 100%; padding: 8px; margin-bottom: 5px; border-radius: 4px; border: 1px solid #ddd;">
                        <select name="statut" style="width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ddd;">
                            <option value="Standard" ${user.statut === 'Standard' ? 'selected' : ''}>Standard</option>
                            <option value="Prioritaire" ${user.statut === 'Prioritaire' ? 'selected' : ''}>Prioritaire 🚩</option>
                            <option value="Terminé" ${user.statut === 'Terminé' ? 'selected' : ''}>Terminé ✅</option>
                        </select>
                        <button type="submit" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">OK</button>
                    </form>
                </div>
            </div>`;
        });

        res.send(`
    <html>
      <head>
        <title>Eureka Secure Dashboard</title>
        <script>
          function checkAdmin() {
            let pass = document.getElementById('adminPass').value;
            let tools = document.getElementsByClassName('admin-tools');
            let statusLabel = document.getElementById('adminStatus');
            if (pass === '1234') {
              for (let i = 0; i < tools.length; i++) { tools[i].style.display = "flex"; }
              statusLabel.innerHTML = "✅ ACCÈS ADMIN AUTORISÉ";
              statusLabel.style.color = "#27ae60";
            } else {
              for (let i = 0; i < tools.length; i++) { tools[i].style.display = "none"; }
              statusLabel.innerHTML = "Accès Restreint";
              statusLabel.style.color = "#666";
            }
          }
          function filtrerVille(ville) {
            let cards = document.getElementsByClassName('user-card');
            for (let i = 0; i < cards.length; i++) {
              cards[i].style.display = (ville === 'tous' || cards[i].getAttribute('data-ville') === ville) ? "" : "none";
            }
          }
          function copierListe() {
            let cards = document.getElementsByClassName('user-card');
            let texte = "*📋 RAPPORT EUREKA SECURE*\\n\\n";
            for (let i = 0; i < cards.length; i++) {
              if (cards[i].style.display !== "none") {
                let nom = cards[i].getAttribute('data-nom');
                let ville = cards[i].getAttribute('data-city');
                let statut = cards[i].getAttribute('data-status');
                let emoji = statut === 'Prioritaire' ? '🚩' : (statut === 'Terminé' ? '✅' : '👤');
                texte += emoji + " " + nom + " (" + ville + ") [" + statut + "]\\n";
              }
            }
            navigator.clipboard.writeText(texte);
            alert("✅ Rapport copié !");
          }
        </script>
      </head>
      <body style="font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; margin-bottom: 10px;">
            <h1 style="color: #1e3c72; margin-bottom: 5px;">🛡️ Eureka Secure</h1>
            <button onclick="copierListe()" style="background: #25D366; color: white; border: none; padding: 10px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 12px;">🟢 PARTAGER WHATSAPP</button>
          </div>

          <div style="background: #eef2f7; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center; border: 1px solid #d1d9e6;">
            <input type="password" id="adminPass" onkeyup="checkAdmin()" placeholder="Clé d'accès..." style="padding: 10px; border-radius: 8px; border: 1px solid #ccc; width: 180px; text-align: center; font-size: 16px;">
            <p id="adminStatus" style="font-size: 12px; margin-top: 8px; font-weight: bold; color: #666;">Accès Restreint</p>
          </div>

          <div style="display: flex; justify-content: space-around; margin-bottom: 20px; gap: 10px;">
            <div style="text-align:center; background:#f8f9fa; padding:10px; border-radius:10px; flex:1; border-bottom: 4px solid #1e3c72;">
                <span style="font-size:20px; font-weight:bold;">${total}</span><br><span style="font-size:10px;">TOTAL</span>
            </div>
            <div style="text-align:center; background:#fff5f5; padding:10px; border-radius:10px; flex:1; border-bottom: 4px solid #d63031;">
                <span style="font-size:20px; font-weight:bold; color:#d63031;">${prioritaires}</span><br><span style="font-size:10px;">URGENT</span>
            </div>
            <div style="text-align:center; background:#f0fff4; padding:10px; border-radius:10px; flex:1; border-bottom: 4px solid #27ae60;">
                <span style="font-size:20px; font-weight:bold; color:#27ae60;">${termines}</span><br><span style="font-size:10px;">FINI</span>
            </div>
          </div>

          <form action="/ajouter" method="POST" style="background: #f8f9fa; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #eee;">
            <input type="text" name="nom" placeholder="Nom du membre" required style="width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #ddd;">
            <input type="text" name="ville" placeholder="Ville" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #ddd;">
            <button type="submit" style="width: 100%; padding: 10px; background: #1e3c72; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">+ AJOUTER AU SYSTÈME</button>
          </form>

          <div style="margin-bottom: 15px; text-align: center;">
            <button onclick="filtrerVille('tous')" style="margin: 2px; padding: 4px 8px; border-radius: 10px; background: #eee; border: none; font-size: 11px; cursor: pointer;">TOUS</button>
            ${boutonsVilles}
          </div>
          
          <div id="listeMembres">${listeHtml}</div>
        </div>
      </body>
    </html>`);
    } catch (err) { res.send(err); }
});

// ROUTES DE GESTION
app.post('/modifier/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { nom: req.body.nom, statut: req.body.statut });
    res.redirect('/');
});

app.post('/supprimer/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

app.post('/ajouter', async (req, res) => {
    const n = new User({ nom: req.body.nom, ville: req.body.ville, statut: 'Standard' });
    await n.save();
    res.redirect('/');
});

app.listen(3000, () => console.log(" ✅ MODE SÉCURITÉ MAXIMUM ACTIVÉ !"));