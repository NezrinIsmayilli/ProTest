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

function BusinessTripSerialNumberPrefix(props) {
  const {
    createOrEditSerialNumberPrefix,
    businessTripSerialNumberPrefixes,
    isLoading,
  } = props;

  const businessTripSerialNumberPrefixCreateOrEditHandle = useCallback(
    (id, prefix) => {
      createOrEditSerialNumberPrefix({ prefix, activityType: 5 });
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
    businessTripSerialNumberPrefixCreateOrEditHandle
  );

  return (
    <div>
      {businessTripSerialNumberPrefixes.length === 0 && !isLoading && (
        <Can I={accessTypes.manage} a={permissions.msk_documents}>
          <AddButton onClick={toggleHandle}> Yeni ezamiyyət prefixi</AddButton>
        </Can>
      )}

      <Row>
        <Col>
          <Spin size="large" spinning={isLoading}>
            <table
              className={[styles['table-msk'], styles['table-msk-hesab']].join(
                ' '
              )}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th>Ezamiyyət prefixi</th>
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
                    placeholder="Ezamiyyət prefixi"
                  />
                )}
                {businessTripSerialNumberPrefixes.map(
                  ({ id, prefix }, index) => (
                    <EditableRow
                      key={`${id}${prefix}`}
                      {...{ id, prefix, index }}
                      placeholder="Ezamiyyət prefixi"
                      editHandle={
                        businessTripSerialNumberPrefixCreateOrEditHandle
                      }
                      hideDeleteIcon
                      name={prefix}
                      permission={permissions.msk_documents}
                    />
                  )
                )}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </div>
  );
}

const getBusinessTripSerialNumberPrefixes = createSelector(
  state => state.serialNumberPrefixReducer.serialNumberPrefixes,
  serialNumberPrefixes =>
    serialNumberPrefixes.filter(item => item.activityType === 5)
);

const mapStateToProps = state => ({
  businessTripSerialNumberPrefixes: getBusinessTripSerialNumberPrefixes(state),
  isLoading: state.serialNumberPrefixReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { createOrEditSerialNumberPrefix }
)(BusinessTripSerialNumberPrefix);
