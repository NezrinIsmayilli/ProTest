import React, { useState, useEffect } from 'react';
import { Collapse } from 'antd';
import styles from '../styles.module.scss';
import CashRow from '../cashRow';
import CollapseSecondary from '../collapseSecondary';

const { Panel } = Collapse;

export default function CashOut(props) {
  const { filteredList, sum } = props;
  const [collapse, setCollapse] = useState({});
  const [vat, setVat] = useState(0);

  const handleCollapse = e => {
    setCollapse(prevState => {
      return { ...prevState, [e]: prevState[e] !== true };
    });
  };

  useEffect(() => {
    if (filteredList && Object.values(filteredList).length > 0) {
      const taxAmount = Object.values(filteredList.cashOut.invoiceTypes).reduce(
        (initialValue, currentValue) =>
          initialValue + Number(currentValue.taxAmount),
        0
      );
      setVat(taxAmount);
    }
  }, [filteredList]);

  return (
    <Collapse
      onChange={() => {
        handleCollapse(1);
      }}
      expandIconPosition="right"
      className={styles.customCollapseCashOut}
    >
      <Panel
        showArrow={false}
        extra={
          <CollapseSecondary
            collapse={collapse[1]}
            value={sum?.cashOut?.sum + vat}
            {...props}
          />
        }
        header="Məxaric"
        key="1"
      >
        {filteredList.length !== 0 &&
          Object.keys(filteredList.cashOut.invoiceTypes).map((index, key) => {
            const item = filteredList.cashOut.invoiceTypes[index];
            return (
              <CashRow
                label={item.title}
                key={key}
                value={item.amount}
                {...props}
              />
            );
          })}
        {filteredList.length !== 0 &&
          Object.keys(filteredList.cashOut.transactionTypes).map(
            (index, key) => {
              const item = filteredList.cashOut.transactionTypes[index];
              return (
                <CashRow
                  label={item.title}
                  key={key}
                  value={item.amount}
                  {...props}
                />
              );
            }
          )}
        {filteredList.length !== 0 &&
          Object.keys(filteredList.cashOut.credit).map((index, key) => {
            const item = filteredList.cashOut.credit[index];
            return (
              <CashRow
                label={item.title}
                key={key}
                value={item.amount}
                {...props}
              />
            );
          })}
        <CashRow label="ƏDV" key={15} value={vat} {...props} />
        {filteredList.length !== 0 &&
          Object.keys(filteredList.cashOut.paymentCatalogs).map(
            (index, key) => {
              const item = filteredList.cashOut.paymentCatalogs[index];
              return (
                <Collapse
                  onChange={() => {
                    handleCollapse(index);
                  }}
                  className={styles.childCollapseCashIn}
                  key={key}
                >
                  <Panel
                    showArrow={false}
                    extra={
                      <CollapseSecondary
                        collapse={collapse[index]}
                        value={sum?.cashOut?.paymentCatalogs[index]?.sum}
                        {...props}
                      />
                    }
                    header={item.name}
                    key="2"
                  >
                    {item.items.map((item, indx) => {
                      return (
                        <CashRow
                          key={indx}
                          label={item.name}
                          value={item.amount}
                          {...props}
                        />
                      );
                    })}
                  </Panel>
                </Collapse>
              );
            }
          )}
      </Panel>
    </Collapse>
  );
}
