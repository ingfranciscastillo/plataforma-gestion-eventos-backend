import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "../config/db/index.js";
import {
  users,
  events,
  registrations,
  comments,
  notifications,
} from "../config/db/schema.js";

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...");

  try {
    // Crear usuarios de ejemplo
    const hashedPassword = await bcrypt.hash("password123", 10);

    const usersToInsert = [
      {
        id: randomUUID(),
        email: "juan@example.com",
        password: hashedPassword,
        name: "Juan Pérez",
        authProvider: "local",
        isVerified: true,
      },
      {
        id: randomUUID(),
        email: "maria@example.com",
        password: hashedPassword,
        name: "María García",
        authProvider: "local",
        isVerified: true,
      },
      {
        id: randomUUID(),
        email: "carlos@example.com",
        password: hashedPassword,
        name: "Carlos Rodríguez",
        authProvider: "local",
        isVerified: true,
      },
      {
        id: randomUUID(),
        email: "ana@example.com",
        password: hashedPassword,
        name: "Ana Martínez",
        authProvider: "local",
        isVerified: true,
      },
    ];

    const [user1, user2, user3, user4] = (await db
      .insert(users)
      .values(usersToInsert as any)
      .returning()) as any;

    console.log("✅ 4 Usuarios creados");
    console.log(`   - Juan: ${user1.id}`);
    console.log(`   - María: ${user2.id}`);
    console.log(`   - Carlos: ${user3.id}`);
    console.log(`   - Ana: ${user4.id}`);

    // Crear eventos de ejemplo
    const eventsToInsert = [
      {
        id: randomUUID(),
        title: "Conferencia de JavaScript 2024",
        description:
          "Una conferencia completa sobre las últimas tecnologías de JavaScript, frameworks modernos y mejores prácticas de desarrollo.",
        location: "Centro de Convenciones, Santo Domingo",
        startDate: new Date("2024-12-15T09:00:00"),
        endDate: new Date("2024-12-15T18:00:00"),
        organizerId: user1.id,
        capacity: 100,
        isPremium: true,
        price: "50.00",
        status: "published",
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      },
      {
        id: randomUUID(),
        title: "Meetup de React y Next.js",
        description:
          "Encuentro mensual para desarrolladores React. Compartiremos experiencias, mejores prácticas y networking.",
        location: "CoWorking Space Tech Hub, Santo Domingo Este",
        startDate: new Date("2024-12-20T18:30:00"),
        endDate: new Date("2024-12-20T21:00:00"),
        organizerId: user2.id,
        capacity: 50,
        isPremium: false,
        price: "0.00",
        status: "published",
        imageUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
      },
      {
        id: randomUUID(),
        title: "Workshop de TypeScript Avanzado",
        description:
          "Taller intensivo de TypeScript: tipos avanzados, generics, decoradores y patrones de diseño.",
        location: "Online (Zoom)",
        startDate: new Date("2024-12-25T10:00:00"),
        endDate: new Date("2024-12-25T16:00:00"),
        organizerId: user1.id,
        capacity: 30,
        isPremium: true,
        price: "75.00",
        status: "published",
        imageUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      },
      {
        id: randomUUID(),
        title: "Hackathon 48 Horas",
        description:
          "Competencia de desarrollo de software. Crea la mejor aplicación en 48 horas y gana premios increíbles.",
        location: "Universidad APEC, Santo Domingo",
        startDate: new Date("2025-01-10T08:00:00"),
        endDate: new Date("2025-01-12T20:00:00"),
        organizerId: user3.id,
        capacity: 80,
        isPremium: false,
        price: "0.00",
        status: "published",
        imageUrl:
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      },
      {
        id: randomUUID(),
        title: "Introducción a Node.js y Express",
        description:
          "Curso introductorio para aprender a crear APIs REST con Node.js y Express desde cero.",
        location: "Centro de Capacitación TechEdu, Santo Domingo",
        startDate: new Date("2025-01-15T14:00:00"),
        endDate: new Date("2025-01-15T18:00:00"),
        organizerId: user2.id,
        capacity: 40,
        isPremium: true,
        price: "35.00",
        status: "published",
        imageUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      },
      {
        id: randomUUID(),
        title: "Evento en Borrador",
        description:
          "Este es un evento de prueba que aún no ha sido publicado.",
        location: "Por definir",
        startDate: new Date("2025-02-01T10:00:00"),
        endDate: new Date("2025-02-01T14:00:00"),
        organizerId: user3.id,
        capacity: 25,
        isPremium: false,
        price: "0.00",
        status: "draft",
      },
    ];

    const [event1, event2, event3, event4, event5, event6] = (await db
      .insert(events)
      .values(eventsToInsert as any)
      .returning()) as any;

    console.log("✅ 6 Eventos creados");

    // Crear registros de ejemplo
    const regsToInsert = [
      {
        id: randomUUID(),
        userId: user2.id,
        eventId: event1.id,
        status: "confirmed",
        isPaid: true,
      },
      {
        id: randomUUID(),
        userId: user3.id,
        eventId: event1.id,
        status: "confirmed",
        isPaid: true,
      },
      {
        id: randomUUID(),
        userId: user4.id,
        eventId: event2.id,
        status: "confirmed",
        isPaid: true,
      },
      {
        id: randomUUID(),
        userId: user1.id,
        eventId: event4.id,
        status: "confirmed",
        isPaid: true,
      },
    ];

    const [reg1, reg2, reg3, reg4] = (await db
      .insert(registrations)
      .values(regsToInsert as any)
      .returning()) as any;

    console.log("✅ 4 Registros creados");

    // Crear comentarios de ejemplo
    const commentsToInsert = [
      {
        id: randomUUID(),
        userId: user2.id,
        eventId: event1.id,
        content:
          "¡Excelente conferencia! Aprendí muchísimo sobre las nuevas características de JavaScript. Los speakers fueron de primer nivel.",
        rating: 5,
      },
      {
        id: randomUUID(),
        userId: user3.id,
        eventId: event1.id,
        content:
          "Muy buen evento. El contenido fue interesante aunque hubo algunos problemas con el audio en la sala principal.",
        rating: 4,
      },
      {
        id: randomUUID(),
        userId: user4.id,
        eventId: event2.id,
        content:
          "Gran meetup! El networking fue increíble y las charlas sobre React Server Components fueron muy útiles.",
        rating: 5,
      },
    ];

    await db.insert(comments).values(commentsToInsert as any);

    console.log("✅ 3 Comentarios creados");

    // Crear notificaciones de ejemplo
    const notifsToInsert = [
      {
        id: randomUUID(),
        userId: user2.id,
        title: "Registro confirmado",
        message:
          'Tu registro al evento "Conferencia de JavaScript 2024" ha sido confirmado.',
        isRead: false,
        eventId: event1.id,
      },
      {
        id: randomUUID(),
        userId: user3.id,
        title: "Nuevo evento disponible",
        message:
          'Se ha publicado un nuevo evento: "Workshop de TypeScript Avanzado"',
        isRead: false,
        eventId: event3.id,
      },
      {
        id: randomUUID(),
        userId: user4.id,
        title: "Recordatorio de evento",
        message: 'El evento "Meetup de React y Next.js" es mañana a las 18:30',
        isRead: true,
        eventId: event2.id,
      },
      {
        id: randomUUID(),
        userId: user1.id,
        title: "Registro confirmado",
        message:
          'Tu registro al evento "Hackathon 48 Horas" ha sido confirmado.',
        isRead: false,
        eventId: event4.id,
      },
    ];

    await db.insert(notifications).values(notifsToInsert as any);

    console.log("✅ 4 Notificaciones creadas");

    console.log("\n📊 Resumen de datos de prueba:");
    console.log("\n👥 Usuarios:");
    console.log("   Email: juan@example.com | Password: password123");
    console.log("   Email: maria@example.com | Password: password123");
    console.log("   Email: carlos@example.com | Password: password123");
    console.log("   Email: ana@example.com | Password: password123");

    console.log("\n📅 Eventos:");
    console.log(`   - 5 eventos publicados`);
    console.log(`   - 1 evento en borrador`);
    console.log(`   - 3 eventos gratuitos`);
    console.log(`   - 3 eventos premium`);

    console.log("\n🎫 Registros:");
    console.log(`   - María registrada en: Conferencia de JavaScript`);
    console.log(`   - Carlos registrado en: Conferencia de JavaScript`);
    console.log(`   - Ana registrada en: Meetup de React`);
    console.log(`   - Juan registrado en: Hackathon`);

    console.log("\n⭐ Comentarios:");
    console.log(`   - 2 comentarios en: Conferencia de JavaScript`);
    console.log(`   - 1 comentario en: Meetup de React`);

    console.log("\n🔔 Notificaciones:");
    console.log(`   - 4 notificaciones distribuidas entre usuarios`);

    console.log("\n✅ Seed completado exitosamente!");
    console.log(
      "\n💡 Tip: Usa cualquiera de los emails de arriba para hacer login."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seed();
