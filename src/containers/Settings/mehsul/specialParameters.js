/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Spin } from 'antd';
import { EditableRow, Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import {
  createSpecialParameters,
  editSpecialParameters,
  deleteSpecialParameters,
} from 'store/actions/settings/mehsul';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function SpecialParameters(props) {
  const {
    createSpecialParameters,
    editSpecialParameters,
    deleteSpecialParameters,
    specialParameters,
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
  } = useToggledInputHandle('productTypes', createSpecialParameters);

  const positionDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteSpecialParameters(id)),
    []
  );

  const positionEditHandle = useCallback((id, name) => {
    editSpecialParameters(id, name);
  }, []);
  return (
    <>
      <Can I={accessTypes.manage} a={permissions.msk_product}>
        <AddButton onClick={toggleHandle}> Yeni parametr</AddButton>
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
                  <th>Xüsusi parametr</th>
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
                    placeholder="Parametr adı"
                    maxLength={30}
                  />
                )}
                {specialParameters.map(({ id, name }, index) => (
                  <EditableRow
                    key={`${id}${name}`}
                    {...{ id, name, index }}
                    placeholder="Parametr adı"
                    maxLength={30}
                    editHandle={positionEditHandle}
                    deleteHandle={positionDeleteHandle}
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

// SpecialParameters.propTypes = {};

const mapStateToProps = state => ({
  specialParameters: state.mehsulReducer.specialParameters,
  isLoading: state.mehsulReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    createSpecialParameters,
    editSpecialParameters,
    deleteSpecialParameters,
  }
)(SpecialParameters);
