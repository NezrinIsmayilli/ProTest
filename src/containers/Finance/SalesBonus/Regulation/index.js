import React, { useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { Can, ProInput, ProSelect } from 'components/Lib';
import swal from '@sweetalert/with-react';
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
} from 'react-icons/all';
import { Table, Button, Spin, Tooltip } from 'antd';
import {
  createProductConfiguration,
  fetchProductConfiguration,
  setSelectedProductConfiguration,
  editProductConfiguration,
  deleteProductConfiguration,
} from 'store/actions/finance/salesBonus';
import { re_amount } from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import { toast } from 'react-toastify';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import ReportTabs from '../Tabs';
import SettingsPanel from './SettingsPanel';
import SalesBonusSidebar from './Sidebar';
import styles from './styles.module.scss';

function Regulation(props) {
  const {
    isLoading,
    fetchProductConfigurationLoading,
    fetchProductConfiguration,
    productConfiguration,
    createProductConfiguration,
    selectedConfiguration,
    editProductConfiguration,
    deleteProductConfiguration,
    permissionsByKeyValue,
    fetchMainCurrency,
    mainCurrency,
  } = props;
  const newProductNameRef = useRef(null);
  const { sales_bonus_configuration } = permissionsByKeyValue;
  const isEditDisabled = sales_bonus_configuration.permission !== 2;
  const defaultData = [
    {
      salesBonusConfiguration: selectedConfiguration?.id,
      bonusUnitOfMeasurement: 1,
      children: [],
      catalogId: null,
      catalogName: null,
      configurationProductId: `0_0_0`,
      minTurnoverAmount: 0,
      bonusAmount: 0,
      id: 'default',
      productId: null,
      productName: null,
      subCatalogId: null,
      subCatalogName: null,
      turnoverUnitOfMeasurement: 2,
    },
  ];
  const [selected, setSelected] = useState(defaultData);
  const [allData, setAllData] = useState();
  const [isEdited, setIsEdited] = useState(false);
  const [sortedData, setSortedData] = useState();
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [selectedId, setSelectedId] = useState(undefined);
  const [selectedFrontRow, setSelectedFrontRow] = useState(undefined);
  const [defaultExpand, setDefaultExpand] = useState([]);

  const dispatch = useDispatch();
  useEffect(() => {
    fetchMainCurrency();
    setDefaultExpand([]);
  }, []);
  useEffect(() => {
    fetchProductConfiguration({
      filters: { salesBonusConfiguration: selectedConfiguration?.id },
    });
    setDefaultExpand([]);
  }, [selectedConfiguration]);
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'center',
      width: 100,
      render: (value, row, index) =>
        row.hasOwnProperty('children') ? (
          <span style={{ color: '#151414', fontWeight: 500 }}>{index + 1}</span>
        ) : (
          <span style={{ marginLeft: '10px' }}>
            {`${sortedData.indexOf(
              sortedData.find(
                data =>
                  data.configurationProductId === row.configurationProductId
              )
            ) + 1}.${index + 1}`}
          </span>
        ),
    },
    {
      title: 'Kataloq',
      dataIndex: 'catalogName',
      width: 200,
      ellipsis: true,
      render: (value, row) =>
        value ? (
          <Tooltip placement="topLeft" title={value || ''}>
            <span
              style={
                row.hasOwnProperty('children') ? {} : { marginLeft: '15px' }
              }
            >
              {value}
            </span>
          </Tooltip>
        ) : (
          <span
            style={row.hasOwnProperty('children') ? {} : { marginLeft: '15px' }}
          >
            Hamısı
          </span>
        ),
    },
    {
      title: 'Alt Kataloq',
      dataIndex: 'subCatalogName',
      width: 200,
      ellipsis: true,
      render: value => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{value || 'Hamısı'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Məhsul',
      dataIndex: 'productName',
      width: 200,
      ellipsis: true,
      render: value => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{value || 'Hamısı'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Minimum dövriyyə',
      dataIndex: 'minTurnoverAmount',
      align: 'center',
      width: 200,
      render: (value, row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <ProInput
            disabled={isEditDisabled}
            style={{ width: '55%' }}
            size="default"
            value={value === '0' ? 0 : value}
            onChange={event =>
              handleMinimumUpdate(row, row.id, event.target.value, 'amount')
            }
            className={`${
              (Number(value || 0) >= 0 &&
                row.turnoverUnitOfMeasurement === 2 &&
                Number(row.bonusAmount || 0) > 0) ||
              (Number(row.minTurnoverAmount || 0) > 0 &&
                row.turnoverUnitOfMeasurement === 1 &&
                Number(row.bonusAmount || 0) > 0) ||
              (row.id === 'default' &&
                Number(row.minTurnoverAmount || 0) >= 0 &&
                row.turnoverUnitOfMeasurement === 2) ||
              (row.id === 'default' &&
                Number(row.minTurnoverAmount || 0) > 0 &&
                row.turnoverUnitOfMeasurement === 1)
                ? {}
                : styles.inputError
            } ${styles.tableInput}`}
          />
          <ProSelect
            disabled={isEditDisabled || !row.hasOwnProperty('children')}
            allowClear={false}
            style={{ width: '40%', marginBottom: '0' }}
            size="medium"
            value={row.turnoverUnitOfMeasurement}
            onChange={values =>
              handleChangeMeasurement(row, row.id, values, 'amount')
            }
            data={[
              { id: 1, name: 'Say' },
              { id: 2, name: mainCurrency?.code },
            ]}
          />
        </div>
      ),
    },
    {
      title: 'Maksimum dövriyyə',
      dataIndex: 'maxTurnoverAmount',
      width: 170,
      align: 'center',
      render: value => value || 'Sonsuz',
    },
    {
      title: 'Bonus',
      dataIndex: 'bonusAmount',
      width: 200,
      align: 'center',
      render: (value, row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <ProInput
            disabled={isEditDisabled}
            style={{ width: '55%' }}
            size="default"
            value={value === '0' ? 0 : value}
            onChange={event =>
              handleMinimumUpdate(row, row.id, event.target.value, 'bonus')
            }
            className={`${
              Number(value || 0) > 0 || row.id === 'default'
                ? {}
                : styles.inputError
            } ${styles.tableInput}`}
          />
          <ProSelect
            disabled={
              isEditDisabled ||
              !row.hasOwnProperty('children') ||
              row.turnoverUnitOfMeasurement === 2
            }
            allowClear={false}
            style={{ width: '40%', marginBottom: '0' }}
            size="medium"
            value={row.bonusUnitOfMeasurement}
            onChange={values =>
              handleChangeMeasurement(row, row.id, values, 'bonus')
            }
            data={[{ id: 1, name: '%' }, { id: 2, name: mainCurrency?.code }]}
          />
        </div>
      ),
    },
    {
      title: 'Seç',
      align: 'center',
      width: 100,
      render: (value, row) => (
        <Can I={accessTypes.manage} a={permissions.sales_bonus_configuration}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {row.hasOwnProperty('children') ? (
              <PlusIcon
                color="#FF716A"
                style={
                  row.id === 'default'
                    ? {
                        marginRight: '32px',
                        cursor: 'pointer',
                        width: '16px',
                      }
                    : { cursor: 'pointer', width: '16px' }
                }
                onClick={() => handleAddRowClick(row, row.id)}
              />
            ) : null}

            {row.id === 'default' ? null : (
              <Button
                type="link"
                icon="delete"
                style={
                  row.hasOwnProperty('children') ? {} : { marginLeft: '18px' }
                }
                className={styles.button}
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick(row.id);
                }}
              />
            )}
          </div>
        </Can>
      ),
    },
  ];
  const handleMinimumUpdate = (row, id, value, type) => {
    let newProducts = [];
    if (value === '') {
      newProducts = selected.map(selectedProduct =>
        selectedProduct?.configurationProductId === row?.configurationProductId
          ? type === 'amount'
            ? row?.hasOwnProperty('children')
              ? { ...row, minTurnoverAmount: null }
              : {
                  ...selectedProduct,
                  children: selectedProduct.children.map(child =>
                    child.id === id
                      ? { ...child, minTurnoverAmount: null }
                      : child
                  ),
                }
            : row?.hasOwnProperty('children')
            ? { ...row, bonusAmount: null }
            : {
                ...selectedProduct,
                children: selectedProduct.children.map(child =>
                  child.id === id ? { ...child, bonusAmount: null } : child
                ),
              }
          : selectedProduct
      );
      setSelected(newProducts);
    }
    if (row.bonusUnitOfMeasurement == 1 && type === 'bonus') {
      if (re_amount.test(value) && value <= 100) {
        newProducts = selected.map(selectedProduct =>
          selectedProduct?.configurationProductId ===
          row?.configurationProductId
            ? type === 'amount'
              ? row?.hasOwnProperty('children')
                ? { ...row, minTurnoverAmount: value }
                : {
                    ...selectedProduct,
                    children: selectedProduct.children.map(child =>
                      child.id === id
                        ? { ...child, minTurnoverAmount: value }
                        : child
                    ),
                  }
              : row?.hasOwnProperty('children')
              ? { ...row, bonusAmount: value }
              : {
                  ...selectedProduct,
                  children: selectedProduct.children.map(child =>
                    child.id === id ? { ...child, bonusAmount: value } : child
                  ),
                }
            : selectedProduct
        );
        setSelected(newProducts);
      }
    } else if (re_amount.test(value) && value < 1000000) {
      newProducts = selected.map(selectedProduct =>
        selectedProduct?.configurationProductId === row?.configurationProductId
          ? type === 'amount'
            ? row?.hasOwnProperty('children')
              ? { ...row, minTurnoverAmount: value }
              : {
                  ...selectedProduct,
                  children: selectedProduct.children.map(child =>
                    child.id === id
                      ? { ...child, minTurnoverAmount: value }
                      : child
                  ),
                }
            : row?.hasOwnProperty('children')
            ? { ...row, bonusAmount: value }
            : {
                ...selectedProduct,
                children: selectedProduct.children.map(child =>
                  child.id === id ? { ...child, bonusAmount: value } : child
                ),
              }
          : selectedProduct
      );
      setSelected(newProducts);
    }
    if (id) {
      setSelectedRow(row);
      setSelectedId(id);
    } else {
      setSelectedFrontRow(row);
    }
  };
  useEffect(() => {
    if (selectedRow) {
      const rowForChange = selectedRow?.hasOwnProperty('children')
        ? selected.find(selectedItem => selectedItem.id === selectedId)
        : selected.find(selectedItem =>
            selectedItem.children?.find(child => child.id === selectedId)
          );
      const data = selectedRow?.hasOwnProperty('children')
        ? {
            minTurnoverAmount: rowForChange?.minTurnoverAmount,
            bonusAmount: rowForChange?.bonusAmount,
            turnoverUnitOfMeasurement: rowForChange?.turnoverUnitOfMeasurement,
            bonusUnitOfMeasurement: rowForChange?.bonusUnitOfMeasurement,
          }
        : {
            minTurnoverAmount: rowForChange?.children.find(
              child => child.id === selectedId
            ).minTurnoverAmount,
            bonusAmount: rowForChange?.children.find(
              child => child.id === selectedId
            ).bonusAmount,
            turnoverUnitOfMeasurement: rowForChange?.turnoverUnitOfMeasurement,
            bonusUnitOfMeasurement: rowForChange?.bonusUnitOfMeasurement,
          };
      const dataForDefault = {
        salesBonusConfiguration: rowForChange?.salesBonusConfiguration,
        catalog: rowForChange?.catalogId,
        subCatalog: rowForChange?.subCatalogId,
        product: rowForChange?.productId,
        minTurnoverAmount: rowForChange?.minTurnoverAmount,
        bonusAmount: rowForChange?.bonusAmount,
        turnoverUnitOfMeasurement: rowForChange?.turnoverUnitOfMeasurement,
        bonusUnitOfMeasurement: rowForChange?.bonusUnitOfMeasurement,
      };
      clearTimeout(newProductNameRef.current);
      if (
        data.bonusAmount != null &&
        data.bonusAmount > 0 &&
        data.minTurnoverAmount != null
      )
        if (selectedId !== 'default') {
          newProductNameRef.current = setTimeout(
            () =>
              editProductConfiguration(
                selectedId,
                data,
                onSuccess,
                ({ error }) => {
                  if (
                    error?.response?.data?.error?.messageKey ===
                    'minTurnoverAmount must be greater than 0'
                  ) {
                    return toast.error(
                      'Ölçü vahidi ədəd seçildikdə, minimum dövriyyə 0 ola bilməz.'
                    );
                  }
                  const wrongTurnover = error?.response?.data?.error?.errors;
                  if (
                    wrongTurnover?.key ===
                    'bonus_sales_configuration_wrong_turnover_amount'
                  ) {
                    return toast.error(
                      `Minimum dövriyyə ${wrongTurnover?.data?.number}-dan çox olmalıdır`
                    );
                  }
                }
              ),
            1500
          );
        } else {
          newProductNameRef.current = setTimeout(
            () =>
              createProductConfiguration(
                dataForDefault,
                onSuccess,
                ({ error }) => {
                  if (
                    error?.response?.data?.error?.messageKey ===
                    'minTurnoverAmount must be greater than 0'
                  ) {
                    return toast.error(
                      'Ölçü vahidi ədəd seçildikdə, minimum dövriyyə 0 ola bilməz.'
                    );
                  }
                  const wrongTurnover = error?.response?.data?.error?.errors;
                  if (
                    wrongTurnover?.key ===
                    'bonus_sales_configuration_wrong_turnover_amount'
                  ) {
                    return toast.error(
                      `Minimum dövriyyə ${wrongTurnover?.data?.number}-dan çox olmalıdır`
                    );
                  }
                }
              ),
            1500
          );
        }
    }
  }, [selectedRow]);
  const onSuccess = () => {
    setSelected(defaultData);
    fetchProductConfiguration({
      filters: { salesBonusConfiguration: selectedConfiguration?.id },
    });
  };
  useEffect(() => {
    if (selectedFrontRow) {
      const rowForChange = selected.find(
        selectedItem =>
          selectedItem.configurationProductId ===
          selectedFrontRow.configurationProductId
      );
      const data = {
        salesBonusConfiguration: rowForChange?.salesBonusConfiguration,
        catalog: rowForChange.catalogId,
        subCatalog: rowForChange.subCatalogId,
        product: rowForChange.productId,
        minTurnoverAmount: rowForChange.id
          ? rowForChange?.children[rowForChange?.children?.length - 1]
              ?.minTurnoverAmount
          : rowForChange?.minTurnoverAmount,
        bonusAmount: rowForChange.id
          ? rowForChange?.children[rowForChange?.children?.length - 1]
              ?.bonusAmount
          : rowForChange?.bonusAmount,
        turnoverUnitOfMeasurement: rowForChange?.turnoverUnitOfMeasurement,
        bonusUnitOfMeasurement: rowForChange?.bonusUnitOfMeasurement,
      };
      clearTimeout(newProductNameRef.current);
      if (
        data.bonusAmount != null &&
        data.bonusAmount > 0 &&
        data.minTurnoverAmount != null
      ) {
        newProductNameRef.current = setTimeout(
          () =>
            createProductConfiguration(data, onSuccess, ({ error }) => {
              if (
                error?.response?.data?.error?.messageKey ===
                'minTurnoverAmount must be greater than 0'
              ) {
                return toast.error(
                  'Ölçü vahidi ədəd seçildikdə, minimum dövriyyə 0 ola bilməz.'
                );
              }
              const wrongTurnover = error?.response?.data?.error?.errors;
              if (
                wrongTurnover?.key ===
                'bonus_sales_configuration_wrong_turnover_amount'
              ) {
                return toast.error(
                  `Minimum dövriyyə ${wrongTurnover?.data?.number}-dan çox olmalıdır`
                );
              }
            }),
          1000
        );
      }
    }
  }, [selectedFrontRow]);

  const handleChangeMeasurement = (row, id, value, type) => {
    let newProducts = [];
    newProducts = selected.map(selectedProduct =>
      selectedProduct === row
        ? type === 'amount'
          ? {
              ...row,
              turnoverUnitOfMeasurement: value,
              bonusUnitOfMeasurement:
                value === 1 ? row?.bonusUnitOfMeasurement : 1,
              minTurnoverAmount:
                value === 1
                  ? row?.minTurnoverAmount || 1
                  : row?.minTurnoverAmount || 0,
            }
          : { ...row, bonusUnitOfMeasurement: value }
        : selectedProduct
    );
    setSelected(newProducts);
    if (id) {
      setSelectedRow(row);
      setSelectedId(id);
    } else {
      setSelectedFrontRow(row);
    }
  };

  useEffect(() => {
    if (allData) {
      allData.sort((a, b) => {
        if (a.configurationProductId < b.configurationProductId) {
          return -1;
        }
        if (a.configurationProductId > b.configurationProductId) {
          return 1;
        }
        return 0;
      });
    }
    setSortedData(allData);
  }, [allData]);
  useEffect(() => {
    if (productConfiguration && productConfiguration.length > 0) {
      const defaultFound = productConfiguration.find(
        product => product.configurationProductId === '0_0_0'
      );
      if (defaultFound) {
        setSelected([...productConfiguration]);
      } else {
        setSelected([...productConfiguration, ...defaultData]);
      }
    } else {
      setSelected([...defaultData]);
    }
  }, [productConfiguration]);

  useEffect(() => {
    setAllData(selected);
  }, [selected]);
  const handleDeleteClick = id => {
    swal({
      title: 'Silmək istədiyinizə əminsinizmi?',
      icon: 'warning',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id) {
          dispatch(deleteProductConfiguration(id, onSuccess));
        } else {
          setSelected(defaultData);
          fetchProductConfiguration({
            filters: { salesBonusConfiguration: selectedConfiguration?.id },
          });
        }
      }
    });
  };
  const handleAddRowClick = (row, id) => {
    const isDouble = selected.filter(selectedItem => {
      return selectedItem.children.some(({ bonusAmount, id }) => {
        if (!id && !bonusAmount && !bonusAmount > 0) {
          return true;
        }
        return false;
      });
    });
    if (id === 'default') {
      toast.error('Məhsula bonus əlavə edilməyib');
    } else if (isDouble && isDouble.length > 0) {
      toast.error('Cədvəldə bonusu əlavə olunmamış məhsul mövcuddur');
    } else {
      setDefaultExpand([id]);
      setSelected(prevSelected =>
        prevSelected.map(selected => {
          if (selected.configurationProductId === row?.configurationProductId)
            return {
              ...selected,
              salesBonusConfiguration: selectedConfiguration?.id,
              children: [
                ...selected.children,
                {
                  catalogName: selected?.catalogName,
                  configurationProductId: selected?.configurationProductId,
                  productName: selected?.productName,
                  subCatalogName: selected?.subCatalogName,
                  turnoverUnitOfMeasurement:
                    selected?.turnoverUnitOfMeasurement,
                  bonusUnitOfMeasurement: selected?.bonusUnitOfMeasurement,
                  minTurnoverAmount:
                    selected?.turnoverUnitOfMeasurement === 1 ? 1 : 0,
                  bonusAmount: 0,
                },
              ],
            };
          return selected;
        })
      );
    }
  };
  const customExpandIcon = props => {
    if (
      props?.record?.children?.length < 1 ||
      !props?.record?.hasOwnProperty('children')
    ) {
      return <span style={{ display: 'inline-block', width: '36px' }}></span>;
    }
    if (props?.expanded) {
      return (
        <a
          style={{
            color: 'black',
            marginRight: '15px',
            display: 'inline-block',
          }}
          onClick={e => {
            props.onExpand(props.record, e);
          }}
        >
          <IoIosArrowDropdownCircle
            style={{ verticalAlign: 'middle' }}
            fontSize="22px"
            color="#505050"
          />
        </a>
      );
    }
    return (
      <a
        style={{ color: 'black', marginRight: '15px', display: 'inline-block' }}
        onClick={e => {
          props.onExpand(props.record, e);
        }}
      >
        <IoIosArrowDroprightCircle
          style={{ verticalAlign: 'middle' }}
          fontSize="22px"
          color="#505050"
        />
      </a>
    );
  };
  const handleExpand = (props, row) => {
    if (props) {
      setDefaultExpand([row.id]);
    } else {
      setDefaultExpand(defaultExpand =>
        defaultExpand.filter(item => item !== row.id)
      );
    }
  };
  return (
    <section>
      <SalesBonusSidebar setIsEdited={setIsEdited} isEdited={isEdited} />

      <section className="scrollbar aside" id="ProductionCalendarMainArea">
        <div className="container">
          <ReportTabs />
          <SettingsPanel
            setDefaultExpand={setDefaultExpand}
            defaultExpand={defaultExpand}
            setIsEdited={setIsEdited}
            selected={selected}
            setSelected={setSelected}
          />
          <Spin spinning={isLoading || fetchProductConfigurationLoading}>
            <Table
              className={styles.salesBonusRegulation}
              pagination={false}
              scroll={{ x: 'max-content' }}
              dataSource={sortedData}
              rowKey={record => record.id}
              expandedRowKeys={defaultExpand}
              onExpand={(expanded, row) => handleExpand(expanded, row)}
              columns={columns}
              expandIcon={props => customExpandIcon(props)}
            />
          </Spin>
        </div>
      </section>
    </section>
  );
}
const mapStateToProps = state => ({
  mainCurrency: state.kassaReducer.mainCurrency,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  selectedConfiguration: state.bonusConfigurationReducer.selectedConfiguration,
  productConfiguration: state.bonusConfigurationReducer.productConfiguration,
  selectedProductConfiguration:
    state.bonusConfigurationReducer.selectedProductConfiguration,
  isLoading: state.loadings.createProductConfiguration,
  fetchProductConfigurationLoading: state.loadings.fetchProductConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchProductConfiguration,
    createProductConfiguration,
    setSelectedProductConfiguration,
    editProductConfiguration,
    deleteProductConfiguration,
    fetchMainCurrency,
  }
)(Regulation);
