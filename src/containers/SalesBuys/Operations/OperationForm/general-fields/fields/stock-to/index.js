import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProSelect, ProFormItem } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { Tooltip } from 'antd';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { useParams } from 'react-router-dom';
import StockAdd from './stockAdd';
import styles from '../../../styles.module.scss';

const StockToField = props => {
    const {
        form,
        field,
        stocks,
        stocksLoading,
        disabled,
        unitStock,
        setUnitStock,
        invoiceInfo,
    } = props;
    const {
        getFieldValue,
        getFieldError,
        getFieldDecorator,
        setFieldsValue,
    } = form;
    const { label, placeholder, name, fromTransfer } = field;

    const [stockItem, setStockItem] = useState(false);
    const [data, setData] = useState(undefined);
    const { id } = useParams();
    const handleStockItem = () => {
        setStockItem(true);
    };

    const Stocks = fromTransfer
        ? unitStock
            ? getFieldValue('stockFrom')
                ? [
                      ...unitStock?.find(
                          unitStocks =>
                              unitStocks.id === getFieldValue('stockFrom')
                      ).transferStocks,
                      ...unitStock.filter(
                          stock => stock.id !== getFieldValue('stockFrom')
                      ),
                  ]
                : unitStock
            : getFieldValue('stockFrom')
            ? stocks.filter(stock => stock.id !== getFieldValue('stockFrom'))
            : stocks
        : getFieldValue('stockFrom')
        ? stocks.filter(stock => stock.id !== getFieldValue('stockFrom'))
        : stocks;

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        data
            ? fromTransfer
                ? null
                : setFieldsValue({
                      stockTo: stocks[0]?.id,
                  })
            : undefined;

        if (!id && Stocks.length === 1) {
            if (
                getFieldValue('stockFrom') &&
                Stocks[0].id === getFieldValue('stockFrom')
            ) {
                setFieldsValue({
                    stockTo: undefined,
                });
            } else {
                setFieldsValue({
                    stockTo: Stocks[0]?.id,
                });
            }
        }
    }, [Stocks.length]);
    return (
        <>
            <StockAdd
                visible={stockItem}
                toggleVisible={setStockItem}
                setData={setData}
                setUnitStock={setUnitStock}
                fromTransfer={fromTransfer}
                invoiceInfo={invoiceInfo}
                id={id}
            />
            <div className={styles.field} style={{ position: 'relative' }}>
                {fromTransfer ||
                disabled ||
                invoiceInfo?.isUsedByAnotherInvoice ? null : (
                    <Tooltip title="Anbar əlavə et">
                        <PlusIcon
                            color="#FF716A"
                            className={styles.plusBtn}
                            onClick={handleStockItem}
                        />
                    </Tooltip>
                )}
                <ProFormItem label={label} help={getFieldError('stockTo')?.[0]}>
                    {getFieldDecorator('stockTo', {
                        getValueFromEvent: category => category,
                        rules: [requiredRule],
                    })(
                        <ProSelect
                            loading={stocksLoading}
                            disabled={
                                stocksLoading ||
                                disabled ||
                                invoiceInfo?.isUsedByAnotherInvoice
                            }
                            placeholder={placeholder}
                            data={
                                fromTransfer
                                    ? unitStock
                                        ? getFieldValue('stockFrom')
                                            ? [
                                                  ...unitStock?.find(
                                                      unitStocks =>
                                                          unitStocks.id ===
                                                          getFieldValue(
                                                              'stockFrom'
                                                          )
                                                  ).transferStocks,
                                                  ...unitStock.filter(
                                                      stock =>
                                                          stock.id !==
                                                          getFieldValue(
                                                              'stockFrom'
                                                          )
                                                  ),
                                              ]
                                            : unitStock
                                        : getFieldValue('stockFrom')
                                        ? stocks.filter(
                                              stock =>
                                                  stock.id !==
                                                  getFieldValue('stockFrom')
                                          )
                                        : stocks
                                    : getFieldValue('stockFrom')
                                    ? stocks.filter(
                                          stock =>
                                              stock.id !==
                                              getFieldValue('stockFrom')
                                      )
                                    : stocks
                            }
                        />
                    )}
                </ProFormItem>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    stocksLoading: state.loadings.fetchStocks,
    stocks: state.stockReducer.stocks,
});

export const StockTo = connect(
    mapStateToProps,
    null
)(StockToField);
