import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { EditableRow, Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';

import { Row, Col, Spin } from 'antd';

import { createOrEditSerialNumberPrefix } from 'store/actions/settings/serialNumberPrefix';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function TimeOffReasonSerialNumberPrefix(props) {
  const {
    createOrEditSerialNumberPrefix,
    timeOffReasonPrefixes,
    isLoading,
  } = props;

  const timeOffReasonSerialNumberPrefixCreateOrEditHandle = useCallback(
    (id, prefix) => {
      createOrEditSerialNumberPrefix({ prefix, activityType: 3 });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    toggleHandle,
    inputRef,
    onKeyUp,
  } = useToggledInputHandle(
    'vacationSerialNumberPrefix',
    timeOffReasonSerialNumberPrefixCreateOrEditHandle
  );

  return (
    <div>
      {timeOffReasonPrefixes.length === 0 && !isLoading && (
        <Can I={accessTypes.manage} a={permissions.msk_documents}>
          <AddButton onClick={toggleHandle}> Yeni icazə prefixi</AddButton>
        </Can>
      )}

      <Row>
        <Col>
          <Spin size="large" spinning={isLoading}>
            <table
              className={`${styles['table-msk']} ${styles['table-msk-hesab']}`}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th>İcazə prefixi</th>
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
                    placeholder="İcazə prefixi"
                  />
                )}
                {timeOffReasonPrefixes.map(({ id, prefix }, index) => (
                  <EditableRow
                    key={`${id}${prefix}`}
                    {...{ id, prefix, index }}
                    placeholder="İcazə prefixi"
                    editHandle={
                      timeOffReasonSerialNumberPrefixCreateOrEditHandle
                    }
                    hideDeleteIcon
                    name={prefix}
                    permission={permissions.msk_documents}
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

const getTimeOffReasonPrefixes = createSelector(
  state => state.serialNumberPrefixReducer.serialNumberPrefixes,
  serialNumberPrefixes =>
    serialNumberPrefixes.filter(item => item.activityType === 3)
);

const mapStateToProps = state => ({
  timeOffReasonPrefixes: getTimeOffReasonPrefixes(state),
  isLoading: state.serialNumberPrefixReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { createOrEditSerialNumberPrefix }
)(TimeOffReasonSerialNumberPrefix);
