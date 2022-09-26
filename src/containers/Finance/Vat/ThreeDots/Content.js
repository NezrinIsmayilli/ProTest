/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import styles from './styles.module.scss';

const Content = ({
    row,
    handleThreeDotClick,
    setTransactionType,
    setTransactionModalIsVisible,
}) => (
    <div className={styles.container}>
        <div
            className={styles.finOperation}
            onClick={() =>
                handleThreeDotClick(
                    setTransactionType,
                    setTransactionModalIsVisible,
                    1,
                    row
                )
            }
        >
            Maliyyə əməliyyatları
        </div>
        {row.invoiceType !== 12 && row.invoiceType !== 13 ? (
            <div
                className={styles.invoiceContent}
                onClick={() =>
                    handleThreeDotClick(
                        setTransactionType,
                        setTransactionModalIsVisible,
                        2,
                        row
                    )
                }
            >
                Qaimənin tərkibi
            </div>
        ) : null}
        {row.creditId ? (
            <div
                className={styles.invoiceContent}
                onClick={() =>
                    handleThreeDotClick(
                        setTransactionType,
                        setTransactionModalIsVisible,
                        3,
                        row
                    )
                }
            >
                Ödəniş cədvəli
            </div>
        ) : null}
    </div>
);

export default Content;
