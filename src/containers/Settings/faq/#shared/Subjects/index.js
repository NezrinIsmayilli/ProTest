import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { GoPencil, GoTrashcan, GoPlus, GoListUnordered } from 'react-icons/go';

import { DeleteModal } from 'components/Lib';
import {
    deleteSubjects,
    fetchSubjects,
    fetchQuestions,
    deleteQuestions,
    moveSubjects,
    moveQuestions,
} from 'store/actions/calls/faq';
import Add from '../addSubject';
import AddQuestions from '../addQuestions';
import { QusetionsBlock } from '../Questions';

import styles from './styles.module.sass';

export const SubjectsBlock = ({
    subjects = [],
    folder,
    setSubjects,
    disabled,
}) => {
    const dispatch = useDispatch();
    const [visible, setVisible] = React.useState(false);
    const [selected, setSelected] = React.useState(0);
    const [subjectEdit, setSubjectEdit] = React.useState([]);
    const [questions, setQustions] = React.useState([]);

    const [addQuestion, showAddQusetion] = React.useState(false);
    const [editQuestion, setEditQusetion] = React.useState([]);

    const questionsLoading = useSelector(
        state => state.FaqReducer.questionsLoading
    );

    const handleSubjectDeleter = id => {
        dispatch(
            deleteSubjects(id, () =>
                dispatch(
                    fetchSubjects(`folders[]=${folder}`, data => {
                        setSubjects(data.data);
                        setQustions([]);
                    })
                )
            )
        );
    };

    const handleQuestionDeleter = id => {
        dispatch(
            deleteQuestions(id, () =>
                dispatch(
                    fetchQuestions(`subjects[]=${selected}`, data => {
                        setQustions(data.data);
                    })
                )
            )
        );
    };

    const handleSelectSubject = React.useCallback(
        id => {
            setSelected(id);

            dispatch(
                fetchQuestions(`subjects[]=${id}`, data => {
                    setQustions(data.data);
                })
            );
        },
        [dispatch]
    );

    const handleQuestionEditedOrAddedSucces = () => {
        dispatch(
            fetchQuestions(`subjects[]=${selected}`, data => {
                setQustions(data.data);
            })
        );
    };

    const handleSubjectAddedOrEditedSuccess = () => {
        dispatch(
            fetchSubjects(`folders[]=${folder}`, data => {
                setSubjects(data.data);
            })
        );
    };

    React.useEffect(() => {
        if (selected === 0 && subjects.length > 0) {
            handleSelectSubject(subjects[0].id);
        }
    }, [handleSelectSubject, selected, subjects]);

    const SortableItem = sortableElement(({ value }) => <div>{value}</div>);

    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));

    const SubjectItem = ({ subject, disabled }) => (
        <div
            className={`${styles.blockContentItem} ${selected === subject.id &&
                styles.selected}`}
        >
            <button
                type="button"
                onClick={() => handleSelectSubject(subject.id)}
                className={styles.blockContentItemName}
            >
                {subject.name}
            </button>
            <div className={styles.blockContentItemTools}>
                {subject.status === 0 && (
                    <div className={styles.blockContentItemStatus}>Deaktiv</div>
                )}
                {disabled ? null : (
                    <>
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
                        <button
                            type="button"
                            onClick={() => setSubjectEdit(subject)}
                            className={styles.blockContentItemButtons}
                        >
                            <GoPencil size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={DeleteModal(
                                subject.id,
                                handleSubjectDeleter
                            )}
                            className={styles.blockContentItemButtons}
                        >
                            <GoTrashcan size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    const onSortEndSubjects = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const subject = subjects[oldIndex];
            let after = subjects[newIndex] || { id: null };

            if (oldIndex > newIndex) {
                after = subjects[newIndex - 1] || { id: null };
            }

            if (subject?.id) {
                dispatch(
                    moveSubjects(
                        {
                            id: subject.id,
                            positionAfter: after.id,
                        },
                        () => {
                            dispatch(
                                fetchSubjects(`folders[]=${folder}`, data => {
                                    setSubjects(data.data);
                                    setQustions([]);
                                    handleSelectSubject(data.data[0].id);
                                })
                            );
                        }
                    )
                );
            }
        }
    };

    const onSortEndQuestions = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const qusetion = questions[oldIndex];
            let after = questions[newIndex] || { id: null };

            if (oldIndex > newIndex) {
                after = questions[newIndex - 1] || { id: null };
            }

            if (qusetion?.id) {
                dispatch(
                    moveQuestions(
                        {
                            id: qusetion.id,
                            positionAfter: after.id,
                        },
                        () => {
                            dispatch(
                                fetchSubjects(`folders[]=${folder}`, data => {
                                    setSubjects(data.data);
                                    setQustions([]);
                                    handleSelectSubject(selected);
                                    console.log('gelirki');
                                })
                            );
                        }
                    )
                );
            }
        }
    };

    return (
        <>
            <div className={styles.blockContent}>
                <div className={styles.blockContentSubjectsHeader}>
                    <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        className={styles.blockContentSubjectsButton}
                        disabled={disabled}
                    >
                        <div className={styles.blockContentSubjects}>
                            <div>Mövzu ({subjects.length})</div>

                            {disabled ? null : (
                                <GoPlus size={17} color="white" />
                            )}
                        </div>
                    </button>
                    <div className={styles.blockContentBody}>
                        <SortableContainer
                            onSortEnd={({ oldIndex, newIndex }) =>
                                onSortEndSubjects(oldIndex, newIndex)
                            }
                            pressDelay={150}
                        >
                            {subjects.map((subject, index) => (
                                <SortableItem
                                    disabled={disabled}
                                    key={`item-${index}`}
                                    index={index}
                                    value={
                                        <SubjectItem
                                            disabled={disabled}
                                            subject={subject}
                                        />
                                    }
                                />
                            ))}
                        </SortableContainer>
                    </div>
                </div>
                <div className={styles.blockContentQuestionHeader}>
                    <button
                        type="button"
                        onClick={() => showAddQusetion(!addQuestion)}
                        disabled={!selected || disabled}
                        className={styles.blockContentQuestionsButton}
                    >
                        <div className={styles.blockContentQuestions}>
                            <div>Sual ({questions.length || 0})</div>

                            {disabled ? null : (
                                <GoPlus size={17} color="white" />
                            )}
                        </div>
                    </button>
                    <div className={styles.blockContentRightBody}>
                        {questionsLoading && (
                            <div className={styles.spinContainer}>
                                <Spin />
                            </div>
                        )}
                        <SortableContainer
                            onSortEnd={({ oldIndex, newIndex }) =>
                                onSortEndQuestions(oldIndex, newIndex)
                            }
                            pressDelay={150}
                        >
                            {questions.map((question, index) => (
                                <SortableItem
                                    key={`item-${index}`}
                                    index={index}
                                    disabled={disabled}
                                    value={
                                        <QusetionsBlock
                                            disabled={disabled}
                                            question={question}
                                            index={index}
                                            setEditQusetion={setEditQusetion}
                                            handleQuestionDeleter={
                                                handleQuestionDeleter
                                            }
                                        />
                                    }
                                />
                            ))}
                        </SortableContainer>
                    </div>
                </div>
            </div>
            <Add
                visible={visible}
                handleModal={setVisible}
                edit={subjectEdit}
                cleanEdit={setSubjectEdit}
                folder={folder}
                handleSubjectAddedOrEditedSuccess={
                    handleSubjectAddedOrEditedSuccess
                }
            />
            <AddQuestions
                visible={addQuestion}
                handleModal={showAddQusetion}
                selected={selected}
                editQuestion={editQuestion}
                setEditQusetion={setEditQusetion}
                handleQuestionEditedOrAddedSucces={
                    handleQuestionEditedOrAddedSucces
                }
            />
        </>
    );
};
