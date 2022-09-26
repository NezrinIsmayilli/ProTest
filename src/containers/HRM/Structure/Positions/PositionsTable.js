/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Input, Spin, Icon } from 'antd';
import { Can } from 'components/Lib';

import { FaSave, FaWindowClose } from 'react-icons/fa';

// actions
import {
  fetchPositions,
  editPositions,
  deletePositions,
  createPositions,
} from 'store/actions/settings/vezifeler';

import { permissions, accessTypes } from 'config/permissions';
import { useMultiEditable } from 'hooks/useMultiEditable';
import swal from '@sweetalert/with-react';

import { EditablePositionsRow } from './EditablePositionsRow';

import styles from './styles.module.scss';

function PositionsTable(props) {
  const {
    fetchPositions,
    createPositions,
    editPositions,
    deletePositions,
    isLoading,
    positionsFilteredData,
  } = props;

  const { name, code, shortName } = positionsFilteredData || {};

  const {
    editable,
    onChange,
    firstInputRef,
    errors,
    toggleHandle,
    onEnterKeyUp,
    onEscKeyDown,
    saveHandle,
  } = useMultiEditable({
    values: [
      { name: 'name', value: name },
      { name: 'code', value: code, required: false ,validate:false},
      { name: 'shortName', value: shortName, required: false,validate:false },
    ],
    onSubmit: ({ name, code, shortName }) => {
      const codeValue = !code ? null : code;
      const shortNameValue = !shortName ? null : shortName;
      createPositions('occupation', name, codeValue, shortNameValue);
      toggleHandle();
    },
  });

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
    if (!positionsFilteredData.length) {
      fetchPositions();
    }
  }, []);

  return (
    <Row gutter={32}>
      <Col>
        <Spin size="large" spinning={isLoading}>
          <table className={styles.table}>
            <thead className="ant-table-thead">
              <tr>
                <th>№</th>
                <th>Vəzifə</th>
                <th>Kod</th>
                <th>Abr</th>
                <th
                  className={`${styles.width70} ${styles.txtRight}`}
                  colSpan={2}
                >
                  <Can I={accessTypes.manage} a={permissions.occupation}>
                    {() => (
                      <button
                        type="button"
                        className={styles.addRow}
                        onClick={toggleHandle}
                      >
                        <Icon type="plus-circle" />
                      </button>
                    )}
                  </Can>
                </th>
              </tr>
            </thead>
            <tbody className="ant-table-tbody">
              {editable && (
                <tr>
                  <td></td>
                  <td>
                    <Input
                      ref={firstInputRef}
                      type="text"
                      style={{
                        borderColor: errors.name ? 'red' : '#dedede',
                      }}
                      placeholder="Vəzifə adı"
                      name="name"
                      onChange={({ target: { value } }) =>
                        onChange('name', value)
                      }
                      onKeyDown={onEscKeyDown}
                      onKeyUp={onEnterKeyUp}
                      maxLength={30}
                    />
                     {errors.name && <span style={{
                        color:'red'
                      }}>Bu dəyər 3 simvoldan az olmamalıdır.</span>}
                  </td>
                  <td>
                    <Input
                      type="text"
                      style={{
                        borderColor: errors.code ? 'red' : '#dedede',
                      }}
                      placeholder="Kodu"
                      name="code"
                      onChange={({ target: { value } }) =>
                        onChange('code', value)
                      }
                      defaultValue=""
                      onKeyUp={onEnterKeyUp}
                      onKeyDown={onEscKeyDown}
                      maxLength={8}
                    />
                  </td>
                  <td>
                    <Input
                      type="text"
                      style={{
                        borderColor: errors.shortName ? 'red' : '#dedede',
                      }}
                      placeholder="Abr"
                      name="shortName"
                      onChange={({ target: { value } }) =>
                        onChange('shortName', value)
                      }
                      defaultValue=""
                      onKeyUp={onEnterKeyUp}
                      onKeyDown={onEscKeyDown}
                      maxLength={10}
                    />
                  </td>
                  <td className={styles.txtCenter}>
                    <a
                      onClick={saveHandle}
                      href="javascript:;"
                      className={styles.edit}
                    >
                      <FaSave size={18} />
                    </a>
                  </td>
                  <td className={styles.txtCenter}>
                    <a
                      onClick={toggleHandle}
                      href="javascript:;"
                      className={styles.delete}
                    >
                      <FaWindowClose size={18} />
                    </a>
                  </td>
                </tr>
              )}
              {positionsFilteredData.map(
                ({ id, name, code, shortName }, index) => (
                  <EditablePositionsRow
                    key={`${id}${name}`}
                    {...{ id, name, code, shortName, index }}
                    editHandle={positionEditHandle}
                    deleteHandle={positionDeleteHandle}
                  />
                )
              )}
            </tbody>
          </table>
        </Spin>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  positionsFilteredData: state.vezifelerReducer.positionsFilteredData,
  isLoading: state.vezifelerReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { fetchPositions, createPositions, editPositions, deletePositions }
)(PositionsTable);
