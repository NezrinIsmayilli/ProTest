import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { EditableRow, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import { Row, Col, Spin } from 'antd';
import {
  editOfflineReason,
  deleteOfflineReason,
  createOfflineReason,
  fetchOfflineReason,
} from 'store/actions/settings/offlineReason';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';

// shared components
import { toast } from 'react-toastify';
import { AddButton, AddRow } from '../../#shared';

import styles from '../../index.module.sass';

const { manage } = accessTypes;

function OfflineReason(props) {
  const {
    editOfflineReason,
    deleteOfflineReason,
    createOfflineReason,
    fetchOfflineReason,
    offlineReason,
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
  } = useToggledInputHandle('offlineReason', createOfflineReason);
  useEffect(() => {
    fetchOfflineReason();
  }, []);
  const offlineReasonDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteOfflineReason(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const offlineReasonEditHandle = useCallback((id, name) => {
    editOfflineReason(id, name, ({ error }) => {
      if (
        error?.response?.data?.error?.type ===
        'offline_reason.update.duplicate.name'
      ) {
        return toast.error('Bu oflayn səbəbi artıq mövcuddur');
      }
      if (
        error?.response?.data?.error?.errors?.name ===
        'This value is too short. It should have 3 characters or more.'
      ) {
        return toast.error('3 simvoldan az ola bilməz');
      }
      if (
        error?.response?.data?.error?.errors?.name ===
        'This value is too long. It should have 30 characters or less.'
      ) {
        return toast.error('30 simvoldan çox ola bilməz');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Can I={manage} a={permissions.msk_callcenter}>
        <AddButton onClick={toggleHandle}> Yeni səbəb</AddButton>
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
                  <th>Oflayn səbəbi</th>
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
                    placeholder="Oflayn səbəbi"
                  />
                )}
                {offlineReason.map(({ id, name }, index) => (
                  <EditableRow
                    key={`${id}${name}`}
                    {...{ id, name, index }}
                    placeholder="Oflayn səbəbi"
                    editHandle={offlineReasonEditHandle}
                    deleteHandle={offlineReasonDeleteHandle}
                    permission={permissions.msk_callcenter}
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

OfflineReason.propTypes = {};

const mapStateToProps = state => ({
  offlineReason: state.offlineReasonReducer.offlineReason,
  isLoading: state.offlineReasonReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    editOfflineReason,
    deleteOfflineReason,
    createOfflineReason,
    fetchOfflineReason,
  }
)(OfflineReason);
