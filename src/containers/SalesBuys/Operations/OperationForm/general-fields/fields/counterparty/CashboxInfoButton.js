import React, { useState } from 'react';
import { Button, Tooltip, Icon } from 'antd';
import { roundToDown } from 'utils';
import { FaInfoCircle } from 'react-icons/fa';
import { ReactComponent as PlusMinus } from 'assets/img/icons/plus-minus.svg';
import { MinusCircleFilled, PlusCircleFilled } from '@ant-design/icons';
import styles from '../../../styles.module.scss';

const math = require('exact-math');

const CashboxInfoTip = props => {
    const { receivablesTemp, payablesTemp, advanceInfo } = props;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div className={styles.infoText}>
                    <PlusCircleFilled style={{ marginRight: '5px' }} /> Debitor
                    Borclar:
                </div>
                <div className={styles.infoAmount}>
                    {Object.keys(receivablesTemp).length !== 0 ? (
                        Object.keys(receivablesTemp).map(item => (
                            <p>
                                {roundToDown(receivablesTemp[item])} {item},
                            </p>
                        ))
                    ) : (
                        <p>0 </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div className={styles.infoText}>
                    <MinusCircleFilled style={{ marginRight: '5px' }} />{' '}
                    Kreditor Borclar:
                </div>
                <div className={styles.infoAmount}>
                    {Object.keys(payablesTemp).length !== 0 ? (
                        Object.keys(payablesTemp).map(item => (
                            <p>
                                {roundToDown(payablesTemp[item])} {item},
                            </p>
                        ))
                    ) : (
                        <p>0 </p>
                    )}
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #848484',
                }}
            >
                <div className={styles.infoText}>
                    {' '}
                    <PlusMinus
                        style={{
                            padding: '2px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            marginRight: '5px',
                        }}
                        fill="#505050"
                    />
                    Avans:{' '}
                </div>
                <div className={styles.infoAmount}>
                    {advanceInfo !== null && advanceInfo.length !== 0 ? (
                        advanceInfo.map(item => (
                            <p>
                                {roundToDown(item.amount)} {item.code},
                            </p>
                        ))
                    ) : (
                        <p>0 </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function CashboxInfoButton(props) {
    const { fetchInfo = () => {}, fetchAdvance = () => {} } = props;

    const [state, setState] = useState({
        visible: false,
        loading: false,
        info: null,
    });
    const [advanceState, setAdvanceState] = useState({
        advanceLoading: false,
        advanceVisible: false,
        advanceInfo: null,
    });

    const { visible, loading, info } = state;
    const { advanceInfo, advanceVisible, advanceLoading } = advanceState;

    function infoClickHandle(isVisible) {
        if (isVisible) {
            setState({
                ...state,
                visible: false,
                loading: true,
            });
            setAdvanceState({
                ...advanceState,
                advanceVisible: false,
                advanceLoading: true,
            });

            return [
                fetchInfo(fetchFinishedCallback),
                fetchAdvance(fetchAdvanceFinishedCallback),
            ];
        }

        setState({
            ...state,
            visible: isVisible,
        });
        setAdvanceState({
            ...advanceState,
            advanceVisible: isVisible,
        });
    }
    function fetchFinishedCallback(data = null) {
        setState({
            info: data,
            visible: true,
            loading: false,
        });
    }
    function fetchAdvanceFinishedCallback(data = null) {
        setAdvanceState({
            advanceInfo:
                data !== null
                    ? data?.data?.myAmount.concat(
                          data?.data?.contactsAmount.map(currencyBalance => ({
                              ...currencyBalance,
                              amount: math.mul(
                                  Number(currencyBalance.amount),
                                  -1
                              ),
                          }))
                      )
                    : null,
            advanceVisible: true,
            advanceLoading: false,
        });
    }

    // eslint-disable-next-line no-var
    let receivablesTemp = {};
    // eslint-disable-next-line no-var
    let payablesTemp = {};

    // eslint-disable-next-line no-unused-expressions
    info !== null
        ? info?.data.forEach(invoice => {
              const {
                  invoiceType,
                  currencyCode,
                  remainingInvoiceDebt,
              } = invoice;
              if (
                  invoiceType === 2 ||
                  invoiceType === 4 ||
                  invoiceType === 13
              ) {
                  receivablesTemp = {
                      ...receivablesTemp,
                      [currencyCode]:
                          (receivablesTemp[currencyCode] || 0) +
                          Number(remainingInvoiceDebt),
                  };
              } else if (
                  invoiceType === 1 ||
                  invoiceType === 3 ||
                  invoiceType === 10 ||
                  invoiceType === 12
              ) {
                  payablesTemp = {
                      ...payablesTemp,
                      [currencyCode]:
                          (payablesTemp[currencyCode] || 0) +
                          Number(remainingInvoiceDebt),
                  };
              }
          })
        : undefined;

    return (
        <Tooltip
            title={
                <CashboxInfoTip
                    receivablesTemp={receivablesTemp}
                    payablesTemp={payablesTemp}
                    advanceInfo={advanceInfo}
                />
            }
            visible={visible && advanceVisible}
            trigger="click"
            onVisibleChange={infoClickHandle}
        >
            <Button type="link" className={styles.infoButton}>
                {loading || advanceLoading ? (
                    <Icon type="sync" spin />
                ) : (
                    <Icon component={FaInfoCircle} />
                )}
            </Button>
        </Tooltip>
    );
}
