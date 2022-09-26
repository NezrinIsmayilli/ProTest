import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { EditableRow, Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import { Row, Col, Spin } from 'antd';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import {
  editFireReason,
  deleteFireReason,
  createFireReason,
} from 'store/actions/settings/hr';

import { deleteModalHelper } from 'utils';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function FireReason(props) {
  const {
    editFireReason,
    deleteFireReason,
    createFireReason,
    fireReasons,
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
  } = useToggledInputHandle('fireReason', createFireReason);

  const fireReasonDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteFireReason(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fireReasonEditHandle = useCallback((id, name) => {
    editFireReason(id, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Can I={accessTypes.manage} a={permissions.msk_hrm}>
        <AddButton onClick={toggleHandle}> Yeni xitam əsası</AddButton>
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
                  <th>Xitam əsası</th>
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
                    placeholder="Xitam əsası"
                    maxLength={30}
                  />
                )}
                {fireReasons.map(({ id, name }, index) => (
                  <EditableRow
                    key={id}
                    {...{ id, name, index }}
                    placeholder="Xitam əsası"
                    maxLength={30}
                    editHandle={fireReasonEditHandle}
                    deleteHandle={fireReasonDeleteHandle}
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

FireReason.propTypes = {};

const mapStateToProps = state => ({
  fireReasons: state.hrReducer.fireReasons,
  isLoading: state.hrReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { editFireReason, deleteFireReason, createFireReason }
)(FireReason);
