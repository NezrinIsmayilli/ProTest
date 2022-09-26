/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Input, Empty, Spin } from 'antd';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';

import { fetchFAQs, moveFolders } from 'store/actions/calls/faq';

import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import FaqsSideBar from './Sidebar';

import styles from './styles.module.scss';

import CollapseBlock from './collapse';

const Faq = props => {
    const {
        fetchFAQs,
        moveFolders,
        isLoading,
        actionLoading,
        faqs,
        movingsLoading,
        permissionsByKeyValue,
    } = props;

    const { faq } = permissionsByKeyValue;
    const isEditDisabled = faq.permission !== 2;
    const SortableItem = sortableElement(({ value }) => <div>{value}</div>);

    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));

    React.useEffect(() => {
        fetchFAQs();
    }, []);

    const { Search } = Input;

    const [filters, onFilter] = useFilterHandle(
        {
            folders: [],
            subjects: [],
            question: null,
            answer: null,
            search: null,
        },
        ({ filters }) => {
            fetchFAQs({
                filters,
            });
        }
    );

    const handleSearchFilter = value => {
        if (value) {
            onFilter('search', value);
        } else {
            onFilter('search', null);
        }
    };

    const onSortEnd = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const folder = faqs[oldIndex];
            let after = faqs[newIndex] || { id: null };

            if (oldIndex > newIndex) {
                after = faqs[newIndex - 1] || { id: null };
            }

            if (folder?.id) {
                moveFolders(
                    {
                        id: folder.id,
                        positionAfter: after.id,
                    },
                    () => {
                        fetchFAQs({
                            filters,
                        });
                    }
                );
            }
        }
    };

    return (
        <>
            <FaqsSideBar filters={filters} onFilter={onFilter} />
            <div className={styles.container}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchBlock}>
                        <Search
                            placeholder="Axtarış üçün açar sözü daxil edin"
                            onSearch={handleSearchFilter}
                            onChange={e => {
                                if (e.target.value === '') {
                                    onFilter('search', null);
                                }
                            }}
                            enterButton
                            size="large"
                        />
                    </div>
                </div>
                <div className={styles.collapseWrapper}>
                    {isLoading && (
                        <div className={styles.spinContainer}>
                            <Spin />
                        </div>
                    )}
                    {movingsLoading && (
                        <div className={styles.flyingSpinContainer}>
                            <Spin />
                        </div>
                    )}
                    {faqs.length > 0 ? (
                        <SortableContainer
                            onSortEnd={({ oldIndex, newIndex }) =>
                                onSortEnd(oldIndex, newIndex)
                            }
                            pressDelay={100}
                            disabled={isEditDisabled}
                        >
                            {faqs.map(
                                (faq, index) =>
                                    faq.status === 1 && (
                                        <SortableItem
                                            key={`item-${index}`}
                                            index={index}
                                            disabled={isEditDisabled}
                                            value={
                                                <CollapseBlock
                                                    disabled={isEditDisabled}
                                                    source={faq}
                                                    filters={filters}
                                                />
                                            }
                                        />
                                    )
                            )}
                        </SortableContainer>
                    ) : (
                        <div className={styles.emptyContainer}>
                            <Empty description="Məlumat tapılmadı" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    profile: state.profileReducer.profile,
    faqs: state.FaqReducer.faqs,
    isLoading: state.FaqReducer.isLoading,
    actionLoading: state.FaqReducer.actionLoading,
    movingsLoading: state.FaqReducer.movingsLoading,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {
        fetchFAQs,
        moveFolders,
    }
)(Faq);
