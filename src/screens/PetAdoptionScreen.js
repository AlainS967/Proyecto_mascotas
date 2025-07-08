import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { petService } from '../services/petService';

const { width, height } = Dimensions.get('window');

// Componente para cada card de mascota
const PetCard = ({ pet, onPress, onFavorite, isFavorite }) => (
  <TouchableOpacity style={styles.petCard} onPress={() => onPress(pet)}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: pet.images[0] }} style={styles.petImage} />
      <TouchableOpacity 
        style={styles.favoriteButton} 
        onPress={() => onFavorite(pet.id)}
      >
        <Text style={styles.favoriteIcon}>
          {isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
      <View style={styles.ageTag}>
        <Text style={styles.ageText}>{pet.age} año{pet.age > 1 ? 's' : ''}</Text>
      </View>
    </View>
    
    <View style={styles.petInfo}>
      <Text style={styles.petName}>{pet.name}</Text>
      <Text style={styles.petBreed}>{pet.breed}</Text>
      <View style={styles.locationContainer}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{pet.location}</Text>
      </View>
      
      <View style={styles.characteristicsContainer}>
        {pet.characteristics.slice(0, 2).map((char, index) => (
          <View key={index} style={styles.characteristicTag}>
            <Text style={styles.characteristicText}>{char}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.adoptionFee}>€{pet.adoptionFee}</Text>
        <View style={styles.statusContainer}>
          {pet.vaccinated && <Text style={styles.statusIcon}>💉</Text>}
          {pet.sterilized && <Text style={styles.statusIcon}>✂️</Text>}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const PetAdoptionScreen = ({ navigation }) => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  const petTypes = ['Todos', 'Perro', 'Gato'];

  useEffect(() => {
    loadPets();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterPets();
  }, [pets, searchQuery, selectedType]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const availablePets = await petService.getAvailablePets();
      setPets(availablePets);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await petService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterPets = () => {
    let filtered = pets;

    // Filtrar por tipo
    if (selectedType !== 'Todos') {
      filtered = filtered.filter(pet => pet.type === selectedType);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.characteristics.some(char => 
          char.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredPets(filtered);
  };

  const handleFavorite = async (petId) => {
    try {
      const isFavorite = favorites.includes(petId);
      
      if (isFavorite) {
        await petService.removeFromFavorites(petId);
        setFavorites(favorites.filter(id => id !== petId));
      } else {
        await petService.addToFavorites(petId);
        setFavorites([...favorites, petId]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  const handlePetPress = (pet) => {
    navigation.navigate('PetDetail', { pet });
  };

  const renderFeaturedPets = () => {
    const featuredPets = filteredPets.slice(0, 5);
    
    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Mascotas Destacadas</Text>
        <FlatList
          data={featuredPets}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.8}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <View style={styles.featuredCard}>
              <TouchableOpacity onPress={() => handlePetPress(item)}>
                <Image source={{ uri: item.images[0] }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredName}>{item.name}</Text>
                  <Text style={styles.featuredBreed}>{item.breed}</Text>
                  <View style={styles.featuredTags}>
                    {item.characteristics.slice(0, 2).map((char, index) => (
                      <View key={index} style={styles.featuredTag}>
                        <Text style={styles.featuredTagText}>{char}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.featuredList}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando mascotas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>¡Hola {user?.name}!</Text>
          <Text style={styles.subtitle}>Encuentra tu compañero perfecto</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.favoritesIcon}>❤️</Text>
          <Text style={styles.favoritesCount}>{favorites.length}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mascotas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros por tipo */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {petTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  selectedType === type && styles.filterButtonActive
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.filterText,
                  selectedType === type && styles.filterTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sección de mascotas destacadas */}
        {renderFeaturedPets()}

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredPets.length}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {filteredPets.filter(pet => pet.type === 'Perro').length}
            </Text>
            <Text style={styles.statLabel}>Perros</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {filteredPets.filter(pet => pet.type === 'Gato').length}
            </Text>
            <Text style={styles.statLabel}>Gatos</Text>
          </View>
        </View>

        {/* Lista de todas las mascotas */}
        <View style={styles.allPetsSection}>
          <Text style={styles.sectionTitle}>Todas las Mascotas</Text>
          <View style={styles.petsGrid}>
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onPress={handlePetPress}
                onFavorite={handleFavorite}
                isFavorite={favorites.includes(pet.id)}
              />
            ))}
          </View>
        </View>

        {filteredPets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron mascotas</Text>
            <Text style={styles.emptySubtext}>
              Prueba con otros filtros o términos de búsqueda
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante para agregar mascota */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPet')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  favoritesIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  favoritesCount: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  featuredSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  featuredList: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: width * 0.75,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  featuredBreed: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  featuredTags: {
    flexDirection: 'row',
  },
  featuredTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  featuredTagText: {
    color: '#fff',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  allPetsSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  petCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: 150,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  ageTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  petInfo: {
    padding: 15,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  characteristicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  characteristicTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  characteristicText: {
    fontSize: 10,
    color: '#1976d2',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adoptionFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusIcon: {
    fontSize: 14,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default PetAdoptionScreen;
