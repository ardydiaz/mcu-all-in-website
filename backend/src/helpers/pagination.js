export function paginate(items, page = 1, limit = 20) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const start = (currentPage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    meta: { page: currentPage, limit: pageSize, total: items.length, pages: Math.ceil(items.length / pageSize) },
  };
}
