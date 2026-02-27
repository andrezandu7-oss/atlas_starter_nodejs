const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDB = require('connect-mongodb');
const app = express();
const port = process.env.PORT || 3000;

// ======================
// CONNEXION MONGODB
// ======================
const mongouRI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';

mongoose.connect(mongouRI)
.then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
.catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ======================
// CONFIGURATION SESSION
// ======================
app.set('trust proxy', 1);

const sessionConfig = {
 secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
 resave: false,
 saveUninitialized: false,
 store: MongoDB.create({mongoUrl: mongouRI}),
 cookie: {
   maxAge: 1000*60*60*24*30,
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax'
 },
 proxy: true
}

app.use(session(sessionConfig));

// ======================
// MODELEs DE DONNEES
// ======================

const userSchema = new mongoose.Schema({
 firstName: { type: String, required: true },
 lastName: { type: String, required: true },
 gender: String,
 dob: String,
 residence: String,
 region: { type: String, default: "" },
 genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
 bloodGroup: String,
 desireChild: String,
 photo: String,
 language: {type: String, default: 'fr'},
 isVerified: {type: Boolean, default: false},
 isPublic: {type: Boolean, default: true},
 blockedUsers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
 blockedBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
 rejectedRequests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
 createdAt: {type: Date, default: Date.now},
 // QR Code fields
 qrVerified: {type: Boolean, default: false},
 verifiedBy: String,
 verifiedAt: Date,
 verificationBadge: {type: String, enum: ['none', 'self', 'lab'], default: 'none'}
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
 senderId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 text: {type: String, required: true},
 timestamp: {type: Date, default: Date.now},
 read: {type: Boolean, default: false},
 isBlocked: {type: Boolean, default: false}
});

const Message = mongoose.model('Message', messageSchema);

const requestSchema = new mongoose.Schema({
 senderId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'},
 viewed: {type: Boolean, default: false},
 createdAt: {type: Date, default: Date.now}
});

const Request = mongoose.model('Request', requestSchema);

// ================================
// MIDDLEWARE
// ================================
app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb'}));

const requireAuth = (req, res, next) => {
 if (!req.session.userId) return res.redirect('/');
 next();
};

