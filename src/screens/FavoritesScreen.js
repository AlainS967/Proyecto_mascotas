import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';

const FavoritesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      console.log('💖 FavoritesScreen: Cargando favoritos...');
      console.log('👤 Usuario ID:', user?.id);
      
      setLoading(true);
      await petService.initialize();
      console.log('✅ petService inicializado');
      
      const favoritePets = await petService.getFavorites(user.id);
      console.log('💖 Favoritos obtenidos:', favoritePets);
      console.log('📊 Número de favoritos:', favoritePets.length);
      
      setFavorites(favoritePets);
      console.log('✅ Favoritos establecidos en estado');
    } catch (error) {
      console.error('❌ Error cargando favoritos en FavoritesScreen:', error);
      console.error('❌ Stack:', error.stack);
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFromFavorites = async (pet) => {
    Alert.alert(
      'Remover de Favoritos',
      `¿Deseas remover a ${pet.name} de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFavorite(pet.id),
        },
      ]
    );
  };

  const removeFavorite = async (petId) => {
    try {
      await petService.removeFromFavorites(user.id, petId);
      setFavorites(favorites.filter(pet => pet.id !== petId));
      Alert.alert('Éxito', 'Mascota removida de favoritos');
    } catch (error) {
      Alert.alert('Error', 'No se pudo remover de favoritos');
    }
  };

  const handleViewDetails = (pet) => {
    navigation.navigate('PetDetail', { pet, canEdit: false });
  };

  const renderFavoriteCard = (pet) => (
    <View key={pet.id} style={styles.favoriteCard}>
      <Image source={{ uri: pet.image || 'https://via.placeholder.com/150' }} style={styles.petImage} />
      
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
        <Text style={styles.petLocation}>📍 {pet.location}</Text>
        <Text style={styles.petDescription} numberOfLines={2}>
          {pet.description}
        </Text>
        
        <View style={styles.petTags}>
          {pet.personalityTags?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDetails(pet)}
        >
          <Text style={styles.viewButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromFavorites(pet)}
        >
          <Text style={styles.removeButtonText}>💔 Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>💔 No tienes favoritos</Text>
      <Text style={styles.emptySubtitle}>
        Ve a la sección de Adopit para descubrir mascotas que te gusten
      </Text>
      <TouchableOpacity
        style={styles.goToAdopitButton}
        onPress={() => navigation.navigate('PetAdoption')}
      >
        <Text style={styles.goToAdopitText}>❤️ Ir a Adopit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <View style={styles.headerRight}>
          <Text style={styles.favoriteCount}>❤️ {favorites.length}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando favoritos...</Text>
          </View>
        ) : favorites.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.favoritesContainer}>
            {favorites.map(renderFavoriteCard)}
          </View>
        )}
      </ScrollView>
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
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    padding: 10,
  },
  favoriteCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    lineHeight: 22,
    marginBottom: 30,
  },
  goToAdopitButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  goToAdopitText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  favoritesContainer: {
    paddingBottom: 20,
  },
  favoriteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  petInfo: {
    marginBottom: 15,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  petLocation: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 10,
  },
  petDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  petTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default FavoritesScreen;