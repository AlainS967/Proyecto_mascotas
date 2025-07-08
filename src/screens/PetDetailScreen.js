import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { petService } from '../services/petService';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const PetDetailScreen = ({ route, navigation }) => {
  const { pet: initialPet } = route.params;
  const [pet, setPet] = useState(initialPet);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPet, setEditedPet] = useState(pet);
  const { user } = useAuth();

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await petService.getFavorites();
      setIsFavorite(favorites.includes(pet.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await petService.removeFromFavorites(pet.id);
        setIsFavorite(false);
      } else {
        await petService.addToFavorites(pet.id);
        setIsFavorite(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  const handleAdopt = () => {
    Alert.alert(
      'Adoptar a ' + pet.name,
      '¿Estás seguro de que quieres adoptar a ' + pet.name + '?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, adoptar',
          onPress: async () => {
            try {
              await petService.markAsAdopted(pet.id);
              Alert.alert(
                '¡Felicidades!',
                'Has adoptado a ' + pet.name + '. El refugio se pondrá en contacto contigo pronto.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo completar la adopción');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setEditedPet(pet);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPet = await petService.updatePet(pet.id, editedPet);
      if (updatedPet) {
        setPet(updatedPet);
        setShowEditModal(false);
        Alert.alert('Éxito', 'Perfil de ' + pet.name + ' actualizado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleContact = () => {
    Alert.alert(
      'Contactar',
      'Información de contacto:\n\n' +
      'Organización: ' + pet.contactInfo.organization + '\n' +
      'Teléfono: ' + pet.contactInfo.phone + '\n' +
      'Email: ' + pet.contactInfo.email
    );
  };

  const renderImageSlider = () => (
    <View style={styles.imageSliderContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentImageIndex(index);
        }}
      >
        {pet.images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.petImage} />
        ))}
      </ScrollView>
      
      <View style={styles.imageIndicators}>
        {pet.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentImageIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
        <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSaveEdit}>
            <Text style={styles.modalSaveText}>Guardar</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Nombre</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.name}
              onChangeText={(text) => setEditedPet({...editedPet, name: text})}
              placeholder="Nombre de la mascota"
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Raza</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.breed}
              onChangeText={(text) => setEditedPet({...editedPet, breed: text})}
              placeholder="Raza"
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Edad</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.age.toString()}
              onChangeText={(text) => setEditedPet({...editedPet, age: parseInt(text) || 0})}
              placeholder="Edad"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Color</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.color}
              onChangeText={(text) => setEditedPet({...editedPet, color: text})}
              placeholder="Color"
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Descripción</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              value={editedPet.description}
              onChangeText={(text) => setEditedPet({...editedPet, description: text})}
              placeholder="Descripción"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Ubicación</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.location}
              onChangeText={(text) => setEditedPet({...editedPet, location: text})}
              placeholder="Ubicación"
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Costo de Adopción (€)</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.adoptionFee.toString()}
              onChangeText={(text) => setEditedPet({...editedPet, adoptionFee: parseInt(text) || 0})}
              placeholder="Costo"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.switchSection}>
            <Text style={styles.editLabel}>Vacunado</Text>
            <Switch
              value={editedPet.vaccinated}
              onValueChange={(value) => setEditedPet({...editedPet, vaccinated: value})}
            />
          </View>
          
          <View style={styles.switchSection}>
            <Text style={styles.editLabel}>Esterilizado</Text>
            <Switch
              value={editedPet.sterilized}
              onValueChange={(value) => setEditedPet({...editedPet, sterilized: value})}
            />
          </View>
          
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Características (separadas por comas)</Text>
            <TextInput
              style={styles.editInput}
              value={editedPet.characteristics.join(', ')}
              onChangeText={(text) => setEditedPet({
                ...editedPet, 
                characteristics: text.split(',').map(char => char.trim())
              })}
              placeholder="Cariñoso, Juguetón, Obediente"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderImageSlider()}
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <View style={styles.nameSection}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.adoptionFee}>€{pet.adoptionFee}</Text>
        </View>
        
        <View style={styles.quickInfoSection}>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Edad</Text>
            <Text style={styles.quickInfoValue}>{pet.age} año{pet.age > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Género</Text>
            <Text style={styles.quickInfoValue}>{pet.gender}</Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Tamaño</Text>
            <Text style={styles.quickInfoValue}>{pet.size}</Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Color</Text>
            <Text style={styles.quickInfoValue}>{pet.color}</Text>
          </View>
        </View>
        
        <View style={styles.locationSection}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{pet.location}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{pet.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.characteristicsContainer}>
            {pet.characteristics.map((characteristic, index) => (
              <View key={index} style={styles.characteristicTag}>
                <Text style={styles.characteristicText}>{characteristic}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salud</Text>
          <View style={styles.healthSection}>
            <View style={styles.healthItem}>
              <Text style={styles.healthIcon}>{pet.vaccinated ? '💉' : '❌'}</Text>
              <Text style={styles.healthText}>
                {pet.vaccinated ? 'Vacunado' : 'No vacunado'}
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthIcon}>{pet.sterilized ? '✂️' : '❌'}</Text>
              <Text style={styles.healthText}>
                {pet.sterilized ? 'Esterilizado' : 'No esterilizado'}
              </Text>
            </View>
          </View>
          <Text style={styles.healthStatus}>Estado: {pet.healthStatus}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <View style={styles.contactSection}>
            <Text style={styles.organizationName}>{pet.contactInfo.organization}</Text>
            <Text style={styles.contactInfo}>📞 {pet.contactInfo.phone}</Text>
            <Text style={styles.contactInfo}>✉️ {pet.contactInfo.email}</Text>
          </View>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Contactar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adoptButton} onPress={handleAdopt}>
          <Text style={styles.adoptButtonText}>Adoptar</Text>
        </TouchableOpacity>
      </View>
      
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageSliderContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  petImage: {
    width: width,
    height: height * 0.4,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nameSection: {
    flex: 1,
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
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adoptionFee: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  quickInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  quickInfoItem: {
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  characteristicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  characteristicTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  characteristicText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  healthSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  healthItem: {
    alignItems: 'center',
  },
  healthIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  healthText: {
    fontSize: 14,
    color: '#666',
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    textAlign: 'center',
  },
  contactSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  organizationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adoptButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  adoptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  editTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default PetDetailScreen;
