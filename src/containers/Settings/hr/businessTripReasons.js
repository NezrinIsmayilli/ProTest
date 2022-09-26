import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { EditableRow, Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import { Row, Col, Spin } from 'antd';

import {
  editBusinessTripReason,
  deleteBusinessTripReason,
  createBusinessTripReason,
} from 'store/actions/settings/hr';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function BusinessTripReason(props) {
  const {
    editBusinessTripReason,
    deleteBusinessTripReason,
    createBusinessTripReason,
    businessTripReasons,
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
  } = useToggledInputHandle('businessTripReason', createBusinessTripReason);

  const businessTripReasonDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteBusinessTripReason(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const businessTripReasonEditHandle = useCallback((id, name) => {
    editBusinessTripReason(id, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Can I={accessTypes.manage} a={permissions.msk_hrm}>
        <AddButton onClick={toggleHandle}> Yeni ezamiyyət səbəbi</AddButton>
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
                  <th>Ezamiyyət səbəbi</th>
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
                    placeholder="Ezamiyyət səbəbi"
                    maxLength={30}
                  />
                )}
                {businessTripReasons.map(({ id, name }, index) => (
                  <EditableRow
                    key={id}
                    {...{ id, name, index }}
                    placeholder="Ezamiyyət səbəbi"
                    maxLength={30}
                    editHandle={businessTripReasonEditHandle}
                    deleteHandle={businessTripReasonDeleteHandle}
                    permission={permissions.msk_hrm}
                  />
                ))}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps = state => ({
  businessTripReasons: state.hrReducer.businessTripReasons,
  isLoading: state.hrReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { editBusinessTripReason, deleteBusinessTripReason, createBusinessTripReason }
)(BusinessTripReason);
