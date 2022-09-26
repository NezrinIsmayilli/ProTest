import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import { Can } from 'components/Lib';

// icons
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';

// actions
import { createCatalog, fetchCatalogs } from 'store/actions/catalog';

import { permissions, accessTypes } from 'config/permissions';
import styles from '../styles.module.scss';

export const PopContent = ({
  altClick,
  editClick,
  deleteClick,
  id,
  isWithoutSerialNumber,
  isServiceType,
  name,
}) => (
  <div className={styles.popContent}>
    {altClick && (
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          altClick();
        }}
      >
        <span>
          <FaPlus />
        </span>
        Alt
      </button>
    )}
    <button
      style={{ marginRight: '5px' }}
      type="button"
      onClick={e => {
        e.stopPropagation();
        editClick(id, { isWithoutSerialNumber, isServiceType, name });
      }}
    >
      <span className={styles.editIcon}>
        <FaPencilAlt />
      </span>
    </button>
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        deleteClick(id);
      }}
    >
      <span className={styles.trashIcon} s>
        <FaTrash />
      </span>
    </button>
  </div>
);
const { manage } = accessTypes;

function Catalogs(props) {
  const {
    filters,
    filteredCatalogs,
    isLoading,
    selectedItemId,
    altClick,
    deleteClick,
    editClick,
    selectItem,
    catalogsCount,
  } = props;

  return (
    <Fragment>
      <Can I={manage} a={permissions.stock_product_catalog} passThrough>
        {can =>
          can ? (
            <Button
              type="primary"
              block
              size="large"
              className={styles.addCategoryButton}
              onClick={altClick}
            >
              Kataloqlar ({catalogsCount || 0})
              <FaPlus className={styles.buttonIcon} />
            </Button>
          ) : (
            <Button
              type="primary"
              block
              size="large"
              className={styles.addCategoryButton}
            >
              Kataloqlar ({catalogsCount || 0})
            </Button>
          )
        }
      </Can>
      <Spin size="large" className={styles.spinStyle} spinning={false}>
        <div className={styles.products}>
          <ul className={styles.productList}>
            {filteredCatalogs.root
              .sort()
              .map(
                ({ name, id, isWithoutSerialNumber, isServiceType }, index) =>
                  filters.rootCatalogs && filters.rootCatalogs.length ? (
                    filters.rootCatalogs
                      .sort()
                      .map((selectedCatalogId, index) =>
                        id === selectedCatalogId ? (
                          <li
                            className={styles.productItem}
                            key={`${id}`}
                            style={{
                              background:
                                id === selectedItemId
                                  ? 'rgba(85,171,128,.15)'
                                  : '',
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              selectItem({ id, editMode: false, name });
                            }}
                          >
                            <div>
                              <span className={styles.productItem_span}>
                                {index + 1} .
                              </span>
                              {name}
                            </div>
                            <Can
                              I={manage}
                              a={permissions.stock_product_catalog}
                            >
                              <PopContent
                                {...{
                                  editClick,
                                  deleteClick,
                                  id,
                                  isWithoutSerialNumber,
                                  isServiceType,
                                  name,
                                }}
                              ></PopContent>
                            </Can>
                          </li>
                        ) : null
                      )
                  ) : (
                    <li
                      className={styles.productItem}
                      key={`${id}`}
                      style={{
                        background:
                          id === selectedItemId ? 'rgba(85,171,128,.15)' : '',
                      }}
                      onClick={e => {
                        e.stopPropagation();

                        selectItem({ id, editMode: false, name });
                      }}
                    >
                      <div>
                        <span className={styles.productItem_span}>
                          {index + 1} .
                        </span>
                        {name}
                      </div>
                      <Can I={manage} a={permissions.stock_product_catalog}>
                        <PopContent
                          {...{
                            editClick,
                            deleteClick,
                            id,
                            isWithoutSerialNumber,
                            isServiceType,
                            name,
                          }}
                        ></PopContent>
                      </Can>
                    </li>
                  )
              )}
          </ul>
        </div>
      </Spin>
    </Fragment>
  );
}

const mapStateToProps = state => ({
  isLoading: state.catalogsReducer.isLoading,
  catalogs: state.catalogsReducer.catalogs,
  catalogsCount: state.catalogsReducer.filteredCatalogs.root.length,
  filteredCatalogs: state.catalogsReducer.filteredCatalogs,
});

export default connect(
  mapStateToProps,
  {
    createCatalog,
    fetchCatalogs,
  }
)(Catalogs);
