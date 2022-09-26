/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  clearExpenses,
  clearProfitAndLoss,
  fetchProfitByQuarter,
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
import {
  formatNumberToLocale,
  defaultNumberFormat,
  quarters as defaultQuarters,
  profitAndLossReportsWithoutDetail,
  profitAndLossSummaryRows,
} from 'utils';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { SalaryExpenses } from 'components/Lib/Modals/Expenses/salaryExpenses';
import { Row, Col} from 'antd';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { quarters } from 'utils';
import Navigation from '../../Navigation';
import Table from './Table';
import Sidebar from './Sidebar';
import { fetchAllProfitByQuarter } from 'store/actions/export-to-excel/reportsModule';

const QuarterProfit = props => {
  const {
    invoicesLoading,
    expensesLoading,
    fetchProfitByQuarter,
    fetchAllProfitByQuarter,                                                                      
    profitAndLossReport,
    clearExpenses,
    tenant,
    clearProfitAndLoss,
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
  const [quarter, setQuarter] = useState();
  const [values, setValues] = useState(undefined);
  const [excelData, setExcelData] = useState([]);
  const [exProfitLossByQuarter, setExProfitLossByQuarter] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const Quarters = profitAndLossReport[0]?.data||{};
  const columnClone = ['name',... Object.keys(Quarters),'total','average'];
  const [filters, onFilter] = useFilterHandle(
    {
      years: new Date(),
      groupByPeriod: 'quarter',
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchProfitByQuarter({
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
  const getSalesInvoices = (label, months) => {
    setModalTitle(
      `Satışdan gəlir  / ${filters.years.getFullYear()} / ${label}`
    );
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(months[0]),
        dateTo: getDateTo(months[months.length - 1]),
        isDeleted: 0,
        invoiceTypes: [2],
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleInvoiceModal();
  };

  const getReturnedInvoices = (label, months) => {
        setModalTitle(
            `Geri alınmış mallar / ${filters.years.getFullYear()} / ${label}`
        );
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(months[0]),
        dateTo: getDateTo(months[months.length - 1]),
        isDeleted: 0,
        invoiceTypes: [3],
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleInvoiceModal();
  };

  const getReturnFromCustomerInvoices = (label, month) => {
    setModalTitle(
      `Geri qaytarılan mallar / ${filters.years.getFullYear()} / ${label}`
    );
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

  const getWritingOffInvoices = (label, months) => {
    setModalTitle(
      `Silinmiş mallar / ${filters.years.getFullYear()} / ${label}`
    );
    fetchProfitAndLossInvoices({
      filters: {
        dateFrom: getDateFrom(months[0]),
        dateTo: getDateTo(months[months.length - 1]),
        invoiceTypes: [6],
        attachedInvoice: 0,
        isDeleted: 0,
        limit: 1000,
        businessUnitIds: filters.businessUnitIds,
      },
    });
    toggleWritingOffModal();
  };

  const getOfficialExpenses = (label, months) => {
    setModalTitle(
      `İnzibati xərclər / ${filters.years.getFullYear()} / ${label}`
    );

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(months[0]),
        dateOfTransactionEnd: getDateTo(months[months.length - 1]),
        transactionCatalogTypes: [1],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };

  const getInvoiceExpenses = (label, months) => {
    setModalTitle(
      `Əməliyyat xərcləri / ${filters.years.getFullYear()} / ${label}`
    );

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(months[0]),
        dateOfTransactionEnd: getDateTo(months[months.length - 1]),
        transactionCatalogTypes: [2],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getFinanceExpenses = (label, months) => {
    setModalTitle(
      `Maliyyə xərcləri / ${filters.years.getFullYear()} / ${label}`
    );

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(months[0]),
        dateOfTransactionEnd: getDateTo(months[months.length - 1]),
        transactionCatalogTypes: [3],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getVatExpenses = (label, months) => {
    setModalTitle(
      `Mənfəətdən vergilər xərci / ${filters.years.getFullYear()} / ${label}`
    );

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(months[0]),
        dateOfTransactionEnd: getDateTo(months[months.length - 1]),
        transactionCatalogTypes: [4],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getOtherExpenses = (label, months) => {
    setModalTitle(`Digər xərclər / ${filters.years.getFullYear()} / ${label}`);

    fetchProfitAndLossExpenses({
      filters: {
        dateOfTransactionStart: getDateFrom(months[0]),
        dateOfTransactionEnd: getDateTo(months[months.length - 1]),
        transactionCatalogTypes: [5],
        attachedInvoice: 0,
        limit: 10000,
        businessUnitIds: filters.businessUnitIds,
      },
    });

    toggleExpenseModal();
  };
  const getSalaryExpenses = (label, months) => {
    setModalTitle(
      `Əməkhaqqı fondu / ${filters.years.getFullYear()} / ${label}`
    );
    setQuarter(months);
    const columns = [];
    fetchProfitAndLossSalary({
      year: filters?.years,
      onSuccessCallback: ({ data }) => {
        Object.entries(data).map(([key, value]) => {
          if (key == months[0] || key == months[1] || key == months[2]) {
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

  const handleDetailClick = (row, selectedQuarter) => {
    const quarter = quarters.find(({ id }) => id === Number(selectedQuarter));
    const { label, months } = quarter;
    const { key } = row;
    if (key === 0) {
      getSalesInvoices(label, months);
    } else if (key === 3) {
      getOfficialExpenses(label, months);
    } else if (key === 4) {
      getInvoiceExpenses(label, months);
    } else if (key === 5) {
      getOtherExpenses(label, months);
    } else if (key === 7) {
      getFinanceExpenses(label, months);
    } else if (key === 9) {
      getVatExpenses(label, months);
    } else if (key === 11) {
      getReturnFromCustomerInvoices(label, months);
    } else if (key === 14) {
      getWritingOffInvoices(label, months);
    } else if (key === 15) {
      getSalaryExpenses(label, months);
    } else if (key === 16) {
      getReturnedInvoices(label, months);
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

  const getExcelColumns = (Quarters) => {
    let columns = [];
    const handleQuarters=(Quarters={})=>{
      return  Object.keys(Quarters)?.map(month => {
        const { label } = defaultQuarters.find(({ id }) => id === Number(month));
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

    handleQuarters(Quarters);

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
  const getExcelData = (Quarters) => {
    const columnFooterStyle = {
      font: { color: { rgb: '646464' }, bold: true },
      fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } },
  };
    const data = exProfitLossByQuarter.map(item=>( {...item,Quarters})).map((item, index) => {  
      const columnFooterProfitstyle= (value) => {
        return  { font: { color:  profitAndLossSummaryRows.includes(item.key)
              ? Number(value) > 0
                ?{ rgb: '008000' }:{rgb:'FF0000'}:{}, bold: true },
            fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } }
        };
      } 
      let arr = [];
      const handleQuarters=(Quarters={})=>{
       return Object.keys(Quarters)?.forEach(month => {
        return  columnClone.includes(month) && (arr[columnClone.indexOf(month)] = { value:Number(defaultNumberFormat(item[month])),
          style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item[month]):'' })
          })
      }
      
      columnClone.includes('name') && (arr[columnClone.indexOf('name')] ={ value: `${item.name} ${mainCurrency?.code}` || '-', 
       style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterStyle:''  });
      handleQuarters(item.Quarters);
      columnClone.includes('total') && (arr[columnClone.indexOf('total')] = { value:Number(defaultNumberFormat(item.total||0)),
        style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item.total):''  });
      columnClone.includes('average') && (arr[columnClone.indexOf('average')] = { value:Number(defaultNumberFormat(item.average||0)),
        style:(item.name=="Dəqiqləşdirişmiş xalis mənfəət (zərər)"||item.name=="Xalis mənfəət (zərər)")?columnFooterProfitstyle(item.average):''  });
    
      return arr;
     
    })
    setExcelData(data);
  }
  
  
  useEffect(() => {
    getExcelColumns(Quarters);
  }, [profitAndLossReport]);
  
  useEffect(() => {
    getExcelData(Quarters)
  }, [exProfitLossByQuarter]); 

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
        style={{ marginTop: '100px' }}
        width={1300}
        centered
        padding
        isVisible={salaryModalIsVisible}
        handleModal={toggleSalaryModal}
      >
        <SalaryExpenses
          values={values}
          setValues={setValues}
          data={salary}
          quarter={quarter}
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
          () => fetchAllProfitByQuarter(
          {
          filters: {...filters,years: [filters.years.getFullYear()] , limit: 5000, page:undefined}, onSuccessCallback: data => {
            setExProfitLossByQuarter(getProfitAndLossReports(data.data))
              }
          })
          }
          data={excelData}
          columns={excelColumns}
          excelTitle={`Mənfəət-Zərər-Rüblər-üzrə (${filters.years.getFullYear()})`}
          excelName="Mənfəət-Zərər-Rüblər-üzrə"
          filename="Mənfəət-Zərər-Rüblər-üzrə"
          count={profitAndLossReport?.length}
          />
            </div>
        </Col>
          </Row>
        <Table handleDetailClick={handleDetailClick} getProfitAndLossReports={getProfitAndLossReports}/>
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  salesInvoices: state.profitAndLoss.invoices,
  invoicesLoading: state.loadings.fetchProfitAndLossInvoices,
  expenses: state.profitAndLoss.expenses,
  expensesLoading: state.loadings.fetchProfitAndLossExpenses,
  salaryLoading: state.loadings.fetchProfitAndLossSalary,
  mainCurrency: state.kassaReducer.mainCurrency,
  tenant: state.tenantReducer.tenant,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  profitAndLossReport: state.profitAndLoss.profitByQuarter,
});

export const Quarter = connect(
  mapStateToProps,
  {
    clearExpenses,
    clearProfitAndLoss,
    fetchMainCurrency,
    fetchProfitByQuarter,
    fetchAllProfitByQuarter,
    fetchProfitAndLossInvoices,
    fetchProfitAndLossExpenses,
    fetchProfitAndLossSalary,
    fetchBusinessUnitList,
  }
)(QuarterProfit);