// ===============================================
// SYSTÈME DE TRADUCTION MULTILINGUE (6 LANGUES)
// ===============================================
const translations = {
 fr: {
   appName: 'Genlove',
   slogan: 'Unissez cœur et santé pour bâtir des couples sains ❤️',
   security: '🔒 Vos données de santé sont cryptées',
   welcome: 'Bienvenue sur Genlove',
   haveAccount: 'Avez-vous déjà un compte ?',
   login: 'Se connecter',
   createAccount: 'Créer un compte',
   loginTitle: 'Connexion',
   enterName: 'Entrez votre prénom pour vous connecter',
   yourName: 'Votre prénom',
   backHome: 'Retour à l\'accueil',
   nameNotFound: 'Prénom non trouvé. Veuillez créer un compte.',
   charterTitle: '📜 La Charte d\'Honneur',
   charterSubtitle: 'Lisez attentivement ces 5 engagements',
   scrollDown: '👇 Faites défiler jusqu\'en bas 👇',
   accept: 'J\'accepte et je continue',
   oath1: '1. Le Serment de Sincérité',
   oath1Sub: 'Vérité Médicale',
   oath1Text: 'Je m\'engage sur l\'honneur à fournir des informations exactes concernant mon génotype et mes données de santé.',
   oath2: '2. Le Pacte de Confidentialité',
   oath2Sub: 'Secret Partagé',
   oath2Text: 'Je m\'engage à garder confidentielles toutes les informations personnelles et médicales.',
   oath3: '3. Le Principe de Non-Discrimination',
   oath3Sub: 'Égalité de Respect',
   oath3Text: 'Je traite chaque membre avec dignité, quel que soit son génotype.',
   oath4: '4. La Responsabilité Préventive',
   oath4Sub: 'Orientation Santé',
   oath4Text: 'J\'accepte les mesures de protection comme le filtrage des compatibilités à risque.',
   oath5: '5. La Bienveillance Éthique',
   oath5Sub: 'Courtoisie',
   oath5Text: 'J\'adopte une conduite exemplaire et respectueuse dans mes messages.',
   signupTitle: 'Créer mon profil',
   signupSub: 'Toutes les informations sont confidentielles',
   firstName: 'Prénom',
   lastName: 'Nom',
   gender: 'Genre',
   male: 'Homme',
   female: 'Femme',
   dob: 'Date de naissance',
   city: 'Ville de résidence',
   region: 'Région',
   allRegions: 'Toutes les régions',
   myRegion: 'Ma région uniquement',
   genotype: 'Génotype',
   bloodGroup: 'Groupe sanguin',
   desireChild: 'Désir d\'enfant ?',
   yes: 'Oui',
   no: 'Non',
   createProfile: 'Créer mon profil',
   backCharter: '← Retour à la charte',
   required: 'obligatoire',
   honorTitle: 'Serment d\'Honneur',
   honorText: 'Je confirme sur mon honneur que mes informations sont sincères et conformes à la réalité.',
   swear: 'Je le jure',
   accessProfile: 'Accéder à mon profil',
   myProfile: 'Mon Profil',
   home: 'Accueil',
   messages: 'Messages',
   settings: 'Paramètres',
   genotype_label: 'Génotype',
   blood_label: 'Groupe',
   age_label: 'Âge',
   residence_label: 'Résidence',
   region_label: 'Région',
   project_label: 'Projet',
   findPartner: 'Trouver un partenaire',
   editProfile: 'Modifier mon profil',
   compatiblePartners: 'Partenaires compatibles',
   noPartners: 'Aucun partenaire trouvé pour le moment',
   searchOngoing: 'Recherche en cours...',
   expandCommunity: 'Nous élargissons notre communauté. Revenez bientôt !',
   details: 'Détails',
   contact: 'Contacter',
   backProfile: '← Mon profil',
   toMessages: 'Messages →',
   healthCommitment: 'Votre engagement santé',
   popupMessageAS: 'En tant que profil AS, nous ne vous présentons que des partenaires AA. Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose.',
   popupMessageSS: 'En tant que profil SS, nous ne vous présentons que des partenaires AA. Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose.',
   understood: 'J\'ai compris',
   inboxTitle: 'Boîte de réception',
   emptyInbox: 'Boîte vide',
   startConversation: 'Commencez une conversation !',
   findPartners: 'Trouver des partenaires',
   block: 'Bloquer',
   unblock: 'Débloquer',
   yourMessage: 'Votre message...',
   send: 'Envoyer',
   blockedByUser: 'Conversation impossible',
   blockedMessage: 'Cet utilisateur vous a bloqué. Vous ne pouvez pas lui envoyer de messages.',
   settingsTitle: 'Paramètres',
   visibility: 'Visibilité du profil',
   notifications: 'Notifications push',
   language: 'Langue',
   blockedUsers: 'Utilisateurs bloqués',
   dangerZone: '⚠️ ZONE DE DANGER',
   deleteAccount: 'Supprimer mon compte',
   delete: 'Supprimer',
   logout: 'Déconnexion',
   confirmDelete: 'Supprimer définitivement ?',
   noBlocked: 'Aucun utilisateur bloqué',
   thankYou: 'Merci pour cet échange',
   thanksMessage: 'Genlove vous remercie',
   newSearch: 'Nouvelle recherche',
   logoutSuccess: 'Déconnexion réussie',
   seeYouSoon: 'À bientôt !',
   french: 'Français',
   english: 'English',
   portuguese: 'Português',
   spanish: 'Español',
   arabic: 'العربية',
   chinese: '中文',
   pageNotFound: 'Page non trouvée',
   pageNotFoundMessage: 'La page que vous cherchez n\'existe pas.',
   project_life: 'Projet de vie',
   interestPopup: '{name} est très attiré par votre profil car vous partagez une bonne compatibilité. Pouvez-vous prendre quelques minutes pour échanger ?',
   acceptRequest: '✓ Accepter',
   rejectRequest: '✗ Refuser',
   rejectionPopup: 'Désolé, {name} n\'a pas donné une suite favorable à votre demande. Lancez d\'autres recherches.',
   gotIt: 'J\'ai compris',
   returnProfile: 'Mon profil',
   newMatch: 'Nouvelle recherche',
   sendingRequest: 'Votre demande est en cours d\'envoi...',
   requestSent: 'Demande envoyée !',
   january: 'Janvier',
   february: 'Février',
   march: 'Mars',
   april: 'Avril',
   may: 'Mai',
   june: 'Juin',
   july: 'Juillet',
   august: 'Août',
   september: 'Septembre',
   october: 'Octobre',
   november: 'Novembre',
   december: 'Décembre',
   day: 'Jour',
   month: 'Mois',
   year: 'Année',
   // QR Code translations
   withCertificate: 'Avec certificat médical',
   manualEntry: 'Manuellement',
   scanAutomatic: 'Scan automatique de vos données',
   freeEntry: '✎ DONNÉES PERSONNELLES (MODIFIABLES)',
   dataFromCertificate: '✔ DONNÉES CERTIFICAT MÉDICAL (NON MODIFIABLES)',
   locationHelp: 'Aider les personnes les plus proches de chez vous à vous contacter facilement',
   yourLocation: 'Votre localisation',
   lifeProject: 'Projet de vie',
   protectedSource: 'Protégé (source: certificat)',
   successMessage: 'Profil mis à jour avec succès',
   errorMessage: 'Erreur lors de la modification',
   photoPlaceholder: 'Photo de profil'
 },
 en: {
   appName: 'Genlove',
   slogan: 'Unite heart and health to build healthy couples ❤️',
   security: '🔒 Your health data is encrypted',
   welcome: 'Welcome to Genlove',
   haveAccount: 'Already have an account?',
   login: 'Login',
   createAccount: 'Create account',
   loginTitle: 'Login',
   enterName: 'Enter your first name to login',
   yourName: 'Your first name',
   backHome: 'Back to home',
   nameNotFound: 'Name not found. Please create an account.',
   charterTitle: '📜 The Honor Charter',
   charterSubtitle: 'Read these 5 commitments carefully',
   scrollDown: '👇 Scroll to the bottom 👇',
   accept: 'I accept and continue',
   oath1: '1. The Oath of Sincerity',
   oath1Sub: 'Medical Truth',
   oath1Text: 'I pledge on my honor to provide accurate information about my genotype and health data.',
   oath2: '2. The Pact of Confidentiality',
   oath2Sub: 'Shared Secret',
   oath2Text: 'I commit to keeping all personal and medical information confidential.',
   oath3: '3. The Principle of Non-Discrimination',
   oath3Sub: 'Equality of Respect',
   oath3Text: 'I treat every member with dignity, regardless of their genotype.',
   oath4: '4. Preventive Responsibility',
   oath4Sub: 'Health Orientation',
   oath4Text: 'I accept protective measures such as filtering risky compatibilities.',
   oath5: '5. Ethical Benevolence',
   oath5Sub: 'Courtesy',
   oath5Text: 'I adopt exemplary and respectful conduct in my messages.',
   signupTitle: 'Create my profile',
   signupSub: 'All information is confidential',
   firstName: 'First name',
   lastName: 'Last name',
   gender: 'Gender',
   male: 'Male',
   female: 'Female',
   dob: 'Date of birth',
   city: 'City of residence',
   region: 'Region',
   allRegions: 'All regions',
   myRegion: 'My region only',
   genotype: 'Genotype',
   bloodGroup: 'Blood group',
   desireChild: 'Desire for children?',
   yes: 'Yes',
   no: 'No',
   createProfile: 'Create my profile',
   backCharter: '← Back to charter',
   required: 'required',
   honorTitle: 'Oath of Honor',
   honorText: 'I confirm on my honor that my information is sincere and conforms to reality.',
   swear: 'I swear',
   accessProfile: 'Access my profile',
   myProfile: 'My Profile',
   home: 'Home',
   messages: 'Messages',
   settings: 'Settings',
   genotype_label: 'Genotype',
   blood_label: 'Blood',
   age_label: 'Age',
   residence_label: 'Residence',
   region_label: 'Region',
   project_label: 'Project',
   findPartner: 'Find a partner',
   editProfile: 'Edit my profile',
   compatiblePartners: 'Compatible partners',
   noPartners: 'No partners found at the moment',
   searchOngoing: 'Search in progress...',
   expandCommunity: 'We are expanding our community. Come back soon!',
   details: 'Details',
   contact: 'Contact',
   backProfile: '← My profile',
   toMessages: 'Messages →',
   healthCommitment: 'Your health commitment',
   popupMessageAS: 'As an AS profile, we only show you AA partners. This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease.',
   popupMessageSS: 'As an SS profile, we only show you AA partners. This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease.',
   understood: 'I understand',
   inboxTitle: 'Inbox',
   emptyInbox: 'Empty inbox',
   startConversation: 'Start a conversation!',
   findPartners: 'Find partners',
   block: 'Block',
   unblock: 'Unblock',
   yourMessage: 'Your message...',
   send: 'Send',
   blockedByUser: 'Conversation impossible',
   blockedMessage: 'This user has blocked you. You cannot send them messages.',
   settingsTitle: 'Settings',
   visibility: 'Profile visibility',
   notifications: 'Push notifications',
   language: 'Language',
   blockedUsers: 'Blocked users',
   dangerZone: '⚠️ DANGER ZONE',
   deleteAccount: 'Delete my account',
   delete: 'Delete',
   logout: 'Logout',
   confirmDelete: 'Delete permanently?',
   noBlocked: 'No blocked users',
   thankYou: 'Thank you for this exchange',
   thanksMessage: 'Genlove thanks you',
   newSearch: 'New search',
   logoutSuccess: 'Logout successful',
   seeYouSoon: 'See you soon!',
   french: 'French',
   english: 'English',
   portuguese: 'Portuguese',
   spanish: 'Spanish',
   arabic: 'Arabic',
   chinese: 'Chinese',
   pageNotFound: 'Page not found',
   pageNotFoundMessage: 'The page you are looking for does not exist.',
   project_life: 'Life project',
   interestPopup: '{name} is very attracted to your profile because you share good compatibility. Can you take a few minutes to chat?',
   acceptRequest: '✓ Accept',
   rejectRequest: '✗ Reject',
   rejectionPopup: 'Sorry, {name} did not give a favorable response to your request. Start other searches.',
   gotIt: 'Got it',
   returnProfile: 'My profile',
   newMatch: 'New search',
   sendingRequest: 'Your request is being sent...',
   requestSent: 'Request sent!',
   january: 'January',
   february: 'February',
   march: 'March',
   april: 'April',
   may: 'May',
   june: 'June',
   july: 'July',
   august: 'August',
   september: 'September',
   october: 'October',
   november: 'November',
   december: 'December',
   day: 'Day',
   month: 'Month',
   year: 'Year',
   withCertificate: 'With medical certificate',
   manualEntry: 'Manually',
   scanAutomatic: 'Automatic scan of your data',
   freeEntry: '✎ PERSONAL DATA (EDITABLE)',
   dataFromCertificate: '✔ MEDICAL CERTIFICATE DATA (NON-EDITABLE)',
   locationHelp: 'Help people near you to contact you easily',
   yourLocation: 'Your location',
   lifeProject: 'Life project',
   protectedSource: 'Protected (source: certificate)',
   successMessage: 'Profile updated successfully',
   errorMessage: 'Error during update',
   photoPlaceholder: 'Profile photo'
 },
 pt: {
   appName: 'Genlove',
   slogan: 'Una coração e saúde para construir casais saudáveis ❤️',
   security: '🔒 Seus dados de saúde estão criptografados',
   welcome: 'Bem-vindo ao Genlove',
   haveAccount: 'Já tem uma conta?',
   login: 'Entrar',
   createAccount: 'Criar conta',
   loginTitle: 'Entrar',
   enterName: 'Digite seu primeiro nome para entrar',
   yourName: 'Seu primeiro nome',
   backHome: '← Voltar ao início',
   nameNotFound: 'Nome não encontrado. Por favor, crie uma conta.',
   charterTitle: '📜 A Carta de Honra',
   charterSubtitle: 'Leia estes 5 compromissos atentamente',
   scrollDown: '👇 Role até o final 👇',
   accept: 'Aceito e continuo',
   oath1: '1. O Juramento de Sinceridade',
   oath1Sub: 'Verdade Médica',
   oath1Text: 'Comprometo-me, sob minha honra, a fornecer informações precisas sobre meu genótipo e dados de saúde.',
   oath2: '2. O Pacto de Confidencialidade',
   oath2Sub: 'Segredo Compartilhado',
   oath2Text: 'Comprometo-me a manter todas as informações pessoais e médicas confidenciais.',
   oath3: '3. O Princípio da Não-Discriminação',
   oath3Sub: 'Igualdade de Respeito',
   oath3Text: 'Trato cada membro com dignidade, independentemente do seu genótipo.',
   oath4: '4. Responsabilidade Preventiva',
   oath4Sub: 'Orientação para a Saúde',
   oath4Text: 'Aceito medidas de proteção como a filtragem de compatibilidades de risco.',
   oath5: '5. Benevolência Ética',
   oath5Sub: 'Cortesia',
   oath5Text: 'Adoto uma conduta exemplar e respeitosa em minhas mensagens.',
   signupTitle: 'Criar meu perfil',
   signupSub: 'Todas as informações são confidenciais',
   firstName: 'Primeiro nome',
   lastName: 'Sobrenome',
   gender: 'Gênero',
   male: 'Homem',
   female: 'Mulher',
   dob: 'Data de nascimento',
   city: 'Cidade de residência',
   region: 'Região',
   allRegions: 'Todas as regiões',
   myRegion: 'Minha região apenas',
   genotype: 'Genótipo',
   bloodGroup: 'Grupo sanguíneo',
   desireChild: 'Desejo de ter filhos?',
   yes: 'Sim',
   no: 'Não',
   createProfile: 'Criar meu perfil',
   backCharter: '← Voltar à carta',
   required: 'obrigatório',
   honorTitle: 'Juramento de Honra',
   honorText: 'Confirmo por minha honra que minhas informações são sinceras e conformes à realidade.',
   swear: 'Eu juro',
   accessProfile: 'Acessar meu perfil',
   myProfile: 'Meu Perfil',
   home: 'Início',
   messages: 'Mensagens',
   settings: 'Configurações',
   genotype_label: 'Genótipo',
   blood_label: 'Grupo',
   age_label: 'Idade',
   residence_label: 'Residência',
   region_label: 'Região',
   project_label: 'Projeto',
   findPartner: 'Encontrar parceiro(a)',
   editProfile: 'Editar perfil',
   compatiblePartners: 'Parceiros compatíveis',
   noPartners: 'Nenhum parceiro encontrado no momento',
   searchOngoing: 'Pesquisa em andamento...',
   expandCommunity: 'Estamos expandindo nossa comunidade. Volte em breve!',
   details: 'Detalhes',
   contact: 'Contatar',
   backProfile: '← Meu perfil',
   toMessages: 'Mensagens →',
   healthCommitment: 'Seu compromisso com a saúde',
   popupMessageAS: 'Como perfil AS, mostramos apenas parceiros AA. Esta escolha responsável garante a serenidade do seu futuro lar e protege seus descendentes contra a doença falciforme.',
   popupMessageSS: 'Como perfil SS, mostramos apenas parceiros AA. Esta escolha responsável garante a serenidade do seu futuro lar e protege seus descendentes contra a doença falciforme.',
   understood: 'Entendi',
   inboxTitle: 'Caixa de entrada',
   emptyInbox: 'Caixa vazia',
   startConversation: 'Comece uma conversa!',
   findPartners: 'Encontrar parceiros',
   block: 'Bloquear',
   unblock: 'Desbloquear',
   yourMessage: 'Sua mensagem...',
   send: 'Enviar',
   blockedByUser: 'Conversa impossível',
   blockedMessage: 'Este usuário bloqueou você. Não é possível enviar mensagens.',
   settingsTitle: 'Configurações',
   visibility: 'Visibilidade do perfil',
   notifications: 'Notificações push',
   language: 'Idioma',
   blockedUsers: 'Usuários bloqueados',
   dangerZone: '⚠️ ZONA DE PERIGO',
   deleteAccount: 'Excluir minha conta',
   delete: 'Excluir',
   logout: 'Sair',
   confirmDelete: 'Excluir permanentemente?',
   noBlocked: 'Nenhum usuário bloqueado',
   thankYou: 'Obrigado por este encontro',
   thanksMessage: 'Genlove agradece',
   newSearch: 'Nova pesquisa',
   logoutSuccess: 'Saída bem-sucedida',
   seeYouSoon: 'Até breve!',
   french: 'Francês',
   english: 'Inglês',
   portuguese: 'Português',
   spanish: 'Espanhol',
   arabic: 'Árabe',
   chinese: 'Chinês',
   pageNotFound: 'Página não encontrada',
   pageNotFoundMessage: 'A página que você procura não existe.',
   project_life: 'Projeto de vida',
   interestPopup: '{name} está muito atraído(a) pelo seu perfil porque vocês compartilham boa compatibilidade. Você pode alguns minutos para conversar?',
   acceptRequest: '✓ Aceitar',
   rejectRequest: '✗ Recusar',
   rejectionPopup: 'Desculpe, {name} não deu um retorno favorável ao seu pedido. Faça outras pesquisas.',
   gotIt: 'Entendi',
   returnProfile: 'Meu perfil',
   newMatch: 'Nova pesquisa',
   sendingRequest: 'Seu pedido está sendo enviado...',
   requestSent: 'Pedido enviado!',
   january: 'Janeiro',
   february: 'Fevereiro',
   march: 'Março',
   april: 'Abril',
   may: 'Maio',
   june: 'Junho',
   july: 'Julho',
   august: 'Agosto',
   september: 'Setembro',
   october: 'Outubro',
   november: 'Novembro',
   december: 'Dezembro',
   day: 'Dia',
   month: 'Mês',
   year: 'Ano',
   withCertificate: 'Com certificado médico',
   manualEntry: 'Manualmente',
   scanAutomatic: 'Leitura automática dos seus dados',
   freeEntry: '✎ DADOS PESSOAIS (EDITÁVEIS)',
   dataFromCertificate: '✔ DADOS DO CERTIFICADO MÉDICO (NÃO EDITÁVEIS)',
   locationHelp: 'Ajude as pessoas mais próximas de você a contatá-lo facilmente',
   yourLocation: 'Sua localização',
   lifeProject: 'Projeto de vida',
   protectedSource: 'Protegido (fonte: certificado)',
   successMessage: 'Perfil atualizado com sucesso',
   errorMessage: 'Erro ao atualizar',
   photoPlaceholder: 'Foto de perfil'
 },
 es: {
   appName: 'Genlove',
   slogan: 'Une corazón y salud para construir parejas saludables ❤️',
   security: '🔒 Sus datos de salud están encriptados',
   welcome: 'Bienvenido a Genlove',
   haveAccount: '¿Ya tienes una cuenta?',
   login: 'Iniciar sesión',
   createAccount: 'Crear cuenta',
   loginTitle: 'Iniciar sesión',
   enterName: 'Ingrese su nombre para iniciar sesión',
   yourName: 'Su nombre',
   backHome: '← Volver al inicio',
   nameNotFound: 'Nombre no encontrado. Por favor, cree una cuenta.',
   charterTitle: '📜 La Carta de Honor',
   charterSubtitle: 'Lea estos 5 compromisos atentamente',
   scrollDown: '👇 Desplácese hasta el final 👇',
   accept: 'Acepto y continúo',
   oath1: '1. El Juramento de Sinceridad',
   oath1Sub: 'Verdad Médica',
   oath1Text: 'Me comprometo bajo mi honor a proporcionar información precisa sobre mi genotipo y datos de salud.',
   oath2: '2. El Pacto de Confidencialidad',
   oath2Sub: 'Secreto Compartido',
   oath2Text: 'Me comprometo a mantener toda la información personal y médica confidencial.',
   oath3: '3. El Principio de No Discriminación',
   oath3Sub: 'Igualdad de Respeto',
   oath3Text: 'Trato a cada miembro con dignidad, independientemente de su genotipo.',
   oath4: '4. Responsabilidad Preventiva',
   oath4Sub: 'Orientación para la Salud',
   oath4Text: 'Acepto medidas de protección como el filtrado de compatibilidades de riesgo.',
   oath5: '5. Benevolencia Ética',
   oath5Sub: 'Cortesía',
   oath5Text: 'Adopto una conducta ejemplar y respetuosa en mis mensajes.',
   signupTitle: 'Crear mi perfil',
   signupSub: 'Toda la información es confidencial',
   firstName: 'Nombre',
   lastName: 'Apellido',
   gender: 'Género',
   male: 'Hombre',
   female: 'Mujer',
   dob: 'Fecha de nacimiento',
   city: 'Ciudad de residencia',
   region: 'Región',
   allRegions: 'Todas las regiones',
   myRegion: 'Mi región solamente',
   genotype: 'Genotipo',
   bloodGroup: 'Grupo sanguíneo',
   desireChild: '¿Deseo de tener hijos?',
   yes: 'Sí',
   no: 'No',
   createProfile: 'Crear mi perfil',
   backCharter: '← Volver a la carta',
   required: 'obligatorio',
   honorTitle: 'Juramento de Honor',
   honorText: 'Confirmo bajo mi honor que mi información es sincera y conforme a la realidad.',
   swear: 'Lo juro',
   accessProfile: 'Acceder a mi perfil',
   myProfile: 'Mi Perfil',
   home: 'Inicio',
   messages: 'Mensajes',
   settings: 'Configuración',
   genotype_label: 'Genotipo',
   blood_label: 'Grupo',
   age_label: 'Edad',
   residence_label: 'Residencia',
   region_label: 'Región',
   project_label: 'Proyecto',
   findPartner: 'Encontrar pareja',
   editProfile: 'Editar perfil',
   compatiblePartners: 'Parejas compatibles',
   noPartners: 'No se encontraron parejas por el momento',
   searchOngoing: 'Búsqueda en curso...',
   expandCommunity: 'Estamos expandiendo nuestra comunidad. ¡Vuelva pronto!',
   details: 'Detalles',
   contact: 'Contactar',
   backProfile: '← Mi perfil',
   toMessages: 'Mensajes →',
   healthCommitment: 'Su compromiso con la salud',
   popupMessageAS: 'Como perfil AS, solo le mostramos parejas AA. Esta elección responsable garantiza la serenidad de su futuro hogar y protege a su descendencia contra la enfermedad de células falciformes.',
   popupMessageSS: 'Como perfil SS, solo le mostramos parejas AA. Esta elección responsable garantiza la serenidad de su futuro hogar y protege a su descendencia contra la enfermedad de células falciformes.',
   understood: 'Entiendo',
   inboxTitle: 'Bandeja de entrada',
   emptyInbox: 'Bandeja vacía',
   startConversation: '¡Comience una conversación!',
   findPartners: 'Encontrar parejas',
   block: 'Bloquear',
   unblock: 'Desbloquear',
   yourMessage: 'Su mensaje...',
   send: 'Enviar',
   blockedByUser: 'Conversación imposible',
   blockedMessage: 'Este usuario le ha bloqueado. No puede enviarle mensajes.',
   settingsTitle: 'Configuración',
   visibility: 'Visibilidad del perfil',
   notifications: 'Notificaciones push',
   language: 'Idioma',
   blockedUsers: 'Usuarios bloqueados',
   dangerZone: '⚠️ ZONA DE PELIGRO',
   deleteAccount: 'Eliminar mi cuenta',
   delete: 'Eliminar',
   logout: 'Cerrar sesión',
   confirmDelete: '¿Eliminar permanentemente?',
   noBlocked: 'No hay usuarios bloqueados',
   thankYou: 'Gracias por este intercambio',
   thanksMessage: 'Genlove le agradece',
   newSearch: 'Nueva búsqueda',
   logoutSuccess: 'Sesión cerrada',
   seeYouSoon: '¡Hasta pronto!',
   french: 'Francés',
   english: 'Inglés',
   portuguese: 'Portugués',
   spanish: 'Español',
   arabic: 'Árabe',
   chinese: 'Chino',
   pageNotFound: 'Página no encontrada',
   pageNotFoundMessage: 'La página que busca no existe.',
   project_life: 'Proyecto de vida',
   interestPopup: '{name} está muy atraído(a) por tu perfil porque comparten buena compatibilidad. ¿Puedes tomar unos minutos para conversar?',
   acceptRequest: '✓ Aceptar',
   rejectRequest: '✗ Rechazar',
   rejectionPopup: 'Lo sentimos, {name} no dio una respuesta favorable a tu solicitud. Realiza otras búsquedas.',
   gotIt: 'Entiendo',
   returnProfile: 'Mi perfil',
   newMatch: 'Nueva búsqueda',
   sendingRequest: 'Tu solicitud está siendo enviada...',
   requestSent: '¡Solicitud enviada!',
   january: 'Enero',
   february: 'Febrero',
   march: 'Marzo',
   april: 'Abril',
   may: 'Mayo',
   june: 'Junio',
   july: 'Julio',
   august: 'Agosto',
   september: 'Septiembre',
   october: 'Octubre',
   november: 'Noviembre',
   december: 'Diciembre',
   day: 'Día',
   month: 'Mes',
   year: 'Año',
   withCertificate: 'Con certificado médico',
   manualEntry: 'Manual',
   scanAutomatic: 'Escaneo automático de sus datos',
   freeEntry: '✎ DATOS PERSONALES (EDITABLES)',
   dataFromCertificate: '✔ DATOS DEL CERTIFICADO MÉDICO (NO EDITABLES)',
   locationHelp: 'Ayude a las personas más cercanas a contactarlo fácilmente',
   yourLocation: 'Su ubicación',
   lifeProject: 'Proyecto de vida',
   protectedSource: 'Protegido (fuente: certificado)',
   successMessage: 'Perfil actualizado con éxito',
   errorMessage: 'Error al actualizar',
   photoPlaceholder: 'Foto de perfil'
 },
 ar: {
   appName: 'جنلوف',
   slogan: 'وحدة القلب والصحة لبناء أزواج أصحاء ❤️',
   security: '🔒 بياناتك الصحية مشفرة',
   welcome: 'مرحباً بك في جنلوف',
   haveAccount: 'هل لديك حساب بالفعل؟',
   login: 'تسجيل الدخول',
   createAccount: 'إنشاء حساب',
   loginTitle: 'تسجيل الدخول',
   enterName: 'أدخل اسمك الأول لتسجيل الدخول',
   yourName: 'اسمك الأول',
   backHome: '← العودة إلى الرئيسية',
   nameNotFound: 'الاسم غير موجود. يرجى إنشاء حساب',
   charterTitle: '📜 ميثاق الشرف',
   charterSubtitle: 'اقرأ هذه الالتزامات الخمسة بعناية',
   scrollDown: '👇 انتقل إلى الأسفل 👇',
   accept: 'أقبل وأواصل',
   oath1: '١. قسم الإخلاص',
   oath1Sub: 'الحقيقة الطبية',
   oath1Text: 'أتعهد بشرفي بتقديم معلومات دقيقة عن نمطي الوراثي وبياناتي الصحية',
   oath2: '٢. ميثاق السرية',
   oath2Sub: 'السر المشترك',
   oath2Text: 'ألتزم بالحفاظ على سرية جميع المعلومات الشخصية والطبية',
   oath3: '٣. مبدأ عدم التمييز',
   oath3Sub: 'المساواة في الاحترام',
   oath3Text: 'أعامل كل عضو بكرامة بغض النظر عن نمطه الوراثي',
   oath4: '٤. المسؤولية الوقائية',
   oath4Sub: 'التوجيه الصحي',
   oath4Text: 'أقبل تدابير الحماية مثل تصفية التوافقيات الخطرة',
   oath5: '٥. الإحسان الأخلاقي',
   oath5Sub: 'المجاملة',
   oath5Text: 'أعتمد سلوكاً مثالياً ومحترماً في رسائلي',
   signupTitle: 'إنشاء ملفي الشخصي',
   signupSub: 'جميع المعلومات سرية',
   firstName: 'الاسم الأول',
   lastName: 'اسم العائلة',
   gender: 'الجنس',
   male: 'ذكر',
   female: 'أنثى',
   dob: 'تاريخ الميلاد',
   city: 'مدينة الإقامة',
   region: 'المنطقة',
   allRegions: 'جميع المناطق',
   myRegion: 'منطقتي فقط',
   genotype: 'النمط الوراثي',
   bloodGroup: 'فصيلة الدم',
   desireChild: 'الرغبة في الأطفال؟',
   yes: 'نعم',
   no: 'لا',
   createProfile: 'إنشاء ملفي الشخصي',
   backCharter: '← العودة إلى الميثاق',
   required: 'إلزامي',
   honorTitle: 'قسم الشرف',
   honorText: 'أؤكد بشرفي أن معلوماتي صادقة ومطابقة للواقع',
   swear: 'أقسم',
   accessProfile: 'الوصول إلى ملفي الشخصي',
   myProfile: 'ملفي الشخصي',
   home: 'الرئيسية',
   messages: 'الرسائل',
   settings: 'الإعدادات',
   genotype_label: 'النمط الوراثي',
   blood_label: 'الفصيلة',
   age_label: 'العمر',
   residence_label: 'الإقامة',
   region_label: 'المنطقة',
   project_label: 'المشروع',
   findPartner: 'العثور على شريك',
   editProfile: 'تعديل الملف الشخصي',
   compatiblePartners: 'الشركاء المتوافقون',
   noPartners: 'لم يتم العثور على شركاء في الوقت الحالي',
   searchOngoing: 'البحث جار...',
   expandCommunity: 'نحن نوسع مجتمعنا. عد قريباً!',
   details: 'التفاصيل',
   contact: 'اتصال',
   backProfile: '← ملفي الشخصي',
   toMessages: '→ الرسائل',
   healthCommitment: 'التزامك الصحي',
   popupMessageAS: 'كملف AS، نحن نعرض لك فقط شركاء AA. هذا الاختيار المسؤول يضمن سكينة منزلك المستقبلي ويحمي نسلك من مرض الخلايا المنجلية',
   popupMessageSS: 'كملف SS، نحن نعرض لك فقط شركاء AA. هذا الاختيار المسؤول يضمن سكينة منزلك المستقبلي ويحمي نسلك من مرض الخلايا المنجلية',
   understood: 'فهمت',
   inboxTitle: 'صندوق الوارد',
   emptyInbox: 'صندوق فارغ',
   startConversation: 'ابدأ محادثة!',
   findPartners: 'العثور على شركاء',
   block: 'حظر',
   unblock: 'إلغاء الحظر',
   yourMessage: 'رسالتك...',
   send: 'إرسال',
   blockedByUser: 'محادثة غير ممكنة',
   blockedMessage: 'هذا المستخدم قام بحظرك. لا يمكنك إرسال رسائل له',
   settingsTitle: 'الإعدادات',
   visibility: 'رؤية الملف الشخصي',
   notifications: 'إشعارات فورية',
   language: 'اللغة',
   blockedUsers: 'المستخدمون المحظورون',
   dangerZone: '⚠️ منطقة الخطر',
   deleteAccount: 'حذف حسابي',
   delete: 'حذف',
   logout: 'تسجيل الخروج',
   confirmDelete: 'حذف نهائياً؟',
   noBlocked: 'لا يوجد مستخدمين محظورين',
   thankYou: 'شكرا لهذا التبادل',
   thanksMessage: 'جينلوف تشكرك',
   newSearch: 'بحث جديد',
   logoutSuccess: 'تم تسجيل الخروج بنجاح',
   seeYouSoon: 'أراك قريباً!',
   french: 'الفرنسية',
   english: 'الإنجليزية',
   portuguese: 'البرتغالية',
   spanish: 'الإسبانية',
   arabic: 'العربية',
   chinese: 'الصينية',
   pageNotFound: 'الصفحة غير موجودة',
   pageNotFoundMessage: 'الصفحة التي تبحث عنها غير موجودة',
   project_life: 'مشروع الحياة',
   interestPopup: '{name} مهتم جداً بملفك الشخصي لأنكما تشاركان توافقاً جيداً. هل يمكنك أخذ بضع دقائق للدردشة؟',
   acceptRequest: '✓ قبول',
   rejectRequest: '✗ رفض',
   rejectionPopup: 'عذراً، {name} لم يعط رداً إيجابياً على طلبك. قم ببحوث أخرى',
   gotIt: 'فهمت',
   returnProfile: 'ملفي الشخصي',
   newMatch: 'بحث جديد',
   sendingRequest: 'يتم إرسال طلبك...',
   requestSent: 'تم إرسال الطلب!',
   january: 'يناير',
   february: 'فبراير',
   march: 'مارس',
   april: 'أبريل',
   may: 'مايو',
   june: 'يونيو',
   july: 'يوليو',
   august: 'أغسطس',
   september: 'سبتمبر',
   october: 'أكتوبر',
   november: 'نوفمبر',
   december: 'ديسمبر',
   day: 'يوم',
   month: 'شهر',
   year: 'سنة',
   withCertificate: 'مع شهادة طبية',
   manualEntry: 'يدوياً',
   scanAutomatic: 'مسح تلقائي لبياناتك',
   freeEntry: '✎ البيانات الشخصية (قابلة للتعديل)',
   dataFromCertificate: '✔ بيانات الشهادة الطبية (غير قابلة للتعديل)',
   locationHelp: 'ساعد الأشخاص الأقرب إليك على الاتصال بك بسهولة',
   yourLocation: 'موقعك',
   lifeProject: 'مشروع الحياة',
   protectedSource: 'محمي (المصدر: شهادة طبية)',
   successMessage: 'تم تحديث الملف الشخصي بنجاح',
   errorMessage: 'حدث خطأ أثناء التحديث',
   photoPlaceholder: 'صورة الملف الشخصي'
 },
 zh: {
   appName: '真爱基因',
   slogan: '结合心灵与健康，建立健康的伴侣关系 ❤️',
   security: '🔒 您的健康数据已加密',
   welcome: '欢迎来到真爱基因',
   haveAccount: '已有账户？',
   login: '登录',
   createAccount: '创建账户',
   loginTitle: '登录',
   enterName: '输入您的名字以登录',
   yourName: '您的名字',
   backHome: '← 返回首页',
   nameNotFound: '未找到名字。请创建账户。',
   charterTitle: '📜 荣誉宪章',
   charterSubtitle: '请仔细阅读这5项承诺',
   scrollDown: '👇 滚动到底部 👇',
   accept: '我接受并继续',
   oath1: '1. 真诚誓言',
   oath1Sub: '医疗真相',
   oath1Text: '我以我的荣誉承诺，提供关于我的基因型和健康数据的准确信息。',
   oath2: '2. 保密契约',
   oath2Sub: '共享秘密',
   oath2Text: '我承诺对所有个人和医疗信息保密。',
   oath3: '3. 非歧视原则',
   oath3Sub: '平等尊重',
   oath3Text: '我以尊严对待每位成员，无论其基因型如何。',
   oath4: '4. 预防责任',
   oath4Sub: '健康导向',
   oath4Text: '我接受保护措施，如过滤风险兼容性。',
   oath5: '5. 道德善意',
   oath5Sub: '礼貌',
   oath5Text: '我在消息中采用模范和尊重的行为。',
   signupTitle: '创建我的个人资料',
   signupSub: '所有信息均保密',
   firstName: '名字',
   lastName: '姓氏',
   gender: '性别',
   male: '男',
   female: '女',
   dob: '出生日期',
   city: '居住城市',
   region: '地区',
   allRegions: '所有地区',
   myRegion: '仅限我的地区',
   genotype: '基因型',
   bloodGroup: '血型',
   desireChild: '想要孩子吗？',
   yes: '是',
   no: '否',
   createProfile: '创建我的个人资料',
   backCharter: '← 返回宪章',
   required: '必填',
   honorTitle: '荣誉誓言',
   honorText: '我以我的荣誉确认，我的信息真实且符合事实。',
   swear: '我发誓',
   accessProfile: '访问我的个人资料',
   myProfile: '我的个人资料',
   home: '首页',
   messages: '消息',
   settings: '设置',
   genotype_label: '基因型',
   blood_label: '血型',
   age_label: '年龄',
   residence_label: '居住地',
   region_label: '地区',
   project_label: '项目',
   findPartner: '寻找伴侣',
   editProfile: '编辑个人资料',
   compatiblePartners: '兼容的伴侣',
   noPartners: '目前未找到伴侣',
   searchOngoing: '搜索中...',
   expandCommunity: '我们正在扩大社区。请稍后再来！',
   details: '详情',
   contact: '联系',
   backProfile: '← 我的个人资料',
   toMessages: '消息 →',
   healthCommitment: '您的健康承诺',
   popupMessageAS: '作为AS档案，我们只向您展示AA伴侣。这一负责任的选择保证了您未来家庭的安宁，并保护您的后代免受镰状细胞病的影响。',
   popupMessageSS: '作为SS档案，我们只向您展示AA伴侣。这一负责任的选择保证了您未来家庭的安宁，并保护您的后代免受镰状细胞病的影响。',
   understood: '我明白',
   inboxTitle: '收件箱',
   emptyInbox: '空收件箱',
   startConversation: '开始对话！',
   findPartners: '寻找伴侣',
   block: '屏蔽',
   unblock: '解除屏蔽',
   yourMessage: '您的消息...',
   send: '发送',
   blockedByUser: '无法对话',
   blockedMessage: '此用户已屏蔽您。您无法向他发送消息。',
   settingsTitle: '设置',
   visibility: '个人资料可见性',
   notifications: '推送通知',
   language: '语言',
   blockedUsers: '已屏蔽用户',
   dangerZone: '⚠️ 危险区域',
   deleteAccount: '删除我的帐户',
   delete: '删除',
   logout: '退出',
   confirmDelete: '永久删除？',
   noBlocked: '没有已屏蔽的用户',
   thankYou: '感谢您的交流',
   thanksMessage: '真爱基因感谢您',
   newSearch: '新搜索',
   logoutSuccess: '退出成功',
   seeYouSoon: '再见！',
   french: '法语',
   english: '英语',
   portuguese: '葡萄牙语',
   spanish: '西班牙语',
   arabic: '阿拉伯语',
   chinese: '中文',
   pageNotFound: '页面未找到',
   pageNotFoundMessage: '您查找的页面不存在。',
   project_life: '人生计划',
   interestPopup: '{name} 被您的个人资料深深吸引，因为你们有良好的兼容性。您能花几分钟聊聊吗？',
   acceptRequest: '✓ 接受',
   rejectRequest: '✗ 拒绝',
   rejectionPopup: '抱歉，{name} 没有对您的请求给予积极回应。继续搜索吧。',
   gotIt: '明白了',
   returnProfile: '我的个人资料',
   newMatch: '新搜索',
   sendingRequest: '您的请求正在发送中...',
   requestSent: '请求已发送！',
   january: '一月',
   february: '二月',
   march: '三月',
   april: '四月',
   may: '五月',
   june: '六月',
   july: '七月',
   august: '八月',
   september: '九月',
   october: '十月',
   november: '十一月',
   december: '十二月',
   day: '日',
   month: '月',
   year: '年',
   withCertificate: '使用医疗证书',
   manualEntry: '手动输入',
   scanAutomatic: '自动扫描您的数据',
   freeEntry: '✎ 个人数据（可修改）',
   dataFromCertificate: '✔ 医疗证书数据（不可修改）',
   locationHelp: '帮助离您最近的人轻松联系您',
   yourLocation: '您的位置',
   lifeProject: '人生计划',
   protectedSource: '受保护（来源：医疗证书）',
   successMessage: '个人资料更新成功',
   errorMessage: '更新时出错',
   photoPlaceholder: '个人资料照片'
 }
};

