import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
// components
import { Row, Col } from 'antd';
// shared
import { currentYear, currentMonth } from 'utils/constants';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchHrmPenalties } from 'store/actions/hrm/fines';
import { useFilterHandle } from 'hooks';
import { NavigationButtons } from '../#shared';
// main components
import FinesTable from './Table/index';
import FinesDetails from './Details/index';
import SettingsPanel from './SettingsPanel';
import FinesSidebar from './Sidebar';

function Fines(props) {
  const {
    fetchHrmPenalties,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;
  const [yearAndMonth, setYearAndMonth] = useState({
    year: currentYear,
    month: currentMonth,
  });
  const [filters, onFilter] = useFilterHandle(
    {
      isChief: undefined,
      structure: undefined,
      occupation: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
      orderBy: undefined,
      order: undefined,
    },
    ({ filters }) => {
      fetchHrmPenalties({
        year: yearAndMonth.year,
        month: yearAndMonth.month,
        filters,
      });
    }
  );
  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);
  return (
    <section>
      <FinesSidebar
        filters={filters}
        onFilter={onFilter}
        businessUnits={businessUnits}
        profile={profile}
        yearAndMonth={yearAndMonth}
        setYearAndMonth={setYearAndMonth}
      />

      <section className="scrollbar aside" id="penalties-area">
        <div className="container">
          <NavigationButtons />

          <SettingsPanel
            yearAndMonth={yearAndMonth}
            setYearAndMonth={setYearAndMonth}
            filters={filters}
          />

          <Row gutter={24}>
            <Col
              span={17}
              className="paddingBottom70"
              style={{ paddingRight: '6px !important' }}
            >
              <FinesTable
                yearAndMonth={yearAndMonth}
                filters={filters}
                onFilter={onFilter}
              />
            </Col>
            <Col span={7} style={{ maxWidth: 350 }}>
              <FinesDetails />
            </Col>
          </Row>
        </div>
      </section>
    </section>
  );
}
const mapStateToProps = state => ({
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});
export default connect(
  mapStateToProps,
  {
    fetchHrmPenalties,
    fetchBusinessUnitList,
  }
)(Fines);
