import React from 'react';
import { useDispatch } from 'react-redux';
import AnimateHeight from 'react-animate-height';
import { GoPencil, GoTrashcan, GoListUnordered } from 'react-icons/go';

import { DeleteModal } from 'components/Lib';
import { fetchSubjects, deleteFolders } from 'store/actions/calls/faq';
import { SubjectsBlock } from '../Subjects';

import styles from './styles.module.sass';

export const FolderBlock = ({ source, setFolderEdit, isEditDisabled }) => {
    const dispatch = useDispatch();

    const [subjects, setSubjects] = React.useState([]);

    const handleDeleteFolder = id => {
        dispatch(deleteFolders(id));
    };

    const [folderStatus, setFolderStatus] = React.useState(false);

    React.useEffect(() => {
        if (folderStatus) {
            dispatch(
                fetchSubjects(`folders[]=${source.id}`, data =>
                    setSubjects(data.data)
                )
            );
        }
    }, [dispatch, folderStatus, source.id]);

    return (
        <div
            className={styles.container}
            style={{ height: folderStatus ? 'auto' : 60 }}
        >
            <div
                className={styles.blockBody}
                style={{ borderBottomWidth: !folderStatus ? 0 : 1 }}
            >
                <div className={styles.blockLeft}>
                    <button
                        type="button"
                        onClick={() => setFolderStatus(!folderStatus)}
                        className={styles.blockName}
                    >
                        {source.name}
                    </button>

                    {!isEditDisabled ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setFolderEdit(source)}
                                className={styles.actionButtons}
                            >
                                <GoPencil size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={DeleteModal(
                                    source.id,
                                    handleDeleteFolder
                                )}
                                className={styles.actionButtons}
                            >
                                <GoTrashcan size={18} />
                            </button>
                        </>
                    ) : null}
                </div>
                {!isEditDisabled ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'move',
                        }}
                    >
                        <GoListUnordered size={16} />
                    </div>
                ) : null}
            </div>
            {source.status === 0 && (
                <div className={styles.badge}> Deaktiv </div>
            )}
            <AnimateHeight duration={500} height={folderStatus ? 'auto' : 0}>
                <SubjectsBlock
                    key={source.id}
                    subjects={subjects}
                    folder={source.id}
                    setSubjects={setSubjects}
                    disabled={isEditDisabled}
                />
            </AnimateHeight>
        </div>
    );
};
