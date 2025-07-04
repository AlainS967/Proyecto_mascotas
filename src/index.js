// Authentication Index - Main exports for the authentication system
// This file serves as the main entry point for all authentication-related components and services

// Context
export { AuthProvider, useAuth } from './context/AuthContext';

// Services
export { authService } from './services/authService';

// Screens
export { default as LoginScreen } from './screens/LoginScreen';
export { default as RegisterScreen } from './screens/RegisterScreen';
export { default as ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { default as HomeScreen } from './screens/HomeScreen';

// Components
export { default as LoadingScreen } from './components/LoadingScreen';

// Authentication utilities and helpers
export const authUtils = {
  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    return {
      isValid: password.length >= 6,
      hasMinLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
    };
  },

  // Format user display name
  formatDisplayName: (name) => {
    if (!name) return 'Usuario';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  // Get user initials for avatar
  getUserInitials: (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  // Check if user has specific role
  hasRole: (user, role) => {
    return user?.role === role;
  },

  // Check if user is admin
  isAdmin: (user) => {
    return user?.role === 'admin';
  },
};

// Authentication constants
export const AUTH_CONSTANTS = {
  TOKEN_KEY: '@auth_token',
  USER_DATA_KEY: '@user_data',
  MIN_PASSWORD_LENGTH: 6,
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },
  DEMO_USERS: [
    {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      description: 'Cuenta de administrador'
    },
    {
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      description: 'Cuenta de usuario estándar'
    }
  ]
};

// Authentication hooks (additional custom hooks)
export const useAuthHelpers = () => {
  const { user } = useAuth();

  return {
    isAdmin: authUtils.isAdmin(user),
    userInitials: authUtils.getUserInitials(user?.name),
    displayName: authUtils.formatDisplayName(user?.name),
    hasRole: (role) => authUtils.hasRole(user, role),
  };
};

// Export default configuration
export default {
  authService,
  authUtils,
  AUTH_CONSTANTS,
};
