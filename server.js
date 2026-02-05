const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
<title>Genlove - Mobile</title>
<style>
body{margin:0;font-family:sans-serif;background:#f0f2f5;display:flex;justify-content:center;height:100vh;overflow:hidden}
.screen{display:none;flex-direction:column;height:100%;width:100%;max-width:450px;background:white;position:relative}
.active{display:flex}
.chat-header{background:#9dbce3;color:white;padding:12px 15px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.btn{cursor:pointer;border:none;border-radius:8px;padding:8px 15px;font-weight:bold}
.btn-quit{background:#fff;color:#9dbce3;width:32px;height:32px;display:flex;align-items:center;justify-content:center}
.btn-logout-badge{background:#1a2a44;color:white}
.digital-clock{background:#1a1a1a;color:#ff416c;padding:6px 15px;border-radius:10px;font-family:'Courier New',monospace;font-weight:bold;font-size:1.1rem;display:inline-flex;align-items:center;border:1px solid #333}
.heart{color:#ff416c;animation:heartbeat 1s infinite;margin-right:8px}
@keyframes heartbeat{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
.chat-messages{flex:1;padding:15px;background:#f8fafb;overflow-y:auto;display:flex;flex-direction:column;gap:10px;box-sizing:border-box}
.bubble{padding:12px 16px;border-radius:18px;max-width:80%;line-height:1.4;white-space:pre-wrap}
.received{background:#e2ecf7;align-self:flex-start}
.sent{background:#ff416c;color:white;align-self:flex-end}
.input-area{position:fixed;bottom:0;width:100%;max-width:450px;padding:10px 15px 15px 15px;border-top:1px solid #eee;display:flex;gap:10px;background:white;align-items:flex-end;box-sizing:border-box}
.input-area textarea{flex:1;background:#f1f3f4;border:1px solid #ddd;padding:12px;border-radius:25px;outline:none;resize:none;font-family:sans-serif;max-height:150px;overflow-y:auto}
.final-bg{background:linear-gradient(135deg,#4a76b8 0%,#1a2a44 100%);color:white;justify-content:center;align-items:center;text-align:center;display:flex;flex-direction:column;height:100%}
.final-card{background:white;color:#333;border-radius:30px;padding:40px 25px;width:85%;box-shadow:0 15px 40px rgba(0,0,0,.3)}
.btn-restart{background:#ff416c;color:white;width:100%;padding:16px;border-radius:30px;font-weight:bold;font-size:1.1rem;cursor:pointer;margin-top:25px}
</style>
</head>
<body>
<div id="app-root" class="screen active"></div>
<audio id="sound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>
<script>
const root=document.getElementById('app-root');let timeLeft=1800,timerInterval,currentPulse=null;
function renderScreen(html){root.innerHTML=html;}
function renderHome(){renderScreen('<div class="screen active"><h1>Genlove</h1><p>Avez-vous déjà un compte ?</p><button onclick="renderProfile()">Se connecter</button><button onclick="renderSignup()">Créer un compte</button></div>');}
function renderSignup(){renderScreen('<div class="screen active"><input placeholder="Nom"><input placeholder="Email"><input type="date"><button onclick="renderMatching()">Continuer</button><button onclick="renderHome()">⬅ Retour</button></div>');}
function renderProfile(){renderScreen('<div class="screen active"><input placeholder="Email"><input type="password" placeholder="Mot de passe"><button onclick="renderMatching()">Se connecter</button><button onclick="renderHome()">⬅ Retour</button></div>');}
function renderMatching(){renderScreen('<div class="screen active"><div><strong>Sarah, 25 ans</strong><p>Intéressée par la santé et relations sérieuses</p><button onclick="startChat()">💌 Chat</button></div><button onclick="renderHome()">⬅ Retour</button></div>');}
function startChat(){
renderScreen('<div class="screen active"><div class="chat-header"><button class="btn btn-quit" onclick="showFinal(\'chat\')">✕</button><div class="digital-clock"><span class="heart">❤️</span><span id="timer">30:00</span></div><button class="btn btn-logout-badge" onclick="showFinal(\'app\')">Logout 🔒</button></div><div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Ton profil correspond à ce que je recherche. 👋</div></div><div class="input-area"><textarea id="msg" placeholder="Écrivez votre message..." rows="1" oninput="autoGrow(this)"></textarea><button onclick="send()">➤</button></div></div>');
startTimer();adjustKeyboard();}
function autoGrow(e){e.style.height="auto";e.style.height=e.scrollHeight+"px";}
function send(){const i=document.getElementById('msg');if(i.value.trim()){const d=document.createElement('div');d.className='bubble sent';d.innerText=i.value;document.getElementById('box').appendChild(d);i.value='';i.style.height='auto';document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight;}}
function showFinal(t,a=false){if(!a&&!confirm(t==='chat'?"Quitter la conversation ?":"Se déconnecter ?"))return;clearInterval(timerInterval);stopSound();renderScreen('<div class="screen final-bg active"><div class="final-card"><h2>'+ (t==='chat'?"Merci pour cet échange":"Merci pour votre confiance") +'</h2><p>'+ (t==='chat'?"Genlove vous remercie pour ce moment.":"Session fermée en sécurité.") +'</p><button class="btn-restart" onclick="renderHome()">🔎 Accueil</button></div></div>');}
function startTimer(){if(timerInterval)return;timeLeft=1800;timerInterval=setInterval(()=>{timeLeft--;let m=Math.floor(timeLeft/60),s=timeLeft%60;let d=document.getElementById('timer');if(d)d.innerText=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;if([60,40,20].includes(timeLeft))triggerRhythm();if(timeLeft===5)triggerFinal();if(timeLeft<=0){clearInterval(timerInterval);stopSound();showFinal('chat',true);}},1000);}
function stopSound(){const a=document.getElementById('sound');a.pause();a.loop=false;a.currentTime=0;if(currentPulse){clearInterval(currentPulse);currentPulse=null;}}
function triggerRhythm(){stopSound();const a=document.getElementById('sound');let e=0;currentPulse=setInterval(()=>{a.currentTime=0;a.play().catch(()=>{});if(navigator.vibrate)navigator.vibrate(100);e+=400;if(e>=5000)stopSound();},400);}
function triggerFinal(){stopSound();const a=document.getElementById('sound');a.loop=true;a.play().catch(()=>{});if(navigator.vibrate)navigator.vibrate([1000,500,1000,500,1000]);setTimeout(()=>stopSound(),5000);}
function adjustKeyboard(){const t=document.getElementById('msg');if(!t)return;t.addEventListener('focus',()=>{document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight});window.addEventListener('resize',()=>{document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight});}
renderHome();
</script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`));
