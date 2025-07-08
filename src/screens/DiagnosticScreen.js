import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import petService from '../services/petService';
import { databaseService } from '../services/databaseService';

const DiagnosticScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [diagnosticInfo, setDiagnosticInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    const info = {};

    try {
      // 1. Verificar usuario
      info.user = user ? { id: user.id, email: user.email } : 'No autenticado';

      // 2. Verificar base de datos
      await databaseService.initializeDatabase();
      info.databaseInitialized = 'OK';

      // 3. Obtener todas las mascotas
      const allPets = await databaseService.getAllPets();
      info.totalPetsInDB = allPets.length;
      info.pets = allPets.map(pet => ({ id: pet.id, name: pet.name }));

      // 4. Obtener mascotas disponibles
      const availablePets = await databaseService.getAvailablePets(user?.id);
      info.availablePets = availablePets.length;

      // 5. Obtener historial de swipes
      const swipeHistory = await databaseService.getSwipeHistory(user?.id || 'test');
      info.swipeHistory = swipeHistory.length;

      // 6. Obtener mascotas para Adopit
      const adopitPets = await databaseService.getPetsForAdopit(user?.id || 'test');
      info.adopitPets = adopitPets.length;
      info.adopitPetsList = adopitPets.map(pet => ({ id: pet.id, name: pet.name }));

    } catch (error) {
      info.error = error.message;
    }

    setDiagnosticInfo(info);
    setLoading(false);
  };

  const clearDatabase = async () => {
    try {
      await databaseService.clearDatabase();
      Alert.alert('Éxito', 'Base de datos limpiada');
      runDiagnostic();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnóstico</Text>
        <TouchableOpacity onPress={runDiagnostic}>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loading}>Ejecutando diagnóstico...</Text>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Información del Sistema</Text>
            <Text style={styles.info}>
              {JSON.stringify(diagnosticInfo, null, 2)}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.clearButton} onPress={clearDatabase}>
          <Text style={styles.clearButtonText}>🗑️ Limpiar Base de Datos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 15,
    backgroundColor: '#4ECDC4',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  info: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DiagnosticScreen;
