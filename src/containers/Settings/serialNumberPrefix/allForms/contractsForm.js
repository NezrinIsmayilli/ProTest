import React, { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { Table, DetailButton, ProModal, Can } from 'components/Lib';
import { IoIosArrowDropleft, IoIosArrowDropright } from 'react-icons/io';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';

import { accessTypes, permissions } from 'config/permissions';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import styles from '../styles.module.scss';

const Contracts = props => {
  const {
    contractsForms,
    permissions: permissionKeys,
    // Loadings
  } = props;
  const baseURL =
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_DEV_API_URL;
  const token = cookies.get('_TKN_');
  const tenantId = cookies.get('__TNT__');
  const isReadOnly =
    permissionKeys.find(permission => permission.key === 'msk_documents')
      .permission === 1;
  const defaultData = [{ type: 9, docsCount: 0, docs: [] }];
  const [visible, setVisible] = useState(false);
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    if (!visible) {
      setDocs([]);
    }
  }, [visible]);
  const handleDetailClick = row => {
    const newDocs = row.docs.map(item => ({
      uri: `${baseURL}/attachments/${item?.attachmentId}/download?redirect=false&tenant=${tenantId}&token=${token}`,
      name: item.name,
    }));
    setVisible(true);
    setDocs(newDocs);
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 80,
      render: (value, item, index) => index + 1,
    },
    {
      title: `Sənədin adı`,
      dataIndex: 'type',
      align: 'left',
      render: (value, row) => (value === 9 ? 'Müqavilə' : '-'),
    },
    {
      title: `Forma sayı`,
      dataIndex: 'docs',
      align: 'left',
      render: value =>
        value ? (
          value.length > 1 ? (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              {value[0].name}
              <Tooltip
                placement="right"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {value.map(({ name }) => (
                      <span>{name}</span>
                    ))}
                  </div>
                }
              >
                <span className={styles.serialNumberCount}>{value.length}</span>
              </Tooltip>
            </div>
          ) : (
            value[0]?.name
          )
        ) : (
          '-'
        ),
    },
    {
      title: `Sənədlər`,
      dataIndex: 'id',
      align: 'center',
      render: (value, row) => (
        <DetailButton onClick={() => handleDetailClick(row)} />
      ),
    },
    {
      title: 'Sənəd əlavə et',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (value, row) => (
        <Can I={accessTypes.manage} a={permissions.msk_documents}>
          <Link
            to={{
              pathname: '/settings/msk/forms/add',
              state: { row },
            }}
          >
            <PlusIcon
              width="16px"
              height="16px"
              disabled={isReadOnly}
              className={
                isReadOnly ? styles.invoiceIconDisabled : styles.invoiceIcon
              }
            />
          </Link>
        </Can>
      ),
    },
  ];
  const onDownloadFile = file => {
    window.open(file.uri);
  };
  const myHeader = (state, previousDocument, nextDocument) => {
    if (!state.currentDocument || state.config?.header?.disableFileName) {
      return null;
    }
    return (
      <div className={styles.fileViewer}>
        <h2>{state.currentDocument.name || ''}</h2>
        <div className={styles.viewerBtns}>
          <a
            title="Download file"
            onClick={() => onDownloadFile(state.currentDocument)}
          >
            <i
              aria-label="icon: download"
              title="Download file"
              tabIndex="-1"
              className="anticon anticon-download"
            >
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                className={styles.downloadIcon}
                data-icon="download"
                width="1.2em"
                height="1.2em"
                fill="grey"
                aria-hidden="true"
              >
                <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
              </svg>
            </i>
          </a>
          <button
            onClick={previousDocument}
            disabled={state.currentFileNo === 0}
            className={styles.fileViewerBtn}
          >
            <IoIosArrowDropleft />
          </button>
          <button
            onClick={nextDocument}
            disabled={state.currentFileNo >= state.documents.length - 1}
            className={styles.fileViewerBtn}
          >
            <IoIosArrowDropright />
          </button>
        </div>
      </div>
    );
  };
  return (
    <>
      <ProModal
        maskClosable
        padding
        isVisible={visible}
        handleModal={() => setVisible(false)}
        width={900}
      >
        <DocViewer
          pluginRenderers={DocViewerRenderers}
          documents={docs}
          style={{ width: 820, height: 1000 }}
          config={{
            header: {
              overrideComponent: myHeader,
            },
          }}
        />
      </ProModal>
      <div>
        <Table
          columns={columns}
          dataSource={
            contractsForms?.length > 0
              ? defaultData.map(item => {
                if (
                  contractsForms.find(
                    salesBuys => item.type === salesBuys.type
                  )
                ) {
                  return contractsForms.find(
                    salesBuys => item.type === salesBuys.type
                  );
                }
                return item;
              })
              : defaultData
          }
          scroll={{ x: 'none' }}
        // loading={deleteTenantPersonRoleLoading || fetchTenantPersonRolesLoading}
        />
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  permissions: state.permissionsReducer.permissions,
  contractsForms: state.serialNumberPrefixReducer.contractsForms,
});

export const ContractsForm = connect(
  mapStateToProps,
  {}
)(Contracts);
