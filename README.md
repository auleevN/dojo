# Dojo Connect - Guide d'Utilisation

Bienvenue dans votre nouveau site de club d'arts martiaux ! Ce projet a été conçu pour être simple, sécurisé et facile à maintenir.

## 🚀 Comment lancer le projet

Le projet est déjà configuré. Si vous travaillez localement :
1. Installez les dépendances : `npm install`
2. Lancez le serveur de développement : `npm run dev`

## 🔐 Comment créer le premier compte Administrateur

Par sécurité, les nouveaux comptes sont créés avec le rôle "membre" par défaut. Pour devenir Administrateur :
1. Créez un compte normalement sur la page **S'inscrire** avec votre email : `olivier.mobilebox@gmail.com`.
2. Le système reconnaît automatiquement cet email comme administrateur (configuré dans les règles de sécurité Firebase).
3. Une fois connecté, vous verrez un lien **Admin** dans la barre de navigation.

## 📹 Comment ajouter une vidéo

1. Connectez-vous avec votre compte Administrateur.
2. Allez dans l'onglet **Admin**.
3. Cliquez sur **Ajouter une vidéo**.
4. Remplissez le formulaire :
   - **Titre** : Le nom de la technique.
   - **Catégorie** : Choisissez parmi les catégories prédéfinies (Débutants, Kata, etc.).
   - **URL** : Copiez le lien de votre vidéo (YouTube ou Vimeo).
   - **Description** : Ajoutez des détails sur la technique.
5. Cliquez sur **Enregistrer**. La vidéo apparaîtra immédiatement pour tous les membres.

## 🌍 Solution d'hébergement vidéo recommandée

Pour un débutant, je recommande **YouTube** ou **Vimeo** :

### Option A : YouTube (Gratuit et Simple)
1. Téléchargez votre vidéo sur YouTube.
2. Réglez la visibilité sur **"Non répertoriée"** (Unlisted). De cette façon, la vidéo n'apparaît pas dans les recherches publiques, mais elle est visible sur votre site.
3. Copiez le lien (ex: `https://www.youtube.com/watch?v=...`) et collez-le dans l'interface Admin de Dojo Connect.

### Option B : Vimeo (Plus de contrôle)
Vimeo offre de meilleures options de confidentialité (interdire la lecture en dehors de votre domaine), mais nécessite souvent un abonnement payant pour ces fonctions avancées.

## 👥 Comment ajouter un nouveau membre

1. Demandez au licencié de se rendre sur le site et de cliquer sur **S'inscrire**.
2. Il crée son compte avec son email et son mot de passe.
3. Il a immédiatement accès à la zone membre.
4. Si vous souhaitez qu'il devienne aussi administrateur, vous pouvez changer son rôle dans l'onglet **Membres** de la zone **Admin**.

## 🛠️ Modification du code (pour les curieux)

- **Textes et Couleurs** : La plupart des styles utilisent Tailwind CSS. Cherchez les classes comme `text-red-600` ou `bg-zinc-900` dans les fichiers `.tsx`.
- **Catégories** : Pour modifier les catégories de vidéos, éditez le fichier `src/types.ts`.
- **Base de données** : Les données sont stockées dans Google Firebase (Firestore).

---
*Développé avec passion pour votre Dojo.*
