/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row } from 'antd';
import { getApps } from 'store/actions/apps';

import Table from './Table';
import DefaultSideBar from '../Sidebar';
import styles from './styles.module.scss';

const Apps = props => {
  const { getApps, apps } = props;

  useEffect(() => {
    getApps();
  }, [getApps]);

  return (
    <div>
      <DefaultSideBar />
      <section className="scrollbar aside" style={{ padding: '0 32px' }}>
        <div className={styles.content}>
          <Row>
            <Table appsData={apps} />
          </Row>
        </div>
      </section>
    </div>
  );
};
const mapStateToProps = state => ({
  apps: state.appsReducer.apps,
});

export default connect(
  mapStateToProps,
  { getApps }
)(Apps);
