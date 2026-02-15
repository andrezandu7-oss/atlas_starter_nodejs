// ---------- PROFIL (SUITE ET FIN) ----------
app.get('/profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#f8f9fa;">
        <div class="app-shell">
          <div id="genlove-notify">
            <span>💙</span>
            <span id="notify-msg"></span>
          </div>
          <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; display:flex; align-items:center; gap:8px; border:1px solid #dbeafe;">
                🏠 Accueil
              </a>
              <a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a>
            </div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-color:#eee; background-image:url('https://via.placeholder.com/150?text=Photo');"></div>
            <h2 id="vN">Chargement...</h2>
            <p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">Chargement...</p>
            <p style="color:#007bff; font-weight:bold; margin:0;">✅ Profil Santé Validé</p>
          </div>
          
          <!-- BANNIÈRE NOTIFICATIONS PUSH -->
          <div id="push-permission-banner" class="permission-banner" style="display:none;">
            <strong>🔔 Activer les notifications</strong>
            <p style="margin:5px 0; font-size:0.8rem;">Recevez les demandes de contact même en veille</p>
            <button id="enable-push" class="permission-button">✅ Activer</button>
          </div>
          
          <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">📋 MES INFORMATIONS</div>
          <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">Chargement...</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">Chargement...</b></div>
            <div class="st-item"><span>Âge</span><b id="rAge">Chargement...</b></div>
            <div class="st-item"><span>Résidence</span><b id="rRes">Chargement...</b></div>
            <div class="st-item"><span>Projet (Enfant)</span><b id="rP">Chargement...</b></div>
          </div>
          <a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a>
        </div>
        
        <script>
          function showNotify(msg) {
            const n = document.getElementById('genlove-notify');
            const m = document.getElementById('notify-msg');
            if (m) m.innerText = msg;
            if (n) {
              n.classList.add('show');
              setTimeout(() => { n.classList.remove('show'); }, 3500);
            }
          }
          
          function calculerAge(dateNaissance) {
            if (!dateNaissance) return "???";
            const today = new Date();
            const birthDate = new Date(dateNaissance);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
          }
          
          // Initialisation des notifications push
          async function initPushNotifications() {
            if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
              console.log('Push non supporté');
              return;
            }
            
            const userId = localStorage.getItem('current_user_id');
            if (!userId) return;
            
            // Vérifier si déjà autorisé
            if (Notification.permission === 'granted') {
              registerServiceWorker(userId);
            } else if (Notification.permission !== 'denied') {
              document.getElementById('push-permission-banner').style.display = 'block';
            }
            
            document.getElementById('enable-push')?.addEventListener('click', async () => {
              try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  document.getElementById('push-permission-banner').style.display = 'none';
                  await registerServiceWorker(userId);
                  showNotify('✅ Notifications activées !');
                }
              } catch (err) {
                console.error('Erreur permission:', err);
              }
            });
          }
          
          async function registerServiceWorker(userId) {
            try {
              const registration = await navigator.serviceWorker.register('/sw.js');
              console.log('SW enregistré');
              
              const response = await fetch('/api/vapid-public-key');
              const { publicKey } = await response.json();
              
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
              });
              
              await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription, userId })
              });
              
            } catch (err) {
              console.error('Erreur subscription:', err);
            }
          }
          
          window.onload = function() {
            try {
              let userData = {};
              let photo = "https://via.placeholder.com/150?text=Photo";
              
              const stored = localStorage.getItem('current_user_data');
              if (!stored) {
                showNotify('👤 Redirection création profil...');
                setTimeout(() => { window.location.href = '/signup'; }, 1000);
                return;
              }
              
              userData = JSON.parse(stored);
              photo = localStorage.getItem('current_user_photo') || photo;
              const userId = localStorage.getItem('current_user_id');
              
              if (!userData.firstName || !userData.genotype) {
                showNotify('👤 Redirection création profil...');
                setTimeout(() => { window.location.href = '/signup'; }, 1000);
                return;
              }
              
              document.getElementById('vP').style.backgroundImage = 'url(' + photo + ')';
              document.getElementById('vN').innerText = userData.firstName + ' ' + userData.lastName;
              document.getElementById('vR').innerText = (userData.residence || 'Luanda');
              document.getElementById('rG').innerText = userData.genotype || 'Non renseigné';
              document.getElementById('rS').innerText = userData.bloodGroup || 'Non renseigné';
              document.getElementById('rAge').innerText = userData.dob ? calculerAge(userData.dob) + ' ans' : 'Non renseigné';
              document.getElementById('rRes').innerText = userData.residence || 'Luanda';
              document.getElementById('rP').innerText = userData.desireChild === 'Oui' ? 'Oui' : 'Non';
              
              if (userId) localStorage.setItem('current_user_id', userId);
              showNotify('✅ Profil chargé !');
              
              // Lancer l'initialisation des push
              initPushNotifications();
              
            } catch (e) {
              console.error('Profil error:', e);
              showNotify('❌ Erreur chargement');
              localStorage.removeItem('current_user_data');
              localStorage.removeItem('current_user_photo');
              setTimeout(() => { window.location.href = '/signup'; }, 1500);
            }
          };
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// ---------- CONFIG SANTÉ ----------
app.get('/health-config', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div id="loader"><div class="spinner"></div><h3>Chargement config santé...</h3></div>
          <div class="page-white" id="main-content" style="display:none;">
            <h2 style="color:#ff416c; margin-top:0;">⚕️ Configuration Santé</h2>
            <form onsubmit="saveHealthConfig(event)">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <input type="date" id="dob" class="input-box">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box">
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex; gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;">
                  <option value="">Groupe</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;">
                  <option>+</option>
                  <option>-</option>
                </select>
              </div>
              <select id="pj" class="input-box">
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
              <div style="display:flex; gap:15px; margin-top:20px;">
                <button type="submit" class="btn-pink" style="flex:1;">💾 Enregistrer</button>
                <button type="button" onclick="cancelHealthConfig()" class="btn-dark" style="flex:1;">❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
        <script>
          let userId = "";
          
          window.onload = () => {
            try {
              const userDataStr = localStorage.getItem('current_user_data');
              if (!userDataStr) {
                showNotify('👤 Profil requis');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              const userData = JSON.parse(userDataStr);
              userId = localStorage.getItem('current_user_id');
              if (!userId) {
                showNotify('❌ ID manquant');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              
              document.getElementById('fn').value = userData.firstName || "";
              document.getElementById('ln').value = userData.lastName || "";
              document.getElementById('gender').value = userData.gender || "";
              document.getElementById('dob').value = userData.dob || "";
              document.getElementById('res').value = userData.residence || "";
              document.getElementById('gt').value = userData.genotype || "";
              
              if (userData.bloodGroup) {
                const gs = userData.bloodGroup.match(/([ABO]+)([+-])/);
                if (gs) {
                  document.getElementById('gs_type').value = gs[1];
                  document.getElementById('gs_rh').value = gs[2];
                }
              }
              
              document.getElementById('pj').value = userData.desireChild || "";
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('✅ Config santé chargée');
              
            } catch (e) {
              console.error('Health config error:', e);
              showNotify('❌ Erreur chargement');
            }
          };
          
          async function saveHealthConfig(e) {
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            document.getElementById('main-content').style.display = 'none';
            
            const updates = {
              firstName: document.getElementById('fn').value,
              lastName: document.getElementById('ln').value,
              gender: document.getElementById('gender').value,
              dob: document.getElementById('dob').value,
              residence: document.getElementById('res').value,
              genotype: document.getElementById('gt').value,
              bloodGroup: document.getElementById('gs_type').value ? 
                document.getElementById('gs_type').value + document.getElementById('gs_rh').value : "",
              desireChild: document.getElementById('pj').value
            };
            
            try {
              const response = await fetch('/api/update-account/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              
              const result = await response.json();
              
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(updates));
                showNotify('✅ Config santé enregistrée !');
                setTimeout(() => { window.location.href = '/profile'; }, 1200);
              } else {
                throw new Error(result.error || 'Erreur serveur');
              }
            } catch (err) {
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('❌ Erreur: ' + err.message);
            }
          }
          
          function cancelHealthConfig() {
            if (confirm('Annuler les modifications ?')) {
              window.location.href = '/profile';
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// ---------- MATCHING ----------
app.get('/matching', async (req, res) => {
  try {
    const users = await User.find({}).select('firstName lastName gender dob residence genotype bloodGroup desireChild photo _id').limit(50).lean();
    
    const partnersWithAge = users.filter(u => u.genotype && u.gender && u._id).map(u => ({
      id: u._id.toString().slice(-4),
      fullId: u._id.toString(),
      gt: u.genotype,
      gs: u.bloodGroup,
      pj: u.desireChild === "Oui" ? "Désire fonder une famille" : "Sans enfants",
      name: u.firstName + " " + u.lastName.charAt(0) + ".",
      dob: u.dob,
      res: u.residence || "Luanda",
      gender: u.gender,
      photo: u.photo
    }));
    
    const matchesHTML = partnersWithAge.map(p => `
      <div class="match-card" data-gt="${p.gt}" data-gender="${p.gender}" data-userid="${p.fullId}">
        <div class="match-photo-blur" style="background-image:url(${p.photo})"></div>
        <div style="flex:1">
          <b>${p.name} (#${p.id})</b><br>
          <small>${calculerAge(p.dob)} ans • ${p.res} • ${p.gt}</small>
        </div>
        <div style="display:flex;">
          <button class="btn-action btn-contact" onclick="sendRequest('${p.fullId}', '${p.name}')">Contacter</button>
          <button class="btn-action btn-details" onclick='showDetails(${JSON.stringify(p).replace(/'/g, "\\'")})'>Détails</button>
        </div>
      </div>
    `).join('');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>${head}${styles}</head>
        <body style="background:#f4f7f6;">
          <div class="app-shell">
            <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
              <h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles (${partnersWithAge.length})</h3>
            </div>
            <div id="match-container">
              ${matchesHTML || '<p style="text-align:center; color:#666; padding:40px;">Aucun partenaire compatible.<br>Revenez bientôt !</p>'}
            </div>
            <a href="/profile" class="btn-pink">Retour profil</a>
          </div>
          
          <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
              <span class="close-popup" onclick="closePopup()">&times;</span>
              <h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails</h3>
              <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
              <div id="pop-msg" style="background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px;"></div>
              <button id="pop-btn" class="btn-pink" style="margin:20px 0 0 0; width:100%">🚀 Contacter</button>
            </div>
          </div>
          
          ${notifyScript}
          <script>
            let sP = null;
            
            function calculerAge(dateNaissance) {
              if (!dateNaissance) return "???";
              const today = new Date();
              const birthDate = new Date(dateNaissance);
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
              return age;
            }
            
            function showDetails(p) {
              sP = p;
              document.getElementById('pop-name').innerText = p.name + ' #' + p.id;
              document.getElementById('pop-details').innerHTML = 
                "<b>Âge:</b> " + calculerAge(p.dob) + " ans<br>" +
                "<b>Résidence:</b> " + p.res + "<br>" +
                "<b>Génotype:</b> " + p.gt + "<br>" +
                "<b>Groupe:</b> " + p.gs + "<br><br>" +
                "<b>Projet:</b><br><i>" + p.pj + "</i>";
              
              document.getElementById('pop-msg').style.display = 'block';
              document.getElementById('pop-msg').innerHTML = "<b>L'Union Sérénité:</b> Compatibilité validée.";
              document.getElementById('pop-btn').innerText = "🚀 Contacter";
              document.getElementById('pop-btn').onclick = () => {
                sendRequest(p.fullId, p.name);
              };
              document.getElementById('popup-overlay').style.display = 'flex';
            }
            
            function closePopup() {
              document.getElementById('popup-overlay').style.display = 'none';
            }
            
            async function sendRequest(toUserId, toName) {
              const fromUserId = localStorage.getItem('current_user_id');
              
              if (!fromUserId) {
                showNotify('❌ Vous devez être connecté');
                setTimeout(() => { window.location.href = '/profile'; }, 1500);
                return;
              }
              
              try {
                const response = await fetch('/api/send-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fromUserId,
                    toUserId,
                    message: 'Souhaite faire connaissance'
                  })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                  showNotify('✅ Demande envoyée à ' + toName);
                  if (result.notificationSent) {
                    showNotify('📱 Notification push envoyée !');
                  }
                  closePopup();
                } else {
                  throw new Error(result.error || 'Erreur');
                }
              } catch (err) {
                showNotify('❌ Erreur: ' + err.message);
              }
            }
            
            window.onload = () => {
              try {
                const myDataStr = localStorage.getItem('current_user_data');
                if (!myDataStr) {
                  showNotify('👤 Profil requis');
                  setTimeout(() => { window.location.href = '/profile'; }, 1000);
                  return;
                }
                
                const myData = JSON.parse(myDataStr);
                const myGt = myData.genotype;
                const myGender = myData.gender;
                const myId = localStorage.getItem('current_user_id');
                
                if (!myGt) {
                  showNotify('👤 Génotype requis');
                  setTimeout(() => { window.location.href = '/profile'; }, 1000);
                  return;
                }
                
                let totalFiltered = 0;
                
                document.querySelectorAll('.match-card').forEach(card => {
                  const pGt = card.dataset.gt;
                  const pGender = card.dataset.gender;
                  const pUserId = card.dataset.userid;
                  
                  let visible = true;
                  
                  if (pUserId === myId) visible = false;
                  if (myGender && pGender === myGender) visible = false;
                  if ((myGt === 'SS' || myGt === 'AS') && pGt !== 'AA') visible = false;
                  if (myGt === 'SS' && pGt === 'SS') visible = false;
                  
                  if (visible) {
                    totalFiltered++;
                    card.style.display = 'flex';
                  } else {
                    card.style.display = 'none';
                  }
                });
                
                if ((myGt === "SS" || myGt === "AS") && totalFiltered === 0) {
                  document.getElementById('pop-name').innerText = "🛡️ Protection Santé";
                  document.getElementById('pop-details').innerHTML = 
                    "Genlove vous présente <b>exclusivement</b> des partenaires AA pour garantir une descendance sans drépanocytose.";
                  document.getElementById('pop-msg').style.display = 'none';
                  document.getElementById('pop-btn').innerText = "Je comprends";
                  document.getElementById('pop-btn').onclick = closePopup;
                  document.getElementById('popup-overlay').style.display = 'flex';
                }
                
              } catch (e) {
                console.error('Matching error:', e);
                showNotify('❌ Erreur chargement');
              }
            };
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error("X Matching error:", error);
    res.status(500).send("Erreur chargement");
  }
});

// ---------- SETTINGS ----------
app.get('/settings', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body style="background:#f4f7f6;">
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div style="padding:25px; background:white; text-align:center;">
            <div style="font-size:2.5rem; font-weight:bold;">
              <span style="color:#1a2a44;">Gen</span>
              <span style="color:#ff416c;">love</span>
            </div>
          </div>
          
          <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">🔐 CONFIDENTIALITÉ</div>
          <div class="st-group">
            <div class="st-item">
              <span>Visibilité profil</span>
              <label class="switch">
                <input type="checkbox" checked onchange="showNotify('Visibilité mise à jour !')">
                <span class="slider"></span>
              </label>
            </div>
            <div class="st-item">
              <span>Notifications</span>
              <label class="switch">
                <input type="checkbox" onchange="showNotify('Notifications ' + (this.checked ? 'activées' : 'désactivées'))">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="st-group">
            <a href="/edit-profile" style="text-decoration:none;" class="st-item">
              <span>📝 Modifier profil</span>
              <b>Modifier →</b>
            </a>
            <a href="/health-config" style="text-decoration:none;" class="st-item">
              <span>⚕️ Config santé</span>
              <b>Modifier →</b>
            </a>
            <a href="/notifications-settings" style="text-decoration:none;" class="st-item">
              <span>🔔 Notifications push</span>
              <b>Configurer →</b>
            </a>
          </div>
          
          <div class="st-group">
            <div class="st-item" style="color:red; font-weight:bold;">
              ⚠️ Supprimer compte
            </div>
          </div>
          
          <div style="display:flex; justify-content:space-around; padding:15px;">
            <button id="delete-btn" onclick="deleteAccount()" style="background:#dc3545; color:white; border:none; padding:12px 25px; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.9rem;">
              🗑️ Supprimer
            </button>
            <button onclick="cancelDelete()" style="background:#28a745; color:white; border:none; padding:12px 25px; border-radius:12px; cursor:pointer; font-weight:bold; font-size:0.9rem;">
              ✅ Annuler
            </button>
          </div>
          
          <a href="/profile" class="btn-pink">Retour profil</a>
        </div>
        
        <script>
          async function deleteAccount() {
            if (confirm('⚠️ Supprimer DÉFINITIVEMENT votre compte Genlove ? Cette action est irréversible.')) {
              try {
                const userId = localStorage.getItem('current_user_id');
                if (!userId) {
                  showNotify('❌ ID utilisateur manquant');
                  return;
                }
                
                document.getElementById('delete-btn').innerText = 'Suppression...';
                document.getElementById('delete-btn').disabled = true;
                
                const response = await fetch('/api/delete-account/' + userId, {
                  method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (response.ok) {
                  localStorage.clear();
                  showNotify('✅ Compte supprimé définitivement');
                  setTimeout(() => { location.href = '/'; }, 2000);
                } else {
                  throw new Error(result.error || 'Erreur serveur');
                }
              } catch (e) {
                console.error('Delete error:', e);
                showNotify('❌ Erreur: ' + e.message);
                document.getElementById('delete-btn').innerText = 'Supprimer';
                document.getElementById('delete-btn').disabled = false;
              }
            }
          }
          
          function cancelDelete() {
            showNotify('✅ Annulation - Compte préservé');
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// ---------- EDIT PROFIL ----------
app.get('/edit-profile', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div id="loader"><div class="spinner"></div><h3>Chargement profil...</h3></div>
          <div class="page-white" id="main-content" style="display:none;">
            <h2 style="color:#ff416c;">📝 Modifier Profil</h2>
            <form onsubmit="updateProfile(event)">
              <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📷 Photo</span>
              </div>
              <input type="file" id="i" style="display:none" onchange="preview(event)" accept="image/*">
              <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
              <input type="text" id="ln" class="input-box" placeholder="Nom" required>
              <select id="gender" class="input-box">
                <option value="">Genre</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
              <div style="text-align:left; margin-top:10px; padding-left:5px;">
                <small style="color:#666; font-size:0.75rem;">Date de naissance</small>
              </div>
              <input type="date" id="dob" class="input-box" style="margin-top:2px;">
              <input type="text" id="res" class="input-box" placeholder="Résidence">
              <select id="gt" class="input-box">
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
              </select>
              <div style="display:flex; gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;">
                  <option value="">Groupe</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;">
                  <option>+</option>
                  <option>-</option>
                </select>
              </div>
              <select id="pj" class="input-box">
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
              <div style="display:flex; gap:15px; margin-top:30px;">
                <button type="submit" class="btn-pink" style="flex:1;">💾 Sauvegarder</button>
                <button type="button" onclick="window.location.href='/profile'" class="btn-dark" style="flex:1;">❌ Annuler</button>
              </div>
            </form>
          </div>
        </div>
        
        <script>
          let b64 = "";
          let userId = "";
          
          window.onload = () => {
            try {
              const userDataStr = localStorage.getItem('current_user_data');
              if (!userDataStr) {
                showNotify('👤 Profil requis');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              
              const userData = JSON.parse(userDataStr);
              userId = localStorage.getItem('current_user_id');
              b64 = localStorage.getItem('current_user_photo') || "";
              
              if (!userId) {
                showNotify('❌ ID manquant');
                setTimeout(() => { window.location.href = '/profile'; }, 1000);
                return;
              }
              
              document.getElementById('fn').value = userData.firstName || "";
              document.getElementById('ln').value = userData.lastName || "";
              document.getElementById('gender').value = userData.gender || "";
              document.getElementById('dob').value = userData.dob || "";
              document.getElementById('res').value = userData.residence || "";
              document.getElementById('gt').value = userData.genotype || "";
              
              if (userData.bloodGroup) {
                const gs = userData.bloodGroup.match(/([ABO]+)([+-])/);
                if (gs) {
                  document.getElementById('gs_type').value = gs[1];
                  document.getElementById('gs_rh').value = gs[2];
                }
              }
              
              document.getElementById('pj').value = userData.desireChild || "";
              
              if (b64) {
                document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
                document.getElementById('t').style.display = 'none';
              }
              
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              
            } catch (e) {
              console.error('Edit profile error:', e);
              showNotify('❌ Erreur chargement');
            }
          };
          
          function preview(e) {
            const r = new FileReader();
            r.onload = () => {
              b64 = r.result;
              document.getElementById('c').style.backgroundImage = 'url(' + b64 + ')';
              document.getElementById('t').style.display = 'none';
            };
            r.readAsDataURL(e.target.files[0]);
          }
          
          async function updateProfile(e) {
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            document.getElementById('main-content').style.display = 'none';
            
            const updates = {
              firstName: document.getElementById('fn').value,
              lastName: document.getElementById('ln').value,
              gender: document.getElementById('gender').value,
              dob: document.getElementById('dob').value,
              residence: document.getElementById('res').value,
              genotype: document.getElementById('gt').value,
              bloodGroup: document.getElementById('gs_type').value ? 
                document.getElementById('gs_type').value + document.getElementById('gs_rh').value : "",
              desireChild: document.getElementById('pj').value,
              photo: b64
            };
            
            try {
              const response = await fetch('/api/update-account/' + userId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              
              const result = await response.json();
              
              if (response.ok) {
                localStorage.setItem('current_user_data', JSON.stringify(updates));
                if (b64) localStorage.setItem('current_user_photo', b64);
                showNotify('✅ Profil mis à jour !');
                setTimeout(() => { window.location.href = '/profile'; }, 1200);
              } else {
                throw new Error(result.error || 'Erreur serveur');
              }
            } catch (err) {
              document.getElementById('loader').style.display = 'none';
              document.getElementById('main-content').style.display = 'block';
              showNotify('❌ Erreur: ' + err.message);
            }
          }
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// ---------- NOTIFICATIONS SETTINGS ----------
app.get('/notifications-settings', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell">
          <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
          <div class="page-white">
            <h2 style="color:#ff416c;">🔔 Notifications</h2>
            
            <div style="margin:30px 0;">
              <div class="st-group">
                <div class="st-item">
                  <span>Notifications push</span>
                  <label class="switch">
                    <input type="checkbox" id="push-toggle" onchange="togglePush()">
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div id="push-status" style="padding:20px; background:#f8f9fa; border-radius:15px; margin:20px 0; text-align:center;">
              <p>Vérification du statut...</p>
            </div>
            
            <button onclick="testNotification()" class="btn-dark" style="margin:20px 0;">📱 Tester notification</button>
            <button onclick="window.location.href='/settings'" class="btn-pink">Retour</button>
          </div>
        </div>
        
        <script>
          async function checkPushStatus() {
            if (!('Notification' in window) || !('serviceWorker' in navigator)) {
              document.getElementById('push-status').innerHTML = 
                '<p style="color:#666;">❌ Navigateur non compatible</p>';
              return;
            }
            
            const statusDiv = document.getElementById('push-status');
            const toggle = document.getElementById('push-toggle');
            
            if (Notification.permission === 'granted') {
              statusDiv.innerHTML = '<p style="color:#28a745;">✅ Notifications activées</p>';
              toggle.checked = true;
            } else if (Notification.permission === 'denied') {
              statusDiv.innerHTML = '<p style="color:#dc3545;">❌ Notifications bloquées<br><small>Débloquez dans les paramètres</small></p>';
              toggle.checked = false;
            } else {
              statusDiv.innerHTML = '<p style="color:#ff416c;">🔔 En attente d\'autorisation</p>';
              toggle.checked = false;
            }
          }
          
          async function togglePush() {
            if (Notification.permission === 'granted') {
              // Désactiver
              if (confirm('Désactiver les notifications push ?')) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                  await subscription.unsubscribe();
                  await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                  });
                }
                showNotify('🔕 Notifications désactivées');
              }
            } else {
              // Activer
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                const userId = localStorage.getItem('current_user_id');
                if (userId) {
                  const registration = await navigator.serviceWorker.register('/sw.js');
                  const response = await fetch('/api/vapid-public-key');
                  const { publicKey } = await response.json();
                  
                  const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                  });
                  
                  await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscription, userId })
                  });
                  
                  showNotify('✅ Notifications activées !');
                }
              }
            }
            checkPushStatus();
          }
          
          async function testNotification() {
            const userId = localStorage.getItem('current_user_id');
            if (!userId) {
              showNotify('❌ Connectez-vous d\'abord');
              return;
            }
            
            try {
              const response = await fetch('/api/send-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fromUserId: userId,
                  toUserId: userId,
                  message: 'Ceci est un test'
                })
              });
              
              const result = await response.json();
              if (result.notificationSent) {
                showNotify('✅ Notification de test envoyée !');
              } else {
                showNotify('❌ Échec du test');
              }
            } catch (err) {
              showNotify('❌ Erreur: ' + err.message);
            }
          }
          
          window.onload = () => {
            checkPushStatus();
          };
        </script>
        ${notifyScript}
      </body>
    </html>
  `);
});

// ---------- CHAT ----------
app.get('/chat', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body>
        <div class="app-shell" style="background:#f0f2f5; height:100vh; overflow:hidden;">
          <div class="chat-header">
            <button class="btn-quit" onclick="if(confirm('Quitter ?')) location.href='/chat-end'">←</button>
            <div class="digital-clock"><span id="timer-display">30:00</span></div>
            <button class="btn-logout-badge" onclick="if(confirm('Déconnecter ?')) location.href='/logout-success'">Logout</button>
          </div>
          
          <div class="chat-messages" id="box">
            <div class="bubble received">
              Bonjour ! Ton profil m'intéresse
            </div>
          </div>
          
          <div class="input-area">
            <textarea id="msg" placeholder="Écrivez ici..."></textarea>
            <button onclick="send()">➤</button>
          </div>
        </div>
        
        <script>
          let t = 1800;
          
          function startTimer() {
            setInterval(() => {
              t--;
              let m = Math.floor(t / 60);
              let s = t % 60;
              document.getElementById('timer-display').innerText = 
                (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
              
              if (t <= 0) {
                localStorage.clear();
                window.location.href = '/logout-success';
              }
            }, 1000);
          }
          
          function send() {
            const i = document.getElementById('msg');
            if (i.value.trim()) {
              const d = document.createElement('div');
              d.className = 'bubble sent';
              d.innerHTML = i.value;
              document.getElementById('box').appendChild(d);
              i.value = "";
              document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
          }
          
          startTimer();
        </script>
      </body>
    </html>
  `);
});

