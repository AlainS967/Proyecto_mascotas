import AsyncStorage from '@react-native-async-storage/async-storage';

const PETS_KEY = '@pets_data';
const FAVORITES_KEY = '@favorites_pets';

// Base de datos simulada de mascotas
const initialPets = [
  {
    id: '1',
    name: 'Luna',
    type: 'Perro',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'Hembra',
    size: 'Grande',
    color: 'Dorado',
    description: 'Luna es una perra muy cariñosa y juguetona. Le encanta nadar y jugar con niños. Está completamente vacunada y esterilizada.',
    location: 'Madrid, España',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop'
    ],
    characteristics: ['Cariñosa', 'Juguetona', 'Obediente', 'Sociable'],
    healthStatus: 'Excelente',
    vaccinated: true,
    sterilized: true,
    adoptionFee: 150,
    contactInfo: {
      phone: '+34 600 123 456',
      email: 'contacto@refugio.com',
      organization: 'Refugio Esperanza'
    },
    dateAdded: '2024-01-15',
    adopted: false
  },
  {
    id: '2',
    name: 'Milo',
    type: 'Gato',
    breed: 'Persa',
    age: 3,
    gender: 'Macho',
    size: 'Mediano',
    color: 'Blanco y Gris',
    description: 'Milo es un gato muy tranquilo y cariñoso. Perfecto para apartamentos. Le gusta dormir en lugares soleados y es muy limpio.',
    location: 'Barcelona, España',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=300&fit=crop'
    ],
    characteristics: ['Tranquilo', 'Cariñoso', 'Independiente', 'Limpio'],
    healthStatus: 'Excelente',
    vaccinated: true,
    sterilized: true,
    adoptionFee: 80,
    contactInfo: {
      phone: '+34 600 789 012',
      email: 'info@gatosfelices.com',
      organization: 'Gatos Felices'
    },
    dateAdded: '2024-01-10',
    adopted: false
  },
  {
    id: '3',
    name: 'Max',
    type: 'Perro',
    breed: 'Labrador',
    age: 4,
    gender: 'Macho',
    size: 'Grande',
    color: 'Negro',
    description: 'Max es un perro muy leal y protector. Ideal para familias con niños. Le encanta correr y hacer ejercicio.',
    location: 'Valencia, España',
    images: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=300&fit=crop'
    ],
    characteristics: ['Leal', 'Protector', 'Energético', 'Inteligente'],
    healthStatus: 'Excelente',
    vaccinated: true,
    sterilized: true,
    adoptionFee: 120,
    contactInfo: {
      phone: '+34 600 345 678',
      email: 'adopciones@perrosamigos.com',
      organization: 'Perros Amigos'
    },
    dateAdded: '2024-01-20',
    adopted: false
  },
  {
    id: '4',
    name: 'Bella',
    type: 'Gato',
    breed: 'Siamés',
    age: 1,
    gender: 'Hembra',
    size: 'Pequeño',
    color: 'Crema y Marrón',
    description: 'Bella es una gatita muy activa y curiosa. Le encanta explorar y jugar con juguetes. Es muy vocal y comunicativa.',
    location: 'Sevilla, España',
    images: [
      'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400&h=300&fit=crop'
    ],
    characteristics: ['Activa', 'Curiosa', 'Comunicativa', 'Juguetona'],
    healthStatus: 'Excelente',
    vaccinated: true,
    sterilized: false,
    adoptionFee: 90,
    contactInfo: {
      phone: '+34 600 456 789',
      email: 'contacto@felinos.org',
      organization: 'Felinos de Andalucía'
    },
    dateAdded: '2024-01-25',
    adopted: false
  },
  {
    id: '5',
    name: 'Rocky',
    type: 'Perro',
    breed: 'Bulldog Francés',
    age: 5,
    gender: 'Macho',
    size: 'Mediano',
    color: 'Atigrado',
    description: 'Rocky es un perro muy tranquilo y cariñoso. Perfecto para personas mayores o familias tranquilas. Le gusta pasear y relajarse.',
    location: 'Bilbao, España',
    images: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop'
    ],
    characteristics: ['Tranquilo', 'Cariñoso', 'Fácil de cuidar', 'Sociable'],
    healthStatus: 'Bueno',
    vaccinated: true,
    sterilized: true,
    adoptionFee: 200,
    contactInfo: {
      phone: '+34 600 567 890',
      email: 'info@bulldogrescue.com',
      organization: 'Bulldog Rescue'
    },
    dateAdded: '2024-01-12',
    adopted: false
  }
];

