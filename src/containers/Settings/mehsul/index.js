import React, { useEffect } from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
// actions
import {
  fetchProductPriceTypes,
  fetchProductTypes,
  fetchSpecialParameters,
  fetchUnitOfMeasurements,
  fetchTaxTypes,
  fetchBarcodTypes,
  fetchFreeBarcodTypes,
} from 'store/actions/settings/mehsul';
// collapse tabs
import ProductTypes from './productTypes';
import UnitOfMeasurements from './unitOfMeasurements';
import ProductPriceTypes from './productPriceTypes';
import SpecialParameters from './specialParameters';
import BarcodTypes from './barcodTypes';
// import TaxTypes from './taxTypes';

function Mehsul(props) {
  const {
    fetchProductPriceTypes,
    fetchProductTypes,
    // fetchTaxTypes,
    fetchSpecialParameters,
    fetchUnitOfMeasurements,
    fetchBarcodTypes,
    fetchFreeBarcodTypes,
    productTypesCount,
    unitOfMeasurementsCount,
    specialParametersCount,
    productPriceTypesCount,
    // taxtTypesCount,
  } = props;

  useEffect(() => {
    Promise.all([
      fetchProductPriceTypes({limit:1000}),
      fetchProductTypes(),
      fetchSpecialParameters(),
      fetchUnitOfMeasurements(),
      fetchBarcodTypes(),
      fetchFreeBarcodTypes(),
      // fetchTaxTypes(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SettingsCollapse defaultActiveKey={['1']}>
        <SettingsPanel
          header={
            <CustomHeader title={`Məhsul tipləri (${productTypesCount})`} />
          }
          key="1"
        >
          <ProductTypes />
        </SettingsPanel>
        <SettingsPanel
          header={
            <CustomHeader
              title={`Ölçü vahidləri (${unitOfMeasurementsCount})`}
            />
          }
          key="2"
        >
          <UnitOfMeasurements />
        </SettingsPanel>
        <SettingsPanel
          header={<CustomHeader title="Barkod tipləri (2)" />}
          key="3"
        >
          <BarcodTypes />
        </SettingsPanel>
        <SettingsPanel
          header={
            <CustomHeader
              title={`Xüsusi parametrlər (${specialParametersCount})`}
            />
          }
          key="4"
        >
          <SpecialParameters />
        </SettingsPanel>
        {/* hide for now */}

        <SettingsPanel
          header={
            <CustomHeader
              title={`Qiymət tipləri (${productPriceTypesCount})`}
            />
          }
          key="5"
        >
          <ProductPriceTypes />
        </SettingsPanel>

        {/* <SettingsPanel
          header={<CustomHeader title={`Vergi növləri (${taxtTypesCount})`} />}
          key="5"
        >
          <TaxTypes />
        </SettingsPanel> */}
      </SettingsCollapse>
    </div>
  );
}

const getproductTypeLength = createSelector(
  state => state.mehsulReducer.productTypes,
  productTypesCount => productTypesCount.length
);
const getunitOfMeasurementsLength = createSelector(
  state => state.mehsulReducer.unitOfMeasurements,
  unitOfMeasurementsCount => unitOfMeasurementsCount.length
);
const getpspecialParametersLength = createSelector(
  state => state.mehsulReducer.specialParameters,
  specialParametersCount => specialParametersCount.length
);
const getproductPriceTypesLength = createSelector(
  state => state.mehsulReducer.productPriceTypes,
  productPriceTypesCount => productPriceTypesCount.length
);
const getTaxTypesLength = createSelector(
  state => state.mehsulReducer.taxTypes,
  taxtTypes => taxtTypes.length
);
const getBarcodeLength = createSelector(
  state => state.mehsulReducer.barcodTypes,
  barcodTypes => barcodTypes?.length
);
const getFreeBarcodeLength = createSelector(
  state => state.mehsulReducer.freeBarcodTypes,
  freeBarcodTypes => freeBarcodTypes?.length
);

const mapStateToProps = state => ({
  productTypesCount: getproductTypeLength(state),
  unitOfMeasurementsCount: getunitOfMeasurementsLength(state),
  specialParametersCount: getpspecialParametersLength(state),
  productPriceTypesCount: getproductPriceTypesLength(state),
  taxtTypesCount: getTaxTypesLength(state),
  barcodeCount: getBarcodeLength(state),
  freeBarcodeCount: getFreeBarcodeLength(state),
});

export default connect(
  mapStateToProps,
  {
    fetchProductPriceTypes,
    fetchProductTypes,
    fetchSpecialParameters,
    fetchUnitOfMeasurements,
    fetchTaxTypes,
    fetchBarcodTypes,
    fetchFreeBarcodTypes,
  }
)(Mehsul);
