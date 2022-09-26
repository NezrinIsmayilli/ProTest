import React, { useReducer, useEffect, useState } from 'react';
import { cookies } from 'utils/cookies';
import { Button, Input, Spin, Row, Col } from 'antd';
import { DrawerRight, ProFormItem, ProSelect } from 'components/Lib';
import { connect } from 'react-redux';
import {
  FaPlus,
  FaChevronCircleRight,
  FaTrash,
  FaPencilAlt,
} from 'react-icons/fa';
import {
  createStructure,
  editStructure,
  deleteStructure,
  fetchFilteredStructures,
} from 'store/actions/structure';

import { createReducer } from 'utils';

import styles from './styles.module.scss';

const initialState = {
  values: {
    name: '',
    chief: null,
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

  reset: () => initialState,
});

function StructureDrawer(props) {
  const {
    isDrawerOpen,
    closeDrawer,
    isEdit,
    editingStructureId,
    deleteStructure,
    isLoading,
    actionLoading,
    createStructure,
    editStructure,
    structureList,
    fetchFilteredStructures,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);
  const [filteredStructures, setFilteredStructures] = useState([]);
  const {
    values: { name, structure },
    errors,
  } = state;

  useEffect(() => {
    if (isEdit && isDrawerOpen && editingStructureId) {
      const { name, parentName } = structureList.find(
        item => item.id === editingStructureId
      );
      dispatch({ type: 'setValues', values: { name, structure: parentName } });
    } else if (structureList.length > 0) {
      dispatch({
        type: 'setValues',
        values: {
          structure: structureList.filter(item => item.id === 0)[0].name,
        },
      });
    }
  }, [isDrawerOpen, isEdit, editingStructureId, structureList]);

  useEffect(() => {
    if (!isDrawerOpen) {
      dispatch({ type: 'reset' });
    }
  }, [isDrawerOpen]);
  useEffect(() => {
    if (isDrawerOpen) {
      if (isEdit) {
        fetchFilteredStructures({
          onSuccessCallback: ({ data }) => {
            if (editingStructureId) {
              const filteredData = data.filter(
                structure => structure.id !== editingStructureId
              );
              setFilteredStructures(filteredData);
            } else {
              setFilteredStructures(data);
            }
          },
        });
      } else if (cookies.get('_TKN_UNIT_')) {
        fetchFilteredStructures({
          filters: { businessUnitIds: [cookies.get('_TKN_UNIT_')] },
          onSuccessCallback: ({ data }) => {
            setFilteredStructures(data);
          },
        });
      } else {
        fetchFilteredStructures({
          onSuccessCallback: ({ data }) => {
            setFilteredStructures(data);
          },
        });
      }
    }
  }, [isDrawerOpen, isEdit, cookies.get('_TKN_UNIT_')]);

  function handleSubmit() {
    if (!name || name.length > 250) {
      return dispatch({ type: 'validate', errors: { name: 'error' } });
    }
    if (name.length < 3) {
      return dispatch({ type: 'validate', errors: { name: 'minError' } });
    }

    const currentStateValues = state.values;
    if (typeof currentStateValues.structure === 'string') {
      currentStateValues.structure =
        currentStateValues.structure === ''
          ? 0
          : structureList.find(
              item => item.name === currentStateValues.structure
            ).id;
    }

    if (isEdit) {
      return editStructure(editingStructureId, currentStateValues, closeDrawer);
    }

    return createStructure(currentStateValues, false);
  }

  return (
    <DrawerRight isDrawerOpen={isDrawerOpen} closeDrawer={closeDrawer}>
      <div className={styles.drawerHeader}>
        <div className={styles.title}>
          {isEdit && 'Redaktə'}
          {!isEdit && 'Yeni bölmə əlavə et'}
        </div>
        <button
          type="button"
          onClick={closeDrawer}
          className={styles.closeDrawer}
        >
          <img src="/img/icons/close.png" alt="Bağla" title="Bağla" />
        </button>
      </div>
      <div>
        <Spin size="large" spinning={isLoading}>
          <div className={styles.drawerFormBox}>
            <Row gutter={32} type="flex" justify="space-around" align="middle">
              <Col span={10}>
                <ProFormItem label="Bölmənin adı" validateStatus={errors.name}>
                  <Input
                    name="name"
                    type="text"
                    value={name}
                    onChange={({ target: { name, value } }) =>
                      dispatch({ type: 'onChangeHandle', name, value })
                    }
                    placeholder=""
                    autoFocus
                    autoComplete="off"
                    maxLength={50}
                  />
                </ProFormItem>
              </Col>
              <Col span={10}>
                <ProFormItem
                  label="Strukturun adı"
                  validateStatus={errors.structure}
                >
                  <ProSelect
                    allowClear
                    showSearch
                    data={filteredStructures}
                    onChange={value =>
                      dispatch({
                        type: 'onChangeHandle',
                        name: 'structure',
                        value,
                      })
                    }
                    value={structure}
                  />
                </ProFormItem>
              </Col>
              <Col span={4}>
                <Button
                  loading={actionLoading}
                  type="primary"
                  onClick={handleSubmit}
                  className={styles.btnAdd}
                >
                  {!isEdit && <FaPlus size={16} />}
                  {isEdit && <FaPencilAlt size={16} />}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col className="paddingBottom70">
                <Spin size="large" spinning={isLoading}>
                  <div className={styles.tableLight}>
                    <table className={styles.table}>
                      <tbody className="ant-table-tbody">
                        {structureList.map((item, index) => (
                          <tr className={styles.row} key={`${item.id}${index}`}>
                            <td>
                              <div>
                                {item.name}
                                <div>
                                  <FaChevronCircleRight
                                    size={18}
                                    className={styles.arrowRight}
                                  />
                                </div>
                              </div>
                            </td>
                            <td>{item.parentName}</td>
                            <td>
                              <p
                                className={`${styles.noMargin} ${styles.txtCenter}`}
                              >
                                <a
                                  onClick={() => deleteStructure(item.id)}
                                  href="javascript:;"
                                  className={styles.delete}
                                >
                                  <FaTrash size={18} />
                                </a>
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Spin>
              </Col>
            </Row>
          </div>
        </Spin>
      </div>
    </DrawerRight>
  );
}

StructureDrawer.propTypes = {};

const mapStateToProps = state => ({
  isLoading: state.expenseCatalogReducer.isLoading,
  actionLoading: state.expenseCatalogReducer.actionLoading,
  structureList: state.structureReducer.structureList,
});

export default connect(
  mapStateToProps,
  {
    createStructure,
    editStructure,
    deleteStructure,
    fetchFilteredStructures,
  }
)(StructureDrawer);
