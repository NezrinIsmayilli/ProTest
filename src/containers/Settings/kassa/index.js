import React, { useEffect } from 'react';
import { createSelector } from 'reselect';
// import PropTypes from 'prop-types';
import {
  customCollapseStyle,
  customPanelStyle,
  CustomHeader,
} from 'components/Lib';
import { Collapse, Icon } from 'antd';
import { connect } from 'react-redux';
import {
  fetchCurrencies,
  fetchCashboxNames,
} from 'store/actions/settings/kassa';
import Currencies from './currencies';
// import Acccounts from './accounts';
import DefaultSidebar from '../sidebar';

const { Panel } = Collapse;

function Kassa(props) {
  const {
    fetchCurrencies,
    currenciesLength,
    cashBoxNamesLength,
    fetchCashboxNames,
  } = props;

  useEffect(() => {
    if (currenciesLength === 0 || cashBoxNamesLength === 0) {
      Promise.all([
        fetchCurrencies(true),
        fetchCashboxNames({ attribute: '1' }),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Collapse
        accordion
        bordered={false}
        style={customCollapseStyle}
        defaultActiveKey={['1']}
        expandIconPosition="right"
        expandIcon={({ isActive }) => (
          <Icon type="caret-right" rotate={isActive ? 90 : 0} />
        )}
      >
        {/* <Panel
          header={<CustomHeader title={`Hesablar (${cashBoxNamesLength})`} />}
          key="1"
          style={customPanelStyle}
        >
          <Acccounts />
        </Panel> */}
        <Panel
          header={<CustomHeader title={`Valyutalar (${currenciesLength})`} />}
          key="1"
          style={customPanelStyle}
        >
          <Currencies />
        </Panel>
      </Collapse>
    </div>
  );
}

const getCurrenciesLength = createSelector(
  state => state.kassaReducer.currencies,
  currencies => currencies.length
);
const getCashBoxNamessLength = createSelector(
  state => state.kassaReducer.cashBoxNames,
  cashBoxNames =>
    Object.keys(cashBoxNames).reduce(
      (acc, item) => (acc += cashBoxNames[item].length),
      0
    )
);

const mapStateToProps = state => ({
  currenciesLength: getCurrenciesLength(state),
  cashBoxNamesLength: getCashBoxNamessLength(state),
});

export default connect(
  mapStateToProps,
  { fetchCurrencies, fetchCashboxNames }
)(Kassa);
