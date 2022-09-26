import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  Table,
  DetailButton,
  InfoCard,
  ProSelect,
  NewButton,
  ExcelButton,
  Can,
} from 'components/Lib';
import { useFilterHandle } from 'hooks/useFilterHandle';
import swal from '@sweetalert/with-react';
import { Checkbox, Button, Row, Col, Input, Tooltip, Icon } from 'antd';
import {
  fetchEmployeeBonuses,
  fetchBonusConfigurations,
  fetchSelectedEmployeeBonus,
  createEmployeeConfiguration,
  addManualBonus,
  applyManualBonus,
  deleteBonusConfiguration,
} from 'store/actions/finance/salesBonus';
import { fetchCurrencyReport } from 'store/actions/finance/reports';
import {
  fetchMainCurrency,
  fetchCurrencies,
} from 'store/actions/settings/kassa';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
  isValidNumber,
  today,
  dateFormat,
  formatNumberToLocale,
  defaultNumberFormat,
  roundToDown,
} from 'utils';
import { permissions, accessTypes } from 'config/permissions';
import ReportTabs from '../Tabs';
import AddEmployee from './AddEmployee';
import EmploeyeeBonusSidebar from './Sidebar';
import MoreDetails from './MoreDetails';
import styles from '../styles.module.scss';

