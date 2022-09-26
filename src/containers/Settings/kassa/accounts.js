import React, { useCallback } from 'react';
// import PropTypes from 'prop-types';
import { EditableRow } from 'components/Lib';
import { Button, Row, Col, Input, Spin } from 'antd';
import { connect } from 'react-redux';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import { FaSave, FaWindowClose } from 'react-icons/fa';
import {
  fetchCashboxNames,
  createCashboxNames,
  editCashboxNames,
  deleteCashboxNames,
} from 'store/actions/settings/kassa';
import swal from '@sweetalert/with-react';
import styles from '../index.module.sass';

function Accounts(props) {
  const {
    fetchCashboxNames,
    createCashboxNames,
    editCashboxNames,
    deleteCashboxNames,
    cashBoxNames,
    isLoading,
  } = props;

  const [activeTab, setActiveTab] = React.useState('1');

  function tabChangeHandle(tab) {
    setActiveTab(tab);
    if (cashBoxNames[tab].length === 0) {
      fetchCashboxNames({ attribute: tab });
    }
  }

  const {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    toggleHandle,
    inputRef,
    onKeyUp,
  } = useToggledInputHandle(activeTab, (index, name) =>
    createCashboxNames(index, name, activeTab)
  );

  const positionDeleteHandle = useCallback(
    id => {
      swal({
        title: 'Silmək istədiyinizə əminsinizmi?',
        icon: 'warning',
        buttons: ['İmtina', 'Sil'],
        dangerMode: true,
      }).then(willDelete => {
        if (willDelete) {
          deleteCashboxNames(id, activeTab);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab]
  );

  const positionEditHandle = useCallback(
    (id, name) => {
      editCashboxNames(id, name, activeTab);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab]
  );

  return (
    <div className={styles.body}>
      <div className={styles['btn-container']}>
        <Button icon="plus" onClick={toggleHandle} size="large" type="primary">
          Yeni hesab
        </Button>
      </div>

      <Row>
        <Col span={8}>
          <ul className={styles['menu-kassa-msk-hesab']}>
            <li className={activeTab === '1' ? styles.active : ''}>
              <a href="javascript:;" onClick={() => tabChangeHandle('1')}>
                Nəğd hesablar
              </a>
            </li>

            <li className={activeTab === '2' ? styles.active : ''}>
              <a href="javascript:;" onClick={() => tabChangeHandle('2')}>
                Bank hesabları
              </a>
            </li>

            <li className={activeTab === '3' ? styles.active : ''}>
              <a href="javascript:;" onClick={() => tabChangeHandle('3')}>
                Kredit kartları
              </a>
            </li>

            <li className={activeTab === '4' ? styles.active : ''}>
              <a href="javascript:;" onClick={() => tabChangeHandle('4')}>
                Digər
              </a>
            </li>
          </ul>
        </Col>
        <Col span={16}>
          <Spin size="large" spinning={isLoading}>
            <table
              className={[styles['table-msk'], styles['table-msk-hesab']].join(
                ' '
              )}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: '80px',
                      textAlign: 'center',
                      padding: '12px 20px',
                    }}
                  >
                    №
                  </th>
                  <th
                    style={{
                      width: '300px',
                      textAlign: 'center',
                      padding: '12px 20px',
                    }}
                  >
                    Hesab
                  </th>
                </tr>
              </thead>
              <tbody>
                {open && (
                  <tr>
                    <td />
                    <td>
                      <Input
                        value={value}
                        ref={inputRef}
                        type="text"
                        onKeyUp={onKeyUp}
                        onChange={inputChangeHandle}
                        style={{
                          borderColor: error ? 'red' : '#dedede',
                        }}
                        placeholder="Hesab adı"
                        name="name"
                      />
                      <a
                        onClick={toggleHandle}
                        href="javascript:;"
                        className={styles.delete}
                      >
                        <FaWindowClose size={18} />
                      </a>
                      <a
                        onClick={handleSubmit}
                        href="javascript:;"
                        className={styles.edit}
                      >
                        <FaSave size={18} />
                      </a>
                    </td>
                  </tr>
                )}
                {cashBoxNames[activeTab].map(({ id, name }, index) => (
                  <EditableRow
                    key={`${id}${name}`}
                    {...{ id, name, index }}
                    placeholder="Hesab adı"
                    editHandle={positionEditHandle}
                    deleteHandle={positionDeleteHandle}
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

const mapStateToProps = state => ({
  cashBoxNames: state.kassaReducer.cashBoxNames,
  isLoading: state.kassaReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchCashboxNames,
    createCashboxNames,
    editCashboxNames,
    deleteCashboxNames,
  }
)(Accounts);
