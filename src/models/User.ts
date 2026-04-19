import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'hr', 'client'],
    default: 'client',
  },
  company: { type: String },   // Dành cho HR
  avatar: { type: String },
  created_at: { type: Date, default: Date.now },
});

export const User = models.User || model('User', UserSchema, 'users');
