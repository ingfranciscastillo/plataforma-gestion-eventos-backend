import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN!;
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL!;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    await mg.messages.create(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });
    console.log(`Email enviado a: ${to}`);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

export const sendRegistrationConfirmation = async (
  to: string,
  eventTitle: string,
  eventDate: Date
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">¡Confirmación de Registro!</h1>
      <p>Te has registrado exitosamente al evento:</p>
      <h2 style="color: #333;">${eventTitle}</h2>
      <p><strong>Fecha:</strong> ${eventDate.toLocaleString('es-ES')}</p>
      <p>Recibirás un recordatorio antes del evento.</p>
      <p style="margin-top: 30px;">Saludos,<br>El equipo de eventos</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Confirmación de registro - ${eventTitle}`,
    html,
  });
};

export const sendEventReminder = async (
  to: string,
  eventTitle: string,
  eventDate: Date,
  location: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">¡Recordatorio de Evento!</h1>
      <p>Te recordamos que mañana tienes el siguiente evento:</p>
      <h2 style="color: #333;">${eventTitle}</h2>
      <p><strong>Fecha:</strong> ${eventDate.toLocaleString('es-ES')}</p>
      <p><strong>Ubicación:</strong> ${location}</p>
      <p style="margin-top: 30px;">¡Nos vemos allí!</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Recordatorio: ${eventTitle} es mañana`,
    html,
  });
};

export const sendEventCancellation = async (
  to: string,
  eventTitle: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EF4444;">Evento Cancelado</h1>
      <p>Lamentamos informarte que el siguiente evento ha sido cancelado:</p>
      <h2 style="color: #333;">${eventTitle}</h2>
      <p>Si realizaste un pago, será reembolsado en los próximos días.</p>
      <p style="margin-top: 30px;">Disculpa las molestias.</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Evento cancelado - ${eventTitle}`,
    html,
  });
};