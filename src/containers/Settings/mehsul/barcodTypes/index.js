import React, { useCallback, useState, useEffect } from 'react';
import { Row, Col, Input, Spin, Switch } from 'antd';
import { connect } from 'react-redux';
import { FaSave, FaWindowClose, FaPencilAlt } from 'react-icons/fa';
import { Can, ProModal } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import { isValidNumber } from 'utils';
import { createBarcode } from 'store/actions/settings/mehsul';
import { useMultiEditable } from 'hooks/useMultiEditable';
import { toast } from 'react-toastify';
import styles from '../../index.module.sass';
import AddBarcode from './addBarcode';

const defaultData = [
  { type: 1, length: 30 },
  {
    type: 2,
    length: 13,
    barBackground: '#FFFFFF',
    barHeight: '100',
    barWidth: '2',
    font: '1',
    fontSize: '20',
    lineColor: '#000',
    textAlign: 'center',
  },
];

function EditableUnitRow(props) {
  const {
    id,
    type,
    index,
    isActive,
    barcodTypes,
    length,
    editHandle,
    permission,
    toggleModalHandle,
  } = props;
  const {
    editable,
    onChange,
    firstInputRef,
    toggleHandle,
    onEnterKeyUp,
    onEscKeyDown,
    saveHandle,
    getValues,
  } = useMultiEditable({
    values: [{ name: 'length', value: length }],
    onSubmit: ({ length }) => {
      if (Number(length) > 30) {
        toast.error('30 simvoldan çox ola bilməz');
      } else if (Number(length) < 5) {
        toast.error('5 simvoldan az olmamalıdır');
      } else {
        editHandle(type, { length, type });
        toggleHandle();
      }
    },
  });

  const [isChecked, setIsChecked] = useState(isActive);

  function onCheckboxChange(data) {
    if (barcodTypes.length > 0) {
      editHandle(2, { ...barcodTypes[0], isActive: !isChecked, id: undefined });
    } else {
      editHandle(2, {
        ...defaultData[1],
        isActive: !isChecked,
        id: undefined,
      });
    }
    setIsChecked(!isChecked);
  }
  return (
    <tr key={id}>
      <td>{index + 1}</td>
      {editable ? (
        <>
          <td>
            <span>{type === 1 ? 'Sərbəst' : null}</span>
          </td>
          <td>
            <Input
              ref={firstInputRef}
              type="text"
              placeholder="simvol sayı"
              name="length"
              value={getValues('length')?.length}
              onChange={({ target: { value } }) => {
                const isValid = isValidNumber(value);
                if (!isValid) {
                  return;
                }
                return onChange('length', value === '' ? '' : Number(value));
              }}
              defaultValue={length}
              onKeyUp={onEnterKeyUp}
              onKeyDown={onEscKeyDown}
            />
          </td>
          <td>
            {type !== 1 ? (
              <Switch
                className={!isChecked ? styles.switchColor : ''}
                checked={isChecked}
                defaultChecked
                onChange={checked => onCheckboxChange(checked)}
              />
            ) : null}
          </td>
          <td style={{ justifyContent: 'right' }}>
            {permission ? (
              <Can I={accessTypes.manage} a={permissions.msk_product}>
                <div style={{ padding: '5px 0' }}>
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
              <div style={{ padding: '5px 0' }}>
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
          <td>
            <span>{type === 1 ? 'Sərbəst' : 'EAN-13'}</span>
          </td>
          <td>
            <span>{length || 30}</span>
          </td>
          <Can I={accessTypes.manage} a={permissions.msk_product}>
            <td>
              {type !== 1 ? (
                <Switch
                  className={!isChecked ? styles.switchColor : ''}
                  checked={isChecked}
                  defaultChecked
                  onChange={checked => onCheckboxChange(checked)}
                />
              ) : null}
            </td>
          </Can>
          {permission ? (
            <Can I={accessTypes.manage} a={permissions.msk_product}>
              <td style={{ justifyContent: 'right' }}>
                <a
                  onClick={type === 1 ? toggleHandle : toggleModalHandle}
                  href="javascript:;"
                  className={styles.barcodeEdit}
                >
                  <FaPencilAlt size={18} />
                </a>
              </td>
            </Can>
          ) : (
            <td style={{ justifyContent: 'right' }}>
              <a
                onClick={type === 1 ? toggleHandle : toggleModalHandle}
                href="javascript:;"
                className={styles.barcodeEdit}
              >
                <FaPencilAlt size={18} />
              </a>
            </td>
          )}
        </>
      )}
    </tr>
  );
}

function BarcodTypes(props) {
  const { createBarcode, barcodTypes, freeBarcodTypes, isLoading } = props;

  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    if (barcodTypes.length > 0 || freeBarcodTypes.length > 0) {
      setAllData([...freeBarcodTypes, ...barcodTypes]);
    }
  }, [barcodTypes, freeBarcodTypes]);

  const positionEditHandle = useCallback((type, data) => {
    if (type === 1) {
      if (data.length > 30) {
        toast.error('30 simvoldan çox ola bilməz');
      } else if (data.length < 5) {
        toast.error('5 simvoldan az ola bilməz');
      } else {
        createBarcode(type, data);
      }
    } else {
      createBarcode(type, data);
      setModalIsVisible(false);
    }
  }, []);

  const toggleModalHandle = useCallback(() => {
    setModalIsVisible(!modalIsVisible);
  });

  return (
    <>
      <ProModal
        maskClosable
        padding
        width={800}
        handleModal={toggleModalHandle}
        isVisible={modalIsVisible}
      >
        <AddBarcode
          onCancel={toggleModalHandle}
          visible={modalIsVisible}
          positionEditHandle={positionEditHandle}
        />
      </ProModal>
      <Row>
        <Col>
          <Spin size="large" spinning={isLoading}>
            <table
              className={[
                styles['table-msk'],
                styles['table-msk-barcode'],
              ].join(' ')}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th>Tip</th>
                  <th>Simvol sayı</th>
                  <Can I={accessTypes.manage} a={permissions.msk_product}>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Seç</th>
                  </Can>
                </tr>
              </thead>
              <tbody>
                {allData.length > 0
                  ? defaultData
                      .map(item => {
                        if (
                          allData.find(
                            salesBuys => item.type === salesBuys.type
                          )
                        ) {
                          return allData.find(
                            salesBuys => item.type === salesBuys.type
                          );
                        }
                        return item;
                      })
                      .map(({ id, type, length, isActive }, index) => (
                        <EditableUnitRow
                          key={id}
                          {...{ id, index, type, length, isActive }}
                          barcodTypes={barcodTypes}
                          maxLength={15}
                          editHandle={positionEditHandle}
                          toggleModalHandle={toggleModalHandle}
                          permission={permissions.msk_product}
                        />
                      ))
                  : defaultData.map(({ id, type, length, isActive }, index) => (
                      <EditableUnitRow
                        key={id}
                        {...{ id, index, type, length, isActive }}
                        barcodTypes={barcodTypes}
                        maxLength={15}
                        editHandle={positionEditHandle}
                        toggleModalHandle={toggleModalHandle}
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

const mapStateToProps = state => ({
  barcodTypes: state.mehsulReducer.barcodTypes,
  freeBarcodTypes: state.mehsulReducer.freeBarcodTypes,
  isLoading: state.mehsulReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    createBarcode,
  }
)(BarcodTypes);
