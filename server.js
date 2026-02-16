// ============================================
// SERVEUR COMPLET GENLOVE V4.4 - 100% RENDER
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webPush = require('web-push');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI).then(() => console.log("✅ MongoDB OK")).catch(err => console.error("❌ MongoDB:", err));

const vapidKeys = webPush.generateVAPIDKeys();
webPush.setVapidDetails('mailto:contact@genlove.com', vapidKeys.publicKey, vapidKeys.privateKey);

const UserSchema = new mongoose.Schema({
  firstName: String, lastName: String, gender: String, dob: String, residence: String,
  genotype: { type: String, enum: ['AA', 'AS', 'SS'] }, bloodGroup: String,
  desireChild: { type: String, enum: ['Oui', 'Non'] }, photo: { type: String, default: "https://via.placeholder.com/150" },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true, unique: true },
  keys: { p256dh: String, auth: String },
  createdAt: { type: Date, default: Date.now }
});
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

function calculerAge(dateNaissance) {
  if (!dateNaissance) return "???";
  const today = new Date(), birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    const subscriptions = await Subscription.find({ userId });
    if (!subscriptions.length) return false;
    const payload = JSON.stringify({ title, body, icon: '/icon-192x192.png', data, vibrate: [200,100,200] });
    const promises = subscriptions.map(async sub => {
      try {
        await webPush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        return true;
      } catch (error) {
        if (error.statusCode === 410) await Subscription.deleteOne({ _id: sub._id });
        return false;
      }
    });
    return (await Promise.all(promises)).filter(Boolean).length > 0;
  } catch (error) {
    console.error("Notification error:", error);
    return false;
  }
}

// API ROUTES
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ success: true, user: newUser._id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/update-account/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/delete-account/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Subscription.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vapid-public-key', (req, res) => res.json({ publicKey: vapidKeys.publicKey }));

app.post('/api/subscribe', async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    await Subscription.findOneAndDelete({ endpoint: subscription.endpoint });
    const newSub = new Subscription({ userId, endpoint: subscription.endpoint, keys: subscription.keys });
    await newSub.save();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/send-request', async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ error: "User not found" });
    await sendNotificationToUser(toUserId, "💌 Nouvelle demande", "Quelqu'un souhaite vous contacter !", { fromUserId });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PAGE PRINCIPALE
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove</title>
    <style>body{font-family:Segoe UI,sans-serif;background:#fdf2f2;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .container{max-width:400px;background:#f8f9fa;padding:40px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.1);text-align:center;}
    .logo{font-size:3em;font-weight:bold;background:linear-gradient(45deg,#ff416c,#1a2a44);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .btn{background:#ff416c;color:white;padding:15px 30px;border:none;border-radius:50px;font-weight:bold;cursor:pointer;display:block;margin:15px auto;text-decoration:none;}
    </style>
  </head><body>
    <div class="container">
      <div class="logo">Genlove ❤️</div>
      <p style="color:#666;margin:20px 0;">Trouvez l'amour compatible avec votre santé</p>
      <a href="/profile" class="btn">Se connecter</a>
      <a href="/signup" class="btn" style="background:#1a2a44;">Créer compte</a>
    </div>
  </body></html>`);
});

app.get('/profile', (req, res) => res.redirect('/'));
app.get('/signup', (req, res) => res.redirect('/'));
app.get('*', (req, res) => res.redirect('/'));

app.listen(PORT, () => {
  console.log(`🚀 Genlove V4.4 sur port ${PORT}`);
});