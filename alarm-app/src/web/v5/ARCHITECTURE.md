# FloatingBentoV5 - Arquitectura

## 📁 Estructura del Proyecto

```
v5/
├── index.jsx                    # Punto de entrada principal (refactorizado)
├── config.js                    # Configuración centralizada de pantallas
├── constants.js                 # Constantes globales (días, meses, navegación)
├── styles.js                    # Estilos compartidos
├── components/
│   ├── index.js                 # Barrel export de componentes
│   ├── MainLayout.jsx           # Layout principal con fondo y decoraciones
│   ├── Navigation.jsx           # Barra de navegación flotante
│   ├── PageHeader.jsx           # Encabezado de página con título/subtítulo
│   ├── DecoShape.jsx            # Formas decorativas de fondo
│   ├── Tile.jsx                 # Componente de tarjeta
│   ├── Field.jsx                # Campo de entrada
│   ├── PillButton.jsx           # Botón con estilo pill
│   ├── Toggle.jsx               # Toggle switch
│   └── ModalOverlay.jsx         # Overlay de modal
├── screens/
│   ├── index.js                 # Barrel export de pantallas
│   ├── SleepScreen.jsx          # Pantalla de tracking de sueño
│   ├── DashboardScreen.jsx      # Pantalla de dashboard con métricas
│   ├── CalendarScreen.jsx       # Pantalla de calendario
│   └── FilesScreen.jsx          # Pantalla de archivos
└── utils/
    └── data.js                  # Utilidades para generación de datos

```

## 🎯 Pantallas Activas

La aplicación contiene **4 pantallas principales**:

1. **😴 Sleep** - Tracking de hábitos de sueño y snoozes
2. **📊 Dashboard** - Insights de salud del sueño con gráficas
3. **📅 Calendar** - Vista de calendario para alarmas
4. **📁 Files** - Gestión de archivos de datos de sueño

## 🏗️ Arquitectura Desacoplada

### `config.js`
Configuración centralizada de pantallas con:
- Componente de cada pantalla
- Título y subtítulo
- Funciones helpers para obtener configuración

### `index.jsx` (Refactorizado)
- **Antes**: 172 líneas con todo mezclado
- **Ahora**: 49 líneas, solo lógica de orquestación
- Usa componentes desacoplados: `MainLayout`, `Navigation`, `PageHeader`

### Componentes Desacoplados

#### `MainLayout.jsx`
- Contenedor principal con fondo
- Formas decorativas
- Gestión de overflow y scroll

#### `Navigation.jsx`
- Navegación flotante con estilo pill
- Animaciones con Framer Motion
- Estados activos/hover/tap

#### `PageHeader.jsx`
- Título y subtítulo animados
- Obtiene info desde `config.js`
- Transiciones suaves entre pantallas

## 📊 Dashboard - Gráfica Principal

El Dashboard incluye una **gráfica especial** que muestra:

### "Celular Nocturno vs. Snoozes Matutinos"
- **Propósito**: Evidenciar el impacto de las pantallas antes de dormir
- **Datos mostrados**:
  - Últimos 7 días
  - Días con uso de celular nocturno (📱)
  - Cantidad de snoozes a la mañana siguiente
  - Comparativa visual con colores:
    - 🔴 Rojo (accent): Días con celular
    - 🟢 Teal: Días sin celular
- **Estadísticas**:
  - Promedio de snoozes con celular
  - Promedio de snoozes sin celular
  - Total de días con uso de celular

### Generación de Datos
Los datos se generan en `utils/data.js` mediante la función `generatePhoneUsageData()`.

## 🎨 Ventajas de la Nueva Arquitectura

✅ **Separación de responsabilidades**: Cada componente tiene una función clara

✅ **Reutilización**: Componentes pueden usarse en otros contextos

✅ **Mantenibilidad**: Más fácil encontrar y modificar código

✅ **Escalabilidad**: Agregar nuevas pantallas es simple

✅ **Legibilidad**: Código más limpio y documentado

✅ **Testing**: Componentes individuales son más fáciles de probar

## 🚀 Agregar Nueva Pantalla

1. Crear componente en `screens/NuevaPantalla.jsx`
2. Exportar en `screens/index.js`
3. Agregar configuración en `config.js`
4. Agregar item en `NAV_ITEMS` en `constants.js`

¡Listo! La nueva pantalla estará integrada.
