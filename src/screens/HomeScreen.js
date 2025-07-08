import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('MyPets');
  };

  const handleSettingsPress = () => {
    Alert.alert('Configuración', 'Funcionalidad de configuración en desarrollo');
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Favorites');
  };

  const handlePetAdoptionPress = () => {
    navigation.navigate('PetAdoption');
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
              <Text style={styles.userRole}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>

        {/* User Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de Usuario</Text>
          <View style={styles.userDetail}>
            <Text style={styles.detailLabel}>Nombre:</Text>
            <Text style={styles.detailValue}>{user?.name}</Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{user?.email}</Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.detailLabel}>Rol:</Text>
            <Text style={styles.detailValue}>
              {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.detailLabel}>ID:</Text>
            <Text style={styles.detailValue}>{user?.id}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleProfilePress}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>�</Text>
              </View>
              <Text style={styles.actionText}>Mis Mascotas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handlePetAdoptionPress}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>❤️</Text>
              </View>
              <Text style={styles.actionText}>Adopit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleNotificationsPress}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>⭐</Text>
              </View>
              <Text style={styles.actionText}>Favoritos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Diagnostic')}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🔧</Text>
              </View>
              <Text style={styles.actionText}>Diagnóstico</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('TestSave')}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🧪</Text>
              </View>
              <Text style={styles.actionText}>Prueba Guardado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutAction]}
              onPress={handleLogout}
            >
              <View style={[styles.actionIcon, styles.logoutIcon]}>
                <Text style={styles.actionIconText}>🚪</Text>
              </View>
              <Text style={[styles.actionText, styles.logoutText]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Sesiones Hoy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {new Date().toLocaleDateString('es-ES')}
              </Text>
              <Text style={styles.statLabel}>Último Acceso</Text>
            </View>
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>¡Bienvenido a la aplicación!</Text>
          <Text style={styles.welcomeText}>
            Esta es una demostración de un sistema de autenticación completo 
            con React Native y Expo. Todas las funcionalidades de autenticación 
            están implementadas y funcionando correctamente.
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  dateContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  userDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flex: 1,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '30%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutAction: {
    backgroundColor: '#fff5f5',
  },
  logoutIcon: {
    backgroundColor: '#dc3545',
  },
  logoutText: {
    color: '#dc3545',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    textAlign: 'center',
  },
  welcomeCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default HomeScreen;
