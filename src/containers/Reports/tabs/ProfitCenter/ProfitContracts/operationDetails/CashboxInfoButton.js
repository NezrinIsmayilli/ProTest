import React, { useState } from 'react';
import { Button, Tooltip, Icon } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { FaInfoCircle } from 'react-icons/fa';

import styles from './styles.module.scss';

const CashboxInfoTip = props => {
  const { info = [] } = props;
  return (
    <div>
      <div>
        {' '}
        {info
          ? formatNumberToLocale(defaultNumberFormat(info?.amount))
          : 'Məlumat yoxdur'}
      </div>
    </div>
  );
};

export default function CashboxInfoButton(props) {
  const { fetchInfo = () => {} } = props;

  const [state, setState] = useState({
    visible: false,
    loading: false,
    info: null,
  });

  const { visible, loading, info } = state;

  function infoClickHandle(isVisible) {
    if (isVisible) {
      setState({
        ...state,
        visible: false,
        loading: true,
      });

      return fetchInfo(fetchFinishedCallback);
    }

    setState({
      ...state,
      visible: isVisible,
    });
  }

  function fetchFinishedCallback(data = null) {
    setState({
      info: data,
      visible: true,
      loading: false,
    });
  }

  return (
    <Tooltip
      title={<CashboxInfoTip info={info} />}
      visible={visible}
      trigger="click"
      onVisibleChange={infoClickHandle}
    >
      <Button type="link" className={styles.infoButton}>
        {loading ? (
          <Icon type="sync" spin />
        ) : (
          <Icon component={FaInfoCircle} />
        )}
      </Button>
    </Tooltip>
  );
}
