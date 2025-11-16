import { type Request } from "express";
import { type JwtPayload } from "jsonwebtoken";

// Usuario autenticado
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  provider: string;
  providerId: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request extendido con usuario
export interface AuthRequest extends Request {
  user: AuthUser;
}

// JWT Payload
export interface TokenPayload extends JwtPayload {
  userId: string;
}

// Tipos de categorías de eventos
export type EventCategory =
  | "conference"
  | "meetup"
  | "workshop"
  | "webinar"
  | "networking"
  | "other";

// Estados de eventos
export type EventStatus = "draft" | "published" | "cancelled" | "completed";

// Estados de registro
export type RegistrationStatus = "pending" | "confirmed" | "cancelled";

// Estados de pago
export type PaymentStatus = "free" | "pending" | "completed" | "failed";

// Tipos de notificaciones
export type NotificationType =
  | "event_reminder"
  | "event_update"
  | "registration_confirmed"
  | "payment_confirmed";

// Proveedores de autenticación
export type AuthProvider = "local" | "google" | "facebook";

// Respuesta API estándar
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Respuesta con paginación
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query params para eventos
export interface EventQueryParams {
  category?: EventCategory;
  search?: string;
  status?: EventStatus;
  isPremium?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Datos para crear evento
export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
  maxAttendees?: number;
  isPremium: boolean;
  price: number;
}

// Datos para actualizar evento
export type UpdateEventData = Partial<CreateEventData>;

// Datos de registro
export interface RegistrationData {
  eventId: string;
}

// Datos de comentario
export interface CommentData {
  content: string;
  rating?: number;
}

// Datos de email
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Datos de confirmación de registro
export interface RegistrationConfirmationData {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  ticketCode: string;
  isPremium: boolean;
}

// Datos de recordatorio de evento
export interface EventReminderData {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
}

// Datos de confirmación de pago
export interface PaymentConfirmationData {
  userEmail: string;
  userName: string;
  eventTitle: string;
  amount: string;
  ticketCode: string;
}

// Datos para crear sesión de Stripe
export interface CreateCheckoutData {
  eventId: string;
  eventTitle: string;
  price: number;
  userId: string;
  userEmail: string;
}

// Respuesta de Stripe checkout
export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

// Socket event types
export interface SocketEventData {
  id: string;
  title: string;
  date: Date;
  category?: EventCategory;
  organizerId?: string;
  status?: EventStatus;
}

// Notificación
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  eventId?: string;
}

// Usuario de Passport
export interface PassportUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  providerId?: string;
}

// Profile de Google
export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified?: boolean }>;
  photos: Array<{ value: string }>;
}

// Profile de Facebook
export interface FacebookProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}
