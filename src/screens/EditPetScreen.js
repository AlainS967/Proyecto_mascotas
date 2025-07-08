import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { petService } from '../services/petService';

const EditPetScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { pet } = route.params;
  const isEditing = !!pet;

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
    location: '',
    gender: 'Macho',
    weight: '',
    color: '',
    image: '',
    vaccinated: false,
    sterilized: false,
    personalityTags: [],
    medicalInfo: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && pet) {
      setFormData({
        name: pet.name || '',
        breed: pet.breed || '',
        age: pet.age || '',
        description: pet.description || '',
        location: pet.location || '',
        gender: pet.gender || 'Macho',
        weight: pet.weight || '',
        color: pet.color || '',
        image: pet.image || '',
        vaccinated: pet.vaccinated || false,
        sterilized: pet.sterilized || false,
        personalityTags: pet.personalityTags || [],
        medicalInfo: pet.medicalInfo || '',
      });
    }
  }, [pet, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 50) {
      newErrors.name = 'El nombre no puede tener más de 50 caracteres';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'La raza es requerida';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'La edad es requerida';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede tener más de 500 caracteres';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handlePersonalityTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter(t => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await petService.updatePet(pet.id, formData, user.id);
        Alert.alert('Éxito', 'Mascota actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await petService.createPet(formData, user.id, user.email);
        Alert.alert('Éxito', 'Mascota creada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo guardar la mascota');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      '¿Estás seguro que deseas cancelar? Se perderán los cambios no guardados.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const filterOptions = petService.getFilterOptions();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Mascota' : 'Agregar Mascota'}
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Información Básica</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Ej: Max, Luna, Buddy..."
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                maxLength={50}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Raza *</Text>
              <TextInput
                style={[styles.input, errors.breed && styles.inputError]}
                placeholder="Ej: Golden Retriever, Gato Persa..."
                value={formData.breed}
                onChangeText={(text) => handleInputChange('breed', text)}
              />
              {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Edad *</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                placeholder="Ej: 2 años, 6 meses, 1 año y medio..."
                value={formData.age}
                onChangeText={(text) => handleInputChange('age', text)}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Género</Text>
              <View style={styles.genderContainer}>
                {['Macho', 'Hembra'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonActive,
                    ]}
                    onPress={() => handleInputChange('gender', gender)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === gender && styles.genderButtonTextActive,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Descripción</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                placeholder="Cuéntanos sobre la personalidad, comportamiento y características especiales de tu mascota..."
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {formData.description.length}/500 caracteres
              </Text>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
          </View>

          {/* Detalles físicos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Detalles Físicos</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Peso (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 25kg, 3.5kg..."
                value={formData.weight}
                onChangeText={(text) => handleInputChange('weight', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Color (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Dorado, Blanco y negro, Tricolor..."
                value={formData.color}
                onChangeText={(text) => handleInputChange('color', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>URL de Imagen (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.image}
                onChangeText={(text) => handleInputChange('image', text)}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Ubicación</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ubicación *</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                placeholder="Ej: Madrid, España"
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>
          </View>

          {/* Estado de salud */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚕️ Estado de Salud</Text>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Vacunado</Text>
                <Switch
                  value={formData.vaccinated}
                  onValueChange={(value) => handleInputChange('vaccinated', value)}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={formData.vaccinated ? '#007bff' : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Esterilizado</Text>
                <Switch
                  value={formData.sterilized}
                  onValueChange={(value) => handleInputChange('sterilized', value)}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={formData.sterilized ? '#007bff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Información Médica (opcional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Información adicional sobre salud, medicamentos, alergias, etc..."
                value={formData.medicalInfo}
                onChangeText={(text) => handleInputChange('medicalInfo', text)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Personalidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐾 Personalidad</Text>
            <Text style={styles.sectionSubtitle}>Selecciona las características que mejor describen a tu mascota:</Text>
            
            <View style={styles.tagsContainer}>
              {filterOptions.personalityTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    formData.personalityTags.includes(tag) && styles.tagActive,
                  ]}
                  onPress={() => handlePersonalityTagToggle(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      formData.personalityTags.includes(tag) && styles.tagTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  switchContainer: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  tagActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default EditPetScreen;
