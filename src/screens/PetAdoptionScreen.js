import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { petService } from '../services/petService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_HEIGHT = screenHeight * 0.7;

const PetCard = ({ pet, style, onSwipeLeft, onSwipeRight, isTop }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        rotation.setValue(gestureState.dx / 10);
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        const swipeThreshold = screenWidth * 0.3;
        
        if (gestureState.dx > swipeThreshold) {
          // Swipe derecha (like)
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: screenWidth, y: gestureState.dy },
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeRight(pet);
          });
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe izquierda (pass)
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: -screenWidth, y: gestureState.dy },
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onSwipeLeft(pet);
          });
        } else {
          // Volver al centro
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }),
            Animated.spring(rotation, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      ...pan.getTranslateTransform(),
      {
        rotate: rotation.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: ['-15deg', '0deg', '15deg'],
        }),
      },
    ],
    opacity,
  };

  return (
    <Animated.View
      style={[styles.card, style, animatedStyle]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: pet.image }} style={styles.petImage} />
        
        {/* Overlay gradiente */}
        <View style={styles.overlay} />
        
        {/* Información de la mascota */}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petDetails}>{pet.age} • {pet.breed}</Text>
          <Text style={styles.petLocation}>📍 {pet.location}</Text>
          <Text style={styles.petDescription}>{pet.description}</Text>
          
          <View style={styles.badgesContainer}>
            {pet.vaccinated && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>💉 Vacunado</Text>
              </View>
            )}
            {pet.sterilized && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✂️ Esterilizado</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Indicadores de swipe */}
        {isTop && (
          <>
            <Animated.View
              style={[
                styles.swipeIndicator,
                styles.likeIndicator,
                {
                  opacity: pan.x.interpolate({
                    inputRange: [0, screenWidth * 0.3],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Text style={styles.indicatorText}>❤️ ME GUSTA</Text>
            </Animated.View>
            
            <Animated.View
              style={[
                styles.swipeIndicator,
                styles.passIndicator,
                {
                  opacity: pan.x.interpolate({
                    inputRange: [-screenWidth * 0.3, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Text style={styles.indicatorText}>❌ PASAR</Text>
            </Animated.View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const PetAdoptionTinderScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetsForTinder();
  }, []);

  const loadPetsForTinder = async () => {
    try {
      setLoading(true);
      await petService.initialize();
      const tinderPets = await petService.getPetsForTinder(user.id);
      setPets(tinderPets);
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async (pet) => {
    try {
      await petService.recordSwipe(user.id, pet.id, 'pass');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 100);
    } catch (error) {
      console.error('Error registrando swipe:', error);
    }
  };

  const handleSwipeRight = async (pet) => {
    try {
      await petService.recordSwipe(user.id, pet.id, 'like');
      setFavorites([...favorites, pet]);
      Alert.alert(
        '❤️ ¡Me gusta!',
        `Has agregado a ${pet.name} a tus favoritos`,
        [{ text: 'OK' }]
      );
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 100);
    } catch (error) {
      console.error('Error registrando like:', error);
      Alert.alert('Error', 'No se pudo agregar a favoritos');
    }
  };

  const handleLikePress = () => {
    if (currentIndex < pets.length) {
      handleSwipeRight(pets[currentIndex]);
    }
  };

  const handlePassPress = () => {
    if (currentIndex < pets.length) {
      handleSwipeLeft(pets[currentIndex]);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewFavorites = () => {
    navigation.navigate('Favorites');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando mascotas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= pets.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>¡Has visto todas las mascotas! 🎉</Text>
          <Text style={styles.completedSubtitle}>
            Has agregado {favorites.length} mascotas a tus favoritos
          </Text>
          
          <TouchableOpacity style={styles.restartButton} onPress={() => {
            setCurrentIndex(0);
            setFavorites([]);
            loadPetsForTinder();
          }}>
            <Text style={styles.restartButtonText}>🔄 Cargar más mascotas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
          <Text style={styles.headerButtonText}>← Atrás</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Adopción Tinder 🐾</Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={handleViewFavorites}>
          <Text style={styles.headerButtonText}>❤️ {favorites.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Contador de progreso */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} de {pets.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / pets.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Cartas de mascotas */}
      <View style={styles.cardsContainer}>
        {pets.slice(currentIndex, currentIndex + 2).map((pet, index) => (
          <PetCard
            key={pet.id}
            pet={pet}
            style={[
              styles.cardPosition,
              index === 1 && styles.nextCard,
            ]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isTop={index === 0}
          />
        ))}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]} 
          onPress={handlePassPress}
        >
          <Text style={styles.actionButtonText}>❌</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={handleLikePress}
        >
          <Text style={styles.actionButtonText}>❤️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 10,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 2,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardPosition: {
    position: 'absolute',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: '20%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  petInfo: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petDetails: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  petLocation: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 12,
  },
  petDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 20,
    transform: [{ translateY: -25 }],
  },
  likeIndicator: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  passIndicator: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  indicatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    gap: 60,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  passButton: {
    backgroundColor: '#f44336',
  },
  likeButton: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    fontSize: 32,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  completedSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  restartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  restartButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
});

export default PetAdoptionTinderScreen;
