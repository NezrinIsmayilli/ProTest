import React from 'react';
import { connect } from 'react-redux';
import { Col } from 'antd';
import { ExcelButton, Can } from 'components/Lib';

import { exportFileDownloadHandle } from 'utils';
import { accessTypes, permissions } from 'config/permissions';
import { NavigationButtons } from '../Shared';

// main components
import Sidebar from './Sidebar';
import Table from './Table';

function AttendanceJournal(props) {
  const { isLoadingExport, date, exportFileDownloadHandle } = props;

  return (
    <section>
      <Sidebar />
      <section className="scrollbar aside">
        <div className="container">
          <NavigationButtons>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Can I={accessTypes.manage} a={permissions.timecard}>
                <ExcelButton
                  loading={isLoadingExport}
                  onClick={() =>
                    exportFileDownloadHandle(
                      'exportAttendanceJournalReport',
                      `/hrm/time-card/export/by-date/${date}`
                    )
                  }
                />
              </Can>
            </Col>
          </NavigationButtons>

          <Table />
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = state => ({
  isLoadingExport: !!state.loadings.exportAttendanceJournalReport,
  date: state.attendanceReducer.date,
});

export default connect(
  mapStateToProps,
  {
    exportFileDownloadHandle,
  }
)(AttendanceJournal);
