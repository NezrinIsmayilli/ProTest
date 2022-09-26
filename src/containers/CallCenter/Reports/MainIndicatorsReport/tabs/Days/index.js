/* eslint-disable react-hooks/exhaustive-deps */
import CallTabs from 'containers/CallCenter/Reports/Tabs';
import React, { useState, useEffect } from 'react';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can, ProModal } from 'components/Lib';

import {
  fetchProfitByMonth,
  fetchCalls,
  fetchCallsInternal,
} from 'store/actions/calls/reports';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';

import { currentMonth } from 'utils/constants';
import { months } from 'utils';
import Table from './Table';
import Sidebar from './Sidebar';
import DetailsModal from './DetailsModal';
import DetailsModalInternalCalls from './DetailsModalInternalCalls';

const ExportJsonExcel = require('js-export-excel');

const Day = props => {
  const {
    fetchProfitByMonth,
    mainIndicatorsData,
    fetchCalls,
    fetchCallsInternal,
    calls,
    internalCalls,
  } = props;

  const [modalVisible_1, setModaIVisible_1] = useState(false);
  const [modalVisible, setModaIVisible] = useState(false);
  const [modalTitle_1, setModalTitle_1] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalName, setModalName] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const getDateFrom = month =>
    `01-${filteredMonths}-${filters.years.getFullYear()}`;
  const getDateTo = month =>
    [1, 3, 5, 7, 8, 10, 12].includes(Number(filteredMonths))
      ? `31-${filteredMonths}-${filters.years.getFullYear()}`
      : Number(filteredMonths) === 2
      ? `28-${filteredMonths}-${filters.years.getFullYear()}`
      : `30-${filteredMonths}-${filters.years.getFullYear()}`;

  const [filters, onFilter] = useFilterHandle(
    {
      years: new Date(),
      months: [currentMonth],
      groupByPeriod: 'day',
    },
    ({ filters }) => {
      fetchProfitByMonth({
        filters: { ...filters, years: [filters.years.getFullYear()] },
      });
    }
  );
  const { months: filteredMonths } = filters;

  const [tableData, setTableData] = useState([]);

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
          Number(mainIndicatorsData[item][5]) || 0,
          Number(mainIndicatorsData[item][6]) || 0,
          Number(mainIndicatorsData[item][7]) || 0,
          Number(mainIndicatorsData[item][8]) || 0,
          Number(mainIndicatorsData[item][9]) || 0,
          Number(mainIndicatorsData[item][10]) || 0,
          Number(mainIndicatorsData[item][11]) || 0,
          Number(mainIndicatorsData[item][12]) || 0,
          Number(mainIndicatorsData[item][13]) || 0,
          Number(mainIndicatorsData[item][14]) || 0,
          Number(mainIndicatorsData[item][15]) || 0,
          Number(mainIndicatorsData[item][16]) || 0,
          Number(mainIndicatorsData[item][17]) || 0,
          Number(mainIndicatorsData[item][18]) || 0,
          Number(mainIndicatorsData[item][19]) || 0,
          Number(mainIndicatorsData[item][20]) || 0,
          Number(mainIndicatorsData[item][21]) || 0,
          Number(mainIndicatorsData[item][22]) || 0,
          Number(mainIndicatorsData[item][23]) || 0,
          Number(mainIndicatorsData[item][24]) || 0,
          Number(mainIndicatorsData[item][25]) || 0,
          Number(mainIndicatorsData[item][26]) || 0,
          Number(mainIndicatorsData[item][27]) || 0,
          Number(mainIndicatorsData[item][28]) || 0,
          Number(mainIndicatorsData[item][29]) || 0,
          Number(mainIndicatorsData[item][30]) || 0,
          Number(mainIndicatorsData[item][31]) || 0,
        ].reduce((sum, a) => sum + a, 0);
        const average =
          total / Object.keys(mainIndicatorsData.activityTimeTotal).length;

        data[index] = [
          getTranslate(item),
          mainIndicatorsData[item][1],
          mainIndicatorsData[item][2],
          mainIndicatorsData[item][3],
          mainIndicatorsData[item][4],
          mainIndicatorsData[item][5],
          mainIndicatorsData[item][6],
          mainIndicatorsData[item][7],
          mainIndicatorsData[item][8],
          mainIndicatorsData[item][9],
          mainIndicatorsData[item][10],
          mainIndicatorsData[item][11],
          mainIndicatorsData[item][12],
          mainIndicatorsData[item][13],
          mainIndicatorsData[item][14],
          mainIndicatorsData[item][15],
          mainIndicatorsData[item][16],
          mainIndicatorsData[item][17],
          mainIndicatorsData[item][18],
          mainIndicatorsData[item][19],
          mainIndicatorsData[item][20],
          mainIndicatorsData[item][21],
          mainIndicatorsData[item][22],
          mainIndicatorsData[item][23],
          mainIndicatorsData[item][24],
          mainIndicatorsData[item][25],
          mainIndicatorsData[item][26],
          mainIndicatorsData[item][27],
          mainIndicatorsData[item][28],
          mainIndicatorsData[item][29],
          mainIndicatorsData[item][30],
          mainIndicatorsData[item][31],
          total.toFixed(4),
          average.toFixed(4),
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
          1: getTime(tableData[item][1]),
          2: getTime(tableData[item][2]),
          3: getTime(tableData[item][3]),
          4: getTime(tableData[item][4]),
          5: getTime(tableData[item][5]),
          6: getTime(tableData[item][6]),
          7: getTime(tableData[item][7]),
          8: getTime(tableData[item][8]),
          9: getTime(tableData[item][9]),
          10: getTime(tableData[item][10]),
          11: getTime(tableData[item][11]),
          12: getTime(tableData[item][12]),
          13: getTime(tableData[item][13]),
          14: getTime(tableData[item][14]),
          15: getTime(tableData[item][15]),
          16: getTime(tableData[item][16]),
          17: getTime(tableData[item][17]),
          18: getTime(tableData[item][18]),
          19: getTime(tableData[item][19]),
          20: getTime(tableData[item][20]),
          21: getTime(tableData[item][21]),
          22: getTime(tableData[item][22]),
          23: getTime(tableData[item][23]),
          24: getTime(tableData[item][24]),
          25: getTime(tableData[item][25]),
          26: getTime(tableData[item][26]),
          27: getTime(tableData[item][27]),
          28: getTime(tableData[item][28]),
          29:
            tableData[0]?.[29] !== undefined
              ? getTime(tableData[item][29])
              : null,
          30:
            tableData[0]?.[30] !== undefined
              ? getTime(tableData[item][30])
              : null,
          31:
            tableData[0]?.[31] !== undefined
              ? getTime(tableData[item][31])
              : null,
          Toplam: getTime(tableData[item][32]),
          Ortalama: getTime(tableData[item][33]),
        };
      }
      return {
        Nömrə: tableData[item][0],
        1: tableData[item][1],
        2: tableData[item][2],
        3: tableData[item][3],
        4: tableData[item][4],
        5: tableData[item][5],
        6: tableData[item][6],
        7: tableData[item][7],
        8: tableData[item][8],
        9: tableData[item][9],
        10: tableData[item][10],
        11: tableData[item][11],
        12: tableData[item][12],
        13: tableData[item][13],
        14: tableData[item][14],
        15: tableData[item][15],
        16: tableData[item][16],
        17: tableData[item][17],
        18: tableData[item][18],
        19: tableData[item][19],
        20: tableData[item][20],
        21: tableData[item][21],
        22: tableData[item][22],
        23: tableData[item][23],
        24: tableData[item][24],
        25: tableData[item][25],
        26: tableData[item][26],
        27: tableData[item][27],
        28: tableData[item][28],
        29: tableData[item][29] || null,
        30: tableData[item][30] || null,
        31: tableData[item][31] || null,
        Toplam: tableData[item][32],
        Ortalama: tableData[item][33],
      };
    });

    option.fileName = 'Əsas göstəricilər / Günlər üzrə';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Nömrə',
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          tableData[0]?.[29] !== undefined ? 29 : null,
          tableData[0]?.[30] !== undefined ? 30 : null,
          tableData[0]?.[31] !== undefined ? 31 : null,
          'Toplam',
          'Ortalama',
        ],
        sheetHeader: [
          'Əsas çağrı mərkəzi göstəriciləri',
          `1 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `2 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `3 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `4 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `5 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `6 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `7 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `8 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `9 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `10 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `11 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `12 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `13 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `14 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `15 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `16 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `17 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `18 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `19 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `20 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `21 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `22 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `23 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `24 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `25 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `26 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `27 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          `28 / ${filteredMonths < 10 ? 0 + filteredMonths : filteredMonths}`,
          tableData[0]?.[29] !== undefined
            ? `29 / ${
                filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
              }`
            : null,
          tableData[0]?.[30] !== undefined
            ? `30 / ${
                filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
              }`
            : null,
          tableData[0]?.[31] !== undefined
            ? `31 / ${
                filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
              }`
            : null,
          'Toplam',
          'Ortalama',
        ],
        columnWidths: [25],
      },
    ];

    const toExcel = new ExportJsonExcel(option);

    toExcel.saveExcel();
  }

  // 1. UNICAL CALL DETAILS FILTER------
  const toggleModal = () => {
    setModaIVisible(prevValue => !prevValue);
  };
  const getCallsUnical = (name, month) => {
    setModalTitle(
      `${name || '-'} / ${
        filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
      }`
    );
    setModalName(name);
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
    if (
      row[0] === 'Unikal müştəri sayı' ||
      row[0] === 'Unikal müştəri sayı (itirilmiş)' ||
      row[0] === 'Unikal müştəri sayı (cavablandırılmış)'
    ) {
      getCallsUnical(row[0], selectedMonth);
    } else {
      getCallsTable_1(row[0], selectedMonth);
    }
  };

  // 2. 60 30 second CALL FILTER-------------

  const toggleModalTable_1 = () => {
    setModaIVisible_1(prevValue => !prevValue);
  };
  const getCallsTable_1 = (name, month) => {
    setModalTitle_1(
      `${name || '-'} / ${
        filteredMonths < 10 ? 0 + filteredMonths : filteredMonths
      }`
    );
    setModalName(name);
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
          filters={filters}
          tableData={tableData}
          getTime={getTime}
          getTranslate={getTranslate}
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

export const Days = connect(
  mapStateToProps,
  {
    fetchProfitByMonth,
    fetchCalls,
    fetchCallsInternal,
  }
)(Day);
