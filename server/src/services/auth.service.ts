import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { BotConfig, Business, User, UserRole } from '../models';

const SALT_ROUNDS = 12;

interface TokenUser {
  _id: string;
  email: string;
  role: UserRole;
  businessId: string;
}

interface AuthResult {
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

export async function register(
  businessName: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const business = await Business.create({ name: businessName });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    businessId: business._id,
    email: email.toLowerCase(),
    passwordHash,
    role: 'ADMIN',
  });

  await BotConfig.create({
    businessId: business._id,
    botName: 'SaarthiAI',
    welcomeMessage: 'Hello! How can I help you today?',
    personality: 'Friendly',
    escalationRules: [],
  });

  const token = signToken({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    businessId: business._id.toString(),
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      businessId: business._id.toString(),
      businessName: business.name,
    },
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

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

export async function forgotPassword(_email: string): Promise<{ message: string }> {
  return {
    message: 'If an account with that email exists, a password reset link has been sent.',
  };
}
