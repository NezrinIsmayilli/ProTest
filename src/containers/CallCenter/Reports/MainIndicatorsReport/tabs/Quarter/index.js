import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can, ProModal } from 'components/Lib';

import {
  fetchProfitByMonth,
  fetchCalls,
  fetchCallsInternal,
} from 'store/actions/calls/reports';

import { useFilterHandle } from 'hooks';
import { months } from 'utils';
import CallTabs from 'containers/CallCenter/Reports/Tabs';
import Table from './Table';
import Sidebar from './Sidebar';
import DetailsModal from './DetailsModal';
import DetailsModalInternalCalls from './DetailsModalInternalCalls';

const ExportJsonExcel = require('js-export-excel');

const Quarter = props => {
  const {
    fetchProfitByMonth,
    mainIndicatorsData,
    fetchCalls,
    fetchCallsInternal,
    calls,
    internalCalls,
  } = props;

  const [tableData, setTableData] = useState([]);
  const [modalVisible_1, setModaIVisible_1] = useState(false);
  const [modalVisible, setModaIVisible] = useState(false);
  const [modalTitle_1, setModalTitle_1] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalName, setModalName] = useState('');
  const [monthState, setMonth] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const getDateFrom = month => `01-${month}-${filters.years.getFullYear()}`;
  const getDateTo = month =>
    [1, 3, 5, 7, 8, 10, 12].includes(Number(month))
      ? `31-${month}-${filters.years.getFullYear()}`
      : Number(month) === 2
      ? `28-${month}-${filters.years.getFullYear()}`
      : `30-${month}-${filters.years.getFullYear()}`;

  const [filters, onFilter] = useFilterHandle(
    {
      years: new Date(),
      groupByPeriod: 'quarter',
    },
    ({ filters }) => {
      fetchProfitByMonth({
        filters: { ...filters, years: [filters.years.getFullYear()] },
      });
    }
  );

  const getTranslate = status => {
    switch (status) {
      case 'sl8060':
        return 'Xidmət səviyyəsi 80/60, %';
      case 'sl8030':
        return 'Xidmət səviyyəsi 80/30, %';
      case 'answeredCallsIn60':
        return '60 saniyə içərisində cavablandırılmış zənglər';
      case 'answeredCallsIn30':
        return '30 saniyə içərisində cavablandırılmış zənglər';
      case 'missedCallsRate':
        return 'Buraxılmış zəng dərəcəsi, %';
      case 'answeredCallsRate':
        return 'Cavablandırılmış zəng dərəcəsi, %';
      case 'incomingCalls':
        return 'Daxil olan zənglər';
      case 'answeredCalls':
        return 'Cavablandırılmış zənglər';
      case 'missedCalls':
        return 'Buraxılmış zənglər';
      case 'lostCalls':
        return 'İtirilmiş zənglər';
      case 'calledBackCalls':
        return 'Geri yığılmış zənglər';
      case 'handledCalls':
        return 'Cəmi emal olunan zənglər';
      case 'missedCallsWaitTimeAvg':
        return 'Buraxılmış zənglərin ortalama müddəti';
      case 'missedCallsWaitTimeMax':
        return 'Buraxılmış zənglərin maksimal müddəti';
      case 'speedOfAnswerAvg':
        return 'Ortalama cavab vermə müddəti';
      case 'handleTimeAvg':
        return 'Ortalama emal müddəti';
      case 'handleTimeMax':
        return 'Maksimal emal müddəti';
      case 'handleTimeTotal':
        return 'Cəmi emal müddəti';
      case 'ringTimeTotal':
        return 'Zəng müddəti';
      case 'acwTimeTotal':
        return 'ACW müddəti';
      case 'talkTimeTotal':
        return 'Danışıq müddəti';
      case 'holdTimeTotal':
        return 'Xəttdə saxlama müddəti';
      case 'holdCount':
        return 'Xəttdə saxlama sayı';
      case 'auxTimeTotal':
        return 'AUX';
      case 'readyTimeTotal':
        return 'Boş qalma müddəti';
      case 'activityTimeTotal':
        return 'Aktivlik müddəti';
      case 'occupationRate':
        return 'Məşğulluq faizi';
      case 'utilizationRate':
        return ' İstifadə faizi';
      case 'uniqueCustomers':
        return 'Unikal müştəri sayı';
      case 'uniqueCustomersLost':
        return 'Unikal müştəri sayı (itirilmiş)';
      case 'uniqueCustomersAnswered':
        return 'Unikal müştəri sayı (cavablandırılmış)';
      default:
        break;
    }
  };

  useEffect(() => {
    if (Object.keys(mainIndicatorsData).length > 0) {
      const data = [];

      Object.keys(mainIndicatorsData).map((item, index) => {
        const total = [
          Number(mainIndicatorsData[item][1]) || 0,
          Number(mainIndicatorsData[item][2]) || 0,
          Number(mainIndicatorsData[item][3]) || 0,
          Number(mainIndicatorsData[item][4]) || 0,
        ].reduce((sum, a) => sum + a, 0);
        const average =
          total / Object.keys(mainIndicatorsData.activityTimeTotal).length;

        data[index] = [
          getTranslate(item),
          mainIndicatorsData[item][1],
          mainIndicatorsData[item][2],
          mainIndicatorsData[item][3],
          mainIndicatorsData[item][4],
          total,
          average,
        ];
      });
      setTableData(data);
    }
  }, [mainIndicatorsData]);

  const getTime = value => {
    let hours = Math.floor(value / 3600);
    value %= 3600;
    let minutes = Math.floor(value / 60);
    let seconds = Math.floor(value % 60);
    minutes = String(minutes).padStart(2, '0');
    hours = String(hours).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  // Excel Export data
  function exportExcelAll() {
    const option = {};
    const dataTable = Object.keys(tableData).map((item, index) => {
      if (
        tableData[item][0] === 'Buraxılmış zənglərin maksimal müddəti' ||
        tableData[item][0] === 'Buraxılmış zənglərin ortalama müddəti' ||
        tableData[item][0] === 'Ortalama cavab vermə müddəti' ||
        tableData[item][0] === 'Ortalama emal müddəti' ||
        tableData[item][0] === 'Maksimal emal müddəti' ||
        tableData[item][0] === 'Cəmi emal müddəti' ||
        tableData[item][0] === 'Zəng müddəti' ||
        tableData[item][0] === 'ACW müddəti' ||
        tableData[item][0] === 'Danışıq müddəti' ||
        tableData[item][0] === 'Xəttdə saxlama müddəti' ||
        tableData[item][0] === 'AUX' ||
        tableData[item][0] === 'Boş qalma müddəti' ||
        tableData[item][0] === 'Aktivlik müddəti'
      ) {
        return {
          Nömrə: tableData[item][0],
          RÜB_I: getTime(tableData[item][1]),
          RÜB_II: getTime(tableData[item][2]),
          RÜB_III: getTime(tableData[item][3]),
          RÜB_IV: getTime(tableData[item][4]),
          Toplam: getTime(tableData[item][5]),
          Ortalama: getTime(tableData[item][6]),
        };
      }
      return {
        Nömrə: tableData[item][0],
        RÜB_I: tableData[item][1],
        RÜB_II: tableData[item][2],
        RÜB_III: tableData[item][3],
        RÜB_IV: tableData[item][4],
        Toplam: tableData[item][5],
        Ortalama: tableData[item][6],
      };
    });

    option.fileName = 'Əsas göstəricilər / Rüblər üzrə';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Nömrə',
          'RÜB_I',
          'RÜB_II',
          'RÜB_II',
          'RÜB_IV',
          'Toplam',
          'Ortalama',
        ],
        sheetHeader: [
          'Əsas çağrı mərkəzi göstəriciləri',
          'RÜB I',
          'RÜB II',
          'RÜB III',
          'RÜB IV',
          'Toplam',
          'Ortalama',
        ],
        columnWidths: [25, 5, 10, 10, 10, 10, 10],
      },
    ];

    const toExcel = new ExportJsonExcel(option);

    toExcel.saveExcel();
  }

  // 1. UNICAL CALL DETAILS FILTER------
  const toggleModal = () => {
    setModaIVisible(prevValue => !prevValue);
  };
  const getCallsUnical = (label, name, month) => {
    setModalTitle(`${name || '-'} / ${label}`);
    setModalName(name);
    setMonth(month);
    // eslint-disable-next-line no-unused-expressions
    name === 'Unikal müştəri sayı'
      ? fetchCalls({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
          },
        })
      : name === 'Unikal müştəri sayı (itirilmiş)'
      ? fetchCalls({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
            statuses: [1],
          },
        })
      : fetchCalls({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
            statuses: [2],
            callbackStatuses: [1],
          },
        });

    toggleModal();
  };

  const handleDetailClick = (row, selectedMonth) => {
    const month = months.find(({ id }) => id === Number(selectedMonth));
    const { label } = month;
    if (
      row[0] === 'Unikal müştəri sayı' ||
      row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
      row[0] === 'Unikal müştəri sayı (cavablandırılmış)'
    ) {
      getCallsUnical(label, row[0], selectedMonth);
    } else {
      getCallsTable_1(label, row[0], selectedMonth);
    }
  };

  // 2. 60 30 second CALL FILTER-------------

  const toggleModalTable_1 = () => {
    setModaIVisible_1(prevValue => !prevValue);
  };
  const getCallsTable_1 = (label, name, month) => {
    setModalTitle_1(`${name || '-'} / ${label}`);
    setModalName(name);
    setMonth(month);
    // eslint-disable-next-line no-unused-expressions
    name === '60 saniyə içərisində cavablandırılmış zənglər'
      ? fetchCallsInternal({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
            statuses: [1],
            queueTimeFrom: 0,
            queueTimeTo: 60,
          },
        })
      : name === '30 saniyə içərisində cavablandırılmış zənglər'
      ? fetchCallsInternal({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
            statuses: [1],
            queueTimeFrom: 0,
            queueTimeTo: 30,
          },
        })
      : name === 'Cavablandırılmış zənglər'
      ? fetchCallsInternal({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
            statuses: [1],
          },
        })
      : name === 'Buraxılmış zənglər'
      ? fetchCallsInternal({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            directions: [1],
            isCallcenter: 1,
            statuses: [1],
          },
        })
      : name === 'İtirilmiş zənglər'
      ? fetchCallsInternal({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            callbackStatuses: [1],
            statuses: [2],
          },
        })
      : fetchCallsInternal({
          filters: {
            limit: 8,
            page: 1,
            dateFrom: getDateFrom(month),
            dateFromTo: getDateTo(month),
            groupBy: 'contact',
            statuses: [2],
            callbackStatuses: [2, 3],
          },
        });
    toggleModalTable_1();
  };

  return (
    <>
      <ProModal
        maskClosable
        width={1300}
        centered
        padding
        isVisible={modalVisible}
        handleModal={toggleModal}
      >
        <DetailsModal
          title={modalTitle}
          calls={calls}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filters={filters}
          onFilter={onFilter}
          modalName={modalName}
          monthState={monthState}
        />
      </ProModal>
      <ProModal
        maskClosable
        width={1400}
        centered
        padding
        isVisible={modalVisible_1}
        handleModal={toggleModalTable_1}
      >
        <DetailsModalInternalCalls
          title={modalTitle_1}
          calls={internalCalls}
          filters={filters}
          onFilter={onFilter}
          modalName={modalName}
          monthState={monthState}
        />
      </ProModal>
      <Sidebar filters={filters} onFilter={onFilter} />

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
        <CallTabs>
          <Can I={accessTypes.manage} a={permissions.main_indicators}>
            <ExcelButton onClick={exportExcelAll} />
          </Can>
        </CallTabs>
        <Table
          mainIndicatorsData={mainIndicatorsData}
          getTranslate={getTranslate}
          getTime={getTime}
          tableData={tableData}
          filters={filters}
          handleDetailClick={handleDetailClick}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  mainIndicatorsData: state.callReportsReducer.mainIndicatorsData,
  calls: state.callReportsReducer.calls,
  internalCalls: state.callReportsReducer.internalCalls,
});

export const Quarters = connect(
  mapStateToProps,
  {
    fetchProfitByMonth,
    fetchCalls,
    fetchCallsInternal,
  }
)(Quarter);
