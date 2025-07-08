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
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';

const { width: screenWidth } = Dimensions.get('window');

const AdopitSimpleScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllPets, setShowAllPets] = useState(false); // Modo demostración
  
  // Variables para swipe
  const [pan] = useState(new Animated.ValueXY());
  const [rotation] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));

  // PanResponder para swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: (evt, gestureState) => {
      // Limitar el movimiento vertical
      const limitedY = Math.max(-50, Math.min(50, gestureState.dy));
      pan.setValue({ x: gestureState.dx, y: limitedY });
      
      // Rotación basada en la posición horizontal
      const rotationValue = gestureState.dx / screenWidth * 0.5;
      rotation.setValue(rotationValue);
      
      // Cambiar opacidad al deslizar
      const newOpacity = Math.max(0.5, 1 - Math.abs(gestureState.dx) / screenWidth);
      opacity.setValue(newOpacity);
    },
    onPanResponderRelease: (evt, gestureState) => {
      pan.flattenOffset();
      
      const swipeThreshold = screenWidth * 0.25; // Umbral más bajo para más sensibilidad
      const velocityThreshold = 0.7;
      
      if (gestureState.dx > swipeThreshold || gestureState.vx > velocityThreshold) {
        // Swipe right - Like
        swipeRight();
      } else if (gestureState.dx < -swipeThreshold || gestureState.vx < -velocityThreshold) {
        // Swipe left - Pass
        swipeLeft();
      } else {
        // Volver a la posición original con animación suave
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(rotation, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      }
    },
  });

  useEffect(() => {
    loadPets();
  }, [showAllPets]); // Recargar cuando cambie el modo

  const loadPets = async () => {
    try {
      setLoading(true);
      console.log('🔄 AdopitSimpleScreen: Cargando mascotas...');
      console.log('👤 Usuario ID:', user?.id);
      console.log('📧 Usuario email:', user?.email);
      console.log('🎯 Modo ver todas las mascotas:', showAllPets);
      
      if (!user?.id) {
        console.error('❌ No hay usuario autenticado');
        Alert.alert('Error', 'No hay usuario autenticado');
        setLoading(false);
        return;
      }
      
      let adoptionPets;
      
      if (showAllPets) {
        // Modo demostración: mostrar TODAS las mascotas disponibles (incluyendo las propias)
        console.log('🔄 Llamando a petService.getAvailablePets (todas)...');
        adoptionPets = await petService.getAvailablePets();
        console.log('🎯 Modo demostración: mostrando todas las mascotas');
      } else {
        // Modo normal: solo mascotas de otros usuarios
        console.log('🔄 Llamando a petService.getPetsForAdopit (solo otros usuarios)...');
        adoptionPets = await petService.getPetsForAdopit(user.id);
        console.log('🎯 Modo normal: solo mascotas de otros usuarios');
      }
      
      console.log('🐕 Mascotas para adopción obtenidas:', adoptionPets);
      console.log('📊 Número de mascotas disponibles:', adoptionPets?.length || 0);
      
      if (adoptionPets && adoptionPets.length > 0) {
        console.log('🏷️ IDs de mascotas:', adoptionPets.map(p => `${p.id}(${p.name}) - Owner: ${p.ownerId}`).join(', '));
      }
      
      setPets(adoptionPets || []);
      setCurrentIndex(0); // Resetear índice cuando se cargan nuevas mascotas
      console.log('✅ Mascotas establecidas en estado');
    } catch (error) {
      console.error('❌ Error cargando mascotas en AdopitSimpleScreen:', error);
      console.error('❌ Stack:', error.stack);
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

  // Funciones de swipe
  const swipeRight = () => {
    console.log('👍 Swipe right - Like');
    Animated.timing(pan, {
      toValue: { x: screenWidth + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handleLike();
      resetCardPosition();
    });
  };

  const swipeLeft = () => {
    console.log('👎 Swipe left - Pass');
    Animated.timing(pan, {
      toValue: { x: -screenWidth - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      handlePass();
      resetCardPosition();
    });
  };

  const resetCardPosition = () => {
    pan.setValue({ x: 0, y: 0 });
    rotation.setValue(0);
    opacity.setValue(1);
  };

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

      {/* Toggle para mostrar todas las mascotas */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {showAllPets ? 'Viendo: Todas las mascotas' : 'Viendo: Solo de otros usuarios'}
        </Text>
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => setShowAllPets(!showAllPets)}
        >
          <Text style={styles.toggleButtonText}>
            {showAllPets ? '👥 Ver solo otros' : '🌍 Ver todas'}
          </Text>
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
            
            {/* Card con swipe */}
            <Animated.View
              style={[
                styles.swipeCard,
                {
                  transform: [
                    { translateX: pan.x },
                    { translateY: pan.y },
                    { rotate: rotation.interpolate({
                        inputRange: [-0.5, 0, 0.5],
                        outputRange: ['-15deg', '0deg', '15deg'],
                      })
                    }
                  ],
                  opacity: opacity,
                }
              ]}
              {...panResponder.panHandlers}
            >
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
                  
                  {/* Información del propietario */}
                  <View style={styles.ownerInfo}>
                    <Text style={styles.ownerLabel}>
                      {currentPet.ownerId === user.id ? '🏠 Tu mascota' : '👤 Propietario: ' + (currentPet.ownerEmail || 'Usuario')}
                    </Text>
                  </View>
                  
                  <Text style={styles.petDescription}>{currentPet.description}</Text>
                </View>
              </View>
              
              {/* Indicadores de swipe mejorados */}
              <Animated.View 
                style={[
                  styles.swipeIndicator, 
                  styles.likeIndicator,
                  {
                    opacity: pan.x.interpolate({
                      inputRange: [0, screenWidth * 0.2],
                      outputRange: [0, 1],
                      extrapolate: 'clamp',
                    }),
                    transform: [{
                      scale: pan.x.interpolate({
                        inputRange: [0, screenWidth * 0.3],
                        outputRange: [0.8, 1.2],
                        extrapolate: 'clamp',
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.indicatorText}>❤️ LIKE</Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.swipeIndicator, 
                  styles.passIndicator,
                  {
                    opacity: pan.x.interpolate({
                      inputRange: [-screenWidth * 0.2, 0],
                      outputRange: [1, 0],
                      extrapolate: 'clamp',
                    }),
                    transform: [{
                      scale: pan.x.interpolate({
                        inputRange: [-screenWidth * 0.3, 0],
                        outputRange: [1.2, 0.8],
                        extrapolate: 'clamp',
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.indicatorText}>💔 PASS</Text>
              </Animated.View>
            </Animated.View>

            {/* Instrucciones de swipe mejoradas */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>
                📱 Cómo usar Adopit
              </Text>
              <Text style={styles.instructionsText}>
                👆 Desliza la tarjeta hacia la derecha para ❤️ LIKE
              </Text>
              <Text style={styles.instructionsText}>
                👆 Desliza la tarjeta hacia la izquierda para 💔 PASS
              </Text>
              <Text style={styles.instructionsSubtext}>
                O usa los botones de abajo
              </Text>
            </View>

            {/* Buttons mejorados */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.passButton} 
                onPress={() => swipeLeft()}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonIcon}>💔</Text>
                <Text style={styles.buttonText}>Pasar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.infoButton} 
                onPress={() => navigation.navigate('PetDetail', { pet: currentPet })}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonIcon}>👁️</Text>
                <Text style={styles.buttonText}>Ver más</Text>
              </TouchableOpacity>
              
              {currentPet.ownerId === user.id ? (
                <TouchableOpacity style={[styles.likeButton, styles.disabledButton]} disabled>
                  <Text style={styles.buttonIcon}>🏠</Text>
                  <Text style={styles.buttonText}>Tu mascota</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.likeButton} 
                  onPress={() => swipeRight()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonIcon}>❤️</Text>
                  <Text style={styles.buttonText}>Me gusta</Text>
                </TouchableOpacity>
              )}
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
  swipeCard: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 4,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  likeIndicator: {
    right: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderColor: '#4CAF50',
    transform: [{ rotate: '15deg' }],
  },
  passIndicator: {
    left: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    borderColor: '#f44336',
    transform: [{ rotate: '-15deg' }],
  },
  indicatorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  instructionsTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  instructionsSubtext: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  passButton: {
    backgroundColor: '#f44336',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    elevation: 4,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginHorizontal: 5,
  },
  infoButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    elevation: 4,
    shadowColor: '#17a2b8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginHorizontal: 5,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggleContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  toggleButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ownerInfo: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: 'center',
  },
  ownerLabel: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '600',
  },
});

export default AdopitSimpleScreen;
