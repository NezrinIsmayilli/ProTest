/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  fetchProfitByMonth,
  fetchProfitAndLossInvoices,
  fetchProfitAndLossExpenses,
  clearProfitAndLoss,
  clearExpenses,
  fetchProfitAndLossSalary,
} from 'store/actions/reports/profit-and-loss';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
  InvoicesWithPaymentStatus,
  Expenses,
  WritingOffInvoices,
  ProModal,
} from 'components/Lib';
import { Row, Col} from 'antd';
import ExportToExcel from 'components/Lib/ExportToExcel';
import {
  defaultNumberFormat,
  months as defaultMonths,
  profitAndLossSummaryRows,
} from 'utils';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { SalaryExpenses } from 'components/Lib/Modals/Expenses/salaryExpenses';
import { months } from 'utils';
import { currentMonth } from 'utils/constants';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';
import { fetchAllProfitByMonth } from 'store/actions/export-to-excel/reportsModule';

const MonthProfit = props => {
  const {
    invoicesLoading,
    expensesLoading,
    fetchProfitByMonth,
    fetchAllProfitByMonth,
    clearProfitAndLoss,
    clearExpenses,
    tenant,
    profitAndLossReport,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchMainCurrency,
    salesInvoices,
    expenses,
    mainCurrency,
    salaryLoading,
    fetchProfitAndLossSalary,
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
  const [excelData, setExcelData] = useState([]);
  const [exProfitLossByMonth, setExProfitLossByMonth] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const Months = profitAndLossReport[0]?.data||{};
  const columnClone = ['name',... Object.keys(Months),'total','average'];

  const [filters, onFilter] = useFilterHandle(
    {
      years: new Date(),
      months: [currentMonth],
      groupByPeriod: 'month',
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchProfitByMonth({
        filters: { ...filters, years: [filters.years.getFullYear()] },
      });
    }
  );
  const getDateFrom = month => `01-${month}-${filters.years.getFullYear()}`;
  const getDateTo = month =>
    [1, 3, 5, 7, 8, 10, 12].includes(Number(month))
      ? `31-${month}-${filters.years.getFullYear()}`
      : Number(month) === 2
      ? `28-${month}-${filters.years.getFullYear()}`
      : `30-${month}-${filters.years.getFullYear()}`;

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
  const getSalesInvoices = (label, month) => {
    setModalTitle(`Satışdan gəlir / ${label}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(month),
        dateTo: getDateTo(month),
        isDeleted: 0,
        invoiceTypes: [2],
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleInvoiceModal();
  };

  const getReturnedInvoices = (label, month) => {
    setModalTitle(`Geri alınmış mallar / ${label}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(month),
        dateTo: getDateTo(month),
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
  const getWritingOffInvoices = (label, month) => {
    setModalTitle(`Silinmiş mallar / ${label}`);
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(month),
        dateTo: getDateTo(month),
        invoiceTypes: [6],
        attachedInvoice: 0,
        isDeleted: 0,
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleWritingOffModal();
  };

  const getOfficialExpenses = (label, month) => {
    setModalTitle(`İnzibati xərclər / ${label}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(month),
        dateOfTransactionEnd: getDateTo(month),
        transactionCatalogTypes: [1],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };

  const getInvoiceExpenses = (label, month) => {
    setModalTitle(`Əməliyyat xərcləri / ${label}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(month),
        dateOfTransactionEnd: getDateTo(month),
        transactionCatalogTypes: [2],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getFinanceExpenses = (label, month) => {
    setModalTitle(`Maliyyə xərcləri / ${label}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(month),
        dateOfTransactionEnd: getDateTo(month),
        transactionCatalogTypes: [3],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getVatExpenses = (label, month) => {
    setModalTitle(`Mənfəətdən vergilər xərci / ${label}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(month),
        dateOfTransactionEnd: getDateTo(month),
        transactionCatalogTypes: [4],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getOtherExpenses = (label, month) => {
    setModalTitle(`Digər xərclər / ${label}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(month),
        dateOfTransactionEnd: getDateTo(month),
        transactionCatalogTypes: [5],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getSalaryExpenses = (label, month) => {
    setModalTitle(`Əməkhaqqı fondu / ${label}`);

    const columns = [];
    fetchProfitAndLossSalary({
      year: filters?.years.getFullYear(),
      onSuccessCallback: ({ data }) => {
        Object.entries(data).map(([key, value]) => {
          if (key === month) {
            value.map(val => {
              columns.push(val);
            });
          }
        });
        setSalary(columns);
      },
    });

    toggleSalaryModal();
  };
  const handleDetailClick = (row, selectedMonth) => {
    const month = months.find(({ id }) => id === Number(selectedMonth));
    const { label } = month;
    const { key } = row;
    if (key === 0) {
      getSalesInvoices(label, selectedMonth);
    } else if (key === 3) {
      getOfficialExpenses(label, selectedMonth);
    } else if (key === 4) {
      getInvoiceExpenses(label, selectedMonth);
    } else if (key === 5) {
      getOtherExpenses(label, selectedMonth);
    } else if (key === 7) {
      getFinanceExpenses(label, selectedMonth);
    } else if (key === 9) {
      getVatExpenses(label, selectedMonth);
    } else if (key === 11) {
      getReturnFromCustomerInvoices(label, selectedMonth);
    } else if (key === 14) {
      getWritingOffInvoices(label, selectedMonth);
    } else if (key === 15) {
      getSalaryExpenses(label, selectedMonth);
    } else if (key === 16) {
      getReturnedInvoices(label, selectedMonth);
    }
  };
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
    if (salaryModalIsVisible === false) clearExpenses();
  }, [expenseModalIsVisible, salaryModalIsVisible]);

  const getExcelColumns = (Months) => {
    let columns = [];
    const handleMonth=(Months={})=>{
      return  Object.keys(Months)?.map(month => {
        const { label } = defaultMonths.find(({ id }) => id === Number(month));
       return columns[columnClone.indexOf(month)] = {
          title: label,
          width: { wpx: 150 },
        };
      })
    }
    columns[columnClone.indexOf('name')] = {
      title: 'Gəlir və xərc müddəaları',
      width: { wpx: 280 },
    };

    handleMonth(Months);

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
  const getExcelData = (Months) => {
    const columnFooterStyle = {
      font: { color: { rgb: '646464' }, bold: true },
      fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } },
  };
    const data = exProfitLossByMonth.map(item=>( {...item,Months})).map((item, index) => { 
  
      const columnFooterProfitstyle= (value) => {

    return  { font: { color:  profitAndLossSummaryRows.includes(item.key)
          ? Number(value) > 0
            ?{ rgb: '008000' }:{rgb:'FF0000'}:{}, bold: true },
        fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } }
    };}
      let arr = [];
      const handleMonth=(Months={})=>{
       return Object.keys(Months)?.forEach(month => {
        return  columnClone.includes(month) && (arr[columnClone.indexOf(month)] = { value:Number(defaultNumberFormat(item[month])),
           style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item[month]):'' })
          })
      }
      
      columnClone.includes('name') && (arr[columnClone.indexOf('name')] ={ value: `${item.name} ${mainCurrency?.code}` || '-',
      style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterStyle:'' });
      handleMonth(item.Months);
      columnClone.includes('total') && (arr[columnClone.indexOf('total')] = { value:Number(defaultNumberFormat(item.total||0)),
        style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item.total):''  });
      columnClone.includes('average') && (arr[columnClone.indexOf('average')] = { value:Number(defaultNumberFormat(item.average||0)),
        style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item.average):''  });
    
      return arr;
     
    })
    setExcelData(data);
  }
  
  
  useEffect(() => {
    getExcelColumns(Months);
  }, [profitAndLossReport]);
  
  useEffect(() => {
    getExcelData(Months)
  }, [exProfitLossByMonth]); 
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
          dataLoading={expensesLoading}
          tenant={tenant}
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
          isMonth
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
                  () => fetchAllProfitByMonth(
                  {
                  filters: {...filters,years: [filters.years.getFullYear()] , limit: 5000, page:undefined}, onSuccessCallback: data => {
                    setExProfitLossByMonth(getProfitAndLossReports(data.data))
                      }
                  })
                  }
                  data={excelData}
                  columns={excelColumns}
                  excelTitle={`Mənfəət-Zərər-Aylar-üzrə (${filters.years.getFullYear()})`}
                  excelName="Mənfəət-Zərər-Aylar-üzrə"
                  filename="Mənfəət-Zərər-Aylar-üzrə"
                  count={profitAndLossReport?.length}
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
  profitAndLossReport: state.profitAndLoss.profitByMonth,
  invoicesLoading: state.loadings.fetchProfitAndLossInvoices,
  expenses: state.profitAndLoss.expenses,
  expensesLoading: state.loadings.fetchProfitAndLossExpenses,
  salaryLoading: state.loadings.fetchProfitAndLossSalary,
  mainCurrency: state.kassaReducer.mainCurrency,
  tenant: state.tenantReducer.tenant,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export const Month = connect(
  mapStateToProps,
  {
    clearProfitAndLoss,
    clearExpenses,
    fetchMainCurrency,
    fetchProfitByMonth,
    fetchAllProfitByMonth,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchProfitAndLossSalary,
    fetchBusinessUnitList,
  }
)(MonthProfit);
