import React from 'react';
import { Sidebar as SidebarLayout } from 'components/Lib';

import {
  WorkGraphicStatusData,
  // FamilyStatusData,
  // ExperienceStatusData,
  EducationStatusData,
  GenderStatusData,
} from 'utils';

// vacancy filter shared context
import { useAppealsFilters } from './FiltersContext';

// Filter components
import {
  DateRangeFilter,
  AgeFilter,
  ExperienceFilter,
  LanguageFilter,
  PositionFilter,
  RegionFilter,
  SalaryFilter,
  CommonFilterComponent,
  CurrencyFilter,
} from '../../Shared/Filters';

export default function Sidebar() {
  const { filters, onFilter } = useAppealsFilters();
  const {
    city,
    category,
    position,
    fromAge,
    toAge,
    fromDate,
    toDate,
    gender,
    salary,
    // experience,
    minExperience,
    maxExperience,
    education,
    language,
    // familyStatus,
    workGraphic,
  } = filters;

  return (
    <SidebarLayout title="Müraciətlər">
      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFilter={onFilter}
      />

      <PositionFilter
        category={category}
        position={position}
        onFilter={onFilter}
      />

      <RegionFilter onFilter={onFilter} city={city} />

      {/* <CommonFilterComponent
        label="Cinsi"
        data={GenderStatusData}
        filterName="gender"
        filterValue={gender}
        onFilter={onFilter}
        placeholder="Seçin"
      /> */}

      {/* <AgeFilter fromAge={fromAge} toAge={toAge} onFilter={onFilter} />

      <SalaryFilter salary={salary} onFilter={onFilter} />

      <CurrencyFilter onFilter={onFilter} />

      <ExperienceFilter
        minExperience={minExperience}
        maxExperience={maxExperience}
        onFilter={onFilter}
      /> */}

      {/* <CommonFilterComponent
        label="Təhsil"
        mode="multiple"
        filterName="education"
        data={EducationStatusData}
        filterValue={education}
        onFilter={onFilter}
        placeholder="Seçin"
      /> */}

      {/* <LanguageFilter language={language} onFilter={onFilter} /> */}

      {/* <CommonFilterComponent
        label="Ailə vəziyyəti"
        filterName="familyStatus"
        data={FamilyStatusData}
        filterValue={familyStatus}
        onFilter={onFilter}
      /> */}

      {/* <CommonFilterComponent
        label="İş qrafiki"
        mode="multiple"
        data={WorkGraphicStatusData}
        filterName="workGraphic"
        filterValue={workGraphic}
        onFilter={onFilter}
        placeholder="Seçin"
      /> */}
    </SidebarLayout>
  );
}
