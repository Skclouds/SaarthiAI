import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { BotConfig, Business, IUser, User, UserRole } from '../models';

const SALT_ROUNDS = 12;

interface TokenUser {
  _id: string;
  email: string;
  role: UserRole;
  businessId: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    businessId: string;
    businessName: string;
  };
}

function signToken(user: TokenUser): string {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    },
    env.jwtSecret,
    { expiresIn: '7d' },
  );
}

async function buildAuthResult(user: IUser): Promise<AuthResult> {
  const business = await Business.findById(user.businessId);
  if (!business) {
    throw new AppError('Business not found', 404);
  }

  const token = signToken({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    businessId: user.businessId.toString(),
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      businessId: user.businessId.toString(),
      businessName: business.name,
    },
  };
}

async function createBusinessWithAdmin(
  businessName: string,
  email: string,
  passwordHash?: string,
): Promise<AuthResult> {
  const business = await Business.create({ name: businessName });

  const user = await User.create({
    businessId: business._id,
    email: email.toLowerCase(),
    ...(passwordHash ? { passwordHash } : {}),
    role: 'ADMIN',
  });

  await BotConfig.create({
    businessId: business._id,
    botName: 'SaarthiAI',
    welcomeMessage: 'Hello! How can I help you today?',
    personality: 'Friendly',
    escalationRules: [],
  });

  return buildAuthResult(user);
}

export async function register(
  businessName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return createBusinessWithAdmin(businessName, email, passwordHash);
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.passwordHash) {
    throw new AppError('This account uses Google sign-in. Please continue with Google.', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  return buildAuthResult(user);
}

export async function loginWithGoogle(credential: string): Promise<AuthResult> {
  if (!env.googleClientId) {
    throw new AppError('Google sign-in is not configured', 503);
  }

  const client = new OAuth2Client(env.googleClientId);
  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Invalid Google credential', 401);
  }

  if (!payload?.email) {
    throw new AppError('Google account email not available', 400);
  }

  if (payload.email_verified === false) {
    throw new AppError('Google email is not verified', 401);
  }

  const email = payload.email.toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return buildAuthResult(existingUser);
  }

  const businessName =
    payload.name?.trim() || email.split('@')[0] || 'My Workspace';

  return createBusinessWithAdmin(businessName, email);
}

export async function forgotPassword(_email: string): Promise<{ message: string }> {
  return {
    message: 'If an account with that email exists, a password reset link has been sent.',
  };
}
