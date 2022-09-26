import React from 'react';
import { Sidebar as SidebarLayout } from 'components/Lib';

import {
  WorkGraphicStatusData,
  // FamilyStatusData,
  // ExperienceStatusData,
  EducationStatusData,
  GenderStatusData,
} from 'utils';

// Filter components
import {
  AgeFilter,
  ExperienceFilter,
  LanguageFilter,
  PositionFilter,
  RegionFilter,
  SalaryFilter,
  CommonFilterComponent,
  DateRangeFilter,
} from '../../Shared/Filters';

// vacancy filter shared context
import { useVacanciesFilters } from './FiltersContext';

function Sidebar() {
  const { filters, onFilter } = useVacanciesFilters();
  const {
    fromDate,
    toDate,
    city,
    category,
    position,
    fromAge,
    toAge,
    minExperience,
    maxExperience,
    gender,
    salary,
    // experience,
    education,
    language,
    // familyStatus,
    workGraphic,
  } = filters;

  return (
    <SidebarLayout title="Vakansiyalar">
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

      <CommonFilterComponent
        label="Cinsi"
        data={GenderStatusData}
        filterName="gender"
        filterValue={gender}
        onFilter={onFilter}
        placeholder="Seçin"
      />

      <SalaryFilter salary={salary} onFilter={onFilter} />

      <AgeFilter fromAge={fromAge} toAge={toAge} onFilter={onFilter} />

      <ExperienceFilter
        minExperience={minExperience}
        maxExperience={maxExperience}
        onFilter={onFilter}
      />

      <CommonFilterComponent
        label="Təhsil"
        mode="multiple"
        filterName="education"
        data={EducationStatusData}
        filterValue={education}
        onFilter={onFilter}
        placeholder="Seçin"
      />

      <LanguageFilter language={language} onFilter={onFilter} />

      {/* <CommonFilterComponent
        label="Ailə vəziyyəti"
        filterName="familyStatus"
        data={FamilyStatusData}
        filterValue={familyStatus}
        onFilter={onFilter}
      /> */}

      <CommonFilterComponent
        label="İş qrafiki"
        mode="multiple"
        data={WorkGraphicStatusData}
        filterName="workGraphic"
        filterValue={workGraphic}
        onFilter={onFilter}
        placeholder="Seçin"
      />
    </SidebarLayout>
  );
}

export default Sidebar;