// Middleware de traduction
app.use(async (req, res, next) => {
 if (req.session && req.session.userId) {
   try {
     const user = await User.findById(req.session.userId);
     req.lang = (user && user.language) ? user.language : 'fr';
   } catch {
     req.lang = 'fr';
   }
 } else {
   const acceptLanguage = req.headers['accept-language'] || '';
   if (acceptLanguage.includes('pt')) req.lang = 'pt';
   else if (acceptLanguage.includes('es')) req.lang = 'es';
   else if (acceptLanguage.includes('ar')) req.lang = 'ar';
   else if (acceptLanguage.includes('zh')) req.lang = 'zh';
   else if (acceptLanguage.includes('en')) req.lang = 'en';
   else req.lang = 'fr';
 }
 
 req.t = (key, params = {}) => {
   let text = translations[req.lang]?.[key] || translations.fr[key] || key;
   for (const [k, v] of Object.entries(params)) {
     text = text.replace(`{${k}}`, v);
   }
   return text;
 };
 next();
});

// ============================================
// STYLES CSS COMPLETS
// ============================================
const styles = `
<style>
 * { margin: 0; padding: 0; box-sizing: border-box; }
 body {
   font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
   background: #fdf2f2;
   display: flex;
   justify-content: center;
   align-items: flex-start;
   min-height: 100vh;
   font-size: 16px;
 }
 .app-shell {
   width: 100%;
   max-width: 420px;
   min-height: 100vh;
   background: #f4e9da;
   display: flex;
   flex-direction: column;
   box-shadow: 0 0 30px rgba(0,0,0,0.1);
   margin: 0 auto;
 }
 .page-white {
   background: white;
   padding: 20px;
   flex: 1;
 }
 h1 { font-size: 2.4rem; margin: 10px 0; }
 h2 { font-size: 2rem; margin-bottom: 20px; color: #1a2a44; }
 h3 { font-size: 1.6rem; margin: 15px 0; }
 p { font-size: 1.2rem; line-height: 1.6; }
 /* Logo */
 .logo-container {
   width: 180px;
   height: 180px;
   margin: 0 auto 10px;
   position: relative;
   animation: gentlePulse 3s infinite ease-in-out;
 }
 @keyframes gentlePulse {
   0% { transform: scale(1); }
   50% { transform: scale(1.02); }
   100% { transform: scale(1); }
 }
 .logo-text {
   font-size: 3rem;
   font-weight: 800;
   margin: 5px 0 20px;
   letter-spacing: -1px;
   text-align: center;
 }
 .slogan {
   font-weight: 500;
   color: #1a2a44;
   margin: 10px 25px 30px;
   font-size: 1.2rem;
   line-height: 1.5;
   text-align: center;
 }
 .home-screen {
   flex: 1;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 20px;
   text-align: center;
   background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
 }
 
 /* Sélecteur de langue compact */
 .language-selector-compact {
   position: relative;
   margin: 10px 0 20px;
 }
 .lang-btn-compact {
   background: white;
   border: 2px solid #ff416c;
   color: #1a2a44;
   padding: 10px 20px;
   border-radius: 30px;
   font-size: 1rem;
   font-weight: 600;
   cursor: pointer;
   transition: all 0.3s;
   display: inline-flex;
   align-items: center;
   gap: 8px;
 }
 .lang-btn-compact:hover {
   background: #ff416c;
   color: white;
 }
 .language-dropdown {
   display: none;
   position: absolute;
   top: 100%;
   left: 50%;
   transform: translateX(-50%);
   background: white;
   border-radius: 15px;
   box-shadow: 0 5px 20px rgba(0,0,0,0.2);
   z-index: 1000;
   min-width: 180px;
   margin-top: 5px;
 }
 .dropdown-item {
   display: block;
   padding: 12px 20px;
   text-decoration: none;
   color: #1a2a44;
   border-bottom: 1px solid #eee;
   transition: background 0.2s;
 }
 .dropdown-item:last-child {
   border-bottom: none;
 }
 .dropdown-item:hover {
   background: #f8f9fa;
 }
 
 /* Boutons */
 .btn-pink, .btn-dark {
   padding: 15px 25px;
   border-radius: 60px;
   font-size: 1.2rem;
   font-weight: 600;
   width: 90%;
   margin: 10px auto;
   display: block;
   text-align: center;
   text-decoration: none;
   border: none;
   cursor: pointer;
   transition: all 0.3s;
 }
 .btn-pink {
   background: #ff416c;
   color: white;
   box-shadow: 0 10px 20px rgba(255,65,108,0.3);
 }
 .btn-dark {
   background: #1a2a44;
   color: white;
   box-shadow: 0 10px 20px rgba(26,42,68,0.3);
 }
 .btn-pink:hover, .btn-dark:hover {
   transform: translateY(-3px);
   box-shadow: 0 15px 30px rgba(255,65,108,0.4);
 }
 .btn-action {
   padding: 10px 15px;
   font-size: 0.9rem;
   font-weight: 600;
   border-radius: 30px;
   border: none;
   cursor: pointer;
   transition: all 0.2s;
 }
 .btn-contact {background: #ff416c; color: white;}
 .btn-details {background: #1a2a44; color: white;}
 
 /* Inputs */
 .input-box {
   width: 100%;
   padding: 14px;
   border: 2px solid #e2e8f0;
   border-radius: 15px;
   margin: 8px 0;
   font-size: 1rem;
   background: #f8f9fa;
   transition: all 0.3s;
 }
 .input-box:focus {
   border-color: #ff416c;
   outline: none;
   box-shadow: 0 0 0 4px rgba(255,65,108,0.2);
 }
 .input-label {
   text-align: left;
   font-size: 0.9rem;
   color: #1a2a44;
   margin-top: 10px;
   font-weight: 600;
 }
 input[readonly] {
   background: #f0f0f0;
   border-color: #4caf50;
   color: #333;
 }
 
 /* Date picker horizontal */
 .custom-date-picker {
   display: flex;
   gap: 5px;
   margin: 10px 0;
 }
 .date-part {
   flex: 1;
   padding: 12px;
   border: 2px solid #e2e8f0;
   border-radius: 15px;
   font-size: 0.9rem;
   background: #f8f9fa;
 }
 .date-part:focus {
   border-color: #ff416c;
   outline: none;
 }
 
 /* Photo */
 .photo-circle {
   width: 110px;
   height: 110px;
   border: 4px solid #ff416c;
   border-radius: 50%;
   margin: 15px auto;
   background-size: cover;
   background-position: center;
   box-shadow: 0 10px 25px rgba(255,65,108,0.3);
   display: flex;
   align-items: center;
   justify-content: center;
   cursor: pointer;
 }
 
 /* Match cards */
 .match-card {
   background: white;
   border-radius: 25px;
   margin: 10px 15px;
   padding: 15px;
   display: flex;
   align-items: center;
   gap: 12px;
   box-shadow: 0 2px 10px rgba(0,0,0,0.05);
 }
 .match-photo-blur {
   width: 55px;
   height: 55px;
   border-radius: 50%;
   background: #eee;
   filter: blur(6px);
   flex-shrink: 0;
   background-size: cover;
 }
 .match-info {
   flex: 1;
 }
 .match-actions {
   display: flex;
   gap: 8px;
 }
 
 /* Style groups */
 .st-group {
   background: white;
   border-radius: 15px;
   margin: 0 15px 15px;
   overflow: hidden;
   box-shadow: 0 2px 8px rgba(0,0,0,0.05);
   text-align: left;
 }
 .st-item {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 15px 20px;
   border-bottom: 1px solid #f8f8f8;
   color: #333;
   font-size: 0.95rem;
 }
 .st-item:last-child {
   border-bottom: none;
 }
 
 /* Charte améliorée */
 .charte-box {
   height: 400px;
   overflow-y: auto;
   background: #fff5f7;
   border: 2px solid #ffdae0;
   border-radius: 25px;
   padding: 30px;
   font-size: 1.1rem;
   color: #1a2a44;
   line-height: 1.6;
   margin: 20px 0;
   text-align: left;
 }
 .charte-section {
   margin-bottom: 30px;
   padding-bottom: 20px;
   border-bottom: 2px dashed #ffdae0;
 }
 .charte-section:last-child {
   border-bottom: none;
 }
 .charte-title {
   color: #ff416c;
   font-size: 1.3rem;
   font-weight: bold;
   margin-bottom: 8px;
 }
 .charte-subtitle {
   color: #1a2a44;
   font-size: 1.1rem;
   font-style: italic;
   margin-bottom: 8px;
 }
 .scroll-indicator {
   text-align: center;
   color: #ff416c;
   font-size: 1rem;
   margin: 15px 0;
   padding: 10px;
   background: rgba(255,65,108,0.1);
   border-radius: 40px;
 }
 
 /* Popups */
 #request-popup, #rejection-popup, #loading-popup, #genlove-popup, #popup-overlay, #delete-confirm-popup {
   display: none;
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0,0,0,0.9);
   z-index: 10000;
   align-items: center;
   justify-content: center;
   padding: 20px;
   backdrop-filter: blur(5px);
 }
 .popup-card, .popup-content {
   background: white;
   border-radius: 30px;
   padding: 30px 25px;
   max-width: 380px;
   width: 100%;
   text-align: center;
   animation: popupAppear 0.4s ease-out;
   border: 3px solid #ff416c;
   box-shadow: 0 20px 40px rgba(255,65,108,0.3);
   position: relative;
 }
 .close-popup {
   position: absolute;
   top: 15px;
   right: 15px;
   font-size: 1.5rem;
   cursor: pointer;
   color: #666;
 }
 .popup-icon {
   font-size: 3rem;
   margin-bottom: 10px;
 }
 .popup-title {
   color: #ff416c;
   font-size: 1.4rem;
   font-weight: bold;
   margin-bottom: 15px;
 }
 .popup-message, .popup-msg {
   color: #1a2a44;
   font-size: 1.1rem;
   line-height: 1.6;
   margin-bottom: 20px;
   padding: 0 10px;
 }
 .popup-msg {
   background: #e7f3ff;
   padding: 15px;
   border-radius: 12px;
   border-left: 5px solid #007bff;
   text-align: left;
 }
 .popup-buttons {
   display: flex;
   gap: 15px;
   margin: 15px 0;
 }
 .popup-buttons button {
   flex: 1;
   padding: 15px;
   border: none;
   border-radius: 50px;
   font-weight: bold;
   cursor: pointer;
   transition: all 0.3s;
 }
 .accept-btn {
   background: #ff416c;
   color: white;
 }
 .reject-btn {
   background: #1a2a44;
   color: white;
 }
 .action-buttons {
   display: flex;
   gap: 10px;
   margin-top: 20px;
 }
 .ok-btn {
   background: #ff416c;
   color: white;
   padding: 15px;
   border: none;
   border-radius: 50px;
   font-weight: bold;
   cursor: pointer;
   width: 100%;
 }
 
 @keyframes popupAppear {
   0% { transform: translateY(20px) scale(0.9); opacity: 0; }
   100% { transform: translateY(0) scale(1); opacity: 1; }
 }
 
 /* Notification */
 #genlove-notify {
   position: fixed;
   top: -100px;
   left: 50%;
   transform: translateX(-50%);
   width: 90%;
   max-width: 380px;
   background: #1a2a44;
   color: white;
   padding: 15px 20px;
   border-radius: 60px;
   display: flex;
   align-items: center;
   gap: 10px;
   transition: 0.5s;
   z-index: 9999;
   box-shadow: 0 15px 30px rgba(0,0,0,0.3);
   border-left: 5px solid #ff416c;
   font-size: 1rem;
 }
 #genlove-notify.show { top: 20px; }
 
 /* Navigation */
 .navigation {
   display: flex;
   gap: 10px;
   margin-top: 20px;
 }
 .nav-link {
   flex: 1;
   text-align: center;
   padding: 12px;
   background: white;
   text-decoration: none;
   color: #1a2a44;
   border-radius: 30px;
   box-shadow: 0 3px 10px rgba(0,0,0,0.05);
   font-size: 1rem;
 }
 .back-link {
   display: inline-block;
   margin: 15px 0;
   color: #666;
   text-decoration: none;
   font-size: 1rem;
 }
 
 /* Styles pour le choix d'inscription */
 .choice-screen {
   padding: 20px;
 }
 .options {
   display: flex;
   flex-direction: column;
   gap: 15px;
   margin: 30px 0;
 }
 .option-card {
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   color: white;
   padding: 25px;
   border-radius: 20px;
   text-align: center;
   cursor: pointer;
   transition: transform 0.3s;
 }
 .option-card:hover {
   transform: translateY(-5px);
 }
 .option-card .icon {
   font-size: 3rem;
   margin-bottom: 10px;
 }
 .option-card h3 {
   color: white;
   margin-bottom: 5px;
 }
 .option-card p {
   font-size: 0.9rem;
   opacity: 0.9;
 }
 .option-card.manual {
   background: #f0f0f0;
   color: #333;
 }
 .option-card.manual h3 {
   color: #333;
 }
 
 /* Styles pour QR (version simplifiée) */
 .qr-card {
   background: white;
   padding: 20px;
   border-radius: 20px;
   box-shadow: 0 4px 15px rgba(0,0,0,0.1);
   width: 100%;
   max-width: 400px;
   margin: 0 auto;
 }
 #reader {
   width: 100%;
   border-radius: 12px;
   overflow: hidden;
   margin-bottom: 20px;
 }
 .debug-box {
   background: #f0f0f0;
   padding: 10px;
   border-radius: 8px;
   font-size: 0.8rem;
   word-break: break-all;
   margin: 10px 0;
   display: none;
   border-left: 5px solid #ff416c;
 }
 .locked {
   background: #e8f5e9;
   border-color: #4caf50;
 }
 .test-buttons {
   display: flex;
   gap: 5px;
   margin: 15px 0;
 }
 .test-btn {
   flex: 1;
   background: #1a2a44;
   color: white;
   border: none;
   padding: 10px;
   border-radius: 30px;
   cursor: pointer;
   font-weight: bold;
 }
 .qr-link {
   text-align: center;
   margin: 15px 0;
   color: #ff416c;
   display: block;
 }
 .qr-fields {
   background: #e8f5e9;
   padding: 15px;
   border-radius: 10px;
   margin: 15px 0;
 }
 .qr-fields h3 {
   color: #2e7d32;
   margin-bottom: 10px;
   font-size: 1rem;
 }
 .info-message {
   background: #e3f2fd;
   padding: 15px;
   border-radius: 10px;
   margin: 15px 0;
   display: flex;
   align-items: center;
   gap: 10px;
   border-left: 5px solid #2196f3;
 }
 .info-icon {
   font-size: 1.5rem;
 }
 .info-message p {
   color: #0d47a1;
   font-size: 0.9rem;
   margin: 0;
 }
 .manual-fields {
   background: #fff3e0;
   padding: 15px;
   border-radius: 10px;
   margin: 15px 0;
 }
 .manual-fields h3 {
   color: #bf360c;
   margin-bottom: 10px;
   font-size: 1rem;
 }
 .verified-badge {
   background: #4caf50;
   color: white;
   padding: 3px 10px;
   border-radius: 20px;
   font-size: 0.8rem;
   display: inline-block;
 }
 .unverified-badge {
   background: #ff9800;
   color: white;
   padding: 3px 10px;
   border-radius: 20px;
   font-size: 0.8rem;
   display: inline-block;
 }
 .filter-container {
   padding: 15px;
   background: white;
   margin: 10px 15px;
   border-radius: 15px;
   box-shadow: 0 2px 8px rgba(0,0,0,0.05);
 }
 
 /* Badge de vérification (style Facebook) */
 .verified-badge {
   display: inline-block;
   vertical-align: middle;
   cursor: help;
 }
 .verified-badge svg {
   transition: transform 0.2s;
 }
 .verified-badge:hover svg {
   transform: scale(1.1);
 }
 .verified-badge-text {
   display: inline-flex;
   align-items: center;
   gap: 3px;
   background: rgba(29, 161, 242, 0.1);
   padding: 3px 10px;
   border-radius: 20px;
   font-weight: normal;
 }
 .unverified-badge-text {
   display: inline-flex;
   align-items: center;
   gap: 3px;
   background: rgba(255, 152, 0, 0.1);
   padding: 3px 10px;
   border-radius: 20px;
   font-weight: normal;
 }
 
 @media(max-width:420px){
   body{font-size:15px;}
   .app-shell{max-width: 100%;}
   .logo-container{width:150px;height:150px;}
   .logo-text{font-size:2.5rem;}
   h2{font-size:1.8rem;}
   .btn-pink,.btn-dark{width: 95%; padding:15px;}
 }
</style>
`;

