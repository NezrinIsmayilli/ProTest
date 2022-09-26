/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import styles from '../styles.module.scss';

function BarcodeDetails(props) {
  const { isLoading, product, fromTable } = props;
  const componentRef = useRef();
  const {
    barcode,
    barcodeConfigurationType,
    barcodeConfigurationShowNumber,
    barcodeConfigurationBarBackground,
    barcodeConfigurationBarHeight,
    barcodeConfigurationBarWidth,
    barcodeConfigurationFont,
    barcodeConfigurationFontOptions,
    barcodeConfigurationFontSize,
    barcodeConfigurationLineColor,
    barcodeConfigurationTextAlign,
    barcodeConfigurationTitle,
  } = product;

  useEffect(() => {
    if (barcodeConfigurationType === 2) {
      JsBarcode('#barcode', barcode, {
        format: 'ean13',
        displayValue: barcodeConfigurationShowNumber,
        background: barcodeConfigurationBarBackground,
        lineColor: barcodeConfigurationLineColor,
        fontSize:
          barcodeConfigurationFontSize === null
            ? 20
            : Number(barcodeConfigurationFontSize),
        height: barcodeConfigurationBarHeight,
        width: barcodeConfigurationBarWidth,
        textAlign: barcodeConfigurationTextAlign,
        fontOptions:
          barcodeConfigurationFontOptions === '1'
            ? 'bold'
            : barcodeConfigurationFontOptions === '2'
            ? 'italic'
            : '',
        font:
          barcodeConfigurationFont === '1'
            ? '"Lucida Console", "Courier New", monospace'
            : barcodeConfigurationFont === '2'
            ? 'Arial, Helvetica, sans-serif'
            : barcodeConfigurationFont === '3'
            ? '"Times New Roman", Times, serif'
            : barcodeConfigurationFont === '4'
            ? 'Impact, fantasy'
            : barcodeConfigurationFont === '5'
            ? 'Snell Roundhand, cursive'
            : '"Lucida Console", "Courier New", monospace',
      });
    } else {
      JsBarcode('#barcode', barcode, {
        format: 'CODE39',
      });
    }
  }, [barcodeConfigurationType, product]);

  return (
    <div ref={componentRef} style={{ padding: 16 }}>
      <Spin spinning={isLoading}>
      {fromTable ? 
      <div
          style={{
            marginBottom: 20,
          }}
        >
            <span style={{ marginBottom: '20px'}} className={styles.modalTitle}>
                  {product?.name}
            </span>
            </div>
          : null}
        <div
          style={{
            marginBottom: 20,
          }}
        >
          <span className={styles.modalTitle}>
            {barcode}
            {barcodeConfigurationType === 2 ? ' (EAN-13)' : ' (Sərbəst)'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '100px 0',
          }}
        >
          <p>{barcodeConfigurationTitle}</p>
          <svg id="barcode"></svg>
        </div>
      </Spin>
    </div>
  );
}

const mapStateToProps = state => ({
  product: state.productReducer.product,
  isLoading: state.productReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {}
)(BarcodeDetails);