const stopPropagationHandle = e => {
  if (e) e.stopPropagation();
};
const AmountEditable = ({
  disabled,
  fetchEmployeeBonuses,
  yearAndMonth,
  filters,
  totalPenalty,
  currencyCode,
  addManualBonus,
  id,
  isActive,
}) => {
  const [editable, setEditable] = useState(false);
  const [penalty, setPenalty] = useState(undefined);

  const editableToggle = e => {
    stopPropagationHandle(e);
    setEditable(prevState => !prevState);
    setPenalty(defaultNumberFormat(totalPenalty));
  };

  const checkKeyCode = e => {
    stopPropagationHandle(e);

    const { key } = e;

    if (key === 'Escape') {
      editableToggle(e);
      return;
    }

    if (key === 'Enter') {
      saveHandle(e);
    }
  };

  const inputHandle = e => {
    stopPropagationHandle(e);
    const { value } = e.target;

    if (isValidNumber(value)) {
      setPenalty(value);
    }
  };
  const saveHandle = e => {
    stopPropagationHandle(e);
    addManualBonus(
      {
        year: yearAndMonth.selectedYear,
        month: yearAndMonth.selectedMonth,
        employee: id,
        amount: penalty,
      },
      () => {
        fetchEmployeeBonuses({
          filters,
          year: yearAndMonth.selectedYear,
          month: yearAndMonth.selectedMonth,
        });
      }
    );
    editableToggle();
  };

  const deleteManual = e => {
    stopPropagationHandle(e);
    addManualBonus(
      {
        year: yearAndMonth.selectedYear,
        month: yearAndMonth.selectedMonth,
        employee: id,
        amount: null,
      },
      () => {
        fetchEmployeeBonuses({
          filters,
          year: yearAndMonth.selectedYear,
          month: yearAndMonth.selectedMonth,
        });
      }
    );
  };

  return (
    <div className={styles.editableBox}>
      <div className={styles.editable}>
        {editable ? (
          <Input
            autoFocus
            onChange={inputHandle}
            onKeyDown={checkKeyCode}
            onClick={stopPropagationHandle}
            defaultValue={defaultNumberFormat(totalPenalty)}
            value={penalty}
            maxLength={9}
            suffix={
              <Tooltip title="Yadda saxla">
                <Icon onClick={saveHandle} type="save" />
              </Tooltip>
            }
          />
        ) : (
          <>
            <div>
              {formatNumberToLocale(defaultNumberFormat(totalPenalty))}{' '}
              {currencyCode}
            </div>
            {isActive ? (
              <div className={styles.buttonsGroup}>
                <Can
                  I={accessTypes.manage}
                  a={permissions.employee_sales_bonus_configuration}
                >
                  {() => (
                    <Tooltip title="Dəyiş">
                      <Button
                        style={disabled ? { padding: 0 } : {}}
                        disabled={disabled}
                        onClick={editableToggle}
                        type="link"
                        className={styles.editButton}
                      >
                        <Icon type="edit" theme="filled" />
                      </Button>
                    </Tooltip>
                  )}
                </Can>
                {
                  <Tooltip title="Avtomatik hesabla">
                    <Button
                      style={disabled ? { padding: 0 } : {}}
                      disabled={disabled}
                      onClick={deleteManual}
                      type="link"
                      className={styles.editButton}
                    >
                      <Icon type="reload" />
                    </Button>
                  </Tooltip>
                }
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
const PenaltyApplyCheckbox = ({
  disabled,
  value,
  id,
  applyManualBonus,
  fetchEmployeeBonuses,
  filters,
  selectedYearandMonth,
}) => {
  const [debouncedCallback] = useDebouncedCallback(e => {
    stopPropagationHandle(e);
    onChangeHandle(e);
  }, 200);

  const onChangeHandle = e => {
    applyManualBonus(
      {
        year: selectedYearandMonth.selectedYear,
        month: selectedYearandMonth.selectedMonth,
        employee: id,
      },
      () => {
        fetchEmployeeBonuses({
          filters,
          year: selectedYearandMonth.selectedYear,
          month: selectedYearandMonth.selectedMonth,
        });
      }
    );
  };

  return (
    <Checkbox
      disabled={disabled}
      onChange={debouncedCallback}
      onClick={stopPropagationHandle}
      checked={value}
    />
  );
};

function EmployeeBonus(props) {
  const {
    permissionsByKeyValue,
    isLoading,
    createEmployeeConfigurationLoading,
    fetchEmployeeBonuses,
    fetchSelectedEmployeeBonus,
    selectedEmployeeBonuses,
    employeeBonuses,
    bonusConfiguration,
    fetchBonusConfigurations,
    addManualBonus,
    applyManualBonus,
    createEmployeeConfiguration,
    applyManualBonusLoading,
    deleteBonusConfigurationLoading,
    deleteBonusConfiguration,
    fetchMainCurrency,
    fetchCurrencyReport,
    currencies,
    fetchCurrencies,
    profile,
    fetchBusinessUnitList,
  } = props;
  const [selectedYearandMonth, setselectedYearandMonth] = useState({
    selectedYear: Number(moment(today, dateFormat).format('YYYY')),
    selectedMonth: Number(moment(today, dateFormat).format('M')),
  });
  const [allData, setAllData] = useState();
  const [selected, setSelected] = useState([]);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [viewIsVisible, setViewIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [rate, setRate] = useState(1);
  const [businessUnits, setBusinessUnits] = useState([]);

  const ajaxBusinessUnitSelectRequest = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
      const filters = {
          limit,
          page,
          name: search,
          isDeleted: 0,
          businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      };
      fetchBusinessUnitList({
          filters,
          onSuccess: data => {
              const appendList = [];
              if (data.data) {
                  data.data.forEach(element => {
                      appendList.push({
                          id: element.id,
                          name: element.name,
                          ...element,
                      });
                  });
              }
              if (onSuccessCallback !== undefined) {
                  onSuccessCallback(!appendList.length);
              }
              if (stateReset) {
                  setBusinessUnits(appendList);
              } else {
                  setBusinessUnits(businessUnits.concat(appendList));
              }
          },
      });
  };

  useEffect(() => {
    if (businessUnits) {
        if (businessUnits?.length === 1 && businessUnits[0]?.id !== null) {
            onFilter('businessUnitIds', [businessUnits[0]?.id]);
        }
    }
  }, [businessUnits]);
  const [filters, onFilter] = useFilterHandle(
    {
      isChief: undefined,
      structure: undefined,
      occupation: undefined,
      configuration: undefined,
      turnover: undefined,
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchEmployeeBonuses({
        filters,
        year: selectedYearandMonth.selectedYear,
        month: selectedYearandMonth.selectedMonth,
      });
    }
  );
  const { employee_sales_bonus_configuration } = permissionsByKeyValue;
  const isEditDisabled = employee_sales_bonus_configuration.permission !== 2;
  useEffect(() => {
    fetchEmployeeBonuses({
      filters,
      year: selectedYearandMonth.selectedYear,
      month: selectedYearandMonth.selectedMonth,
    });
  }, [selectedYearandMonth]);

  useEffect(() => {
    if (selectedRow) {
      if (
        selectedYearandMonth?.selectedMonth ==
          moment(today, dateFormat).format('M') &&
        selectedYearandMonth?.selectedYear ==
          moment(today, dateFormat).format('YYYY')
      ) {
        fetchCurrencyReport({
          filters: {
            toCurrencyId: currencies.filter(
              currency => currency.code === selectedRow.currencyCode
            )[0].id,
            currencyId: currencies.filter(
              currency => currency.isMain === true
            )[0].id,
            date: moment(today, dateFormat).format(dateFormat),
          },
          onSuccessCallback: ({ data }) => {
            setRate(roundToDown(Number(data?.[0]?.rate)) || 1);
          },
        });
      } else {
        fetchCurrencyReport({
          filters: {
            toCurrencyId: currencies.filter(
              currency => currency.code === selectedRow.currencyCode
            )[0].id,
            currencyId: currencies.filter(
              currency => currency.isMain === true
            )[0].id,
            date: moment([
              selectedYearandMonth?.selectedYear,
              selectedYearandMonth?.selectedMonth - 1,
            ])
              .endOf('month')
              .format(dateFormat),
          },
          onSuccessCallback: ({ data }) => {
            setRate(roundToDown(Number(data?.[0]?.rate)) || 1);
          },
        });
      }
    }
  }, [selectedYearandMonth, selectedRow]);

  const changeBonusTurnover = (turnover, row) => {
    if (row.saleBonusConfigurationId) {
      createEmployeeConfiguration({
        data: {
          employee: row.id,
          salesBonusConfiguration: row.saleBonusConfigurationId,
          turnoverType: turnover,
        },
        onSuccessCallback: ({ data }) => {
          let newProducts = [];
          newProducts = selected.map(selectedProduct =>
            selectedProduct === row
              ? {
                  ...row,
                  saleBonusTurnover: turnover,
                }
              : selectedProduct
          );
          setSelected(newProducts);
          fetchEmployeeBonuses({
            filters,
            year: selectedYearandMonth.selectedYear,
            month: selectedYearandMonth.selectedMonth,
          });
        },
        onFailureCallback: ({ error }) => {
          if (
            error?.response?.data?.error?.messageKey ===
            'employee_is_not_related_to_tenant_person'
          ) {
            return toast.error(
              'Seçilmiş əməkdaş heç bir istifadəçiyə bağlanmayıb.'
            );
          }
        },
      });
    } else {
      let newProducts = [];
      newProducts = selected.map(selectedProduct =>
        selectedProduct === row
          ? {
              ...row,
              saleBonusTurnover: turnover,
            }
          : selectedProduct
      );
      setSelected(newProducts);
    }
  };
  const changeBonusConfiguration = (configuration, row) => {
    createEmployeeConfiguration({
      data: {
        employee: row.id,
        salesBonusConfiguration: configuration,
        turnoverType: row.saleBonusTurnover,
      },
      onSuccessCallback: ({ data }) => {
        let newProducts = [];
        newProducts = selected.map(selectedProduct =>
          selectedProduct === row
            ? {
                ...row,
                saleBonusConfigurationId: configuration,
                saleBonusTurnover: row.saleBonusTurnover,
              }
            : selectedProduct
        );
        setSelected(newProducts);
        fetchEmployeeBonuses({
          filters,
          year: selectedYearandMonth.selectedYear,
          month: selectedYearandMonth.selectedMonth,
        });
      },
    });
  };
  useEffect(() => {
    setSelected([...employeeBonuses]);
  }, [employeeBonuses]);
  useEffect(() => {
    setAllData(selected);
  }, [selected]);
  useEffect(() => {
    fetchBonusConfigurations();
    fetchMainCurrency();
    fetchCurrencies();
  }, []);
  useEffect(() => {
    if (selectedRow) {
      fetchSelectedEmployeeBonus({
        filters,
        id: selectedRow?.id,
        year: selectedYearandMonth.selectedYear,
        month: selectedYearandMonth.selectedMonth,
      });
    }
  }, [selectedRow]);
  useEffect(() => {
    if (!viewIsVisible) {
      setSelectedRow(undefined);
    }
  }, [viewIsVisible]);

  const handleDetailClick = row => {
    setSelectedRow(row);
    setViewIsVisible(true);
  };
  const handleDeleteClick = id => {
    swal({
      title: 'Diqqət!',
      text: 'Əməkdaşı silmək istədiyinizə əminsinizmi?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        if (id) {
          deleteBonusConfiguration(id, () => {
            fetchEmployeeBonuses({
              filters,
              year: selectedYearandMonth.selectedYear,
              month: selectedYearandMonth.selectedMonth,
            });
          });
        }
      }
    });
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      render: (value, row, index) => index + 1,
      width: 60,
    },
    {
      title: 'Əməkdaş',
      dataIndex: 'name',
      width: 200,
      render: (value, row) => (
        <InfoCard
          name={row.name}
          surname={row.surname}
          patronymic={row.patronymic}
          occupationName={row.occupationName}
          // attachmentUrl={row.employeeAttachmentUrl}
          width="32px"
          height="32px"
        />
      ),
    },
    {
      title: 'Satış dövriyyəsi',
      width: 130,
      dataIndex: 'saleBonusTurnover',
      render: (value, row) => (
        <ProSelect
          size="medium"
          disabled={
            row.isArchived ||
            isEditDisabled ||
            (selectedYearandMonth?.selectedMonth !=
              moment(today, dateFormat).format('M') ||
              selectedYearandMonth?.selectedYear !=
                moment(today, dateFormat).format('YYYY'))
          }
          allowClear={false}
          onChange={turnover => changeBonusTurnover(turnover, row)}
          value={value}
          data={[
            { id: 1, name: 'Öz satışları' },
            { id: 2, name: 'Bütün satışlar' },
          ]}
        ></ProSelect>
      ),
    },
    {
      title: 'Bonus növü',
      width: 130,
      dataIndex: 'saleBonusConfigurationId',
      render: (value, row) => (
        <ProSelect
          disabled={
            row.isArchived ||
            isEditDisabled ||
            (selectedYearandMonth?.selectedMonth !=
              moment(today, dateFormat).format('M') ||
              selectedYearandMonth?.selectedYear !=
                moment(today, dateFormat).format('YYYY'))
          }
          size="medium"
          allowClear={false}
          onChange={configuration =>
            changeBonusConfiguration(configuration, row)
          }
          value={value}
          data={bonusConfiguration}
        ></ProSelect>
      ),
    },
    {
      title: 'Əməkhaqqı valyutası',
      width: 110,
      align: 'center',
      dataIndex: 'currencyCode',
      render: value => value,
    },
    {
      title: 'Hesablanmış bonus',
      dataIndex: 'bonusAmount',
      align: 'left',
      width: 130,
      render: (value, row) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          row.currencyCode
        }`,
    },
    {
      title: 'Təyin edilmiş',
      dataIndex: 'editedBonusAmount',
      align: 'left',
      width: 150,
      render: (value, row) => (
        <AmountEditable
          disabled={
            row.isArchived ||
            isEditDisabled ||
            (selectedYearandMonth?.selectedMonth !=
              moment(today, dateFormat).format('M') ||
              selectedYearandMonth?.selectedYear !=
                moment(today, dateFormat).format('YYYY'))
          }
          yearAndMonth={selectedYearandMonth}
          filters={filters}
          currencyCode={row?.currencyCode}
          totalPenalty={value}
          id={row.id}
          isActive={row?.saleBonusConfigurationId}
          {...{
            addManualBonus,
            fetchEmployeeBonuses,
          }}
        />
      ),
    },
    {
      title: 'Əməkhaqqıya tətbiq olunsun',
      dataIndex: 'applyToSalary',
      align: 'center',
      width: 120,
      render: (value, row) =>
        row?.saleBonusConfigurationId ? (
          <PenaltyApplyCheckbox
            disabled={
              row.isArchived ||
              isEditDisabled ||
              (selectedYearandMonth?.selectedMonth !=
                moment(today, dateFormat).format('M') ||
                selectedYearandMonth?.selectedYear !=
                  moment(today, dateFormat).format('YYYY'))
            }
            value={value}
            id={row.id}
            applyManualBonus={applyManualBonus}
            fetchEmployeeBonuses={fetchEmployeeBonuses}
            filters={filters}
            selectedYearandMonth={selectedYearandMonth}
          />
        ) : null,
    },
    {
      title: 'Seç',
      width: 100,
      align: 'center',
      render: (value, row) =>
        row?.saleBonusConfigurationId ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <DetailButton
              onClick={() => handleDetailClick(row)}
              style={{ height: '30px' }}
            />
            <Can
              I={accessTypes.manage}
              a={permissions.employee_sales_bonus_configuration}
            >
              <Button
                onClick={() => handleDeleteClick(row.id)}
                className={styles.customBtn}
                icon="delete"
                disabled={
                  row.isArchived ||
                  row.applyToSalary ||
                  (selectedYearandMonth?.selectedMonth !=
                    moment(today, dateFormat).format('M') ||
                    selectedYearandMonth?.selectedYear !=
                      moment(today, dateFormat).format('YYYY'))
                }
              />
            </Can>
          </div>
        ) : null,
    },
  ];

  return (
    <section>
      <MoreDetails
        visible={viewIsVisible}
        row={selectedRow}
        selectedEmployeeBonuses={selectedEmployeeBonuses}
        setIsVisible={setViewIsVisible}
        rate={rate}
      />
      <AddEmployee
        visible={modalIsVisible}
        toggleVisible={setModalIsVisible}
        bonusConfiguration={bonusConfiguration}
        selectedYearandMonth={selectedYearandMonth}
        filters={filters}
        selected={selected}
        setSelected={setSelected}
      />
      <EmploeyeeBonusSidebar
        selectedYearandMonth={selectedYearandMonth}
        setselectedYearandMonth={setselectedYearandMonth}
        filters={filters}
        onFilter={onFilter}
        businessUnits={businessUnits}
        ajaxBusinessUnitSelectRequest={ajaxBusinessUnitSelectRequest}
        profile={profile}
      />

      <section className="scrollbar aside" id="ProductionCalendarMainArea">
        <div className="container">
          <ReportTabs />

          <Row style={{ margin: '20px 0' }}>
            <Col span={24}>
              <Can
                I={accessTypes.manage}
                a={permissions.employee_sales_bonus_configuration}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <ExcelButton
                  // onClick={handleExportOperations}
                  />
                  {selectedYearandMonth?.selectedMonth !=
                    moment(today, dateFormat).format('M') ||
                  selectedYearandMonth?.selectedYear !=
                    moment(today, dateFormat).format('YYYY') ? null : (
                    <NewButton
                      onClick={() => setModalIsVisible(true)}
                      style={{ marginLeft: '10px' }}
                      label="Əməkdaş əlavə et"
                    />
                  )}
                </div>
              </Can>
            </Col>
          </Row>
          <Table
            scroll={{ x: 'max-content' }}
            className={styles.employeeBonusTable}
            loading={
              isLoading ||
              createEmployeeConfigurationLoading ||
              applyManualBonusLoading ||
              deleteBonusConfigurationLoading
            }
            dataSource={allData}
            rowKey={record => record.id}
            columns={columns}
          />
        </div>
      </section>
    </section>
  );
}
const mapStateToProps = state => ({
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  bonusConfiguration: state.bonusConfigurationReducer.bonusConfiguration,
  isLoading: state.loadings.fetchEmployeeBonuses,
  createEmployeeConfigurationLoading:
    state.loadings.createEmployeeConfiguration,
  applyManualBonusLoading: state.loadings.applyManualBonus,
  deleteBonusConfigurationLoading: state.loadings.deleteBonusConfiguration,
  employeeBonuses: state.bonusConfigurationReducer.employeeBonuses,
  selectedEmployeeBonuses:
    state.bonusConfigurationReducer.selectedEmployeeBonuses,
  currencies: state.kassaReducer.currencies,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  {
    fetchEmployeeBonuses,
    fetchSelectedEmployeeBonus,
    fetchBonusConfigurations,
    createEmployeeConfiguration,
    addManualBonus,
    applyManualBonus,
    deleteBonusConfiguration,
    fetchMainCurrency,
    fetchCurrencyReport,
    fetchCurrencies,
    fetchBusinessUnitList,
  }
)(EmployeeBonus);
