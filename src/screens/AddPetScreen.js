import React from 'react';
import EditPetScreen from './EditPetScreen';

const AddPetScreen = ({ navigation, route }) => {
  // Reutilizar EditPetScreen pero sin pasar un pet (modo creación)
  return <EditPetScreen navigation={navigation} route={{ params: {} }} />;
};

export default AddPetScreen;