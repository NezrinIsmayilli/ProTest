import React from 'react';
import { connect } from 'react-redux';
import { HiOutlineDocumentDownload } from 'react-icons/all';
import { DetailButton } from 'components/Lib';
import docVector from 'assets/img/icons/fileWord.png';
import { Tooltip } from 'antd';
import styles from '../styles.module.scss';

const FormModal = props => {
  const {
    row,
    formsData,
    tenantId,
    token,
    baseURL,
    fromContract,
    handleDocumentDetailClick,
  } = props;

  return (
    <div className={styles.formModal}>
      <HiOutlineDocumentDownload style={{ width: '40px', height: '40px' }} />
      <h1 style={{ fontWeight: '600' }}>Sənədi yükləyin</h1>
      <div
        style={{
          display: 'flex',
          padding: '20px 0',
          width: '100%',
          justifyContent: 'space-around',
        }}
      >
        {formsData?.[0]?.docs.map(document => (
          <div className={styles.fileIcon}>
            <a
              style={{ display: 'flex', justifyContent: 'center' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                style={{ width: '100px' }}
                src={docVector}
                alt={document.name}
                className={styles.docImages}
              />
              <div className={styles.description}>
                <div className={styles.descriptionIcons}>
                  <DetailButton
                    className={styles.descriptionIcon}
                    onClick={() => handleDocumentDetailClick(row.id, document)}
                  />
                  <a
                    className={styles.descriptionIcon}
                    title="Download file"
                    href={
                      fromContract
                        ? `${baseURL}/sales/contracts/export/${row.id}?sampleDocumentId=${document?.id}&tenant=${tenantId}&token=${token}`
                        : `${baseURL}/sales/invoices/export/invoice/${row.id}?sampleDocumentId=${document?.id}&tenant=${tenantId}&token=${token}`
                    }
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
                        data-icon="download"
                        width="1.2em"
                        height="1.2em"
                        fill="#18cfab"
                        aria-hidden="true"
                      >
                        <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
                      </svg>
                    </i>
                  </a>
                </div>
              </div>
            </a>
            <span>
              {
                <Tooltip title={document.name}>
                  {document.name.length > 6
                    ? `${document.name.slice(0, 6)}...`
                    : document.name}{' '}
                </Tooltip>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedUnitPriceType: state.businessUnitReducer.selectedUnitPriceType,
  priceTypes: state.mehsulReducer.productPriceTypes,
});

export const Forms = connect(
  mapStateToProps,
  {}
)(FormModal);
