import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

const PAGE_SIZE = 12;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; page?: string }>;
}) {
  const { q, location, page: pageParam } = await searchParams;
  const session = await getSession();
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  await connectDB();

  const filter: Record<string, unknown> = { status: 'OPEN' };
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (location) filter.location = { $regex: location, $options: 'i' };

  const [total, jobs, allLocations] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Job.distinct('location', { status: 'OPEN' }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : '/jobs';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Khám phá cơ hội nghề nghiệp
            </h1>
            <p className="text-gray-400 text-sm">
              {total} vị trí đang tuyển dụng · Tìm công việc phù hợp với bạn
            </p>
          </div>

          {/* Search form */}
          <form method="GET" className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Vị trí, từ khóa..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              />
            </div>
            <div className="relative sm:w-52">
              <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                name="location"
                defaultValue={location}
                className="w-full appearance-none pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Tất cả địa điểm</option>
                {allLocations.map((loc: string) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm shrink-0"
            >
              Tìm kiếm
            </button>
            {(q || location) && (
              <Link
                href="/jobs"
                className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition flex items-center"
              >
                Xóa
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {jobs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Không tìm thấy vị trí phù hợp</p>
            {(q || location) && (
              <Link
                href="/jobs"
                className="mt-3 inline-block text-blue-600 hover:underline text-sm"
              >
                Xóa bộ lọc
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => {
              const deadline = new Date(job.deadline);
              const isOverdue = deadline < new Date();
              return (
                <Link
                  key={job._id.toString()}
                  href={`/jobs/${job._id.toString()}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition group"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-900 text-[15px] group-hover:text-blue-600 transition">
                        {job.title}
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                        {job.department}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />{job.quota} vị trí
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <DollarSign className="w-3.5 h-3.5" />{job.salary_range}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {isOverdue ? 'Đã hết hạn · ' : ''}
                        {deadline.toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {(session?.role === 'client' || !session) && (
                    <span className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold group-hover:bg-blue-700 transition">
                      Ứng tuyển →
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <Link
                  href={buildUrl(page - 1)}
                  className={`p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition ${page === 1 ? 'pointer-events-none opacity-30' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`e-${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
                    ) : (
                      <Link
                        key={p}
                        href={buildUrl(p as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium border transition ${
                          page === p
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
                <Link
                  href={buildUrl(page + 1)}
                  className={`p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition ${page === totalPages ? 'pointer-events-none opacity-30' : ''}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
