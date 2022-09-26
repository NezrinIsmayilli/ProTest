/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import {
  setOperationsList,
  fetchOperationsList,
} from 'store/actions/finance/operations';
import { Button } from 'antd';
import { round } from 'utils';
import {
  fetchProductionMaterialExpense,
  fetchProductionEmployeeExpense,
  fetchProductionExpense,
  setSelectedProductionEmployeeExpense,
  setSelectedProductionExpense,
  setSelectedProductionMaterial,
  fetchMaterialList,
  fetchProductionExpensesList,
  handleResetInvoiceFields,
} from 'store/actions/sales-operation';
import { fetchOrders } from 'store/actions/orders';
import { getProductComposition } from 'store/actions/product';
import styles from './styles.module.scss';
import OpDetailTab from './productionDetails/opDetailTab';
import Expenses from './productionDetails/Expenses';
import Materials from './productionDetails/Materials';
import EmployeeExpenses from './productionDetails/EmployeeExpenses';
import Indicators from './productionDetails/Indicators';
import TransferredProducts from './productionDetails/TransferredProducts';
import ProductContent from './productionDetails/ProductContent';
import Costs from './productionDetails/Costs';

const math = require('exact-math');
const roundTo = require('round-to');

function OperationsDetails(props) {
  const {
    isDeletedForLog,
    loadingForLogs = false,
    fromGoods = false,
    activeTab,
    setActiveTab,
    visible,
    row,
    fetchOrders,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    setSelectedProductionEmployeeExpense,
    fetchSalesInvoiceInfo,
    fetchProductionExpensesList,
    fetchProductionExpense,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    handleResetInvoiceFields,
    isLoading,
    productionExpensesList,
    selectedProductionExpense,
    materialInvoices,
    selectedProductionMaterial,
    selectedProductionEmployeeExpense,
    mainCurrencyCode,
    setOperationsList,
    fetchMaterialList,
    allBusinessUnits,
    getProductComposition,
    profile,
  } = props;
  const dispatch = useDispatch();
  const [detailsData, setDetailsData] = useState([]);
  const [tableDatas, setTableDatas] = useState([]);
  const [invoiceLength, setInvoiceLength] = useState(undefined);
  const [allExpenses, setAllExpenses] = useState(undefined);
  const [productContents, setProductContents] = useState([]);

  const [orders, setOrders] = useState([]);

  const handleChangeTab = value => setActiveTab(value);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <OpDetailTab
            isDeletedForLog={isDeletedForLog}
            mainCurrencyCode={mainCurrencyCode}
            isLoading={isLoading || loadingForLogs}
            details={detailsData}
            allBusinessUnits={allBusinessUnits}
            profile={profile}
          />
        );
      case 1:
        return (
          <Costs
            details={detailsData}
            visible={visible}
            isLoading={isLoading}
            data={tableDatas}
            allExpenses={allExpenses}
          />
        );
      case 2:
        return (
          <Expenses mainCurrencyCode={mainCurrencyCode} details={detailsData} />
        );
      case 3:
        return (
          <Materials
            mainCurrencyCode={mainCurrencyCode}
            details={detailsData}
          />
        );
      case 4:
        return (
          <EmployeeExpenses
            mainCurrencyCode={mainCurrencyCode}
            details={detailsData}
          />
        );
      case 5:
        return (
          <Indicators
            mainCurrencyCode={mainCurrencyCode}
            details={detailsData}
            data={tableDatas}
          />
        );
      case 6:
        return (
          <TransferredProducts
            isDeletedForLog={isDeletedForLog}
            row={row}
            mainCurrencyCode={mainCurrencyCode}
            restInvoiceData={detailsData}
            tableDatas={tableDatas}
            setInvoiceLength={setInvoiceLength}
          />
        );
      case 7:
        return (
          <ProductContent
            row={row}
            restInvoiceData={detailsData}
            tableDatas={tableDatas}
            orders={orders}
            productContents={productContents}
          />
        );
      default:
    }
  };
  useEffect(() => {
    const totalExpencePrice = selectedProductionExpense.reduce(
      (total, { price }) => total + Number(price),
      0
    );
    const totalEmployeePrice = selectedProductionEmployeeExpense.reduce(
      (total, { price, hours }) =>
        total + math.mul(Number(price), Number(hours || 1)),
      0
    );
    const totalMaterialPrice = selectedProductionMaterial.reduce(
      (total, { price, quantity }) =>
        total + math.mul(Number(price), Number(quantity)),
      0
    );
    const totaInvoicelMaterialPrice = materialInvoices?.reduce(
      (total, { amountInMainCurrency }) => total + Number(amountInMainCurrency),
      0
    );
    const totalProductionEmployeeExpensesList = productionExpensesList
      ?.filter(item => item.transactionType === 6)
      .reduce(
        (total, { amountConvertedToMainCurrency }) =>
          total + Number(amountConvertedToMainCurrency),
        0
      );
    const totalProductionExpensesList = productionExpensesList
      ?.filter(item => item.transactionType === 8 || item.transactionType === 9)
      .reduce(
        (total, { amountConvertedToMainCurrency }) =>
          total + Number(amountConvertedToMainCurrency),
        0
      );
    const totalAllExpense = math.add(
      totalExpencePrice,
      totalEmployeePrice,
      totalMaterialPrice,
      totaInvoicelMaterialPrice,
      totalProductionEmployeeExpensesList,
      totalProductionExpensesList
    );
    setAllExpenses(totalAllExpense);
  }, [
    selectedProductionExpense,
    selectedProductionEmployeeExpense,
    selectedProductionMaterial,
    materialInvoices,
    productionExpensesList,
  ]);
  useEffect(
    () => () => {
      handleResetInvoiceFields();
    },
    []
  );

  useEffect(() => {
    if (!visible) {
      setDetailsData([]);
      setInvoiceLength(undefined);
      dispatch(setOperationsList({ data: [] }));
    }
  }, [visible]);

  useEffect(() => {
    fetchOrders(
      {
        limit: 10000,
        direction: 2,
        statusGroup: 1,
        visualStages: [2, 3, 4, 8, 9, 10, 11, 12, 13],
      },
      ({ data }) => {
        setOrders(data);
      },
      false
    );
  }, []);

  useEffect(() => {
    setActiveTab(0);
    if (row.id) {
      fetchSalesInvoiceInfo({
        id: row.id,
        onSuccess: res => {
          if (res.data.invoiceProducts && res.data.invoiceProducts.content)
            setTableDatas([
              ...Object.keys(res.data.invoiceProducts.content).map(
                index => res.data.invoiceProducts.content[index]
              ),
            ]);

          let invoiceContent = res.data.invoiceProducts;

          const { content } = invoiceContent;

          const selectedProducts = {};
          content
            .filter(item => item.materials.length > 0)
            .forEach(
              ({
                invoiceProductId,
                productId,
                productName,
                quantity,
                pricePerUnit,
                unitOfMeasurementName,
                serialNumber,
                cost,
                planned_cost,
                planned_price,
                materials,
              }) => {
                if (selectedProducts[productId]) {
                  selectedProducts[productId] = {
                    ...selectedProducts[productId],
                    invoiceQuantity: math.add(
                      round(quantity),
                      selectedProducts[productId].invoiceQuantity
                    ),
                  };
                } else {
                  selectedProducts[productId] = {
                    id: productId,
                    invoiceProductId: invoiceProductId,
                    name: productName,
                    barcode: undefined,
                    unitOfMeasurementName,
                    serialNumbers: serialNumber ? [serialNumber] : undefined,
                    invoiceQuantity: round(quantity),
                    invoicePrice: round(pricePerUnit),
                    cost: roundTo(Number(cost), 4),
                    plannedCost: Number(planned_cost),
                    plannedPrice: Number(planned_price),
                    materials: materials,
                  };
                }
              }
            );
          setProductContents(
            Object.values(selectedProducts).map(product => {
              return {
                ...product,
                productContent: product.materials.map(item => {
                  return {
                    ...item,
                    selectedProductId: product.invoiceProductId,
                    rootQuantity: roundTo(Number(product.invoiceQuantity), 2),
                  };
                }),
              };
            })
          );
          setDetailsData(res.data);
        },
      });
      fetchProductionExpensesList({
        filters: { invoices: [row.id], vat: 0, limit: 1000 },
      });
      fetchMaterialList({
        filters: {
          isDeleted: 0,
          attachedInvoices: [row.id],
          invoiceTypes: [6],
          limit: 1000,
        },
      });
      fetchProductionExpense({
        id: row.id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedProductionExpense({
              newSelectedProductionExpense: [...data],
            })
          );
        },
      });
      fetchProductionMaterialExpense({
        id: row.id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedProductionMaterial({
              newSelectedProductionMaterial: [...data],
            })
          );
        },
      });
      fetchProductionEmployeeExpense({
        id: row.id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedProductionEmployeeExpense({
              newSelectedProductionEmployeeExpense: [...data],
            })
          );
        },
      });
    }
  }, [row.id]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailsTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
          disabled={isLoading}
        >
          Əlavə məlumat
        </Button>
        {fromGoods ? null : (
          <>
            <Button
              style={{ borderRadius: 0, borderLeft: 0 }}
              size="large"
              type={activeTab === 1 ? 'primary' : ''}
              onClick={() => handleChangeTab(1)}
              disabled={isLoading}
            >
              Maya dəyərinin hesablanması ({tableDatas.length})
            </Button>
            <Button
              style={{ borderRadius: 0, borderLeft: 0 }}
              size="large"
              type={activeTab === 2 ? 'primary' : ''}
              onClick={() => handleChangeTab(2)}
              disabled={isLoading}
            >
              Xərclər(
              {
                [
                  ...selectedProductionExpense,
                  ...productionExpensesList.filter(
                    item => item.transactionType === 8  || item.transactionType === 9
                  ),
                ]?.length
              }
              )
            </Button>
            <Button
              style={{ borderRadius: 0, borderLeft: 0 }}
              size="large"
              type={activeTab === 3 ? 'primary' : ''}
              onClick={() => handleChangeTab(3)}
              disabled={isLoading}
            >
              Materiallar(
              {[...selectedProductionMaterial, ...materialInvoices]?.length})
            </Button>
            <Button
              style={{ borderRadius: 0, borderLeft: 0 }}
              size="large"
              type={activeTab === 4 ? 'primary' : ''}
              onClick={() => handleChangeTab(4)}
              disabled={isLoading}
            >
              İşçilik(
              {
                [
                  ...selectedProductionEmployeeExpense,
                  ...productionExpensesList.filter(
                    item => item.transactionType === 6
                  ),
                ]?.length
              }
              )
            </Button>
            <Button
              style={
                row?.stockToId === null
                  ? { borderRadius: '0 4px 4px 0' }
                  : { borderRadius: 0, borderLeft: 0 }
              }
              size="large"
              type={activeTab === 5 ? 'primary' : ''}
              onClick={() => handleChangeTab(5)}
              disabled={isLoading}
            >
              Əsas göstəricilər(
              {tableDatas?.length})
            </Button>
          </>
        )}
        {row?.stockToId !== null || detailsData?.stockToId !== null ? (
          <>
            <Button
              style={
                productContents.length > 0
                  ? { borderRadius: 0, borderLeft: 0 }
                  : { borderRadius: '0 4px 4px 0' }
              }
              size="large"
              type={activeTab === 6 ? 'primary' : ''}
              onClick={() => handleChangeTab(6)}
              disabled={isLoading}
            >
              Transfer olunmuş məhsullar (
              {invoiceLength ||
                tableDatas.reduce(
                  (total, { quantity }) => math.add(total || 0, Number(quantity) || 0),
                  0
                )}
              )
            </Button>
          </>
        ) : (
          ''
        )}
        {productContents.length > 0 ? (
          <Button
            style={{ borderRadius: '0 4px 4px 0' }}
            size="large"
            type={activeTab === 7 ? 'primary' : ''}
            onClick={() => handleChangeTab(7)}
            disabled={isLoading}
          >
            Tərkib(
            {[
              ...[].concat(...productContents.map(item => item.productContent)),
            ].reduce(
              (total, item) =>
                math.add(total || 0,
                Number(math.mul(
                  Number(item.quantity || 0),
                  Number(item.rootQuantity || 0)) || 0)
                ),
              0
            )}
            )
          </Button>
        ) : null}
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.financeOperationsReducer.isLoading,
  tenant: state.tenantReducer.tenant,
  productionExpensesList: state.salesOperation.productionExpensesList,
  selectedProductionExpense: state.salesOperation.selectedProductionExpense,
  selectedProductionEmployeeExpense:
    state.salesOperation.selectedProductionEmployeeExpense,
  materialInvoices: state.salesOperation.materialList,
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  {
    fetchSalesInvoiceInfo,
    fetchOperationsList,
    fetchProductionExpensesList,
    fetchMaterialList,
    fetchProductionExpense,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    setSelectedProductionEmployeeExpense,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    handleResetInvoiceFields,
    setOperationsList,
    getProductComposition,
    fetchOrders,
  }
)(OperationsDetails);
