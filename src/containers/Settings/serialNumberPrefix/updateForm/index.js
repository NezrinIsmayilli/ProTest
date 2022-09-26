/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import swal from '@sweetalert/with-react';
import {
  ProWrapper,
  ProUploadWithDrop,
  ProEmpty,
  ProModal,
} from 'components/Lib';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowDown,
  TiDocumentAdd,
  FaPencilAlt,
} from 'react-icons/all';
import { Tabs, Row, Col, Spin, message, Icon, Tooltip } from 'antd';
import {
  deleteForms,
  fetchSalesBuysForms,
} from 'store/actions/settings/serialNumberPrefix';
import { downloadFileUrl } from 'store/actions/attachment';
import docVector from 'assets/img/icons/fileWord.png';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { useHistory, useParams, Link } from 'react-router-dom';
import { UpdateName } from './updateName';
import styles from './styles.module.scss';

const { TabPane } = Tabs;
const returnUrl = `/settings/msk/documents`;

const UpdateForm = props => {
  const {
    fetchMainCurrency,
    mainCurrency,
    downloadFileUrl,
    deleteForms,
    salesBuysForms,
    contractsForms,
    fetchSalesBuysForms,
  } = props;

  const history = useHistory();
  const { location } = history;

  const [activeTab, setActiveTab] = useState('1');
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [costVisible, setCostVisible] = useState(false);
  const [counterpartyVisible, setCounterpartyVisible] = useState(false);
  const [type, setType] = useState('Alış');
  const [documents, setDocuments] = useState([]);
  const formType = location?.state?.row?.type;

  const parameters = [
    {
      name:
        formType === 8 || formType === 9
          ? 'Başlama tarixi'
          : 'Əməliyyat tarixi',
      params: formType === 9 ? 'start_date' : 'operationDate',
    },
    formType === 8 || formType === 9
      ? {
          name: 'Bitmə tarixi',
          params: formType === 9 ? 'end_date' : 'bronEndDate',
        }
      : null,
    formType === 9
      ? null
      : {
          name: 'İcra tarixi',
          params: 'createdAt',
        },
    formType === 6 || formType === 7 || formType === 8
      ? null
      : {
          name: 'Valyuta',
          params: formType === 9 ? 'currencycode' : 'currencyCode',
        },
    formType === 6 || formType === 7
      ? null
      :  {
          id: 3,
          name: 'Qarşı tərəf',
          params: null,
          childrens: [
            {
              name: 'Qarşı tərəf',
              params:  formType === 8
              ? 'clientName'
              : formType === 9
              ? 'counterparty_name'
              : 'counterparty',
            },
            {
              name: 'Debitor borc',
              params: 'receivables',
            },
            {
              name: 'Kreditor borc',
              params: 'payables',
            },
            {
              name: 'Avans',
              params: 'contactsAmount',
              paramsTwo: 'myAmount',
            },
          ],
        },
    formType === 9
      ? null
      : {
          name: 'Satış meneceri',
          params: 'salesmanName',
          paramsTwo: 'salesmanLastName',
        },
    formType === 6 || formType === 7 || formType === 9
      ? null
      : {
          name: 'Müqavilə',
          params: 'contractNo',
        },
    formType === 8
      ? {
          name: 'Sifariş',
          params: 'orderSerialNumber',
        }
      : null,
    formType === 1 || formType === 2 || formType === 3
      ? {
          name: 'Agent',
          params: 'agentName',
          paramsTwo: 'agentSurname',
        }
      : null,
    {
      name: 'Biznes blok',
      params: 'businessUnitName',
    },
    formType === 9 ? { name: 'Növü', params: 'contract_type' } : null,
    formType === 9 ? { name: 'İstiqamət', params: 'direction' } : null,
    formType === 9
      ? { name: 'Müqavilənin nömrəsi', params: 'contract_no' }
      : null,
    formType === 9
      ? { name: 'Məsul şəxs', params: 'responsible_person_name' }
      : null,
    formType === 9
      ? { name: 'Əlaqəli tərəflər', params: 'related_contacts' }
      : null,
    formType === 9 ? { name: 'Məbləğ', params: 'amount' } : null,
    formType === 9 ? { name: 'Dövriyyə', params: 'turnover' } : null,
    formType === 9 ? { name: 'Qalıq', params: 'rest' } : null,
    formType === 9 ? { name: 'Günlərin sayı', params: 'days_to_end' } : null,
    formType === 7
      ? {
          name: 'Xərc mərkəzi',
          params: 'expenditureCenter',
        }
      : null,
    formType === 7
      ? {
          name: 'Xərc mərkəzi növü',
          params: 'expenditureCenterType',
        }
      : null,
    formType === 9 || formType === 6
      ? null
      : {
          name: 'Anbar',
          params: 'stockName',
        },
    formType === 6
      ? {
          name: 'Anbar(Haradan)',
          params: 'stockFromName',
        }
      : null,
    formType === 6
      ? {
          name: 'Anbar(Haraya)',
          params: 'stockToName',
        }
      : null,
    formType === 9
      ? null
      : formType === 8
      ? {
          name: 'Toplam qiymət',
          params: 'endPrice',
          paramsTwo: 'currencyCode',
        }
      : {
          name: 'Toplam qiymət',
          params: 'amount',
          paramsTwo: 'currencyCode',
        },
    formType === 9
      ? null
      : formType === 8
      ? {
          name: `Toplam qiymət (${mainCurrency?.code})`,
          params: 'endPriceInMainCurrency',
          paramsTwo: 'mainCurrencyCode',
        }
      : {
          name: `Toplam qiymət (${mainCurrency?.code})`,
          params: 'amountInMainCurrency',
          paramsTwo: 'mainCurrencyCode',
        },
    formType === 2
      ? {
          name: 'Əlavə xərc',
          params: 'totalExpenseAmount',
          paramsTwo: 'currencyCode',
        }
      : null,
    formType === 2
      ? {
          name: 'Əlavə xərc (%)',
          params: 'totalExpensePercentage',
        }
      : null,
    formType === 1 || formType === 3 || formType === 4 || formType === 5
      ? {
          name: 'Endirim faizi',
          params: 'discountPercentage',
        }
      : null,
    formType === 1 || formType === 3 || formType === 4 || formType === 5
      ? {
          name: 'Endirim məbləği',
          params: 'discountAmount',
          paramsTwo: 'currencyCode',
        }
      : null,
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'Son qiymət',
          params: 'endPrice',
          paramsTwo: 'currencyCode',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: `Son qiymət (${mainCurrency?.code})`,
          params: 'endPriceInMainCurrency',
          paramsTwo: 'mainCurrencyCode',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'ƏDV faizi',
          params: 'taxPercentage',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'ƏDV məbləği',
          params: 'taxAmount',
          paramsTwo: 'taxCurrencyCode',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: `ƏDV məbləği (${mainCurrency?.code})`,
          params: 'taxAmountInMainCurrency',
          paramsTwo: 'mainCurrencyCode',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'ƏDV valyutası',
          params: 'taxCurrencyCode',
        },
    formType === 2 ||
    formType === 6 ||
    formType === 7 ||
    formType === 8 ||
    formType === 9
      ? null
      : {
          name: 'Yekun (ƏDV ilə)',
          params: 'priceWithTax',
          paramsTwo: 'currencyCode',
        },
    formType === 2
      ? {
          name: 'Qarş tərəf (ƏDV)',
          params: 'counterpartyName',
        }
      : null,
    formType === 9
      ? null
      : {
          name: 'Qaimə',
          params: 'invoiceNumber',
        },
    formType === 8 || formType === 9
      ? null
      : {
          name: 'Məzənnə',
          params: 'rate',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'Məzənnə (ƏDV)',
          params: 'tax_rate',
        },
    formType === 1 || formType === 2
      ? {
          name: 'Maya dəyəri',
          params: 'cost',
          paramsTwo: 'currencyCode',
        }
      : null,
    {
      name: 'Əlavə məlumat',
      params: 'description',
    },
    formType === 9
      ? null
      : formType === 6
      ? {
          name: 'Göndərən anbardar',
          params: 'fromWarehousemanName',
          paramsTwo: 'fromWarehousemanLastname',
        }
      : {
          name: 'Anbardar',
          params: 'warehousemanName',
          paramsTwo: 'warehousemanLastname',
        },
    formType === 6
      ? {
          name: 'Qəbul edən anbardar',
          params: 'warehousemanName',
          paramsTwo: 'warehousemanLastname',
        }
      : null,
    formType === 8
      ? {
          name: 'Status',
          params: 'statusOfOperation',
        }
      : null,
    formType === 1 || formType === 2 || formType === 4
      ? {
          name: 'Təchizatçı',
          params: 'supplierName',
        }
      : null,
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'Qaimənin ödəniş statusu',
          params: 'paymentStatus',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'ƏDV- nin ödəniş statusu',
          params: 'taxPaymentStatus',
        },
    formType === 9
      ? null
      : {
          name: 'Şirkət adı',
          params: 'companyName',
        },
    formType === 9
      ? null
      : {
          name: 'Əlavə edilib',
          params: 'operatorName',
          paramsTwo: 'operatorLastname',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'Ödənilmiş məbləğ',
          params: 'paidAmount',
          paramsTwo: 'currencyCode',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'Ödənilmiş ƏDV məbləği',
          params: 'paidTaxAmount',
          paramsTwo: 'taxCurrencyCode',
        },
    formType === 6 || formType === 7 || formType === 8 || formType === 9
      ? null
      : {
          name: 'Ödəniş cədvəli',
          params: 'creditNumber',
        },
    formType === 9
      ? {
          id: 1,
          name: 'Şirkət rekvizitləri',
          params: null,
          childrens: [
            {
              name: 'Şirkət adı',
              params: 'tenantOfficialName',
            },
            {
              name: 'Baş direktor',
              params: 'tenantGeneralDirector',
            },
            {
              name: 'VÖEN (Şirkət)',
              params: 'tenantCompanyVoen',
            },
            {
              name: 'Bank adı',
              params: 'tenantBankName',
            },
            {
              name: 'VÖEN (Bank)',
              params: 'tenantBankVoen',
            },
            {
              name: 'Kod',
              params: 'tenantBankCode',
            },
            {
              name: 'Müxbir hesab (M/h)',
              params: 'tenantCorrespondentAccount',
            },
            {
              name: 'Hesablaşma hesabı (H/h)',
              params: 'tenantSettlementAccount',
            },
            {
              name: 'S.W.I.F.T.',
              params: 'tenantSwift',
            },
          ],
        }
      : {
          id: 1,
          name: 'Qaimənin tərkibi',
          params: null,
          childrens: [
            {
              name: '№',
              params: 'orderNumber',
            },
            {
              name: 'Kataloq',
              params: 'catalogName',
            },
            {
              name: 'Məhsul adı',
              params: 'productName',
            },
            {
              name: 'Məhsul kodu',
              params: 'product_code',
            },
            {
              name: 'Barkod',
              params: 'barcode',
            },
            {
              name: 'Seriya nömrəsi',
              params: 'serialNumber',
            },
            {
              name: 'Vahidin qiyməti',
              params: 'pricePerUnit',
              paramsTwo: 'currencyCode',
            },
            {
              name: 'Say',
              params: 'quantity',
            },
            {
              name: 'Ölçü vahidi',
              params: 'unitOfMeasurementName',
            },
            {
              name: 'Toplam',
              params: 'total',
            },
          ],
        },
    formType === 2
      ? {
          id: 2,
          name: 'Maya dəyərinin hesablanması',
          params: null,
          childrens: [
            {
              name: '№',
              params: 'orderNumber',
            },
            {
              name: 'Məhsul adı',
              params: 'importedProductName',
            },
            {
              name: 'Vahidin qiyməti',
              params: 'pricePerUnit',
            },
            {
              name: 'Əlavə xərc (%)',
              params: 'expensePercentage',
            },
            {
              name: 'Artan məbləğ',
              params: 'increaseadAmount',
            },
            {
              name: 'Maya dəyəri',
              params: 'costPricePerUnit',
            },
            {
              name: 'Say',
              params: 'quantity',
            },
            {
              name: 'Ölçü vahidi',
              params: 'unitOfMeasurementName',
            },
            {
              name: 'Toplam',
              params: 'total',
            },
          ],
        }
      : formType === 9
      ? {
          id: 2,
          name: 'Qarşı tərəfin rekvizitləri',
          params: null,
          childrens: [
            {
              name: 'Şirkət adı',
              params: 'counterpartyOfficialName',
            },
            {
              name: 'Baş direktor',
              params: 'counterpartyGeneralDirector',
            },
            {
              name: 'VÖEN (Şirkət)',
              params: 'counterpartyCompanyVoen',
            },
            {
              name: 'Bank adı',
              params: 'counterpartyBankName',
            },
            {
              name: 'VÖEN (Bank)',
              params: 'counterpartyBankVoen',
            },
            {
              name: 'Kod',
              params: 'counterpartyBankCode',
            },
            {
              name: 'Müxbir hesab (M/h)',
              params: 'counterpartyCorrespondentAccount',
            },
            {
              name: 'Hesablaşma hesabı (H/h)',
              params: 'counterpartySettlementAccount',
            },
            {
              name: 'S.W.I.F.T.',
              params: 'counterpartySwift',
            },
          ],
        }
      : null,
    {
      name: 'İxrac tarixi',
      params: 'exportedAt',
    },
  ];

  const handleModal = row => {
    setSelectedRow(row);
    toggleNameModal();
  };
  const toggleNameModal = () => {
    setNameModalVisible(prevSerialModalIsVisible => !prevSerialModalIsVisible);
  };
  const handleActiveTabChange = newTab => {
    setActiveTab(newTab);
  };
  const copy = async (e, item) => {
    e.stopPropagation();
    if (item.params.includes('Percentage')) {
      await navigator.clipboard.writeText(`$\{${item.params}} %`);
    } else if (item.paramsTwo) {
      await navigator.clipboard.writeText(
        `$\{${item.params}} $\{${item.paramsTwo}}`
      );
    } else {
      await navigator.clipboard.writeText(`$\{${item.params}}`);
    }

    message.success(`${item.name} parametri kopyalandı`);
  };
  useEffect(() => {
    if (!nameModalVisible) {
      setSelectedRow([]);
    }
  }, [nameModalVisible]);
  useEffect(() => {
    fetchMainCurrency();
    fetchSalesBuysForms();
  }, []);
  useEffect(() => {
    if (location?.state?.row) {
      // eslint-disable-next-line default-case
      switch (formType) {
        case 1:
          setType('Alış');
          break;
        case 2:
          setType('İdxal alışı');
          break;
        case 3:
          setType('Satış');
          break;
        case 4:
          setType('Geri alma');
          break;
        case 5:
          setType('Geri qaytarma');
          break;
        case 6:
          setType('Transfer');
          break;
        case 7:
          setType('Silinmə');
          break;
        case 8:
          setType('Bron');
          break;
        case 9:
          setType('Müqavilə');
          break;
      }
    }
  }, [location?.state?.row]);

  useEffect(() => {
    if (formType && salesBuysForms) {
      if (formType === 9 && contractsForms) {
        contractsForms.map(item => {
          if (item.type === formType) {
            setDocuments(
              item.docs.map(attachment => ({
                id: attachment.id,
                attachmentId: attachment.attachmentId,
                uid: attachment.id,
                name: attachment.name,
                invoiceType: item.type,
                thumbUrl: docVector,
                status: 'done',
              }))
            );
          }
        });
      } else {
        salesBuysForms.map(item => {
          if (item.type === location?.state?.row.type) {
            setDocuments(
              item.docs.map(attachment => ({
                id: attachment.id,
                attachmentId: attachment.attachmentId,
                uid: attachment.id,
                name: attachment.name,
                invoiceType: item.type,
                thumbUrl: docVector,
                status: 'done',
              }))
            );
          }
        });
      }
    }
  }, [formType, salesBuysForms, contractsForms]);
  const onDownloadFile = file => {
    downloadFileUrl(file.attachmentId, data => {
      window.open(data.url);
    });
  };

  const onRemoveFile = selectedFile => {
    swal({
      title: 'Silmək istədiyinizə əminsinizmi?',
      icon: 'warning',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteForms(selectedFile.id, () => {
          setDocuments(prevDocuments =>
            prevDocuments.filter(document => document.uid !== selectedFile.uid)
          );
        });
      }
    });
  };

  return (
    <ProWrapper>
      <ProModal
        maskClosable
        padding
        centered
        width={400}
        isVisible={nameModalVisible}
        handleModal={toggleNameModal}
      >
        <UpdateName
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          toggleNameModal={toggleNameModal}
        />
      </ProModal>
      <div className={styles.newOperationContainer}>
        <Row>
          <Col span={20} offset={2}>
            <Link
              to={{ pathname: returnUrl, from: 'document' }}
              className={styles.returnBackButton}
            >
              <MdKeyboardArrowLeft size={24} style={{ marginRight: 4 }} />
              Formaların siyahısı
            </Link>
            <h3 className={styles.title}>{`${type} sənəd forması`}</h3>
            <Col span={17}>
              <Tabs
                className={styles.tabs}
                type="card"
                activeKey={activeTab}
                onTabClick={handleActiveTabChange}
              >
                <TabPane
                  tab={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <TiDocumentAdd style={{ fontSize: '18px' }} />
                      <span style={{ marginLeft: '5px' }}>Sənəd əlavə et</span>
                    </div>
                  }
                  key="1"
                  forceRender
                >
                  <div className={styles.parentBox}>
                    <div className={styles.paper}>
                      <Spin spinning={false}>
                        <span className={styles.newOperationTitle}>
                          Sənədin əlavə edilməsi
                        </span>
                        <ProUploadWithDrop
                          documents={documents}
                          setDocuments={setDocuments}
                          formType={formType}
                        />
                        <span className={styles.newOperationTitle}>
                          Əlavə edilən sənədlər
                        </span>
                        <div
                          style={
                            documents?.length === 0
                              ? { height: '210px' }
                              : {
                                  height: '210px',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                }
                          }
                        >
                          {documents?.length === 0 ? (
                            <ProEmpty
                              style={{ margin: '20px 0' }}
                              description="Əlavə edilən sənədlər burada əks olunacaq"
                            />
                          ) : (
                            documents.map(item => (
                              <div
                                style={{
                                  flexWrap: 'nowrap',
                                }}
                                class="ant-upload-list ant-upload-list-picture"
                              >
                                <div
                                  style={{
                                    marginRight: '2px',
                                    width: '100%',
                                  }}
                                >
                                  <div
                                    style={{
                                      padding: '0 40px',
                                    }}
                                    class="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-picture"
                                  >
                                    <div class="ant-upload-list-item-info">
                                      <span>
                                        <a
                                          class="ant-upload-list-item-thumbnail"
                                          href={item.thumbUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <img
                                            src={item.thumbUrl}
                                            alt={item.name}
                                            class="ant-upload-list-item-image"
                                          />
                                        </a>
                                        <span
                                          class="ant-upload-list-item-name ant-upload-list-item-name-icon-count-2"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </span>
                                        <span class="ant-upload-list-item-card-actions picture">
                                          <button
                                            type="button"
                                            onClick={() => handleModal(item)}
                                            className={styles.pencil_btn}
                                          >
                                            <FaPencilAlt />
                                          </button>
                                          <a
                                            title="Download file"
                                            onClick={() => onDownloadFile(item)}
                                          >
                                            <i
                                              aria-label="icon: download"
                                              title="Download file"
                                              tabindex="-1"
                                              class="anticon anticon-download"
                                            >
                                              <svg
                                                viewBox="64 64 896 896"
                                                focusable="false"
                                                class=""
                                                data-icon="download"
                                                width="1em"
                                                height="1em"
                                                fill="currentColor"
                                                aria-hidden="true"
                                              >
                                                <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
                                              </svg>
                                            </i>
                                          </a>
                                          <a
                                            title="Remove file"
                                            onClick={() => onRemoveFile(item)}
                                          >
                                            <i
                                              aria-label="icon: delete"
                                              title="Remove file"
                                              tabindex="-1"
                                              class="anticon anticon-delete"
                                            >
                                              <svg
                                                viewBox="64 64 896 896"
                                                focusable="false"
                                                class=""
                                                data-icon="delete"
                                                width="1em"
                                                height="1em"
                                                fill="currentColor"
                                                aria-hidden="true"
                                              >
                                                <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
                                              </svg>
                                            </i>
                                          </a>
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Spin>
                    </div>
                  </div>
                </TabPane>
                {/* <TabPane tab="Əlavə xərclər" key="2" forceRender>
                <ProductionExpense
                  form={form}
                  id={id}
                  summaries={summaries}
                  returnUrl={returnUrl}
                  productionInfo={productionInfo}
                  changeCost={changeCost}
                />
              </TabPane> */}
              </Tabs>
            </Col>
            <Col span={6}>
              <div className={styles.parameters}>
                <h3 style={{ margin: ' 13px 0', fontWeight: '600' }}>
                  Parametrlər
                </h3>
                {parameters
                  ?.filter(item => item !== null)
                  .map(item => {
                    if (item?.childrens) {
                      if (item.id === 1) {
                        if (invoiceVisible) {
                          return (
                            <>
                              <button
                                className={styles.parameterBtn}
                                type="button"
                                onClick={e => e.preventDefault()}
                              >
                                <span>{item?.name}</span>
                                <Icon
                                  style={{
                                    position: 'absolute',
                                    right: '10px',
                                    fontSize: '20px',
                                  }}
                                  component={MdKeyboardArrowLeft}
                                  onClick={() =>
                                    setInvoiceVisible(!invoiceVisible)
                                  }
                                />
                              </button>
                              {item.id === 1 &&
                                item?.childrens.map(children => (
                                  <Tooltip
                                    placement="right"
                                    title="Üzərinə klikləyərək kopyalaya bilərsiniz."
                                  >
                                    <button
                                      className={styles.parameterBtn}
                                      type="button"
                                      onClick={e => copy(e, children)}
                                    >
                                      {children.name}
                                    </button>
                                  </Tooltip>
                                ))}
                            </>
                          );
                        }
                        return (
                          <button
                            className={styles.parameterBtn}
                            type="button"
                            onClick={e => e.preventDefault()}
                          >
                            <span>{item?.name}</span>
                            <Icon
                              style={{
                                position: 'absolute',
                                right: '10px',
                                fontSize: '20px',
                              }}
                              component={MdKeyboardArrowDown}
                              onClick={() => setInvoiceVisible(!invoiceVisible)}
                            />
                          </button>
                        );
                      }
                      if (item.id === 2) {
                        if (costVisible) {
                          return (
                            <>
                              <button
                                className={styles.parameterBtn}
                                type="button"
                                onClick={e => e.preventDefault()}
                              >
                                <span>{item?.name}</span>
                                <Icon
                                  style={{
                                    position: 'absolute',
                                    right: '10px',
                                    fontSize: '20px',
                                  }}
                                  component={MdKeyboardArrowLeft}
                                  onClick={() => setCostVisible(!costVisible)}
                                />
                              </button>
                              {item.id === 2 &&
                                item?.childrens.map(children => (
                                  <Tooltip
                                    placement="right"
                                    title="Üzərinə klikləyərək kopyalaya bilərsiniz."
                                  >
                                    <button
                                      className={styles.parameterBtn}
                                      type="button"
                                      onClick={e => copy(e, children)}
                                    >
                                      {children.name}
                                    </button>
                                  </Tooltip>
                                ))}
                            </>
                          );
                        }
                        return (
                          <button
                            className={styles.parameterBtn}
                            type="button"
                            onClick={e => e.preventDefault()}
                          >
                            <span>{item?.name}</span>
                            <Icon
                              style={{
                                position: 'absolute',
                                right: '10px',
                                fontSize: '20px',
                              }}
                              component={MdKeyboardArrowDown}
                              onClick={() => setCostVisible(!costVisible)}
                            />
                          </button>
                        );
                      }
                      if (item.id === 3) {
                        if (counterpartyVisible) {
                          return (
                            <>
                              <button
                                className={styles.parameterBtn}
                                type="button"
                                onClick={e => e.preventDefault()}
                              >
                                <span>{item?.name}</span>
                                <Icon
                                  style={{
                                    position: 'absolute',
                                    right: '10px',
                                    fontSize: '20px',
                                  }}
                                  component={MdKeyboardArrowLeft}
                                  onClick={() => setCounterpartyVisible(!counterpartyVisible)}
                                />
                              </button>
                              {item.id === 3 &&
                                item?.childrens.map(children => (
                                  <Tooltip
                                    placement="right"
                                    title="Üzərinə klikləyərək kopyalaya bilərsiniz."
                                  >
                                    <button
                                      className={styles.parameterBtn}
                                      type="button"
                                      onClick={e => copy(e, children)}
                                    >
                                      {children.name}
                                    </button>
                                  </Tooltip>
                                ))}
                            </>
                          );
                        }
                        return (
                          <button
                            className={styles.parameterBtn}
                            type="button"
                            onClick={e => e.preventDefault()}
                          >
                            <span>{item?.name}</span>
                            <Icon
                              style={{
                                position: 'absolute',
                                right: '10px',
                                fontSize: '20px',
                              }}
                              component={MdKeyboardArrowDown}
                              onClick={() => setCounterpartyVisible(!counterpartyVisible)}
                            />
                          </button>
                        );
                      }
                    }
                    return (
                      <Tooltip
                        placement="right"
                        title="Üzərinə klikləyərək kopyalaya bilərsiniz."
                      >
                        <button
                          className={styles.parameterBtn}
                          type="button"
                          onClick={e => copy(e, item)}
                        >
                          {item?.name}
                        </button>
                      </Tooltip>
                    );
                  })}
              </div>
            </Col>
          </Col>
        </Row>
      </div>
    </ProWrapper>
  );
};

const mapStateToProps = state => ({
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  mainCurrency: state.kassaReducer.mainCurrency,
  salesBuysForms: state.serialNumberPrefixReducer.salesBuysForms,
  contractsForms: state.serialNumberPrefixReducer.contractsForms,
});

export default connect(
  mapStateToProps,
  {
    fetchMainCurrency,
    downloadFileUrl,
    deleteForms,
    fetchSalesBuysForms,
  }
)(UpdateForm);
