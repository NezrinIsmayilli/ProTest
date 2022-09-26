import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { Sidebar, ProSearch, ProSidebarItem, ProSelect } from 'components/Lib';

import { fetchFolders, fetchSubjects } from 'store/actions/calls/faq';

const FaqsSideBar = ({
    fetchFolders,
    fetchSubjects,
    folders,
    subjects,
    onFilter,
}) => {
    useEffect(() => {
        fetchFolders();
        fetchSubjects();
    }, [fetchFolders, fetchSubjects]);

    const handleDefaultFilters = (type, value) => {
        onFilter(type, value);
    };

    const handleSearchQuestionFilter = value => {
        if (value) {
            onFilter('question', value);
        } else {
            onFilter('question', null);
        }
    };

    const handleSearchAnswerFilter = value => {
        if (value) {
            onFilter('answer', value);
        } else {
            onFilter('answer', null);
        }
    };

    return (
        <Sidebar title="FAQ">
            <ProSidebarItem label="Qovluq">
                <ProSelect
                    mode="multiple"
                    onChange={folders =>
                        handleDefaultFilters('folders', folders)
                    }
                    showArrow
                    data={folders}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Mövzu">
                <ProSelect
                    mode="multiple"
                    onChange={subjects =>
                        handleDefaultFilters('subjects', subjects)
                    }
                    showArrow
                    data={subjects}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Sual">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchQuestionFilter(value)}
                    onChange={e => {
                        if (e.target.value === '') {
                            handleSearchQuestionFilter(undefined);
                        }
                    }}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Cavab">
                <ProSearch
                    allowClear
                    onSearch={value => handleSearchAnswerFilter(value)}
                    onChange={e => {
                        if (e.target.value === '') {
                            handleSearchAnswerFilter(undefined);
                        }
                    }}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    folders: state.FaqReducer.folders,
    subjects: state.FaqReducer.subjects,
    actionLoading: state.FaqReducer.actionLoading,
});

export default connect(
    mapStateToProps,
    { fetchFolders, fetchSubjects }
)(FaqsSideBar);
