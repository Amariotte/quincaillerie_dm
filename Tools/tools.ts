import { Linking } from "react-native";

export const formatAmount = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;


const openNormalizedInvoice = async (URL : string) => {
    if (URL.trim().length === 0) {
      return;
    }

    await Linking.openURL(URL);
  };


  
 export const isFakeModeEnabled = (): boolean => {
    return process.env.EXPO_PUBLIC_MODE_FAKE_DATA === 'true';
  }

