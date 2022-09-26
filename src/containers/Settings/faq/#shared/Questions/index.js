import React from 'react';
import AnimateHeight from 'react-animate-height';
import { DeleteModal } from 'components/Lib';
import {
    GoPencil,
    GoTrashcan,
    GoTriangleRight,
    GoTriangleDown,
    GoListUnordered,
} from 'react-icons/go';

import styles from './styles.module.sass';

export const QusetionsBlock = ({
    question = [],
    index,
    setEditQusetion,
    handleQuestionDeleter,
    disabled,
}) => {
    const [qusetionsShow, setQusetionsShow] = React.useState(false);

    return (
        <div
            className={`${styles.blockContentItemRight} ${qusetionsShow &&
                styles.selected}`}
        >
            <div className={styles.blockContentItemRightHeader}>
                <button
                    type="button"
                    onClick={() => setQusetionsShow(!qusetionsShow)}
                    className={styles.blockContentItemRightName}
                >
                    {qusetionsShow ? <GoTriangleDown /> : <GoTriangleRight />}
                    {index + 1}. {question.question}
                </button>
                <div className={styles.blockContentItemRightTools}>
                    {question.status === 0 && (
                        <div className={styles.blockContentItemRightStatus}>
                            Deaktiv
                        </div>
                    )}
                    {!disabled ? (
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
                                onClick={() => setEditQusetion(question)}
                                className={styles.blockContentItemRightButtons}
                            >
                                <GoPencil size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={DeleteModal(
                                    question.id,
                                    handleQuestionDeleter
                                )}
                                className={styles.blockContentItemRightButtons}
                            >
                                <GoTrashcan size={16} />
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
            <AnimateHeight duration={500} height={qusetionsShow ? 'auto' : 0}>
                <div
                    style={{
                        marginLeft: 35,
                        padding: '20px 0',
                        fontSize: 14,
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
