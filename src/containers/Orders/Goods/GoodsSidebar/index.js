/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Sidebar, ProSidebarItem, ProSelect, ProSearch } from 'components/Lib';
import { Select, Checkbox, Icon } from 'antd';
import { fetchFilteredCatalogs } from 'store/actions/catalog';
import { setGoods, fetchGoods } from 'store/actions/goods';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import { useCatalog } from 'hooks';
import styles from './styles.module.scss';

const { Option } = Select;

const GoodsSidebar = props => {
  const {
    onFilter,
    measurements,
    handleChange,
    isLoading,
    filteredCatalogs,
    fetchFilteredCatalogs,
    selectedCounterparty,
    selectedProducts,
  } = props;

  const {
    parentCatalogs,
    childCatalogs,
    handleParentCatalogsChange,
    handleChildCatalogsChange,
    clearSelectedCatalogs,
  } = useCatalog();

  const handleMeasurementSelect = value => {
    onFilter('unitOfMeasurementIds', value);
  };

  const handleNameChange = name => {
    onFilter('q', name);
  };

  const handleSelectedChecbox = e => {
    if (e.target.checked && selectedProducts?.length) {
      onFilter('ids', selectedProducts.map(product => product.id));
    } else {
      onFilter('ids', null);
    }
    handleChange(1);
  };

  useEffect(() => {
    if (selectedCounterparty?.id) {
      fetchFilteredCatalogs({
        usedInInvoice: 1,
        partnerId: selectedCounterparty.isTenant
          ? null
          : selectedCounterparty.id,
      });
      onFilter(
        'partnerId',
        selectedCounterparty.isTenant ? null : selectedCounterparty.id
      );
      clearSelectedCatalogs();
    }
  }, [selectedCounterparty]);

  useEffect(() => {
    if (filteredCatalogs.root?.length > 0) {
      onFilter(
        'catalogIds',
        childCatalogs.map(childCatalog => childCatalog.id)
      );
      onFilter(
        'parentCatalogIds',
        parentCatalogs.map(parentCatalog => parentCatalog.id)
      );
      handleChange(1);
    }
  }, [parentCatalogs, childCatalogs]);

  return (
    <Sidebar title="Məhsullar">
      <ProSidebarItem>
        <Checkbox
          disabled={!selectedCounterparty}
          className={styles.checkbox}
          onChange={handleSelectedChecbox}
        >
          Seçilmiş məhsulları göstər
        </Checkbox>
      </ProSidebarItem>
      <ProSidebarItem label="Kateqoriya">
        <Select
          value={parentCatalogs.map(parentCatalog => parentCatalog.id)}
          mode="multiple"
          placeholder="Seçin"
          showArrow
          size="large"
          className={styles.select}
          allowClear
          style={{ marginTop: '8px' }}
          onChange={(newCatalogs, options) =>
            handleParentCatalogsChange(newCatalogs, options)
          }
          suffixIcon={<Icon component={DownArrow} />}
          disabled={!selectedCounterparty}
          filterOption={(input, option) =>
            option.props.children
              .replace('İ', 'I')
              .toLowerCase()
              .includes(input.replace('İ', 'I').toLowerCase())
          }
        >
          {filteredCatalogs.root?.map(catalog => (
            <Option
              key={catalog.id}
              value={catalog.id}
              className={styles.dropdown}
              catalog={catalog}
            >
              {catalog.name}
            </Option>
          ))}
        </Select>
      </ProSidebarItem>

      <ProSidebarItem label="Alt kateqoriya">
        <Select
          loading={isLoading}
          allowClear
          value={childCatalogs.map(childCatalog => childCatalog.id)}
          onChange={(newCatalogs, options) =>
            handleChildCatalogsChange(newCatalogs, options)
          }
          mode="multiple"
          placeholder="Seçin"
          suffixIcon={<Icon component={DownArrow} />}
          showArrow
          disabled={!parentCatalogs.length || !selectedCounterparty}
          className={styles.select}
          style={{ marginTop: '8px' }}
          size="large"
          filterOption={(input, option) =>
            option.props.children
              .replace('İ', 'I')
              .toLowerCase()
              .includes(input.replace('İ', 'I').toLowerCase())
          }
        >
          {parentCatalogs.map(parentCatalog =>
            filteredCatalogs.children[parentCatalog.id]?.map(subCatalog => (
              <Option
                key={subCatalog.id}
                value={subCatalog.id}
                id={subCatalog.id}
                className={styles.dropdown}
                catalog={subCatalog}
              >
                {subCatalog.name}
              </Option>
            ))
          )}
        </Select>
      </ProSidebarItem>

      <ProSidebarItem label="Məhsulun adı">
        <ProSearch
          onChange={e => {
            if (e.target.value === '') {
              onFilter('q', undefined)
            }
          }}
          disabled={!selectedCounterparty}
          onSearch={handleNameChange}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Ölçü vahidi">
        <ProSelect
          onChange={handleMeasurementSelect}
          loading={isLoading}
          mode="multiple"
          disabled={!selectedCounterparty}
          data={measurements}
        />
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  goods: state.goodsReducer.goods,
  filteredCatalogs: state.catalogsReducer.filteredCatalogs,
  catalog: state.catalogsReducer.catalog,
  isLoading: state.catalogsReducer.isLoading,
  actionLoading: state.catalogsReducer.actionLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchFilteredCatalogs, // actions/catalogs
    fetchGoods, // actions/goods
    setGoods, // actions/goods
  }
)(GoodsSidebar);
