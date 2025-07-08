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
      console.log('🔧 Inicializando base de datos...');
      const existingPets = await AsyncStorage.getItem(PETS_DATABASE_KEY);
      console.log('🔍 Verificando datos existentes:', existingPets ? 'Encontrados' : 'No encontrados');
      
      if (!existingPets) {
        console.log('📝 Creando base de datos inicial con mascotas por defecto...');
        await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(INITIAL_PETS_DATABASE));
        console.log('✅ Base de datos inicializada con', INITIAL_PETS_DATABASE.length, 'mascotas');
        
        // Verificar que se guardó correctamente
        const verification = await AsyncStorage.getItem(PETS_DATABASE_KEY);
        const verificationData = verification ? JSON.parse(verification) : [];
        console.log('🎯 Verificación: mascotas guardadas =', verificationData.length);
      } else {
        console.log('✅ Base de datos ya existe, no se necesita inicialización');
      }
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      console.error('❌ Stack:', error.stack);
      throw new Error(`Error al inicializar la base de datos: ${error.message}`);
    }
  },

  // Obtener todas las mascotas
  async getAllPets() {
    try {
      console.log('📋 Obteniendo todas las mascotas de AsyncStorage...');
      const petsData = await AsyncStorage.getItem(PETS_DATABASE_KEY);
      console.log('💾 Datos crudos de AsyncStorage:', petsData ? 'Datos encontrados' : 'No hay datos');
      
      if (!petsData) {
        console.log('🔄 No hay datos, inicializando con datos por defecto...');
        await this.initializeDatabase();
        const newData = await AsyncStorage.getItem(PETS_DATABASE_KEY);
        const pets = newData ? JSON.parse(newData) : [];
        console.log('📊 Mascotas después de inicialización:', pets.length);
        return pets;
      }
      
      const pets = JSON.parse(petsData);
      console.log('📊 Total de mascotas encontradas:', pets.length);
      console.log('🐕 IDs de mascotas:', pets.map(p => `${p.id}(${p.name})`).join(', '));
      return pets;
    } catch (error) {
      console.error('❌ Error obteniendo mascotas:', error);
      console.error('❌ Stack:', error.stack);
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
      console.log('🔄 databaseService.getUserPets iniciado');
      console.log('👤 userId buscado:', userId);
      
      const allPets = await this.getAllPets();
      console.log('📋 Total de mascotas en BD:', allPets.length);
      
      const userPets = allPets.filter(pet => {
        const isOwner = pet.ownerId === userId;
        const isActive = pet.isActive;
        console.log(`🐕 Mascota ${pet.id}(${pet.name}): owner=${pet.ownerId}, isOwner=${isOwner}, isActive=${isActive}`);
        return isOwner && isActive;
      });
      
      console.log('✅ Mascotas del usuario encontradas:', userPets.length);
      console.log('🏷️ IDs de mascotas del usuario:', userPets.map(p => `${p.id}(${p.name})`).join(', '));
      
      return userPets;
    } catch (error) {
      console.error('❌ Error en databaseService.getUserPets:', error);
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
      console.log('🏭 databaseService.createPet iniciado');
      console.log('📋 petData recibido:', JSON.stringify(petData, null, 2));
      console.log('👤 userId:', userId);
      console.log('📧 userEmail:', userEmail);

      // Validaciones básicas
      if (!petData) {
        throw new Error('Datos de mascota requeridos');
      }
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }
      if (!userEmail) {
        throw new Error('Email de usuario requerido');
      }

      console.log('🔄 Obteniendo todas las mascotas existentes...');
      const allPets = await this.getAllPets();
      console.log('📊 Número de mascotas existentes:', allPets.length);
      
      // Generar ID único
      console.log('🔧 Generando ID único...');
      const petId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${userId}_${Date.now()}_${Math.random()}`
      );
      const shortId = petId.substring(0, 8);
      console.log('🆔 ID generado:', shortId);

      const newPet = {
        id: shortId,
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

      console.log('🐕 Nueva mascota preparada:', JSON.stringify(newPet, null, 2));

      allPets.push(newPet);
      console.log('📊 Total de mascotas después de agregar:', allPets.length);

      console.log('💾 Guardando en AsyncStorage...');
      await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(allPets));
      console.log('✅ Guardado en AsyncStorage completado');
      
      // Verificar que se guardó correctamente
      console.log('🔍 Verificando guardado...');
      const savedPets = await AsyncStorage.getItem(PETS_DATABASE_KEY);
      const parsedSavedPets = JSON.parse(savedPets);
      const foundPet = parsedSavedPets.find(p => p.id === shortId);
      console.log('🎯 Mascota encontrada en verificación:', foundPet ? 'SÍ' : 'NO');
      
      return newPet;
    } catch (error) {
      console.error('❌ Error en databaseService.createPet:', error);
      console.error('❌ Stack completo:', error.stack);
      throw new Error(`Error al crear la mascota: ${error.message}`);
    }
  },

  // Actualizar una mascota existente
  async updatePet(petId, petData, userId) {
    try {
      console.log('🔄 databaseService.updatePet iniciado');
      console.log('🆔 petId:', petId);
      console.log('📋 petData:', JSON.stringify(petData, null, 2));
      console.log('👤 userId:', userId);

      // Validaciones básicas
      if (!petId) {
        throw new Error('ID de mascota requerido');
      }
      if (!petData) {
        throw new Error('Datos de mascota requeridos');
      }
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      console.log('🔄 Obteniendo todas las mascotas...');
      const allPets = await this.getAllPets();
      console.log('📊 Total de mascotas en BD:', allPets.length);
      
      const petIndex = allPets.findIndex(pet => pet.id === petId);
      console.log('🎯 Índice de mascota encontrada:', petIndex);
      
      if (petIndex === -1) {
        console.error('❌ Mascota no encontrada con ID:', petId);
        throw new Error('Mascota no encontrada');
      }

      const existingPet = allPets[petIndex];
      console.log('🐕 Mascota existente:', JSON.stringify(existingPet, null, 2));
      
      // Verificar que el usuario sea el propietario
      if (existingPet.ownerId !== userId) {
        console.error('❌ Usuario no autorizado. Owner:', existingPet.ownerId, 'User:', userId);
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

      console.log('🐕 Mascota actualizada:', JSON.stringify(updatedPet, null, 2));

      allPets[petIndex] = updatedPet;
      console.log('💾 Guardando en AsyncStorage...');
      await AsyncStorage.setItem(PETS_DATABASE_KEY, JSON.stringify(allPets));
      console.log('✅ Guardado completado');
      
      // Verificar que se guardó correctamente
      console.log('🔍 Verificando actualización...');
      const savedPets = await AsyncStorage.getItem(PETS_DATABASE_KEY);
      const parsedSavedPets = JSON.parse(savedPets);
      const verifyPet = parsedSavedPets.find(p => p.id === petId);
      console.log('🎯 Mascota verificada:', verifyPet ? 'SÍ' : 'NO');
      console.log('📅 Fecha de actualización verificada:', verifyPet?.dateUpdated);
      
      return updatedPet;
    } catch (error) {
      console.error('❌ Error en databaseService.updatePet:', error);
      console.error('❌ Stack completo:', error.stack);
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
      console.log('💖 databaseService.getFavorites (IDs) iniciado');
      console.log('👤 userId:', userId);
      console.log('🔑 Clave de AsyncStorage:', `${FAVORITES_KEY}_${userId}`);
      
      const favoritesData = await AsyncStorage.getItem(`${FAVORITES_KEY}_${userId}`);
      console.log('💾 Datos crudos de favoritos:', favoritesData);
      
      const favorites = favoritesData ? JSON.parse(favoritesData) : [];
      console.log('✅ IDs de favoritos parseados:', favorites);
      
      return favorites;
    } catch (error) {
      console.error('❌ Error en databaseService.getFavorites:', error);
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
      console.log('💖 databaseService.getFavoritePets iniciado');
      console.log('👤 userId:', userId);
      
      console.log('🔄 Obteniendo IDs de favoritos...');
      const favoriteIds = await this.getFavorites(userId);
      console.log('💖 IDs de favoritos:', favoriteIds);
      
      console.log('🔄 Obteniendo todas las mascotas...');
      const allPets = await this.getAllPets();
      console.log('📋 Total de mascotas en BD:', allPets.length);
      
      const favoritePets = allPets.filter(pet => {
        const isFavorite = favoriteIds.includes(pet.id);
        const isActive = pet.isActive;
        console.log(`🐕 Mascota ${pet.id}(${pet.name}): isFavorite=${isFavorite}, isActive=${isActive}`);
        return isFavorite && isActive;
      });
      
      console.log('✅ Mascotas favoritas encontradas:', favoritePets.length);
      console.log('🏷️ Mascotas favoritas:', favoritePets.map(p => `${p.id}(${p.name})`).join(', '));
      
      return favoritePets;
    } catch (error) {
      console.error('❌ Error en databaseService.getFavoritePets:', error);
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
