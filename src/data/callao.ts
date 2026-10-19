// Datos mínimos verificados de la Provincia Constitucional del Callao.
// No forma parte de DEPARTMENTS (el sistema de progreso cubre los 24 departamentos);
// se usa solo para la ficha del mapa y las explicaciones del juego de localización.
export const CALLAO_INFO = {
  es: {
    capital: "Callao",
    history:
      "El Callao es la Provincia Constitucional del Perú. Su ciudad es el principal puerto marítimo del país y alberga el Aeropuerto Internacional Jorge Chávez, la principal puerta de entrada aérea del Perú.",
    facts: [
      { t: "Puerto principal", d: "Concentra el mayor movimiento portuario del comercio exterior peruano." },
      { t: "Jorge Chávez", d: "El aeropuerto internacional más importante del país está en el Callao." },
      { t: "Real Felipe", d: "Fortaleza colonial del siglo XVIII que defendía la bahía de ataques piratas." },
      { t: "Isla San Lorenzo", d: "Frente a su bahía se encuentra la isla más grande del litoral peruano." },
    ],
    food: ["Choros a la chalaca", "Ceviche"],
    fiestas: ["San Pedro y San Pablo (29 de junio)"],
  },
  en: {
    capital: "Callao",
    history:
      "Callao is Peru's Constitutional Province. Its city is the country's main seaport and home to Jorge Chávez International Airport, Peru's main gateway.",
    facts: [
      { t: "Main seaport", d: "It handles the largest share of Peru's foreign-trade shipping." },
      { t: "Jorge Chávez", d: "The country's main international airport is in Callao." },
      { t: "Real Felipe", d: "An 18th-century colonial fortress that protected the bay from pirates." },
      { t: "San Lorenzo Island", d: "Peru's largest coastal island lies off its bay." },
    ],
    food: ["Choros a la chalaca (spicy mussels)", "Ceviche"],
    fiestas: ["Saints Peter and Paul Day (June 29)"],
  },
} as const;
