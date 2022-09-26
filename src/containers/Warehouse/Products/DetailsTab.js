/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { getProductComposition } from 'store/actions/product';
import styles from '../styles.module.scss';
import ProductDetails from './productDetails';
import CompositionDetails from './compositionDetails';
import BarcodeDetails from './barcodeDetails';

function DetailsTab(props) {
  const {
    activeTab,
    setActiveTab,
    row,
    product,
    isLoading,

    getProductComposition,
  } = props;

  const [data, setData] = useState(null);

  const { id } = row;

  const getData = data => {
    setData(data.data);
  };

  useEffect(() => {
    if (id) {
      getProductComposition(id, getData);
    }
  }, [id]);

  const handleChangeTab = value => setActiveTab(value);

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return <ProductDetails row={row} />;
      case 1:
        return (
          <CompositionDetails data={data} row={row} activeTab={activeTab} />
        );
      case 2:
        return <BarcodeDetails data={data} row={row} />;
      default:
    }
  };

  return (
    <div>
      <div className={styles.detailsTab}>
        {(!data || data.length <= 0) && product.barcode === null ? null : (
          <>
            <Button
          size="large"
          type={activeTab === 0 ? 'primary' : ''}
          onClick={() => handleChangeTab(0)}
          disabled={isLoading}
        >
          Əlavə məlumat
            </Button>
            {data && data.length > 0 ? (
              <Button
                style={{ borderRadius: 0 }}
                size="large"
                type={activeTab === 1 ? 'primary' : ''}
                onClick={() => handleChangeTab(1)}
                disabled={isLoading}
              >
                Tərkibi ({data ? data?.length : 0})
              </Button>
            ) : null}
            {product.barcode !== null && (
              <Button
                style={
                  data && data.length > 0
                    ? { borderRadius: '0 4px 4px 0', borderLeft: 'none' }
                    : { borderRadius: 0, borderLeft: 'none' }
                }
                size="large"
                type={activeTab === 2 ? 'primary' : ''}
                onClick={() => handleChangeTab(2)}
                disabled={isLoading}
              >
                Barkod
              </Button>
            )}
          </>
        )}
      </div>

      {getTabContent()}
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.financeOperationsReducer.isLoading,
  product: state.productReducer.product,
});

export default connect(
  mapStateToProps,
  {
    getProductComposition,
  }
)(DetailsTab);
