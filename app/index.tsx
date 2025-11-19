import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';

import * as Device from 'expo-device';
import * as Location from 'expo-location';

// Interface de tipagem para o endereço (mantendo a correção de 'null')
interface Address {
  street?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

export default function App() {
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Função central: Converte Latitude/Longitude em Endereço (Geocoding Reverso)
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      // 1. Chama a função de Geocoding Reverso do Expo
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode.length > 0) {
        const firstResult = geocode[0];
        
        // Formata e retorna o objeto Address
        return {
          street: firstResult.street,
          city: firstResult.city,
          region: firstResult.region,
          country: firstResult.country,
          postalCode: firstResult.postalCode,
        } as Address;
      }
      return null; // Retorna null se não encontrar endereço
    } catch (error) {
      console.error("Erro no Geocoding Reverso:", error);
      return null;
    }
  };


  useEffect(() => {
    async function getCurrentLocationAndAddress() {
      // 1. Verificação de ambiente
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg('Oops, não vai funcionar no Snack em um emulador Android. Tente no seu dispositivo!');
        return;
      }

      // 2. Solicita Permissão
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de acesso à localização foi negada');
        return;
      }
      
      // 3. Obtém a Posição Atual
      let location = await Location.getCurrentPositionAsync({});
      
      // 4. Converte a Posição Atual em Endereço
      const address = await getAddressFromCoords(
        location.coords.latitude, 
        location.coords.longitude
      );

      // 5. Atualiza o estado
      setCurrentAddress(address);
    }

    getCurrentLocationAndAddress();
  }, []);

  // Renderiza a view de endereço
  const renderCurrentAddress = () => {
    if (errorMsg) {
        return <Text style={styles.errorText}>{errorMsg}</Text>;
    }
    
    if (!currentAddress) {
      // Mensagem mostrada enquanto o endereço está sendo buscado
      return <Text style={styles.title}>Buscando sua localização...</Text>;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.title}>Seu Endereço Atual Convertido</Text>
        <Text style={styles.detail}>Rua: {currentAddress.street ?? 'N/A'}</Text>
        <Text style={styles.detail}>Cidade: {currentAddress.city ?? 'N/A'}</Text>
        <Text style={styles.detail}>Estado/Região: {currentAddress.region ?? 'N/A'}</Text>
        <Text style={styles.detail}>País: {currentAddress.country ?? 'N/A'}</Text>
        <Text style={styles.detail}>CEP: {currentAddress.postalCode ?? 'N/A'}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>📍 Geocoding Reverso</Text>
        
        {renderCurrentAddress()}
      
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#e6f7ff', // Cor clara para destacar
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});