// NOTIFICATION SCRIPT
const notifyScript = `
<script>
function showNotify(msg, type) {
 const n = document.getElementById('genlove-notify');
 const m = document.getElementById('notify-msg');
 if(m) m.innerText = msg;
 if(n) {
   n.style.backgroundColor = type === 'success' ? '#4CAF50' : '#1a2a44';
   n.classList.add('show');
 }
 setTimeout(() => n.classList.remove('show'), 3000);
}
function vibrate(pattern) {
 if("vibrate" in navigator) navigator.vibrate(pattern);
}
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function calculerAge(dateNaissance) {
 if (!dateNaissance) return "?";
 const today = new Date();
 const birthDate = new Date(dateNaissance);
 let age = today.getFullYear() - birthDate.getFullYear();
 const monthDiff = today.getMonth() - birthDate.getMonth();
 if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
 return age;
}

function formatTimeAgo(timestamp, lang = 'fr') {
 const date = new Date(timestamp);
 const now = new Date();
 const diffMs = now - date;
 const diffMins = Math.floor(diffMs / 60000);
 const diffHours = Math.floor(diffMins / 60);
 const diffDays = Math.floor(diffHours / 24);
 
 if (lang === 'fr') {
   if (diffMins < 1) return "À l'instant";
   if (diffMins < 60) return `Il y a ${diffMins} min`;
   if (diffHours < 24) return `Il y a ${diffHours} h`;
   if (diffDays === 1) return 'Hier';
   return date.toLocaleDateString('fr-FR');
 } else if (lang === 'en') {
   if (diffMins < 1) return "Just now";
   if (diffMins < 60) return `${diffMins} min ago`;
   if (diffHours < 24) return `${diffHours} hours ago`;
   if (diffDays === 1) return 'Yesterday';
   return date.toLocaleDateString('en-US');
 } else if (lang === 'pt') {
   if (diffMins < 1) return "Agora mesmo";
   if (diffMins < 60) return `${diffMins} min atrás`;
   if (diffHours < 24) return `${diffHours} horas atrás`;
   if (diffDays === 1) return 'Ontem';
   return date.toLocaleDateString('pt-BR');
 } else if (lang === 'es') {
   if (diffMins < 1) return "Ahora mismo";
   if (diffMins < 60) return `hace ${diffMins} min`;
   if (diffHours < 24) return `hace ${diffHours} h`;
   if (diffDays === 1) return 'Ayer';
   return date.toLocaleDateString('es-ES');
 } else if (lang === 'ar') {
   if (diffMins < 1) return "الآن";
   if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
   if (diffHours < 24) return `منذ ${diffHours} ساعة`;
   if (diffDays === 1) return 'أمس';
   return date.toLocaleDateString('ar-EG');
 } else if (lang === 'zh') {
   if (diffMins < 1) return "刚刚";
   if (diffMins < 60) return `${diffMins}分钟前`;
   if (diffHours < 24) return `${diffHours}小时前`;
   if (diffDays === 1) return "昨天";
   return date.toLocaleDateString('zh-CN');
 }
 return date.toLocaleDateString();
}

function generateDateOptions(req, selectedDate = null) {
 const t = req.t;
 const lang = req.lang;
 const months = {
   fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
   en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
   pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
   es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
   ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
   zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
 };
 const monthList = months[lang] || months.fr;
 const currentYear = new Date().getFullYear();
 const selected = selectedDate ? new Date(selectedDate) : null;
 
 let html = '<div class="custom-date-picker">';
 
 html += '<select name="day" class="date-part" required><option value="">' + t('day') + '</option>';
 for (let d = 1; d <= 31; d++) {
   const sel = (selected && selected.getDate() === d) ? 'selected' : '';
   html += `<option value="${d}" ${sel}>${d}</option>`;
 }
 html += '</select>';
 
 html += '<select name="month" class="date-part" required><option value="">' + t('month') + '</option>';
 for (let m = 0; m < 12; m++) {
   const monthVal = m + 1;
   const sel = (selected && selected.getMonth() === m) ? 'selected' : '';
   html += `<option value="${monthVal}" ${sel}>${monthList[m]}</option>`;
 }
 html += '</select>';
 
 html += '<select name="year" class="date-part" required><option value="">' + t('year') + '</option>';
 for (let y = currentYear - 100; y <= currentYear - 18; y++) {
   const sel = (selected && selected.getFullYear() === y) ? 'selected' : '';
   html += `<option value="${y}" ${sel}>${y}</option>`;
 }
 html += '</select></div>';
 
 return html;
}

// Fonction pour générer le badge de vérification (style Facebook)
function getVerificationBadge(user, t) {
 if (user.qrVerified) {
   return `
     <span class="verified-badge" title="${t('dataFromCertificate')}">
       <svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align: middle; margin-left: 5px;">
         <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
         <path d="M10 14.17L16.59 7.58L18 9L10 17L6 13L7.41 11.59L10 14.17Z" fill="white"/>
       </svg>
     </span>
   `;
 }
 return '';
}

// ============================================
// ROUTES
// ============================================

app.get('/lang/:lang', async (req, res) => {
 const lang = req.params.lang;
 if (['fr','en','pt','es','ar','zh'].includes(lang)) {
   if (req.session.userId) {
     await User.findByIdAndUpdate(req.session.userId, { language: lang });
   }
   req.session.lang = lang;
 }
 res.redirect(req.get('referer') || '/');
});

// ============================================
// ACCUEIL
// ============================================
app.get('/', (req, res) => {
 const t = req.t;
 const currentLang = req.lang;
 
 res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('welcome')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div class="home-screen">
     <div class="language-selector-compact">
       <button onclick="toggleLanguageDropdown()" class="lang-btn-compact">
         <span>🌐</span>
         <span id="selected-language">${t('french')}</span>
         <span style="font-size: 0.8rem;">▼</span>
       </button>
       <div id="language-dropdown" class="language-dropdown">
         <a href="/lang/fr" class="dropdown-item">🇫🇷 ${t('french')}</a>
         <a href="/lang/en" class="dropdown-item">🇬🇧 ${t('english')}</a>
         <a href="/lang/pt" class="dropdown-item">🇵🇹 ${t('portuguese')}</a>
         <a href="/lang/es" class="dropdown-item">🇪🇸 ${t('spanish')}</a>
         <a href="/lang/ar" class="dropdown-item">🇸🇦 ${t('arabic')}</a>
         <a href="/lang/zh" class="dropdown-item">🇨🇳 ${t('chinese')}</a>
       </div>
     </div>
     
     <div class="logo-container">
       <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
         <path d="M100 170 L35 90 C15 60 35 20 65 20 C80 20 92 35 100 45 C108 35 120 20 135 20 C165 20 185 60 165 90 L100 170" fill="#FF69B4" opacity="0.9" stroke="#333" stroke-width="2"/>
         <path d="M45 50 L45 140" stroke="#4169E1" stroke-width="4" fill="none" stroke-dasharray="8 8"/>
         <path d="M65 50 L65 140" stroke="#32CD32" stroke-width="4" fill="none" stroke-dasharray="8 8"/>
         <circle cx="145" cy="80" r="28" fill="white" stroke="#333" stroke-width="2" opacity="0.95"/>
         <rect x="163" y="95" width="25" height="8" rx="4" fill="white" stroke="#333" stroke-width="1.5" transform="rotate(35, 170, 100)"/>
         <circle cx="145" cy="80" r="10" fill="#FFD700" opacity="0.8"/>
       </svg>
     </div>
     
     <div class="logo-text">
       <span style="color:#1a2a44;">Gen</span><span style="color:#FF69B4;">love</span>
     </div>
     
     <div class="slogan">${t('slogan')}</div>
     
     <div style="font-size:1.1rem; color:#1a2a44; margin:20px 0 10px;">${t('haveAccount')}</div>
     <a href="/login" class="btn-dark">${t('login')}</a>
     <a href="/charte-engagement" class="btn-pink">${t('createAccount')}</a>
     <div style="margin-top:30px; font-size:0.9rem; color:#666;">${t('security')}</div>
   </div>
 </div>
 <script>
 function toggleLanguageDropdown() {
   const dropdown = document.getElementById('language-dropdown');
   dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
 }
 document.addEventListener('click', function(event) {
   const dropdown = document.getElementById('language-dropdown');
   const button = event.target.closest('.lang-btn-compact');
   if (!button && dropdown.style.display === 'block') {
     dropdown.style.display = 'none';
   }
 });
 document.querySelectorAll('.dropdown-item').forEach(item => {
   item.addEventListener('click', function(e) {
     const langText = this.innerText.replace(/[🇫🇷🇬🇧🇵🇹🇪🇸🇸🇦🇨🇳]/g, '').trim();
     document.getElementById('selected-language').innerText = langText;
   });
 });
 </script>
</body>
</html>`);
});

// ============================================
// LOGIN
// ============================================
app.get('/login', (req, res) => {
 const t = req.t;
 res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('loginTitle')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div class="page-white">
     <h2>${t('loginTitle')}</h2>
     <p style="font-size:1.2rem; margin:20px 0;">${t('enterName')}</p>
     <form id="loginForm">
       <input type="text" id="firstName" class="input-box" placeholder="${t('yourName')}" required>
       <button type="submit" class="btn-pink">${t('login')}</button>
     </form>
     <a href="/" class="back-link">← ${t('backHome')}</a>
   </div>
 </div>
 <script>
 document.getElementById('loginForm').addEventListener('submit', async function(e) {
   e.preventDefault();
   const firstName = document.getElementById('firstName').value;
   const res = await fetch('/api/login', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({firstName})
   });
   if (res.ok) window.location.href = '/profile';
   else alert('${t('nameNotFound')}');
 });
 document.getElementById('firstName').addEventListener('keypress', function(e) {
   if (e.key === 'Enter') {
     e.preventDefault();
     document.getElementById('loginForm').requestSubmit();
   }
 });
 </script>
</body>
</html>`);
});

// ================================================
// CHARTE D'ENGAGEMENT
// ================================================
app.get('/charte-engagement', (req, res) => {
 const t = req.t;
 res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('charterTitle')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div class="page-white">
     <h2>${t('charterTitle')}</h2>
     <p style="font-size:1.2rem; margin-bottom:25px;">${t('charterSubtitle')}</p>
     <div class="charte-box" id="charteBox" onscroll="checkScroll(this)">
       <div class="charte-section">
         <div class="charte-title">${t('oath1')}</div>
         <div class="charte-subtitle">${t('oath1Sub')}</div>
         <p>${t('oath1Text')}</p>
       </div>
       <div class="charte-section">
         <div class="charte-title">${t('oath2')}</div>
         <div class="charte-subtitle">${t('oath2Sub')}</div>
         <p>${t('oath2Text')}</p>
       </div>
       <div class="charte-section">
         <div class="charte-title">${t('oath3')}</div>
         <div class="charte-subtitle">${t('oath3Sub')}</div>
         <p>${t('oath3Text')}</p>
       </div>
       <div class="charte-section">
         <div class="charte-title">${t('oath4')}</div>
         <div class="charte-subtitle">${t('oath4Sub')}</div>
         <p>${t('oath4Text')}</p>
       </div>
       <div class="charte-section">
         <div class="charte-title">${t('oath5')}</div>
         <div class="charte-subtitle">${t('oath5Sub')}</div>
         <p>${t('oath5Text')}</p>
       </div>
     </div>
     <div class="scroll-indicator" id="scrollIndicator">⬇️ ${t('scrollDown')} ⬇️</div>
     <button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled style="opacity: 0.5; cursor: not-allowed;">${t('accept')}</button>
     <a href="/" class="back-link">← ${t('backHome')}</a>
   </div>
 </div>
 
 <script>
 function checkScroll(el) {
   if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
     document.getElementById('agreeBtn').disabled = false;
     document.getElementById('agreeBtn').style.opacity = '1';
     document.getElementById('agreeBtn').style.cursor = 'pointer';
     document.getElementById('scrollIndicator').style.opacity = '0.3';
   } else {
     document.getElementById('agreeBtn').disabled = true;
     document.getElementById('agreeBtn').style.opacity = '0.5';
     document.getElementById('agreeBtn').style.cursor = 'not-allowed';
     document.getElementById('scrollIndicator').style.opacity = '1';
   }
 }
 
 window.onload = function() {
   const charteBox = document.getElementById('charteBox');
   if (charteBox.scrollTop === 0) {
     document.getElementById('agreeBtn').disabled = true;
     document.getElementById('agreeBtn').style.opacity = '0.5';
   }
 };
 
 function acceptCharte() {
   if (!document.getElementById('agreeBtn').disabled) window.location.href = '/signup-choice';
 }
 </script>
</body>
</html>`);
});

