import React, { useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Spin, Button, Icon } from 'antd';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { deleteModalHelper } from 'utils';
import { Can } from 'components/Lib';
import { accessTypes, permissions } from 'config/permissions';
import {
  fetchCreditType,
  deleteCreditTypes,
} from 'store/actions/settings/credit';
import AddCreditModal from './addCredit';
import styles from '../index.module.sass';

function CreditTypes(props) {
  const { isLoading, creditTypes, deleteCreditTypes, fetchCreditType } = props;
  const [creditModalIsVisible, setCreditModalIsVisible] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(undefined);
  const [selectedRowName, setSelectedRowName] = useState(undefined);
  const [selectedCreditType, setSelectedCreditType] = useState([]);

  useEffect(() => {
    if (creditModalIsVisible === false) setSelectedCreditType([]);
  }, [creditModalIsVisible]);

  const toggleCreditModal = () => {
    setCreditModalIsVisible(prevValue => !prevValue);
  };
  const deleteHandle = useCallback(
    id => deleteModalHelper(() => deleteCreditTypes(id)),
    [deleteCreditTypes]
  );
  const editHandle = (id, name) => {
    setSelectedRowId(id);
    setSelectedRowName(name);
    fetchCreditType({
      id,
      onSuccessCallback: ({ data }) => {
        setSelectedCreditType(data);
      },
    });
    toggleCreditModal();
  };
  return (
    <div>
      <AddCreditModal
        isVisible={creditModalIsVisible}
        toggleModal={toggleCreditModal}
        selectedCreditType={selectedCreditType}
        selectedRowId={selectedRowId}
        selectedRowName={selectedRowName}
        setSelectedRowId={setSelectedRowId}
      />
      <div className={styles.body}>
        <Can I={accessTypes.manage} a={permissions.credits}>
          <div className={styles['btn-container']}>
            <Button
              onClick={toggleCreditModal}
              icon="plus"
              size="large"
              type="primary"
            >
              Əlavə et
            </Button>
          </div>
        </Can>
      </div>
      <Row>
        <Col>
          <Spin size="large" spinning={isLoading}>
            <table
              className={`${styles['table-msk']} ${styles['table-msk-credit']}`}
            >
              <thead>
                <tr>
                  <th>№</th>
                  <th style={{ textAlign: 'left' }}>Kredit növü</th>
                  <Can I={accessTypes.manage} a={permissions.credits}>
                    <th>Seç</th>
                  </Can>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: null, name: 'Sərbəst', isFront: true },
                  ...creditTypes,
                ].map(({ id, name, isFront }, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td style={{ justifyContent: 'left' }}>{name}</td>
                    <Can I={accessTypes.manage} a={permissions.credits}>
                      <td>
                        {isFront ? null : (
                          <>
                            <Button
                              type="link"
                              onClick={() => deleteHandle(id)}
                              className={styles.delete}
                            >
                              <Icon component={FaTrash} />
                            </Button>
                            <Button
                              type="link"
                              onClick={() => editHandle(id, name)}
                              className={styles.edit}
                            >
                              <Icon component={FaPencilAlt} />
                            </Button>
                          </>
                        )}
                      </td>
                    </Can>
                  </tr>
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
  isLoading: state.creditReducer.isLoading,
  creditTypes: state.creditReducer.creditTypes,
});

export default connect(
  mapStateToProps,
  { deleteCreditTypes, fetchCreditType }
)(CreditTypes);
