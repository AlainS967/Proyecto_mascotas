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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';

const MyPetsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPets: 0,
    activePets: 0,
    totalFavorites: 0,
  });

  useEffect(() => {
    loadUserPets();
    loadUserStats();
  }, []);

  const loadUserPets = async () => {
    try {
      console.log('🔄 MyPetsScreen: Cargando mascotas del usuario...');
      console.log('👤 Usuario ID:', user?.id);
      console.log('📧 Usuario email:', user?.email);
      
      setLoading(true);
      const userPets = await petService.getUserPets(user.id);
      console.log('🐕 Mascotas obtenidas:', userPets);
      console.log('📊 Número de mascotas:', userPets.length);
      
      setPets(userPets);
      console.log('✅ Mascotas establecidas en estado');
    } catch (error) {
      console.error('❌ Error cargando mascotas en MyPetsScreen:', error);
      console.error('❌ Stack:', error.stack);
      Alert.alert('Error', 'No se pudieron cargar tus mascotas');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const userStats = await petService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserPets();
    await loadUserStats();
    setRefreshing(false);
  };

  const handleViewDetails = (pet) => {
    navigation.navigate('PetDetail', { pet });
  };

  const handleEditPet = (pet) => {
    navigation.navigate('EditPet', { pet });
  };

  const handleAddPet = () => {
    navigation.navigate('AddPet');
  };

  const handleDeletePet = (pet) => {
    Alert.alert(
      'Eliminar Mascota',
      `¿Estás seguro que deseas eliminar a ${pet.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePet(pet.id),
        },
      ]
    );
  };

  const deletePet = async (petId) => {
    try {
      await petService.deletePet(petId, user.id);
      Alert.alert('Éxito', 'Mascota eliminada correctamente');
      loadUserPets();
      loadUserStats();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo eliminar la mascota');
    }
  };

  const showMultiplePetsInfo = () => {
    const breeds = [...new Set(pets.map(p => p.breed))].join(', ');
    const avgAge = pets.reduce((sum, pet) => {
      const ageNum = parseInt(pet.age) || 0;
      return sum + ageNum;
    }, 0) / pets.length;
    
    Alert.alert(
      'Información de tus Mascotas',
      `Tienes ${pets.length} mascotas registradas:\n\n` +
      `Razas: ${breeds}\n` +
      `Edad promedio: ${avgAge.toFixed(1)} años\n` +
      `Disponibles para adopción: ${pets.filter(p => p.adoptionStatus === 'available').length}\n\n` +
      `Cada mascota aparece independientemente en el sistema Adopit y puede recibir likes y favoritos por separado.`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'adopted':
        return '#6c757d';
      default:
        return '#007bff';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'pending':
        return 'Pendiente';
      case 'adopted':
        return 'Adoptado';
      default:
        return 'Desconocido';
    }
  };

  const renderPetCard = (pet) => (
    <View key={pet.id} style={styles.petCard}>
      <View style={styles.petHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
          <Text style={styles.petLocation}>📍 {pet.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.adoptionStatus) }]}>
          <Text style={styles.statusText}>{getStatusText(pet.adoptionStatus)}</Text>
        </View>
      </View>
      
      <Text style={styles.petDescription} numberOfLines={2}>
        {pet.description}
      </Text>
      
      <View style={styles.petDetails}>
        <Text style={styles.detailText}>
          🏷️ {pet.personalityTags?.join(', ') || 'Sin etiquetas'}
        </Text>
        <Text style={styles.detailText}>
          ⚕️ {pet.vaccinated ? 'Vacunado' : 'No vacunado'} • 
          {pet.sterilized ? ' Esterilizado' : ' No esterilizado'}
        </Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDetails(pet)}
        >
          <Text style={styles.actionButtonText}>👁️ Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPet(pet)}
        >
          <Text style={styles.actionButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePet(pet)}
        >
          <Text style={styles.actionButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Agregado: {new Date(pet.dateAdded).toLocaleDateString('es-ES')}
        </Text>
        {pet.dateUpdated && (
          <Text style={styles.dateText}>
            Actualizado: {new Date(pet.dateUpdated).toLocaleDateString('es-ES')}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>🐾 No tienes mascotas registradas</Text>
      <Text style={styles.emptySubtitle}>
        Puedes agregar múltiples mascotas para que otros usuarios las conozcan.
        Cada mascota tendrá su propio perfil único con fotos, descripción y características.
      </Text>
      <View style={styles.emptyFeatures}>
        <Text style={styles.emptyFeature}>✨ Perfiles únicos para cada mascota</Text>
        <Text style={styles.emptyFeature}>📸 Fotos y descripciones personalizadas</Text>
        <Text style={styles.emptyFeature}>🎯 Aparecerán en el sistema Adopit</Text>
        <Text style={styles.emptyFeature}>❤️ Otros usuarios podrán agregarlas a favoritos</Text>
      </View>
      <TouchableOpacity style={styles.addFirstPetButton} onPress={handleAddPet}>
        <Text style={styles.addFirstPetText}>➕ Agregar Mi Primera Mascota</Text>
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
        <Text style={styles.headerTitle}>Mis Mascotas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pets.length}</Text>
          <Text style={styles.statLabel}>Mis Mascotas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pets.filter(p => p.adoptionStatus === 'available').length}</Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalFavorites}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
      </View>

      {/* Multiple Pets Info */}
      {pets.length > 1 && (
        <View style={styles.multiplePetsInfo}>
          <Text style={styles.multiplePetsText}>
            🎉 ¡Tienes {pets.length} mascotas registradas! Cada una tiene su propio perfil único.
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleAddPet}>
          <Text style={styles.quickActionIcon}>➕</Text>
          <Text style={styles.quickActionText}>Agregar Nueva Mascota</Text>
        </TouchableOpacity>
        
        {pets.length > 0 && (
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.viewAllButton]} 
            onPress={showMultiplePetsInfo}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Gestionar Todas ({pets.length})</Text>
          </TouchableOpacity>
        )}
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
            <Text style={styles.loadingText}>Cargando mascotas...</Text>
          </View>
        ) : pets.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.petsContainer}>
            {pets.map(renderPetCard)}
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
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    fontSize: 14,
    color: '#666',
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
    marginBottom: 20,
    lineHeight: 22,
  },
  emptyFeatures: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  emptyFeature: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    paddingLeft: 10,
  },
  addFirstPetButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  addFirstPetText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  petsContainer: {
    paddingBottom: 20,
  },
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  petInfo: {
    flex: 1,
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
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  petDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  petDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  multiplePetsInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  multiplePetsText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 15,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 8,
  },
  viewAllButton: {
    backgroundColor: '#4CAF50',
  },
  quickActionIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default MyPetsScreen;
