import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Claves para el almacenamiento
const PETS_DATABASE_KEY = '@pets_database';
const USER_PETS_KEY = '@user_pets';
const FAVORITES_KEY = '@favorites';
const SWIPE_HISTORY_KEY = '@swipe_history';

// Base de datos simulada inicial
const INITIAL_PETS_DATABASE = [
  {
    id: '1',
    name: 'Max',
    age: '2 años',
    breed: 'Golden Retriever',
    description: 'Un perro muy cariñoso y juguetón. Le encanta correr en el parque y jugar con niños.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    location: 'Madrid, España',
    vaccinated: true,
    sterilized: true,
    gender: 'Macho',
    weight: '25kg',
    color: 'Dorado',
    personalityTags: ['Cariñoso', 'Juguetón', 'Activo'],
    medicalInfo: 'Vacunas al día, revisión veterinaria reciente',
    ownerId: 'system',
    ownerName: 'Refugio Madrid',
    ownerEmail: 'refugio@madrid.com',
    dateAdded: new Date('2024-01-15').toISOString(),
    isActive: true,
    adoptionStatus: 'available', // available, pending, adopted
  },
  {
    id: '2',
    name: 'Luna',
    age: '1 año',
    breed: 'Gato Persa',
    description: 'Una gatita muy tranquila y dulce. Perfecta para apartamentos pequeños.',
    image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
    location: 'Barcelona, España',
    vaccinated: true,
    sterilized: false,
    gender: 'Hembra',
    weight: '3kg',
    color: 'Blanco y gris',
    personalityTags: ['Tranquila', 'Dulce', 'Independiente'],
    medicalInfo: 'Vacunas completas, pendiente esterilización',
    ownerId: 'system',
    ownerName: 'Protectora Barcelona',
    ownerEmail: 'protectora@barcelona.com',
    dateAdded: new Date('2024-02-10').toISOString(),
    isActive: true,
    adoptionStatus: 'available',
  },
  {
    id: '3',
    name: 'Rex',
    age: '3 años',
    breed: 'Pastor Alemán',
    description: 'Muy inteligente y leal. Ideal para familias con experiencia con perros grandes.',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
    location: 'Valencia, España',
    vaccinated: true,
    sterilized: true,
    gender: 'Macho',
    weight: '35kg',
    color: 'Negro y marrón',
    personalityTags: ['Inteligente', 'Leal', 'Protector'],
    medicalInfo: 'Excelente estado de salud, entrenado básico',
    ownerId: 'system',
    ownerName: 'Refugio Valencia',
    ownerEmail: 'refugio@valencia.com',
    dateAdded: new Date('2024-01-20').toISOString(),
    isActive: true,
    adoptionStatus: 'available',
  },
];

