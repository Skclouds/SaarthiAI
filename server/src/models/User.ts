import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'ADMIN' | 'AGENT';

export interface IUser extends Document {
  businessId: Types.ObjectId;
  email: string;
  passwordHash?: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['ADMIN', 'AGENT'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = mongoose.model<IUser>('User', userSchema);
