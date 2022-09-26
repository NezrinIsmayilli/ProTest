import React, { useState, useContext, createContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchTrainings } from 'store/actions/jobs/training';

import { useLoadMore } from 'containers/Jobs/Shared/loadMoreHook';

const TrainingsFiltersContext = createContext(null);

function TrainingsFiltersContextProvider(props) {
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const initialFilters = {
    // status: Status (Active, Disabled, Waiting)
    // Allowed values: 1, 2, 3
    status: 3,
    owner: 1,
    isActive: undefined,
    limit: pageSize,
    page: currentPage,

    category: undefined,
    direction: undefined,
    free: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    format: undefined,
    language: undefined,
    certification: undefined,
    station: undefined,
  };

  const dispatch = useDispatch();

  const [filters, onFilter] = useFilterHandle(initialFilters, ({ filters }) => {
    dispatch(fetchTrainings({ filters }));
    resetPage();
  });

  const [loadMore, resetPage] = useLoadMore(fetchTrainings, filters);

  const value = useMemo(
    () => ({
      filters,
      onFilter,
      loadMore,
      setPageSize,
      setCurrentPage,
      pageSize,
      currentPage,
    }),
    [
      filters,
      onFilter,
      loadMore,
      setPageSize,
      setCurrentPage,
      pageSize,
      currentPage,
    ]
  );

  return <TrainingsFiltersContext.Provider value={value} {...props} />;
}

function useTrainingsFilters() {
  const context = useContext(TrainingsFiltersContext);

  if (context === undefined) {
    throw Error('useTrainingsFilters must be used within a provider');
  }

  return context;
}

export { useTrainingsFilters, TrainingsFiltersContextProvider };
