/* eslint-disable react/display-name */
import React, { useCallback } from 'react';
// import PropTypes from 'prop-types';
import { Button, Row, Col, Input, Spin } from 'antd';
import { connect } from 'react-redux';
import { FaSave, FaWindowClose, FaTrash, FaPencilAlt } from 'react-icons/fa';
import {
  createTaxTypes,
  editTaxTypes,
  deleteTaxTypes,
} from 'store/actions/settings/mehsul';

import swal from '@sweetalert/with-react';
import { useMultiEditable } from 'hooks/useMultiEditable';

import styles from '../index.module.sass';

const TaxEditableRow = React.memo(function TaxEditableRow(props) {
  const { id, name, percentage, editHandle, deleteHandle, index } = props;
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
      { name: 'percentage', value: percentage },
    ],
    onSubmit: ({ name, percentage }) => {
      editHandle(id, { name, percentage: +percentage });
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
              placeholder="Verginin adı"
              name="name"
              defaultValue={name}
              onChange={({ target: { value } }) => onChange('name', value)}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
            />
          </td>
          <td>
            <Input
              onChange={({ target: { value } }) =>
                onChange('percentage', value)
              }
              type="number"
              defaultValue={percentage}
              style={{
                borderColor: errors.percentage ? 'red' : '#dedede',
              }}
              placeholder="Faizi"
              name="percentage"
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
                <FaTrash size={18} />
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
            <span>{percentage} %</span>
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
});

function TaxTypes(props) {
  const {
    createTaxTypes,
    editTaxTypes,
    deleteTaxTypes,
    taxTypes,
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
    values: [{ name: 'name', value: '' }, { name: 'percentage', value: '' }],
    onSubmit: ({ name, percentage }) => {
      createTaxTypes({ name, percentage: +percentage });
      toggleHandle();
    },
  });
  // const {
  //   register,
  //   errors,
  //   handleSubmit,
  //   clearError,
  //   setValue,
  //   unregister,
  // } = useForm();

  // const [open, setOpen] = useState(false);
  // const toggleHandle = () => {
  //   if (!open) {
  //     register({ name: 'name' }, { required: true });
  //     register({ name: 'percentage' }, { required: true });
  //   } else {
  //     unregister('name');
  //     unregister('percentage');
  //   }
  //   setOpen(!open);
  // };

  // function onChange(event) {
  //   const {
  //     target: { value, name },
  //   } = event;
  //   setValue(name, value);
  //   clearError(name);
  // }

  // const handleFormSubmit = ({ name, percentage }) => {
  //   createTaxTypes({ name, percentage: +percentage });
  //   toggleHandle();
  // };

  const taxTypesDeleteHandle = useCallback(
    id => {
      swal({
        title: 'Silmək istədiyinizə əminsinizmi?',
        icon: 'warning',
        buttons: ['İmtina', 'Sil'],
        dangerMode: true,
      }).then(willDelete => {
        if (willDelete) {
          deleteTaxTypes(id);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const taxTypesEditHandle = useCallback((id, { name, percentage }) => {
    editTaxTypes(id, { name, percentage });
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
            Yeni vergi növü
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
                  <th style={{ width: '40%' }}>Vergi növü</th>
                  <th style={{ width: '50%' }}>Faizi</th>
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
                        placeholder="Verginin adı"
                        name="name"
                        onChange={({ target: { value } }) =>
                          onChange('name', value)
                        }
                        onKeyDown={onEscKeyDown}
                        onKeyUp={onEnterKeyUp}
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        style={{
                          borderColor: errors.percentage ? 'red' : '#dedede',
                        }}
                        min={0}
                        maxLength={25}
                        placeholder="Faizi"
                        name="percentage"
                        onChange={({ target: { value } }) =>
                          Number(value) > 0 && onChange('percentage', value)
                        }
                        onKeyDown={onEscKeyDown}
                        onKeyUp={onEnterKeyUp}
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
                {taxTypes.map(({ id, name, percentage }, index) => (
                  <TaxEditableRow
                    key={id}
                    {...{ id, name, percentage, index }}
                    editHandle={taxTypesEditHandle}
                    deleteHandle={taxTypesDeleteHandle}
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

// TaxTypes.propTypes = {};

const mapStateToProps = state => ({
  taxTypes: state.mehsulReducer.taxTypes,
  isLoading: state.mehsulReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    createTaxTypes,
    editTaxTypes,
    deleteTaxTypes,
  }
)(TaxTypes);
