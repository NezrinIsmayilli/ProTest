/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { fetchOperationsList } from 'store/actions/finance/operations';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import styles from './styles.module.scss';
import OpDetailTab from './operationDetails/opDetailTab';
import OpFinOpInvoiceTab from './operationDetails/opFinOpInvoiceTab';
import OpInvoiceContentTab from './operationDetails/opInvoiceContentTab';
import FinExpensesTab from './operationDetails/finExpensesTab';
import WritingOffInvoices from './operationDetails/writingOffInvoices';
import SalaryInvoices from './operationDetails/salaryInvoices';

function ConractDetail(props) {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    contracts,
    invoices,
    description,
    row,
    fetchOperationsList,
    fetchSalesInvoiceList,
    contract,
    profitContracts,
  } = props;

  const [contractInfo, setContractInfo] = useState([]);
  const [profitContractInfo, setProfitContractInfo] = useState([]);
  const [finExpenceData, setFinExpenceData] = useState([]);
  const [opFinExpenceData, setOpFinExpenceData] = useState([]);
  const [writeOffInvoice, setWriteOffInvoice] = useState([]);
  const [salaryOperations, setSalaryOperations] = useState([]);

  useEffect(() => {
    if (row.id) {
      fetchOperationsList({
        filters: { contracts: [row.id], transactionTypes: [8] },
        onSuccessCallback: ({ data }) => {
          setFinExpenceData(data);
        },
        label: 'financeOperationsForFin',
      });
      fetchOperationsList({
        filters: { contracts: [row.id], vat: 0, transactionTypes: [9] },
        onSuccessCallback: ({ data }) => {
          setOpFinExpenceData(data);
        },
      });
      fetchOperationsList({
        filters: { contracts: [row.id], transactionTypes: [6] },
        onSuccessCallback: ({ data }) => {
          setSalaryOperations(data);
        },
        label: 'financeOperationsForSalary',
      });
      fetchSalesInvoiceList({
        filters: {
          contracts: [row.id],
          invoiceTypes: [6],
          isDeleted: 0,
          limit: 1000,
        },
        onSuccess: res => {
          setWriteOffInvoice(res.data);
        },
      });
      if (contracts) {
        setContractInfo(...contracts.filter(({ id }) => id === row.id));
      }
    }
  }, [contracts, row]);
  useEffect(() => {
    if (contract) {
      fetchSalesInvoiceList({
        filters: {
          contracts: [row.id],
          isDeleted: 0,
          invoiceTypes: contract?.direction === 1 ? [1, 4] : [2, 3],
        },
      });
    }
  }, [contract]);
  useEffect(() => {
    if (profitContracts) {
      setProfitContractInfo(
        ...profitContracts.filter(({ id }) => id === row.id)
      );
    }
  }, [profitContracts, row.id]);
  const handleChangeTab = value => setActiveTab(value);
  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <OpDetailTab
            description={description}
            isLoading={isLoading}
            details={contractInfo}
            contractId={row.id}
          />
        );
      case 1:
        return (
          <OpFinOpInvoiceTab
            contractName={contractInfo.contract_no}
            contractDirection={contractInfo.direction}
            currencyCode={contractInfo.currencycode}
            contractId={row.id}
            opFinExpenceData={opFinExpenceData}
            filteredList
          />
        );
      case 2:
        return (
          <OpInvoiceContentTab
            contractName={contractInfo.contract_no}
            currencyCode={contractInfo.currencycode}
            invoices={invoices}
          />
        );
      case 3:
        return (
          <FinExpensesTab
            contractName={contractInfo.contract_no}
            currencyCode={contractInfo.currencycode}
            contractDirection={contractInfo.direction}
            finExpenceData={finExpenceData}
            contract={contract}
            profitContractInfo={profitContractInfo}
          />
        );
      case 4:
        return (
          <WritingOffInvoices
            contract={contract}
            contractName={contractInfo.contract_no}
            currencyCode={contractInfo.currencycode}
            invoices={writeOffInvoice}
            profitContractInfo={profitContractInfo}
          />
        );
      case 5:
        return (
          <SalaryInvoices
            contract={contract}
            contractName={contractInfo.contract_no}
            currencyCode={contractInfo.currencycode}
            invoices={salaryOperations}
            profitContractInfo={profitContractInfo}
          />
        );
      default:
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div className={styles.detailsTab}>
        <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
        >
          Ətraflı
        </Button>
        <Button
          size="large"
          type={activeTab === 1 ? 'primary' : ''}
          onClick={() => handleChangeTab(1)}
        >
          Maliyyə əməliyyatları ({opFinExpenceData.length})
        </Button>
        <Button
          style={{ borderRadius: '0' }}
          size="large"
          type={activeTab === 2 ? 'primary' : ''}
          onClick={() => handleChangeTab(2)}
        >
          Qaimələr ({invoices.length})
        </Button>
        <Button
          style={
            contract?.direction === 2
              ? { borderRadius: 0 }
              : { borderRadius: '0 4px 4px 0' }
          }
          size="large"
          type={activeTab === 3 ? 'primary' : ''}
          onClick={() => handleChangeTab(3)}
        >
          Xərclər ({finExpenceData.length})
        </Button>
        {row?.direction === 2 ? (
          <Button
            style={{ borderRadius: 0 }}
            size="large"
            type={activeTab === 4 ? 'primary' : ''}
            onClick={() => handleChangeTab(4)}
          >
            Silinmiş mallar ({writeOffInvoice.length})
          </Button>
        ) : null}
        {row?.direction === 2 ? (
          <Button
            style={{ borderRadius: '0 4px 4px 0' }}
            size="large"
            type={activeTab === 5 ? 'primary' : ''}
            onClick={() => handleChangeTab(5)}
          >
            Əməkhaqqı ödənişləri({salaryOperations.length})
          </Button>
        ) : null}
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  contracts: state.contractsReducer.contracts,
  invoices: state.salesAndBuysReducer.invoices,
});

export default connect(
  mapStateToProps,
  { fetchOperationsList, fetchSalesInvoiceList }
)(ConractDetail);
