// 🚀 GENLOVE V4.5 - SERVEUR COMPLET DÉPLOYABLE RENDER
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI).then(() => console.log("✅ MongoDB OK")).catch(err => console.error("❌ MongoDB:", err));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

const UserSchema = new mongoose.Schema({
    firstName: String, lastName: String, gender: String, dob: String, residence: String,
    genotype: String, bloodGroup: String, desireChild: String, photo: { type: String, default: "https://via.placeholder.com/150?text=👤" },
    blockedUsers: [String], createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: String, timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="manifest" href="/manifest.json"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💕</text></svg>"><meta name="theme-color" content="#ff416c"><title>Genlove</title>`;
const styles = `<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#fdf2f2;display:flex;justify-content:center}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.1)}#genlove-notify{position:fixed;top:10px;left:10px;right:10px;background:#1a2a44;color:white;padding:15px;border-radius:12px;z-index:9999;display:none;align-items:center;gap:10px}.show{display:flex}#loader{display:none;position:fixed;inset:0;background:white;z-index:100;justify-content:center;align-items:center;flex-direction:column}.spinner{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #ff416c;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.home-screen{padding:30px;text-align:center}.logo-text{font-size:3.5rem;font-weight:bold}.slogan{color:#1a2a44;font-weight:bold;margin:40px 0;font-size:1rem}.page-white{background:white;min-height:100vh;padding:25px 20px;text-align:center}.photo-circle{width:110px;height:110px;border:2px dashed #ff416c;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;cursor:pointer}.input-box{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:12px;margin:10px 0;font-size:1rem;box-sizing:border-box;background:#f8f9fa}.btn-pink{background:#ff416c;color:white;padding:18px;border-radius:50px;text-align:center;font-weight:bold;display:block;width:85%;margin:20px auto;border:none;cursor:pointer}.btn-dark{background:#1a2a44;color:white;padding:18px;border-radius:12px;font-weight:bold;display:block;margin:15px auto}.st-group{background:white;border-radius:15px;margin:0 15px 15px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05)}.st-item{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid #f8f8f8}.match-card{background:white;margin:10px 15px;padding:15px;border-radius:15px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}.match-photo-blur{width:55px;height:55px;border-radius:50%;background:#eee;filter:blur(6px);background-size:cover}.chat-container{padding:20px;height:calc(100vh - 200px);overflow-y:auto;background:#f8f9fa}.chat-message{margin:10px 0;padding:12px 16px;border-radius:18px;max-width:80%}.chat-sent{background:#ff416c;color:white;margin-left:auto;text-align:right}.chat-received{background:#e9ecef;margin-right:auto}.chat-input{display:flex;gap:10px;padding:15px;background:white;border-top:1px solid #eee;position:sticky;bottom:0}</style>`;
const notifyScript = `<script>function showNotify(msg){const n=document.getElementById('genlove-notify');if(n){n.innerText=msg;n.style.display='flex';setTimeout(()=>{n.style.display='none';},3500);}}</script>`;

function calculerAge(dateNaissance){if(!dateNaissance)return"???";const today=new Date(),birthDate=new Date(dateNaissance);let age=today.getFullYear()-birthDate.getFullYear();const monthDiff=today.getMonth()-birthDate.getMonth();if(monthDiff<0||(monthDiff===0&&today.getDate()<birthDate.getDate()))age--;return age;}

app.post('/api/messages', async (req, res) => {
    try {
        const { senderID, receiverID, text } = req.body;
        const message = new Message({ senderID, receiverID, text });
        await message.save();
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ error: "Erreur envoi" });
    }
});

app.get('/api/messages/:u1/:u2', async (req, res) => {
    try {
        const { u1, u2 } = req.params;
        const messages = await Message.find({
            $or: [{ senderID: u1, receiverID: u2 }, { senderID: u2, receiverID: u1 }]
        }).populate('senderID', 'firstName').sort({ timestamp: 1 }).lean();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Erreur chargement" });
    }
});

app.delete('/api/messages/:u1/:u2', async (req, res) => {
    try {
        const { u1, u2 } = req.params;
        await Message.deleteMany({
            $or: [{ senderID: u1, receiverID: u2 }, { senderID: u2, receiverID: u1 }]
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erreur suppression" });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ success: true, user: user._id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/update-account/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: "Erreur" });
    }
});

app.delete('/api/delete-account/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Erreur" });
    }
});

app.post('/api/block-user', async (req, res) => {
    try {
        const { userId, blockedId } = req.body;
        await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: blockedId } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Erreur" });
    }
});

