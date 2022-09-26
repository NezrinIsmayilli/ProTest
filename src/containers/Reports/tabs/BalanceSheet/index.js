/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { Row, Col, Tooltip } from 'antd';
import { Table, DetailButton, ProModal } from 'components/Lib';
import { getBalanceSheet } from 'store/actions/reports/balance-sheet';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import moment from 'moment';
import math from 'exact-math';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  balanceSheetWithoutDetail,
  today,
} from 'utils';
import BalanceSheetSidebar from './Sidebar';
import BalanceSheetDetail from './balanceSheetDetail';
import styles from './styles.module.scss';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { getAllBalanceSheet } from 'store/actions/export-to-excel/reportsModule';
const BalanceSheet = props => {
  const {
    isLoading,
    getBalanceSheet,
    getAllBalanceSheet,
    fetchMainCurrency,
    mainCurrency,
    profile,
    fetchBusinessUnitList,
    businessUnits,
  } = props;
  const [filter, setFilter] = useState(undefined);
  const [date, setDate] = useState(undefined);
  const [balance, setBalance] = useState([]);
  const [newBalance, setNewBalance] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [exBalance, setExBalance] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const columnClone = ['name','amount','amount2','amount3',"amount4"];
  const [filters, onFilter] = useFilterHandle(
    {
      date: today,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      if (filters.date)
        getBalanceSheet({
          filters,
          onSuccessCallback: ({ data }) => {
            setBalance(data);
          },
        });
    }
  );
  const handleDetailClick = (row, date) => {
    setSelectedRow(row);
    setDate(date);
    setIsVisible(!isVisible);
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Balans hesabatı tarixi',
        align: 'left',
        dataIndex: 'name',
        width: 200,
        render: (value, { amount }) =>
          value === 'Cəmi aktivlər'
            ? `CƏMİ AKTİVLƏR, ${mainCurrency?.code}`
            : value === 'Cəmi öhdəliklər və kapital'
            ? `CƏMİ ÖHDƏLİKLƏR VƏ KAPİTAL, ${mainCurrency?.code}`
            : amount
            ? `${value}, ${mainCurrency?.code}`
            : value,
      },
      {
        title: filters.date,
        dataIndex: 'amount',
        width: 200,
        align: 'center',
        render: (value, row) =>
          value ? (
            balanceSheetWithoutDetail.includes(row.name) ? (
              <div className={styles.detailbtn}>
                <span className={styles.rowNumbers}>
                  {formatNumberToLocale(defaultNumberFormat(value))}
                </span>

                <Tooltip
                  title={formatNumberToLocale(defaultNumberFormat(value))}
                  placement="right"
                >
                  <DetailButton
                    className={styles.detailButton}
                    onClick={() => handleDetailClick(row, filters.date)}
                  />
                </Tooltip>
              </div>
            ) : (
              formatNumberToLocale(defaultNumberFormat(value))
            )
          ) : (
            ''
          ),
      },
    ];

    if (filter && newBalance?.length > 0) {
      columns.push({
        title: filter,
        dataIndex: 'amount2',
        width: 200,
        align: 'center',
        render: (value, row) =>
          value ? (
            balanceSheetWithoutDetail.includes(row.name) ? (
              <div className={styles.detailbtn}>
                <span className={styles.rowNumbers}>
                  {formatNumberToLocale(defaultNumberFormat(value))}
                </span>

                <Tooltip
                  title={formatNumberToLocale(defaultNumberFormat(value))}
                  placement="right"
                >
                  <DetailButton
                    className={styles.detailButton}
                    onClick={() => handleDetailClick(row, filter)}
                  />
                </Tooltip>
              </div>
            ) : (
              formatNumberToLocale(defaultNumberFormat(value))
            )
          ) : (
            ''
          ),
      });
      columns.push({
        title: `Dinamika, ${mainCurrency?.code}`,
        dataIndex: 'amount3',
        width: 200,
        align: 'right',
        render: (value, row) =>
          row.amount2 ? (
            moment(filters.date, 'DD-MM-YYYY').isBefore(
              moment(filter, 'DD-MM-YYYY')
            ) ? (
              <span
                style={
                  math.sub(Number(row.amount2 || 0), Number(row.amount || 0)) > 0
                    ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                    : math.sub(Number(row.amount2 || 0), Number(row.amount || 0)) ===
                      0
                    ? { color: '#505050', fontSize: '15px', fontWeight: 700 }
                    : { color: 'red', fontSize: '15px', fontWeight: 700 }
                }
              >
                {formatNumberToLocale(
                  defaultNumberFormat(
                    math.sub(Number(row.amount2 || 0), Number(row.amount || 0))
                  )
                )}
              </span>
            ) : (
              <span
                style={
                  math.sub(Number(row.amount || 0), Number(row.amount2 || 0)) > 0
                    ? { color: 'green', fontSize: '15px', fontWeight: 700 }
                    : math.sub(Number(row.amount2 || 0), Number(row.amount || 0)) ===
                      0
                    ? { color: '#505050', fontSize: '15px', fontWeight: 700 }
                    : { color: 'red', fontSize: '15px', fontWeight: 700 }
                }
              >
                {formatNumberToLocale(
                  defaultNumberFormat(
                    math.sub(Number(row.amount || 0), Number(row.amount2 || 0))
                  )
                )}
              </span>
            )
          ) : (
            ''
          ),
      });
      columns.push({
        title: 'Dinamika, %',
        dataIndex: 'amount4',
        width: 200,
        align: 'right',
        render: (value, row) =>
          row.amount2 ? (
            (Number(row.amount2) === 0 && Number(row.amount) === 0) ||
            Number(row.amount2) === Number(row.amount) ? (
              <span
                style={{ color: '#50505', fontSize: '15px', fontWeight: 700 }}
              >
                0.00%
              </span>
            ) : moment(filters.date, 'DD-MM-YYYY').isBefore(
                moment(filter, 'DD-MM-YYYY')
              ) ? (
              Number(row.amount) === 0 ? (
                Number(row.amount2) > 0 ? (
                  <span
                    style={{
                      color: 'green',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    100%
                  </span>
                ) : (
                  <span
                    style={{
                      color: 'red',
                      fontSize: '15px',
                      fontWeight: 700,
                    }}
                  >
                    100%
                  </span>
                )
              ) : math.div(
                  math.sub(Number(row.amount2 || 0), Number(row.amount || 0)),
                  Number(row.amount || 0)
                ) > 0 ? (
                <span
                  style={{ color: 'green', fontSize: '15px', fontWeight: 700 }}
                >
                  {`${formatNumberToLocale(
                    defaultNumberFormat(
                      math.mul(
                        math.div(
                          math.sub(Number(row.amount2 || 0), Number(row.amount || 0)),
                          Number(row.amount || 0)
                        ),
                        100
                      )
                    )
                  )}%`}
                </span>
              ) : (
                <span
                  style={{
                    color: '#505050',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  {`${formatNumberToLocale(
                    defaultNumberFormat(
                      math.mul(
                        math.div(
                          math.sub(Number(row.amount2 || 0), Number(row.amount || 0)),
                          Number(row.amount || 0)
                        ),
                        -100
                      )
                    )
                  )}%`}
                </span>
              )
            ) : Number(row.amount2) === 0 ? (
              Number(row.amount) > 0 ? (
                <span
                  style={{ color: 'green', fontSize: '15px', fontWeight: 700 }}
                >
                  100%
                </span>
              ) : (
                <span
                  style={{ color: 'red', fontSize: '15px', fontWeight: 700 }}
                >
                  100%
                </span>
              )
            ) : math.div(
                math.sub(Number(row.amount || 0), Number(row.amount2 || 0)),
                Number(row.amount2 || 0)
              ) > 0 ? (
              <span
                style={{ color: 'green', fontSize: '15px', fontWeight: 700 }}
              >
                {`${formatNumberToLocale(
                  defaultNumberFormat(
                    math.mul(
                      math.div(
                        math.sub(Number(row.amount || 0), Number(row.amount2 || 0)),
                        Number(row.amount2 || 0)
                      ),
                      100
                    )
                  )
                )}%`}
              </span>
            ) : (
              <span style={{ color: 'red', fontSize: '15px', fontWeight: 700 }}>
                {`${formatNumberToLocale(
                  defaultNumberFormat(
                    math.mul(
                      math.div(
                        math.sub(Number(row.amount || 0), Number(row.amount2 || 0)),
                        Number(row.amount2 || 0)
                      ),
                      -100
                    )
                  )
                )}%`}
              </span>
            )
          ) : (
            ''
          ),
      });
    }

    return columns;
  };

  const getExcelColumns = () => {
    const columns = [];
    columns[columnClone.indexOf('name')] = {
        title: 'Balans hesabatı tarixi',
        width: { wpx: 200 },
      };
      columns[columnClone.indexOf('amount')] ={
        title: filters.date,
        width: { wpx: 200 },
      };
  
    if (filter && newBalance?.length > 0) {
      columns[columnClone.indexOf('amount2')]= {
        title: filter,
        width: { wpx: 200 },
      };
      columns[columnClone.indexOf('amount3')] ={
        title: `Dinamika, ${mainCurrency?.code}`,
        width: { wpx: 200 },
      };
      columns[columnClone.indexOf('amount4')] ={
        title: 'Dinamika, %',
        dataIndex: 'amount4',
        width: { wpx: 200 },
      };
    }
    setExcelColumns(columns)
 
  };

  const getExcelData = () => {
    const columnFooterStyle = {
      font: { color: { rgb: '646464' }, bold: true },
      fill: { patternType: 'solid', fgColor: { rgb: 'e2e5de' } },
  };
    const data = exBalance.map((item, index) => {  
     
      let arr = [];
      columnClone.includes('name') && (arr[columnClone.indexOf('name')] ={ value:item.name? `${item.name} ${mainCurrency?.code}`: '',
      style:(item.name=='AKTİVLƏR'||item.name=='Cəmi aktivlər'||item.name=='ÖHDƏLİKLƏR VƏ KAPİTAL'||item.name=='Cəmi öhdəliklər və kapital')?columnFooterStyle:'' });
      columnClone.includes('amount') && (arr[columnClone.indexOf('amount')] = { value:item.amount?Number(defaultNumberFormat(item.amount||0)):"",
      style:(item.name=='AKTİVLƏR'||item.name=='Cəmi aktivlər'||item.name=='ÖHDƏLİKLƏR VƏ KAPİTAL'||item.name=='Cəmi öhdəliklər və kapital')?columnFooterStyle:'' });
      if (filter && newBalance?.length > 0) {
      columnClone.includes('amount2') && (arr[columnClone.indexOf('amount2')] = { value:item.amount? Number(defaultNumberFormat(item.amount2||0)):"" ,
      style:(item.name=='AKTİVLƏR'||item.name=='Cəmi aktivlər'||item.name=='ÖHDƏLİKLƏR VƏ KAPİTAL'||item.name=='Cəmi öhdəliklər və kapital')?columnFooterStyle:'' });
      columnClone.includes('amount3') && (arr[columnClone.indexOf('amount3')] = { value:item.amount?  moment(filters.date, 'DD-MM-YYYY').isBefore(
        moment(filter, 'DD-MM-YYYY')) ? Number(defaultNumberFormat( math.sub(Number(item.amount2 || 0), Number(item.amount || 0))))
        :Number(defaultNumberFormat(   math.sub(Number(item.amount || 0), Number(item.amount2 || 0)))):"" ,
      style:(item.name=='AKTİVLƏR'||item.name=='Cəmi aktivlər'||item.name=='ÖHDƏLİKLƏR VƏ KAPİTAL'||item.name=='Cəmi öhdəliklər və kapital')?columnFooterStyle:'' });
      columnClone.includes('amount4') && (arr[columnClone.indexOf('amount4')] = { value:item.amount?
        (Number(item.amount2) === 0 && Number(item.amount) === 0) || Number(item.amount2) === Number(item.amount) ? '0.00%':
        moment(filters.date, 'DD-MM-YYYY').isBefore(moment(filter, 'DD-MM-YYYY')) ? Number(item.amount) === 0? (Number(item.amount2)>0?'100%':'-100%'):
        `${defaultNumberFormat(
          math.mul(
            math.div(math.sub(Number(item.amount2 || 0), Number(item.amount || 0)),Number(item.amount || 0)),100))}%`
            :Number(item.amount2) === 0 ?(Number(item.amount)>0?'100%':'-100%'):
           `${ defaultNumberFormat(
              math.mul(
                math.div(
                  math.sub(Number(item.amount || 0), Number(item.amount2 || 0)),
                  Number(item.amount2 || 0)
                ),100))}%`
        :"" ,
      style:(item.name=='AKTİVLƏR'||item.name=='Cəmi aktivlər'||item.name=='ÖHDƏLİKLƏR VƏ KAPİTAL'||item.name=='Cəmi öhdəliklər və kapital')?columnFooterStyle:'' });
      }
      return arr;
     
    })
    setExcelData(data);
  }


  useEffect(() => {
    getExcelColumns();
  }, [newBalance]);
  
  useEffect(() => {
    getExcelData()
  }, [exBalance]); 

  const addRow = (arr, changed, change, add) => {
    return arr?.splice(changed, change, add);
  };
  const getData = data => {
    const cards = [...data];
    addRow(cards, 0, 0, { name: 'AKTİVLƏR' });
    addRow(cards, 8, 0, { name: '' });
    addRow(cards, 14, 0, { name: '' });
    addRow(cards, 16, 0, { name: '' });
    addRow(cards, 17, 0, { name: 'ÖHDƏLİKLƏR VƏ KAPİTAL' });
    addRow(cards, 20, 0, { name: '' });
    addRow(cards, 23, 0, { name: '' });
    addRow(cards, 27, 0, { name: '' });

    return cards;
  };

  useEffect(() => {
    if (filter !== undefined) {
      getBalanceSheet({
        label: 'newBalance',
        filters: { date: filter },
        onSuccessCallback: ({ data }) => {
          setNewBalance(data);
        },
      });
    }
  }, [filter]);

  useEffect(() => {
    if (!isVisible) {
      if (filter) {
        getBalanceSheet({
          label: 'newBalance',
          filters: { date: filter },
          onSuccessCallback: ({ data }) => {
            setNewBalance(data);
          },
        });
      }
      if (filters.date) {
        getBalanceSheet({
          filters,
          onSuccessCallback: ({ data }) => {
            setBalance(data);
          },
        });
      }
    }
  }, [isVisible]);

  const generatedData = (dataOne, dataTwo) => {
    if (dataTwo) {
      const neWArr = [
        ...dataOne.map((employee, index) => ({
          ...employee,
          amount2: dataTwo[index]?.amount,
        })),
      ];
      return neWArr;
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
  }, []);
  return (
    <div>
      <ProModal
        maskClosable
        padding
        width={1000}
        handleModal={handleDetailClick}
        isVisible={isVisible}
      >
        <BalanceSheetDetail
          row={selectedRow}
          date={date}
          visible={isVisible}
          setVisible={setIsVisible}
          mainCurrency={mainCurrency}
        />
      </ProModal>
      <BalanceSheetSidebar
        onFilter={onFilter}
        setFilter={setFilter}
        filters={filters}
        businessUnits={businessUnits}
        profile={profile}
      />
      <section className="scrollbar aside">
        <div style={{ margin: '0px 31px' }}>
          <Row  style={
                  newBalance && newBalance.length !== 0
                    ? {margin:'20px 0', width: '100%' }
                    : {margin:'20px 0', width: '60%' }
                }>
          <Col 
          span={24}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',}}
            >
          <ExportToExcel
          getExportData={
          () => getAllBalanceSheet(
          {
            label: 'newBalance',
          filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
            setExBalance(generatedData(getData(balance),getData(newBalance)))
              }
          })
          }
          data={excelData}
          columns={excelColumns}
          excelTitle={`Balans hesabatı (${filters?.date}) ${filter? `- (${filter})`:''}`}
          excelName={`Balans hesabatı (${filters?.date}) ${filter? `- (${filter})`:''}`}
          filename={`Balans hesabatı (${filters?.date}) ${filter? `- (${filter})`:''}`}
          count={generatedData(getData(balance),getData(newBalance))?.length}
          />
          </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                loading={isLoading}
                style={
                  newBalance && newBalance.length !== 0
                    ? { width: '100%' }
                    : { width: '60%' }
                }
                scroll={{ x: 'max-content' }}
                dataSource={generatedData(
                  getData(balance),
                  getData(newBalance)
                )}
                className={styles.balanceTable}
                columns={getColumns()}
                rowKey={record => record.rowId}
                footer={false}
              />
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.balanceSheet.isLoading,
  balanceSheet: state.balanceSheet.balanceSheet,
  mainCurrency: state.kassaReducer.mainCurrency,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
});

export default connect(
  mapStateToProps,
  {
    getBalanceSheet,
    getAllBalanceSheet,
    fetchMainCurrency,
    fetchBusinessUnitList,
  }
)(BalanceSheet);
