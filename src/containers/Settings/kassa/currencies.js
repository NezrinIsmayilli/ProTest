/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
import React, { useCallback, useEffect, useRef, useReducer } from 'react';
// import PropTypes from 'prop-types';
import { Button, Row, Col, Input, Switch, Spin } from 'antd';
import { connect } from 'react-redux';
import { defaultNumberFormat, re_amount } from 'utils';
import { FaSave, FaPencilAlt, FaWindowClose } from 'react-icons/fa';
import { ProModal, Can } from 'components/Lib';
import swal from 'sweetalert';
import { accessTypes, permissions } from 'config/permissions';
import {
  // fetchCurrencies,
  fetchMainCurrency,
  createCurrenciesRate,
  switchCurrenciesActiveStatus,
  switchMainCurrency,
  fetchGeneralCurrencies,
} from 'store/actions/settings/kassa';
import AddCurrencies from './addCurrencies';
import styles from '../index.module.sass';

const intialState = {
  editable: false,
  values: {
    isActive: undefined,
    currency: undefined,
    rate: undefined,
    isMain: undefined,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'onChange':
      if (action.payload.name === 'rate' && Number(action.payload.value) < 0) {
        return state;
      }
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value,
        },
      };
    case 'setEditable':
      return {
        ...state,
        editable: !action.payload.editable,
        values: {
          isActive: action.payload.isActive,
          currency: action.payload.currency,
          rate: action.payload.rate,
          isMain: action.payload.isMain,
        },
      };
    case 'toggle':
      return {
        ...intialState,
        editable: !state.editable,
      };
    default:
      return state;
  }
}

const CurrenciesEditableRow = React.memo(function CurrenciesEditableRow(props) {
  const {
    code,
    currency,
    isActive,
    isMain,
    name,
    rate,
    index,
    mainCurrencyChange,
    currencyStatusChange,
    currencyEditHandle,
    permissions,
  } = props;

  const [{ editable, values }, dispatch] = useReducer(reducer, intialState);

  function saveHandle() {
    // id edit mode and no errors
    if (editable && values.rate) {
      currencyEditHandle(values);
      dispatch({ type: 'toggle' });
      // set inputs initial values and on Edit mode
    } else {
      dispatch({
        type: 'setEditable',
        payload: { isActive, isMain, currency, rate, editable },
      });
    }
  }

  function onChange(name, value) {
    if (re_amount.test(value) && Number(value) <= 10000)
      dispatch({ type: 'onChange', payload: { name, value } });
    if (value === '') dispatch({ type: 'onChange', payload: { name, value } });
  }

  // save on ENTER press
  function onEnterKeyUp(event) {
    if (event.keyCode === 13) {
      saveHandle();
    }
  }

  // close edit mode on ESC press
  function onEscKeyPress(event) {
    if (event.keyCode === 27) {
      dispatch({ type: 'toggle' });
    }
  }

  const firstInputRef = useRef(null);
  useEffect(() => {
    if (editable) {
      firstInputRef.current.focus();
    }
  }, [editable]);
  const isReadOnlyFunc = () => {
    const msk_cashbox = permissions.filter(
      permission => permission.key === 'msk_cashbox'
    );
    return msk_cashbox[0].permission === 1;
  };
  const isReadOnly = isReadOnlyFunc();

  const Active = () => {
    swal({
      title: 'Diqqət!',
      text: 'Əsas valyuta olaraq təyin etmək istədiyinizə əminsinizmi?',
      buttons: {
        cancel: {
          text: 'İmtina',
          value: null,
          visible: true,
          closeModal: true,
        },
        confirm: {
          text: 'Bəli',
          value: true,
          visible: true,
          className: `${styles.swalButtons}`,
          closeModal: true,
        },
      },
    }).then(value => {
      if (value) {
        mainCurrencyChange(currency);
      }
    });
  };
  return (
    <tr key={`${code}${currency}${index}`}>
      <td style={{ width: '80px', textAlign: 'start', padding: '12px 20px' }}>
        {index + 1}
      </td>
      <td style={{ width: '300px', textAlign: 'center', padding: '12px 20px' }}>
        {editable ? (
          <Switch
            onChange={value => onChange('isMain', value)}
            checked={values.isMain}
            disabled={isReadOnly}
          />
        ) : (
          <Switch
            onChange={Active}
            checked={isMain}
            disabled={isMain || isReadOnly}
          />
        )}
      </td>
      <td style={{ width: '300px', textAlign: 'center', padding: '12px 20px' }}>
        {editable ? (
          <Switch
            checked={values.isActive}
            onChange={value => onChange('isActive', value)}
            disabled={isReadOnly}
          />
        ) : (
          <Switch
            checked={isActive}
            onChange={() => currencyStatusChange(currency)}
            disabled={isMain || isReadOnly}
          />
        )}
      </td>
      <td
        style={{
          width: '300px',
          textAlign: 'start',
          padding: '12px 20px',
        }}
      >
        {name}
      </td>
      <td style={{ width: '100%' }}>
        {editable ? (
          <Input
            ref={firstInputRef}
            style={{
              width: 180,
              margin: 0,
              height: 23,
              borderColor: !values.rate ? 'red' : '#dedede',
            }}
            type="number"
            min={0}
            name="rate"
            onChange={({ target: { value } }) => onChange('rate', value)}
            value={values.rate}
            maxLength={21}
            onKeyUp={onEnterKeyUp}
            onKeyDown={onEscKeyPress}
          />
        ) : (
          <span
            style={{
              width: '300px',
              textAlign: 'start',
              padding: '12px 20px',
            }}
          >
            {isMain ? '1.00' : defaultNumberFormat(rate)}
          </span>
        )}
        {!isMain && !isReadOnly && (
          <a
            onClick={saveHandle}
            href="javascript:;"
            className={styles.valyutaEdit}
          >
            {editable ? (
              values.rate ? (
                <FaSave size={18} />
              ) : (
                <FaWindowClose size={18} />
              )
            ) : (
              <FaPencilAlt size={18} />
            )}
          </a>
        )}
      </td>
    </tr>
  );
});

