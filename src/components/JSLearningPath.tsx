import React, { useState } from 'react';
import { jsLessons } from '../data/javascript-lessons';

const JSLearningPath = () => {
  const [completedLessons, setCompletedLessons] = useState([]);

  const totalLessons = jsLessons.reduce((acc, level) => acc + level.lessons.length, 0);
  const progress = (completedLessons.length / totalLessons) * 100;

  const toggleLesson = (id) => {
    setCompletedLessons(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>🚀 Mi Aventura de JavaScript</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto 30px auto', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#ddd', borderRadius: '20px', height: '25px', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            backgroundColor: '#4caf50', 
            height: '100%', 
            width: `${progress}%`, 
            transition: 'width 0.5s ease-in-out' 
          }} />
        </div>
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#555' }}>
          Progreso: {Math.round(progress)}% ({completedLessons.length} / {totalLessons} lecciones)
        </p>
        <div style={{ fontSize: '24px', marginTop: '10px' }}>
          {progress === 100 ? '🏆 ¡Maestro de JS!' : progress >= 75 ? '🌟 ¡Casi experto!' : progress >= 50 ? '🎖️ ¡Vas muy bien!' : progress >= 25 ? '🥉 ¡Buen comienzo!' : '🐣 Aprendiz'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
        {jsLessons.map((level) => (
          <div key={level.level}>
            <h2 style={{ 
              color: level.color === 'green' ? '#2e7d32' : level.color === 'yellow' ? '#fbc02d' : level.color === 'orange' ? '#ef6c00' : '#c62828',
              borderBottom: `4px solid ${level.color}`,
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              Nivel {level.level}: {level.title}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              {level.lessons.map((lesson) => (
                <div key={lesson.id} 
                  onClick={() => toggleLesson(lesson.id)}
                  style={{ 
                  backgroundColor: completedLessons.includes(lesson.id) ? '#e8f5e9' : 'white', 
                  padding: '20px', 
                  borderRadius: '15px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  borderLeft: `8px solid ${level.color}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  position: 'relative'
                }} 
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {completedLessons.includes(lesson.id) && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', color: 'green', fontWeight: 'bold' }}>✓</span>
                  )}
                  <h3 style={{ margin: '0 0 10px 0', color: '#444' }}>Lección {lesson.id}</h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{lesson.title}</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>{lesson.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JSLearningPath;
