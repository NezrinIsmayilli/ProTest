import React from 'react';
import { Row, Col } from 'antd';
import { ProFilterButton, Can } from 'components/Lib';

import { accessTypes } from 'config/permissions';

import { operationNames } from 'utils';
import { financePermissionsHelper } from './components/FinanceTabs';

import styles from './styles.module.scss';

const {
  EXPENSE,
  INCOME,
  SPEND,
  MONEY_TRANSFER,
  SALARY,
  INITIAL_BALANCE,
} = operationNames;

const { read } = accessTypes;

function Tabs({ tab, setTab }) {
  return (
    <div className={styles.rowBox}>
      <Row gutter={32}>
        <Col span={18}>
          <div className={styles.buttonsBox}>
            <div>
              <Can I={read} a={financePermissionsHelper[EXPENSE]}>
                <ProFilterButton
                  onClick={() => setTab(EXPENSE)}
                  active={tab === EXPENSE}
                >
                  Məxaric
                </ProFilterButton>
              </Can>

              <Can I={read} a={financePermissionsHelper[INCOME]}>
                <ProFilterButton
                  onClick={() => setTab(INCOME)}
                  active={tab === INCOME}
                >
                  Mədaxil
                </ProFilterButton>
              </Can>
              <Can I={read} a={financePermissionsHelper[SPEND]}>
                <ProFilterButton
                  onClick={() => setTab(SPEND)}
                  active={tab === SPEND}
                >
                  Xərclər
                </ProFilterButton>
              </Can>
              <Can I={read} a={financePermissionsHelper[MONEY_TRANSFER]}>
                <ProFilterButton
                  onClick={() => setTab(MONEY_TRANSFER)}
                  active={tab === MONEY_TRANSFER}
                >
                  Pul transfer
                </ProFilterButton>
              </Can>
              <Can I={read} a={financePermissionsHelper[SALARY]}>
                <ProFilterButton
                  onClick={() => setTab(SALARY)}
                  active={tab === SALARY}
                >
                  Əmək haqqı ödənişi
                </ProFilterButton>
              </Can>
              <Can I={read} a={financePermissionsHelper[INITIAL_BALANCE]}>
                <ProFilterButton
                  onClick={() => setTab(INITIAL_BALANCE)}
                  active={tab === INITIAL_BALANCE}
                >
                  İlkin qalıq
                </ProFilterButton>
              </Can>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Tabs;