app.get('/', (req, res) => res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé</div><a href="/profile" class="btn-dark">Se connecter</a><a href="/charte-engagement" style="color:#1a2a44;font-weight:bold;display:block;margin-top:15px;">Créer un compte</a></div></div>${notifyScript}</body></html>`));

app.get('/chat', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body>
    <div class="app-shell">
        <div style="background:white;padding:20px;text-align:center;position:sticky;top:0;z-index:10;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <a href="/inbox" style="font-size:1.4rem;">←</a>
                <h3>Discussion</h3>
                <div>
                    <button style="background:#dc3545;color:white;padding:8px 12px;border-radius:8px;border:none;margin-right:5px;cursor:pointer;" onclick="blockUser()">🚫</button>
                    <button style="background:#6c757d;color:white;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;" onclick="deleteChat()">🗑️</button>
                </div>
            </div>
        </div>
        <div id="chat-messages" style="padding:20px;height:calc(100vh - 200px);overflow-y:auto;background:#f8f9fa;"></div>
        <div style="display:flex;gap:10px;padding:15px;background:white;border-top:1px solid #eee;">
            <input id="message-input" style="flex:1;padding:12px;border:1px solid #ddd;border-radius:25px;outline:none;" placeholder="Votre message..." onkeypress="if(event.key==='Enter')sendMessage()">
            <button onclick="sendMessage()" style="width:50px;height:50px;border-radius:50%;background:#ff416c;color:white;border:none;font-size:1.2em;">→</button>
        </div>
    </div>
    <script>
    let currentChatId=sessionStorage.getItem('chatPartnerId');
    let userId=localStorage.getItem('current_user_id');
    async function loadMessages(){
        if(!currentChatId||!userId)return;
        try{
            const response=await fetch('/api/messages/'+userId+'/'+currentChatId);
            const messages=await response.json();
            document.getElementById('chat-messages').innerHTML=messages.map(m=>{
                const isMe=m.senderID===userId?'chat-sent':'chat-received';
                return '<div class="chat-message '+isMe+'">'+m.text+'</div>';
            }).join('');
            document.getElementById('chat-messages').scrollTop=document.getElementById('chat-messages').scrollHeight;
        }catch(e){console.error('Erreur:',e);}
    }
    async function sendMessage(){
        const input=document.getElementById('message-input');
        const text=input.value.trim();
        if(!text||!currentChatId)return;
        try{
            await fetch('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({senderID:userId,receiverID:currentChatId,text})
            });
            input.value='';
            loadMessages();
        }catch(e){alert('Erreur envoi');}
    }
    async function blockUser(){
        if(confirm('Bloquer ?')){
            await fetch('/api/block-user',{method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({userId:userId,blockedId:currentChatId})
            });
            alert('Bloqué');
            setTimeout(()=>location.href='/inbox',1500);
        }
    }
    async function deleteChat(){
        if(confirm('Supprimer discussion ?')){
            await fetch('/api/messages/'+userId+'/'+currentChatId,{method:'DELETE'});
            alert('Supprimé');
            setTimeout(()=>location.href='/inbox',1500);
        }
    }
    loadMessages();
    setInterval(loadMessages,3000);
    </script>${notifyScript}</body></html>`);
});

app.get('/inbox', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body style="background:#f4f7f6;">
    <div class="app-shell">
        <div style="padding:20px;background:white;text-align:center;border-bottom:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <a href="/profile" style="font-size:1.4rem;">←</a>
                <h3>📨 Boîte de réception</h3>
                <a href="/matching" style="font-size:1.4rem;">➕</a>
            </div>
        </div>
        <div style="padding:15px;">Aucune conversation pour le moment</div>
        <a href="/profile" class="btn-pink" style="margin:20px;">← Retour profil</a>
    </div>${notifyScript}</body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body style="background:#f8f9fa;">
    <div class="app-shell">
        <div style="background:white;padding:30px 20px;text-align:center;border-radius:0 0 30px 30px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <a href="/" style="background:#eff6ff;color:#1a2a44;padding:8px 14px;border-radius:12px;font-size:0.8rem;">🏠</a>
                <a href="/settings" style="font-size:1.4rem;">⚙️</a>
            </div>
            <div style="width:110px;height:110px;border-radius:50%;border:3px solid #ff416c;margin:20px auto;background:#eee;"></div>
            <h2>Profil</h2>
            <p style="color:#666;">📍 Luanda</p>
        </div>
        <div style="padding:15px 20px 5px;font-size:0.75rem;color:#888;">MES INFORMATIONS</div>
        <div class="st-group">
            <div class="st-item"><span>Génotype</span><b>AA</b></div>
            <div class="st-item"><span>Âge</span><b>28 ans</b></div>
            <div class="st-item"><span>Résidence</span><b>Luanda</b></div>
        </div>
        <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a>
        <a href="/inbox" class="btn-pink" style="margin:10px 20px;">📨 Boîte réception</a>
    </div>${notifyScript}</body></html>`);
});

app.get('/matching', async (req, res) => {
    const users = await User.find({}).limit(10).lean();
    const matchesHTML = users.map(u => `
        <div class="match-card">
            <div class="match-photo-blur" style="background-image:url(${u.photo})"></div>
            <div style="flex:1">
                <b>${u.firstName} ${u.lastName?.[0] || ''}.</b>
                <br><small>${calculerAge(u.dob)} ans • ${u.residence || 'Luanda'} • ${u.genotype}</small>
            </div>
            <div>
                <button class="btn-action btn-contact" onclick="sessionStorage.setItem('chatPartnerId','${u._id}');location.href='/chat'">Contacter</button>
            </div>
        </div>
    `).join('') || '<p style="text-align:center;color:#666;padding:40px;">Aucun partenaire</p>';
    
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body style="background:#f4f7f6;">
    <div class="app-shell">
        <div style="padding:20px;background:white;text-align:center;border-bottom:1px solid #eee;">
            <h3 style="margin:0;color:#1a2a44;">Partenaires (${users.length})</h3>
        </div>
        <div style="padding:10px;">${matchesHTML}</div>
        <a href="/profile" class="btn-pink">← Retour</a>
    </div>${notifyScript}</body></html>`);
});

app.listen(port, () => {
    console.log(`🚀 Genlove V4.5 live sur port ${port}`);
});