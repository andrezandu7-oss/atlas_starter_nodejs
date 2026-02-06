const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.urlencoded({extended:true}));
app.get('/',(req,res)=>{res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>Genlove</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f8f9fa;display:flex;justify-content:center;align-items:center;min-height:100vh;flex-direction:column}.container{width:100%;max-width:400px;background:#fff;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1);overflow:hidden}.header{padding:30px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white}.header h1{font-size:2.5rem;font-weight:700;margin:0}.header p{font-size:1.1rem;margin:10px 0 20px;opacity:0.9}.screen{display:none;padding:30px;flex-direction:column;gap:20px}.screen.active{display:flex}.btn{display:block;width:100%;padding:16px 20px;border:none;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s;text-decoration:none;text-align:center}.btn-primary{background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:white;box-shadow:0 4px 15px rgba(255,107,107,0.4)}.btn-secondary{background:#6c757d;color:white}.btn-success{background:#28a745;color:white}.input-group{position:relative}.input-group input{width:100%;padding:16px 20px;border:2px solid #e9ecef;border-radius:12px;font-size:1rem;background:#fff;transition:border-color 0.3s;box-sizing:border-box}.input-group input:focus{border-color:#ff6b6b;outline:none;box-shadow:0 0 0 3px rgba(255,107,107,0.1)}.profile-photo{width:100px;height:100px;border-radius:50%;border:4px solid #ff6b6b;margin:0 auto 15px;background:#f8f9fa;display:flex;align-items:center;justify-content:center;font-size:2rem}.match-card{background:#f8f9fa;border-radius:15px;padding:20px;margin:10px 0;border-left:4px solid #ff6b6b}.match-info h4{margin:0 0 5px;font-size:1.2rem}.match-info p{margin:0;color:#6c757d;font-size:0.9rem}.chat-header{background:#667eea;color:white;padding:20px;text-align:center;position:sticky;top:0;z-index:10}.chat-messages{min-height:300px;max-height:400px;overflow-y:auto;padding:20px;background:#f1f3f5;border-radius:15px;margin:20px 0}.message{display:flex;margin-bottom:15px}.message.sent{justify-content:flex-end}.message-bubble{max-width:70%;padding:12px 16px;border-radius:20px;font-size:0.95rem;line-height:1.4}.message.received .message-bubble{background:#fff;border:1px solid #dee2e6}.message.sent .message-bubble{background:#ff6b6b;color:white}.chat-input{position:sticky;bottom:0;background:#fff;padding:20px 0;border-top:1px solid #dee2e6;display:flex;gap:10px}.chat-input input{flex:1;padding:15px;border:2px solid #e9ecef;border-radius:25px;font-size:1rem}.chat-input input:focus{border-color:#ff6b6b;outline:none}.chat-input button{width:50px;height:50px;border:none;border-radius:50%;background:#ff6b6b;color:white;font-size:1.2rem;cursor:pointer;flex-shrink:0}@media (max-width:480px){.container{margin:10px;border-radius:15px}.header{padding:25px 15px}.header h1{font-size:2.2rem}}</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>Gen<span style="color:#ff6b6b">love</span></h1>
<p>Trouvez l'amour en parfaite compatibilité génétique</p>
</div>

<div id="screen-welcome" class="screen active">
<div style="text-align:center;margin-bottom:30px">
<div class="profile-photo" style="background:#667eea">👤</div>
<p style="color:#6c757d;margin:10px 0">Application de matching santé</p>
</div>
<button class="btn btn-primary" onclick="showScreen('profile')">Se connecter</button>
<button class="btn btn-secondary" onclick="showScreen('signup')">Créer un compte</button>
</div>

<div id="screen-signup" class="screen">
<h2 style="color:#333;margin-bottom:20px">Configuration Santé</h2>
<div class="input-group"><input type="text" id="firstname" placeholder="Prénom" value="Jean"></div>
<div class="input-group"><input type="text" id="lastname" placeholder="Nom" value="Dupont"></div>
<div class="input-group"><input type="date" id="birthdate"></div>
<div class="input-group">
<select id="genotype">
<option value="">Génotype *</option>
<option value="AA">AA</option>
<option value="AS">AS</option>
<option value="SS">SS</option>
</select>
</div>
<div class="input-group">
<select id="bloodtype">
<option value="">Groupe sanguin *</option>
<option value="A+">A+</option>
<option value="A-">A-</option>
<option value="B+">B+</option>
<option value="B-">B-</option>
<option value="AB+">AB+</option>
<option value="AB-">AB-</option>
<option value="O+">O+</option>
<option value="O-">O-</option>
</select>
</div>
<div class="input-group"><input type="text" id="location" placeholder="Ville" value="Luanda"></div>
<div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:12px;padding:15px;margin:20px 0">
<input type="checkbox" id="oath" style="width:24px;height:24px;margin-right:10px">
<label for="oath" style="font-size:0.95rem;color:#856404;font-weight:500">Je certifie que mes informations médicales sont exactes</label>
</div>
<button class="btn btn-primary" onclick="saveProfile()">🚀 Valider mon profil</button>
<button class="btn btn-secondary" onclick="showScreen('welcome')">← Retour</button>
</div>

<div id="screen-profile" class="screen">
<div style="text-align:center;margin-bottom:30px">
<div class="profile-photo" id="profilePhoto" style="background:#28a745">✅</div>
<h2 id="profileName">Jean Dupont</h2>
<p id="profileInfo" style="color:#6c757d;margin:10px 0">Chargement...</p>
</div>
<div style="background:#f8f9fa;padding:20px;border-radius:15px;margin:20px 0">
<h3 style="margin:0 0 15px;color:#333">Mes informations</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;font-size:0.95rem">
<div><strong>Génotype:</strong> <span id="profileGenotype">--</span></div>
<div><strong>Sanguin:</strong> <span id="profileBlood">--</span></div>
</div>
</div>
<button class="btn btn-primary" onclick="showScreen('matching')">🔍 Lancer le matching</button>
<button class="btn btn-secondary" onclick="showScreen('settings')">⚙️ Paramètres</button>
</div>

<div id="screen-matching" class="screen">
<h2 style="color:#333;margin-bottom:25px;text-align:center">💞 Partenaires Compatibles</h2>
<div class="match-card">
<div class="match-info">
<h4>Sarah (28 ans)</h4>
<p>AA • O+ • Luanda • Famille</p>
</div>
<button class="btn btn-success" style="width:auto;padding:12px 24px;font-size:1rem;margin-left:auto" onclick="startChat('Sarah')">💬 Contacter</button>
</div>
<div class="match-card">
<div class="match-info">
<h4>Léa (26 ans)</h4>
<p>AA • B- • Luanda • Stable</p>
</div>
<button class="btn btn-success" style="width:auto;padding:12px 24px;font-size:1rem;margin-left:auto" onclick="startChat('Léa')">💬 Contacter</button>
</div>
<button class="btn btn-secondary" onclick="showScreen('profile')">← Retour profil</button>
</div>

<div id="screen-chat" class="screen">
<div class="chat-header">
<h3>💬 Chat avec Sarah</h3>
<div style="font-size:1.2rem;font-weight:700;margin-top:5px">28:45</div>
</div>
<div class="chat-messages" id="chatMessages">
<div class="message received">
<div class="message-bubble">Bonjour ! Ton profil santé correspond parfaitement au mien 😊</div>
</div>
</div>
<div class="chat-input">
<input type="text" id="chatInput" placeholder="Tapez votre message..." onkeypress="if(event.keyCode==13)sendMessage()">
<button onclick="sendMessage()">➤</button>
</div>
</div>

<div id="screen-settings" class="screen">
<h2 style="color:#333;margin-bottom:25px">⚙️ Paramètres</h2>
<div style="background:#f8f9fa;padding:25px;border-radius:15px;margin-bottom:25px">
<h4 style="margin:0 0 15px">Confidentialité</h4>
<div style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:#fff;border-radius:12px">
<span>Profil public</span>
<label style="position:relative;display:inline-block;width:50px;height:28px">
<input type="checkbox" checked style="opacity:0;width:0;height:0">
<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#ccc;transition:.4s;border-radius:28px">
<span style="position:absolute;content:'';height:24px;width:24px;left:2px;bottom:2px;background:white;transition:.4s;border-radius:50%"></span>
</span>
</label>
</div>
</div>
<button class="btn btn-secondary" onclick="showScreen('profile')">← Retour</button>
</div>
</div>

<script>
let currentUser={};
function showScreen(screenId){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('screen-'+screenId).classList.add('active')}
function saveProfile(){if(!document.getElementById('oath').checked){alert('Veuillez confirmer vos informations médicales');return}currentUser={firstname:document.getElementById('firstname').value,lastname:document.getElementById('lastname').value,genotype:document.getElementById('genotype').value,bloodtype:document.getElementById('bloodtype').value,location:document.getElementById('location').value};localStorage.setItem('genlove_user',JSON.stringify(currentUser));document.getElementById('profileName').textContent=currentUser.firstname+' '+currentUser.lastname;document.getElementById('profileInfo').textContent='28 ans • '+currentUser.location;document.getElementById('profileGenotype').textContent=currentUser.genotype;document.getElementById('profileBlood').textContent=currentUser.bloodtype;showScreen('profile');alert('✅ Profil médical sauvegardé!')}
function startChat(name){document.querySelector('.chat-header h3').textContent='💬 Chat avec '+name;showScreen('chat')}
function sendMessage(){const input=document.getElementById('chatInput'),msg=input.value.trim();if(msg){const messages=document.getElementById('chatMessages'),div=document.createElement('div');div.className='message sent';div.innerHTML='<div class="message-bubble">'+msg+'</div>';messages.appendChild(div);input.value='';messages.scrollTop=messages.scrollHeight}}
const saved=localStorage.getItem('genlove_user');if(saved){currentUser=JSON.parse(saved);document.getElementById('firstname').value=currentUser.firstname||'';document.getElementById('lastname').value=currentUser.lastname||'';document.getElementById('genotype').value=currentUser.genotype||'';document.getElementById('bloodtype').value=currentUser.bloodtype||'';document.getElementById('location').value=currentUser.location||'';showScreen('profile')}
</script>
</body></html>`})
app.listen(port,()=>console.log('Genlove ready'));
