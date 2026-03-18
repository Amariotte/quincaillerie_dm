# Guide de Test - Interface d'Authentification

## 🧪 Comment Tester

### 1. Lancer l'application

```bash
cd /d/test/mobile/MonProjetMobile
npm start
```

Puis choisir:
- `i` pour iOS
- `a` pour Android
- `w` pour Web

### 2. Scénarios de Test

#### Scénario A: Connexion Réussie ✅

1. Accédez à la page de **Connexion**
2. Entrez:
   - Email: `test@example.com`
   - Mot de passe: `password123`
3. Cliquez sur **Se connecter**
4. ✅ Les écrans des onglets doivent s'afficher automatiquement

#### Scénario B: Inscription Réussie ✅

1. Sur la page de **Connexion**, cliquez sur **S'inscrire**
2. Entrez:
   - Nom: `Jean Dupont`
   - Email: `jean@example.com`
   - Mot de passe: `securepass123`
   - Confirmation: `securepass123`
3. Vérifiez que les critères s'affichent en vert:
   - ✅ Au moins 6 caractères
   - ✅ Les mots de passe correspondent
4. Cliquez sur **S'inscrire**
5. ✅ Vous devez être connecté automatiquement

#### Scénario C: Validation des Erreurs ❌

**Tester sur la page de Connexion:**

1. **Email vide** + Cliquer
   - ❌ Bouton désactivé avant l'envoi

2. **Email invalide** (ex: `test.com` sans @):
   - ❌ Message: "Veuillez entrer un email valide"

3. **Mot de passe vide**:
   - ❌ Bouton désactivé

**Tester sur la page d'Inscription:**

1. **Nom vide**:
   - ❌ Message d'erreur avant envoi

2. **Mot de passe < 6 caractères** (ex: `test`):
   - ❌ Critère rouge
   - ❌ Message: "doit contenir au moins 6 caractères"

3. **Confirmer ≠ Mot de passe**:
   - ❌ Critère rouge
   - ❌ Message: "Les mots de passe ne correspondent pas"

#### Scénario D: États de Chargement ⏳

1. Sur la page de **Connexion** ou **Inscription**
2. Entrez des données valides et cliquez sur le bouton
3. ✅ Vérifiez que:
   - Le bouton montre un spinner de chargement
   - Le label change (ex: "Connexion...")
   - Les inputs sont désactivés pendant 1.5s
   - Après 1.5s, nouvelles données affichées

#### Scénario E: Navigation entre les pages

1. Page de **Connexion** → Cliquez **"S'inscrire"**
   - ✅ Vous devez voir la page d'**Inscription**

2. Page d'**Inscription** → Cliquez **"Se connecter"**
   - ✅ Vous devez revenir à la page de **Connexion**

#### Scénario F: Page de Profil et Déconnexion

1. Après connexion réussie:
   - ✅ Les onglets s'affichent (Accueil, Explorer, **Profil**)

2. Cliquez sur l'onglet **Profil**:
   - ✅ Vous voyez votre nom et email
   - ✅ Une card avec votre avatar
   - ✅ Paramètres du compte et de l'app
   - ✅ Bouton "Se déconnecter"

3. Cliquez sur **"Se déconnecter"**:
   - ✅ Une popup de confirmation s'affiche
   - ✅ Cliquez "Déconnexion"
   - ✅ Vous êtes redirigé automatiquement vers la page de **Connexion**

---

## 🎮 Tests Interactifs

### Test des Icônes Masquer/Afficher

Sur la page de **Connexion**:

1. Entrez un mot de passe
2. Cliquez sur **"Afficher"** (à côté du mot de passe)
   - ✅ Le mot de passe devient visible
   - ✅ Le bouton change en **"Masquer"**
3. Cliquez sur **"Masquer"**
   - ✅ Le mot de passe est à nouveau masqué

---

## 🌓 Test du Thème Clair/Sombre