export const databaseService = {
  // Inicializar la base de datos
  async initializeDatabase() {
    try {
      const existingPets = await AsyncStorage.getItem(PETS_DATABASE_KEY);
      if (!existingPets) {
        await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(INITIAL_PETS_DATABASE));
      }
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      throw new Error('Error al inicializar la base de datos');
    }
  },

  // Obtener todas las mascotas
  async getAllPets() {
    try {
      const petsData = await AsyncStorage.getItem(PETS_DATABASE_KEY);
      return petsData ? JSON.parse(petsData) : [];
    } catch (error) {
      console.error('Error obteniendo mascotas:', error);
      return [];
    }
  },

  // Obtener mascotas disponibles para adopción
  async getAvailablePets(excludeUserId = null) {
    try {
      const allPets = await this.getAllPets();
      return allPets.filter(pet => 
        pet.isActive && 
        pet.adoptionStatus === 'available' && 
        pet.ownerId !== excludeUserId
      );
    } catch (error) {
      console.error('Error obteniendo mascotas disponibles:', error);
      return [];
    }
  },

  // Obtener mascotas de un usuario específico
  async getUserPets(userId) {
    try {
      const allPets = await this.getAllPets();
      return allPets.filter(pet => pet.ownerId === userId && pet.isActive);
    } catch (error) {
      console.error('Error obteniendo mascotas del usuario:', error);
      return [];
    }
  },

  // Obtener una mascota por ID
  async getPetById(petId) {
    try {
      const allPets = await this.getAllPets();
      return allPets.find(pet => pet.id === petId);
    } catch (error) {
      console.error('Error obteniendo mascota por ID:', error);
      return null;
    }
  },

  // Crear una nueva mascota
  async createPet(petData, userId, userEmail) {
    try {
      const allPets = await this.getAllPets();
      
      // Generar ID único
      const petId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${userId}_${Date.now()}_${Math.random()}`
      );

      const newPet = {
        id: petId.substring(0, 8),
        ...petData,
        ownerId: userId,
        ownerEmail: userEmail,
        dateAdded: new Date().toISOString(),
        isActive: true,
        adoptionStatus: 'available',
        // Valores por defecto si no se proporcionan
        vaccinated: petData.vaccinated ?? false,
        sterilized: petData.sterilized ?? false,
        personalityTags: petData.personalityTags ?? [],
        medicalInfo: petData.medicalInfo ?? 'No especificado',
      };

      allPets.push(newPet);
      await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(allPets));
      
      return newPet;
    } catch (error) {
      console.error('Error creando mascota:', error);
      throw new Error('Error al crear la mascota');
    }
  },

  // Actualizar una mascota existente
  async updatePet(petId, petData, userId) {
    try {
      const allPets = await this.getAllPets();
      const petIndex = allPets.findIndex(pet => pet.id === petId);
      
      if (petIndex === -1) {
        throw new Error('Mascota no encontrada');
      }

      const existingPet = allPets[petIndex];
      
      // Verificar que el usuario sea el propietario
      if (existingPet.ownerId !== userId) {
        throw new Error('No tienes permisos para editar esta mascota');
      }

      // Actualizar solo los campos permitidos
      const updatedPet = {
        ...existingPet,
        ...petData,
        id: petId, // Mantener el ID original
        ownerId: existingPet.ownerId, // Mantener el propietario original
        dateAdded: existingPet.dateAdded, // Mantener fecha de creación
        dateUpdated: new Date().toISOString(),
      };

      allPets[petIndex] = updatedPet;
      await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(allPets));
      
      return updatedPet;
    } catch (error) {
      console.error('Error actualizando mascota:', error);
      throw error;
    }
  },

  // Eliminar una mascota (soft delete)
  async deletePet(petId, userId) {
    try {
      const allPets = await this.getAllPets();
      const petIndex = allPets.findIndex(pet => pet.id === petId);
      
      if (petIndex === -1) {
        throw new Error('Mascota no encontrada');
      }

      const existingPet = allPets[petIndex];
      
      // Verificar que el usuario sea el propietario
      if (existingPet.ownerId !== userId) {
        throw new Error('No tienes permisos para eliminar esta mascota');
      }

      // Soft delete
      allPets[petIndex] = {
        ...existingPet,
        isActive: false,
        dateDeleted: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(allPets));
      
      return true;
    } catch (error) {
      console.error('Error eliminando mascota:', error);
      throw error;
    }
  },

  // Gestión de favoritos
  async getFavorites(userId) {
    try {
      const favoritesData = await AsyncStorage.getItem(`${FAVORITES_KEY}_${userId}`);
      return favoritesData ? JSON.parse(favoritesData) : [];
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return [];
    }
  },

  async addToFavorites(userId, petId) {
    try {
      const favorites = await this.getFavorites(userId);
      if (!favorites.includes(petId)) {
        favorites.push(petId);
        await AsyncStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error agregando a favoritos:', error);
      throw error;
    }
  },

  async removeFromFavorites(userId, petId) {
    try {
      const favorites = await this.getFavorites(userId);
      const updatedFavorites = favorites.filter(id => id !== petId);
      await AsyncStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      console.error('Error removiendo de favoritos:', error);
      throw error;
    }
  },

  async getFavoritePets(userId) {
    try {
      const favoriteIds = await this.getFavorites(userId);
      const allPets = await this.getAllPets();
      return allPets.filter(pet => favoriteIds.includes(pet.id) && pet.isActive);
    } catch (error) {
      console.error('Error obteniendo mascotas favoritas:', error);
      return [];
    }
  },

  // Historial de swipes
  async recordSwipe(userId, petId, action) {
    try {
      const historyData = await AsyncStorage.getItem(`${SWIPE_HISTORY_KEY}_${userId}`);
      const history = historyData ? JSON.parse(historyData) : [];
      
      const swipeRecord = {
        petId,
        action, // 'like' o 'pass'
        timestamp: new Date().toISOString(),
      };

      // Evitar duplicados
      const existingIndex = history.findIndex(record => record.petId === petId);
      if (existingIndex >= 0) {
        history[existingIndex] = swipeRecord;
      } else {
        history.push(swipeRecord);
      }

      await AsyncStorage.setItem(`${SWIPE_HISTORY_KEY}_${userId}`, JSON.stringify(history));
      return history;
    } catch (error) {
      console.error('Error guardando historial de swipe:', error);
      throw error;
    }
  },

  async getSwipeHistory(userId) {
    try {
      const historyData = await AsyncStorage.getItem(`${SWIPE_HISTORY_KEY}_${userId}`);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error obteniendo historial de swipes:', error);
      return [];
    }
  },

  // Obtener mascotas filtradas para Adopit (excluyendo las ya vistas)
  async getPetsForAdopit(userId) {
    try {
      const availablePets = await this.getAvailablePets(userId);
      const swipeHistory = await this.getSwipeHistory(userId);
      const swipedPetIds = swipeHistory.map(record => record.petId);
      
      // Filtrar mascotas que no han sido vistas
      return availablePets.filter(pet => !swipedPetIds.includes(pet.id));
    } catch (error) {
      console.error('Error obteniendo mascotas para Adopit:', error);
      return [];
    }
  },

  // Buscar mascotas
  async searchPets(searchQuery, filters = {}) {
    try {
      const allPets = await this.getAvailablePets();
      let filteredPets = allPets;

      // Filtro por texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredPets = filteredPets.filter(pet =>
          pet.name.toLowerCase().includes(query) ||
          pet.breed.toLowerCase().includes(query) ||
          pet.description.toLowerCase().includes(query) ||
          pet.location.toLowerCase().includes(query)
        );
      }

      // Filtros adicionales
      if (filters.breed) {
        filteredPets = filteredPets.filter(pet => 
          pet.breed.toLowerCase().includes(filters.breed.toLowerCase())
        );
      }

      if (filters.gender) {
        filteredPets = filteredPets.filter(pet => 
          pet.gender.toLowerCase() === filters.gender.toLowerCase()
        );
      }

      if (filters.vaccinated !== undefined) {
        filteredPets = filteredPets.filter(pet => pet.vaccinated === filters.vaccinated);
      }

      if (filters.sterilized !== undefined) {
        filteredPets = filteredPets.filter(pet => pet.sterilized === filters.sterilized);
      }

      if (filters.location) {
        filteredPets = filteredPets.filter(pet => 
          pet.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      return filteredPets;
    } catch (error) {
      console.error('Error buscando mascotas:', error);
      return [];
    }
  },

  // Limpiar base de datos (útil para desarrollo)
  async clearDatabase() {
    try {
      await AsyncStorage.removeItem(PETS_DATABASE_KEY);
      await AsyncStorage.removeItem(FAVORITES_KEY);
      await AsyncStorage.removeItem(SWIPE_HISTORY_KEY);
      await this.initializeDatabase();
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async getStats(userId) {
    try {
      const userPets = await this.getUserPets(userId);
      const favorites = await this.getFavorites(userId);
      const swipeHistory = await this.getSwipeHistory(userId);
      const likes = swipeHistory.filter(record => record.action === 'like');
      
      return {
        totalPets: userPets.length,
        activePets: userPets.filter(pet => pet.adoptionStatus === 'available').length,
        totalFavorites: favorites.length,
        totalSwipes: swipeHistory.length,
        totalLikes: likes.length,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalPets: 0,
        activePets: 0,
        totalFavorites: 0,
        totalSwipes: 0,
        totalLikes: 0,
      };
    }
  },
};
