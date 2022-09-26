import React, { useEffect, useReducer, useImperativeHandle } from 'react';
import { connect } from 'react-redux';

import { Button, Input, Spin, Row, Col } from 'antd';
import {
  DrawerRight,
  ProFormItem,
  ProSelect,
  ProSelectColor,
  // Table,
} from 'components/Lib';
import { FaPlus, FaTrash } from 'react-icons/fa';

import {
  createNonWorkingDay,
  deleteNonWorkingDay,
} from 'store/actions/hrm/attendance/nonWorkingDays';

import { createReducer, decToRgb, defaultFormItemSize } from 'utils';
import {
  hrmNonWorkingColors,
  hrmNonWorkingTypesOptions,
  hrmNonWorkingTypes,
} from 'utils/hrmConstants';

import styles from './nonWorkingDays.module.scss';

const initialState = {
  isDrawerOpen: false,
  values: {
    name: '',
    type: null,
    color: null,
  },
  errors: {},
};

const reducer = createReducer(initialState, {
  onChangeHandle: (state, action) => ({
    ...state,
    values: {
      ...state.values,
      [action.name]: action.value,
    },
    errors: {
      [action.name]: '',
    },
  }),

  setValues: (state, action) => ({
    ...initialState,
    values: {
      ...initialState.values,
      ...action.values,
    },
  }),

  validate: (state, action) => ({
    ...state,
    errors: action.errors,
  }),

  drawerControl: (state, action) => ({
    ...state,
    isDrawerOpen: action.value,
  }),

  reset: state => ({
    ...initialState,
    isDrawerOpen: state.isDrawerOpen,
  }),
});

const NonWorkingDaysDrawer = React.forwardRef((props, ref) => {
  const {
    // isDrawerOpen,
    // closeDrawer,
    deleteNonWorkingDay,
    isLoading,
    actionLoading,
    nonWorkingDays,
    createNonWorkingDay,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    values: { name, type, color },
    errors,
    isDrawerOpen,
  } = state;

  const openDrawer = () => dispatch({ type: 'drawerControl', value: true });

  const closeDrawer = () => dispatch({ type: 'drawerControl', value: false });

  useImperativeHandle(ref, () => ({
    openDrawer,
  }));

  useEffect(() => {
    if (!isDrawerOpen) {
      dispatch({ type: 'reset' });
    }
  }, [isDrawerOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!name || name.length < 3 || name.length > 250) {
      errors.name = 'error';
    }
    if (!type || type.length < 0) {
      errors.type = 'error';
    }
    if (errors.hasOwnProperty('name') || errors.hasOwnProperty('type'))
      return dispatch({ type: 'validate', errors });

    createNonWorkingDay({ name, type, color: color || 0 });
    dispatch({ type: 'reset' });
  }

  // const columns = [
  //   {
  //     title: 'Adı',
  //     dataIndex: 'name',
  //   },
  //   {
  //     title: 'Tip',
  //     dataIndex: 'type',
  //     render: value => typesValues[value],
  //   },
  //   {
  //     title: 'Rəngi',
  //     dataIndex: 'color',
  //     render: value => <div style={{ background: value }} />,
  //   },
  //   {
  //     title: 'Sil',
  //     dataIndex: 'id',
  //     render: value => (
  //       <Button
  //         onClick={() => deleteNonWorkingDay(value)}
  //         className={styles.delete}
  //       >
  //         <FaTrash size={18} />
  //       </Button>
  //     ),
  //   },
  // ];

  return (
    <DrawerRight isDrawerOpen={isDrawerOpen} closeDrawer={closeDrawer}>
      <div className={styles.drawerHeader}>
        <div className={styles.title}>Yeni qeyri iş günü əlavə et</div>
        <button
          type="button"
          onClick={closeDrawer}
          className={styles.closeDrawer}
        >
          <img src="/img/icons/close.png" alt="Bağla" title="Bağla" />
        </button>
      </div>
      <div>
        <div className={styles.drawerFormBox}>
          <Row>
            <Col className="paddingBottom70">
              <Spin size="large" spinning={isLoading}>
                <div className={styles.tableLight}>
                  <table className={styles.table}>
                    <tbody className="ant-table-tbody">
                      <tr className={styles.formTr}>
                        <td>
                          <ProFormItem label="Adı" validateStatus={errors.name}>
                            <Input
                              name="name"
                              type="text"
                              onChange={({ target: { name, value } }) =>
                                dispatch({
                                  type: 'onChangeHandle',
                                  name,
                                  value,
                                })
                              }
                              value={name}
                              placeholder=""
                              autoFocus
                              autoComplete="off"
                              maxLength={100}
                              size={defaultFormItemSize}
                              style={{ marginBottom: 5 }}
                            />
                          </ProFormItem>
                        </td>
                        <td>
                          <ProFormItem label="Tip" validateStatus={errors.type}>
                            <ProSelect
                              size={defaultFormItemSize}
                              showSearch
                              name="type"
                              data={hrmNonWorkingTypesOptions}
                              onChange={value =>
                                dispatch({
                                  type: 'onChangeHandle',
                                  name: 'type',
                                  value,
                                })
                              }
                              value={type}
                            />
                          </ProFormItem>
                        </td>
                        <td>
                          <ProFormItem
                            label="Rəngi"
                            validateStatus={errors.color}
                          >
                            <ProSelectColor
                              size={defaultFormItemSize}
                              data={hrmNonWorkingColors}
                              onChange={value =>
                                dispatch({
                                  type: 'onChangeHandle',
                                  name: 'color',
                                  value,
                                })
                              }
                              value={color}
                            />
                          </ProFormItem>
                        </td>
                        <td>
                          <Button
                            loading={actionLoading}
                            type="primary"
                            onClick={handleSubmit}
                            className={styles.btnAdd}
                          >
                            <FaPlus size={16} />
                          </Button>
                        </td>
                      </tr>
                      {nonWorkingDays &&
                        nonWorkingDays.map(item => (
                          <tr key={item.id} className={styles.row}>
                            <td>{item.name}</td>
                            <td>
                              {/* {types.map(e => {
                                if (e.id === item.type) {
                                  return e.name;
                                }
                              })} */}
                              {hrmNonWorkingTypes[item.type]}
                            </td>
                            <td>
                              <div style={decToRgb(item.color)}></div>
                            </td>
                            <td className={styles.btnTd}>
                              <Button
                                onClick={() => deleteNonWorkingDay(item.id)}
                                className={styles.delete}
                              >
                                <FaTrash size={18} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      {/* <Table
                        dataSource={nonWorkingDays}
                        columns={columns}
                        rowKey={record => record.id}
                        showHeader={false}
                      /> */}
                    </tbody>
                  </table>
                </div>
              </Spin>
            </Col>
          </Row>
        </div>
      </div>
    </DrawerRight>
  );
});

const mapStateToProps = state => ({
  isLoading: state.nonWorkingDaysReducer.isLoading,
  nonWorkingDays: state.nonWorkingDaysReducer.nonWorkingDays,
});

export default connect(
  mapStateToProps,
  {
    createNonWorkingDay,
    deleteNonWorkingDay,
  },
  null,
  { forwardRef: true }
)(NonWorkingDaysDrawer);
