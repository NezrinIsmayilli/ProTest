import React, { useState, Fragment } from 'react';
import { connect } from 'react-redux';

import { Icon, Button, Dropdown, Menu, Modal, Tooltip } from 'antd';
import { Table as ProTable, ButtonRedOutline } from 'components/Lib';
import {
  AiOutlineDown,
  AiFillApple,
  AiFillWindows,
  BsInfoSquare,
  DiLinux,
  AiFillAndroid,
  FaAppStoreIos,
} from 'react-icons/all';
import moment from 'moment';
import styles from './styles.module.scss';

const Table = props => {
  const { appsData } = props;

  const [data, setData] = useState();
  const [details, setDetails] = useState(false);

  const menu = (
    <Menu>
      {data?.windowsURL === null ? null : (
        <Menu.Item
          key={12}
          style={{ fontSize: '15px', display: 'flex', alignItems: 'end' }}
        >
          <a
            // href={'https://prospect.az/downloads/win/ProCall%20Setup%201.1.5.exe'}
            href={data?.windowsURL}
          >
            <AiFillWindows
              style={{
                fontSize: '20px',
                marginBottom: '-4px',
                marginRight: '5px',
              }}
            />
            Windows
          </a>
        </Menu.Item>
      )}
      {data?.macURL === null ? null : (
        <Menu.Item
          key={12}
          style={{ fontSize: '15px', display: 'flex', alignItems: 'end' }}
        >
          <a href={data?.macURL}>
            <AiFillApple
              style={{
                fontSize: '20px',
                marginBottom: '-4px',
                marginRight: '5px',
              }}
            />
            Mac OS
          </a>
        </Menu.Item>
      )}
      {data?.linuxURL === null ? null : (
        <Menu.Item
          key={12}
          style={{ fontSize: '15px', display: 'flex', alignItems: 'end' }}
        >
          <a href={data?.linuxURL}>
            <DiLinux
              style={{
                fontSize: '20px',
                marginBottom: '-4px',
                marginRight: '5px',
              }}
            />
            Linux OS
          </a>
        </Menu.Item>
      )}

      {data?.androidURL === null ? null : (
        <Menu.Item
          key={12}
          style={{ fontSize: '15px', display: 'flex', alignItems: 'end' }}
        >
          <a href={data?.androidURL}>
            <AiFillAndroid
              style={{
                fontSize: '20px',
                marginBottom: '-4px',
                marginRight: '5px',
              }}
            />
            Android
          </a>
        </Menu.Item>
      )}

      {data?.iosURL === null ? null : (
        <Menu.Item
          key={12}
          style={{ fontSize: '15px', display: 'flex', alignItems: 'end' }}
        >
          <a href={data?.iosURL}>
            <FaAppStoreIos
              style={{
                fontSize: '20px',
                marginBottom: '-4px',
                marginRight: '5px',
              }}
            />
            IOS
          </a>
        </Menu.Item>
      )}
    </Menu>
  );

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 70,
      render: (_value, row, index) => index + 1,
    },
    {
      title: 'Tətbiqin adı',
      dataIndex: 'name',
      align: 'left',
      width: 100,
      render: (value, row) => (
        <div className={styles.appsName}>
          <Tooltip placement="topLeft" title={value}>
            <span>{value}</span>
          </Tooltip>

          <Button
            onClick={() => setDetails(true)}
            type="link"
            className={styles.infoButton}
          >
            <Icon component={BsInfoSquare} />
          </Button>
        </div>
      ),
    },
    {
      title: 'Son yenilənmə tarixi',
      dataIndex: 'latestReleaseDate',
      align: 'center',
      width: 250,
      render: (value, row) => moment(value).format('DD-MM-YYYY HH:mm:ss'),
    },
    {
      title: 'Seç',
      width: 200,
      align: 'center',
      render: () => (
        <Dropdown
          className={styles.newDropdownBtn}
          overlay={menu}
          trigger={['click']}
        >
          <ButtonRedOutline
            className={styles.downloadBtn}
            onClick={e => e.preventDefault()}
          >
            Yüklə <AiOutlineDown style={{ marginLeft: '5px' }} />
          </ButtonRedOutline>
        </Dropdown>
      ),
    },
  ];
  // on row click handle
  function onRowClickHandle(data) {
    return {
      onClick: () => {
        setData(data);
      },
    };
  }

  return (
    <Fragment>
      <div>
        <ProTable
          dataSource={appsData}
          columns={columns}
          scroll={{ x: false, y: false }}
          size="default"
          className={styles.invoiceTable}
          onRow={onRowClickHandle}
          rowKey={record => record.id}
        />
      </div>

      <Modal
        className={styles.customModal}
        visible={details}
        data={data}
        footer={null}
        width={500}
        onCancel={() => setDetails(false)}
      >
        <div className={styles.infoModal}>
          <div>
            <h3> Tətbiq haqqında məlumat</h3>
            <p>{data?.description}</p>
          </div>
          <div className={styles.infoBtn}>
            <ButtonRedOutline onClick={() => setDetails(false)}>
              <div style={{ display: 'flex', alignItems: 'center' }}>Bağla</div>
            </ButtonRedOutline>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};
const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {}
)(Table);
