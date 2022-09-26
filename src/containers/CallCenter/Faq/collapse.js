import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import { GoListUnordered } from 'react-icons/go';
import AnimateHeight from 'react-animate-height';

import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import {
    fetchFAQs,
    moveSubjects,
    moveQuestions,
} from 'store/actions/calls/faq';

import styles from './styles.module.scss';

function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

const SubjectItem = ({ subject, folderExpand, filters, disabled }) => {
    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));
    const SortableItem = sortableElement(({ value }) => <div>{value}</div>);
    const [subjectStatus, setSubjectStatus] = React.useState(false);
    const [expand, setExpand] = React.useState(null);

    React.useEffect(() => {
        setSubjectStatus(folderExpand);
        setExpand(folderExpand);
    }, [folderExpand]);

    const forceUpdate = useForceUpdate();
    const setExpandStatus = st => {
        if (expand === st) {
            forceUpdate();
        } else {
            setExpand(st);
        }
        setSubjectStatus(st);
    };

    const dispatch = useDispatch();

    const onSortEnd = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const qusetion = subject.questions[oldIndex];
            let after = subject.questions[newIndex] || { id: null };

            if (oldIndex > newIndex) {
                after = subject.questions[newIndex - 1] || { id: null };
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
                                fetchFAQs({
                                    filters,
                                })
                            );
                        }
                    )
                );
            }
        }
    };

    return (
        <SortableContainer
            disabled={disabled}
            onSortEnd={({ oldIndex, newIndex }) =>
                onSortEnd(oldIndex, newIndex)
            }
            pressDelay={100}
        >
            <div
                style={{
                    marginLeft: 20,
                    backgroundColor: subjectStatus ? '#f5f5f5' : '#ffffff',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 50,
                        borderBottomWidth: 1,
                        borderBottomColor: '#dddddd',
                        borderBottomStyle: 'solid',
                        marginBottom: 5,
                        paddingRight: 10,
                        paddingLeft: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: 1,
                            marginRight: 20,
                        }}
                    >
                        {subjectStatus ? (
                            <IoMdArrowDropdown
                                size="17px"
                                style={{ marginRight: 10 }}
                            />
                        ) : (
                            <IoMdArrowDropright
                                size="17px"
                                style={{ marginRight: 10 }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setSubjectStatus(!subjectStatus)}
                            className={styles.subjectTitle}
                        >
                            {subject.name}
                        </button>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setExpandStatus(true)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: 11,
                                marginRight: 5,
                                cursor: 'pointer',
                            }}
                        >
                            Hamısını Aç
                        </button>
                        |
                        <button
                            type="button"
                            onClick={() => setExpandStatus(false)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: 11,
                                marginLeft: 5,
                                cursor: 'pointer',
                            }}
                        >
                            Hamısını bağla
                        </button>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'move',
                                marginLeft: 20,
                            }}
                        >
                            {disabled ? null : <GoListUnordered size={16} />}
                        </div>
                    </div>
                </div>
                <AnimateHeight
                    duration={500}
                    height={subjectStatus ? 'auto' : 0}
                >
                    {subject.questions.map(
                        (question, index) =>
                            question.status === 1 && (
                                <SortableItem
                                    key={`item-${index}`}
                                    disabled={disabled}
                                    index={index}
                                    value={
                                        <QuestionItem
                                            disabled={disabled}
                                            question={question}
                                            expand={expand}
                                        />
                                    }
                                />
                            )
                    )}
                </AnimateHeight>
            </div>
        </SortableContainer>
    );
};

