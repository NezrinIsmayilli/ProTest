import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { EditableRow, Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import { Row, Col, Spin } from 'antd';
import {
  editVacationType,
  deleteVacationType,
  createVacationType,
} from 'store/actions/settings/hr';

import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { deleteModalHelper } from 'utils';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function VacationType(props) {
  const {
    editVacationType,
    deleteVacationType,
    createVacationType,
    vacationTypes,
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
  } = useToggledInputHandle('vacationType', createVacationType);

  const vacationTypeDeleteHandle = useCallback(
    id => deleteModalHelper(() => deleteVacationType(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const vacationTypeEditHandle = useCallback((id, name) => {
    editVacationType(id, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Can I={accessTypes.manage} a={permissions.msk_hrm}>
        <AddButton onClick={toggleHandle}> Yeni məzuniyyət növü</AddButton>
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
                  <th>Məzuniyyət növü</th>
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
                    placeholder="Məzuniyyət növü"
                    maxLength={30}
                  />
                )}
                {vacationTypes.map(({ id, name }, index) => (
                  <EditableRow
                    key={`${id}${name}`}
                    {...{ id, name, index }}
                    placeholder="Məzuniyyət növü"
                    maxLength={30}
                    editHandle={vacationTypeEditHandle}
                    deleteHandle={vacationTypeDeleteHandle}
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

VacationType.propTypes = {};

const mapStateToProps = state => ({
  vacationTypes: state.hrReducer.vacationTypes,
  isLoading: state.hrReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { editVacationType, deleteVacationType, createVacationType }
)(VacationType);
