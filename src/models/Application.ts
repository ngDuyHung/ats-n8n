import mongoose, { Schema, model, models } from 'mongoose';

const ApplicationSchema = new Schema({
  candidate_email: { type: String, required: true },
  candidate_name: { type: String },           // Thêm Sprint 4
  candidate_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Thêm Sprint 4
  job_id: { type: String, required: true },
  cv_filename: { type: String },              // Thêm Sprint 4
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