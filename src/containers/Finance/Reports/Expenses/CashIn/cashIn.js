import React, { useState, useEffect } from 'react';
import { Collapse } from 'antd';
import styles from '../styles.module.scss';
import CashRow from '../cashRow';
import CollapseSecondary from '../collapseSecondary';

const { Panel } = Collapse;

export default function CashIn(props) {
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
      const taxAmount = Object.values(filteredList.cashIn.invoiceTypes).reduce(
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
      className={styles.customCollapseCashIn}
    >
      <Panel
        showArrow={false}
        extra={
          <CollapseSecondary
            collapse={collapse[1]}
            value={sum?.cashIn?.sum + vat}
            {...props}
          />
        }
        header="Mədaxil"
        key="1"
      >
        {filteredList.length !== 0 &&
          Object.keys(filteredList.cashIn.invoiceTypes).map((index, key) => {
            const item = filteredList.cashIn.invoiceTypes[index];
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
          Object.keys(filteredList.cashIn.transactionTypes).map(
            (index, key) => {
              const item = filteredList.cashIn.transactionTypes[index];
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
          Object.keys(filteredList.cashIn.credit).map((index, key) => {
            const item = filteredList.cashIn.credit[index];
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
          Object.keys(filteredList.cashIn.paymentCatalogs).map((index, key) => {
            const item = filteredList.cashIn.paymentCatalogs[index];

            return (
              <Collapse
                accordion
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
                      value={sum?.cashIn?.paymentCatalogs[index]?.sum}
                      {...props}
                    />
                  }
                  header={item.name}
                  key={index}
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
          })}
      </Panel>
    </Collapse>
  );
}
