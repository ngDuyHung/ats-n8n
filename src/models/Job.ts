import mongoose, { Schema, model } from 'mongoose';

const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  salary_range: { type: String },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN',
  },
  quota: { type: Number, required: true, min: 1 },
  cover_image: { type: String },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
});

// Delete cached model in dev so schema changes take effect without full restart
if (mongoose.models.Job) delete mongoose.models.Job;

export const Job = model('Job', JobSchema, 'jobs');
