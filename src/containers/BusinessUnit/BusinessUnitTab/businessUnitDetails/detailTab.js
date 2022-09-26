/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Button, Spin } from 'antd';
import { connect } from 'react-redux';
import Detail from 'containers/Warehouse/Products/detail';
import styles from 'containers/Warehouse/styles.module.scss';

function DetailTab(props) {
  const { isDeletedForLog, details } = props;
  const {
    name,
    type,
    isDeleted,
    createdBy,
    createdAt,
    deletedAt,
    deletionReason,
  } = details;

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
          <span className={styles.modalTitle}>{name}</span>
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

        <Spin spinning={false}>
          <ul className={styles.detailsList}>
            <Detail primary="Blokun adı" secondary={name} />
            <Detail primary="Blokun növü" secondary={type || 'Bölmə'} />
            <Detail primary="Əlavə edilmə tarixi" secondary={createdAt} />
            <Detail primary="Əlavə edilib" secondary={createdBy} />
            <Detail
              primary="Status"
              secondary={
                !isDeleted || isDeletedForLog ? (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#F3B753',
                      background: '#FDF7EA',
                    }}
                  >
                    Aktiv
                  </span>
                ) : (
                  <span
                    className={styles.chip}
                    style={{
                      color: '#C4C4C4',
                      background: '#F8F8F8',
                    }}
                  >
                    Silinib
                  </span>
                )
              }
            />
            {isDeleted && !isDeletedForLog && (
              <>
                <Detail primary="Silinmə tarixi" secondary={deletedAt} />
                <Detail
                  primary="Silinmə səbəbi"
                  secondary={deletionReason || '-'}
                />
              </>
            )}
          </ul>
        </Spin>
      </div>
    </div>
  );
}
const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  {}
)(DetailTab);
