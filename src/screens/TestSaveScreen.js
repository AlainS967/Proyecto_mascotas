import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';

const TestSaveScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const testData = {
    name: 'Mascota de Prueba',
    breed: 'Raza de Prueba',
    age: '2 años',
    description: 'Esta es una mascota de prueba para verificar el guardado.',
    location: 'Madrid, España',
    gender: 'Macho',
    weight: '10kg',
    color: 'Marrón',
    vaccinated: true,
    sterilized: false,
    personalityTags: ['Amigable', 'Juguetón'],
    medicalInfo: 'Saludable',
  };

  const testCreatePet = async () => {
    console.log('🧪 INICIANDO PRUEBA DE CREACIÓN');
    console.log('👤 Usuario de prueba:', user);
    
    if (!user || !user.id) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Iniciando petService.createPet...');
      
      const result = await petService.createPet(testData, user.id, user.email);
      
      console.log('✅ Resultado de prueba:', result);
      setLastResult(result);
      
      Alert.alert('Éxito', `Mascota de prueba creada correctamente. ID: ${result.id}`);
    } catch (error) {
      console.error('❌ Error en prueba:', error);
      Alert.alert('Error', `Error en prueba: ${error.message}`);
      setLastResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetPets = async () => {
    console.log('🧪 INICIANDO PRUEBA DE OBTENER MASCOTAS');
    
    try {
      setLoading(true);
      const pets = await petService.getUserPets(user.id);
      console.log('📋 Mascotas del usuario:', pets);
      
      Alert.alert('Información', `El usuario tiene ${pets.length} mascotas`);
      setLastResult({ userPets: pets });
    } catch (error) {
      console.error('❌ Error obteniendo mascotas:', error);
      Alert.alert('Error', `Error obteniendo mascotas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    try {
      // Esto es solo para testing - reiniciar la base de datos
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('@pets_database');
      Alert.alert('Información', 'Base de datos limpiada');
      setLastResult({ cleared: true });
    } catch (error) {
      Alert.alert('Error', `Error limpiando base de datos: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prueba de Guardado</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Usuario Actual:</Text>
        <Text style={styles.userInfo}>
          ID: {user?.id || 'No disponible'}{'\n'}
          Email: {user?.email || 'No disponible'}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={testCreatePet}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creando...' : 'Crear Mascota de Prueba'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, loading && styles.disabledButton]}
            onPress={testGetPets}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Ver Mis Mascotas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={clearDatabase}
          >
            <Text style={styles.buttonText}>Limpiar Base de Datos</Text>
          </TouchableOpacity>
        </View>

        {lastResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Último Resultado:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(lastResult, null, 2)}
            </Text>
          </View>
        )}

        <View style={styles.testDataContainer}>
          <Text style={styles.sectionTitle}>Datos de Prueba:</Text>
          <Text style={styles.testDataText}>
            {JSON.stringify(testData, null, 2)}
          </Text>
        </View>
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
    backgroundColor: '#2196F3',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginRight: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  testDataContainer: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  testDataText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
});

export default TestSaveScreen;
