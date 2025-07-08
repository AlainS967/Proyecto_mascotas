import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { petService } from '../services/petService';
import { useAuth } from '../context/AuthContext';

const FavoritesScreen = ({ navigation }) => {
  const [favoritePets, setFavoritePets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favorites = await petService.getFavoritePets();
      setFavoritePets(favorites);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (petId) => {
    try {
      await petService.removeFromFavorites(petId);
      setFavoritePets(favoritePets.filter(pet => pet.id !== petId));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar de favoritos');
    }
  };

  const handlePetPress = (pet) => {
    navigation.navigate('PetDetail', { pet });
  };

  const renderFavoritePet = (pet) => (
    <TouchableOpacity
      key={pet.id}
      style={styles.petCard}
      onPress={() => handlePetPress(pet)}
    >
      <Image source={{ uri: pet.images[0] }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{pet.name}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(pet.id)}
          >
            <Text style={styles.removeIcon}>❤️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.petBreed}>{pet.breed}</Text>
        <View style={styles.petDetails}>
          <Text style={styles.petAge}>{pet.age} año{pet.age > 1 ? 's' : ''}</Text>
          <Text style={styles.petLocation}>📍 {pet.location}</Text>
        </View>
        <View style={styles.petFooter}>
          <Text style={styles.adoptionFee}>€{pet.adoptionFee}</Text>
          <View style={styles.statusIcons}>
            {pet.vaccinated && <Text style={styles.statusIcon}>💉</Text>}
            {pet.sterilized && <Text style={styles.statusIcon}>✂️</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Favoritos</Text>
        <View style={styles.placeholder} />
      </View>

      {favoritePets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={styles.emptyTitle}>No tienes favoritos</Text>
          <Text style={styles.emptySubtitle}>
            Agrega mascotas a tus favoritos tocando el corazón
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('PetAdoption')}
          >
            <Text style={styles.exploreButtonText}>Explorar Mascotas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {favoritePets.length} mascota{favoritePets.length > 1 ? 's' : ''} en favoritos
            </Text>
          </View>

          {favoritePets.map(pet => renderFavoritePet(pet))}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
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
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 24,
    color: '#007bff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  petCard: {
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
  petImage: {
    width: '100%',
    height: 200,
  },
  petInfo: {
    padding: 15,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  removeIcon: {
    fontSize: 20,
  },
  petBreed: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  petDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  petAge: {
    fontSize: 14,
    color: '#666',
  },
  petLocation: {
    fontSize: 14,
    color: '#666',
  },
  petFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adoptionFee: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  statusIcons: {
    flexDirection: 'row',
  },
  statusIcon: {
    fontSize: 16,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
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

export default FavoritesScreen;
