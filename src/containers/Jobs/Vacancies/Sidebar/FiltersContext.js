import React, { useState, useContext, createContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchVacancies } from 'store/actions/jobs/vacancies';

import { useLoadMore } from 'containers/Jobs/Shared/loadMoreHook';

const VacanciesFiltersContext = createContext(null);

function VacanciesFiltersContextProvider(props) {
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

  const dispatch = useDispatch();

  const [filters, onFilter] = useFilterHandle(initialFilters, ({ filters }) => {
    dispatch(fetchVacancies({ filters }));
    resetPage();
  });

  const [loadMore, resetPage] = useLoadMore(fetchVacancies, filters);

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

  return <VacanciesFiltersContext.Provider value={value} {...props} />;
}

function useVacanciesFilters() {
  const context = useContext(VacanciesFiltersContext);

  if (context === undefined) {
    throw Error('useVacanciesFilters must be used within a provider');
  }

  return context;
}

export { useVacanciesFilters, VacanciesFiltersContextProvider };
