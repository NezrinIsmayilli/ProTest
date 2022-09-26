/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useContext,
  createContext,
  useMemo,
  useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
import { useFilterHandle } from 'hooks';
import {
  fetchAnnouncements,
  resetAnnouncementsData,
} from 'store/actions/jobs/announcements';

import { useLoadMore } from 'containers/Jobs/Shared/loadMoreHook';

const FiltersContext = createContext(null);

function FiltersContextProvider(props) {
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const { bookmarked } = props;
  const dispatch = useDispatch();

  const initalFilters = {
    bookmarked,
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

  const [filters, onFilter, setFilters] = useFilterHandle(
    initalFilters,
    ({ filters }) => {
      dispatch(fetchAnnouncements({ filters }));
      resetPage();
    }
  );

  const [loadMore, resetPage] = useLoadMore(fetchAnnouncements, filters);
  // on route change set bookmarked and reset announcements
  useEffect(() => {
    const newFilters = {
      ...initalFilters,
      bookmarked,
    };
    setFilters(newFilters);
    dispatch(resetAnnouncementsData());
  }, [bookmarked]);

  const value = useMemo(
    () => ({
      filters,
      onFilter,
      loadMore,
      setPageSize,
      setCurrentPage,
      pageSize,
      currentPage,
      bookmarked,
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

  return <FiltersContext.Provider value={value} {...props} />;
}

function useFilters() {
  const context = useContext(FiltersContext);

  if (context === undefined) {
    throw Error('useFilters must be used within a provider');
  }

  return context;
}

export { useFilters, FiltersContextProvider };
