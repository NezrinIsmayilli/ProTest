import React from 'react';
import { connect } from 'react-redux';

import { Icon } from 'antd';

import styles from '../styles.module.scss';

function Overallprice({ loading, total = 0 }) {
  return (
    <div>
      {/* <div className={styles.taxes}>
      Taxes
      <span>100 AZN</span>
    </div> */}

      <div className={styles.total}>
        Cəmi <span>{loading ? <Icon type="sync" spin /> : total} AZN</span>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  loading: !!state.loadings.overallPrice,
  total: state.subscriptionReducer.total,
});

export default connect(mapStateToProps)(Overallprice);
