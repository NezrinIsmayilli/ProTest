/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';

import { TableSeparate, Can } from 'components/Lib';
import { Row, Col, Icon, Tooltip } from 'antd';

import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { deleteStructure } from 'store/actions/structure';

import { permissions, accessTypes } from 'config/permissions';

import swal from '@sweetalert/with-react';

import styles from './styles.module.scss';

function SectionsTable(props) {
  const {
    structuresFilteredData,
    deleteStructure,
    isLoading,
    openDrawer,
  } = props;

  const deleteHandle = useCallback(
    id => {
      swal({
        title: 'Silmək istədiyinizə əminsinizmi?',
        icon: 'warning',
        buttons: ['İmtina', 'Sil'],
        dangerMode: true,
      }).then(willDelete => {
        if (willDelete) {
          deleteStructure(id);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Bölmənin adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: value => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{value || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Aid olan struktur',
      dataIndex: 'parentName',
      key: 'parentName',
    },
    {
      title: null,
      render: (text, record) => (
        <Can I={accessTypes.manage} a={permissions.structure}>
          {() => (
            <p className={`${styles.noMargin} ${styles.txtCenter}`}>
              <a onClick={() => openDrawer(record.id)} className={styles.edit}>
                <FaPencilAlt size={18} />
              </a>
            </p>
          )}
        </Can>
      ),
    },
    {
      title: null,
      // <Can I={accessTypes.manage} a={permissions.structure}>
      //   {() => (
      //     <button
      //       type="button"
      //       className={styles.addRow}
      //       onClick={openDrawer}
      //       aria-label="plus"
      //     >
      //       <Icon type="plus-circle" />
      //     </button>
      //   )}
      // </Can>
      render: (text, record) => (
        <Can I={accessTypes.manage} a={permissions.structure}>
          {() => (
            <p className={`${styles.noMargin} ${styles.txtCenter}`}>
              <a
                onClick={() => deleteHandle(record.id)}
                className={styles.delete}
              >
                <FaTrash size={18} />
              </a>
            </p>
          )}
        </Can>
      ),
    },
  ];
  return (
    <div>
      <Row gutter={32}>
        <Col className="paddingBottom70">
          <TableSeparate
            loading={isLoading}
            dataSource={structuresFilteredData.filter(item => item.id !== 0)}
            columns={columns}
            rowKey={record => record.id}
          />
        </Col>
      </Row>
    </div>
  );
}

SectionsTable.propTypes = {};

const mapStateToProps = state => ({
  isLoading: state.structureReducer.isLoading,
  structuresFilteredData: state.structureReducer.structuresFilteredData,
});

export default connect(
  mapStateToProps,
  { deleteStructure }
)(SectionsTable);
