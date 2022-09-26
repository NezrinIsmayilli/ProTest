import React, { useState, useEffect } from 'react';
import { JobsSidebarItemWrapper, ProInput } from 'components/Lib';
import { useDebounce } from 'use-debounce';

function TgPriceFilter({ minPrice, maxPrice, onFilter }) {
  const [minPriceValue, setMinPriceValue] = useState(minPrice);
  const [maxPriceValue, setMaxPriceValue] = useState(maxPrice);

  const [min] = useDebounce(minPriceValue, 600);
  const [max] = useDebounce(maxPriceValue, 600);

  useEffect(() => {
    if (min !== minPrice) {
      onFilter('minPrice', min);
    }
  }, [min, minPrice, onFilter]);

  useEffect(() => {
    if (max !== maxPrice) {
      onFilter('maxPrice', max);
    }
  }, [max, maxPrice, onFilter]);

  return (
    <JobsSidebarItemWrapper label="Təlimin qiyməti">
      <div style={{ display: 'flex' }}>
        <ProInput
          value={minPriceValue || ''}
          onChange={e =>
            e.target.value.length < 4 && setMinPriceValue(e.target.value)
          }
          placeholder="Dan"
          maxLength={9}
        />
        <ProInput
          value={maxPriceValue || ''}
          onChange={e =>
            e.target.value.length < 4 && setMaxPriceValue(e.target.value)
          }
          placeholder="Dək"
          maxLength={9}
        />
      </div>
    </JobsSidebarItemWrapper>
  );
}

export default React.memo(TgPriceFilter);
