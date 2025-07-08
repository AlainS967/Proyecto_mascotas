import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { databaseService } from './src/services/databaseService';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import PetAdoptionScreen from './src/screens/PetAdoptionScreen';
import AdopitSimpleScreen from './src/screens/AdopitSimpleScreen';
import MyPetsScreen from './src/screens/MyPetsScreen';
import EditPetScreen from './src/screens/EditPetScreen';
import AddPetScreen from './src/screens/AddPetScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';
import DiagnosticScreen from './src/screens/DiagnosticScreen';
import LoadingScreen from './src/components/LoadingScreen';

const Stack = createStackNavigator();

// Auth Stack (Login, Register, ForgotPassword)
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#f5f5f5' }
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// App Stack (Home and other authenticated screens)
const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#f5f5f5' }
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PetAdoption" component={AdopitSimpleScreen} />
    <Stack.Screen name="PetAdoptionOriginal" component={PetAdoptionScreen} />
    <Stack.Screen name="MyPets" component={MyPetsScreen} />
    <Stack.Screen name="EditPet" component={EditPetScreen} />
    <Stack.Screen name="AddPet" component={AddPetScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="PetDetail" component={PetDetailScreen} />
    <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
  </Stack.Navigator>
);

// Navigation component that handles auth state
const AppNavigation = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App component
const App = () => {
  useEffect(() => {
    // Inicializar la base de datos al arrancar la app
    const initializeApp = async () => {
      try {
        await databaseService.initializeDatabase();
        console.log('Base de datos inicializada correctamente');
      } catch (error) {
        console.error('Error inicializando la base de datos:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

export default App;
