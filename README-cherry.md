# Cherry Was Here 🌍

Una aplicación web interactiva para mapear y visualizar todos los países que has visitado a lo largo de tu vida.

## ✨ Características

- **Mapa mundial interactivo**: Visualiza un mapa completo del mundo con todos los países
- **Países no visitados**: Los países aparecen en color azul grisáceo oscuro por defecto
- **Agregar países visitados**: Haz clic en cualquier país para marcarlo como visitado
- **Personalización**: Asigna colores específicos y años de visita a cada país
- **Estadísticas**: Ve tu progreso de viaje con estadísticas detalladas
- **Almacenamiento local**: Todos tus datos se guardan en tu navegador
- **Diseño responsive**: Funciona perfectamente en desktop y móvil

## 🚀 Tecnologías Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Bundler y herramientas de desarrollo
- **Tailwind CSS** - Estilos y diseño
- **React Simple Maps** - Componentes de mapas
- **Lucide React** - Iconos
- **TanStack Router** - Enrutamiento (preparado para futuras funcionalidades)
- **TanStack Query** - Manejo de estado y cache (preparado para futuras funcionalidades)

## 🛠️ Instalación y Desarrollo

1. **Clona el repositorio**:

   ```bash
   git clone <tu-repo>
   cd cherry-was-here
   ```

2. **Instala las dependencias**:

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Inicia el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

4. **Abre tu navegador** en `http://localhost:5173`

## 🎯 Cómo Usar

1. **Explorar el mapa**: Navega por el mapa mundial interactivo
2. **Seleccionar países**: Haz clic en cualquier país para marcarlo como visitado
3. **Personalizar**: Asigna un color específico y el año de visita
4. **Ver estadísticas**: Revisa tu progreso en el panel lateral
5. **Gestionar**: Elimina países de tu lista si es necesario

## 🎨 Funcionalidades Futuras

- **Provincias/Estados**: Agregar granularidad a nivel de provincias
- **Fotos y notas**: Subir fotos y escribir notas detalladas sobre cada lugar
- **Exportar datos**: Exportar tu mapa en diferentes formatos
- **Compartir**: Compartir tu mapa de viajes con amigos
- **Múltiples usuarios**: Sistema de usuarios con base de datos
- **Sincronización**: Sincronizar datos entre dispositivos

## 🛡️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── WorldMap.tsx     # Mapa mundial principal
│   ├── AddCountryModal.tsx # Modal para agregar países
│   └── VisitedCountriesList.tsx # Lista de países visitados
├── hooks/               # Hooks personalizados
│   └── useLocalStorage.ts # Hook para almacenamiento local
├── styles/              # Estilos CSS
│   ├── globals.css      # Estilos globales
│   └── App.css          # Estilos específicos de la app
├── types/               # Definiciones de tipos TypeScript
│   └── index.ts         # Tipos principales
├── App.tsx              # Componente principal
└── main.tsx             # Punto de entrada
```

## 📝 Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la aplicación:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ve el archivo `LICENSE` para más detalles.

---

¡Comienza a mapear tus aventuras con Cherry Was Here! 🗺️✈️
