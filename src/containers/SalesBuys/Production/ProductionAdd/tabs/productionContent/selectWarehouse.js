import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Form, Spin } from 'antd';
import { fetchSalesInvoiceList } from 'store/actions/reports/order-report';
import {
    fetchProductionProductOrder,
    deleteProductionProductOrder,
} from 'store/actions/sales-operation';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import { requiredRule } from 'utils/rules';
import { ProSelect, ProModal, ProFormItem, ProButton } from 'components/Lib';
import { MdKeyboardArrowRight } from 'react-icons/md';
import WritingOffModal from './writingOffModal';

import styles from '../../styles.module.scss';

const math = require('exact-math');

function SelectWarehouse(props) {
    const {
        id,
        form,
        stocksLoading,
        stocks,
        collapseData,
        checkList,
        isLoading,
        stockStatistics,
        productionInvoice,
        selectedProducts,
        setSelectedProducts,
        changeCost,
        setWarehouseModal,
        warehouseModal,
        productionMaterialsStock,
    } = props;

    const {
        validateFields,
        getFieldDecorator,
        getFieldError,
        getFieldValue,
        setFieldsValue,
        resetFields,
    } = form;

    const [data, setData] = useState([]);
    const [writingOffModal, setWritingOffModal] = useState(false);

    useEffect(() => {
        if (!warehouseModal) {
            setFieldsValue({ warehouse: undefined });
        }
    }, [warehouseModal]);

    useEffect(() => {
        setFieldsValue({
            warehouse: productionMaterialsStock,
        });
    }, [productionMaterialsStock, warehouseModal]);

    useEffect(() => {
        if (stocks.length === 1) {
            setFieldsValue({ warehouse: stocks[0].id });
        }
    }, [stocks, warehouseModal]);

    useEffect(() => {
        if (collapseData) {
            setData(
                collapseData
                    ?.filter(data => data.id === checkList?.parentId)?.[0]
                    ?.productContent?.filter(content =>
                        checkList?.checkedListAll.includes(content.id)
                    )
                    .map(item => ({
                        ...item,
                        stockFrom: getFieldValue('warehouse'),
                        stockQuantity: stockStatistics
                            ?.filter(
                                stock =>
                                    stock.product_id === item.product.id &&
                                    Number(getFieldValue('warehouse')) ===
                                        stock.stock_id
                            )
                            .reduce(
                                (total, current) =>
                                    math.add(
                                        Number(total),
                                        Number(current.quantity)
                                    ),
                                0
                            ),
                    }))
            );
        }
    }, [
        checkList.parentId,
        collapseData,
        getFieldValue('warehouse'),
        warehouseModal,
        writingOffModal,
    ]);

    useEffect(() => {
        if (data) {
            setSelectedProducts(
                data
                    .filter(({ stockQuantity }) => Number(stockQuantity) > 0)
                    .map(item => ({
                        ...item.product,
                        quantity: item.stockQuantity,
                        invoiceQuantity:
                            math.sub(
                                Number(
                                    math.mul(
                                        Number(
                                            collapseData?.find(
                                                ({ invoiceProductId }) =>
                                                    item.selectedProductId ===
                                                    invoiceProductId
                                            ).invoiceQuantity || 0
                                        ),
                                        Number(item.quantity || 0)
                                    )
                                ),
                                Number(item.usedCount || 0)
                            ) <= item.stockQuantity
                                ? math.sub(
                                      Number(
                                          math.mul(
                                              Number(
                                                  collapseData?.find(
                                                      ({ invoiceProductId }) =>
                                                          item.selectedProductId ===
                                                          invoiceProductId
                                                  ).invoiceQuantity || 0
                                              ),
                                              Number(item.quantity || 0)
                                          )
                                      ),
                                      Number(item.usedCount || 0)
                                  )
                                : item.stockQuantity,
                        stockFrom: item.stockFrom,
                    }))
            );
        }
    }, [data]);

    const handleWarehouseSubmit = event => {
        event.preventDefault();
        validateFields((errors, values) => {
            if (!errors) {
                setWritingOffModal(true);
            }
        });
    };

    const columns = [
        {
            title: '№',
            width: 50,
            render: (val, row, index) => index + 1,
        },
        {
            title: 'Məhsul adı',
            dataIndex: 'product',
            width: 190,
            render: (val, row) => val?.name,
        },
        {
            title: 'Tələb edilən miqdar',
            dataIndex: 'usedCount',
            width: 180,
            align: 'center',
            render: (value, row) =>
                formatNumberToLocale(
                    defaultNumberFormat(
                        math.sub(
                            Number(
                                math.mul(
                                    Number(
                                        collapseData?.find(
                                            ({ invoiceProductId }) =>
                                                row.selectedProductId ===
                                                invoiceProductId
                                        ).invoiceQuantity || 0
                                    ),
                                    Number(row.quantity || 0)
                                )
                            ),
                            Number(value || 0)
                        )
                    )
                ),
        },
        {
            title: 'Anbardakı miqdar',
            dataIndex: 'product',
            width: 170,
            align: 'center',
            render: value =>
                Number(getFieldValue('warehouse'))
                    ? formatNumberToLocale(
                          defaultNumberFormat(
                              stockStatistics
                                  ?.filter(
                                      item =>
                                          item.product_id === value.id &&
                                          Number(getFieldValue('warehouse')) ===
                                              item.stock_id
                                  )
                                  .reduce(
                                      (total, current) =>
                                          math.add(
                                              Number(total),
                                              Number(current.quantity)
                                          ),
                                      0
                                  )
                          )
                      )
                    : '-',
        },
    ];

    return (
        <>
            <ProModal
                maskClosable
                width={1000}
                isVisible={writingOffModal}
                customStyles={styles.AddSerialNumbersModal}
                handleModal={() => setWritingOffModal(false)}
            >
                <WritingOffModal
                    id={id}
                    stocks={stocks}
                    selectedProducts={selectedProducts}
                    collapseData={collapseData}
                    checkList={checkList}
                    setSelectedProducts={setSelectedProducts}
                    productionInvoice={productionInvoice}
                    changeCost={changeCost}
                    writingOffModal={writingOffModal}
                    setWritingOffModal={setWritingOffModal}
                    setWarehouseModal={setWarehouseModal}
                    stockFrom={getFieldValue('warehouse')}
                />
            </ProModal>
            <div className={styles.AddFromCatalog}>
                <h2>Anbar seçimi</h2>
                <Spin spinning={stocksLoading}>
                    <Form
                        onSubmit={event => handleWarehouseSubmit(event)}
                        style={{ textAlign: 'right' }}
                    >
                        <ProFormItem
                            label="Anbar"
                            customStyle={styles.formItemWarehouse}
                            help={getFieldError('warehouse')?.[0]}
                        >
                            {getFieldDecorator('warehouse', {
                                rules: [requiredRule],
                            })(
                                <ProSelect
                                    className={styles.selectBox}
                                    style={{ marginBottom: 0 }}
                                    data={stocks}
                                />
                            )}
                        </ProFormItem>
                        <Table
                            dataSource={collapseData
                                ?.filter(
                                    data => data.id === checkList.parentId
                                )?.[0]
                                ?.productContent?.filter(content =>
                                    checkList.checkedListAll.includes(
                                        content.id
                                    )
                                )}
                            columns={columns}
                            pagination={false}
                            rowKey={record => record.id}
                            scroll={{ x: 'max-content', y: 500 }}
                        />
                        <ProButton htmlType="submit" type="primary">
                            Davam et
                            <MdKeyboardArrowRight
                                style={{ verticalAlign: 'middle' }}
                            />
                        </ProButton>
                    </Form>
                </Spin>
            </div>
        </>
    );
}

const mapStateToProps = state => ({
    invoices: state.orderReportReducer.invoices,
    isLoading: state.orderReportReducer.isLoading,
    tenant: state.tenantReducer.tenant,
    deleteProductionProductOrderLoading:
        state.loadings.deleteProductionProductOrder,
    stockStatistics: state.stockReducer.stocksStatics,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchProductionProductOrder,
        deleteProductionProductOrder,
    }
)(Form.create({ name: 'SelectWarehouse' })(SelectWarehouse));
