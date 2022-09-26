import React, { useState, useEffect } from 'react';
import { JobsSidebarItemWrapper, ProInput } from 'components/Lib';
import { useDebounce } from 'use-debounce';

function ExperienceFilter({ minSalary, maxSalary, onFilter }) {
  const [minSalaryValue, setMinSalaryValue] = useState(minSalary);
  const [maxSalaryValue, setMaxSalaryValue] = useState(maxSalary);

  const [min] = useDebounce(minSalaryValue, 600);
  const [max] = useDebounce(maxSalaryValue, 600);

  useEffect(() => {
    if (min !== minSalary) {
      onFilter('minSalary', min);
    }
  }, [min, minSalary, onFilter]);

  useEffect(() => {
    if (max !== maxSalary) {
      onFilter('maxSalary', max);
    }
  }, [max, maxSalary, onFilter]);

  return (
    <JobsSidebarItemWrapper label="Əmək haqqı">
      <div style={{ display: 'flex' }}>
        <ProInput
          value={minSalaryValue || ''}
          onChange={e => setMinSalaryValue(e.target.value)}
          placeholder="Dan"
          maxLength={9}
        />
        <ProInput
          value={maxSalaryValue || ''}
          onChange={e => setMaxSalaryValue(e.target.value)}
          placeholder="Dək"
          maxLength={9}
        />
      </div>
    </JobsSidebarItemWrapper>
  );
}

export default React.memo(ExperienceFilter);
