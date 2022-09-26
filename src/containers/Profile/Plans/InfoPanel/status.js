import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';
import { dateFormat } from 'utils';

import styles from '../styles.module.scss';

function Status({ subscription }) {
  const { endsAt = '', remainedDays } = subscription;

  const formattedEndDate = moment(endsAt).format(dateFormat);

  return (
    <div className={styles.subscription}>
      Paketin bitmə tarixi:
      <div className={styles.infoDates}>
        <span>{formattedEndDate}</span>
        {/* <span className={styles.divider}></span> */}
        <br />
        <span>{remainedDays} gün</span>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  subscription: state.subscriptionReducer.subscription,
});

export default connect(mapStateToProps)(Status);
