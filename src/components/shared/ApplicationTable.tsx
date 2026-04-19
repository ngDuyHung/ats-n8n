'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export type AppRow = {
  id: string;
  candidate_email: string;
  candidate_name?: string;
  job_id: string;
  job_title?: string; // join từ Job collection
  score: number | null;
  feedback?: string;
  status: string;
  ket_qua_cuoi: string | null;
  created_at: string;
};

type Props = {
  apps: AppRow[];
  showJobColumn?: boolean; // hr/admin đều cần; job detail page thì ẩn
  pageSize?: number;
};

const PAGE_SIZE_DEFAULT = 15;

export function ApplicationTable({ apps, showJobColumn = true, pageSize = PAGE_SIZE_DEFAULT }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = apps;

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.candidate_email.toLowerCase().includes(q) ||
          (a.candidate_name ?? '').toLowerCase().includes(q) ||
          (a.job_title ?? '').toLowerCase().includes(q) ||
          a.job_id.toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'PASSED') data = data.filter((a) => a.ket_qua_cuoi === 'PASSED');
    else if (filterStatus === 'FAILED') data = data.filter((a) => a.ket_qua_cuoi === 'FAILED');
    else if (filterStatus === 'PENDING') data = data.filter((a) => !a.ket_qua_cuoi);

    if (filterScore === '80+') data = data.filter((a) => (a.score ?? 0) >= 80);
    else if (filterScore === '70+') data = data.filter((a) => (a.score ?? 0) >= 70);
    else if (filterScore === '<70') data = data.filter((a) => (a.score ?? 0) < 70 && a.score !== null);

    return data;
  }, [apps, search, filterStatus, filterScore]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }
  function handleStatus(val: string) {
    setFilterStatus(val);
    setPage(1);
  }
  function handleScore(val: string) {
    setFilterScore(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm email, tên, vị trí..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => handleStatus(e.target.value)}
            className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Tất cả kết quả</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="PASSED">PASSED</option>
            <option value="FAILED">FAILED</option>
          </select>
          <select
            value={filterScore}
            onChange={(e) => handleScore(e.target.value)}
            className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Mọi điểm</option>
            <option value="80+">≥ 80</option>
            <option value="70+">≥ 70</option>
            <option value="<70">&lt; 70</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        {filtered.length} kết quả{filtered.length !== apps.length && ` (lọc từ ${apps.length})`}
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">Email / Tên</th>
                {showJobColumn && <th className="p-4">Vị trí</th>}
                <th className="p-4 text-center">Điểm AI</th>
                <th className="p-4">Nhận xét</th>
                <th className="p-4 text-center">Kết quả</th>
                <th className="p-4">Ngày nộp</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((app) => (
                <tr key={app.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{app.candidate_email}</p>
                    {app.candidate_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{app.candidate_name}</p>
                    )}
                  </td>
                  {showJobColumn && (
                    <td className="p-4 text-sm text-blue-600 font-medium max-w-[180px] truncate">
                      {app.job_title ?? app.job_id}
                    </td>
                  )}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        app.score === null
                          ? 'bg-gray-100 text-gray-400'
                          : app.score >= 80
                          ? 'bg-green-100 text-green-700'
                          : app.score >= 70
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {app.score ?? 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs">
                    <p className="line-clamp-2">{app.feedback ?? '—'}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        app.ket_qua_cuoi === 'PASSED'
                          ? 'bg-green-500 text-white'
                          : app.ket_qua_cuoi === 'FAILED'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {app.ket_qua_cuoi ?? 'CHỜ DUYỆT'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(app.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={showJobColumn ? 6 : 5} className="p-12 text-center text-gray-400 text-sm">
                    Không có kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Trang {currentPage} / {totalPages} &bull; {filtered.length} hồ sơ
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        currentPage === p
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
