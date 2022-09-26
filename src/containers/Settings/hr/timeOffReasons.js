import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { EditableRow, Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import { Row, Col, Spin } from 'antd';
import {
  editTimeOffReason,
  deleteTimeOffReason,
  createTimeOffReason,
} from 'store/actions/settings/hr';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function TimeOffReason(props) {
  const {
    editTimeOffReason,
    deleteTimeOffReason,
    createTimeOffReason,
    timeOffReasons,
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
  } = useToggledInputHandle('timeOffReason', createTimeOffReason);

  const timeOffReasonDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteTimeOffReason(id)),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const timeOffReasonEditHandle = useCallback((id, name) => {
    editTimeOffReason(id, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Can I={accessTypes.manage} a={permissions.msk_hrm}>
        <AddButton onClick={toggleHandle}> Yeni icazə səbəbi</AddButton>
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
                  <th>İcazə səbəbi</th>
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
                    placeholder="İcazə səbəbi"
                    maxLength={30}
                  />
                )}
                {timeOffReasons.map(({ id, name }, index) => (
                  <EditableRow
                    key={id}
                    {...{ id, name, index }}
                    placeholder="İcazə səbəbi"
                    maxLength={30}
                    editHandle={timeOffReasonEditHandle}
                    deleteHandle={timeOffReasonDeleteHandle}
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
  timeOffReasons: state.hrReducer.timeOffReasons,
  isLoading: state.hrReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { editTimeOffReason, deleteTimeOffReason, createTimeOffReason }
)(TimeOffReason);
