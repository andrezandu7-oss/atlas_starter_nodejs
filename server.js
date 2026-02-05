const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
<title>Genlove - Mobile Friendly</title>
<style>
body{margin:0;font-family:sans-serif;background:#f0f2f5;display:flex;justify-content:center;overflow:hidden;height:100vh}
.app-shell{width:100%;max-width:450px;height:100vh;display:flex;flex-direction:column;position:relative;background:white}
.screen{display:none;flex-direction:column;position:relative;height:100%;background:white}
.active{display:flex}
.chat-header{background:#9dbce3;color:white;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.btn-quit,.btn-logout-badge{cursor:pointer}
.btn-quit{background:#fff;color:#9dbce3;border:none;width:32px;height:32px;border-radius:8px;font-size:1.2rem;font-weight:bold;display:flex;align-items:center;justify-content:center}
.btn-logout-badge{background:#1a2a44;color:white;border:none;padding:8px 15px;border-radius:8px;font-size:.85rem;font-weight:bold}
.digital-clock{background:#1a1a1a;color:#ff416c;padding:6px 15px;border-radius:10px;font-family:'Courier New',monospace;font-weight:bold;font-size:1.1rem;display:inline-flex;align-items:center;border:1px solid #333}
.heart-icon{display:inline-block;color:#ff416c;animation:heartbeat 1s infinite;margin-right:8px}
@keyframes heartbeat{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
.chat-messages{flex:1;padding:15px;background:#f8fafb;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-bottom:100px;width:100%}
.bubble{padding:12px 16px;border-radius:18px;max-width:80%;line-height:1.4;white-space:pre-wrap}
.received{background:#e2ecf7;align-self:flex-start}
.sent{background:#ff416c;color:white;align-self:flex-end}
.input-area{position:absolute;bottom:0;width:100%;padding:10px 15px 15px 15px;border-top:1px solid #eee;display:flex;gap:10px;background:white;align-items:flex-end;box-sizing:border-box}
.input-area textarea{flex:1;background:#f1f3f4;border:1px solid #ddd;padding:12px;border-radius:25px;outline:none;resize:none;font-family:sans-serif;max-height:150px;overflow-y:auto}
.final-bg{background:linear-gradient(135deg,#4a76b8 0%,#1a2a44 100%);color:white;justify-content:center;align-items:center;text-align:center;display:flex;flex-direction:column;height:100%}
.final-card{background:white;color:#333;border-radius:30px;padding:40px 25px;width:85%;box-shadow:0 15px 40px rgba(0,0,0,.3)}
.btn-restart{background:#ff416c;color:white;border:none;padding:16px;border-radius:30px;width:100%;font-weight:bold;font-size:1.1rem;cursor:pointer;margin-top:25px}
.btn-secondary{background:none;border:1px solid #ccc;color:#666;padding:12px;border-radius:30px;width:100%;font-weight:bold;cursor:pointer;margin-top:10px}
</style>
</head>
<body>
<div class="app-shell" id="app-root"></div>
<audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>
<script>
const root=document.getElementById('app-root');let timeLeft=1800,timerInterval,alertsEnabled=true,currentPulseInterval=null;
function renderHome(){root.innerHTML='<div class="screen active"><h1>Genlove</h1><p>Avez-vous déjà un compte ?</p><button onclick="renderProfile()">Se connecter</button><button onclick="renderSignup()">Créer un compte</button></div>';}
function renderSignup(){root.innerHTML='<div class="screen active"><input placeholder="Nom complet"><input placeholder="Email"><input type="date"><button onclick="renderMatching()">Continuer</button><button onclick="renderHome()">⬅ Retour</button></div>';}
function renderProfile(){root.innerHTML='<div class="screen active"><input placeholder="Email"><input type="password" placeholder="Mot de passe"><button onclick="renderMatching()">Se connecter</button><button onclick="renderHome()">⬅ Retour</button></div>';}
function renderMatching(){root.innerHTML='<div class="screen active"><div><strong>Sarah, 25 ans</strong><p>Intéressée par la santé et relations sérieuses</p><button onclick="startChat()">💌 Chat</button></div><button onclick="renderHome()">⬅ Retour</button></div>';}
function startChat(){root.innerHTML='<div id="screen-chat" class="screen active"><div class="chat-header"><button class="btn-quit" onclick="showFinal(\'chat\')">✕</button><div class="digital-clock"><span class="heart-icon">❤️</span><span id="timer-display">30:00</span></div><button class="btn-logout-badge" onclick="showFinal(\'app\')">Logout 🔒</button></div><div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div></div><div class="input-area"><textarea id="msg" placeholder="Écrivez votre message..." rows="1" oninput="autoGrow(this)"></textarea><button onclick="send()">➤</button></div></div>';startTimer();adjustChatOnKeyboard();}
function autoGrow(e){e.style.height="auto";e.style.height=e.scrollHeight+"px";}
function send(){const i=document.getElementById('msg');if(i.value.trim()){const d=document.createElement('div');d.className='bubble sent';d.innerText=i.value;document.getElementById('box').appendChild(d);i.value='';i.style.height='auto';document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight;}}
function showFinal(t,a=false){if(!a&&!confirm(t==='chat'?"Voulez-vous quitter cette conversation ?":"Voulez-vous vous déconnecter ?"))return;clearInterval(timerInterval);stopAllSounds();root.innerHTML='<div class="screen final-bg active"><div class="final-card"><h2>'+ (t==='chat'?"Merci pour cet échange":"Merci pour votre confiance") +'</h2><p>'+ (t==='chat'?"Genlove vous remercie pour ce moment de partage.":"Votre session a été fermée en toute sécurité.") +'</p><button class="btn-restart" onclick="renderHome()">🔎 Retour à l\\'accueil</button></div></div>';}
function startTimer(){if(timerInterval)return;timeLeft=1800;timerInterval=setInterval(()=>{timeLeft--;let m=Math.floor(timeLeft/60),s=timeLeft%60;let d=document.getElementById('timer-display');if(d)d.innerText=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;if([60,40,20].includes(timeLeft))triggerRhythmicAlarm();if(timeLeft===5)triggerFinalAlarm();if(timeLeft<=0){clearInterval(timerInterval);stopAllSounds();showFinal('chat',true);}},1000);}
function stopAllSounds(){const a=document.getElementById('lastMinuteSound');a.pause();a.loop=false;a.currentTime=0;if(currentPulseInterval){clearInterval(currentPulseInterval);currentPulseInterval=null;}}
function triggerRhythmicAlarm(){if(!alertsEnabled)return;stopAllSounds();const a=document.getElementById('lastMinuteSound');let e=0;currentPulseInterval=setInterval(()=>{a.currentTime=0;a.play().catch(()=>{});if(navigator.vibrate)navigator.vibrate(100);e+=400;if(e>=5000)stopAllSounds();},400);}
function triggerFinalAlarm(){if(!alertsEnabled)return;stopAllSounds();const a=document.getElementById('lastMinuteSound');a.loop=true;a.play().catch(()=>{});if(navigator.vibrate)navigator.vibrate([1000,500,1000,500,1000]);setTimeout(()=>{stopAllSounds();},5000);}
function adjustChatOnKeyboard(){const t=document.getElementById('msg');if(!t)return;t.addEventListener('focus',()=>{document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight});window.addEventListener('resize',()=>{document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight});}
renderHome();
</script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`));
