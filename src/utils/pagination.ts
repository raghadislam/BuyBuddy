const MAX_LIMIT = 100;

export type Page = { page?: number; limit?: number };
export const normalizePage = ({ page = 1, limit = 20 }: Page = {}) => {
  const p = Math.max(1, Math.min(page, 10_000));
  const l = Math.max(1, Math.min(limit, MAX_LIMIT));
  return { page: p, limit: l, skip: (p - 1) * l, take: l };
};
