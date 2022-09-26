import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IoMdArrowDropright, IoMdArrowDropdown } from 'react-icons/io';
import AnimateHeight from 'react-animate-height';

import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import { moveSubjects, moveQuestions } from 'store/actions/calls/faq';

function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

const SubjectItem = ({ subject, folderExpand }) => {
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
    };

    const dispatch = useDispatch();

    const onSortEnd = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const qusetion = subject.questions[oldIndex];
            const after = subject.questions[newIndex - 1] || { id: null };

            if (qusetion?.id) {
                dispatch(
                    moveQuestions({
                        id: qusetion.id,
                        positionAfter: after.id,
                    })
                );
            }
        }
    };

    return (
        <SortableContainer
            onSortEnd={({ oldIndex, newIndex }) =>
                onSortEnd(oldIndex, newIndex)
            }
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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                            style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                minWidth: 200,
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                        >
                            {subject.name}
                        </button>
                    </div>
                    <div>
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
                                    index={index}
                                    value={
                                        <QuestionItem
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

const QuestionItem = ({ question, expand }) => {
    const [qusetionStatus, setQuestionStatus] = React.useState();

    React.useEffect(() => {
        setQuestionStatus(expand);
    }, [expand]);

    return (
        <div style={{ paddingLeft: 30 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    // justifyContent: 'space-between',
                    height: 50,
                    borderBottomWidth: 1,
                    borderBottomColor: '#dddddd',
                    borderBottomStyle: 'solid',
                    marginBottom: 5,
                    paddingRight: 10,
                    paddingLeft: 10,
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
                    style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        minWidth: 200,
                        textAlign: 'left',
                        cursor: 'pointer',
                    }}
                >
                    {question.question}
                </button>
            </div>
            <AnimateHeight duration={500} height={qusetionStatus ? 'auto' : 0}>
                <div
                    style={{
                        marginLeft: 35,
                        padding: '20px 0',
                        fontSize: '12px',
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

export default function CollapseBlock({ source }) {
    const SortableItem = sortableElement(({ value }) => <div>{value}</div>);

    const SortableContainer = sortableContainer(({ children }) => (
        <div>{children}</div>
    ));

    const [folderStatus, setFolderStatus] = React.useState(false);
    const [folderExpand, setFolderExpand] = React.useState(null);

    const dispatch = useDispatch();

    const forceUpdate = useForceUpdate();

    const setExpandStatus = st => {
        if (folderExpand === st) {
            forceUpdate();
        } else {
            setFolderExpand(st);
        }
    };

    const onSortEnd = (oldIndex, newIndex) => {
        if (oldIndex !== newIndex) {
            const subject = source.subjects[oldIndex];
            const after = source.subjects[newIndex - 1] || { id: null };

            if (subject?.id) {
                dispatch(
                    moveSubjects(
                        {
                            id: subject.id,
                            positionAfter: after.id,
                        },
                        () => {
                            console.log('on Success');
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
                        onClick={() => setFolderStatus(!folderStatus)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontWeight: 'bold',
                            minWidth: 200,
                            textAlign: 'left',
                            cursor: 'pointer',
                        }}
                    >
                        {source.name}
                        {source.id}
                    </button>
                    <div>
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
                                    value={
                                        <SubjectItem
                                            subject={subject}
                                            folderExpand={folderExpand}
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
