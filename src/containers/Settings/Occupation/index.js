/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import {
  CustomHeader,
  SettingsCollapse,
  SettingsPanel,
  Can,
} from 'components/Lib';
import { Row, Col, Spin } from 'antd';

import {
  fetchPositions,
  editPositions,
  deletePositions,
  createPositionsMSK,
} from 'store/actions/settings/vezifeler';
import { permissions, accessTypes } from 'config/permissions';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import swal from '@sweetalert/with-react';

// shared components
import { AddButton, AddRow } from '../#shared';
import styles from '../index.module.sass';
import { EditableRow } from './EditableRow';

function Occupation(props) {
  const {
    fetchPositions,
    createPositionsMSK,
    editPositions,
    deletePositions,
    isLoading,
    data,
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
  } = useToggledInputHandle('occupation', createPositionsMSK);

  const positionEditHandle = useCallback((id, name) => {
    editPositions(id, name);
  }, []);
  const positionDeleteHandle = useCallback(
    id => {
      swal({
        title: 'Silmək istədiyinizə əminsinizmi?',
        icon: 'warning',
        buttons: ['İmtina', 'Sil'],
        dangerMode: true,
      }).then(willDelete => {
        if (willDelete) {
          deletePositions(id);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!data.length) {
      fetchPositions();
    }
  }, []);

  return (
    <div>
      <SettingsCollapse>
        <SettingsPanel
          header={<CustomHeader title={`Vəzifələr (${data.length})`} />}
          key="1"
        >
          <Can I={accessTypes.manage} a={permissions.msk_occupations}>
            <AddButton onClick={toggleHandle}>Yeni vəzifə</AddButton>
          </Can>
          <Row>
            <Col>
              <Spin size="large" spinning={isLoading}>
                <table
                  className={`${styles['table-msk']} ${styles['table-msk-hesab']
                    }`}
                >
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Vəzifə</th>
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
                        placeholder="Vəzifənin adı"
                        maxLength={30}
                      />
                    )}
                    {data.map(({ id, name, code, shortName }, index) => (
                      <EditableRow
                        key={`${id}${name}`}
                        {...{ id, name, code, shortName, index }}
                        editHandle={positionEditHandle}
                        deleteHandle={positionDeleteHandle}
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

const mapStateToProps = state => ({
  data: state.vezifelerReducer.data,
  isLoading: state.vezifelerReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { fetchPositions, editPositions, deletePositions, createPositionsMSK }
)(Occupation);
