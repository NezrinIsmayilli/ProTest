/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useState } from 'react';
import { connect } from 'react-redux';

import {
  EditableRow,
  CustomHeader,
  SettingsCollapse,
  SettingsPanel,
  DeleteModal,
  Can,
} from 'components/Lib';
import { Row, Col, Spin } from 'antd';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import {
  fetchStockTypes,
  editStockTypes,
  deleteStockTypes,
  createStockTypes,
} from 'store/actions/settings/anbar';

import {
  createStock,
  fetchStocks,
  fetchStockInfo,
  editStock,
  deleteStock,
} from 'store/actions/stock';
import { accessTypes, permissions } from 'config/permissions';
import { fetchUsers } from 'store/actions/users';

// shared components
// import { isFormValid } from 'utils';
// import { toast } from 'react-toastify';
import { AddButton, AddRow } from '../#shared';
import styles from '../index.module.sass';

// const requiredFields = [
//   {
//     name: 'name',
//     required: true,
//   },
// ];

function Anbar(props) {
  const {
    fetchStockTypes,
    editStockTypes,
    deleteStockTypes,
    createStockTypes,
    data,
    isLoading,
    fetchStocks,
    // createStock,
    fetchUsers,
    // fetchStockInfo,
    // editStock,
    stockInfo,
  } = props;
  const [, setIsEditStock] = useState(false);
  console.log(data,"salam")
  const [, setNewStockState] = useState({
    structure: null,
    lat: null,
    lng: null,
    area: null,
    personInCharge: null,
    stockType: null,
  });
  const [newAnbar] = useState(false);

  useEffect(() => {
    if (newAnbar === false) {
      setIsEditStock(false);
      setNewStockState({
        structure: null,
        lat: null,
        lng: null,
        area: null,
        personInCharge: null,
        stockType: null,
      });
    }
  }, [newAnbar]);
  useEffect(() => {
    fetchStocks();
    fetchUsers({});
  }, []);

  useEffect(() => {
    if (!data.length) {
      fetchStockTypes({filters:{limit:1000}});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (stockInfo) {
      setNewStockState({
        lat: stockInfo.lat || null,
        lng: stockInfo.lng || null,
        name: stockInfo.name,
        stockType: stockInfo.stockTypeId || null,
        personInCharge: stockInfo.personInChargeId || null,
        area: stockInfo.area || null,
        structure: null,
      });
    }
  }, [stockInfo]);

  const {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    toggleHandle,
    inputRef,
    onKeyUp,
  } = useToggledInputHandle('stockTypes', createStockTypes);
  const stockEditHandle = useCallback((id, name) => {
    editStockTypes(id, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const createNewStock = () => {
  //   const isValid = isFormValid({ ...newStockState }, requiredFields, ERR => {
  //     toast.error(`Field ${Object.keys(ERR)[0]} is required`);
  //   });
  //   if (isValid) {
  //     setWarehouseModalLoader(true);
  //     createStock(
  //       newStockState,
  //       () => {
  //         toggleNewAnbar(false);
  //         setWarehouseModalLoader(false);
  //         fetchStocks({});
  //         toast.success('warehouse created successfully');
  //       },
  //       () => {
  //         toggleNewAnbar(false);
  //         setWarehouseModalLoader(false);
  //       }
  //     );
  //   }
  // };
  // const handleChangeNewStock = (type, name, e) => {
  //   if (type === 'input')
  //     setNewStockState({ ...newStockState, [name]: e.target.value });
  //   else setNewStockState({ ...newStockState, [name]: e });
  // };
  // const onClickEditAnbar = (id, e) => {
  //   toggleNewAnbar();
  //   setIsEditStock(true);

  //   fetchStockInfo(id);
  // };
  // const onEditStockInfo = () => {
  //   setWarehouseModalLoader(true);
  //   editStock(
  //     stockInfo.id,
  //     newStockState,
  //     () => {
  //       toast.success('warehouse updated successfully');
  //       toggleNewAnbar(false);
  //       setWarehouseModalLoader(false);
  //       fetchStocks({});
  //     },
  //     () => {
  //       setWarehouseModalLoader(false);
  //     }
  //   );
  // };
  return (
    <div>
      <SettingsCollapse>
        {/* <SettingsPanel
          header={<CustomHeader title={`Anbarlar (${stocks.length})`} />}
          key="1"
        >
          <AddButton onClick={toggleNewAnbar}> Yeni anbar</AddButton>

          <AddFormModal
            loading={warehouseModalLoader}
            onConfirm={isEditStock ? onEditStockInfo : createNewStock}
            title={isEditStock ? "Edit warehouse" : 'New warehouse'}
            confirmText={isEditStock ? "Save warehouse" : 'Add warehouse'}
            visible={newAnbar}
            onCancel={toggleNewAnbar}>
            <InputBox value={newStockState.name} onChange={handleChangeNewStock.bind(this, 'input', 'name')} label='Name of warehouse' />
            <InputBox value={newStockState.stockType} onChange={handleChangeNewStock.bind(this, 'select', 'stockType')} inputType='select' placeholder='Select' label='Warehouse type' >
              {data.map((stockType, k) => (
                <Option key={k} value={stockType.id}>
                  {stockType.name}
                </Option>
              ))}
            </InputBox>

            <InputBox value={newStockState.personInCharge} onChange={handleChangeNewStock.bind(this, 'select', 'personInCharge')} inputType='select' placeholder='Select' label='Responsible person' >
              {users.map((user, key) => (
                <Option key={key} value={user.id}>
                  {user.name}
                </Option>
              ))}
            </InputBox>

            <Row style={{ display: 'flex', alignItems: 'flex-end' }} gutter={8}>
              <Col md={12}>
                <InputBox value={newStockState.lat} onChange={handleChangeNewStock.bind(this, 'input', 'lat')} label='Coordination' placeholder='Width' type="number" />
              </Col>
              <Col md={12}>
                <InputBox value={newStockState.lng} onChange={handleChangeNewStock.bind(this, 'input', 'lng')} placeholder='Length'type="number" />
              </Col>
            </Row>
            <InputBox value={newStockState.area} onChange={handleChangeNewStock.bind(this, 'input', 'area')} label='Area' placeholder='m2'type="number" />
          </AddFormModal>

          <Row>
            <Col>
              <Spin size="large" spinning={isLoading}>
                <table
                  className={`${styles['table-msk']} ${
                    styles['table-msk-hesab']
                    }`}
                >
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Anbar növü</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map(({ id, name }, index) => (
                      <AnbarListItem
                        key={id}
                        {...{ id, name, index }}
                        handleEdit={onClickEditAnbar.bind(this, id)}
                        handleDelete={DeleteModal(id, deleteStock)}
                      />
                    ))}
                  </tbody>
                </table>
              </Spin>
            </Col>
          </Row>
        </SettingsPanel> */}

        <SettingsPanel
          header={<CustomHeader title={`Anbar növləri (${data.length})`} />}
          key="2"
        >
          <Can I={accessTypes.manage} a={permissions.msk_warehouse}>
            <AddButton onClick={toggleHandle}> Yeni anbar növü</AddButton>
          </Can>

          <Row>
            <Col>
              <Spin size="large" spinning={isLoading}>
                <table
                  className={`${styles['table-msk']} ${
                    styles['table-msk-hesab']
                  }`}
                >
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Anbar növü</th>
                    </tr>
                  </thead>
                  <tbody>
                    {open && (
                      <AddRow
                        {...{
                          value,
                          inputRef,
                          onKeyUp,
                          inputChangeHandle,
                          error,
                          toggleHandle,
                          handleSubmit,
                        }}
                        placeholder="Anbar növü"
                      />
                    )}
                    {data.map(({ id, name }, index) => (
                      <EditableRow
                        key={id}
                        {...{ id, name, index }}
                        placeholder="Anbar növü"
                        editHandle={stockEditHandle}
                        deleteHandle={DeleteModal(id, deleteStockTypes)}
                        permission={permissions.msk_warehouse}
                      />
                    ))}
                  </tbody>
                </table>
              </Spin>
            </Col>
          </Row>
        </SettingsPanel>
      </SettingsCollapse>
    </div>
  );
}

const mapStateToProps = state => ({
  data: state.anbarReducer.data,
  isLoading: state.anbarReducer.isLoading,

  users: state.usersReducer.users,
  stocks: state.stockReducer.stocks,
  stockInfo: state.stockReducer.stockInfo,
});

export default connect(
  mapStateToProps,
  {
    fetchStockTypes,
    editStockTypes,
    deleteStockTypes,
    createStockTypes,
    createStock,
    fetchStocks,
    fetchUsers,
    deleteStock,
    fetchStockInfo,
    editStock,
  }
)(Anbar);
