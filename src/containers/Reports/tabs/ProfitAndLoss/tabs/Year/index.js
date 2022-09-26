/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  clearExpenses,
  clearProfitAndLoss,
  fetchProfitByYear,
  fetchProfitAndLossInvoices,
  fetchProfitAndLossExpenses,
  fetchProfitAndLossSalary,
} from 'store/actions/reports/profit-and-loss';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
  InvoicesWithPaymentStatus,
  Expenses,
  WritingOffInvoices,
  ProModal,
} from 'components/Lib';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
  defaultNumberFormat,
  profitAndLossSummaryRows,
} from 'utils';
import { Row, Col} from 'antd';
import { SalaryExpenses } from 'components/Lib/Modals/Expenses/salaryExpenses';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';
import { fetchAllProfitByYear } from 'store/actions/export-to-excel/reportsModule';

const YearProfit = props => {
  const {
    invoicesLoading,
    expensesLoading,
    fetchProfitByYear,
    fetchAllProfitByYear,
    profitAndLossReport,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchMainCurrency,
    salesInvoices,
    expenses,
    mainCurrency,
    clearExpenses,
    tenant,
    clearProfitAndLoss,
    fetchProfitAndLossSalary,
    salaryLoading,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;
  const [modalTitle, setModalTitle] = useState('Satishdan hesabat');
  const [invoiceModalIsVisible, setInvoiceModalIsVisible] = useState(false);
  const [writingOffModalIsVisible, setWritingModalIsVisible] = useState(false);
  const [expenseModalIsVisible, setExpenseModalIsVisible] = useState(false);
  const [salaryModalIsVisible, setSalaryModalIsVisible] = useState(false);
  const [salary, setSalary] = useState();
  const [values, setValues] = useState(undefined);
  const [excelData, setExcelData] = useState([]);
  const [exProfitLossByYear, setExProfitLossByYear] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const Years = profitAndLossReport[0]?.data||{};
  const columnClone = ['name',... Object.keys(Years),'total','average'];
  const [filters, onFilter] = useFilterHandle(
    {
      years: [new Date()],
      groupByPeriod: 'year',
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchProfitByYear({
        filters: {
          ...filters,
          years: filters.years?.map(item => item.getFullYear()),
        },
      });
    }
  );

  const getDateFrom = year => `01-01-${year}`;
  const getDateTo = year => `31-12-${year}`;
  const toggleInvoiceModal = () => {
    setInvoiceModalIsVisible(prevValue => !prevValue);
  };
  const toggleWritingOffModal = () => {
    setWritingModalIsVisible(prevValue => !prevValue);
  };

  const toggleExpenseModal = () => {
    setExpenseModalIsVisible(prevValue => !prevValue);
  };
  const toggleSalaryModal = () => {
    setSalaryModalIsVisible(prevValue => !prevValue);
  };
  const getSalesInvoices = year => {
    setModalTitle(`Satışdan gəlir / ${year}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(year),
        dateTo: getDateTo(year),
        isDeleted: 0,
        invoiceTypes: [2],
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleInvoiceModal();
  };

  const getReturnedInvoices = year => {
    setModalTitle(`Geri alınmış mallar / ${year}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(year),
        dateTo: getDateTo(year),
        isDeleted: 0,
        invoiceTypes: [3],
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleInvoiceModal();
  };

  const getReturnFromCustomerInvoices = (label, month) => {
    setModalTitle(`Geri qaytarılan mallar / ${label}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(month),
        dateTo: getDateTo(month),
        isDeleted: 0,
        invoiceTypes: [3],
        limit: 1000,
      },
    });
    toggleInvoiceModal();
  };

  const getWritingOffInvoices = year => {
    setModalTitle(`Silinmiş mallar / ${year}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(year),
        dateTo: getDateTo(year),
        invoiceTypes: [6],
        attachedInvoice: 0,
        isDeleted: 0,
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleWritingOffModal();
  };

  const getOfficialExpenses = year => {
    setModalTitle(`İnzibati xərclər / ${year}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(year),
        dateOfTransactionEnd: getDateTo(year),
        transactionCatalogTypes: [1],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };

  const getInvoiceExpenses = year => {
    setModalTitle(`Əməliyyat xərcləri / ${year}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(year),
        dateOfTransactionEnd: getDateTo(year),
        transactionCatalogTypes: [2],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getFinanceExpenses = year => {
    setModalTitle(`Maliyyə xərcləri / ${year}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(year),
        dateOfTransactionEnd: getDateTo(year),
        transactionCatalogTypes: [3],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getVatExpenses = year => {
    setModalTitle(`Mənfəətdən vergilər xərci / ${year}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(year),
        dateOfTransactionEnd: getDateTo(year),
        transactionCatalogTypes: [4],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getOtherExpenses = year => {
    setModalTitle(`Digər xərclər / ${year}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(year),
        dateOfTransactionEnd: getDateTo(year),
        transactionCatalogTypes: [5],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getSalaryExpenses = year => {
    setModalTitle(`Əməkhaqqı fondu / ${year}`);
    const columns = [];
    fetchProfitAndLossSalary({
      year,
      onSuccessCallback: ({ data }) => {
        Object.entries(data).map(([key, value]) => {
          value.map(val => {
            columns.push(val);
          });
        });
        setSalary(columns);
      },
    });

    toggleSalaryModal();
  };
  const handleDetailClick = (row, selectedYear) => {
    const { key } = row;
    if (key === 0) {
      getSalesInvoices(selectedYear);
    } else if (key === 3) {
      getOfficialExpenses(selectedYear);
    } else if (key === 4) {
      getInvoiceExpenses(selectedYear);
    } else if (key === 5) {
      getOtherExpenses(selectedYear);
    } else if (key === 7) {
      getFinanceExpenses(selectedYear);
    } else if (key === 9) {
      getVatExpenses(selectedYear);
    } else if (key === 11) {
      getReturnFromCustomerInvoices(selectedYear);
    } else if (key === 14) {
      getWritingOffInvoices(selectedYear);
    } else if (key === 15) {
      getSalaryExpenses(selectedYear);
    } else if (key === 16) {
      getReturnedInvoices(selectedYear);
    }
  };
  useEffect(() => {
    fetchMainCurrency();
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
    return () => {
      clearProfitAndLoss();
    };
  }, []);
  useEffect(() => {
    if (expenseModalIsVisible === false) clearExpenses();
    if (salaryModalIsVisible === false) {
      clearExpenses();
      setValues(undefined);
    }
  }, [expenseModalIsVisible, salaryModalIsVisible]);

  
  const getProfitAndLossReports = data => {
    let profitAndLoss = [];

    if (data.length > 0) {
      profitAndLoss = data.map(({ average, key, name, total, data }) => ({
        name,
        key,
        total,
        average,
        ...data,
      }));
    }
    profitAndLoss.splice(12, 3); // hide rows
    return profitAndLoss;
  };

  const getExcelColumns = (Years) => {
    let columns = [];
    const handleMonth=(Years={})=>{
      return  Object.keys(Years)?.map(year => {
       return columns[columnClone.indexOf(year)] = {
          title: year,
          width: { wpx: 150 },
        };
      })
    }
    columns[columnClone.indexOf('name')] = {
      title: 'Gəlir və xərc müddəaları',
      width: { wpx: 280 },
    };

    handleMonth(Years);

    columns[columnClone.indexOf('total')] = {
      title: `Toplam`,
      width: { wpx: 200 },
    };
  
  
    columns[columnClone.indexOf('average')] = {
      title: 'Ortalama',
      width: { wpx: 120 },
    };
   
    setExcelColumns(columns)
  }
  const getExcelData = (Years) => {
    const columnFooterStyle = {
      font: { color: { rgb: '646464' }, bold: true },
      fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } },
  };
    const data = exProfitLossByYear.map(item=>( {...item,Years})).map((item, index) => { 
  
      const columnFooterProfitstyle= (value) => {

    return  { font: { color:  profitAndLossSummaryRows.includes(item.key)
          ? Number(value) > 0
            ?{ rgb: '008000' }:{rgb:'FF0000'}:{}, bold: true },
        fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } }
    };}
      let arr = [];
      const handleMonth=(Years={})=>{
       return Object.keys(Years)?.forEach(year => {
        return  columnClone.includes(year) && (arr[columnClone.indexOf(year)] = { value:Number(defaultNumberFormat(item[year])),
           style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item[year]):'' })
          })
      }
      
      columnClone.includes('name') && (arr[columnClone.indexOf('name')] ={ value: `${item.name} ${mainCurrency?.code}` || '-',
      style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterStyle:'' });
      handleMonth(item.Years);
      columnClone.includes('total') && (arr[columnClone.indexOf('total')] = { value:Number(defaultNumberFormat(item.total||0)),
        style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item.total):''  });
      columnClone.includes('average') && (arr[columnClone.indexOf('average')] = { value:Number(defaultNumberFormat(item.average||0)),
        style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item.average):''  });
    
      return arr;
     
    })
    setExcelData(data);
  }
  
  
  useEffect(() => {
    getExcelColumns(Years);
  }, [profitAndLossReport]);
  
  useEffect(() => {
    getExcelData(Years)
  }, [exProfitLossByYear]); 

  return (
    <>
      <Sidebar
        onFilter={onFilter}
        filters={filters}
        businessUnits={businessUnits}
        profile={profile}
      />

      <InvoicesWithPaymentStatus
        title={modalTitle}
        mainCurrency={mainCurrency}
        data={salesInvoices}
        dataLoading={invoicesLoading}
        toggleModal={toggleInvoiceModal}
        visible={invoiceModalIsVisible}
      />

      <WritingOffInvoices
        title={modalTitle}
        mainCurrency={mainCurrency}
        data={salesInvoices}
        dataLoading={invoicesLoading}
        toggleModal={toggleWritingOffModal}
        visible={writingOffModalIsVisible}
      />
      <ProModal
        maskClosable
        width={1300}
        centered
        padding
        isVisible={expenseModalIsVisible}
        handleModal={toggleExpenseModal}
      >
        <Expenses
          data={expenses}
          tenant={tenant}
          dataLoading={expensesLoading}
          mainCurrency={mainCurrency}
          title={modalTitle}
        />
      </ProModal>
      <ProModal
        maskClosable
        width={1300}
        style={{ marginTop: '100px' }}
        centered
        padding
        isVisible={salaryModalIsVisible}
        handleModal={toggleSalaryModal}
      >
        <SalaryExpenses
          values={values}
          setValues={setValues}
          isYear
          data={salary}
          tenant={tenant}
          dataLoading={salaryLoading}
          mainCurrency={mainCurrency}
          title={modalTitle}
        />
      </ProModal>
      <section
        id="container-area"
        className="aside scrollbar"
        style={{
          paddingBottom: 100,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 24,
          paddingRight: 32,
          paddingLeft: 32,
        }}
      >
         <Row style={{ margin: '15px 0 ' }}>
      <Col span={12}>
        <Navigation />
        </Col>
        <Col span={6} offset={6} align="end">
        <div 
               style={{
                   display: 'flex',
                   alignItems: 'flex-end',
                   justifyContent: 'flex-end',
               }}>
                
        <ExportToExcel

                  getExportData={
                  () => fetchAllProfitByYear(
                  {
                  filters: {...filters,years: filters.years?.map(item => item.getFullYear()), limit: 5000, page:undefined}, onSuccessCallback: data => {
                    setExProfitLossByYear(getProfitAndLossReports(data.data))
                      }
                  })
                  }
                  data={excelData}
                  columns={excelColumns}
                  excelTitle={`Mənfəət-Zərər-İllər-üzrə`}
                  excelName="Mənfəət-Zərər-İllər-üzrə"
                  filename="Mənfəət-Zərər-İllər-üzrə"
                  // count={profitAndLossReport?.length}
              />
        </div>
        </Col>
        </Row>
        <Table getProfitAndLossReports={getProfitAndLossReports} handleDetailClick={handleDetailClick} />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  salesInvoices: state.profitAndLoss.invoices,
  invoicesLoading: state.loadings.fetchProfitAndLossInvoices,
  expenses: state.profitAndLoss.expenses,
  profitAndLossSalary: state.profitAndLoss.profitAndLossSalary,
  expensesLoading: state.loadings.fetchProfitAndLossExpenses,
  salaryLoading: state.loadings.fetchProfitAndLossSalary,
  mainCurrency: state.kassaReducer.mainCurrency,
  tenant: state.tenantReducer.tenant,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  profitAndLossReport: state.profitAndLoss.profitByYear,
});

export const Year = connect(
  mapStateToProps,
  {
    clearExpenses,
    clearProfitAndLoss,
    fetchMainCurrency,
    fetchProfitByYear,
    fetchAllProfitByYear,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchProfitAndLossSalary,
    fetchBusinessUnitList,
  }
)(YearProfit);
