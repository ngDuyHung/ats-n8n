import { connectDB } from '@/lib/db';
import { HrRequest } from '@/models/HrRequest';
import { User } from '@/models/User';
import { HrRequestTable } from '@/components/admin/HrRequestTable';
import { Clock } from 'lucide-react';

export default async function HrRequestsPage() {
  await connectDB();

  const raw = await HrRequest.find().sort({ created_at: -1 }).lean();

  // Lấy thông tin user cho từng request
  const userIds = raw.map((r) => r.user_id);
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name email')
    .lean();

  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  const requests = raw.map((r) => ({
    _id: r._id.toString(),
    user_name: userMap[r.user_id.toString()]?.name ?? 'Không rõ',
    user_email: userMap[r.user_id.toString()]?.email ?? '',
    company_name: r.company_name,
    company_website: r.company_website ?? '',
    reason: r.reason,
    status: r.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    created_at: r.created_at.toISOString(),
  }));

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu trở thành HR</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Duyệt hoặc từ chối đơn đăng ký nhà tuyển dụng
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="ml-auto flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            {pendingCount} đang chờ
          </span>
        )}
      </div>

      <HrRequestTable requests={requests} />
    </div>
  );
}
