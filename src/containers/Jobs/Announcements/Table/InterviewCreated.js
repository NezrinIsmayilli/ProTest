import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ProStage } from 'components/Lib';

// actions
import {
  addToBookmarks,
  removeFromBookmarks,
} from 'store/actions/jobs/announcements';
import InterviewCalendar from '../InterviewCalendar';

function InterviewCreated(props) {
  const { interviewCreated, permissionsList } = props;

  const [isVisible_, setIsVisible_] = useState(false);

  const handleStageChange = row => {
    setIsVisible_(true);
  };
  const visualStatusesNew = {
    0: {
      id: 'Dəvət olunub',
      name: 'delivery',
      label: 'aktiv',
      color: '#2980b9',
    },
  };

  const statusesNew = [
    { id: 0, name: 'new', label: 'dəvət', color: '#2980b9' },
  ];

  const visualStatusesWait = {
    0: { id: 'Müsahibə', name: 'going', label: 'aktiv', color: '#f39c12' },
  };

  const statusesWait = [
    { id: 0, name: 'new', label: 'Müsahibəyə dəvət et', color: '#f39c12' },
  ];
  const currentURL = window.location.pathname === '/recruitment/announcements';

  return (
    <div>
      <ProStage
        disabled={
          interviewCreated ||
          (currentURL
            ? permissionsList.projobs_job_seekers.permission !== 2
            : permissionsList.projobs_advertisements.permission !== 2)
        }
        visualStage={
          interviewCreated ? visualStatusesNew[0] : visualStatusesWait[0]
        }
        statuses={interviewCreated ? statusesNew : statusesWait}
        onChange={id => handleStageChange(id)}
      />
      <InterviewCalendar visible={isVisible_} setIsVisible={setIsVisible_} />
    </div>
  );
}

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { addToBookmarks, removeFromBookmarks }
)(InterviewCreated);
