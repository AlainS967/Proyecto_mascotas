import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import PetAdoptionScreen from './src/screens/PetAdoptionScreen';
import PetAdoptionTinderScreen from './src/screens/PetAdoptionTinderScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';
import AddPetScreen from './src/screens/AddPetScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
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
    <Stack.Screen name="PetAdoption" component={PetAdoptionScreen} />
    <Stack.Screen name="PetAdoptionTinder" component={PetAdoptionTinderScreen} />
    <Stack.Screen name="PetDetail" component={PetDetailScreen} />
    <Stack.Screen name="AddPet" component={AddPetScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
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
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
};

export default App;
