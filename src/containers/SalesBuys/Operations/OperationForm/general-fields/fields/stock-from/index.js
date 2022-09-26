import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ProSelect, ProFormItem } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { setSelectedProducts } from 'store/actions/sales-operation';
import styles from '../../../styles.module.scss';
import { useParams } from 'react-router-dom';

const StockFromField = props => {
    const {
        inputError,
        form,
        field,
        stocks,
        stocksLoading,
        setSelectedProducts,
        disabled,
        invoiceInfo,
    } = props;
    const {
        getFieldError,
        getFieldValue,
        getFieldDecorator,
        setFieldsValue,
    } = form;
    const { label, placeholder, name } = field;
    const { id } = useParams();

    useEffect(() => {
        let fromStock = getFieldValue('stockTo')
            ? stocks.filter(stock => stock.id !== getFieldValue('stockTo').id)
            : stocks;
        if (
            fromStock.length === 1 &&
            fromStock[0].id !== getFieldValue('stockTo')
        ) {
            setFieldsValue({
                stockFrom: fromStock[0].id,
            });
        }
    }, [stocks]);
    return (
        <div className={styles.field}>
            <ProFormItem label={label} help={getFieldError(name)?.[0]}>
                {getFieldDecorator(name, {
                    getValueFromEvent: stockId => {
                        setSelectedProducts({ newSelectedProducts: [] });
                        return stockId;
                    },
                    rules: [requiredRule],
                })(
                    <ProSelect
                        loading={stocksLoading}
                        placeholder={placeholder}
                        data={
                            getFieldValue('stockTo')
                                ? stocks.filter(
                                      stock =>
                                          stock.id !== getFieldValue('stockTo')
                                  )
                                : stocks
                        }
                        disabled={
                            disabled ||
                            stocksLoading ||
                            invoiceInfo?.isUsedByAnotherInvoice
                        }
                    />
                )}
            </ProFormItem>
        </div>
    );
};

const mapStateToProps = state => ({
    stocksLoading: state.loadings.fetchStocks,
    stocks: state.stockReducer.stocks,
});

export const StockFrom = connect(
    mapStateToProps,
    { setSelectedProducts }
)(StockFromField);
