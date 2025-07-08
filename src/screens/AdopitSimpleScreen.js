import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';

const AdopitSimpleScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando mascotas...');
      
      if (!user?.id) {
        console.error('❌ No hay usuario autenticado');
        setLoading(false);
        return;
      }
      
      const adoptionPets = await petService.getPetsForAdopit(user.id);
      console.log('✅ Mascotas cargadas:', adoptionPets.length);
      setPets(adoptionPets || []);
    } catch (error) {
      console.error('❌ Error cargando mascotas:', error);
      Alert.alert('Error', 'Error cargando mascotas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (currentIndex >= pets.length) return;
    
    const pet = pets[currentIndex];
    try {
      await petService.recordSwipe(user.id, pet.id, 'like');
      await petService.addToFavorites(user.id, pet.id);
      Alert.alert('❤️ Te gusta!', `${pet.name} agregado a favoritos`);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error en like:', error);
      Alert.alert('Error', 'No se pudo procesar el like');
    }
  };

  const handlePass = async () => {
    if (currentIndex >= pets.length) return;
    
    const pet = pets[currentIndex];
    try {
      await petService.recordSwipe(user.id, pet.id, 'pass');
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error en pass:', error);
      Alert.alert('Error', 'No se pudo procesar el pass');
    }
  };

  const resetPets = () => {
    setCurrentIndex(0);
    loadPets();
  };

  const currentPet = pets[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Adopit 🐾</Text>
        <TouchableOpacity onPress={resetPets}>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Debug Info */}
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>🔍 Debug Info:</Text>
          <Text style={styles.debugText}>Loading: {loading ? 'true' : 'false'}</Text>
          <Text style={styles.debugText}>Total pets: {pets.length}</Text>
          <Text style={styles.debugText}>Current index: {currentIndex}</Text>
          <Text style={styles.debugText}>User ID: {user?.id || 'null'}</Text>
          <Text style={styles.debugText}>Current pet: {currentPet ? currentPet.name : 'null'}</Text>
        </View>

        {loading ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>🔄 Cargando...</Text>
            <Text style={styles.messageText}>Buscando mascotas disponibles</Text>
          </View>
        ) : pets.length === 0 ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>🐾 No hay mascotas</Text>
            <Text style={styles.messageText}>No se encontraron mascotas disponibles</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPets}>
              <Text style={styles.retryButtonText}>🔄 Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        ) : currentIndex >= pets.length ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>🎉 ¡Completado!</Text>
            <Text style={styles.messageText}>Has visto todas las {pets.length} mascotas</Text>
            <TouchableOpacity style={styles.retryButton} onPress={resetPets}>
              <Text style={styles.retryButtonText}>🔄 Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        ) : currentPet ? (
          <View style={styles.petContainer}>
            <Text style={styles.successTitle}>✅ Mascota {currentIndex + 1} de {pets.length}</Text>
            
            <View style={styles.petCard}>
              <Image 
                source={{ uri: currentPet.image || 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=🐾' }}
                style={styles.petImage}
                resizeMode="cover"
              />
              
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{currentPet.name}</Text>
                <Text style={styles.petBreed}>{currentPet.breed}</Text>
                <Text style={styles.petAge}>{currentPet.age}</Text>
                <Text style={styles.petLocation}>{currentPet.location}</Text>
                <Text style={styles.petDescription}>{currentPet.description}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.passButton} onPress={handlePass}>
                <Text style={styles.buttonText}>💔 Pasar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
                <Text style={styles.buttonText}>❤️ Me gusta</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>⚠️ Error</Text>
            <Text style={styles.messageText}>No se puede mostrar la mascota</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#4ECDC4',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  debugBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 3,
  },
  messageBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  petContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 20,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 20,
  },
  petImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  petInfo: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 18,
    color: '#4ECDC4',
    marginBottom: 5,
  },
  petAge: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  petLocation: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  petDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  passButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  likeButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdopitSimpleScreen;
