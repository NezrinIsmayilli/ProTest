/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from 'react';
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
import { accessTypes, permissions } from 'config/permissions';

import {
  fetchContractTypes,
  editContractTypes,
  deleteContractTypes,
  createContractTypes,
} from 'store/actions/settings/muqavile';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function Muqavile(props) {
  const {
    fetchContractTypes,
    editContractTypes,
    deleteContractTypes,
    createContractTypes,
    data,
    isLoading,
  } = props;

  useEffect(() => {
    if (!data.length) {
      fetchContractTypes();
    }
  }, []);

  // create
  const {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    toggleHandle,
    inputRef,
    onKeyUp,
  } = useToggledInputHandle('contractTypes', createContractTypes);

  // edit
  const positionEditHandle = useCallback((id, name) => {
    editContractTypes(id, name);
  }, []);

  return (
    <div>
      <SettingsCollapse>
        <SettingsPanel
          header={<CustomHeader title={`Müqavilə tipləri (${data.length})`} />}
          key="1"
        >
          <Can I={accessTypes.manage} a={permissions.msk_contract}>
            <AddButton onClick={toggleHandle}> Yeni müqavilə tipi</AddButton>
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
                      <th>Müqavilə tipi</th>
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
                        placeholder="Müqavilə tipi"
                        maxLength={30}
                      />
                    )}
                    {data.map(({ id, name }, index) => (
                      <EditableRow
                        key={id}
                        {...{ id, name, index }}
                        placeholder="Müqavilə tipi"
                        maxLength={30}
                        editHandle={positionEditHandle}
                        deleteHandle={DeleteModal(id, deleteContractTypes)}
                        permission={permissions.msk_contract}
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

// Muqavile.propTypes = {};

const mapStateToProps = state => ({
  data: state.muqavileTypesReducer.data,
  isLoading: state.muqavileTypesReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchContractTypes,
    editContractTypes,
    deleteContractTypes,
    createContractTypes,
  }
)(Muqavile);
