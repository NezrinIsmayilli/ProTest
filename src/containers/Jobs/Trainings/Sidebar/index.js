import React from 'react';
import {
  JobsSidebarItemWrapper,
  Sidebar as SidebarLayout,
} from 'components/Lib';

// Filter components
import { Checkbox } from 'antd';
import {
  TgDirectionFilter,
  LanguageFilter,
  TgPriceFilter,
  TgFormatsFilter,
  TgStationFilter,
  DateRangeFilter,
} from '../../Shared/Filters';

// vacancy filter shared context
import { useTrainingsFilters } from './FiltersContext';

function Sidebar() {
  const { filters, onFilter } = useTrainingsFilters();
  const {
    fromDate,
    toDate,
    category,
    direction,
    minPrice,
    maxPrice,
    format,
    language,
    station,
  } = filters;

  function handleGenderCheckbox(event) {
    const { name } = event.target;
    const certification = name === filters.certification ? undefined : name;
    onFilter('certification', certification);
  }

  function handlePriceCheckbox(event) {
    const { name } = event.target;
    const free = name === filters.free ? undefined : name;
    onFilter('free', free);
  }
  return (
    <SidebarLayout title="Təlimlər">
      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFilter={onFilter}
      />
      <TgDirectionFilter
        category={category}
        direction={direction}
        onFilter={onFilter}
      />
      <JobsSidebarItemWrapper label="Ödəniş forması">
        <Checkbox
          checked={filters.free === '0'}
          onChange={handlePriceCheckbox}
          name="0"
        >
          Ödənişlı
        </Checkbox>
        <Checkbox
          checked={filters.free === '1'}
          onChange={handlePriceCheckbox}
          name="1"
        >
          Ödənişsiz
        </Checkbox>
      </JobsSidebarItemWrapper>

      <TgPriceFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onFilter={onFilter}
      />
      <TgFormatsFilter format={format} onFilter={onFilter} />
      <LanguageFilter language={language} onFilter={onFilter} />

      <JobsSidebarItemWrapper label="Sertifikatlaşdırma">
        <Checkbox
          checked={filters.certification === '0'}
          onChange={handleGenderCheckbox}
          name="0"
        >
          Bəli
        </Checkbox>
        <Checkbox
          checked={filters.certification === '1'}
          onChange={handleGenderCheckbox}
          name="1"
        >
          Xeyr
        </Checkbox>
      </JobsSidebarItemWrapper>

      <TgStationFilter station={station} onFilter={onFilter} />
    </SidebarLayout>
  );
}

export default Sidebar;
