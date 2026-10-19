# Fuentes del banco de preguntas (departments.ts)

## Metodología

Cada departamento tiene **10 preguntas verificadas**. Todas proceden de datos
ya curados dentro del propio `departments.ts`, cuyo contenido fue compilado
originalmente a partir de referencias públicas peruanas e internacionales
(resúmenes de Wikipedia en español, fuentes oficiales de turismo y patrimonio,
e instituciones culturales). El banco ampliado (2026-10) se construyó así:

| Tipo de pregunta | Fuente del dato |
|---|---|
| Capital departamental | Campo `capital` de cada departamento (INEI, nomenclatura oficial) |
| Atractivo / lugar | Campo `places` del propio departamento |
| Plato típico | Campo `food` del propio departamento |
| Fiesta | Campo `fiestas` del propio departamento |
| Personaje | Campo `person` del propio departamento |
| Preguntas de refuerzo (2-4 por dept) | Campo `facts` del propio departamento |

- Los distractores provienen de otros departamentos (datos reales de ellos),
  asignados a mano entre regiones distintas para evitar ambigüedad.
- Se detectan y omiten automáticamente preguntas cuya respuesta correcta
  solapa con otra pregunta existente del mismo departamento.
- No se inventaron datos; cuando un tema no tenía respaldo verificado en el
  dataset, no se añadió la pregunta.

## Diferencias de categoría respetadas

- Las capitales son **capitales departamentales** (p. ej. Cerro de Pasco,
  la ciudad más alta, es capital del departamento de Pasco).
- La **Provincia Constitucional del Callao no es un departamento** y no
  aparece en el banco departamental (se gestiona por separado en el mapa).
- Apurímac significa "el dios que habla" según la etimología recogida en el
  dataset (fuentes quechuas tradicionales).

## Validación

- `npm run validate:quiz` — valida mínimo 10 preguntas por departamento,
  4 opciones únicas, índice de respuesta en rango y ausencia de duplicados.
- `npm test` — pruebas del sistema de progreso (crownsOf, DeptProgress).

## Pendientes de contenido

- Los ítems declarativos complejos (fechas históricas, cifras) se limitaron
  a los ya presentes en el dataset verificado; ampliarlos requiere revisión
  con fuentes primarias (archivos regionales, MINEDU, INEI).
