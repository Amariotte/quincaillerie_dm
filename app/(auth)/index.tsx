import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';

export default function AuthIndex() {
  const router = useRouter();
  const brandLogo = require('../../assets/images/logo.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.welcomeContainer}>
        <View style={styles.centeredLogoWrapper}>
          <View style={styles.logoContainer}>
            <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandName}>{process.env.EXPO_PUBLIC_APP_NAME}</Text>
            <Text style={styles.welcomeSubtitle}>Gestion et Suivi Professionnel</Text>
            <Text style={styles.welcomeDescription}>Accédez à votre tableau de bord pour gérer vos activités, ventes et commissions en temps réel.</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.welcomeButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.welcomeButtonText}>Se connecter →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
