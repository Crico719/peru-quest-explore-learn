export const lesson1Content = {
  id: 1,
  title: '¿Qué es programar?',
  level: 1,
  sections: [
    {
      type: 'explanation',
      content: '¡Bienvenido a tu primera aventura! Programar es como darle una receta de cocina a una computadora. Las computadoras son muy rápidas, pero no son "inteligentes" por sí solas: solo hacen exactamente lo que tú les digas. Si olvidas un paso, la computadora se confundirá.'
    },
    {
      type: 'explanation',
      content: 'JavaScript es el lenguaje que usamos para darle vida a las páginas web. Gracias a él, podemos crear botones que cambian de color, juegos interactivos y animaciones increíbles.'
    },
    {
      type: 'example',
      code: `// Este es un comentario, la computadora lo ignora.
// Aquí le pedimos a la computadora que muestre un mensaje:
alert("¡Hola Mundo! Estoy aprendiendo a programar 🚀");`,
      description: 'Usa el comando alert() para mostrar un mensaje emergente en la pantalla.'
    },
    {
      type: 'exercise',
      instruction: 'Cambia el texto dentro de las comillas para que el mensaje diga tu nombre.',
      starterCode: `alert("¡Hola Mundo!");`,
      solution: `alert("¡Hola [Tu Nombre]!");`
    },
    {
      type: 'challenge',
      instruction: 'Crea un mensaje que diga: "¡Soy un futuro programador de JavaScript!"',
    },
    {
      type: 'quiz',
      question: '¿Qué es programar?',
      options: [
        'Escribir un libro de cuentos',
        'Dar instrucciones precisas a una computadora',
        'Arreglar la pantalla de la PC'
      ],
      correctAnswer: 1
    }
  ]
};
