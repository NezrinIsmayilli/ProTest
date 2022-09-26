import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import { fetchStations } from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function TgStationFilter(props) {
  const {
    station,
    onFilter,
    // actions
    fetchStations,
    // data
    stations,
    loadings,
  } = props;

  useEffect(() => {
    if (!stations.length) {
      fetchStations();
    }
  }, [fetchStations, stations.length]);

  return (
    <JobsSidebarItemWrapper label="Yaxın metro stansiya">
      <ProJobsSelect
        allowClear
        mode="multiple"
        loading={loadings.stations}
        disabled={loadings.stations}
        value={station}
        onChange={value => onFilter('station', value)}
        placeholder="Seçin"
        data={stations}
        size={defaultFormItemSize}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  stations: state.parametersReducer.stations,
  loadings: state.loadings,
});

export default connect(
  mapStateToProps,
  { fetchStations }
)(TgStationFilter);
