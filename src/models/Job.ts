import mongoose, { Schema, model, models } from 'mongoose';

const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // Nội dung JD đầy đủ
  department: { type: String, required: true },
  location: { type: String, required: true },
  salary_range: { type: String },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN',
  },
  quota: { type: Number, required: true, min: 1 }, // Số lượng cần tuyển
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
});

export const Job = models.Job || model('Job', JobSchema, 'jobs');
