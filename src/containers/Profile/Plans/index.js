import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
// ui
import { Row, Col, Spin } from 'antd';

import { PlansContextProvider } from './plans-context';

import Tabs from './Tabs';
import PriceTable from './PriceTable';
import InfoPanel from './InfoPanel';

import styles from './styles.module.scss';

function Plans(props) {
  const { loading, packageKeys, packages, limits } = props;

  return (
    <section className="aside-without-navigation scrollbar">
      <Spin spinning={loading} size="large">
        <Row gutter={24} className={styles.rows}>
          <PlansContextProvider
            packageKeys={packageKeys}
            packages={packages}
            limits={limits}
          >
            <Col xl={16} xxl={18}>
              <Tabs packageKeys={packageKeys} packages={packages} />

              <PriceTable />
            </Col>

            <Col xl={8} xxl={6}>
              <InfoPanel />
            </Col>
          </PlansContextProvider>
        </Row>
      </Spin>
    </section>
  );
}

const getPackageKeys = createSelector(
  state => state.subscriptionReducer.packages,
  packages => Object.keys(packages)
);

const mapStateToProps = state => ({
  loading: !!state.loadings.subscriptionsInfo,
  packages: state.subscriptionReducer.packages,
  limits: state.subscriptionReducer.limits,
  packageKeys: getPackageKeys(state),
});

export default connect(mapStateToProps)(Plans);
