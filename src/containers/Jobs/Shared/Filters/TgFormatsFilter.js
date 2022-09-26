import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import { fetchFormats } from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function TgFormatsFilter(props) {
  const {
    format,
    onFilter,
    // actions
    fetchFormats,
    // data
    formats,
    loadings,
  } = props;

  useEffect(() => {
    if (!formats.length) {
      fetchFormats();
    }
  }, [fetchFormats, formats.length]);

  return (
    <JobsSidebarItemWrapper label="Təlim formatı">
      <ProJobsSelect
        allowClear
        mode="multiple"
        loading={loadings.formats}
        disabled={loadings.formats}
        value={format}
        onChange={value => onFilter('format', value)}
        placeholder="Seçin"
        data={formats}
        size={defaultFormItemSize}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  formats: state.parametersReducer.formats,
  loadings: state.loadings,
});

export default connect(
  mapStateToProps,
  { fetchFormats }
)(TgFormatsFilter);
