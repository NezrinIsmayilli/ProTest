import { Col, Popover, Row, Spin } from 'antd';
import {
  Table as ProTable,
  ProSearch,
  ProInput,
  ProButton,
  ProSelect,
} from 'components/Lib';
import IconButton from 'containers/Orders/utils/IconButton/index';
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { fetchPartnerGoods, clearPartnerGoods } from 'store/actions/goods';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import Content from './Content';
import styles from './styles.module.scss';
import { AddFromCatalog } from './AddFromCatalog';

const math = require('exact-math');
const roundTo = require('round-to');

const Table = props => {
  const {
    mainCurrency,
    orderActions,
    orderStates,
    currencies,
    fetchCurrencies,
    fetchPartnerGoods,
    clearPartnerGoods,
    productsLoading,
    products,
  } = props;
  const {
    updateDescription,
    handleProductCountChange,
    handleProductAdd,
    handleQueryChange,
  } = orderActions;

  const {
    selectedProducts,
    filteredOrderCart,
    seller,
    selectedCounterparty,
  } = orderStates;

  const newProductNameRef = useRef(null);
  const dispatch = useDispatch();
  const [commentIsVisible, setCommentIsVisible] = useState(false);
  const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
  useEffect(() => {
    fetchCurrencies();
  }, []);
  const handleVisibleChange = visible => {
    setCommentIsVisible(visible);
  };

  const handleInformationChange = value => {
    updateDescription(value);
    setCommentIsVisible(false);
  };

  const handleQuantityUpdate = (row, inputValue, type, mode) => {
    handleProductCountChange(inputValue, row, type, mode);
  };

  const handleSearchByName = value => {
    handleQueryChange(value);
  };

  const getTotalOrderCart = selectedProducts => {
    if (selectedProducts.length === 0) return [];
    const totalQuantity = selectedProducts.reduce(
      (totalValue, selectedItem) =>
        math.add(Number(totalValue), Number(selectedItem.quantity)),
      0
    );

    const totalPriceInMainCurrency = selectedProducts.reduce(
      (totalValue, selectedItem) =>
        totalValue +
        math.mul(
          Number(
            currencies?.find(
              currency => currency.id === selectedItem?.currencyId
            )?.rate || 1
          ),
          Number(selectedItem.pricePerUnit),
          Number(selectedItem.quantity)
        ),
      0
    );

    return [
      { isTotal: true, quantity: totalQuantity, totalPriceInMainCurrency },
    ];
  };

  const handleOrderCartColumns = filteredOrderCart => {
    if (filteredOrderCart.length === 0) return [];
    return filteredOrderCart.map(orderItem => ({
      ...orderItem,
      totalPrice: orderItem.pricePerUnit
        ? math.mul(Number(orderItem.quantity), Number(orderItem.pricePerUnit))
        : null,
    }));
  };

  const categories = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (value, { isTotal }, index) => (isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Məhsul',
      dataIndex: 'parentCatalogName',
      width: '200px',
      render: (value, { isTotal, name }) =>
        isTotal ? null : `${value} / ${name}`,
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '150px',
      render: (value, row) =>
        row.isTotal ? (
          value
        ) : (
          <ProInput
            size="default"
            value={value || ''}
            onChange={event =>
              handleQuantityUpdate(
                row,
                event.target.value,
                'quantity',
                'change'
              )
            }
            className={`${Number(value || 0) > 0 ? {} : styles.inputError} ${
              styles.tableInput
            }`}
          />
        ),
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'unitOfMeasurementName',
      key: 'unitOfMeasurementName',
      width: 130,
      render: (value, { isTotal }) => (isTotal ? null : value || '-'),
    },
    {
      title: 'Vahidin qiyməti',
      dataIndex: 'pricePerUnit',
      width: 130,
      render: (value, row) =>
        row.isTotal ? null : seller.isTenant ? (
          <ProInput
            size="default"
            value={
              value !== null
                ? value.endsWith('.')
                  ? value
                  : Number(value)
                : ''
            }
            onChange={event =>
              handleQuantityUpdate(
                row,
                event.target.value,
                'pricePerUnit',
                'change'
              )
            }
            className={`${Number(value || 0) > 0 ? {} : styles.inputError} ${
              styles.tableInput
            }`}
          />
        ) : (
          formatNumberToLocale(defaultNumberFormat(value))
        ),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'totalPrice',
      width: 150,
      render: (value, row) =>
        row.isTotal
          ? null
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${row.currencyCode || mainCurrency?.code}`,
    },
    {
      title: `Məbləğ (${mainCurrency?.code || ''})`,
      dataIndex: 'totalPriceInMainCurrency',
      width: 150,
      render: (value, row) =>
        row.isTotal
          ? `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${mainCurrency?.code || ''}`
          : `${formatNumberToLocale(
              defaultNumberFormat(
                math.mul(
                  Number(
                    currencies?.find(
                      currency => currency.id === row?.currencyId
                    )?.rate || 1
                  ),
                  Number(row.pricePerUnit),
                  Number(row.quantity)
                )
              )
            )} ${mainCurrency?.code || ''}`,
    },
    {
      title: '',
      dataIndex: 'trash',
      key: 'trash',
      width: 60,
      render: (value, row) =>
        row.isTotal ? null : (
          <img
            width={16}
            onClick={() =>
              handleProductCountChange(0, row, 'quantity', 'delete')
            }
            height={16}
            src="/img/icons/trash.svg"
            alt="trash"
            className={styles.icon}
            style={{ cursor: 'pointer' }}
          />
        ),
    },
  ];
  const handleCatalogModal = () => {
    setCatalogModalIsVisible(!catalogModalIsVisible);
  };
  const handleProductNameChange = productName => {
    clearTimeout(newProductNameRef.current);
    if (productName.length > 2) {
      newProductNameRef.current = setTimeout(
        () =>
          fetchPartnerGoods({
            filters: {
              q: productName,
              partnerId: selectedCounterparty.isTenant
                ? null
                : selectedCounterparty.id,
            },
          }),
        600
      );
    } else {
      dispatch(clearPartnerGoods());
    }
  };

  const handleProductSelect = productId => {
    const newProduct = products.filter(product => product.id === productId[0]);

    handleProductAdd(
      newProduct.map(product => ({
        ...product,
        quantity: product.invoiceQuantity ? product.invoiceQuantity + 1 : 1,
      }))
    );
  };
  const handleDropdownClose = open => {
    if (!open) {
      dispatch(clearPartnerGoods());
    }
  };
  return (
    <>
      <AddFromCatalog
        visible={catalogModalIsVisible}
        tableProducts={selectedProducts}
        handleModal={handleCatalogModal}
        selectedCounterparty={selectedCounterparty}
        handleProductAdd={handleProductAdd}
      />

      <Row justify="space-around" align="middle" className={styles.tab}>
        <Col span={6}>
          <span className={styles.tabName}>Sifariş siyahısı</span>
          {/* <ProSearch onSearch={handleSearchByName} /> */}
        </Col>
      </Row>
      <Row style={{ margin: '20px 0' }}>
        <Col span={6}>
          <span style={{ fontSize: ' 14px' }}>Məhsul axtar:</span>
          <ProSelect
            disabled={!selectedCounterparty}
            isSearch
            value={[]}
            mode="multiple"
            allowClear={false}
            placeholder="Məhsul axtar"
            notFoundContent={productsLoading ? <Spin size="small" /> : null}
            keys={['label']}
            data={
              products.length > 0
                ? products
                    .filter(
                      ({ id }) =>
                        !filteredOrderCart.map(({ id }) => id).includes(id)
                    )
                    .map(product => ({
                      ...product,
                      label: `${product.name} (${product.stockAmount ||
                        0} ${product.unitOfMeasurementName || 'ədəd'})`,
                    }))
                : []
            }
            onDropdownVisibleChange={handleDropdownClose}
            onSearch={handleProductNameChange}
            onChange={productId => handleProductSelect(productId)}
          />
        </Col>

        <Col span={9} offset={9} align="end">
          <ProButton
            disabled={!selectedCounterparty}
            onClick={handleCatalogModal}
          >
            Kataloqdan seç
          </ProButton>
          <Popover
            placement="left"
            content={
              <Content handleInformationChange={handleInformationChange} />
            }
            trigger="click"
            visible={commentIsVisible}
            onVisibleChange={handleVisibleChange}
          >
            <IconButton
              buttonSize="large"
              icon="message"
              iconWidth={18}
              iconHeight={15}
              className={styles.exportButton}
              buttonStyle={{ marginTop: '20px', marginLeft: '10px' }}
            />
          </Popover>
        </Col>
      </Row>

      <ProTable
        scroll={{ x: 'max-content', y: 430 }}
        columns={categories}
        // className={styles.customTable}
        bordered={false}
        style={{ marginTop: '30px' }}
        dataSource={handleOrderCartColumns(filteredOrderCart)}
      />
      {filteredOrderCart.length > 0 && (
        <ProTable
          scroll={{ x: 'max-content' }}
          columns={categories}
          className={styles.totalTable}
          bordered={false}
          dataSource={getTotalOrderCart(filteredOrderCart)}
        />
      )}
    </>
  );
};

const mapStateToProps = state => ({
  mainCurrency: state.kassaReducer.mainCurrency,
  currencies: state.currenciesReducer.currencies,
  products: state.goodsReducer.partnerGoods,
  productsLoading: state.loadings.partnerGoods,
});

export default connect(
  mapStateToProps,
  { fetchCurrencies, fetchPartnerGoods, clearPartnerGoods }
)(Table);
