/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Spin } from 'antd';
import { EditableRow, Can } from 'components/Lib';
import {
  createProductTypes,
  editProductTypes,
  deleteProductTypes,
} from 'store/actions/settings/mehsul';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';
import { accessTypes, permissions } from 'config/permissions';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function ProductTypes(props) {
  const {
    createProductTypes,
    editProductTypes,
    deleteProductTypes,
    productTypes,
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
  } = useToggledInputHandle('productTypes', createProductTypes);

  const productTypesDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteProductTypes(id)),
    []
  );

  const productTypesEditHandle = useCallback((id, name) => {
    editProductTypes(id, name);
  }, []);
  return (
    <>
      <Can I={accessTypes.manage} a={permissions.msk_product}>
        <AddButton onClick={toggleHandle}> Yeni məhsul tipi</AddButton>
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
                  <th>Məhsul tipi</th>
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
                    placeholder="Məhsul tipi"
                    maxLength={30}
                  />
                )}
                {productTypes.map(({ id, name }, index) => (
                  <EditableRow
                    key={`${id}${name}`}
                    {...{ id, name, index }}
                    placeholder="Məhsul tipi"
                    maxLength={30}
                    editHandle={productTypesEditHandle}
                    deleteHandle={productTypesDeleteHandle}
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

// ProductTypes.propTypes = {};

const mapStateToProps = state => ({
  productTypes: state.mehsulReducer.productTypes,
  isLoading: state.mehsulReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    createProductTypes,
    editProductTypes,
    deleteProductTypes,
  }
)(ProductTypes);
