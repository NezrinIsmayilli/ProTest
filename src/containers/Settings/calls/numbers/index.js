import React, { useCallback } from 'react';
// import PropTypes from 'prop-types';
import { Button, Row, Col, Input, Spin, Tooltip, Icon } from 'antd';
import { connect } from 'react-redux';
import {
  FaSave,
  FaWindowClose,
  FaTrash,
  FaPencilAlt,
  FaInfoCircle,
} from 'react-icons/fa';
import {
  createUnitOfMeasurements,
  editUnitOfMeasurements,
  deleteUnitOfMeasurements,
} from 'store/actions/settings/mehsul';
import swal from '@sweetalert/with-react';
import { useMultiEditable } from 'hooks/useMultiEditable';
import styles from '../../index.module.sass';

function EditableUnitRow(props) {
  const { id, name, index, unitKey, editHandle, deleteHandle } = props;
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
        </>
      ) : (
        <>
          <td style={{ width: '40%' }}>
            <span>{name}</span>
          </td>
          <td>
            <span>{unitKey || ''}</span>
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
          </td>
        </>
      )}
    </tr>
  );
}

function Numbers(props) {
  const {
    createUnitOfMeasurements,
    editUnitOfMeasurements,
    deleteUnitOfMeasurements,
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
      createUnitOfMeasurements(name, key);
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
    editUnitOfMeasurements(id, name, key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className={styles.body}>
        <div className={styles['btn-container']}>
          <Button
            onClick={toggleHandle}
            icon="plus"
            size="large"
            type="primary"
          >
            Yeni nömrə
          </Button>
        </div>
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
                  <th>Nömrə</th>
                  <th>Şifrə</th>
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
                          width: '90%',
                        }}
                        placeholder="nömrə"
                        name="name"
                        defaultValue=""
                        onChange={({ target: { value } }) =>
                          onChange('name', value)
                        }
                        onKeyUp={onEnterKeyUp}
                        onKeyDown={onEscKeyDown}
                      />
                      <Tooltip
                        placement="right"
                        title="1000-9999 ədəd intervalında nömrə daxil edilə bilər"
                      >
                        <Icon
                          component={FaInfoCircle}
                          style={{ fontSize: '18px', marginLeft: '10px' }}
                        ></Icon>
                      </Tooltip>
                    </td>
                    <td>
                      <span>
                        <Input.Password
                          // type="Password"
                          style={{
                            borderColor: errors.key ? 'red' : '#dedede',
                            width: '300px',
                          }}
                          placeholder="şifrə"
                          name="key"
                          onChange={({ target: { value } }) =>
                            onChange('key', value)
                          }
                          defaultValue=""
                          onKeyUp={onEnterKeyUp}
                          onKeyDown={onEscKeyDown}
                          // maxLength={25}
                        />
                        <Tooltip
                          placement="right"
                          title="Ən azı 8 simvoldan ibarət olmaq şərti ilə şifrə 1 kiçik, 1 böyük, 1 rəqəm və 1 xüsusi simvoldan təşkil olunmalıdır"
                        >
                          <Icon
                            component={FaInfoCircle}
                            style={{ fontSize: '18px' }}
                          ></Icon>
                        </Tooltip>
                      </span>
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
                {/* {unitOfMeasurements.map(({ id, name, key: unitKey }, index) => (
                  <EditableUnitRow
                    key={`${id}${name}`}
                    {...{ id, name, index, unitKey }}
                    editHandle={positionEditHandle}
                    deleteHandle={positionDeleteHandle}
                  />
                ))} */}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </>
  );
}

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
  }
)(Numbers);