const addInitialState = {
  active: false,
  values: {
    isActive: true,
    currency: '',
    rate: '',
    isMain: false,
  },
};

function addReducer(state, action) {
  switch (action.type) {
    case 'onChange':
      if (action.payload.name === 'rate' && Number(action.payload.value) < 0) {
        return state;
      }

      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value,
        },
      };
    case 'toggle':
      return {
        ...addInitialState,
        active: !state.active,
      };
    case 'reset':
      return addInitialState;
    default:
      return state;
  }
}

function Currencies(props) {
  const {
    switchCurrenciesActiveStatus,
    switchMainCurrency,
    createCurrenciesRate,
    fetchGeneralCurrencies,
    generalCurrencies,
    fetchMainCurrency,
    mainCurrency,
    currencies,
    isLoading,
    permissions: permissionKeys,
  } = props;
  useEffect(() => {
    if (generalCurrencies.length === 0) {
      fetchGeneralCurrencies({ new: 1 });
    }
    fetchMainCurrency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // function relaodCurrencies() {
  //   fetchCurrencies('isReloading');
  // }

  const currencyEditHandle = useCallback(data => {
    createCurrenciesRate({
      currency: data.currency,
      rate: defaultNumberFormat(data.rate),
      startsAt: null,
    });
  }, []);

  const mainCurrencyChange = useCallback(
    id => {
      const currency = currencies.find(item => item.currency === id);
      switchMainCurrency(currency.id);
    },
    [currencies]
  );

  const currencyStatusChange = useCallback(
    id => {
      const currency = currencies.find(item => item.currency === id);
      switchCurrenciesActiveStatus(currency.id);
    },
    [currencies]
  );

  const [{ active, values }, dispatch] = useReducer(
    addReducer,
    addInitialState
  );
  const toggleHandle = () => {
    dispatch({ type: 'toggle' });
  };

  return (
    <>
      <ProModal
        maskClosable
        padding
        width={400}
        handleModal={toggleHandle}
        isVisible={active}
      >
        <AddCurrencies
          onCancel={toggleHandle}
          mainCurrency={mainCurrency}
          generalCurrencies={generalCurrencies}
        />
      </ProModal>
      <div className={styles.body}>
        <div className={styles['btn-container']}>
          {/* <Button
            onClick={relaodCurrencies}
            icon="reload"
            size="large"
            type="primary"
            className={styles.marginRight10}
          >
            Yenilə
          </Button> */}
          <Can I={accessTypes.manage} a={permissions.msk_cashbox}>
            <Button
              onClick={toggleHandle}
              icon="plus"
              size="large"
              type="primary"
            >
              Yeni valyuta
            </Button>
          </Can>

          {/* <Button
            onClick={toggleHandle}
            icon="plus"
            size="large"
            type="primary"
          >
            Merkezi bankdan gotur
          </Button> */}
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
                  <th
                    style={{
                      width: '80px',
                      textAlign: 'start',
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
                    Əsas
                  </th>
                  <th
                    style={{
                      width: '300px',
                      textAlign: 'center',
                      padding: '12px 20px',
                    }}
                  >
                    Aktiv
                  </th>
                  <th
                    style={{
                      width: '300px',
                      textAlign: 'start',
                      padding: '12px 20px',
                    }}
                  >
                    Valyuta
                  </th>
                  <th
                    style={{
                      width: '300px',
                      textAlign: 'start',
                      padding: '12px 20px',
                    }}
                  >
                    Məzənnə
                  </th>
                </tr>
              </thead>
              <tbody>
                {currencies.map(
                  ({ code, currency, isActive, isMain, name, rate }, index) => (
                    <CurrenciesEditableRow
                      key={`${code}${name}`}
                      permissions={permissionKeys}
                      {...{
                        index,
                        code,
                        currency,
                        isActive,
                        isMain,
                        name,
                        rate: defaultNumberFormat(rate),
                        mainCurrencyChange,
                        currencyStatusChange,
                        currencyEditHandle,
                      }}
                    />
                  )
                )}
              </tbody>
            </table>
          </Spin>
        </Col>
      </Row>
    </>
  );
}

// Currencies.propTypes = {};

const mapStateToProps = state => ({
  currencies: state.kassaReducer.currencies,
  mainCurrency: state.kassaReducer.mainCurrency,
  generalCurrencies: state.kassaReducer.generalCurrencies,
  permissions: state.permissionsReducer.permissions,
  isLoading: state.kassaReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    switchCurrenciesActiveStatus,
    switchMainCurrency,
    createCurrenciesRate,
    fetchGeneralCurrencies,
    fetchMainCurrency,
  }
)(Currencies);
