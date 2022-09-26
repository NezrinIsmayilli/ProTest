import React, { useState, useEffect } from 'react';
import { JobsSidebarItemWrapper, ProInput } from 'components/Lib';
import { useDebounce } from 'use-debounce';

function AgeFilter({ fromAge, toAge, onFilter }) {
  const [fromAgeValue, setFromAgeValue] = useState(fromAge);
  const [toAgeValue, setToAgeValue] = useState(toAge);

  const [min] = useDebounce(fromAgeValue, 600);
  const [max] = useDebounce(toAgeValue, 600);

  useEffect(() => {
    if (min !== fromAge) {
      onFilter('fromAge', min);
    }
  }, [min, fromAge, onFilter]);

  useEffect(() => {
    if (max !== toAge) {
      onFilter('toAge', max);
    }
  }, [max, toAge, onFilter]);

  return (
    <JobsSidebarItemWrapper label="Yaş həddi">
      <div style={{ display: 'flex' }}>
        <ProInput
          value={fromAgeValue || ''}
          onChange={e =>
            e.target.value.length < 4 && setFromAgeValue(e.target.value)
          }
          placeholder="Dan"
        />
        <ProInput
          value={toAgeValue || ''}
          onChange={e =>
            e.target.value.length < 4 && setToAgeValue(e.target.value)
          }
          placeholder="Dək"
        />
      </div>
    </JobsSidebarItemWrapper>
  );
}

export default React.memo(AgeFilter);
