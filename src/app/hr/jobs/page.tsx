import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { PlusCircle, Calendar, Users, MapPin } from 'lucide-react';

export default async function HrJobsPage() {
  const session = await getSession();
  await connectDB();

  const jobs = await Job.find({ created_by: session!.userId }).sort({ created_at: -1 }).lean();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin tuyển dụng</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} tin đã đăng</p>
        </div>
        <Link
          href="/hr/jobs/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Đăng tin mới
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <PlusCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Bạn chưa đăng tin nào.</p>
          <Link href="/hr/jobs/new" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
            Đăng tin ngay →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job: any) => {
            const isOpen = job.status === 'OPEN';
            const deadline = new Date(job.deadline);
            const overdue = deadline < new Date();
            return (
              <Link
                key={job._id.toString()}
                href={`/hr/jobs/${job._id.toString()}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">{job.title}</h2>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {job.quota} vị trí cần tuyển
                  </div>
                  <div className={`flex items-center gap-1.5 ${overdue ? 'text-red-500' : ''}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Hạn: {deadline.toLocaleDateString('vi-VN')}
                    {overdue && ' (Đã hết hạn)'}
                  </div>
                </div>
                {job.salary_range && (
                  <div className="text-sm font-medium text-blue-600">{job.salary_range}</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
