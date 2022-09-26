import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Spin, Empty } from 'antd';
import { fetchPersonById } from 'store/actions/jobs/appeals';
import DisplayPersonInfo from '../../../Shared/DisplayPersonInfo';

function PersonDetailsTab(props) {
  const {
    selectedAnnouncement,
    personData,
    personLoading,
    // action
    fetchPersonById,
  } = props;

  const { person } = selectedAnnouncement || {};
  const id = person?.id;

  useEffect(() => {
    if (id) {
      fetchPersonById(id);
    }
  }, [id, fetchPersonById]);

  let renderedContent = null;

  if (personData && !personLoading && selectedAnnouncement) {
    renderedContent = (
      <div className="scrollbar">
        <DisplayPersonInfo person={personData} />
      </div>
    );
  } else if (!personLoading && !selectedAnnouncement) {
    renderedContent = <Empty description="Elan seçin" />;
  } else if (personLoading && selectedAnnouncement) {
    renderedContent = <Spin spinning />;
  }

  return renderedContent;
}

const mapStateToProps = state => ({
  personData: state.appealsReducer.person,
  selectedAnnouncement: state.announcementsReducer.selectedAnnouncement,
  personLoading: !!state.loadings.fetchPersonById,
});

export default connect(
  mapStateToProps,
  {
    fetchPersonById,
  }
)(PersonDetailsTab);
