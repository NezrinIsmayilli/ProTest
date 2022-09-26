import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProJobsSelect, JobsSidebarItemWrapper } from 'components/Lib';

// actions
import { fetchLanguages } from 'store/actions/jobs/parameters';

import { defaultFormItemSize } from 'utils';

function LanguageFilter(props) {
  const {
    language,
    onFilter,
    // actions
    fetchLanguages,
    // data
    languages,
    languagesLoading,
  } = props;

  useEffect(() => {
    if (!languages.length) {
      fetchLanguages();
    }
  }, [fetchLanguages, languages.length]);

  return (
    <JobsSidebarItemWrapper label="Dil">
      <ProJobsSelect
        allowClear
        mode="multiple"
        loading={languagesLoading}
        disabled={languagesLoading}
        value={language}
        onChange={value => onFilter('language', value)}
        placeholder="Seçin"
        data={languages}
        size={defaultFormItemSize}
      />
    </JobsSidebarItemWrapper>
  );
}

const mapStateToProps = state => ({
  languages: state.parametersReducer.languages,
  languagesLoading: !!state.loadings.languages,
});

export default connect(
  mapStateToProps,
  { fetchLanguages }
)(LanguageFilter);
