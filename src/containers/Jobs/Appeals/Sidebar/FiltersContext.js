import React, { useState, useContext, createContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useFilterHandle } from 'hooks';
import { fetchAppeals } from 'store/actions/jobs/appeals';

import { useLoadMore } from 'containers/Jobs/Shared/loadMoreHook';

import { AppealRoutesStatus } from 'utils/jobsStatusConstants';

const AppealsFiltersContext = createContext(null);

function AppealsFiltersContextProvider(props) {
  const dispatch = useDispatch();

  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const params = useParams();
  const route = params[0];

  const initialFilters = {
    status: AppealRoutesStatus[route],
    limit: pageSize,
    page: currentPage,
    city: undefined,
    category: undefined,
    position: undefined,
    fromAge: undefined,
    toAge: undefined,
    gender: undefined,
    salary: undefined,
    currency: undefined,
    experience: undefined,
    education: undefined,
    language: undefined,
    familyStatus: undefined,
    workGraphic: undefined,
    minExperience: undefined,
    maxExperience: undefined,
  };

  const [filters, onFilter] = useFilterHandle(initialFilters, ({ filters }) => {
    dispatch(fetchAppeals({ filters, attribute: { route } }));
    resetPage();
  });

  const [loadMore, resetPage] = useLoadMore(
    ({ filters }) => dispatch(fetchAppeals({ filters, attribute: { route } })),
    filters
  );

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

  return <AppealsFiltersContext.Provider value={value} {...props} />;
}

function useAppealsFilters() {
  const context = useContext(AppealsFiltersContext);

  if (context === undefined) {
    throw Error('useAppealsFilters must be used within a provider');
  }

  return context;
}

export { useAppealsFilters, AppealsFiltersContextProvider };
