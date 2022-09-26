import { useEffect } from 'react';
import { useQuery } from './useQuery';

export function useSourceFromQuery() {
  const { source } = useQuery();

  useEffect(() => {
    window.localStorage.setItem('source', source);
  }, [source]);
}
