import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null
};

// Actions
const AUTH_ACTIONS = {
  RESTORE_TOKEN: 'RESTORE_TOKEN',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  SIGN_UP: 'SIGN_UP',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (prevState, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.RESTORE_TOKEN:
      return {
        ...prevState,
        token: action.token,
        user: action.user,
        isAuthenticated: !!(action.token && action.user),
        isLoading: false,
      };
    case AUTH_ACTIONS.SIGN_IN:
      return {
        ...prevState,
        isAuthenticated: true,
        token: action.token,
        user: action.user,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...prevState,
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SIGN_UP:
      return {
        ...prevState,
        isAuthenticated: true,
        token: action.token,
        user: action.user,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...prevState,
        isLoading: action.isLoading,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...prevState,
        error: action.error,
        isLoading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...prevState,
        error: null,
      };
    default:
      return prevState;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await authService.getToken();
        const user = await authService.getUserData();
        
        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          token,
          user,
        });
      } catch (error) {
        // Restoring token failed
        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          token: null,
          user: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  // Auth methods
  const authMethods = {
    signIn: async (email, password) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, isLoading: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        const result = await authService.login(email, password);
        
        dispatch({
          type: AUTH_ACTIONS.SIGN_IN,
          token: result.token,
          user: result.user,
        });
        
        return result;
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          error: error.message,
        });
        throw error;
      }
    },

    signUp: async (userData) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, isLoading: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        const result = await authService.register(userData);
        
        dispatch({
          type: AUTH_ACTIONS.SIGN_UP,
          token: result.token,
          user: result.user,
        });
        
        return result;
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          error: error.message,
        });
        throw error;
      }
    },

    signOut: async () => {
      try {
        await authService.logout();
        dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          error: error.message,
        });
      }
    },

    forgotPassword: async (email) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, isLoading: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
        
        const result = await authService.forgotPassword(email);
        
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, isLoading: false });
        return result;
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          error: error.message,
        });
        throw error;
      }
    },

    clearError: () => {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    },
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        ...authMethods,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
