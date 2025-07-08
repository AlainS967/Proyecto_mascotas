import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { petService } from '../services/petService';

const PetDetailScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { pet, canEdit = false } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const favoriteStatus = await petService.isFavorite(user.id, pet.id);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error verificando favorito:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setLoading(true);
      if (isFavorite) {
        await petService.removeFromFavorites(user.id, pet.id);
        setIsFavorite(false);
        Alert.alert('Éxito', 'Mascota removida de favoritos');
      } else {
        await petService.addToFavorites(user.id, pet.id);
        setIsFavorite(true);
        Alert.alert('Éxito', 'Mascota agregada a favoritos');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = () => {
    navigation.navigate('EditPet', { pet });
  };

  const handleContactOwner = () => {
    const message = `Hola! Estoy interesado/a en adoptar a ${pet.name}. ¿Podrías darme más información?`;
    const emailUrl = `mailto:${pet.ownerEmail}?subject=Interés en adoptar a ${pet.name}&body=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'No se puede abrir la aplicación de email');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'No se puede abrir la aplicación de email');
      });
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
        return 'Disponible para adopción';
      case 'pending':
        return 'Adopción pendiente';
      case 'adopted':
        return 'Ya adoptado';
      default:
        return 'Estado desconocido';
    }
  };

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
        
        <View style={styles.headerActions}>
          {canEdit && (
            <TouchableOpacity style={styles.editButton} onPress={handleEditPet}>
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
          
          {!canEdit && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleToggleFavorite}
              disabled={loading}
            >
              <Text style={styles.favoriteButtonText}>
                {isFavorite ? '💔' : '❤️'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Imagen principal */}
        <Image
          source={{ uri: pet.image || 'https://via.placeholder.com/400x300' }}
          style={styles.mainImage}
        />

        {/* Estado de adopción */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.adoptionStatus) }]}>
          <Text style={styles.statusText}>{getStatusText(pet.adoptionStatus)}</Text>
        </View>

        {/* Información principal */}
        <View style={styles.section}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
          <Text style={styles.petLocation}>📍 {pet.location}</Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Descripción</Text>
          <Text style={styles.description}>{pet.description}</Text>
        </View>

        {/* Detalles físicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Detalles Físicos</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Género:</Text>
              <Text style={styles.detailValue}>{pet.gender || 'No especificado'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Peso:</Text>
              <Text style={styles.detailValue}>{pet.weight || 'No especificado'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Color:</Text>
              <Text style={styles.detailValue}>{pet.color || 'No especificado'}</Text>
            </View>
          </View>
        </View>

        {/* Estado de salud */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚕️ Estado de Salud</Text>
          <View style={styles.healthStatus}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>
                {pet.vaccinated ? '✅' : '❌'} Vacunado
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>
                {pet.sterilized ? '✅' : '❌'} Esterilizado
              </Text>
            </View>
          </View>
          {pet.medicalInfo && (
            <View style={styles.medicalInfo}>
              <Text style={styles.medicalInfoTitle}>Información médica:</Text>
              <Text style={styles.medicalInfoText}>{pet.medicalInfo}</Text>
            </View>
          )}
        </View>

        {/* Personalidad */}
        {pet.personalityTags && pet.personalityTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐾 Personalidad</Text>
            <View style={styles.tagsContainer}>
              {pet.personalityTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Información del propietario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Información del Propietario</Text>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>{pet.ownerName || 'Propietario'}</Text>
            <Text style={styles.ownerEmail}>{pet.ownerEmail}</Text>
          </View>
        </View>

        {/* Botón de contacto */}
        {!canEdit && pet.adoptionStatus === 'available' && (
          <View style={styles.contactSection}>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactOwner}>
              <Text style={styles.contactButtonText}>📧 Contactar para Adopción</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Información de Registro</Text>
          <Text style={styles.dateText}>
            Agregado: {new Date(pet.dateAdded).toLocaleDateString('es-ES')}
          </Text>
          {pet.dateUpdated && (
            <Text style={styles.dateText}>
              Actualizado: {new Date(pet.dateUpdated).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>

        <View style={styles.bottomSpacing} />
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 10,
  },
  favoriteButtonText: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 260,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  petLocation: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  healthStatus: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  healthItem: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  medicalInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  medicalInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  medicalInfoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  ownerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ownerEmail: {
    fontSize: 14,
    color: '#007bff',
  },
  contactSection: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contactButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default PetDetailScreen;