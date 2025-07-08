import { databaseService } from './databaseService';

export const petService = {
  // Inicializar el servicio
  async initialize() {
    try {
      await databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error inicializando servicio de mascotas:', error);
      throw error;
    }
  },

  // Obtener todas las mascotas disponibles
  async getAvailablePets(userId = null) {
    try {
      return await databaseService.getAvailablePets(userId);
    } catch (error) {
      console.error('Error obteniendo mascotas disponibles:', error);
      return [];
    }
  },

  // Obtener mascotas del usuario
  async getUserPets(userId) {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }
      return await databaseService.getUserPets(userId);
    } catch (error) {
      console.error('Error obteniendo mascotas del usuario:', error);
      throw error;
    }
  },

  // Obtener una mascota por ID
  async getPetById(petId) {
    try {
      if (!petId) {
        throw new Error('ID de mascota requerido');
      }
      return await databaseService.getPetById(petId);
    } catch (error) {
      console.error('Error obteniendo mascota:', error);
      throw error;
    }
  },

  // Crear nueva mascota
  async createPet(petData, userId, userEmail) {
    try {
      // Validaciones
      this.validatePetData(petData);
      
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      if (!userEmail) {
        throw new Error('Email de usuario requerido');
      }

      return await databaseService.createPet(petData, userId, userEmail);
    } catch (error) {
      console.error('Error creando mascota:', error);
      throw error;
    }
  },

  // Actualizar mascota
  async updatePet(petId, petData, userId) {
    try {
      // Validaciones
      this.validatePetData(petData, false); // false = no requerir todos los campos
      
      if (!petId) {
        throw new Error('ID de mascota requerido');
      }

      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      return await databaseService.updatePet(petId, petData, userId);
    } catch (error) {
      console.error('Error actualizando mascota:', error);
      throw error;
    }
  },

  // Eliminar mascota
  async deletePet(petId, userId) {
    try {
      if (!petId) {
        throw new Error('ID de mascota requerido');
      }

      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      return await databaseService.deletePet(petId, userId);
    } catch (error) {
      console.error('Error eliminando mascota:', error);
      throw error;
    }
  },

  // Validar datos de mascota
  validatePetData(petData, requireAll = true) {
    const requiredFields = ['name', 'breed', 'age', 'description', 'location'];
    const optionalFields = ['image', 'gender', 'weight', 'color', 'personalityTags', 'medicalInfo', 'vaccinated', 'sterilized'];

    // Validar campos requeridos
    if (requireAll) {
      for (const field of requiredFields) {
        if (!petData[field] || petData[field].trim() === '') {
          throw new Error(`El campo ${field} es requerido`);
        }
      }
    }

    // Validar tipos de datos
    if (petData.name && typeof petData.name !== 'string') {
      throw new Error('El nombre debe ser texto');
    }

    if (petData.name && petData.name.length > 50) {
      throw new Error('El nombre no puede tener más de 50 caracteres');
    }

    if (petData.breed && typeof petData.breed !== 'string') {
      throw new Error('La raza debe ser texto');
    }

    if (petData.age && typeof petData.age !== 'string') {
      throw new Error('La edad debe ser texto');
    }

    if (petData.description && typeof petData.description !== 'string') {
      throw new Error('La descripción debe ser texto');
    }

    if (petData.description && petData.description.length > 500) {
      throw new Error('La descripción no puede tener más de 500 caracteres');
    }

    if (petData.location && typeof petData.location !== 'string') {
      throw new Error('La ubicación debe ser texto');
    }

    if (petData.gender && !['Macho', 'Hembra'].includes(petData.gender)) {
      throw new Error('El género debe ser Macho o Hembra');
    }

    if (petData.vaccinated !== undefined && typeof petData.vaccinated !== 'boolean') {
      throw new Error('El estado de vacunación debe ser verdadero o falso');
    }

    if (petData.sterilized !== undefined && typeof petData.sterilized !== 'boolean') {
      throw new Error('El estado de esterilización debe ser verdadero o falso');
    }

    if (petData.personalityTags && !Array.isArray(petData.personalityTags)) {
      throw new Error('Las etiquetas de personalidad deben ser una lista');
    }

    if (petData.image && typeof petData.image !== 'string') {
      throw new Error('La imagen debe ser una URL válida');
    }
  },

  // Gestión de favoritos
  async getFavorites(userId) {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }
      return await databaseService.getFavoritePets(userId);
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return [];
    }
  },

  async addToFavorites(userId, petId) {
    try {
      if (!userId || !petId) {
        throw new Error('ID de usuario y mascota requeridos');
      }
      await databaseService.addToFavorites(userId, petId);
      return true;
    } catch (error) {
      console.error('Error agregando a favoritos:', error);
      throw error;
    }
  },

  async removeFromFavorites(userId, petId) {
    try {
      if (!userId || !petId) {
        throw new Error('ID de usuario y mascota requeridos');
      }
      await databaseService.removeFromFavorites(userId, petId);
      return true;
    } catch (error) {
      console.error('Error removiendo de favoritos:', error);
      throw error;
    }
  },

  async isFavorite(userId, petId) {
    try {
      const favoriteIds = await databaseService.getFavorites(userId);
      return favoriteIds.includes(petId);
    } catch (error) {
      console.error('Error verificando favorito:', error);
      return false;
    }
  },

  // Swipe actions
  async recordSwipe(userId, petId, action) {
    try {
      if (!userId || !petId || !action) {
        throw new Error('Parámetros requeridos: userId, petId, action');
      }

      if (!['like', 'pass'].includes(action)) {
        throw new Error('Acción debe ser like o pass');
      }

      await databaseService.recordSwipe(userId, petId, action);
      
      // Si es like, agregar a favoritos automáticamente
      if (action === 'like') {
        await this.addToFavorites(userId, petId);
      }

      return true;
    } catch (error) {
      console.error('Error guardando swipe:', error);
      throw error;
    }
  },

  // Obtener mascotas para Adopit
  async getPetsForTinder(userId) {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }
      return await databaseService.getPetsForTinder(userId);
    } catch (error) {
      console.error('Error obteniendo mascotas para Adopit:', error);
      return [];
    }
  },

  // Buscar mascotas
  async searchPets(searchQuery = '', filters = {}) {
    try {
      return await databaseService.searchPets(searchQuery, filters);
    } catch (error) {
      console.error('Error buscando mascotas:', error);
      return [];
    }
  },

  // Filtros predefinidos
  getFilterOptions() {
    return {
      breeds: [
        'Golden Retriever', 'Labrador', 'Pastor Alemán', 'Bulldog Francés',
        'Chihuahua', 'Poodle', 'Husky Siberiano', 'Border Collie',
        'Gato Persa', 'Gato Siamés', 'Maine Coon', 'British Shorthair',
        'Bengalí', 'Ragdoll', 'Sphynx', 'Scottish Fold'
      ],
      genders: ['Macho', 'Hembra'],
      locations: [
        'Madrid, España', 'Barcelona, España', 'Valencia, España',
        'Sevilla, España', 'Bilbao, España', 'Málaga, España',
        'Zaragoza, España', 'Murcia, España'
      ],
      personalityTags: [
        'Cariñoso', 'Juguetón', 'Tranquilo', 'Activo', 'Inteligente',
        'Leal', 'Independiente', 'Sociable', 'Protector', 'Dulce',
        'Energético', 'Obediente', 'Curioso', 'Tímido', 'Valiente'
      ]
    };
  },

  // Obtener estadísticas del usuario
  async getUserStats(userId) {
    try {
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }
      return await databaseService.getStats(userId);
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

  // Utilidades
  formatPetAge(ageString) {
    if (!ageString) return 'Edad no especificada';
    return ageString;
  },

  formatPetLocation(location) {
    if (!location) return 'Ubicación no especificada';
    return location;
  },

  getPersonalityString(personalityTags) {
    if (!personalityTags || !Array.isArray(personalityTags) || personalityTags.length === 0) {
      return 'Personalidad no especificada';
    }
    return personalityTags.join(', ');
  },

  // Generar datos de demo para testing
  async generateDemoData(userId, userEmail) {
    try {
      const demoPets = [
        {
          name: 'Buddy',
          breed: 'Labrador',
          age: '2 años',
          description: 'Un perro muy amigable y perfecto para familias con niños.',
          location: 'Tu ciudad',
          gender: 'Macho',
          weight: '30kg',
          color: 'Chocolate',
          image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400',
          vaccinated: true,
          sterilized: true,
          personalityTags: ['Amigable', 'Juguetón', 'Obediente'],
          medicalInfo: 'Salud excelente, todas las vacunas al día',
        },
        {
          name: 'Mimi',
          breed: 'Gato Doméstico',
          age: '1 año',
          description: 'Una gatita muy cariñosa que busca un hogar lleno de amor.',
          location: 'Tu ciudad',
          gender: 'Hembra',
          weight: '3kg',
          color: 'Tricolor',
          image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
          vaccinated: true,
          sterilized: false,
          personalityTags: ['Cariñosa', 'Tranquila', 'Independiente'],
          medicalInfo: 'Vacunas completas, pendiente esterilización',
        }
      ];

      const createdPets = [];
      for (const petData of demoPets) {
        const newPet = await this.createPet(petData, userId, userEmail);
        createdPets.push(newPet);
      }

      return createdPets;
    } catch (error) {
      console.error('Error generando datos de demo:', error);
      throw error;
    }
  },
};
