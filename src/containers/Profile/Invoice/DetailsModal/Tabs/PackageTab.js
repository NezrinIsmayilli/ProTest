/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchTenentFeature } from 'store/actions/subscription';
import { ProCollapse, ProPanel } from 'components/Lib';
import Detail from '../detail';
import styles from '../styles.module.scss';
import { CustomerTag } from './CustomerTag';

const PackageTab = props => {
  const { data, fetchTenentFeature, tenentFeature } = props;

  const [isFetched, setIsFetched] = useState(false);
  const [toggleFetch, setToggleFetch] = useState(false);
  const [filters, onFilter] = useFilterHandle(
    {
      tenant: data.id,
    },
    () => {
      toggleFetchAction();
    }
  );

  const toggleFetchAction = () => {
    setToggleFetch(prevToggleFetch => !prevToggleFetch);
  };

  useEffect(() => {
    if (isFetched) {
      fetchTenentFeature(filters);
    } else {
      setIsFetched(true);
    }
  }, [toggleFetch]);

  return (
    <div style={{ margin: '5px' }}>
      <ul className={styles.detailsList}>
        {tenentFeature.length > 0 ? (
          <ProCollapse defaultActiveKey="1">
            <ProPanel header="Modullar" key="1">
              <CustomerTag
                text={tenentFeature.map(
                  ({ featureName, price, featureType }) => {
                    if (featureType === '1') {
                      return price !== null ? <h6>{featureName}</h6> : null;
                    }
                    return false;
                  }
                )}
              />
            </ProPanel>
          </ProCollapse>
        ) : (
          <Detail primary="Modullar" secondary="-" />
        )}

        {tenentFeature.map(
          ({ featureName, quantity, featureKey, featureType }) =>
            featureType === '2' ? (
              <Detail
                primary={featureName}
                secondary={
                  featureKey === 'employees_count'
                    ? Number(quantity) + 20
                    : featureKey === 'tenant_persons_count'
                    ? Number(quantity) + 3
                    : quantity || 0
                }
              />
            ) : null
        )}

        {tenentFeature.length > 0 ? (
          <ProCollapse defaultActiveKey="2">
            <ProPanel header="Xidmətlər" key="2">
              <CustomerTag
                text={tenentFeature.map(({ featureName, featureType }) =>
                  featureType === '3' ? <h6>{featureName}</h6> : null
                )}
              />
            </ProPanel>
          </ProCollapse>
        ) : (
          <Detail primary="Xidmətlər" secondary="-" />
        )}
      </ul>
    </div>
  );
};
const mapStateToProps = state => ({
  tenentFeature: state.subscriptionReducer.tenentFeature,
});

export default connect(
  mapStateToProps,
  {
    fetchTenentFeature,
  }
)(PackageTab);