// ============================================
// PAGE DE CHOIX D'INSCRIPTION
// ============================================
app.get('/signup-choice', (req, res) => {
 const t = req.t;
 res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('signupTitle')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div class="page-white choice-screen">
     <h2>${t('signupTitle')}</h2>
     <p style="font-size:1.2rem; margin-bottom:30px;">${t('signupSub')}</p>
     
     <div class="options">
       <div class="option-card" onclick="window.location.href='/signup-qr'">
         <div class="icon">📱</div>
         <h3>${t('withCertificate')}</h3>
         <p>${t('scanAutomatic')}</p>
       </div>
       
       <div class="option-card manual" onclick="window.location.href='/signup-manual'">
         <div class="icon">✏️</div>
         <h3>${t('manualEntry')}</h3>
         <p>${t('freeEntry')}</p>
       </div>
     </div>
     
     <a href="/charte-engagement" class="back-link">← ${t('backCharter')}</a>
   </div>
 </div>
</body>
</html>`);
});

// ============================================
// INSCRIPTION PAR CODE QR
// ============================================
app.get('/signup-qr', (req, res) => {
 const t = req.t;
 res.send(`<!DOCTYPE html>
<html lang="${req.lang}">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <script src="https://unpkg.com/html5-qrcode@2.3.8"></script>
 <style>
   body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f9fafb; color: #111827; }
   .container { max-width: 400px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
   #reader { width: 70vw; height: 70vw; max-width: 300px; max-height: 300px; margin: 0 auto 20px; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); background-color: #ffffff; position: relative; border: 3px solid transparent; transition: border 0.3s ease; }
   #qr-success { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background-color: rgba(16,185,129,0.9); color: white; padding: 6px 12px; border-radius: 12px; font-size: 14px; display: none; }
   input[type="text"], input[type="number"], select { width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 12px; border: 1px solid #d1d5db; font-size: 14px; box-sizing: border-box; transition: background-color 0.5s ease; }
   input[readonly] { background-color: #f3f4f6; cursor: not-allowed; opacity: 0.9; }
   .photo-box { display: flex; align-items: center; justify-content: center; height: 180px; width: 120px; background-color: #f3f4f6; border: 2px dashed #d1d5db; color: #9ca3af; font-size: 14px; cursor: pointer; border-radius: 8px; margin: 0 auto 20px; overflow: hidden; position: relative; background-size: cover; background-position: center; background-repeat: no-repeat; }
   .photo-box.has-image { border: 2px solid #10b981; color: transparent; }
   .photo-box.has-image:after { content: "✏️"; position: absolute; bottom: 5px; right: 5px; background-color: rgba(255,255,255,0.8); border-radius: 50%; padding: 5px; font-size: 12px; opacity: 0; transition: opacity 0.3s ease; }
   .photo-box.has-image:hover:after { opacity: 1; }
   .date-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px; margin-top: 10px; }
   .date-title:first-of-type { margin-top: 0; }
   .date-row { display: flex; gap: 8px; margin-bottom: 12px; }
   .date-row input { flex: 1; text-align: center; }
   .date-error { color: #dc2626; font-size: 12px; margin-top: -8px; margin-bottom: 12px; display: none; text-align: center; }
   .life-project-container { margin-bottom: 20px; }
   .life-project-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
   .life-project-options { display: flex; gap: 15px; background-color: #f8f9fa; padding: 12px; border-radius: 12px; border: 1px solid #d1d5db; }
   .life-project-options label { display: flex; align-items: center; gap: 6px; font-size: 15px; cursor: pointer; color: #1a2a44; }
   .life-project-options input[type="radio"] { width: 18px; height: 18px; accent-color: #db2777; cursor: pointer; }
   .checkbox-container { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; margin-bottom: 20px; }
   button { width: 100%; padding: 16px; border-radius: 25px; border: none; font-weight: bold; font-size: 16px; color: white; background-color: #db2777; cursor: pointer; transition: background-color 0.3s ease; }
   button:disabled { background-color: #f9a8d4; cursor: not-allowed; }
   button:not(:disabled):hover { background-color: #be185d; }
   .section-title { font-weight: bold; font-size: 16px; text-align: center; margin-bottom: 6px; color: #1a2a44; }
   .sub-text { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 20px; }
   .loader { display: inline-block; width: 20px; height: 20px; border: 3px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite; margin-right: 8px; vertical-align: middle; }
   @keyframes spin { to { transform: rotate(360deg); } }
   .success-message { background-color: #10b981; color: white; padding: 12px; border-radius: 8px; text-align: center; margin-top: 16px; display: none; font-weight: bold; }
   .language-selector-compact { position: relative; margin: 10px 0 20px; text-align: center; }
   .lang-btn-compact { background: white; border: 2px solid #ff416c; color: #1a2a44; padding: 10px 20px; border-radius: 30px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px; }
   .lang-btn-compact:hover { background: #ff416c; color: white; }
   .language-dropdown { display: none; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 1000; min-width: 180px; margin-top: 5px; }
   .dropdown-item { display: block; padding: 12px 20px; text-decoration: none; color: #1a2a44; border-bottom: 1px solid #eee; transition: background 0.2s; }
   .dropdown-item:last-child { border-bottom: none; }
   .dropdown-item:hover { background: #f8f9fa; }
   .partition-line { height: 2px; background: linear-gradient(90deg, transparent, #ff416c, transparent); margin: 25px 0 15px 0; opacity: 0.3; }
 </style>
</head>
<body>
 <div class="container">
   
   <div class="language-selector-compact">
     <button onclick="toggleLanguageDropdown()" class="lang-btn-compact">
       <span>🌐</span>
       <span id="selected-language">${t('french')}</span>
       <span style="font-size:0.8rem;">▼</span>
     </button>
     <div id="language-dropdown" class="language-dropdown">
       <a href="/lang/fr" class="dropdown-item">🇫🇷 ${t('french')}</a>
       <a href="/lang/en" class="dropdown-item">🇬🇧 ${t('english')}</a>
       <a href="/lang/pt" class="dropdown-item">🇵🇹 ${t('portuguese')}</a>
       <a href="/lang/es" class="dropdown-item">🇪🇸 ${t('spanish')}</a>
       <a href="/lang/ar" class="dropdown-item">🇸🇦 ${t('arabic')}</a>
       <a href="/lang/zh" class="dropdown-item">🇨🇳 ${t('chinese')}</a>
     </div>
   </div>
   
   <div id="reader" style="position: relative;">
     <div id="qr-success">${t('qrSuccess') || 'QR scanné !'}</div>
   </div>
   
   <div style="margin-bottom: 10px;">
     <span style="font-size: 12px; color: #10b981; font-weight: bold;">${t('dataFromCertificate')}</span>
   </div>
   <input type="text" placeholder="${t('firstName')}" id="firstName" readonly>
   <input type="text" placeholder="${t('lastName')}" id="lastName" readonly>
   <input type="text" placeholder="${t('gender')}" id="gender" readonly>
   <input type="text" placeholder="${t('genotype')}" id="genotype" readonly>
   <input type="text" placeholder="${t('bloodGroup')}" id="bloodGroup" readonly>
   
   <div class="partition-line"></div>
   
   <div class="section-title">${t('freeEntry')}</div>
   <div class="sub-text">${t('locationHelp')}</div>
   
   <div class="photo-box" id="photoBox">
     <span id="photoPlaceholder">📷 ${t('photoPlaceholder')}</span>
   </div>
   
   <input type="text" placeholder="${t('region')}" id="region" required>
   
   <div class="date-title">${t('dob')}</div>
   <div class="date-row">
     <input type="number" placeholder="${t('day')}" min="1" max="31" id="day" required oninput="validateDay()">
     <input type="number" placeholder="${t('month')}" min="1" max="12" id="month" required oninput="validateMonth()">
     <input type="number" placeholder="${t('year')}" min="1900" max="2100" id="year" required oninput="validateYear()">
   </div>
   <div id="dateError" class="date-error">Date invalide</div>
   
   <div class="life-project-container">
     <div class="life-project-title">${t('desireChild')}</div>
     <div class="life-project-options">
       <label>
         <input type="radio" name="desireChild" value="Oui" required> ${t('yes')}
       </label>
       <label>
         <input type="radio" name="desireChild" value="Non" required> ${t('no')}
       </label>
     </div>
   </div>
   
   <div class="checkbox-container">
     <input type="checkbox" id="honorCheckbox" required>
     <label>${t('honorText')}</label>
   </div>
   
   <button id="submitBtn" disabled>
     <span id="buttonText">${t('createProfile')}</span>
   </button>
   
   <div id="successMessage" class="success-message">
     ✅ ${t('successMessage')}
   </div>
   
 </div>
 
 <script>
 function toggleLanguageDropdown() {
   const dropdown = document.getElementById('language-dropdown');
   dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
 }
 
 document.addEventListener('click', function(event) {
   const dropdown = document.getElementById('language-dropdown');
   const button = event.target.closest('.lang-btn-compact');
   if (!button && dropdown.style.display === 'block') {
     dropdown.style.display = 'none';
   }
 });
 
 document.querySelectorAll('.dropdown-item').forEach(item => {
   item.addEventListener('click', function(e) {
     const langText = this.innerText.replace(/[🇫🇷🇬🇧🇵🇹🇪🇸🇸🇦🇨🇳]/g, '').trim();
     document.getElementById('selected-language').innerText = langText;
   });
 });
 
 const html5QrCode = new Html5Qrcode("reader");
 let hasScanned = false;
 let scanTimeout = null;
 let selectedPhotoFile = null;
 
 async function startRearCamera() {
   try {
     const devices = await Html5Qrcode.getCameras();
     if (!devices || devices.length === 0) {
       console.error("Aucune caméra trouvée");
       return;
     }
     
     let rearCamera = devices.find(d => 
       d.label.toLowerCase().includes("back") || 
       d.label.toLowerCase().includes("rear") || 
       d.label.toLowerCase().includes("environment") || 
       d.label.toLowerCase().includes("arriere")
     );
     
     if (!rearCamera) rearCamera = devices[devices.length - 1];
     
     const qrCodeSuccessCallback = (decodedText, decodedResult) => {
       if (hasScanned) return;
       
       if (scanTimeout) {
         clearTimeout(scanTimeout);
       }
       
       hasScanned = true;
       html5Qrcode.stop().catch(err => console.log(err));
       
       const data = decodedText.trim().split('|');
       console.log("Données scannées:", data);
       
       if(data.length >= 5) {
         const fieldConfigs = [
           {id: 'firstName', label: '${t('firstName')}'},
           {id: 'lastName', label: '${t('lastName')}'},
           {id: 'gender', label: '${t('gender')}'},
           {id: 'genotype', label: '${t('genotype')}'},
           {id: 'bloodGroup', label: '${t('bloodGroup')}'}
         ];
         
         fieldConfigs.forEach((config, i) => {
           const el = document.getElementById(config.id);
           if (el && data[i]) {
             el.value = config.label + " : " + data[i].trim();
             el.style.backgroundColor = "#d1fae5";
             setTimeout(() => {
               el.style.backgroundColor = "#f3f4f6";
             }, 1000);
           }
         });
       }
       
       const readerDiv = document.getElementById('reader');
       const successDiv = document.getElementById('qr-success');
       readerDiv.style.border = "3px solid #10b981";
       successDiv.style.display = "block";
       
       scanTimeout = setTimeout(() => {
         readerDiv.style.border = "3px solid transparent";
         successDiv.style.display = "none";
         hasScanned = false;
         startRearCamera();
       }, 3000);
       
       checkFormValidity();
     };
     
     const qrCodeErrorCallback = (error) => {
       if (!error.includes("NotFoundException")) {
         console.log("Erreur de scan:", error);
       }
     };
     
     const config = {
       fps: 10,
       qrbox: { width: 250, height: 250 },
       aspectRatio: 1.0,
       videoConstraints: {
         width: { min: 640, ideal: 720, max: 1080 },
         height: { min: 640, ideal: 720, max: 1080 },
         facingMode: "environment"
       }
     };
     
     await html5QrCode.start(rearCamera.id, config, qrCodeSuccessCallback, qrCodeErrorCallback);
     
   } catch(e) {
     console.error("Erreur lors du démarrage de la caméra:", e);
   }
 }
 
 startRearCamera();
 
 const submitBtn = document.getElementById('submitBtn');
 const regionInput = document.getElementById('region');
 const dayInput = document.getElementById('day');
 const monthInput = document.getElementById('month');
 const yearInput = document.getElementById('year');
 const dateError = document.getElementById('dateError');
 const desireChildRadios = document.querySelectorAll('input[name="desireChild"]');
 const honorCheckbox = document.getElementById('honorCheckbox');
 const firstNameInput = document.getElementById('firstName');
 const lastNameInput = document.getElementById('lastName');
 const genderInput = document.getElementById('gender');
 const genotypeInput = document.getElementById('genotype');
 const bloodGroupInput = document.getElementById('bloodGroup');
 const photoBox = document.getElementById('photoBox');
 const photoPlaceholder = document.getElementById('photoPlaceholder');
 const successMessage = document.getElementById('successMessage');
 const buttonText = document.getElementById('buttonText');
 
 function extractValueFromPrefixed(input) {
   if (!input || !input.value) return '';
   const parts = input.value.split(' : ');
   return parts.length > 1 ? parts[1].trim() : input.value.trim();
 }
 
 function getMaxDays(month, year) {
   if (!month || !year) return 31;
   const m = parseInt(month);
   const y = parseInt(year);
   
   if ([1, 3, 5, 7, 8, 10, 12].includes(m)) return 31;
   if ([4, 6, 9, 11].includes(m)) return 30;
   if (m === 2) {
     if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) return 29;
     return 28;
   }
   return 31;
 }
 
 function validateDay() {
   const day = dayInput.value;
   const month = monthInput.value;
   const year = yearInput.value;
   
   if (day && month && year) {
     const maxDays = getMaxDays(month, year);
     if (parseInt(day) > maxDays) {
       dayInput.value = maxDays;
       dateError.style.display = 'block';
       dateError.textContent = 'Le mois ' + month + ' ne peut pas avoir plus de ' + maxDays + ' jours';
       setTimeout(() => dateError.style.display = 'none', 3000);
     }
   }
   checkFormValidity();
 }
 
 function validateMonth() {
   const month = monthInput.value;
   const day = dayInput.value;
   const year = yearInput.value;
   
   if (month) {
     const m = parseInt(month);
     if (m < 1) monthInput.value = 1;
     if (m > 12) monthInput.value = 12;
   }
   
   if (day && month && year) {
     const maxDays = getMaxDays(month, year);
     if (parseInt(day) > maxDays) {
       dayInput.value = maxDays;
     }
   }
   checkFormValidity();
 }
 
 function validateYear() {
   const year = yearInput.value;
   const day = dayInput.value;
   const month = monthInput.value;
   
   if (year) {
     const y = parseInt(year);
     if (y < 1900) yearInput.value = 1900;
     if (y > 2100) yearInput.value = 2100;
   }
   
   if (day && month && year) {
     const maxDays = getMaxDays(month, year);
     if (parseInt(day) > maxDays) {
       dayInput.value = maxDays;
     }
   }
   checkFormValidity();
 }
 
 function isDateValid() {
   const day = dayInput.value;
   const month = monthInput.value;
   const year = yearInput.value;
   if (!day || !month || !year) return false;
   
   const d = parseInt(day);
   const m = parseInt(month);
   const y = parseInt(year);
   
   const maxDays = getMaxDays(month, year);
   if (d < 1 || d > maxDays) return false;
   if (m < 1 || m > 12) return false;
   if (y < 1900 || y > new Date().getFullYear() - 18) return false;
   
   const currentYear = new Date().getFullYear();
   if (currentYear - y < 18) return false;
   
   return true;
 }
 
 function checkFormValidity() {
   const desireChildSelected = Array.from(desireChildRadios).some(r => r.checked);
   const regionFilled = regionInput.value.trim() !== '';
   const firstNameValue = extractValueFromPrefixed(firstNameInput);
   const lastNameValue = extractValueFromPrefixed(lastNameInput);
   const genderValue = extractValueFromPrefixed(genderInput);
   const genotypeValue = extractValueFromPrefixed(genotypeInput);
   const bloodGroupValue = extractValueFromPrefixed(bloodGroupInput);
   
   const allFieldsFilled = firstNameValue !== '' && 
                           lastNameValue !== '' && 
                           genderValue !== '' && 
                           genotypeValue !== '' && 
                           bloodGroupValue !== '' && 
                           regionFilled && 
                           isDateValid() && 
                           desireChildSelected && 
                           honorCheckbox.checked;
   
   submitBtn.disabled = !allFieldsFilled;
 }
 
 [regionInput, dayInput, monthInput, yearInput].forEach(input => {
   input.addEventListener('input', checkFormValidity);
   input.addEventListener('change', checkFormValidity);
 });
 
 desireChildRadios.forEach(radio => {
   radio.addEventListener('change', checkFormValidity);
 });
 
 honorCheckbox.addEventListener('change', checkFormValidity);
 checkFormValidity();
 
 photoBox.addEventListener('click', () => {
   const fileInput = document.createElement('input');
   fileInput.type = 'file';
   fileInput.accept = 'image/*';
   fileInput.onchange = (e) => {
     if(e.target.files.length > 0) {
       selectedPhotoFile = e.target.files[0];
       const reader = new FileReader();
       reader.onload = function(event) {
         photoBox.style.backgroundImage = "url('" + event.target.result + "')";
         photoBox.style.backgroundSize = "cover";
         photoBox.style.backgroundPosition = "center";
         photoBox.classList.add("has-image");
         photoPlaceholder.style.display = 'none';
       };
       reader.readAsDataURL(selectedPhotoFile);
     }
   };
   fileInput.click();
 });
 
 submitBtn.addEventListener('click', async function(){
   submitBtn.disabled = true;
   const originalText = buttonText.textContent;
   buttonText.innerHTML = '<span class="loader"></span> Validation...';
   
   try {
     const day = dayInput.value;
     const month = monthInput.value;
     const year = yearInput.value;
     
     if (!isDateValid()) {
       alert("Date de naissance invalide. Veuillez vérifier le jour, le mois et l'année.");
       submitBtn.disabled = false;
       buttonText.textContent = originalText;
       return;
     }
     
     let desireChildValue = "";
     for (let radio of desireChildRadios) {
       if (radio.checked) {
         desireChildValue = radio.value;
         break;
       }
     }
     
     const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
     
     const userData = {
       firstName: extractValueFromPrefixed(firstNameInput),
       lastName: extractValueFromPrefixed(lastNameInput),
       gender: extractValueFromPrefixed(genderInput),
       genotype: extractValueFromPrefixed(genotypeInput),
       bloodGroup: extractValueFromPrefixed(bloodGroupInput),
       region: regionInput.value,
       residence: regionInput.value,
       dob: dob,
       desireChild: desireChildValue,
       photo: selectedPhotoFile ? await fileToBase64(selectedPhotoFile) : "",
       language: '${req.lang}',
       isPublic: true,
       qrVerified: true,
       verificationBadge: 'lab'
     };
     
     const res = await fetch('/api/register', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify(userData)
     });
     
     const data = await res.json();
     
     setTimeout(() => {
       if (data.success) {
         successMessage.style.display = 'block';
         setTimeout(() => {
           window.location.href = '/profile';
         }, 2000);
       } else {
         alert("Erreur lors de l'inscription: " + (data.error || "Inconnue"));
         submitBtn.disabled = false;
         buttonText.textContent = originalText;
       }
     }, 1500);
     
   } catch (error) {
     console.error("Erreur lors de la validation.", error);
     alert("Erreur de connexion au serveur");
     submitBtn.disabled = false;
     buttonText.textContent = originalText;
   }
 });
 
 function fileToBase64(file) {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = () => resolve(reader.result);
     reader.onerror = error => reject(error);
   });
 }
 
 window.addEventListener('beforeunload', () => {
   if (html5QrCode && html5QrCode.isScanning) {
     html5QrCode.stop().catch(err => console.log(err));
   }
   if (scanTimeout) {
     clearTimeout(scanTimeout);
   }
 });
 </script>
</body>
</html>`);
});

// ============================================
// INSCRIPTION MANUELLE
// ============================================
app.get('/signup-manual', (req, res) => {
 const t = req.t;
 const datePicker = generateDateOptions(req);
 res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('signupTitle')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div class="page-white">
     <h2 style="color:#ff416c;">${t('signupTitle')}</h2>
     <p style="font-size:1.2rem; margin-bottom:20px;">${t('signupSub')}</p>
     
     <div class="info-message">
       <span class="info-icon">📍</span>
       <p>${t('locationHelp')}</p>
     </div>
     
     <form id="signupForm">
       <div class="photo-circle" id="photoCircle" onclick="document.getElementById('photoInput').click()">
         <span id="photoText">📷</span>
       </div>
       <input type="file" id="photoInput" style="display:none" onchange="previewPhoto(event)" accept="image/*">
       
       <div class="input-label">${t('firstName')}</div>
       <input type="text" id="firstName" class="input-box" placeholder="${t('firstName')}" required>
       
       <div class="input-label">${t('lastName')}</div>
       <input type="text" id="lastName" class="input-box" placeholder="${t('lastName')}" required>
       
       <div class="input-label">${t('gender')}</div>
       <select id="gender" class="input-box" required>
         <option value="">${t('gender')}</option>
         <option value="Homme">${t('male')}</option>
         <option value="Femme">${t('female')}</option>
       </select>
       
       <div class="input-label">${t('dob')}</div>
       ${datePicker}
       
       <div class="input-label">${t('city')}</div>
       <input type="text" id="residence" class="input-box" placeholder="${t('city')}" required>
       
       <div class="input-label">${t('region')}</div>
       <input type="text" id="region" class="input-box" placeholder="${t('region')}" required>
       
       <div class="input-label">${t('genotype')}</div>
       <select id="genotype" class="input-box" required>
         <option value="">${t('genotype')}</option>
         <option value="AA">AA</option>
         <option value="AS">AS</option>
         <option value="SS">SS</option>
       </select>
       
       <div style="display:flex; gap:10px;">
         <select id="bloodType" class="input-box" style="flex:2;" required>
           <option value="">${t('bloodGroup')}</option>
           <option value="A">A</option>
           <option value="B">B</option>
           <option value="AB">AB</option>
           <option value="O">O</option>
         </select>
         <select id="bloodRh" class="input-box" style="flex:1;" required>
           <option value="+">+</option>
           <option value="-">-</option>
         </select>
       </div>
       
       <div class="input-label">${t('desireChild')}</div>
       <select id="desireChild" class="input-box" required>
         <option value="">${t('desireChild')}</option>
         <option value="Oui">${t('yes')}</option>
         <option value="Non">${t('no')}</option>
       </select>
       
       <input type="hidden" id="qrVerified" value="false">
       
       <div style="display:flex; align-items:center; gap:10px; margin:20px 0;">
         <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
         <label for="oath">${t('honorText')}</label>
       </div>
       
       <button type="submit" class="btn-pink">${t('createProfile')}</button>
     </form>
     
     <div style="text-align:center; margin:20px 0;">
       <a href="/signup-qr" class="back-link">${t('withCertificate')}</a>
     </div>
     <a href="/signup-choice" class="back-link">← ${t('backCharter')}</a>
   </div>
 </div>
 
 <script>
 let photoBase64 = "";
 
 window.onload = function() {
   document.getElementById('photoCircle').style.backgroundImage = "";
   document.getElementById('photoText').style.display = "block";
 }
 
 function previewPhoto(e) {
   const reader = new FileReader();
   reader.onload = function() {
     photoBase64 = reader.result;
     document.getElementById('photoCircle').style.backgroundImage = 'url(' + photoBase64 + ')';
     document.getElementById('photoCircle').style.backgroundSize = 'cover';
     document.getElementById('photoText').style.display = 'none';
   };
   reader.readAsDataURL(e.target.files[0]);
 }
 
 document.getElementById('signupForm').addEventListener('submit', async function(e) {
   e.preventDefault();
   
   const day = document.querySelector('select[name="day"]').value;
   const month = document.querySelector('select[name="month"]').value;
   const year = document.querySelector('select[name="year"]').value;
   
   if (!day || !month || !year) {
     alert('${t('dob')} ${t('required')}');
     return;
   }
   
   const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
   
   const userData = {
     firstName: document.getElementById('firstName').value,
     lastName: document.getElementById('lastName').value,
     gender: document.getElementById('gender').value,
     dob: dob,
     residence: document.getElementById('residence').value,
     region: document.getElementById('region').value,
     genotype: document.getElementById('genotype').value,
     bloodGroup: document.getElementById('bloodType').value + document.getElementById('bloodRh').value,
     desireChild: document.getElementById('desireChild').value,
     photo: photoBase64 || "",
     language: '${req.lang}',
     isPublic: true,
     qrVerified: false,
     verificationBadge: 'self'
   };
   
   try {
     const res = await fetch('/api/register', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify(userData)
     });
     
     const data = await res.json();
     
     if (data.success) {
       window.location.href = '/profile';
     } else {
       alert("Erreur lors de l'inscription: " + (data.error || "Inconnue"));
     }
   } catch(error) {
     alert("Erreur de connexion au serveur");
   }
 });
 </script>
</body>
</html>`);
});

// ============================================
// PROFIL
// ============================================
app.get('/profile', requireAuth, async (req, res) => {
 try {
   const user = await User.findById(req.session.userId);
   if (!user) return res.redirect('/');
   const t = req.t;
   const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false, isBlocked: false });
   const genderDisplay = user.gender === 'Homme' ? t('male') : t('female');
   const unreadBadge = unreadCount > 0 ? `<span class="profile-unread">${unreadCount}</span>` : "";
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('myProfile')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   
   <div id="request-popup">
     <div class="popup-card">
       <div class="popup-icon">💌</div>
       <div class="popup-message" id="request-message"></div>
       <div class="popup-buttons">
         <button class="accept-btn" onclick="acceptRequest()">${t('acceptRequest')}</button>
         <button class="reject-btn" onclick="rejectRequest()">${t('rejectRequest')}</button>
       </div>
     </div>
   </div>
   
   <div id="rejection-popup">
     <div class="popup-card">
       <div class="popup-icon">🌸</div>
       <div class="popup-message" id="rejection-message"></div>
       <div class="action-buttons">
         <button class="btn-pink" onclick="goToProfile()" style="flex:1;">${t('returnProfile')}</button>
         <button class="btn-dark" onclick="goToMatching()" style="flex:1;">${t('newMatch')}</button>
       </div>
     </div>
   </div>
   
   <div id="loading-popup">
     <div class="popup-card">
       <div class="spinner"></div>
       <div class="popup-message" id="loading-message">${t('sendingRequest')}</div>
     </div>
   </div>
   
   <div class="page-white">
     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
       <a href="/" class="btn-dark" style="padding: 12px 20px; width: auto;">${t('home')}</a>
       <a href="/inbox" class="btn-pink" style="padding: 12px 20px; width: auto; display: flex; align-items: center;">
         ${t('messages')} ${unreadBadge}
       </a>
       <a href="/settings" style="font-size: 2rem; text-decoration: none;">⚙️</a>
     </div>
     
     <div style="display: flex; justify-content: center; margin: 10px 0;">
       <select onchange="window.location.href='/lang/'+this.value" style="padding: 8px 15px; border-radius: 20px; border: 2px solid #ff416c; background: white; font-size: 1rem;">
         <option value="fr" ${user.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
         <option value="en" ${user.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
         <option value="pt" ${user.language === 'pt' ? 'selected' : ''}>🇵🇹 ${t('portuguese')}</option>
         <option value="es" ${user.language === 'es' ? 'selected' : ''}>🇪🇸 ${t('spanish')}</option>
         <option value="ar" ${user.language === 'ar' ? 'selected' : ''}>🇸🇦 ${t('arabic')}</option>
         <option value="zh" ${user.language === 'zh' ? 'selected' : ''}>🇨🇳 ${t('chinese')}</option>
       </select>
     </div>
     
     <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
     
     <h2 style="text-align: center;">${user.firstName} ${user.lastName} ${getVerificationBadge(user, t)}</h2>
     <p style="text-align: center; margin: 5px 0;">
       ${user.qrVerified ? 
         '<span class="verified-badge-text" style="color: #1DA1F2; font-size: 0.9rem;">✓ ' + t('dataFromCertificate') + '</span>' : 
         '<span class="unverified-badge-text" style="color: #ff9800; font-size: 0.9rem;">⚠️ ' + t('manualEntry') + '</span>'}
     </p>
     <p style="text-align: center; font-size:1.2rem;">${user.residence || ''} • ${user.region || ''} • ${genderDisplay}</p>
     
     <div class="st-group">
       <div class="st-item"><span>${t('genotype_label')}</span><b>${user.genotype}</b></div>
       <div class="st-item"><span>${t('blood_label')}</span><b>${user.bloodGroup}</b></div>
       <div class="st-item"><span>${t('age_label')}</span><b>${calculerAge(user.dob)} ${t('age_label')}</b></div>
       <div class="st-item"><span>${t('residence_label')}</span><b>${user.residence || ''}</b></div>
       <div class="st-item"><span>${t('region_label')}</span><b>${user.region || ''}</b></div>
       <div class="st-item"><span>${t('project_label')}</span><b>${user.desireChild === 'Oui' ? t('yes') : t('no')}</b></div>
     </div>
     
     <a href="/matching" class="btn-pink">${t('findPartner')}</a>
   </div>
 </div>
 
 <script>
 let currentRequestId = null;
 
 async function checkRequests() {
   try {
     const res = await fetch('/api/requests/pending');
     const reqs = await res.json();
     if (reqs.length > 0) {
       showRequestPopup(reqs[0]);
     }
   } catch(e) {}
 }
 
 function showRequestPopup(r) {
   currentRequestId = r._id;
   const msg = "${t('interestPopup')}".replace('{name}', r.senderId.firstName);
   document.getElementById('request-message').innerText = msg;
   document.getElementById('request-popup').style.display = 'flex';
   if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
 }
 
 async function acceptRequest() {
   if (!currentRequestId) return;
   const res = await fetch('/api/requests/' + currentRequestId + '/accept', { method: 'POST' });
   if (res.ok) {
     document.getElementById('request-popup').style.display = 'none';
     window.location.href = '/inbox';
   }
 }
 
 async function rejectRequest() {
   if (!currentRequestId) return;
   const res = await fetch('/api/requests/' + currentRequestId + '/reject', { method: 'POST' });
   if (res.ok) {
     document.getElementById('request-popup').style.display = 'none';
   }
 }
 
 async function checkRejections() {
   try {
     const res = await fetch('/api/rejections/unread');
     const rejs = await res.json();
     if (rejs.length > 0) {
       showRejectionPopup(rejs[0]);
     }
   } catch(e) {}
 }
 
 function showRejectionPopup(r) {
   const msg = "${t('rejectionPopup')}".replace('{name}', r.senderFirstName);
   document.getElementById('rejection-message').innerText = msg;
   document.getElementById('rejection-popup').style.display = 'flex';
   fetch('/api/rejections/' + r.requestId + '/view', { method: 'POST' });
 }
 
 function goToProfile() {
   document.getElementById('rejection-popup').style.display = 'none';
   window.location.href = '/profile';
 }
 
 function goToMatching() {
   document.getElementById('rejection-popup').style.display = 'none';
   window.location.href = '/matching';
 }
 
 setInterval(checkRequests, 5000);
 setInterval(checkRejections, 5000);
 checkRequests();
 checkRejections();
 </script>
</body>
</html>`);
 } catch(error) {
   console.error(error);
   res.status(500).send('Erreur profil');
 }
});

// ============================================
// MATCHING
// ============================================
app.get('/matching', requireAuth, async (req, res) => {
 try {
   const currentUser = await User.findById(req.session.userId);
   if (!currentUser) return res.redirect('/');
   const t = req.t;
   const isSSorAS = (currentUser.genotype === 'SS' || currentUser.genotype === 'AS');
   const regionFilter = req.query.region || 'all';
   
   const messages = await Message.find({
     $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
     isBlocked: false
   });
   
   const conversationIds = new Set();
   messages.forEach(msg => {
     if (msg.senderId.toString() !== currentUser._id.toString()) {
       conversationIds.add(msg.senderId.toString());
     }
     if (msg.receiverId.toString() !== currentUser._id.toString()) {
       conversationIds.add(msg.receiverId.toString());
     }
   });
   
   const rejectedArray = currentUser.rejectedRequests ? currentUser.rejectedRequests.map(id => id.toString()) : [];
   const blockedArray = currentUser.blockedUsers ? currentUser.blockedUsers.map(id => id.toString()) : [];
   const blockedByArray = currentUser.blockedBy ? currentUser.blockedBy.map(id => id.toString()) : [];
   
   const excludedIds = [...new Set([
     ...blockedArray,
     ...blockedByArray,
     ...Array.from(conversationIds),
     ...rejectedArray
   ])];
   
   let query = {
     _id: { $ne: currentUser._id },
     gender: currentUser.gender === 'Homme' ? 'Femme' : 'Homme',
     isPublic: true
   };
   
   if (excludedIds.length > 0) {
     query._id.$nin = excludedIds;
   }
   
   if (regionFilter === 'mine' && currentUser.region) {
     query.region = currentUser.region;
   }
   
   let partners = await User.find(query);
   
   if (isSSorAS) {
     partners = partners.filter(p => p.genotype === 'AA');
   }
   
   let partnersHTML = '';
   if (partners.length === 0) {
     partnersHTML = `
       <div class="empty-message">
         <span>🔍</span>
         <h3>${t('searchOngoing')}</h3>
         <p>${t('expandCommunity')}</p>
       </div>
     `;
   } else {
     partners.forEach(p => {
       const age = calculerAge(p.dob);
       
       partnersHTML += `
         <div class="match-card">
           <div class="match-photo-blur" style="background-image:url('${p.photo || ''}'); background-size: cover;"></div>
           <div class="match-info">
             <b style="font-size:1.2rem;">${p.firstName} ${getVerificationBadge(p, t)}</b>
             <br><span style="font-size:0.9rem;">${p.genotype} • ${age} ans</span>
             <br><span style="font-size:0.8rem; color:#666;">${p.residence || ''} ${p.region || ''}</span>
           </div>
           <div class="match-actions">
             <button class="btn-action btn-contact" onclick="sendInterest('${p._id}')">${t('contact')}</button>
             <button class="btn-action btn-details" onclick="showDetails('${p._id}')">${t('details')}</button>
           </div>
         </div>
       `;
     });
   }
   
   const ssasPopup = isSSorAs ? `
     <div id="genlove-popup" style="display:flex;">
       <div class="popup-card">
         <div class="popup-icon">🫀</div>
         <div class="popup-title">${t('healthCommitment')}</div>
         <div class="popup-message">
           ${currentUser.genotype === 'AS' ? t('popupMessageAS') : t('popupMessageSS')}
         </div>
         <button class="ok-btn" onclick="document.getElementById('genlove-popup').style.display='none';">${t('understood')}</button>
       </div>
     </div>
   ` : '';
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('compatiblePartners')}</title>
 ${styles}
 ${notifyScript}
 <style>
   #genlove-popup { display: none; position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:10000; align-items:center; justify-content:center; padding:20px; }
   #loading-popup { display: none; position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.9); z-index:20000; align-items:center; justify-content:center; padding:20px; }
   #popup-overlay { display: none; }
 </style>
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   
   ${ssasPopup}
   
   <div id="loading-popup">
     <div class="popup-card">
       <div class="spinner"></div>
       <div class="popup-message" id="loading-message">${t('sendingRequest')}</div>
     </div>
   </div>
   
   <div id="popup-overlay" onclick="closePopup()">
     <div class="popup-content" onclick="event.stopPropagation()">
       <span class="close-popup" onclick="closePopup()">&times;</span>
       <h3 id="pop-name" style="color:#ff416c; margin-top:0;">${t('details')}</h3>
       <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
       <div id="pop-msg" class="popup-msg"></div>
       <button class="btn-pink" style="margin:20px 0 0 0; width:100%" onclick="sendInterestFromPopup()">${t('contact')}</button>
     </div>
   </div>
   
   <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
     <h3 style="margin:0; color:#1a2a44;">${t('compatiblePartners')}</h3>
   </div>
   
   <div class="filter-container">
     <select id="regionFilter" class="input-box" style="margin:0;" onchange="applyRegionFilter()">
       <option value="all" ${regionFilter === 'all' ? 'selected' : ''}>${t('allRegions')}</option>
       <option value="mine" ${regionFilter === 'mine' ? 'selected' : ''}>${t('myRegion')}</option>
     </select>
   </div>
   
   <div id="match-container">
     ${partnersHTML}
   </div>
   
   <a href="/profile" class="btn-dark" style="margin:20px auto; text-decoration:none;">${t('backProfile')}</a>
 </div>
 
 <script>
 let partners = ${JSON.stringify(partners)};
 let currentPartnerId = null;
 
 function applyRegionFilter() {
   const filter = document.getElementById('regionFilter').value;
   window.location.href = '/matching?region=' + filter;
 }
 
 async function sendInterest(partnerId) {
   document.getElementById('loading-popup').style.display = 'flex';
   try {
     const res = await fetch('/api/requests', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ receiverId: partnerId })
     });
     if (res.ok) {
       showNotify('${t('requestSent')}', 'success');
       document.getElementById('loading-popup').style.display = 'none';
       location.reload();
     } else {
       const error = await res.json();
       showNotify(error.error || 'Erreur', 'error');
       document.getElementById('loading-popup').style.display = 'none';
     }
   } catch(e) {
     showNotify('Erreur réseau', 'error');
     document.getElementById('loading-popup').style.display = 'none';
   }
 }
 
 function sendInterestFromPopup() {
   if (currentPartnerId) {
     sendInterest(currentPartnerId);
     closePopup();
   }
 }
 
 function showDetails(partnerId) {
   const partner = partners.find(p => p._id === partnerId);
   if (!partner) return;
   
   currentPartnerId = partner._id;
   
   const myGt = '${currentUser.genotype}';
   
   function calculateAge(dob) {
     if (!dob) return "?";
     const birthDate = new Date(dob);
     const today = new Date();
     let age = today.getFullYear() - birthDate.getFullYear();
     const monthDiff = today.getMonth() - birthDate.getMonth();
     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
     return age;
   }
   
   const age = calculateAge(partner.dob);
   
   document.getElementById('pop-name').innerText = partner.firstName || "Profil";
   document.getElementById('pop-details').innerHTML = 
     '<b>${t('genotype_label')} :</b> ' + partner.genotype + '<br>' +
     '<b>${t('blood_label')} :</b> ' + partner.bloodGroup + '<br>' +
     '<b>${t('residence_label')} :</b> ' + (partner.residence || '') + '<br>' +
     '<b>${t('region_label')} :</b> ' + (partner.region || '') + '<br>' +
     '<b>${t('age_label')} :</b> ' + age + ' ans<br><br>' +
     '<b>${t('project_label')} :</b><br>' +
     '<i>' + (partner.desireChild === 'Oui' ? '${t('yes')}' : '${t('no')}') + '</i>' +
     (partner.qrVerified ? '<br><br><span style="color:#4caf50;">✅ ${t('dataFromCertificate')}</span>' : '');
   
   let msg = "";
   if(myGt === "AA" && partner.genotype === "AA") {
     msg = "<b>🤍 L'Union Sérénité :</b> Félicitations ! Votre compatibilité génétique est idéale.";
   }
   else if(myGt === "AA" && partner.genotype === "AS") {
     msg = "<b>🛡️ L'Union Protectrice :</b> Excellent choix. En tant que AA, vous jouez un rôle protecteur.";
   }
   else if(myGt === "AA" && partner.genotype === "SS") {
     msg = "<b>💞 L'Union Solidaire :</b> Une union magnifique et sans crainte.";
   }
   else if(myGt === "AS" && partner.genotype === "AA") {
     msg = "<b>⚖️ L'Union Équilibrée :</b> Votre choix est responsable !";
   }
   else if(myGt === "SS" && partner.genotype === "AA") {
     msg = "<b>🌟 L'Union Espoir :</b> Vous avez fait le choix le plus sûr.";
   }
   else {
     msg = "<b>💬 Compatibilité standard :</b> Vous pouvez échanger avec ce profil.";
   }
   document.getElementById('pop-msg').innerHTML = msg;
   document.getElementById('popup-overlay').style.display = 'flex';
 }
 
 function closePopup() {
   document.getElementById('popup-overlay').style.display = 'none';
 }
 </script>
</body>
</html>`);
 } catch(error) {
   console.error("Erreur matching:", error);
   res.status(500).send("Erreur matching");
 }
});

// ============================================
// INBOX
// ============================================
app.get('/inbox', requireAuth, async (req, res) => {
 try {
   const currentUser = await User.findById(req.session.userId);
   if (!currentUser) return res.redirect('/');
   const t = req.t;
   
   const messages = await Message.find({
     $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
     isBlocked: false
   })
   .populate('senderId receiverId')
   .sort({ timestamp: -1 });
   
   const conversations = new Map();
   
   for(const m of messages) {
     const other = m.senderId._id.equals(currentUser._id) ? m.receiverId : m.senderId;
     if(currentUser.blockedUsers && currentUser.blockedUsers.includes(other._id)) {
       continue;
     }
     if(!conversations.has(other._id.toString())) {
       const unread = await Message.countDocuments({
         senderId: other._id,
         receiverId: currentUser._id,
         read: false,
         isBlocked: false
       });
       conversations.set(other._id.toString(), { user: other, last: m, unread });
     }
   }
   
   let inboxHTML = "";
   if (conversations.size === 0) {
     inboxHTML = `
       <div class="empty-message">
         <span>📭</span>
         <h3>${t('emptyInbox')}</h3>
         <p>${t('startConversation')}</p>
         <a href="/matching" class="btn-pink" style="display: inline-block; width: auto; margin-top: 20px;">${t('findPartners')}</a>
       </div>
     `;
   } else {
     conversations.forEach((conv, id) => {
       const timeAgo = formatTimeAgo(conv.last.timestamp, currentUser.language);
       inboxHTML += `
         <div class="inbox-item ${conv.unread ? 'unread' : ''}" onclick="window.location.href='/chat?partnerId=${id}'">
           <div style="display: flex; justify-content: space-between;">
             <b class="user-name">${conv.user.firstName} ${conv.user.lastName}</b>
             <span style="font-size:0.9rem; color:#999;">${timeAgo}</span>
           </div>
           <div class="message-preview" style="margin-top: 5px;">
             ${conv.last.text.substring(0, 50)}${conv.last.text.length > 50 ? '...' : ''}
           </div>
           ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
         </div>
       `;
     });
   }
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('inboxTitle')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   <div class="page-white">
     <h2>${t('inboxTitle')}</h2>
     ${inboxHTML}
     <div class="navigation">
       <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
       <a href="/matching" class="nav-link">${t('findPartner')}</a>
     </div>
   </div>
 </div>
</body>
</html>`);
 } catch(error) {
   console.error(error);
   res.status(500).send('Erreur inbox');
 }
});

// ============================================
// CHAT
// ============================================
app.get('/chat', requireAuth, async (req, res) => {
 try {
   const currentUser = await User.findById(req.session.userId);
   const partnerId = req.query.partnerId;
   if (!partnerId) return res.redirect('/inbox');
   const partner = await User.findById(partnerId);
   if (!partner) return res.redirect('/inbox');
   const t = req.t;
   
   const isBlockedByPartner = partner.blockedBy && partner.blockedBy.includes(currentUser._id);
   const hasBlockedPartner = currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId);
   
   if (isBlockedByPartner) {
     return res.send(`
       <div class="app-shell">
         <div class="page-white" style="text-align: center; padding: 50px 20px;">
           <h2>🚫</h2>
           <p>${t('blockedByUser')}</p>
           <p style="color:#666; margin:20px 0;">${t('blockedMessage')}</p>
           <a href="/inbox" class="btn-pink">← ${t('inboxTitle')}</a>
         </div>
       </div>
     `);
   }
   
   await Message.updateMany(
     { senderId: partnerId, receiverId: currentUser._id, read: false, isBlocked: false },
     { read: true }
   );
   
   const messages = await Message.find({
     $or: [
       { senderId: currentUser._id, receiverId: partnerId },
       { senderId: partnerId, receiverId: currentUser._id }
     ],
     isBlocked: false
   }).sort({ timestamp: 1 });
   
   let msgs = "";
   messages.forEach(m => {
     const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
     msgs += `<div class="bubble ${cls}">${m.text}</div>`;
   });
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - Chat</title>
 ${styles}
 ${notifyScript}
 <style>
   .chat-header {
     background: #1a2a44;
     color: white;
     padding: 15px 20px;
     display: flex;
     justify-content: space-between;
     align-items: center;
   }
   .chat-messages {
     padding: 20px;
     min-height: 60vh;
     display: flex;
     flex-direction: column;
     gap: 10px;
     background: #f5f7fb;
   }
   .bubble {
     padding: 12px 18px;
     border-radius: 20px;
     max-width: 80%;
     font-size: 1rem;
     line-height: 1.4;
   }
   .received {
     background: white;
     align-self: flex-start;
     border-bottom-left-radius: 5px;
   }
   .sent {
     background: #ff416c;
     color: white;
     align-self: flex-end;
     border-bottom-right-radius: 5px;
   }
   .input-area {
     display: flex;
     gap: 10px;
     padding: 15px;
     background: white;
     border-top: 2px solid #eee;
   }
   .input-area input {
     flex: 1;
     padding: 12px 20px;
     border: 2px solid #e2e8f0;
     border-radius: 30px;
     outline: none;
   }
   .input-area button {
     padding: 12px 25px;
     background: #ff416c;
     color: white;
     border: none;
     border-radius: 30px;
     cursor: pointer;
     font-weight: 600;
   }
 </style>
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   <div class="chat-header">
     <span><b>${partner.firstName}</b></span>
     <div>
       <button class="btn-action" onclick="blockUser('${partnerId}')" style="padding:8px 15px; margin-right:10px; background:#dc3545; color:white;">${t('block')}</button>
       <a href="/inbox" style="color: white; text-decoration: none; font-size: 1.5rem;">✕</a>
     </div>
   </div>
   <div class="chat-messages" id="messages">
     ${msgs}
   </div>
   ${!hasBlockedPartner ? `
     <div class="input-area">
       <input id="msgInput" placeholder="${t('yourMessage')}">
       <button onclick="sendMessage('${partnerId}')">${t('send')}</button>
     </div>
   ` : ''}
 </div>
 
 <script>
 async function sendMessage(id) {
   const msg = document.getElementById('msgInput');
   if (msg.value.trim()) {
     await fetch('/api/messages', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ receiverId: id, text: msg.value })
     });
     location.reload();
   }
 }
 
 async function blockUser(id) {
   if (confirm('${t('block')} ?')) {
     await fetch('/api/block/' + id, { method: 'POST' });
     window.location.href = '/inbox';
   }
 }
 
 document.getElementById('msgInput').addEventListener('keypress', function(e) {
   if (e.key === 'Enter') {
     e.preventDefault();
     sendMessage('${partnerId}');
   }
 });
 
 window.scrollTo(0, document.body.scrollHeight);
 </script>
</body>
</html>`);
 } catch(error) {
   console.error(error);
   res.status(500).send('Erreur chat');
 }
});

// ============================================
// SETTINGS
// ============================================
app.get('/settings', requireAuth, async (req, res) => {
 try {
   const currentUser = await User.findById(req.session.userId);
   const t = req.t;
   const blockedCount = currentUser.blockedUsers ? currentUser.blockedUsers.length : 0;
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('settingsTitle')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   
   <div id="delete-confirm-popup">
     <div class="popup-card" style="max-width:340px;">
       <div class="popup-icon">⚠️</div>
       <h3 style="color:#dc3545; margin-bottom:15px;">${t('confirmDelete')}</h3>
       <p style="color:#666; margin-bottom:25px; font-size:1rem;">
         ${t('deleteAccount')}<br>
         <strong>${t('confirmDelete')}</strong>
       </p>
       <div style="display:flex; gap:10px;">
         <button onclick="confirmDelete()" style="flex:1; background:#dc3545; color:white; border:none; padding:15px; border-radius:50px; font-weight:bold; cursor:pointer;">${t('delete')}</button>
         <button onclick="closeDeletePopup()" style="flex:1; background:#eee; color:#333; border:none; padding:15px; border-radius:50px; font-weight:bold; cursor:pointer;">${t('cancel') || 'Annuler'}</button>
       </div>
     </div>
   </div>
   
   <div style="padding:25px; background:white; text-align:center;">
     <div style="font-size:2.5rem; font-weight:bold;">
       <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
     </div>
   </div>
   
   <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">${t('visibility')}</div>
   <div class="st-group">
     <div class="st-item">
       <span>${t('visibility')}</span>
       <label class="switch">
         <input type="checkbox" id="visibilitySwitch" ${currentUser.isPublic ? 'checked' : ''} onchange="updateVisibility(this.checked)">
         <span class="slider"></span>
       </label>
     </div>
     <div class="st-item" style="font-size:0.8rem; color:#666;">
       ${t('visibility')} : <b id="status" style="color:#ff416c;">${currentUser.isPublic ? t('public') || 'Public' : t('private') || 'Privé'}</b>
     </div>
   </div>
   
   <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">${t('language')}</div>
   <div class="st-group">
     <div class="st-item">
       <span>${t('language')}</span>
       <select onchange="window.location.href='/lang/'+this.value" style="padding:8px; border-radius:10px; border:1px solid #ddd;">
         <option value="fr" ${currentUser.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
         <option value="en" ${currentUser.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
         <option value="pt" ${currentUser.language === 'pt' ? 'selected' : ''}>🇵🇹 ${t('portuguese')}</option>
         <option value="es" ${currentUser.language === 'es' ? 'selected' : ''}>🇪🇸 ${t('spanish')}</option>
         <option value="ar" ${currentUser.language === 'ar' ? 'selected' : ''}>🇸🇦 ${t('arabic')}</option>
         <option value="zh" ${currentUser.language === 'zh' ? 'selected' : ''}>🇨🇳 ${t('chinese')}</option>
       </select>
     </div>
   </div>
   
   <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">${t('settings')}</div>
   <div class="st-group">
     <a href="/edit-profile" style="text-decoration:none;" class="st-item">
       <span>✏️ ${t('editProfile')}</span>
       <b>→</b>
     </a>
     <a href="/blocked-list" style="text-decoration:none;" class="st-item">
       <span>🚫 ${t('blockedUsers')}</span>
       <b>${blockedCount} →</b>
     </a>
   </div>
   
   <div class="st-group danger-zone">
     <div class="st-item" style="color:#dc3545; font-weight:bold; justify-content:center;">
       ⚠️ ${t('dangerZone')} ⚠️
     </div>
     <div style="padding:20px; text-align:center;">
       <p style="color:#666; margin-bottom:20px; font-size:0.95rem;">
         ${t('deleteAccount')}
       </p>
       <button class="btn-action" style="background:#dc3545; color:white; padding:15px; width:100%; font-size:1.1rem;" onclick="showDeleteConfirmation()">${t('deleteAccount')}</button>
     </div>
   </div>
   
   <a href="/profile" class="btn-pink" style="text-decoration:none;">← ${t('backProfile')}</a>
   <a href="/logout-success" class="btn-dark" style="text-decoration:none;">${t('logout')}</a>
 </div>
 
 <script>
 function showDeleteConfirmation() {
   document.getElementById('delete-confirm-popup').style.display = 'flex';
 }
 
 function closeDeletePopup() {
   document.getElementById('delete-confirm-popup').style.display = 'none';
 }
 
 async function confirmDelete() {
   closeDeletePopup();
   showNotify('${t('deleteAccount')}...', 'info');
   try {
     const res = await fetch('/api/delete-account', { method: 'DELETE' });
     if (res.ok) {
       showNotify('${t('deleteAccount')}', 'success');
       setTimeout(() => window.location.href = '/', 1500);
     } else {
       showNotify('${t('errorMessage')}', 'error');
     }
   } catch(e) {
     showNotify('${t('errorMessage')}', 'error');
   }
 }
 
 async function updateVisibility(isPublic) {
   const status = document.getElementById('status');
   status.innerText = isPublic ? '${t('public') || 'Public'}' : '${t('private') || 'Privé'}';
   const res = await fetch('/api/visibility', {
     method: 'PUT',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({ isPublic })
   });
   if (res.ok) {
     showNotify('${t('successMessage')}', 'success');
   } else {
     showNotify('${t('errorMessage')}', 'error');
     document.getElementById('visibilitySwitch').checked = !isPublic;
     status.innerHTML = !isPublic ? '${t('public') || 'Public'}' : '${t('private') || 'Privé'}';
   }
 }
 </script>
</body>
</html>`);
 } catch(error) {
   console.error(error);
   res.status(500).send('Erreur paramètres');
 }
});

// ============================================
// EDIT PROFILE (CORRIGÉ AVEC TRADUCTIONS)
// ============================================
app.get('/edit-profile', requireAuth, async (req, res) => {
 try {
   const user = await User.findById(req.session.userId);
   const t = req.t;
   const datePicker = generateDateOptions(req, user.dob);
   const bloodOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => 
     `<option value="${g}" ${user.bloodGroup === g ? 'selected' : ''}>${g}</option>`
   ).join('');
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('editProfile')}</title>
 ${styles}
 ${notifyScript}
 <style>
   input[readonly], select[readonly] {
     background-color: #f3f4f6;
     cursor: not-allowed;
     opacity: 0.9;
     border-color: #10b981;
   }
   .protected-badge {
     font-size: 11px;
     color: #10b981;
     margin-top: -8px;
     margin-bottom: 10px;
     padding-left: 5px;
   }
   .protected-badge::before {
     content: "✔";
     margin-right: 3px;
     font-weight: bold;
   }
   .photo-circle {
     width: 110px;
     height: 110px;
     border: 4px solid #ff416c;
     border-radius: 50%;
     margin: 15px auto;
     background-size: cover;
     background-position: center;
     box-shadow: 0 10px 25px rgba(255,65,108,0.3);
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
   }
   .input-label {
     text-align: left;
     font-size: 0.9rem;
     color: #1a2a44;
     margin-top: 10px;
     font-weight: 600;
   }
   .input-box {
     width: 100%;
     padding: 14px;
     border: 2px solid #e2e8f0;
     border-radius: 15px;
     margin: 8px 0;
     font-size: 1rem;
     background: #f8f9fa;
     transition: all 0.3s;
     box-sizing: border-box;
   }
   .input-box:focus {
     border-color: #ff416c;
     outline: none;
     box-shadow: 0 0 0 4px rgba(255,65,108,0.2);
   }
   .custom-date-picker {
     display: flex;
     gap: 5px;
     margin: 10px 0;
   }
   .date-part {
     flex: 1;
     padding: 12px;
     border: 2px solid #e2e8f0;
     border-radius: 15px;
     font-size: 0.9rem;
     background: #f8f9fa;
   }
   .date-part:focus {
     border-color: #ff416c;
     outline: none;
   }
   .btn-pink {
     background: #ff416c;
     color: white;
     padding: 15px 25px;
     border-radius: 60px;
     font-size: 1.2rem;
     font-weight: 600;
     width: 90%;
     margin: 10px auto;
     display: block;
     text-align: center;
     text-decoration: none;
     border: none;
     cursor: pointer;
     transition: all 0.3s;
     box-shadow: 0 10px 20px rgba(255,65,108,0.3);
   }
   .btn-pink:hover {
     transform: translateY(-3px);
     box-shadow: 0 15px 30px rgba(255,65,108,0.4);
   }
   .back-link {
     display: inline-block;
     margin: 15px 0;
     color: #666;
     text-decoration: none;
     font-size: 1rem;
   }
   .page-white {
     background: white;
     padding: 20px;
     flex: 1;
   }
   .app-shell {
     width: 100%;
     max-width: 420px;
     min-height: 100vh;
     background: #f4e9da;
     display: flex;
     flex-direction: column;
     box-shadow: 0 0 30px rgba(0,0,0,0.1);
     margin: 0 auto;
   }
   h2 {
     font-size: 2rem;
     margin-bottom: 20px;
     color: #1a2a44;
   }
 </style>
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   <div class="page-white">
     
     <div style="margin-bottom: 5px;">
       <span style="font-size: 12px; color: #10b981; font-weight: bold;">✔ ${t('dataFromCertificate')}</span>
     </div>
     
     ${user.qrVerified ? `
       <div class="input-label">${t('firstName')}</div>
       <input type="text" class="input-box" value="${user.firstName}" readonly>
       <div class="protected-badge">${t('protectedSource')}</div>
       
       <div class="input-label">${t('lastName')}</div>
       <input type="text" class="input-box" value="${user.lastName}" readonly>
       <div class="protected-badge">${t('protectedSource')}</div>
       
       <div class="input-label">${t('gender')}</div>
       <input type="text" class="input-box" value="${user.gender || ''}" readonly>
       <div class="protected-badge">${t('protectedSource')}</div>
       
       <div class="input-label">${t('genotype')}</div>
       <input type="text" class="input-box" value="${user.genotype || ''}" readonly>
       <div class="protected-badge">${t('protectedSource')}</div>
       
       <div class="input-label">${t('bloodGroup')}</div>
       <input type="text" class="input-box" value="${user.bloodGroup || ''}" readonly>
       <div class="protected-badge">${t('protectedSource')}</div>
     ` : `
       <div class="input-label">${t('firstName')}</div>
       <input type="text" name="firstName" class="input-box" value="${user.firstName}" required>
       
       <div class="input-label">${t('lastName')}</div>
       <input type="text" name="lastName" class="input-box" value="${user.lastName}" required>
       
       <div class="input-label">${t('gender')}</div>
       <select name="gender" class="input-box" required>
         <option value="Homme" ${user.gender === 'Homme' ? 'selected' : ''}>${t('male')}</option>
         <option value="Femme" ${user.gender === 'Femme' ? 'selected' : ''}>${t('female')}</option>
       </select>
       
       <div class="input-label">${t('genotype')}</div>
       <select name="genotype" class="input-box" required>
         <option value="AA" ${user.genotype === 'AA' ? 'selected' : ''}>AA</option>
         <option value="AS" ${user.genotype === 'AS' ? 'selected' : ''}>AS</option>
         <option value="SS" ${user.genotype === 'SS' ? 'selected' : ''}>SS</option>
       </select>
       
       <div class="input-label">${t('bloodGroup')}</div>
       <select name="bloodGroup" class="input-box" required>
         ${bloodOptions}
       </select>
     `}
     
     <div style="height: 2px; background: linear-gradient(90deg, transparent, #ff416c, transparent); margin: 25px 0 15px 0; opacity: 0.3;"></div>
     
     <div style="margin-bottom: 15px;">
       <span style="font-size: 12px; color: #ff416c; font-weight: bold;">✎ ${t('freeEntry')}</span>
     </div>
     
     <form id="editForm">
       <div class="input-label">${t('dob')}</div>
       ${datePicker}
       
       <div class="input-label">${t('city')}</div>
       <input type="text" name="residence" class="input-box" value="${user.residence || ''}" required>
       
       <div class="input-label">${t('region')}</div>
       <input type="text" name="region" class="input-box" value="${user.region || ''}" required>
       
       <div class="input-label">${t('desireChild')}</div>
       <select name="desireChild" class="input-box" required>
         <option value="Oui" ${user.desireChild === 'Oui' ? 'selected' : ''}>${t('yes')}</option>
         <option value="Non" ${user.desireChild === 'Non' ? 'selected' : ''}>${t('no')}</option>
       </select>
       
       <div class="input-label">${t('photoPlaceholder')}</div>
       <div class="photo-circle" id="photoCircle" style="background-image: url('${user.photo || ''}');" onclick="document.getElementById('photoInput').click()">
         <span id="photoText" style="${user.photo ? 'display: none;' : ''}">📷</span>
       </div>
       <input type="file" id="photoInput" accept="image/*" style="display: none;" onchange="previewPhoto(event)">
       <input type="hidden" name="photo" id="photoBase64" value="${user.photo || ''}">
       
       <button type="submit" class="btn-pink">${t('editProfile')}</button>
     </form>
     
     <a href="/profile" class="back-link">← ${t('backProfile')}</a>
   </div>
 </div>
 
 <script>
   let photoBase64 = "${user.photo || ''}";
   
   function previewPhoto(e) {
     const reader = new FileReader();
     reader.onload = function() {
       photoBase64 = reader.result;
       document.getElementById('photoCircle').style.backgroundImage = 'url(' + photoBase64 + ')';
       document.getElementById('photoCircle').style.backgroundSize = 'cover';
       document.getElementById('photoText').style.display = 'none';
       document.getElementById('photoBase64').value = photoBase64;
     };
     reader.readAsDataURL(e.target.files[0]);
   }
   
   document.getElementById('editForm').addEventListener('submit', async function(e) {
     e.preventDefault();
     
     const day = document.querySelector('select[name="day"]').value;
     const month = document.querySelector('select[name="month"]').value;
     const year = document.querySelector('select[name="year"]').value;
     
     if (!day || !month || !year) {
       alert("${t('dob')} ${t('required')}");
       return;
     }
     
     const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
     const formData = new FormData(e.target);
     
     const data = {
       residence: formData.get('residence'),
       region: formData.get('region'),
       desireChild: formData.get('desireChild'),
       dob: dob,
       photo: photoBase64
     };
     
     if (!${user.qrVerified}) {
       data.firstName = document.querySelector('input[name="firstName"]').value;
       data.lastName = document.querySelector('input[name="lastName"]').value;
       data.gender = document.querySelector('select[name="gender"]').value;
       data.genotype = document.querySelector('select[name="genotype"]').value;
       data.bloodGroup = document.querySelector('select[name="bloodGroup"]').value;
     }
     
     const res = await fetch('/api/users/profile', {
       method: 'PUT',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify(data)
     });
     
     if (res.ok) {
       showNotify('${t('successMessage')}', 'success');
       setTimeout(() => window.location.href = '/profile', 1000);
     } else {
       alert('${t('errorMessage')}');
     }
   });
 </script>
</body>
</html>`);
 } catch(error) {
   console.error(error);
   res.status(500).send('Erreur édition');
 }
});

// ============================================
// BLOCKED LIST
// ============================================
app.get('/blocked-list', requireAuth, async (req, res) => {
 try {
   const currentUser = await User.findById(req.session.userId).populate('blockedUsers');
   const t = req.t;
   
   let blockedHTML = '';
   if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
     currentUser.blockedUsers.forEach(user => {
       blockedHTML += `
         <div class="inbox-item" style="display: flex; justify-content: space-between; align-items: center;">
           <span><b style="font-size:1.2rem;">${user.firstName} ${user.lastName}</b></span>
           <button class="btn-action" onclick="unblockUser('${user._id}')" style="background:#4CAF50; color:white; padding:8px 15px;">${t('unblock')}</button>
         </div>
       `;
     });
   } else {
     blockedHTML = `<div class="empty-message"><span>🔓</span><p>${t('noBlocked')}</p></div>`;
   }
   
   res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('blockedUsers')}</title>
 ${styles}
 ${notifyScript}
</head>
<body>
 <div class="app-shell">
   <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
   <div class="page-white">
     <h2>${t('blockedUsers')}</h2>
     ${blockedHTML}
     <a href="/settings" class="back-link">← ${t('backHome')}</a>
   </div>
 </div>
 
 <script>
 async function unblockUser(id) {
   await fetch('/api/unblock/' + id, { method: 'POST' });
   showNotify('${t('unblock')}', 'success');
   setTimeout(() => location.reload(), 1000);
 }
 </script>
</body>
</html>`);
 } catch(error) {
   console.error(error);
   res.status(500).send('Erreur');
 }
});

// ============================================
// LOGOUT SUCCESS
// ============================================
app.get('/logout-success', (req, res) => {
 const t = req.t;
 req.session.destroy();
 res.send(`<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
 <title>${t('appName')} - ${t('logoutSuccess')}</title>
 ${styles}
 <style>
   .end-overlay {
     display: flex;
     justify-content: center;
     align-items: center;
     min-height: 100vh;
     background: linear-gradient(135deg, #1a2a44, #ff416c);
   }
   .end-card {
     background: white;
     border-radius: 30px;
     padding: 40px 30px;
     text-align: center;
     max-width: 380px;
     box-shadow: 0 20px 40px rgba(0,0,0,0.2);
   }
 </style>
</head>
<body class="end-overlay">
 <div class="end-card">
   <h2 style="font-size:2.2rem; color: #1a2a44;">👋 ${t('logoutSuccess')}</h2>
   <p style="font-size:1.3rem; margin:25px 0; color: #666;">${t('seeYouSoon')}</p>
   <a href="/" class="btn-pink" style="text-decoration: none;">${t('home')}</a>
 </div>
</body>
</html>`);
});

// ============================================
// API ROUTES
// ============================================

app.post('/api/login', async (req, res) => {
 try {
   const user = await User.findOne({ firstName: req.body.firstName }).sort({ createdAt: -1 });
   if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
   
   req.session.userId = user._id;
   req.session.isVerified = user.isVerified;
   await new Promise(resolve => req.session.save(resolve));
   
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/register', async (req, res) => {
 try {
   const user = new User(req.body);
   await user.save();
   
   req.session.userId = user._id;
   req.session.isVerified = false;
   await new Promise(resolve => req.session.save(resolve));
   
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/requests', requireAuth, async (req, res) => {
 try {
   const { receiverId } = req.body;
   
   const existingRequest = await Request.findOne({
     senderId: req.session.userId,
     receiverId,
     status: 'pending'
   });
   
   if (existingRequest) {
     return res.status(400).json({ error: "Demande déjà envoyée" });
   }
   
   const request = new Request({
     senderId: req.session.userId,
     receiverId,
     status: 'pending'
   });
   
   await request.save();
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.get('/api/requests/pending', requireAuth, async (req, res) => {
 try {
   const requests = await Request.find({
     receiverId: req.session.userId,
     status: 'pending',
     viewed: false
   }).populate('senderId', 'firstName');
   
   res.json(requests);
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/requests/:id/accept', requireAuth, async (req, res) => {
 try {
   const request = await Request.findById(req.params.id);
   if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
   
   request.status = 'accepted';
   request.viewed = true;
   await request.save();
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/requests/:id/reject', requireAuth, async (req, res) => {
 try {
   const request = await Request.findById(req.params.id);
   if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
   
   request.status = 'rejected';
   request.viewed = true;
   await request.save();
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/messages', requireAuth, async (req, res) => {
 try {
   const msg = new Message({
     senderId: req.session.userId,
     receiverId: req.body.receiverId,
     text: req.body.text,
     read: false
   });
   await msg.save();
   res.json(msg);
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/block/:userId', requireAuth, async (req, res) => {
 try {
   const current = await User.findById(req.session.userId);
   const target = await User.findById(req.params.userId);
   if (!current || !target) return res.status(404).json({ error: 'Utilisateur non trouvé' });
   
   if (!current.blockedUsers) current.blockedUsers = [];
   if (!current.blockedUsers.includes(req.params.userId)) {
     current.blockedUsers.push(req.params.userId);
   }
   
   if (!target.blockedBy) target.blockedBy = [];
   if (!target.blockedBy.includes(req.session.userId)) {
     target.blockedBy.push(req.session.userId);
   }
   
   await Message.updateMany(
     { $or: [
       { senderId: req.session.userId, receiverId: req.params.userId },
       { senderId: req.params.userId, receiverId: req.session.userId }
     ]},
     { isBlocked: true }
   );
   
   await current.save();
   await target.save();
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.post('/api/unblock/:userId', requireAuth, async (req, res) => {
 try {
   const current = await User.findById(req.session.userId);
   if (current.blockedUsers) {
     current.blockedUsers = current.blockedUsers.filter(id => id.toString() !== req.params.userId);
     await current.save();
   }
   
   await Message.updateMany(
     { $or: [
       { senderId: req.session.userId, receiverId: req.params.userId },
       { senderId: req.params.userId, receiverId: req.session.userId }
     ]},
     { isBlocked: false }
   );
   
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.put('/api/users/profile', requireAuth, async (req, res) => {
 try {
   await User.findByIdAndUpdate(req.session.userId, req.body);
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.put('/api/visibility', requireAuth, async (req, res) => {
 try {
   await User.findByIdAndUpdate(req.session.userId, { isPublic: req.body.isPublic });
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

app.delete('/api/delete-account', requireAuth, async (req, res) => {
 try {
   const id = req.session.userId;
   await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
   await Request.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
   await User.findByIdAndDelete(id);
   req.session.destroy();
   res.json({ success: true });
 } catch(e) {
   res.status(500).json({ error: e.message });
 }
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
 console.log(`✅ Genlove démarre sur http://localhost:${port}`);
 console.log('📌 Routes disponibles:');
 console.log('   - Accueil: /');
 console.log('   - Charte: /charte-engagement');
 console.log('   - Choix inscription: /signup-choice');
 console.log('   - Inscription QR: /signup-qr');
 console.log('   - Inscription manuelle: /signup-manual');
 console.log('   - Login: /login');
 console.log('   - Profil: /profile');
 console.log('   - Matching: /matching');
 console.log('   - Messages: /inbox');
 console.log('   - Chat: /chat');
 console.log('   - Paramètres: /settings');
 console.log('   - Édition profil: /edit-profile');
 console.log('   - Liste bloqués: /blocked-list');
});

process.on('SIGINT', () => {
 mongoose.connection.close(() => {
   console.log('🔌 Déconnexion MongoDB');
   process.exit(0);
 });
});