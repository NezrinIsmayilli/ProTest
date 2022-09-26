import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

export function useLoadMore(handleFunc, filters) {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  const loadMore = useCallback(() => setPage(page => page + 1), []);
  const resetPage = useCallback(() => setPage(1), []);

  useEffect(() => {
    if (page > 1) {
      dispatch(handleFunc({ filters: { ...filters, page } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return [loadMore, resetPage];
}
