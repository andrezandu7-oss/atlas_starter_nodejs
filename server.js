const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ======================================================
   STYLES & NOTIFICATION — PARTIE 1 (INCHANGÉE)
====================================================== */

const styles = `
<style>
body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
.app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }

#genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; gap: 10px; transition: 0.5s; z-index: 9999; }
#genlove-notify.show { top: 20px; }

.btn-pink { background:#ff416c; color:white; padding:18px; border-radius:50px; text-align:center; font-weight:bold; border:none; cursor:pointer; margin:20px; }
.btn-dark { background:#1a2a44; color:white; padding:15px; border-radius:12px; text-align:center; font-weight:bold; text-decoration:none; margin:15px; display:block; }

.match-card { background:white; margin:10px; padding:15px; border-radius:15px; display:flex; gap:12px; align-items:center; }
.match-photo-blur { width:55px; height:55px; border-radius:50%; background:#ccc; filter:blur(6px); }

.btn-action { border:none; border-radius:8px; padding:8px 12px; font-size:0.8rem; cursor:pointer; }
.btn-contact { background:#1a2a44; color:white; }
</style>
`;

const notifyScript = `
<script>
function showNotify(msg){
  const n=document.getElementById('genlove-notify');
  document.getElementById('notify-msg').innerText=msg;
  n.classList.add('show');
  setTimeout(()=>n.classList.remove('show'),3000);
}
</script>
`;

/* ======================================================
   ROUTES PRINCIPALES — PARTIE 1
====================================================== */

app.get('/', (req, res) => {
res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0">${styles}</head>
<body><div class="app-shell">
<h2 style="text-align:center;margin-top:40px;">Gen<span style="color:#ff416c">love</span></h2>
<a href="/matching" class="btn-dark">Entrer</a>
</div></body></html>`);
});

app.get('/matching', (req, res) => {
res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0">${styles}</head>
<body><div class="app-shell">
<div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>

<h3 style="padding:20px;">Partenaires compatibles</h3>

<div class="match-card">
  <div class="match-photo-blur"></div>
  <div style="flex:1"><b>Profil #1</b><br><small>Génotype AA</small></div>
  <button class="btn-action btn-contact" onclick="location.href='/conversation'">Contacter</button>
</div>

<a href="/" class="btn-pink">Retour</a>
</div>${notifyScript}</body></html>`);
});

/* ======================================================
   CONVERSATION — PARTIE 2 (100 % INTACTE)
====================================================== */

const conversationPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
<title>Genlove – Conversation</title>

<style>
body { font-family:sans-serif; background:#f0f2f5; margin:0; display:flex; justify-content:center; height:100vh; }
.screen { display:none; width:100%; max-width:450px; height:100vh; background:white; flex-direction:column; }
.active { display:flex; }
.chat-header { background:#9dbce3; color:white; padding:12px; display:flex; justify-content:space-between; }
.chat-messages { flex:1; padding:15px; overflow-y:auto; background:#f8fafb; }
.bubble { padding:12px 16px; border-radius:18px; max-width:80%; margin-bottom:10px; }
.received { background:#e2ecf7; }
.sent { background:#ff416c; color:white; margin-left:auto; }
.input-area { display:flex; gap:10px; padding:10px; border-top:1px solid #eee; }
</style>
</head>

<body>
<div class="screen active">
  <div class="chat-header">
    <button onclick="location.href='/matching'">✕</button>
    <b>❤️ 30:00</b>
    <button onclick="location.href='/'">Logout</button>
  </div>

  <div class="chat-messages" id="box">
    <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche 👋</div>
  </div>

  <div class="input-area">
    <input id="msg" style="flex:1;padding:10px;border-radius:20px;border:1px solid #ccc">
    <button onclick="send()">➤</button>
  </div>
</div>

<script>
function send(){
 const input=document.getElementById('msg');
 if(input.value.trim()){
  const d=document.createElement('div');
  d.className='bubble sent';
  d.innerText=input.value;
  document.getElementById('box').appendChild(d);
  input.value='';
 }
}
</script>
</body>
</html>
`;

app.get('/conversation', (req, res) => {
res.send(conversationPage);
});

/* ======================================================
   SERVER
====================================================== */

app.listen(port, () => {
console.log('✅ Genlove prêt et déployable sur le port ' + port);
});
