# Sistema de Autenticación Completo - React Native Expo

Este proyecto implementa un sistema de autenticación completo con React Native y Expo, incluyendo todas las funcionalidades necesarias para el manejo de usuarios.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **Login de Usuario**: Pantalla de inicio de sesión con validación
- **Registro de Usuario**: Crear nuevas cuentas con validación de datos
- **Recuperación de Contraseña**: Sistema de recuperación por email
- **Gestión de Estado**: Context API para manejo global del estado de autenticación
- **Navegación Condicional**: Navegación automática basada en el estado de autenticación
- **Persistencia de Sesión**: Mantiene la sesión del usuario usando AsyncStorage
- **Pantalla de Carga**: Loading screen durante la verificación de autenticación
- **Dashboard/Home**: Pantalla principal para usuarios autenticados
- **Logout Seguro**: Cierre de sesión con confirmación

### 🛡️ Seguridad

- Validación de formularios en el frontend
- Hasheo de tokens de autenticación
- Almacenamiento seguro de credenciales
- Gestión de errores robuста
- Validación de emails y contraseñas

## 📱 Pantallas Incluidas

1. **LoginScreen** - Inicio de sesión
2. **RegisterScreen** - Registro de usuarios
3. **ForgotPasswordScreen** - Recuperación de contraseña
4. **HomeScreen** - Dashboard principal
5. **LoadingScreen** - Pantalla de carga

## 🔧 Estructura del Proyecto

```
src/
├── context/
│   └── AuthContext.js          # Context de autenticación
├── services/
│   └── authService.js          # Servicios de autenticación
├── screens/
│   ├── LoginScreen.js          # Pantalla de login
│   ├── RegisterScreen.js       # Pantalla de registro
│   ├── ForgotPasswordScreen.js # Pantalla de recuperación
│   └── HomeScreen.js           # Pantalla principal
├── components/
│   └── LoadingScreen.js        # Componente de carga
└── index.js                    # Índice de autenticación
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 16 o superior)
- Expo CLI
- React Native development environment

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### Dependencias Principales
- `@react-navigation/native` - Navegación
- `@react-navigation/stack` - Stack navigator
- `@react-native-async-storage/async-storage` - Almacenamiento local
- `react-native-gesture-handler` - Gestos
- `expo-crypto` - Funciones criptográficas

## 📱 Cuentas de Prueba

Para probar la aplicación, puedes usar estas cuentas predefinidas:

### Administrador
- **Email**: `admin@example.com`
- **Contraseña**: `admin123`
- **Rol**: Administrador

### Usuario Estándar
- **Email**: `user@example.com`
- **Contraseña**: `user123`
- **Rol**: Usuario

## 🎯 Funcionalidades por Pantalla

### Login Screen
- Validación de campos
- Mostrar/ocultar contraseña
- Navegación a registro y recuperación
- Manejo de errores
- Indicador de carga

### Register Screen
- Validación de formulario completo
- Confirmación de contraseña
- Requisitos de contraseña
- Validación de email
- Registro automático después del éxito

### Forgot Password Screen
- Validación de email
- Simulación de envío de email
- Opción de reenvío
- Navegación de regreso al login

### Home Screen
- Información del usuario
- Acciones rápidas
- Estadísticas básicas
- Logout con confirmación
- Interfaz adaptable al rol del usuario

## 🔄 Flujo de Autenticación

1. **Verificación Inicial**: Al iniciar la app, se verifica si hay una sesión activa
2. **Navegación Condicional**: Se muestra AuthStack o AppStack según el estado
3. **Login/Register**: Usuario se autentica o crea una cuenta
4. **Persistencia**: Token y datos se guardan en AsyncStorage
5. **Acceso**: Usuario accede a la aplicación autenticada
6. **Logout**: Limpieza de datos y regreso al login

## 🛠️ Personalización

### Agregar Nuevas Pantallas
1. Crear el componente en `src/screens/`
2. Agregar al stack correspondiente en `App.js`
3. Actualizar la navegación según sea necesario

### Modificar Servicios de Auth
- Editar `src/services/authService.js` para cambiar la lógica de autenticación
- Conectar con una API real reemplazando las funciones simuladas

### Personalizar UI
- Modificar los estilos en cada componente
- Cambiar colores y tema en los archivos de estilo
- Agregar nuevos componentes reutilizables

## 📋 Próximos Pasos

- [ ] Conectar con una API real
- [ ] Implementar refresh tokens
- [ ] Agregar autenticación biométrica
- [ ] Implementar notificaciones push
- [ ] Agregar más pantallas (perfil, configuración)
- [ ] Implementar cambio de contraseña
- [ ] Agregar más roles de usuario

## 🐛 Resolución de Problemas

### Error de navegación
- Asegúrate de que todas las dependencias están instaladas
- Verifica que react-native-gesture-handler esté correctamente configurado

### Error de AsyncStorage
- Limpia el almacenamiento: `npx react-native start --reset-cache`

### Problemas de compilación
- Elimina node_modules y reinstala: `rm -rf node_modules && npm install`

## 📞 Soporte

Este es un proyecto de demostración completo que incluye todas las funcionalidades básicas de autenticación necesarias para una aplicación móvil profesional.
