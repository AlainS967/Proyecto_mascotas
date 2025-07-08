import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { petService } from '../services/petService';

const AddPetScreen = ({ navigation }) => {
  const [petData, setPetData] = useState({
    name: '',
    type: 'Perro',
    breed: '',
    age: '',
    gender: 'Macho',
    size: 'Mediano',
    color: '',
    description: '',
    location: '',
    adoptionFee: '',
    vaccinated: false,
    sterilized: false,
    characteristics: '',
    healthStatus: 'Excelente',
    contactInfo: {
      phone: '',
      email: '',
      organization: '',
    },
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop'
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const petTypes = ['Perro', 'Gato', 'Otro'];
  const genders = ['Macho', 'Hembra'];
  const sizes = ['Pequeño', 'Mediano', 'Grande'];
  const healthStatuses = ['Excelente', 'Bueno', 'Regular', 'Requiere atención'];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPetData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPetData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'name', 'breed', 'age', 'color', 'description', 
      'location', 'adoptionFee'
    ];
    
    const requiredContactFields = ['phone', 'email', 'organization'];

    for (const field of requiredFields) {
      if (!petData[field] || petData[field].toString().trim() === '') {
        Alert.alert('Error', `El campo ${field} es requerido`);
        return false;
      }
    }

    for (const field of requiredContactFields) {
      if (!petData.contactInfo[field] || petData.contactInfo[field].trim() === '') {
        Alert.alert('Error', `El campo de contacto ${field} es requerido`);
        return false;
      }
    }

    if (isNaN(petData.age) || parseInt(petData.age) < 0) {
      Alert.alert('Error', 'La edad debe ser un número válido');
      return false;
    }

    if (isNaN(petData.adoptionFee) || parseInt(petData.adoptionFee) < 0) {
      Alert.alert('Error', 'El costo de adopción debe ser un número válido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(petData.contactInfo.email)) {
      Alert.alert('Error', 'El email de contacto no es válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...petData,
        age: parseInt(petData.age),
        adoptionFee: parseInt(petData.adoptionFee),
        characteristics: petData.characteristics
          .split(',')
          .map(char => char.trim())
          .filter(char => char.length > 0),
      };

      const newPet = await petService.addPet(formattedData);
      
      if (newPet) {
        Alert.alert(
          'Éxito',
          'Mascota agregada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo agregar la mascota');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al agregar la mascota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPicker = (options, selectedValue, onValueChange, placeholder) => (
    <View style={styles.pickerContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.pickerOption,
            selectedValue === option && styles.pickerOptionSelected
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text style={[
            styles.pickerOptionText,
            selectedValue === option && styles.pickerOptionTextSelected
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Mascota</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={[styles.saveText, isSubmitting && styles.disabledText]}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={petData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Nombre de la mascota"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo *</Text>
            {renderPicker(petTypes, petData.type, (value) => handleInputChange('type', value))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Raza *</Text>
            <TextInput
              style={styles.input}
              value={petData.breed}
              onChangeText={(value) => handleInputChange('breed', value)}
              placeholder="Raza de la mascota"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Edad *</Text>
              <TextInput
                style={styles.input}
                value={petData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                placeholder="Edad"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Género *</Text>
              {renderPicker(genders, petData.gender, (value) => handleInputChange('gender', value))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Tamaño *</Text>
              {renderPicker(sizes, petData.size, (value) => handleInputChange('size', value))}
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Color *</Text>
              <TextInput
                style={styles.input}
                value={petData.color}
                onChangeText={(value) => handleInputChange('color', value)}
                placeholder="Color"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={petData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe la personalidad y características de la mascota..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <TextInput
            style={styles.input}
            value={petData.characteristics}
            onChangeText={(value) => handleInputChange('characteristics', value)}
            placeholder="Cariñoso, Juguetón, Obediente (separados por comas)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación y Costo</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación *</Text>
            <TextInput
              style={styles.input}
              value={petData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Ciudad, País"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Costo de Adopción (€) *</Text>
            <TextInput
              style={styles.input}
              value={petData.adoptionFee}
              onChangeText={(value) => handleInputChange('adoptionFee', value)}
              placeholder="Costo en euros"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salud</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.label}>Vacunado</Text>
            <Switch
              value={petData.vaccinated}
              onValueChange={(value) => handleInputChange('vaccinated', value)}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Esterilizado</Text>
            <Switch
              value={petData.sterilized}
              onValueChange={(value) => handleInputChange('sterilized', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado de Salud</Text>
            {renderPicker(healthStatuses, petData.healthStatus, (value) => handleInputChange('healthStatus', value))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Organización *</Text>
            <TextInput
              style={styles.input}
              value={petData.contactInfo.organization}
              onChangeText={(value) => handleInputChange('contactInfo.organization', value)}
              placeholder="Nombre de la organización"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={styles.input}
              value={petData.contactInfo.phone}
              onChangeText={(value) => handleInputChange('contactInfo.phone', value)}
              placeholder="+34 600 123 456"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={petData.contactInfo.email}
              onChangeText={(value) => handleInputChange('contactInfo.email', value)}
              placeholder="contacto@organizacion.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  pickerOptionSelected: {
    backgroundColor: '#007bff',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default AddPetScreen;
