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

import { months } from 'utils';
import { currentMonth } from 'utils/constants';

import Table from './Table';
import Sidebar from './Sidebar';
import DetailsModal from './DetailsModal';
import DetailsModalInternalCalls from './DetailsModalInternalCalls';

const ExportJsonExcel = require('js-export-excel');

const Month = props => {
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
      months: [currentMonth],
      groupByPeriod: 'month',
    },
    ({ filters }) => {
      fetchProfitByMonth({
        filters: { ...filters, years: [filters.years.getFullYear()] },
      });
    }
  );

  const [tableData, setTableData] = useState([]);

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
          total.toFixed(4),
          average.toFixed(4),
        ];
      });
      setTableData(data);
    }
  }, [mainIndicatorsData]);

  const getTranslate = status => {
    switch (status) {
      case 'sl8060':
        return 'Xidm??t s??viyy??si 80/60, %';
      case 'sl8030':
        return 'Xidm??t s??viyy??si 80/30, %';
      case 'answeredCallsIn60':
        return '60 saniy?? i????risind?? cavabland??r??lm???? z??ngl??r';
      case 'answeredCallsIn30':
        return '30 saniy?? i????risind?? cavabland??r??lm???? z??ngl??r';
      case 'missedCallsRate':
        return 'Burax??lm???? z??ng d??r??c??si, %';
      case 'answeredCallsRate':
        return 'Cavabland??r??lm???? z??ng d??r??c??si, %';
      case 'incomingCalls':
        return 'Daxil olan z??ngl??r';
      case 'answeredCalls':
        return 'Cavabland??r??lm???? z??ngl??r';
      case 'missedCalls':
        return 'Burax??lm???? z??ngl??r';
      case 'lostCalls':
        return '??tirilmi?? z??ngl??r';
      case 'calledBackCalls':
        return 'Geri y??????lm???? z??ngl??r';
      case 'handledCalls':
        return 'C??mi emal olunan z??ngl??r';
      case 'missedCallsWaitTimeAvg':
        return 'Burax??lm???? z??ngl??rin ortalama m??dd??ti';
      case 'missedCallsWaitTimeMax':
        return 'Burax??lm???? z??ngl??rin maksimal m??dd??ti';
      case 'speedOfAnswerAvg':
        return 'Ortalama cavab verm?? m??dd??ti';
      case 'handleTimeAvg':
        return 'Ortalama emal m??dd??ti';
      case 'handleTimeMax':
        return 'Maksimal emal m??dd??ti';
      case 'handleTimeTotal':
        return 'C??mi emal m??dd??ti';
      case 'ringTimeTotal':
        return 'Z??ng m??dd??ti';
      case 'acwTimeTotal':
        return 'ACW m??dd??ti';
      case 'talkTimeTotal':
        return 'Dan??????q m??dd??ti';
      case 'holdTimeTotal':
        return 'X??ttd?? saxlama m??dd??ti';
      case 'holdCount':
        return 'X??ttd?? saxlama say??';
      case 'auxTimeTotal':
        return 'AUX';
      case 'readyTimeTotal':
        return 'Bo?? qalma m??dd??ti';
      case 'activityTimeTotal':
        return 'Aktivlik m??dd??ti';
      case 'occupationRate':
        return 'M??????ulluq faizi';
      case 'utilizationRate':
        return ' ??stifad?? faizi';
      case 'uniqueCustomers':
        return 'Unikal m????t??ri say??';
      case 'uniqueCustomersLost':
        return 'Unikal m????t??ri say?? (itirilmi??)';
      case 'uniqueCustomersAnswered':
        return 'Unikal m????t??ri say?? (cavabland??r??lm????)';
      default:
        break;
    }
  };

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
        tableData[item][0] === 'Burax??lm???? z??ngl??rin maksimal m??dd??ti' ||
        tableData[item][0] === 'Burax??lm???? z??ngl??rin ortalama m??dd??ti' ||
        tableData[item][0] === 'Ortalama cavab verm?? m??dd??ti' ||
        tableData[item][0] === 'Ortalama emal m??dd??ti' ||
        tableData[item][0] === 'Maksimal emal m??dd??ti' ||
        tableData[item][0] === 'C??mi emal m??dd??ti' ||
        tableData[item][0] === 'Z??ng m??dd??ti' ||
        tableData[item][0] === 'ACW m??dd??ti' ||
        tableData[item][0] === 'Dan??????q m??dd??ti' ||
        tableData[item][0] === 'X??ttd?? saxlama m??dd??ti' ||
        tableData[item][0] === 'AUX' ||
        tableData[item][0] === 'Bo?? qalma m??dd??ti' ||
        tableData[item][0] === 'Aktivlik m??dd??ti'
      ) {
        return {
          N??mr??: tableData[item][0],
          1:
            tableData[0]?.[1] !== undefined
              ? getTime(tableData[item][1])
              : null,
          2:
            tableData[0]?.[2] !== undefined
              ? getTime(tableData[item][2])
              : null,
          3:
            tableData[0]?.[3] !== undefined
              ? getTime(tableData[item][3])
              : null,
          4:
            tableData[0]?.[4] !== undefined
              ? getTime(tableData[item][4])
              : null,
          5:
            tableData[0]?.[5] !== undefined
              ? getTime(tableData[item][5])
              : null,
          6:
            tableData[0]?.[6] !== undefined
              ? getTime(tableData[item][6])
              : null,
          7:
            tableData[0]?.[7] !== undefined
              ? getTime(tableData[item][7])
              : null,
          8:
            tableData[0]?.[8] !== undefined
              ? getTime(tableData[item][8])
              : null,
          9:
            tableData[0]?.[9] !== undefined
              ? getTime(tableData[item][9])
              : null,
          10:
            tableData[0]?.[10] !== undefined
              ? getTime(tableData[item][10])
              : null,
          11:
            tableData[0]?.[11] !== undefined
              ? getTime(tableData[item][11])
              : null,
          12:
            tableData[0]?.[12] !== undefined
              ? getTime(tableData[item][12])
              : null,

          Toplam: getTime(tableData[item][13]),
          Ortalama: getTime(tableData[item][14]),
        };
      }
      return {
        N??mr??: tableData[item][0],
        1: tableData[0]?.[1] !== undefined ? tableData[item][1] : null,
        2: tableData[0]?.[2] !== undefined ? tableData[item][2] : null,
        3: tableData[0]?.[3] !== undefined ? tableData[item][3] : null,
        4: tableData[0]?.[4] !== undefined ? tableData[item][4] : null,
        5: tableData[0]?.[5] !== undefined ? tableData[item][5] : null,
        6: tableData[0]?.[6] !== undefined ? tableData[item][6] : null,
        7: tableData[0]?.[7] !== undefined ? tableData[item][7] : null,
        8: tableData[0]?.[8] !== undefined ? tableData[item][8] : null,
        9: tableData[0]?.[9] !== undefined ? tableData[item][9] : null,
        10: tableData[0]?.[10] !== undefined ? tableData[item][10] : null,
        11: tableData[0]?.[11] !== undefined ? tableData[item][11] : null,
        12: tableData[0]?.[12] !== undefined ? tableData[item][12] : null,

        Toplam: tableData[item][13],
        Ortalama: tableData[item][14],
      };
    });

    option.fileName = '??sas g??st??ricil??r / Aylar ??zr??';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'N??mr??',
          tableData[0]?.[1] !== undefined ? 1 : null,
          tableData[0]?.[2] !== undefined ? 2 : null,
          tableData[0]?.[3] !== undefined ? 3 : null,
          tableData[0]?.[4] !== undefined ? 4 : null,
          tableData[0]?.[5] !== undefined ? 5 : null,
          tableData[0]?.[6] !== undefined ? 6 : null,
          tableData[0]?.[7] !== undefined ? 7 : null,
          tableData[0]?.[8] !== undefined ? 8 : null,
          tableData[0]?.[9] !== undefined ? 9 : null,
          tableData[0]?.[10] !== undefined ? 10 : null,
          tableData[0]?.[11] !== undefined ? 11 : null,
          tableData[0]?.[12] !== undefined ? 112 : null,

          'Toplam',
          'Ortalama',
        ],
        sheetHeader: [
          '??sas ??a??r?? m??rk??zi g??st??ricil??ri',
          tableData[0]?.[1] !== undefined ? 'Yanvar' : null,
          tableData[0]?.[2] !== undefined ? 'Fevral' : null,
          tableData[0]?.[3] !== undefined ? 'Mart' : null,
          tableData[0]?.[4] !== undefined ? 'Aprel' : null,
          tableData[0]?.[5] !== undefined ? 'May' : null,
          tableData[0]?.[6] !== undefined ? 'Iyun' : null,
          tableData[0]?.[7] !== undefined ? 'Iyul' : null,
          tableData[0]?.[8] !== undefined ? 'Avqust' : null,
          tableData[0]?.[9] !== undefined ? 'Sentyabr' : null,
          tableData[0]?.[10] !== undefined ? 'Oktyabr' : null,
          tableData[0]?.[11] !== undefined ? 'Noyabr' : null,
          tableData[0]?.[12] !== undefined ? 'Dekabr' : null,
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
  const getCallsUnical = (label, name, month) => {
    setModalTitle(`${name || '-'} / ${label}`);
    setMonth(month);
    setModalName(name);
    // eslint-disable-next-line no-unused-expressions
    name === 'Unikal m????t??ri say??'
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
      : name === 'Unikal m????t??ri say?? (itirilmi??)'
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
      row[0] === 'Unikal m????t??ri say??' ||
      row[0] === 'Unikal m????t??ri say?? (itirilmi??)' ||
      row[0] === 'Unikal m????t??ri say?? (cavabland??r??lm????)'
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
    name === '60 saniy?? i????risind?? cavabland??r??lm???? z??ngl??r'
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
      : name === '30 saniy?? i????risind?? cavabland??r??lm???? z??ngl??r'
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
      : name === 'Cavabland??r??lm???? z??ngl??r'
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
      : name === 'Burax??lm???? z??ngl??r'
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
      : name === '??tirilmi?? z??ngl??r'
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
            <ExcelButton
              // loading={excelFileLoading}
              onClick={exportExcelAll}
            />
          </Can>
        </CallTabs>

        <Table
          mainIndicatorsData={mainIndicatorsData}
          getTranslate={getTranslate}
          getTime={getTime}
          tableData={tableData}
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

export const Months = connect(
  mapStateToProps,
  {
    fetchProfitByMonth,
    fetchCalls,
    fetchCallsInternal,
  }
)(Month);
