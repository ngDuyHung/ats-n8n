import mongoose, { Schema, model, models } from 'mongoose';

const HrRequestSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company_name: { type: String, required: true },
  company_website: { type: String },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  reviewed_by: { type: Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
});

export const HrRequest = models.HrRequest || model('HrRequest', HrRequestSchema, 'hr_requests');
