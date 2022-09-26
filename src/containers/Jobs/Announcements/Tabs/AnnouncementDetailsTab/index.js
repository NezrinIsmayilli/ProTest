import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Spin, Button, Empty } from 'antd';

import { fetchAnnouncementById } from 'store/actions/jobs/announcements';

import JobsPermissionControl from 'containers/Jobs/Shared/JobsPermissionControl';

import DisplayAnnouncementInfo from 'containers/Jobs/Shared/DisplayAnnouncementInfo';

import styles from './styles.module.scss';

function AnnouncementDetailsTab(props) {
  const {
    // parent
    openInterviewCalendar,

    // redux data
    announcement,
    selectedAnnouncement,
    announcementLoading,

    // action
    fetchAnnouncementById,
  } = props;

  const { id } = selectedAnnouncement || {};
  const { interviewCreated } = announcement || {};

  // get selected Announcement info when id change
  useEffect(() => {
    if (id) {
      fetchAnnouncementById(id);
    }
  }, [id, fetchAnnouncementById]);

  let renderedContent = null;

  if (announcement && !announcementLoading && selectedAnnouncement) {
    renderedContent = (
      <>
        <div className={`${styles.tabContent}`}>
          <DisplayAnnouncementInfo announcement={announcement} />
        </div>
        {/* <JobsPermissionControl>
          <Button.Group size="large" className={styles.buttonGroup}>
            <Button
              type="primary"
              size="large"
              disabled={interviewCreated}
              block
              onClick={openInterviewCalendar}
            >
              {interviewCreated ? 'İntervyuya dəvət göndərilib' : 'Intervyu'}
            </Button>
          </Button.Group>
        </JobsPermissionControl> */}
      </>
    );
  } else if (!announcementLoading && !selectedAnnouncement) {
    renderedContent = <Empty description="Elan seçin" />;
  } else if (announcementLoading && selectedAnnouncement) {
    renderedContent = <Spin spinning />;
  }

  return renderedContent;
}

const mapStateToProps = state => ({
  announcement: state.announcementsReducer.announcement,
  selectedAnnouncement: state.announcementsReducer.selectedAnnouncement,
  announcementLoading: !!state.loadings.fetchAnnouncementById,
});

export default connect(
  mapStateToProps,
  {
    fetchAnnouncementById,
  }
)(AnnouncementDetailsTab);
