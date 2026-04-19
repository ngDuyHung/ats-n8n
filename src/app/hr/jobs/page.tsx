import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { Calendar, Users, MapPin, DollarSign, FileText } from 'lucide-react';

export default async function HrJobsPage() {
  const session = await getSession();
  await connectDB();

  const jobs = await Job.find({ created_by: session!.userId })
    .sort({ created_at: -1 })
    .lean();

  // Get application counts per job
  const jobIds = jobs.map((j: any) => j._id.toString());
  const appCounts = await Application.aggregate([
    { $match: { job_id: { $in: jobIds } } },
    { $group: { _id: '$job_id', count: { $sum: 1 } } },
  ]);
  const appCountMap = Object.fromEntries(appCounts.map((a: any) => [a._id, a.count]));

  const now = new Date();
  const openCount = jobs.filter((j: any) => j.status === 'OPEN').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Quản lý tuyển dụng
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Tin tuyển dụng</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
            {openCount} đang mở · {jobs.length} tổng
          </span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-gray-600 font-medium">Bạn chưa đăng tin nào</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Bắt đầu bằng cách đăng tin tuyển dụng đầu tiên</p>
          <Link
            href="/hr/jobs/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Đăng tin ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job: any) => {
            const isOpen = job.status === 'OPEN';
            const deadline = new Date(job.deadline);
            const overdue = deadline < now;
            const expiringSoon =
              !overdue &&
              isOpen &&
              deadline.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;
            const count = appCountMap[job._id.toString()] ?? 0;

            return (
              <Link
                key={job._id.toString()}
                href={`/hr/jobs/${job._id.toString()}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition flex flex-col gap-3 group"
              >
                {/* Top row: title + status */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition">
                    {job.title}
                  </h2>
                  <span
                    className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isOpen ? '● OPEN' : '○ CLOSED'}
                  </span>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {job.location} · {job.department}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    {job.quota} vị trí cần tuyển
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      overdue ? 'text-red-500' : expiringSoon ? 'text-amber-600' : ''
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {overdue ? 'Đã hết hạn · ' : expiringSoon ? 'Sắp hết hạn · ' : ''}
                    {deadline.toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Bottom row: salary + app count */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {job.salary_range ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary_range}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">Chưa có mức lương</span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      count > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {count} ứng viên
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
