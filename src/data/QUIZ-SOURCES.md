# Fuentes del banco de preguntas (departments.ts)

## Metodología

Cada departamento tiene **10 preguntas verificadas**. Todas proceden de datos
curados dentro del propio `departments.ts`, contrastados en esta revisión con
fuentes externas. Los distractores provienen de datos reales de otros
departamentos, asignados entre regiones para evitar ambigüedad. Se detectan y
omiten automáticamente preguntas cuya respuesta solapa con otra del mismo quiz.

## Verificación externa (2026-10, vía Wikipedia en español)

### ✅ Verificados con fuente externa

| Dato | Resultado | Fuente |
|---|---|---|
| 23 capitales departamentales (todas salvo Lima, ver abajo) | Coinciden con el dataset | Tabla de «Departamentos del Perú», es.wikipedia.org/wiki/Departamentos_del_Perú |
| Huascarán, altitud | **Corregido: 6 757 m** (medición oficial 2017); el dataset decía 6 768 m | es.wikipedia.org/wiki/Huascarán (extracto oficial) |
| Cerro de Pasco | Ciudad a gran altura (Wikipedia: 4 380 m; otras fuentes citan 4 330 m por subsidencia minera) → pregunta reformulada a «una de las ciudades más altas del mundo» | es.wikipedia.org/wiki/Cerro_de_Pasco |
| Caral, antigüedad | «Unos 5 000 años» confirmado («se le atribuye una antigüedad de cinco mil años») | es.wikipedia.org/wiki/Caral |
| Lago Titicaca, altitud | 3 812 m confirmado («altitud media de 3812 m s. n. m.») | es.wikipedia.org/wiki/Lago_Titicaca |
| Túcume, material | Pirámides de adobe confirmadas | es.wikipedia.org/wiki/Túcume |
| Kuélap, constructores | Cultura Chachapoyas confirmada | es.wikipedia.org/wiki/Kuélap |
| Moyobamba | Capital de San Martín y ubicada en el Alto Mayo confirmadas | es.wikipedia.org/wiki/Moyobamba |
| Sacsayhuamán | Comenzada bajo Pachacútec (s. XV) confirmado | es.wikipedia.org/wiki/Sacsayhuamán |
| Puno, capital | Ciudad de Puno confirmada | es.wikipedia.org/wiki/Departamento_de_Puno |

### 🔧 Corregidos en esta revisión (preguntas reformuladas por precisión)

| Pregunta original | Motivo | Reemplazo |
|---|---|---|
| ¿Cuánto mide el nevado Huascarán? (6 768 m) | Cifra desactualizada (oficial: 6 757 m, 2017) | ¿En qué parque nacional está el Huascarán? + fact corregido a 6 757 m |
| ¿A qué altura está Cerro de Pasco? (4 330 m) | Fuentes divergen (4 330–4 380 m) | Cerro de Pasco es una de las ciudades más altas del mundo |
| ¿Cuál es la capital de Lima? (Lima) | La sede de facto del departamento de Lima es Huacho; la Provincia de Lima es una circunscripción aparte | ¿Qué es la Costa Verde de Lima? |
| ¿Cuántas pirámides tiene Túcume? (26) | Cifra tradicional no confirmada en el extracto | ¿De qué material son las pirámides de Túcume? (adobe, confirmado) |
| ¿A qué temperatura llegan los Baños del Inca? (70 °C) | Cifra no confirmada externamente | ¿Qué son los Baños del Inca? (aguas termales) |
| ¿Cuánto miden los muros de Kuélap? (20 m) | Cifra no confirmada en el extracto | ¿Quién construyó Kuélap? (Chachapoyas, confirmado) |
| ¿Cuántas especies de orquídeas tiene Moyobamba? (3 500) | Cifra turística no confirmada | ¿En qué valle está Moyobamba? (Alto Mayo, confirmado) |
| ¿Qué piedras tienen los muros de Sacsayhuamán? (100 t) | Cifra no confirmada en el extracto | ¿Quién comenzó Sacsayhuamán? (Pachacútec, confirmado) |

### ⏳ Pendientes de verificación primaria (permanecen como facts del dataset, no como respuestas de preguntas)

- Túcume: «26 pirámides» (cifra tradicional citada por MINCETUR).
- Baños del Inca: «llegan a 70 °C» (rango citado: 60–80 °C).
- Kuélap: «muros de hasta 20 m».
- Moyobamba: «más de 3 500 especies de orquídeas» (promoción regional).
- Sacsayhuamán: «piedras de más de 100 toneladas».
- Puno: título «Capital Folkórica del Perú» (la pregunta usa la paráfrasis
  «Capital del folclore peruano» del dataset).
- Áncash: la Cordillera Blanca como «cordillera tropical más alta del mundo»
  (afirmación ampliamente citada; contrastar con el IGN).
- Huánuco: «uno de los mejores climas del mundo» (la pregunta usa el
  condicional «se le atribuye»).

### Avisos de trazabilidad revisados manualmente (validador)

- loreto «Delfín rosado» — pregunta PREEXISTENTE, respaldada por el fact
  «Delfines rosados: viven en sus ríos».
- sanmartin «En el Alto Mayo» — verificado externamente (Wikipedia).
- lima «Unos 5 000» — verificado externamente (Wikipedia: Caral).

## Diferencias de categoría respetadas

- Las capitales son **capitales departamentales**; la sede de facto del
  departamento de Lima es Huacho, por lo que no se pregunta la capital de Lima.
- La **Provincia Constitucional del Callao no es un departamento** y se gestiona
  por separado (mapa y ficha propias).

## Validación

- `npm run validate:quiz` — mínimo 10 preguntas por departamento, 4 opciones
  únicas, índice de respuesta en rango, sin duplicados y trazabilidad de cada
  respuesta correcta a los datos del departamento (los avisos requieren
  revisión manual; los 3 actuales están revisados y verificados).
- `npm test` — pruebas del sistema de progreso (crownsOf, DeptProgress).
