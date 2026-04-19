import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

// POST /api/seed  — Tạo tài khoản admin lần đầu
// Header: Authorization: Bearer <SEED_SECRET>
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.SEED_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const email = process.env.ADMIN_SEED_EMAIL || 'admin@ats.local';
    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json({ message: 'Admin đã tồn tại.', email });
    }

    const rawPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!rawPassword) {
      return NextResponse.json({ error: 'ADMIN_SEED_PASSWORD chưa được đặt trong .env.local' }, { status: 500 });
    }

    const hashed = await bcrypt.hash(rawPassword, 12);
    await User.create({ name: 'Admin', email, password: hashed, role: 'admin' });

    return NextResponse.json({ message: 'Admin đã được tạo thành công.', email });
  } catch (error) {
    console.error('[SEED ERROR]', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
