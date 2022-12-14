/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Col, Collapse, Row, Spin, Tooltip } from 'antd';
import { MdRemoveRedEye } from 'react-icons/md';
import pdfVector from 'assets/img/icons/filePdf.PNG';
import xslVector from 'assets/img/icons/fileXsl.PNG';
import imgVector from 'assets/img/icons/fileImg.PNG';
import docVector from 'assets/img/icons/fileWord.png';
import { fetchContractDocuments } from 'store/actions/contracts';
import { connect } from 'react-redux';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { downloadFileUrl } from 'store/actions/attachment';
import { ReactComponent as DownLoad } from 'assets/img/icons/download.svg';
import Detail from '../../../Warehouse/Products/detail';
import styles from '../../../Warehouse/styles.module.scss';

const { Panel } = Collapse;

const Document = props => {
  const { file, downloadFileUrl } = props;
  const onDownloadFile = file =>
    downloadFileUrl(file.id, data => {
      window.open(data.url);
    });
  function getFileAvatar(file) {
    if (file.type === 'application/zip') {
      if (file.name.split('.').pop() === 'xlsx') {
        return xslVector;
      } else if (file.name.split('.').pop() === 'docx') {
        return docVector;
      }
    }
    if (
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/svg'
    )
      return imgVector;
    if (
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
      return xslVector;
    if (file.type === 'application/pdf') return pdfVector;
    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    )
      return docVector;
    return '';
  }

  return (
    <div className={`${styles.documentParent} ${styles.files}`}>
      <img src={getFileAvatar(file)} alt={file.name || 'Test'} />
      <label title={file.name || 'Test'}>{file.name || 'Test'}</label>
      <i style={{ color: '#FF716A', marginLeft: '10px' }}>
        <DownLoad onClick={() => onDownloadFile(file)} />
      </i>
    </div>
  );
};
const Documents = ({ documnets, downloadFileUrl }) => (
  <div className={styles.documentsParent}>
    <label>??lav?? edilmi?? s??n??dl??r </label>
    <Row style={{ width: 'calc(100% + 12px)', marginTop: 20 }} gutter={12}>
      {documnets.map((document, key) => (
        <Col span={8}>
          <Document
            file={{
              id: document.id,
              type: document.mime_type,
              name: document.original_name,
              status: 'done',
            }}
            downloadFileUrl={downloadFileUrl}
          />
        </Col>
      ))}
    </Row>
  </div>
);

