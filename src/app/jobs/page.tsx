import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import {
  MapPin,
  Users,
  DollarSign,
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  Megaphone,
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

  const [total, jobs, allLocations, totalAll] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Job.distinct('location', { status: 'OPEN' }),
    Job.countDocuments({ status: 'OPEN' }),
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

  const isFiltered = !!(q || location);

  // Ad placeholder component content
  const AdPlaceholder = ({ label }: { label: string }) => (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-5 text-center">
      <Megaphone className="w-6 h-6 text-gray-300 mx-auto mb-2" />
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-[10px] text-gray-300 mt-1">Quảng cáo</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 pt-12 pb-10">
          <div className="mb-7 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              {totalAll} vị trí đang mở tuyển dụng
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
              Khám phá cơ hội <br className="sm:hidden" />nghề nghiệp
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Tìm công việc phù hợp với kỹ năng và đam mê của bạn
            </p>
          </div>

          {/* Search form */}
          <form method="GET" className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Vị trí, kỹ năng, từ khóa..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-300 outline-none text-sm bg-white text-gray-900 shadow-lg"
              />
            </div>
            <div className="relative sm:w-48">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <select
                name="location"
                defaultValue={location}
                className="w-full appearance-none pl-11 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-blue-300 outline-none text-sm bg-white text-gray-900 shadow-lg"
              >
                <option value="">Tất cả địa điểm</option>
                {allLocations.map((loc: string) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition text-sm shrink-0 shadow-lg"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex gap-5">

          {/* Left ad sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-52 shrink-0">
            <div className="sticky top-20 space-y-4">
              <AdPlaceholder label="Banner quảng cáo 240×300" />
              <AdPlaceholder label="Banner quảng cáo 240×200" />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Result info */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                {isFiltered ? (
                  <>
                    Tìm thấy{' '}
                    <span className="font-semibold text-gray-900">{total}</span> kết quả
                    {q && <> cho &ldquo;<span className="text-blue-600">{q}</span>&rdquo;</>}
                  </>
                ) : (
                  <><span className="font-semibold text-gray-900">{total}</span> vị trí tuyển dụng</>
                )}
              </div>
              {isFiltered && (
                <Link href="/jobs" className="text-sm text-blue-600 hover:underline">Xóa bộ lọc</Link>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Không tìm thấy vị trí phù hợp</p>
                <p className="text-gray-400 text-sm">Hãy thử tìm kiếm với từ khóa khác</p>
                {isFiltered && (
                  <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline text-sm font-medium">
                    Xem tất cả việc làm
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Job card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobs.map((job: any) => {
                    const deadline = new Date(job.deadline);
                    const isOverdue = deadline < new Date();
                    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const createdDaysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));

                    const gradients = [
                      'from-blue-500 to-blue-700',
                      'from-purple-500 to-purple-700',
                      'from-emerald-500 to-emerald-700',
                      'from-orange-500 to-orange-700',
                      'from-rose-500 to-rose-700',
                      'from-cyan-500 to-cyan-700',
                    ];
                    const gradIdx = (job.department?.charCodeAt(0) ?? 0) % gradients.length;

                    // Badge priority: Gấp > Mới > HOT
                    const badge = !isOverdue && daysLeft <= 5
                      ? { label: 'Gấp', cls: 'bg-orange-100 text-orange-600' }
                      : createdDaysAgo <= 3
                      ? { label: 'Mới', cls: 'bg-blue-100 text-blue-600' }
                      : job.quota >= 3
                      ? { label: 'HOT', cls: 'bg-rose-100 text-rose-600' }
                      : null;

                    return (
                      <Link
                        key={job._id.toString()}
                        href={`/jobs/${job._id.toString()}`}
                        className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition group flex flex-row gap-4 items-start"
                      >
                        {/* Left: company logo/image */}
                        <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${gradients[gradIdx]} flex items-center justify-center`}>
                          {job.cover_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={job.cover_image}
                              alt={job.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-7 h-7 text-white/80" />
                          )}
                        </div>

                        {/* Right: content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          {/* Title + badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-blue-600 transition">
                              {job.title}
                            </h2>
                            {badge && (
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>

                          {/* Department */}
                          <p className="text-xs text-gray-400 truncate">{job.department}</p>

                          {/* Footer: salary + location */}
                          <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-gray-50">
                            <span className={`text-sm font-bold truncate ${job.salary_range ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {job.salary_range || 'Thỏa thuận'}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="max-w-[90px] truncate">{job.location}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-6">
                    <Link
                      href={buildUrl(page - 1)}
                      className={`p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition ${page === 1 ? 'pointer-events-none opacity-30' : ''}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce<(number | '...')[]>((acc, p, idx2, arr) => {
                        if (idx2 > 0 && p - (arr[idx2 - 1] as number) > 1) acc.push('...');
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
                              page === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
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
              </>
            )}
          </main>

          {/* Right ad sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-52 shrink-0">
            <div className="sticky top-20 space-y-4">
              <AdPlaceholder label="Banner quảng cáo 240×300" />
              <AdPlaceholder label="Banner quảng cáo 240×200" />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