export const petService = {
  // Inicializar datos de mascotas
  async initializePets() {
    try {
      const existingPets = await AsyncStorage.getItem(PETS_KEY);
      if (!existingPets) {
        await AsyncStorage.setItem(PETS_KEY, JSON.stringify(initialPets));
      }
    } catch (error) {
      console.error('Error initializing pets:', error);
    }
  },

  // Obtener todas las mascotas
  async getAllPets() {
    try {
      await this.initializePets();
      const pets = await AsyncStorage.getItem(PETS_KEY);
      return pets ? JSON.parse(pets) : initialPets;
    } catch (error) {
      console.error('Error getting pets:', error);
      return initialPets;
    }
  },

  // Obtener mascotas disponibles para adopción
  async getAvailablePets() {
    try {
      const allPets = await this.getAllPets();
      return allPets.filter(pet => !pet.adopted);
    } catch (error) {
      console.error('Error getting available pets:', error);
      return [];
    }
  },

  // Obtener una mascota por ID
  async getPetById(petId) {
    try {
      const pets = await this.getAllPets();
      return pets.find(pet => pet.id === petId);
    } catch (error) {
      console.error('Error getting pet by ID:', error);
      return null;
    }
  },

  // Actualizar información de una mascota
  async updatePet(petId, updatedData) {
    try {
      const pets = await this.getAllPets();
      const petIndex = pets.findIndex(pet => pet.id === petId);
      
      if (petIndex !== -1) {
        pets[petIndex] = { ...pets[petIndex], ...updatedData };
        await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
        return pets[petIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating pet:', error);
      return null;
    }
  },

  // Agregar una nueva mascota
  async addPet(petData) {
    try {
      const pets = await this.getAllPets();
      const newPet = {
        id: Date.now().toString(),
        ...petData,
        dateAdded: new Date().toISOString().split('T')[0],
        adopted: false
      };
      
      pets.push(newPet);
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets));
      return newPet;
    } catch (error) {
      console.error('Error adding pet:', error);
      return null;
    }
  },

  // Marcar mascota como adoptada
  async markAsAdopted(petId) {
    try {
      return await this.updatePet(petId, { adopted: true });
    } catch (error) {
      console.error('Error marking pet as adopted:', error);
      return null;
    }
  },

  // Filtrar mascotas por tipo
  async getPetsByType(type) {
    try {
      const pets = await this.getAvailablePets();
      return pets.filter(pet => pet.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
      console.error('Error filtering pets by type:', error);
      return [];
    }
  },

  // Buscar mascotas por nombre o características
  async searchPets(query) {
    try {
      const pets = await this.getAvailablePets();
      const searchTerm = query.toLowerCase();
      
      return pets.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm) ||
        pet.breed.toLowerCase().includes(searchTerm) ||
        pet.characteristics.some(char => char.toLowerCase().includes(searchTerm)) ||
        pet.location.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching pets:', error);
      return [];
    }
  },

  // Gestión de favoritos
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  async addToFavorites(petId) {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(petId)) {
        favorites.push(petId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return [];
    }
  },

  async removeFromFavorites(petId) {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== petId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return [];
    }
  },

  async getFavoritePets() {
    try {
      const favorites = await this.getFavorites();
      const allPets = await this.getAllPets();
      return allPets.filter(pet => favorites.includes(pet.id));
    } catch (error) {
      console.error('Error getting favorite pets:', error);
      return [];
    }
  },

  async isFavorite(petId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(petId);
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }
};
