/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Input, Spin } from 'antd';
import { Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import {
  createProductPriceTypes,
  editProductPriceTypes,
  deleteProductPriceTypes,
} from 'store/actions/settings/mehsul';
import { FaSave, FaWindowClose, FaTrash, FaPencilAlt } from 'react-icons/fa';

import { useMultiEditable } from 'hooks/useMultiEditable';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function ProductPriceTypes(props) {
  const {
    createProductPriceTypes,
    editProductPriceTypes,
    deleteProductPriceTypes,
    filteredProductPriceTypes,
    productPriceTypes,
    isLoading,
  } = props;

  const {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    toggleHandle,
    inputRef,
    onKeyUp,
  } = useToggledInputHandle('productPriceTypes', createProductPriceTypes);

  const productPriceTypesDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteProductPriceTypes(id)),
    []
  );

  const productPriceTypesEditHandle = useCallback((id, name) => {
    editProductPriceTypes(id, name);
  }, []);


  function EditableUnitRow(props) {
    const { id, name, isDeletable, index, editHandle, deleteHandle } = props;
    const {
      editable,
      onChange,
      firstInputRef,
      errors,
      toggleHandle,
      onEnterKeyUp,
      onEscKeyDown,
      saveHandle,
    } = useMultiEditable({
      values: [{ name: 'name', value: name }],
      onSubmit: ({ name }) => {
        editHandle(id, name);
        toggleHandle();
      },
    });

    console.log(isDeletable);
    return (
      <tr key={`${id}${name}`}>
        <td>{index + 1}</td>
        {editable ? (
          <>
            <td>
              <Input
                ref={firstInputRef}
                type="text"
                style={{
                  borderColor: errors.name ? 'red' : '#dedede',
                }}
                placeholder="Qiymət tipi"
                name="name"
                defaultValue={name}
                onChange={({ target: { value } }) => onChange('name', value)}
                onKeyUp={onEnterKeyUp}
                onKeyDown={onEscKeyDown}
              />

              <div>
                <a
                  onClick={toggleHandle}
                  href="javascript:;"
                  className={styles.delete}
                >
                  <FaWindowClose size={18} />
                </a>
                <a
                  onClick={saveHandle}
                  href="javascript:;"
                  className={styles.edit}
                >
                  <FaSave size={18} />
                </a>
              </div>
            </td>
          </>
        ) : (
          <>
            <td style={{ textAlign: 'left' }}>
              <span>{name}</span>

              <div>
                {isDeletable === false ? null : (
                  <a
                    onClick={() => deleteHandle(id)}
                    href="javascript:;"
                    className={styles.delete}
                  >
                    <FaTrash size={18} />
                  </a>
                )}

                <a
                  onClick={toggleHandle}
                  href="javascript:;"
                  className={styles.edit}
                >
                  <FaPencilAlt size={18} />
                </a>
              </div>
            </td>
          </>
        )}
      </tr>
    );
  }

  return (
    <>
      <Can I={accessTypes.manage} a={permissions.msk_product}>
        <AddButton onClick={toggleHandle}> Yeni qiymət tipi</AddButton>
      </Can>

      <Row>
        <Col>
          <Spin size="large" spinning={isLoading}>
            <table
              className={`${styles['table-msk']} ${styles['table-msk-hesab']}`}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th>Qiymət tipi</th>
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
                    placeholder="Qiymət tipi"
                    maxLength={15}
                  />
                )}
                {[...productPriceTypes,...filteredProductPriceTypes].map(({ id, name, isDeletable }, index) => (
                  <EditableUnitRow
                    key={`${id}${name}`}
                    {...{ id, name, isDeletable, index }}
                    placeholder="Qiymət tipi"
                    editHandle={productPriceTypesEditHandle}
                    deleteHandle={productPriceTypesDeleteHandle}
                    permission={permissions.msk_product}
                  />
                ))}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </>
  );
}

const mapStateToProps = state => ({
  productPriceTypes: state.mehsulReducer.productPriceTypes,
  isLoading: state.mehsulReducer.isLoading,
  filteredProductPriceTypes: state.mehsulReducer.filteredProductPriceTypes,
});

export default connect(
  mapStateToProps,
  {
    createProductPriceTypes,
    editProductPriceTypes,
    deleteProductPriceTypes,
  }
)(ProductPriceTypes);
