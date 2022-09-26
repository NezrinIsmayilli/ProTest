import React, {useState} from 'react';
import { connect, useDispatch } from 'react-redux';
import { setSelectedUnitPriceType } from 'store/actions/businessUnit';
import { ProSelect, ProAsyncSelect, ProButton } from 'components/Lib';
import styles from '../../styles.module.scss';
import { fetchFilteredProductPriceTypes } from 'store/actions/settings/mehsul';

const UpdatePriceTypeModal = props => {
  const {
    isLoading,
    setSelectedUnitPriceType,
    selectedUnitPriceType,
    toggleRoleModal,
    selectedPriceTypes,
    setSelectedPriceTypes,
    defaultPriceType,
    fetchFilteredProductPriceTypes
  } = props;

  const [priceTypes, setPriceTypes] = useState([]);
  const dispatch = useDispatch();
  const handleSelectPriceType = priceTypeIds => {
    const [priceTypeId] = priceTypeIds;
    const newPriceTypes = priceTypes.find(
      priceType => priceType.id === priceTypeId
    );
    setSelectedPriceTypes(prevSelectedPriceTypes => [
      ...prevSelectedPriceTypes,
      newPriceTypes,
    ]);
  };
  const handleSelectedPriceTypeChange = selectedPriceTypeIds => {
    const newPriceTypes = selectedPriceTypes.filter(priceType =>
      selectedPriceTypeIds.includes(priceType.id)
    );
    setSelectedPriceTypes(newPriceTypes);
  };
  const handleCreateUnitPriceType = () => {
    const data = selectedPriceTypes.map(selectedPriceType => ({
      priceTypeId: selectedPriceType.id,
      priceTypeName: selectedPriceType.name,
    }));
    dispatch(
      setSelectedUnitPriceType({
        newSelectedUnitPriceType: [...data, ...selectedUnitPriceType],
      })
    );
    toggleRoleModal();
    setSelectedPriceTypes([]);
  };

  const ajaxPriceTypesSelectRequest = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
    const defaultFilters = {
        limit,
        page,
        search,
    };
    fetchFilteredProductPriceTypes({
        filters: defaultFilters,
        onSuccessCallback: data => {
            const appendList = [];
            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setPriceTypes(appendList);
            } else {
              setPriceTypes(priceTypes.concat(appendList));
            }
        },
    });
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Əlavə et</h2>
      <div>
        <span className={styles.selectLabel}>Qiymət tipləri</span>
        <ProAsyncSelect
          loading={isLoading}
          mode="multiple"
          value={[]}
          className={styles.selectBox}
          selectRequest={ajaxPriceTypesSelectRequest}
          valueOnChange={handleSelectPriceType}
          data={priceTypes.filter(
            priceType =>
              ![
                ...selectedPriceTypes.map(
                  selectedPriceType => selectedPriceType.id
                ),
                ...selectedUnitPriceType.map(
                  unitPriceType => unitPriceType.priceTypeId
                ),
                ...defaultPriceType.map(
                  unitPriceType => unitPriceType.priceTypeId
                ),
              ].includes(priceType.id)
          )}
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Seçilmiş qiymət tipləri</span>
        <ProSelect
          className={styles.selectBox}
          mode="multiple"
          onChange={handleSelectedPriceTypeChange}
          value={selectedPriceTypes.map(selected => selected.id)}
          data={selectedPriceTypes}
        />
      </div>
      <div>
        <ProButton
          disabled={selectedPriceTypes.length === 0}
          onClick={handleCreateUnitPriceType}
        >
          Təsdiq et
        </ProButton>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedUnitPriceType: state.businessUnitReducer.selectedUnitPriceType,
  priceTypes: state.mehsulReducer.productPriceTypes,
});

export const UpdatePriceType = connect(
  mapStateToProps,
  {
    setSelectedUnitPriceType,
    fetchFilteredProductPriceTypes
  }
)(UpdatePriceTypeModal);
