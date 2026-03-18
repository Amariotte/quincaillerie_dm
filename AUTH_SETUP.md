# Interface de Connexion Mobile - Documentation

Ce projet implémente un système d'authentification complet pour une application mobile React Native avec Expo.

## 📁 Structure du Projet

### Dossiers créés/modifiés:

```
app/
├── (auth)/                 # Groupe de routes d'authentification
│   ├── _layout.tsx        # Layout pour les écrans d'auth
│   ├── index.tsx          # Redirection vers login
│   ├── login.tsx          # Page de connexion
│   └── register.tsx       # Page d'inscription
├── (tabs)/
│   ├── _layout.tsx        # Mis à jour avec l'onglet profil
│   ├── index.tsx
│   ├── explore.tsx
│   └── profile.tsx        # Nouveau - Profil utilisateur
└── _layout.tsx            # Mis à jour avec logique d'authentification

components/
├── auth-input.tsx         # Composant input personnalisé
├── auth-button.tsx        # Composant bouton personnalisé
└── ... (autres composants existants)

hooks/
├── use-auth.ts            # Hook pour la logique d'authentification
├── auth-context.tsx       # Contexte React pour l'authentification
└── ... (autres hooks existants)
```

## 🔐 Système d'Authentification

### Architecture

Le système d'authentification utilise:
- **React Context API** pour la gestion de l'état global
- **Expo Router** pour le routage conditionnel
- **Custom Hooks** pour la logique réutilisable

### Flux d'authentification

#### 1. **Connexion (Login)**
```
Utilisateur non connecté → Page de connexion
                        ↓
                    Saisie des identifiants
                        ↓
                    Validation + Appel API
                        ↓
                    Succès → Stockage du token
                        ↓
                    Redirection automatique vers (tabs)
```

#### 2. **Inscription (Register)**
```
Nouvel utilisateur → Page d'inscription
                  ↓
              Saisie du formulaire
                  ↓
              Validation locale
                  ↓
              Validation côté serveur
                  ↓
              Succès → Connexion automatique
                  ↓
              Redirection vers (tabs)
```

### Composants principaux

#### `AuthInput`
Input personnalisé pour les formulaires d'authentification:
- Support des icônes
- Gestion des erreurs
- Responsive design
- Support du thème clair/sombre

**Props:**
```typescript
interface AuthInputProps extends TextInputProps {
  label?: string;        // Label du champ
  error?: string;        // Message d'erreur
  icon?: React.ReactNode; // Icône avant le champ
}
```

#### `AuthButton`
Bouton personnalisé:
- States de chargement
- Variantes (primary/secondary)
- Gestion du disabled state
- Feedback haptic

**Props:**
```typescript
interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

#### `useAuth` Hook
Gère la logique d'authentification:

```typescript
const { 
  userToken,           // Token d'authentification
  user,               // Objet utilisateur
  isLoading,          // État de chargement
  error,              // Message d'erreur
  signIn,             // Fonction de connexion
  signUp,             // Fonction d'inscription
  signOut             // Fonction de déconnexion
} = useAuth();
```

#### `AuthProvider` + `useAuthContext`
Contexte pour partager l'état d'authentification:

```typescript
// Dans RootLayout
<AuthProvider>
  <RootLayoutNav />
</AuthProvider>

// Dans les composants
const auth = useAuthContext();
```

## 🎨 Pages d'Authentification

### Pages Login (`/(auth)/login`)
- ✅ Champs email et mot de passe
- ✅ Option affichage/masquage du mot de passe
- ✅ Lien "Mot de passe oublié"
- ✅ Lien vers inscription
- ✅ Gestion des erreurs
- ✅ États de chargement

### Page Register (`/(auth)/register`)
- ✅ Champs nom, email, password, confirmation
- ✅ Validation en temps réel
- ✅ Affichage des critères de mot de passe
- ✅ Lien vers connexion
- ✅ Gestion détaillée des erreurs

### Page Profil (`/(tabs)/profile`)
- ✅ Affichage des informations utilisateur
- ✅ Card avec avatar
- ✅ Paramètres du compte
- ✅ Paramètres de l'application
- ✅ Bouton de déconnexion

## 🔄 Routage Conditionnel

Le logic de routage est géré dans `app/_layout.tsx`:

```typescript
if (userToken == null) {
  // Affiche les écrans d'authentification
  <Stack.Screen name="(auth)" />
} else {
  // Affiche les onglets et l'app principale
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="modal" />
}
```

## 🧪 États de Test

### Simulation de connexion réussie:
```
Email: test@example.com
Mot de passe: password123
```

Le système simule:
- Un délai réseau de 1.5 secondes
- Création automatique d'un token
- Stockage de l'utilisateur en mémoire

### Validation

#### Connexion
- ✅ Email requis
- ✅ Format email valide
- ✅ Mot de passe requis

#### Inscription
- ✅ Tous les champs requis
- ✅ Email valide
- ✅ Mot de passe minimum 6 caractères
- ✅ Confirmation du mot de passe correspond

## 📱 Thème et Personnalisation

### Utilisation des couleurs du thème

Les composants utilisent le hook `useThemeColor` pour:
- Supporter les modes clair/sombre automatiquement
- Utiliser les couleurs de la configuration du thème
- Maintenir la cohérence visuelle

```typescript
const backgroundColor = useThemeColor({}, 'background');
const textColor = useThemeColor({}, 'text');
const tintColor = useThemeColor({}, 'tint');
```

## 🚀 Prochaines Étapes

Pour intégrer un vrai backend:

### 1. Remplacer la simulation API dans `use-auth.ts`
```typescript
const response = await fetch('https://api.example.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 2. Ajouter la persistance du token
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('userToken', token);
```

### 3. Ajouter la vérification du token au démarrage
```typescript
const restoreToken = async () => {
  const token = await AsyncStorage.getItem('userToken');
  // Vérifier la validité du token
};
```

### 4. Ajouter le refresh token
```typescript
const refreshToken = async () => {
  const response = await fetch('https://api.example.com/auth/refresh', {
    method: 'POST'
  });
  // Mettre à jour le token
};
```

## 📦 Dépendances utilisées

- `expo-router` - Routage
- `@react-navigation/native` - Navigation
- `@expo/vector-icons` - Icônes
- `react-native` - Framework mobile
- React 19

## 🎯 Fonctionnalités implémentées

- [x] Page de connexion complète
- [x] Page d'inscription avec validation
- [x] Système d'authentification avec contexte
- [x] Routage conditionnel basé sur l'authentification
- [x] Page de profil utilisateur
- [x] Bouton de déconnexion
- [x] Support du thème clair/sombre
- [x] Gestion complète des erreurs
- [x] États de chargement
- [x] Composants réutilisables

## 🔒 Sécurité

Pour la production:

1. ✅ Utiliser HTTPS pour toutes les API
2. ✅ Implémenter la validation côté serveur
3. ✅ Utiliser AsyncStorage + Secure Storage pour les tokens
4. ✅ Implémenter le refresh token
5. ✅ Ajouter la vérification du token expiré
6. ✅ Implémenter le CSRF protection
7. ✅ Valider les emails (envoi de confirmation)

## 📝 Ressources utiles

- [Expo Router Documentation](https://expo.dev/docs/router)
- [React Navigation](https://reactnavigation.org/)
- [React Context API](https://react.dev/reference/react/useContext)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
