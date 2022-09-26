import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Col, Row, Spin } from 'antd';
import { ProPanel, ProCollapse } from 'components/Lib';
import moment from 'moment';
import 'moment-timezone';
import { updateCall } from 'store/actions/calls/internalCalls';
import ExportJsonExcel from 'js-export-excel';
import IconButton from 'containers/Orders/utils/IconButton/index';
import CustomTag from '../../../CustomTag';
import Section from './Section';
import styles from './styles.module.scss';

const { TextArea } = Input;

const Detail = ({
  data,
  isView,
  isLoading,
  selectedCall,
  selectedCallDetail,
  credential,
  tenant,
  updateCall,
  getStatus,
  visible = false,
  permissionsByKeyValue,
}) => {
  const [isEditible, setIsEditible] = useState(false);
  const [information, setInformation] = useState('');
  const { internal_calls, answered_calls } = permissionsByKeyValue;
  const isEditDisabled =
    isView === 'answered'
      ? answered_calls.permission !== 2
      : internal_calls.permission !== 2;
  useEffect(() => {
    if (visible) {
      if (selectedCallDetail?.note) {
        setInformation(selectedCallDetail?.note);
      } else {
        setInformation('');
      }
    } else {
      setInformation('');
    }
  }, [visible, selectedCallDetail]);

  const handleDescriptionChange = () => {
    setIsEditible(false);

    const data = {
      type: selectedCall.type,
      appealType: selectedCall.appealType?.id,
      prospectContact: selectedCall.prospectContact
        ? selectedCall.prospectContact.id
        : null,
      prospectOrder: selectedCall.prospectOrder
        ? selectedCall.prospectOrder.id
        : null,
      note: information,
    };

    updateCall({ id: selectedCall?.id, data });
  };

  const handleExport = () => {
    const option = {};
    const dataTable = [
      {
        Id: selectedCall.id,
        Date: moment
          .utc(selectedCall?.startedAt, null)
          .tz(tenant?.timezone)
          .format('DD-MM-YYYY HH:mm:ss'),

        Caller:
          isView === 'internal'
            ? `${selectedCall?.fromOperator.prospectTenantPerson?.name} ${
                selectedCall?.fromOperator.prospectTenantPerson?.lastName
                  ? selectedCall?.fromOperator.prospectTenantPerson?.lastName
                  : null
              }(${selectedCall?.fromOperator.number})`
            : null,
        Number: selectedCall?.toNumber,
        Called:
          isView === 'internal'
            ? `${selectedCall?.toOperator.prospectTenantPerson?.name} ${
                selectedCall?.toOperator.prospectTenantPerson?.lastName
                  ? selectedCall?.toOperator.prospectTenantPerson?.lastName
                  : ''
              }(${selectedCall?.toOperator.number})`
            : null,
        Description: information,
      },
    ];

    option.fileName = 'call-detail';
    option.datas = [
      {
        sheetData: dataTable,
        shhetName: 'sheet',
        sheetFilter: [
          'Id',
          'Date',
          'Caller',
          'Number ',
          'Called',
          'Description',
        ],
        sheetHeader: [
          'Id',
          'Date',
          'Caller',
          'Number ',
          'Called',
          'Description',
        ],
      },
    ];

    const toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };

  if (!visible) return null;
  return (
    <div className={styles.Detail}>
      <Row type="flex" style={{ alignItems: 'center', margin: '0 0 25px 0' }}>
        <Col span={8} offset={16} align="end">
          <IconButton
            buttonSize="large"
            icon="excel"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            buttonStyle={{ marginRight: '10px' }}
            onClick={handleExport}
          />
          <IconButton
            buttonSize="large"
            icon="printer"
            iconWidth={18}
            iconHeight={18}
            className={styles.exportButton}
            onClick={window.print}
          />
        </Col>
      </Row>
      <Spin spinning={isLoading}>
        <Section section="ID" value={selectedCall?.id} />
        <Section
          section="Status"
          value={
            isView === 'internal' ? (
              getStatus(selectedCall?.fromNumber, selectedCall) || '-'
            ) : isView === 'missed' ? (
              <CustomTag
                data={
                  selectedCall?.callbackStatus === 1
                    ? { name: 'reject', label: 'Geri yığılmamış' }
                    : { name: 'done', label: 'Geri yığılıb' }
                }
              />
            ) : null
          }
        />
        <Section
          section="Zəng tarixi"
          value={
            moment
              .utc(selectedCall?.startedAt, null)
              .tz(tenant?.timezone)
              .format('DD-MM-YYYY HH:mm:ss') || '-'
          }
        />
        {isView === 'missed' ? null : (
          <Section
            section="İstiqamət"
            value={
              credential?.number == selectedCall?.fromNumber
                ? 'Xaric olan'
                : 'Daxil olan'
            }
          />
        )}
        {isView === 'internal' ? (
          <Section
            section="Zəng edən"
            value={`${selectedCall?.fromOperator.prospectTenantPerson?.name} ${
              selectedCall?.fromOperator.prospectTenantPerson?.lastName
                ? selectedCall?.fromOperator.prospectTenantPerson?.lastName
                : null
            }(${selectedCall?.fromOperator.number})`}
          />
        ) : null}
        {isView === 'answered' ? (
          <Section
            section="Operator"
            value={
              selectedCall?.fromOperator === null
                ? selectedCall?.toOperator !== null
                  ? `${selectedCall?.toOperator?.prospectTenantPerson.name} ${
                      selectedCall?.toOperator?.prospectTenantPerson?.lastName
                        ? selectedCall?.toOperator?.prospectTenantPerson
                            ?.lastName
                        : ''
                    }`
                  : '-'
                : `${selectedCall?.fromOperator?.prospectTenantPerson?.name} ${
                    selectedCall?.fromOperator?.prospectTenantPerson?.lastName
                      ? selectedCall?.fromOperator?.prospectTenantPerson
                          ?.lastName
                      : ''
                  }`
            }
          />
        ) : null}
        <Section
          section="Nömrə"
          value={
            isView === 'internal'
              ? selectedCall?.toNumber.replace(
                  /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                  '($1) $2 $3 $4 $5'
                )
              : selectedCall?.fromNumber.replace(
                  /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
                  '($1) $2 $3 $4 $5'
                )
          }
        />
        {isView === 'internal' ? null : (
          <Section
            section="Qarşı tərəf"
            value={
              selectedCall?.prospectContact !== null
                ? selectedCall?.prospectContact.name
                : '-'
            }
          />
        )}
        {isView === 'answered' && selectedCall?.status === 1 ? (
          <>
            <Section
              section="Zəngin növü"
              value={
                selectedCall?.type === 1
                  ? 'Məlumat'
                  : selectedCall?.type === 2
                  ? 'Şikayət'
                  : selectedCall?.type === 3
                  ? 'Təklif'
                  : selectedCall?.type === 4
                  ? 'Sifariş'
                  : selectedCall?.type === 5
                  ? 'Səhv'
                  : '-'
              }
            />
            <Section
              section="Müraciət növü"
              value={
                selectedCall?.appealType !== null
                  ? selectedCall?.appealType.parent !== null
                    ? selectedCall?.appealType.parent.name
                    : '-'
                  : '-'
              }
            />
            <Section
              section="Alt müraciət növü"
              value={
                selectedCall?.appealType !== null
                  ? selectedCall?.appealType.name
                  : `-`
              }
            />{' '}
          </>
        ) : null}
        {isView === 'missed' ? (
          <>
            <Section
              section="İş rejimi"
              value={
                selectedCall?.isWorkingTime ? 'İş vaxtı' : 'Qeyri-iş vaxtı'
              }
            />
            <Section
              section="İVR"
              value={selectedCall?.ivr ? selectedCall?.ivr?.name : '-'}
            />
            <Section
              section="Gözləmə müddəti"
              value={
                selectedCall?.waitTime
                  ? moment.utc(selectedCall?.waitTime * 1000).format('HH:mm:ss')
                  : '-'
              }
            />
          </>
        ) : null}
        {isView === 'internal' ? (
          <Section
            section="Zəng edilən"
            value={`${selectedCall?.toOperator.prospectTenantPerson?.name} ${
              selectedCall?.toOperator.prospectTenantPerson?.lastName
                ? selectedCall?.toOperator.prospectTenantPerson?.lastName
                : ''
            }(${selectedCall?.toOperator.number})`}
          />
        ) : null}
        {isView === 'internal' ||
        (isView === 'answered' && selectedCall?.status === 1) ? (
          <Section
            section="Səs yazısı"
            value={
              selectedCall?.recording !== null ? (
                <audio
                  src={
                    data?.find(item => item?.id === selectedCall?.recording?.id)
                      ?.record
                  }
                  type="audio/ogg"
                  style={
                    isEditDisabled
                      ? { height: '35px', pointerEvents: 'none' }
                      : { height: '35px' }
                  }
                  controls
                />
              ) : (
                '-'
              )
            }
          />
        ) : null}
        {isView === 'answered' && selectedCall?.status === 2 ? (
          <Section
            section="Gözləmə müddəti"
            value={
              selectedCall?.waitTime
                ? moment.utc(selectedCall?.waitTime * 1000).format('HH:mm:ss')
                : '-'
            }
          />
        ) : (
          <ProCollapse style={{ padding: 0 }}>
            <ProPanel
              header="Əlavə məlumat"
              id="parent1"
              key="1"
              style={{ padding: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '8px',
                  }}
                  onClick={() => setIsEditible(true)}
                >
                  <img
                    width={13}
                    height={15}
                    src="/img/icons/arrow-down-2.svg"
                    alt="iconAlt"
                    className={styles.icon}
                    style={{ marginRight: '7px' }}
                  />
                  Redaktə edin
                </Button>
                {!isEditible ? (
                  <span
                    className={styles.information}
                    style={{ paddingTop: '16px', width: '100%' }}
                  >
                    {information}
                  </span>
                ) : (
                  <TextArea
                    type="text"
                    className={styles.information}
                    style={{
                      margin: '16px 0 0 0 ',
                      padding: '20px',
                      backgroundColor: 'white',
                    }}
                    value={information}
                    rows={2}
                    onChange={e => setInformation(e.target.value)}
                  />
                )}
                {isEditible && (
                  <Col span={3} style={{ marginTop: '10px' }}>
                    <Button
                      style={{
                        backgroundColor: '#55AB80',
                        fontSize: '14px',
                        color: 'white',
                      }}
                      size="large"
                      onClick={handleDescriptionChange}
                    >
                      Yadda saxla
                    </Button>
                  </Col>
                )}
              </div>
            </ProPanel>
          </ProCollapse>
        )}
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.selectedCall,
  credential: state.profileReducer.credential,
  tenant: state.tenantReducer.tenant,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  {
    updateCall,
  }
)(Detail);
