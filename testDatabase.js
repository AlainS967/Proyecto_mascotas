// Test script para verificar el funcionamiento de la base de datos
// Ejecutar con: node testDatabase.js

const { databaseService } = require('./src/services/databaseService');

async function testDatabase() {
  console.log('🔧 Iniciando test de base de datos...');
  
  try {
    // 1. Inicializar base de datos
    console.log('1. Inicializando base de datos...');
    await databaseService.initializeDatabase();
    console.log('✅ Base de datos inicializada');

    // 2. Obtener todas las mascotas
    console.log('2. Obteniendo todas las mascotas...');
    const allPets = await databaseService.getAllPets();
    console.log(`✅ Total de mascotas: ${allPets.length}`);
    
    if (allPets.length > 0) {
      console.log('📋 Primeras mascotas:');
      allPets.slice(0, 3).forEach(pet => {
        console.log(`  - ${pet.name} (${pet.breed}) - ${pet.location}`);
      });
    }

    // 3. Obtener mascotas disponibles
    console.log('3. Obteniendo mascotas disponibles...');
    const availablePets = await databaseService.getAvailablePets('test-user');
    console.log(`✅ Mascotas disponibles: ${availablePets.length}`);

    // 4. Obtener mascotas para Adopit
    console.log('4. Obteniendo mascotas para Adopit...');
    const adopitPets = await databaseService.getPetsForAdopit('test-user');
    console.log(`✅ Mascotas para Adopit: ${adopitPets.length}`);

    if (adopitPets.length > 0) {
      console.log('🎯 Mascotas para Adopit:');
      adopitPets.forEach(pet => {
        console.log(`  - ${pet.name} (${pet.breed})`);
      });
    } else {
      console.log('⚠️ No hay mascotas disponibles para Adopit');
    }

    console.log('🎉 Test completado exitosamente');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
