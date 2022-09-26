import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import { Can } from 'components/Lib';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { fetchCatalogs, createCatalog } from 'store/actions/catalog';
import { permissions, accessTypes } from 'config/permissions';
import styles from '../styles.module.scss';

const { manage } = accessTypes;

const PopContent = ({ altClick, editClick, deleteClick, id, name }) => (
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
        editClick(id, { name });
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
      <span className={styles.trashIcon}>
        <FaTrash />
      </span>
    </button>
  </div>
);

function SubCatalogs(props) {
  const {
    isLoading,
    selectedItemId,
    disabledCreate,
    deleteClick,
    editClick,
    altClick,
    items,
    filters,
  } = props;
  return (
    <Fragment>
      <Can I={manage} a={permissions.stock_product_catalog} passThrough>
        {can =>
          can ? (
            <Button
              type="primary"
              block
              disabled={disabledCreate}
              size="large"
              className={styles.addCategoryButton}
              onClick={altClick}
            >
              Alt kataloq
              <FaPlus className={styles.buttonIcon} />
            </Button>
          ) : (
            <Button
              type="primary"
              block
              size="large"
              className={styles.addCategoryButton}
            >
              Alt kataloq
            </Button>
          )
        }
      </Can>
      <Spin size="large" className={styles.spinStyle} spinning={false}>
        <div className={styles.products}>
          <ul className={styles.productList}>
            {items?.sort().map(({ name, id }, index) =>
              filters.productCatalogs && filters.productCatalogs.length ? (
                filters.productCatalogs
                  .sort()
                  .map((selectedSubCatalogId, index) =>
                    id === selectedSubCatalogId ? (
                      <li
                        className={styles.productItem}
                        key={`${id}`}
                        style={{
                          background:
                            id === selectedItemId ? 'rgba(85,171,128,.15)' : '',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        <div>
                          <span className={styles.productItem_span}>
                            {index + 1} .{' '}
                          </span>{' '}
                          {name}
                        </div>
                        <Can I={manage} a={permissions.stock_product_catalog}>
                          <PopContent
                            {...{ deleteClick, editClick, id, name }}
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
                  }}
                >
                  <div>
                    <span className={styles.productItem_span}>
                      {index + 1} .{' '}
                    </span>{' '}
                    {name}
                  </div>
                  <Can I={manage} a={permissions.stock_product_catalog}>
                    <PopContent
                      {...{ deleteClick, editClick, id, name }}
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
});

export default connect(
  mapStateToProps,
  {
    fetchCatalogs,
    createCatalog,
  }
)(SubCatalogs);
