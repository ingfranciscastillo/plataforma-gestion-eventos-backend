# 📮 Ejemplos de Requests para Postman/Thunder Client

## Variables de entorno

Crea las siguientes variables en Postman:

```
BASE_URL = http://localhost:3000
TOKEN = (se actualizará después del login)
```

## 🔐 Autenticación

### 1. Registro de Usuario

```http
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "password": "password123",
  "name": "Usuario Nuevo"
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 4,
    "email": "nuevo@example.com",
    "name": "Usuario Nuevo",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```http
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta esperada (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Importante:** Copia el `token` y guárdalo en las variables de entorno de Postman.

### 3. Obtener Perfil

```http
GET {{BASE_URL}}/api/auth/profile
Authorization: Bearer {{TOKEN}}
```

## 📅 Eventos

### 4. Crear Evento (Gratuito)

```http
POST {{BASE_URL}}/api/events
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "title": "Meetup de Vue.js",
  "description": "Reunión mensual de desarrolladores Vue.js. Networking, charlas técnicas y pizza.",
  "location": "Tech Hub, Av. Winston Churchill, Santo Domingo",
  "startDate": "2024-12-28T18:30:00Z",
  "endDate": "2024-12-28T21:00:00Z",
  "capacity": 40,
  "isPremium": false,
  "price": "0.00",
  "status": "published",
  "imageUrl": "https://images.unsplash.com/photo-1633356122544-f134324a6cee"
}
```

### 5. Crear Evento (Premium)

```http
POST {{BASE_URL}}/api/events
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "title": "Bootcamp Full Stack 2025",
  "description": "Curso intensivo de 8 semanas para convertirte en desarrollador Full Stack. Incluye proyectos reales y mentoría.",
  "location": "Campus Digital, Zona Colonial, Santo Domingo",
  "startDate": "2025-01-20T09:00:00Z",
  "endDate": "2025-03-15T18:00:00Z",
  "capacity": 25,
  "isPremium": true,
  "price": "499.99",
  "status": "published",
  "imageUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
}
```

### 6. Obtener Todos los Eventos

```http
GET {{BASE_URL}}/api/events
```

**Con filtros:**
```http
GET {{BASE_URL}}/api/events?status=published&upcoming=true
```

### 7. Obtener Evento por ID

```http
GET {{BASE_URL}}/api/events/1
```

**Respuesta esperada:**
```json
{
  "event": {
    "id": 1,
    "title": "Conferencia de JavaScript 2024",
    "description": "Una conferencia completa sobre...",
    "location": "Centro de Convenciones, Santo Domingo",
    "startDate": "2024-12-15T09:00:00.000Z",
    "endDate": "2024-12-15T18:00:00.000Z",
    "capacity": 100,
    "isPremium": true,
    "price": "50.00",
    "status": "published",
    "organizer": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com"
    },
    "registeredCount": 0,
    "availableSpots": 100
  }
}
```

### 8. Actualizar Evento

```http
PUT {{BASE_URL}}/api/events/1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "capacity": 150,
  "price": "45.00"
}
```

### 9. Eliminar Evento

```http
DELETE {{BASE_URL}}/api/events/1
Authorization: Bearer {{TOKEN}}
```

### 10. Mis Eventos Creados

```http
GET {{BASE_URL}}/api/events/my-events
Authorization: Bearer {{TOKEN}}
```

## 🎫 Registros

### 11. Registrarse a Evento Gratuito

```http
POST {{BASE_URL}}/api/registrations/event/2
Authorization: Bearer {{TOKEN}}
```

**Respuesta esperada:**
```json
{
  "message": "Registro confirmado exitosamente",
  "registration": {
    "id": 1,
    "userId": 1,
    "eventId": 2,
    "status": "confirmed",
    "paymentIntentId": null,
    "isPaid": true,
    "createdAt": "2024-11-15T..."
  },
  "clientSecret": null
}
```

### 12. Registrarse a Evento Premium

```http
POST {{BASE_URL}}/api/registrations/event/1
Authorization: Bearer {{TOKEN}}
```

**Respuesta esperada:**
```json
{
  "message": "Registro iniciado. Completa el pago para confirmar",
  "registration": {
    "id": 2,
    "userId": 1,
    "eventId": 1,
    "status": "pending",
    "isPaid": false
  },
  "clientSecret": "pi_xxx_secret_xxx"
}
```

### 13. Confirmar Pago

```http
POST {{BASE_URL}}/api/registrations/2/confirm-payment
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx_from_stripe"
}
```

### 14. Mis Registros

```http
GET {{BASE_URL}}/api/registrations/my-registrations
Authorization: Bearer {{TOKEN}}
```

**Respuesta esperada:**
```json
{
  "registrations": [
    {
      "id": 1,
      "status": "confirmed",
      "isPaid": true,
      "event": {
        "id": 2,
        "title": "Meetup de React y Next.js",
        "startDate": "2024-12-20T18:30:00.000Z",
        "location": "CoWorking Space Tech Hub",
        "organizer": {
          "id": 2,
          "name": "María García"
        }
      }
    }
  ]
}
```

### 15. Cancelar Registro

```http
PUT {{BASE_URL}}/api/registrations/1/cancel
Authorization: Bearer {{TOKEN}}
```

### 16. Ver Asistentes (Solo Organizador)

```http
GET {{BASE_URL}}/api/registrations/event/1/attendees
Authorization: Bearer {{TOKEN}}
```

## ⭐ Comentarios

### 17. Crear Comentario

```http
POST {{BASE_URL}}/api/comments/event/2
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "content": "¡Excelente evento! Aprendí muchísimo sobre React Hooks y las mejores prácticas. El networking al final fue genial. Totalmente recomendado.",
  "rating": 5
}
```

**Nota:** Solo puedes comentar si tienes un registro confirmado al evento.

### 18. Crear Comentario con Valoración Media

```http
POST {{BASE_URL}}/api/comments/event/1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "content": "Buen evento en general. El contenido fue interesante pero hubo algunos problemas técnicos con el proyector. Aún así, valió la pena.",
  "rating": 3
}
```

### 19. Obtener Comentarios de un Evento

```http
GET {{BASE_URL}}/api/comments/event/2
```

**Respuesta esperada:**
```json
{
  "comments": [
    {
      "id": 1,
      "content": "¡Excelente evento!...",
      "rating": 5,
      "createdAt": "2024-11-15T...",
      "user": {
        "id": 1,
        "name": "Juan Pérez",
        "avatar": null
      }
    }
  ],
  "averageRating": "5.0",
  "totalComments": 1
}
```

### 20. Actualizar Comentario

```http
PUT {{BASE_URL}}/api/comments/1
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "content": "Actualizo mi comentario: fue aún mejor de lo que esperaba.",
  "rating": 5
}
```

### 21. Eliminar Comentario

```http
DELETE {{BASE_URL}}/api/comments/1
Authorization: Bearer {{TOKEN}}
```

## 🔔 Notificaciones

### 22. Obtener Mis Notificaciones

```http
GET {{BASE_URL}}/api/notifications
Authorization: Bearer {{TOKEN}}
```

**Respuesta esperada:**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "Nuevo evento publicado",
      "message": "Se ha publicado el evento 'Workshop de TypeScript'",
      "isRead": false,
      "eventId": 3,
      "createdAt": "2024-11-15T..."
    }
  ],
  "unreadCount": 1
}
```

### 23. Marcar Notificación como Leída

```http
PUT {{BASE_URL}}/api/notifications/1/read
Authorization: Bearer {{TOKEN}}
```

### 24. Marcar Todas como Leídas

```http
PUT {{BASE_URL}}/api/notifications/mark-all-read
Authorization: Bearer {{TOKEN}}
```

### 25. Eliminar Notificación

```http
DELETE {{BASE_URL}}/api/notifications/1
Authorization: Bearer {{TOKEN}}
```

## 🔍 Health Check

### 26. Verificar Estado del Servidor

```http
GET {{BASE_URL}}/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-15T12:00:00.000Z"
}
```

## 🧪 Flujo de Prueba Completo

### Escenario: Usuario registra y asiste a un evento

1. **Registrarse como nuevo usuario** (Request #1)
2. **Hacer login** (Request #2) → Guardar token
3. **Ver eventos disponibles** (Request #6)
4. **Ver detalles de un evento** (Request #7)
5. **Registrarse al evento** (Request #11 o #12)
6. **Si es premium**: Confirmar pago (Request #13)
7. **Ver mis registros** (Request #14)
8. **Después del evento**: Dejar comentario (Request #17)
9. **Ver notificaciones** (Request #22)

### Escenario: Organizador crea y gestiona un evento

1. **Hacer login** (Request #2)
2. **Crear evento** (Request #4 o #5)
3. **Ver mis eventos** (Request #10)
4. **Actualizar evento** (Request #8)
5. **Ver asistentes registrados** (Request #16)
6. **Ver comentarios del evento** (Request #19)

## ⚠️ Errores Comunes

### Error 401: Token inválido o expirado
```json
{
  "error": "Token inválido o expirado"
}
```
**Solución:** Haz login nuevamente y actualiza el token.

### Error 403: No autorizado
```json
{
  "error": "No tienes permiso para editar este evento"
}
```
**Solución:** Solo el organizador puede editar/eliminar eventos.

### Error 400: Validación
```json
{
  "error": "Error de validación",
  "details": [
    {
      "path": ["email"],
      "message": "Email inválido"
    }
  ]
}
```
**Solución:** Verifica que los datos enviados cumplan con las validaciones.

### Error 404: No encontrado
```json
{
  "error": "Evento no encontrado"
}
```
**Solución:** Verifica que el ID del recurso sea correcto.

## 💡 Tips

1. **Usa variables de entorno** en Postman para `BASE_URL` y `TOKEN`
2. **Guarda las colecciones** para reutilizarlas
3. **Usa Tests en Postman** para extraer el token automáticamente:
   ```javascript
   pm.test("Login successful", function () {
       var jsonData = pm.response.json();
       pm.environment.set("TOKEN", jsonData.token);
   });
   ```
4. **Organiza las requests** en carpetas por módulo
5. **Documenta tus requests** con descripciones claras

---

¡Listo para probar todos los endpoints! 🚀