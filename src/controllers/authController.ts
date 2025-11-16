import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db/index.js';
import { users } from '../config/db/schema.js';
import { generateToken } from '../config/jwt.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        authProvider: 'local',
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
      });

    const token = generateToken({ userId: newUser.id, email: newUser.email });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Error de validación', details: error.issues.map(issue => issue.message) });
      return;
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Error de validación', details: error.issues.map(issue => issue.message) });
      return;
    }
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        password: false,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const token = generateToken({ userId: user.id, email: user.email });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};