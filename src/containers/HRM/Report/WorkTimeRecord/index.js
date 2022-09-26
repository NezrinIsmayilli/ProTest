/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { NavigationButtons } from '../#shared';
import SettingsPanel from './SettingsPanel';
import Sidebar from './Sidebar';
import Table from './Table';
import Infobox from './Infobox';

function WorkTimeRecord(props) {
  const { profile, fetchBusinessUnitList } = props;
  const [filter, setFilter] = useState({ businessUnitIds: [] });
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
      <Sidebar filter={filter} setFilter={setFilter} />

      <section className="scrollbar aside" id="timecardArea">
        <div className="container">
          <NavigationButtons />

          <SettingsPanel filter={filter} setFilter={setFilter} />

          <Row gutter={12}>
            <Col span={17} className="paddingBottom70">
              <Table />
            </Col>

            <Col span={7}>
              <Infobox />
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
    fetchBusinessUnitList,
  }
)(WorkTimeRecord);
