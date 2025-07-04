import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

// Simulated user database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'User Test',
    role: 'user'
  }
];

export const authService = {
  // Login function
  async login(email, password) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Credenciales inválidas');
      }
      
      // Generate token
      const token = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${user.id}_${Date.now()}_${Math.random()}`
      );
      
      // Store token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }));
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Register function
  async register(userData) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { email, password, name } = userData;
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
      
      // Create new user
      const newUser = {
        id: String(users.length + 1),
        email,
        password,
        name,
        role: 'user'
      };
      
      users.push(newUser);
      
      // Generate token
      const token = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${newUser.id}_${Date.now()}_${Math.random()}`
      );
      
      // Store token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }));
      
      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Logout function
  async logout() {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      throw error;
    }
  },
  
  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },
  
  // Get stored user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },
  
  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      return false;
    }
  },
  
  // Forgot password
  async forgotPassword(email) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Email no encontrado');
      }
      
      // In a real app, you would send an email with a reset link
      return { message: 'Se ha enviado un enlace de recuperación a tu email' };
    } catch (error) {
      throw error;
    }
  }
};
