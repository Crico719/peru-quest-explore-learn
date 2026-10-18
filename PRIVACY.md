# Privacidad — PERÚ QUEST

## Datos almacenados localmente
- Todo el progreso del juego se guarda en `localStorage` bajo la clave `peru-quest-v1`.
- Se almacenan: XP, gemas, racha, progreso por departamento, log de actividades, idioma, tema oscuro y perfil de usuario.
- No se envían a servidores propios. No hay cuenta de usuario ni autenticación.

## Asistente Inti — Cloudflare Workers
- Las conversaciones con Inti se envían a `https://inti-cultura-peru.christopherdaniel0120.workers.dev/`.
- Se envía: mensaje del usuario y historial limitado al último intercambio.
- El payload incluye instrucciones de idioma y contenido del historial.
- No se envían identificadores personales, direcciones ni datos de pago.
- El Worker procesa la solicitud con modelo de IA y devuelve texto de respuesta. El historial no se persiste en el cliente más allá de la sesión de chat.

## Funciones sociales
- Amigos, seguidores, actividad y compartir en LinkedIn son de demostración. No hay conexión real con servicios externos ni datos de usuarios reales.

## Seguridad
- No se almacenan claves secretas en el frontend.
- Las entradas de usuario se validan con límite de 2000 caracteres y timeout de 15 s.

## Control del usuario
- Puedes exportar tu progreso en `/logros` como JSON.
- Puedes reiniciar progreso desde `/logros` tras confirmación.
- Puedes borrar datos cerrando el navegador y eliminando `localStorage`.
