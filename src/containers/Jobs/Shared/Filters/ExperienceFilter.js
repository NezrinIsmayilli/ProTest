import React, { useState, useEffect } from 'react';
import { JobsSidebarItemWrapper, ProInput } from 'components/Lib';
import { useDebounce } from 'use-debounce';

function ExperienceFilter({ minExperience, maxExperience, onFilter }) {
  const [minExperienceValue, setMinExperienceValue] = useState(minExperience);
  const [maxExperienceValue, setMaxExperienceValue] = useState(maxExperience);

  const [min] = useDebounce(minExperienceValue, 600);
  const [max] = useDebounce(maxExperienceValue, 600);

  useEffect(() => {
    if (min !== minExperience) {
      onFilter('minExperience', min);
    }
  }, [min, minExperience, onFilter]);

  useEffect(() => {
    if (max !== maxExperience) {
      onFilter('maxExperience', max);
    }
  }, [max, maxExperience, onFilter]);

  return (
    <JobsSidebarItemWrapper label="İş təcrübəsi">
      <div style={{ display: 'flex' }}>
        <ProInput
          value={minExperienceValue || ''}
          onChange={e =>
            e.target.value.length < 4 && setMinExperienceValue(e.target.value)
          }
          placeholder="Dan"
        />
        <ProInput
          value={maxExperienceValue || ''}
          onChange={e =>
            e.target.value.length < 4 && setMaxExperienceValue(e.target.value)
          }
          placeholder="Dək"
        />
      </div>
    </JobsSidebarItemWrapper>
  );
}

export default React.memo(ExperienceFilter);
