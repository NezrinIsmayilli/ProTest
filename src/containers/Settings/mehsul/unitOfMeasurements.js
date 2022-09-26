import React, { useCallback } from 'react';
// import PropTypes from 'prop-types';
import { Button, Row, Col, Input, Spin } from 'antd';
import { connect } from 'react-redux';
import { FaSave, FaWindowClose, FaTrash, FaPencilAlt } from 'react-icons/fa';
import { Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import {
  createUnitOfMeasurements,
  editUnitOfMeasurements,
  deleteUnitOfMeasurements,
  fetchUnitOfMeasurements,
} from 'store/actions/settings/mehsul';
import swal from '@sweetalert/with-react';
import { useMultiEditable } from 'hooks/useMultiEditable';
import { toast } from 'react-toastify';
import styles from '../index.module.sass';

function EditableUnitRow(props) {
  const {
    id,
    name,
    index,
    unitKey,
    editHandle,
    deleteHandle,
    permission,
  } = props;
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
    values: [{ name: 'name', value: name }, { name: 'key', value: unitKey }],
    onSubmit: ({ name, key }) => {
      editHandle(id, name, key);
      toggleHandle();
    },
  });
  return (
    <tr key={`${id}${name}`}>
      <td>{index + 1}</td>
      {editable ? (
        <>
          <td style={{ width: '40%' }}>
            <Input
              ref={firstInputRef}
              type="text"
              style={{
                borderColor: errors.name ? 'red' : '#dedede',
              }}
              placeholder="ölçü vahidi"
              name="name"
              defaultValue={name}
              onChange={({ target: { value } }) => onChange('name', value)}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
              maxLength={15}
            />
          </td>
          <td>
            <Input
              type="text"
              style={{
                borderColor: errors.key ? 'red' : '#dedede',
              }}
              placeholder="açar sözü"
              name="key"
              onChange={({ target: { value } }) => onChange('key', value)}
              defaultValue={unitKey}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
            />
            {permission ? (
              <Can I={accessTypes.manage} a={permissions.msk_product}>
                <div>
                  <a
                    onClick={toggleHandle}
                    href="javascript:;"
                    className={styles.delete}
                  >
                    <FaWindowClose size={18} />
                  </a>
                  <a
                    onClick={saveHandle}
                    href="javascript:;"
                    className={styles.edit}
                  >
                    <FaSave size={18} />
                  </a>
                </div>
              </Can>
            ) : (
              <div>
                <a
                  onClick={toggleHandle}
                  href="javascript:;"
                  className={styles.delete}
                >
                  <FaWindowClose size={18} />
                </a>
                <a
                  onClick={saveHandle}
                  href="javascript:;"
                  className={styles.edit}
                >
                  <FaSave size={18} />
                </a>
              </div>
            )}
          </td>
        </>
      ) : (
        <>
          <td style={{ width: '40%' }}>
            <span>{name}</span>
          </td>
          <td>
            <span>{unitKey || ''}</span>
            {permission ? (
              <Can I={accessTypes.manage} a={permissions.msk_product}>
                <div>
                  <a
                    onClick={() => deleteHandle(id)}
                    href="javascript:;"
                    className={styles.delete}
                  >
                    <FaTrash size={18} />
                  </a>
                  <a
                    onClick={toggleHandle}
                    href="javascript:;"
                    className={styles.edit}
                  >
                    <FaPencilAlt size={18} />
                  </a>
                </div>
              </Can>
            ) : (
              <div>
                <a
                  onClick={() => deleteHandle(id)}
                  href="javascript:;"
                  className={styles.delete}
                >
                  <FaTrash size={18} />
                </a>
                <a
                  onClick={toggleHandle}
                  href="javascript:;"
                  className={styles.edit}
                >
                  <FaPencilAlt size={18} />
                </a>
              </div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}

function UnitOfMeasurements(props) {
  const {
    createUnitOfMeasurements,
    editUnitOfMeasurements,
    deleteUnitOfMeasurements,
    fetchUnitOfMeasurements,
    unitOfMeasurements,
    isLoading,
  } = props;

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
    values: [{ name: 'name', value: '' }, { name: 'key', value: '' }],
    onSubmit: ({ name, key }) => {
      createUnitOfMeasurements(
        name,
        key,
        () => {
          fetchUnitOfMeasurements();
        },
        ({ error }) => {
          let messageKey = error?.response?.data?.error?.message;
          if (messageKey === 'This unit of measurement is already exists.') {
            toast.error('Bu ölçü vahidi artıq əlavə edilmişdir.');
          } else if (
            messageKey === 'This unit of measurement key is already exists.'
          ) {
            toast.error('Bu açar söz artıq əlavə edilmişdir.');
          }
        }
      );
      toggleHandle();
    },
  });

  const positionDeleteHandle = useCallback(
    id => {
      swal({
        title: 'Silmək istədiyinizə əminsinizmi?',
        icon: 'warning',
        buttons: ['İmtina', 'Sil'],
        dangerMode: true,
      }).then(willDelete => {
        if (willDelete) {
          deleteUnitOfMeasurements(id);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const positionEditHandle = useCallback((id, name, key) => {
    editUnitOfMeasurements(
      id,
      name,
      key,
      () => {},
      ({ error }) => {
        let messageKey = error?.response?.data?.error?.message;
        if (messageKey === 'This unit of measurement is already exists.') {
          toast.error('Bu ölçü vahidi artıq əlavə edilmişdir.');
        } else if (
          messageKey === 'This unit of measurement key is already exists.'
        ) {
          toast.error('Bu açar söz artıq əlavə edilmişdir.');
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className={styles.body}>
        <Can I={accessTypes.manage} a={permissions.msk_product}>
          <div className={styles['btn-container']}>
            <Button
              onClick={toggleHandle}
              icon="plus"
              size="large"
              type="primary"
            >
              Yeni ölçü vahidi
            </Button>
          </div>
        </Can>
      </div>
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
                  <th>Ölçü vahidi</th>
                  <th>Açar sözü</th>
                </tr>
              </thead>
              <tbody>
                {editable && (
                  <tr>
                    <td />
                    <td style={{ width: '40%' }}>
                      <Input
                        ref={firstInputRef}
                        type="text"
                        style={{
                          borderColor: errors.name ? 'red' : '#dedede',
                        }}
                        placeholder="ölçü vahidi"
                        name="name"
                        defaultValue=""
                        onChange={({ target: { value } }) =>
                          onChange('name', value)
                        }
                        onKeyUp={onEnterKeyUp}
                        onKeyDown={onEscKeyDown}
                        maxLength={15}
                      />
                    </td>
                    <td>
                      <Input
                        type="text"
                        style={{
                          borderColor: errors.key ? 'red' : '#dedede',
                        }}
                        placeholder="açar sözü"
                        name="key"
                        onChange={({ target: { value } }) =>
                          onChange('key', value)
                        }
                        defaultValue=""
                        onKeyUp={onEnterKeyUp}
                        onKeyDown={onEscKeyDown}
                        maxLength={25}
                      />
                      <div>
                        <a
                          onClick={toggleHandle}
                          href="javascript:;"
                          className={styles.delete}
                        >
                          <FaWindowClose size={18} />
                        </a>
                        <a
                          onClick={saveHandle}
                          href="javascript:;"
                          className={styles.edit}
                        >
                          <FaSave size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
                {unitOfMeasurements.map(({ id, name, key: unitKey }, index) => (
                  <EditableUnitRow
                    key={`${id}${name}`}
                    {...{ id, name, index, unitKey }}
                    maxLength={15}
                    editHandle={positionEditHandle}
                    deleteHandle={positionDeleteHandle}
                    permission={permissions.msk_product}
                  />
                ))}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </>
  );
}

// UnitOfMeasurements.propTypes = {};

const mapStateToProps = state => ({
  unitOfMeasurements: state.mehsulReducer.unitOfMeasurements,
  isLoading: state.mehsulReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    createUnitOfMeasurements,
    editUnitOfMeasurements,
    deleteUnitOfMeasurements,
    fetchUnitOfMeasurements,
  }
)(UnitOfMeasurements);