### Sur iOS/Android:
1. Allez dans les paramètres du téléphone
2. Activez **Dark Mode**
3. Revenez à l'app
4. ✅ Les couleurs doivent s'adapter (texte blanc sur fond sombre)

### Sur Web:
1. Ouvrez les DevTools (F12)
2. Allez à **Console** ou **Preferences**
3. Cherchez l'option de thème
4. ✅ L'interface doit changer de couleur

---

## 🔍 Tests dans DevTools

### Voir les logs de débogage

Ouvrez la console avec:
- **iOS**: Secouer pour ouvrir le menu
- **Android**: Double appui sur R
- **Web**: F12 → Console

Vous devriez voir dans les logs:
```
[Auth] signIn called with email: test@example.com
[Navigation] Redirecting to home screen
[User] User data stored: { id: '1', email: 'test@example.com', name: 'test' }
```

### Inspecter les composants

Via React DevTools (si installé):
- Cherchez `AuthInput` et `AuthButton`
- Vérifiez les props et states

---

## 📊 Checklist de Test Complet

| Test | iOS | Android | Web | ✅ |
|------|-----|---------|-----|-----|
| Page de Connexion affichée | [ ] | [ ] | [ ] | [ ] |
| Connexion réussie | [ ] | [ ] | [ ] | [ ] |
| Validation email | [ ] | [ ] | [ ] | [ ] |
| Page d'Inscription | [ ] | [ ] | [ ] | [ ] |
| Inscription réussie | [ ] | [ ] | [ ] | [ ] |
| Validation mot de passe | [ ] | [ ] | [ ] | [ ] |
| Navigation connexion ↔ inscription | [ ] | [ ] | [ ] | [ ] |
| Page de Profil | [ ] | [ ] | [ ] | [ ] |
| Déconnexion | [ ] | [ ] | [ ] | [ ] |
| Redirection login après déconnexion | [ ] | [ ] | [ ] | [ ] |
| Dark mode | [ ] | [ ] | [ ] | [ ] |
| États de chargement | [ ] | [ ] | [ ] | [ ] |
| Afficher/Masquer mot de passe | [ ] | [ ] | [ ] | [ ] |

---

## 🐛 Dépannage

### L'app ne démarre pas
```bash
# Effacer le cache
npm run reset-project

# Relancer
npm start
```

### Les erreurs TypeScript ne disparaissent pas
```bash
# Relancer le linter
npm run lint

# Vérifier les dépendances
npm install
```

### La page de connexion n'affiche pas l'icône
1. Vérifiez que `@expo/vector-icons` est installé
2. Relancez le serveur Expo

### Les couleurs du thème ne s'appliquent pas
1. Vérifiez `constants/theme.ts`
2. Vérifiez que `useThemeColor` est importé correctement

---

## 💡 Astuces de Test

1. **Tester rapidement**: Utilisez le compte test
   - Email: `test@example.com`
   - Mot de passe: `password123`

2. **Tester les erreurs**: Créer des inputs invalides
   - Email: `invalid`
   - Mot de passe: `123`

3. **Tester la navigation**: Naviguer rapidement entre les pages

4. **Tester la performance**: Observer les états de chargement

5. **Tester l'accessibilité**:
   - Utilisez un lecteur d'écran (Android/iOS)
   - Vérifiez les labels des inputs

---

## 📱 Options de Test

### Option 1: Expo Go (Rapide)
```bash
npm start
# Scanner le QR code avec Expo Go
```

### Option 2: iOS Simulator
```bash
npm start
# Appuyer sur 'i'
```

### Option 3: Android Emulator
```bash
npm start
# Appuyer sur 'a'
```

### Option 4: Web Browser
```bash
npm start
# Appuyer sur 'w'
```

---

## ✅ Prochaines Étapes après les Tests

1. ✅ Intégrer un vrai backend
2. ✅ Ajouter AsyncStorage pour la persistance
3. ✅ Implémenter le refresh token
4. ✅ Ajouter la vérification d'email
5. ✅ Tester sur les vrais devices

---

**Bon test! 🚀**
