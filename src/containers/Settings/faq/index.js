import React, { useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { Spin } from 'antd';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { BsFolderPlus } from 'react-icons/bs';

import { ProButton } from 'components/Lib';
import { fetchFolders, moveFolders } from 'store/actions/calls/faq';
import { FolderBlock } from './#shared/Folder';
import Add from './#shared/addFolder';

import styles from './index.module.sass';

const Faq = props => {
    const { permissionsByKeyValue } = props;
    const dispatch = useDispatch();

    const folders = useSelector(state => state.FaqReducer.folders);
    const isLoading = useSelector(state => state.FaqReducer.isLoading);

    React.useEffect(() => {
        dispatch(fetchFolders());
    }, [dispatch]);

    const [visible, setVisible] = useState(false);
    const [folderEdit, setFolderEdit] = useState([]);
    const { msk_faq } = permissionsByKeyValue;
    const isEditDisabled = msk_faq.permission !== 2;

    const SortableItem = sortableElement(({ value }) => <div>{value}</div>);

    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));

    const onSortEnd = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const folder = folders[oldIndex];
            let after = folders[newIndex] || { id: null };

            if (oldIndex > newIndex) {
                after = folders[newIndex - 1] || { id: null };
            }

            if (folder?.id) {
                dispatch(
                    moveFolders(
                        {
                            id: folder.id,
                            positionAfter: after.id,
                        },
                        () => {
                            dispatch(fetchFolders());
                        }
                    )
                );
            }
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.searchContainer}>
                    <div className={styles.addButton}>
                        <ProButton
                            type="primary"
                            size="large"
                            onClick={() => setVisible(!visible)}
                            disabled={isEditDisabled}
                        >
                            <BsFolderPlus size={18} />
                            Qovluq əlavə et
                        </ProButton>
                    </div>
                </div>
                <div className={styles.contentContainer}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <Spin />
                        </div>
                    ) : folders.length <= 0 ? (
                        <div className={styles.emptyContent}>
                            <ProButton
                                type="primary"
                                size="large"
                                onClick={() => setVisible(!visible)}
                                disabled={isEditDisabled}
                            >
                                <BsFolderPlus size={26} color="#55ab80" />
                                Qovluq əlavə etmək üçün klikləyin.
                            </ProButton>
                        </div>
                    ) : null}

                    <SortableContainer
                        onSortEnd={({ oldIndex, newIndex }) =>
                            onSortEnd(oldIndex, newIndex)
                        }
                        pressDelay={150}
                    >
                        {folders.map((folder, index) => (
                            <SortableItem
                                disabled={isEditDisabled}
                                key={`item-${index}`}
                                index={index}
                                value={
                                    <FolderBlock
                                        source={folder}
                                        setFolderEdit={setFolderEdit}
                                        isEditDisabled={isEditDisabled}
                                    />
                                }
                            />
                        ))}
                    </SortableContainer>
                </div>
            </div>
            <Add
                visible={visible}
                handleModal={setVisible}
                edit={folderEdit}
                cleanEdit={setFolderEdit}
            />
        </>
    );
};
const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});
export default connect(
    mapStateToProps,
    {}
)(Faq);
