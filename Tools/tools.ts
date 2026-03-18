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


 export const toComparableDate = (value: string) => {
    const parts = value.split('/');
    if (parts.length !== 3) {
      return null;
    }
  
    const [day, month, year] = parts;
    if (!day || !month || !year || day.length < 1 || month.length < 1 || year.length !== 4) {
      return null;
    }
  
    return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
  };