// ---------- CHAT END ----------
app.get('/chat-end', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body class="end-overlay">
        <div class="end-card">
          <div style="font-size:50px; margin-bottom:10px;">✨</div>
          <h2 style="color:#1a2a44;">Merci pour cet échange</h2>
          <p style="color:#666; margin-bottom:30px;">Genlove vous remercie.</p>
          <a href="/matching" class="btn-pink" style="width:100%; margin:0;">🔎 Autre profil</a>
        </div>
      </body>
    </html>
  `);
});

// ---------- LOGOUT SUCCESS ----------
app.get('/logout-success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${head}${styles}</head>
      <body class="end-overlay">
        <div class="end-card">
          <div style="font-size:50px; margin-bottom:20px;">🛡️</div>
          <h2 style="color:#1a2a44;">Session fermée</h2>
          <p style="color:#666; margin-bottom:30px;">Sécurité assurée.</p>
          <button onclick="location.href='/'" class="btn-dark" style="width:100%; margin:0; border-radius:50px; cursor:pointer; border:none;">
            Quitter
          </button>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// 9. DÉMARRAGE DU SERVEUR
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Genlove V4.4 sur port ${port}`);
  console.log("✅ V4.4: SUPPRIMER COMPTE + CONFIG SANTÉ FONCTIONNELS ✓");
  console.log("✅ Boutons Enregistrer/Annuler santé + Supprimer/Annuler OK");
  console.log("✅ Web Push Notifications intégrées");
  console.log("✅ Tous les designs préservés");
  console.log(`📱 Rendez-vous sur http://localhost:${port}`);
});