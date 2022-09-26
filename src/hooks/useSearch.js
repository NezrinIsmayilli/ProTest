/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';

/**
 * @description Simple filter hook
 * @param {[Object]} data array of data
 * @param {[String]} keys keys for index and search
 */
export function useSearch(data, keys) {
  const fuse = useRef();

  fuse.current = new Fuse(data, { keys });

  const [result, setResult] = useState([]);

  const searchTouched = useRef(false);

  const handleSearch = useCallback(
    value => {
      if (value) {
        searchTouched.current = true;
        setResult(fuse.current.search(value));
      } else {
        setResult(data);
      }
    },
    [data.length, fuse.current]
  );

  useEffect(() => {
    setResult(data);
  }, [data.length]);

  return {
    result,
    handleSearch,
    searchTouched: searchTouched.current,
  };
}
