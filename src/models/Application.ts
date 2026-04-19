import mongoose, { Schema, model, models } from 'mongoose';

const ApplicationSchema = new Schema({
  candidate_email: { type: String, required: true },
  job_id: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSED'], 
    default: 'PENDING' 
  },
  ket_qua_cuoi: { 
    type: String, 
    enum: ['PASSED', 'FAILED', null], 
    default: null 
  },
  result: {
    score: Number,
    feedback: String,
  },
  created_at: { type: Date, default: Date.now },
});

// Kiểm tra nếu model đã tồn tại thì dùng lại, tránh lỗi ghi đè model trong Next.js
export const Application = models.Application || model('Application', ApplicationSchema, 'applications');