const QuestionItem = ({ question, expand, disabled }) => {
    const [qusetionStatus, setQuestionStatus] = React.useState();

    React.useEffect(() => {
        setQuestionStatus(expand);
    }, [expand]);

    return (
        <div style={{ padding: '0 0 15px 30px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 50,
                    borderBottomWidth: 1,
                    borderBottomColor: '#dddddd',
                    borderBottomStyle: 'solid',
                    marginBottom: 5,
                    paddingRight: 10,
                    paddingLeft: 10,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        // justifyContent: 'center',
                        flex: 1,
                        marginRight: 20,
                    }}
                >
                    {qusetionStatus ? (
                        <IoMdArrowDropdown
                            size="17px"
                            style={{ marginRight: 10 }}
                        />
                    ) : (
                        <IoMdArrowDropright
                            size="17px"
                            style={{ marginRight: 10 }}
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => setQuestionStatus(!qusetionStatus)}
                        className={styles.questionTitle}
                    >
                        {question.question}
                    </button>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'move',
                        marginLeft: 20,
                    }}
                >
                    {disabled ? null : <GoListUnordered size={16} />}
                </div>
            </div>
            <AnimateHeight duration={500} height={qusetionStatus ? 'auto' : 0}>
                <div
                    style={{
                        margin: '10px 30px 10px 0',
                        padding: '20px 30px 20px 30px',
                        fontSize: '12px',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <div
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                            __html: question.answer,
                        }}
                    />
                </div>
            </AnimateHeight>
        </div>
    );
};

export default function CollapseBlock({ source, filters, disabled }) {
    const SortableItem = sortableElement(({ value }) => <div>{value}</div>);

    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));

    const [folderStatus, setFolderStatus] = React.useState(false);
    const [folderExpand, setFolderExpand] = React.useState(null);

    const handleFolderStatus = () => {
        if (folderStatus) {
            setFolderExpand(null);
        }
        setFolderStatus(!folderStatus);
    };

    const dispatch = useDispatch();

    const forceUpdate = useForceUpdate();

    const setExpandStatus = st => {
        if (folderExpand === st) {
            forceUpdate();
        } else {
            setFolderExpand(st);
        }
        setFolderStatus(st);
    };

    const onSortEnd = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const subject = source.subjects[oldIndex];
            let after = source.subjects[newIndex] || { id: null };

            if (oldIndex > newIndex) {
                after = source.subjects[newIndex - 1] || { id: null };
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
                                fetchFAQs({
                                    filters,
                                })
                            );
                        }
                    )
                );
            }
        }
    };

    return (
        <div
            style={{
                padding: '0px 20px 10px 20px',
                marginBottom: 10,
                height: folderStatus ? 'auto' : 60,
                overflow: 'hidden',
                borderRadius: 8,
                backgroundColor: '#ffffff',
            }}
        >
            <SortableContainer
                onSortEnd={({ oldIndex, newIndex }) =>
                    onSortEnd(oldIndex, newIndex)
                }
                pressDelay={100}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 60,
                        borderBottomWidth: !folderStatus ? 0 : 1,
                        borderBottomColor: '#dddddd',
                        borderBottomStyle: 'solid',
                        marginBottom: 5,
                    }}
                >
                    <button
                        type="button"
                        onClick={handleFolderStatus}
                        className={styles.folderTitle}
                    >
                        {source.name}
                    </button>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setExpandStatus(true)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: 13,
                                marginRight: 5,
                                cursor: 'pointer',
                            }}
                        >
                            Hamısını Aç
                        </button>
                        |
                        <button
                            type="button"
                            onClick={() => setExpandStatus(false)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: 13,
                                marginLeft: 5,
                                cursor: 'pointer',
                            }}
                        >
                            Hamısını bağla
                        </button>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'move',
                                marginLeft: 20,
                            }}
                        >
                            {disabled ? null : <GoListUnordered size={16} />}
                        </div>
                    </div>
                </div>
                <AnimateHeight
                    duration={500}
                    height={folderStatus ? 'auto' : 0}
                >
                    {source.subjects.map(
                        (subject, index) =>
                            subject.status === 1 && (
                                <SortableItem
                                    key={`item-${index}`}
                                    index={index}
                                    disabled={disabled}
                                    value={
                                        <SubjectItem
                                            disabled={disabled}
                                            subject={subject}
                                            folderExpand={folderExpand}
                                            filters={filters}
                                        />
                                    }
                                />
                            )
                    )}
                </AnimateHeight>
            </SortableContainer>
        </div>
    );
}