function OpDetailTab(props) {
  const { downloadFileUrl } = props;
  const [documnets, setDocuments] = useState([]);

  const {
    details,
    fetchContractDocuments,
    contractId,
    description,
    businessId,
    allBusinessUnits,
    profile,
  } = props;
  const {
    amount,
    contract_no,
    contract_type,
    counterparty_name,
    currencycode,
    days_to_end,
    direction,
    end_date,
    related_contacts,
    responsible_person_name,
    rest,
    start_date,
    status,
    turnover,
  } = details;

  useEffect(() => {
    if (contractId) {
      fetchContractDocuments({ id: contractId }, res => {
        setDocuments(res.data);
      });
    }
  }, [contractId]);
  const componentRef = useRef();
  return (
    <div style={{ marginTop: 16, width: 'calc(100% + 32px)' }}>
      <div ref={componentRef} style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <span className={styles.modalTitle}>{contract_no}</span>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ReactToPrint
              trigger={() => (
                <Button
                  className={styles.customSquareButton}
                  style={{ marginRight: 10 }}
                  shape="circle"
                  icon="printer"
                />
              )}
              content={() => componentRef.current}
            />
          </div>
        </div>

        <Spin spinning={false}>
          <ul className={styles.detailsList}>
            {allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1 ? (
              <Detail
                primary="Biznes blok"
                secondary={
                  allBusinessUnits?.find(({ id }) => id === businessId)?.name
                }
              />
            ) : null}
            <Detail primary="Qar???? t??r??f" secondary={counterparty_name} />
            <Detail
              primary="N??v??"
              secondary={contract_type === 1 ? 'M??hsul' : 'Xidm??t'}
            />
            <Detail
              primary="??stiqam??t"
              secondary={Number(direction) === 2 ? 'Sat????' : 'Al????'}
            />
            <Detail primary="M??qavil??" secondary={contract_no} />
            <Detail primary="M??sul ????xs" secondary={responsible_person_name} />

            <Detail
              primary="??laq??li t??r??fl??r"
              secondary={
                related_contacts && related_contacts.length !== 0 ? (
                  <span
                    style={{
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#EBEBEB',
                      borderRadius: 4,
                      fontSize: 14,
                      lineHeight: '16px',
                    }}
                  >
                    <Tooltip
                      placement="left"
                      overlayStyle={{
                        whiteSpace: 'pre',
                      }}
                      title={related_contacts.map((contact, index) => (
                        <>
                          {related_contacts[index]}
                          <br />
                        </>
                      ))}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <MdRemoveRedEye size={18} style={{ marginRight: 6 }} />
                        ??laq??l??r ({related_contacts.length})
                      </div>
                    </Tooltip>
                  </span>
                ) : (
                  '-'
                )
              }
            />

            <Detail
              primary="Ba??lama tarixi"
              secondary={
                start_date === null
                  ? 'M??dd??tsiz'
                  : String(start_date)
                      .split(' ')[0]
                      .split('-')
                      .reverse()
                      .join('-')
              }
            />
            <Detail
              primary="Bitm?? tarixi"
              secondary={
                end_date === null
                  ? 'M??dd??tsiz'
                  : String(end_date)
                      .split(' ')[0]
                      .split('-')
                      .reverse()
                      .join('-')
              }
            />
            <Detail primary="G??nl??rin say??" secondary={days_to_end || '-'} />
            <Detail
              primary="M??bl????"
              secondary={
                Number(amount) === 0
                  ? 'Limitsiz'
                  : `${formatNumberToLocale(
                      defaultNumberFormat(amount)
                    )} ${currencycode}`
              }
            />
            <Detail
              primary="D??vriyy??"
              secondary={`${formatNumberToLocale(
                defaultNumberFormat(turnover)
              )} ${currencycode}`}
            />

            <Detail
              primary="Qal??q"
              secondary={`${formatNumberToLocale(
                defaultNumberFormat(rest)
              )} ${currencycode}`}
            />
            <Detail
              primary="Status"
              secondary={
                status === 1 ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#55AB80',
                      background: '#EBF5F0',
                    }}
                  >
                    Imzalan??b
                  </span>
                ) : status === 2 ? (
                  <span
                    style={{
                      color: '#B16FE4',
                      background: '#F6EEFC',
                    }}
                    className={styles.chip}
                  >
                    Qaralama
                  </span>
                ) : (
                  <span
                    style={{
                      color: '#C4C4C4',
                      background: '#F8F8F8',
                    }}
                    className={styles.chip}
                  >
                    Silinib
                  </span>
                )
              }
            />
            <Detail primary="Valyuta" secondary={currencycode} />
            {description ? (
              <Collapse
                style={{
                  borderBottom: '1px solid #dbdbdb',
                  borderRadius: '0px',
                }}
                expandIconPosition="right"
                defaultActiveKey={['1']}
                className={styles.additionalCollapse}
              >
                <Panel header="??lav?? m??lumat" key="1">
                  <p>{description}</p>
                </Panel>
              </Collapse>
            ) : (
              <Detail primary="??lav?? m??lumat" secondary="-" />
            )}
          </ul>

          <Documents documnets={documnets} downloadFileUrl={downloadFileUrl} />
        </Spin>
      </div>
    </div>
  );
}
const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  { fetchContractDocuments, downloadFileUrl }
)(OpDetailTab);
