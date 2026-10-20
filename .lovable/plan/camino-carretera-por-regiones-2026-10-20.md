# Camino-carretera por regiones

## Objetivo
Dar al recorrido de Costa, Sierra y Selva una lectura clara de carretera, manteniendo desbloqueos, coronas, progreso y navegación actuales.

## Cambios
- Alinear carretera SVG y nodos en una misma escena con dimensiones relativas compartidas.
- Dibujar la ruta con bordes, calzada y línea central discontinua, usando los tokens visuales del proyecto.
- Ordenar cada nodo como nivel con foto o emoji, nombre, coronas y progreso, adaptado al ancho disponible.
- Validar el camino en escritorio y móvil, además de compilar y revisar errores.

## Detalles técnicos
- Modificar únicamente `src/routes/index.tsx`; no cambiar reglas de juego, datos, rutas ni dependencias.
