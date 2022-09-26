import React, { Fragment } from 'react';
import { Button, Spin } from 'antd';
import { Can } from 'components/Lib';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import styles from './styles.module.scss';

export const PopContent = ({ editClick, deleteClick, id, data }) => (
  <div className={styles.popContent}>
    {editClick && (
      <button
        style={{ marginRight: '5px' }}
        type="button"
        onClick={() => editClick(id, data)}
      >
        <span className={styles.editIcon}>
          <FaPencilAlt />
        </span>
      </button>
    )}
    {deleteClick && (
      <button type="button" onClick={() => deleteClick(id)}>
        <span className={styles.trashIcon} s>
          <FaTrash />
        </span>
      </button>
    )}
  </div>
);

export const CatalogItems = props => {
  const {
    isLoading = false,
    disabled = false,
    catalogName = 'Kataloqlar',
    catalogItems = [],
    catalogsCount = catalogItems.length,
    selectedItem = undefined,
    addClick = () => {},
    editClick,
    deleteClick,
    handleCatalogItemSelect = () => {},
    permissionKey = 'catalog',
    accessType = 'manage',
  } = props;

  return (
    <Fragment>
      <Can I={accessType} a={permissionKey} passThrough>
        {can =>
          can && !disabled ? (
            <Button
              type="primary"
              block
              size="large"
              className={styles.addCategoryButton}
              onClick={addClick}
            >
              {catalogName} ({catalogsCount || 0})
              <FaPlus className={styles.buttonIcon} />
            </Button>
          ) : (
            <Button
              type="primary"
              block
              size="large"
              className={styles.addCategoryButton}
            >
              {catalogName} ({catalogsCount || 0})
            </Button>
          )
        }
      </Can>
      <Spin size="large" className={styles.spinStyle} spinning={isLoading}>
        <div className={styles.products}>
          <ul className={styles.productList}>
            {catalogItems.map((catalogItem, index) => (
              <li
                className={styles.productItem}
                key={catalogItem.id}
                style={{
                  background:
                    catalogItem.id === selectedItem?.id
                      ? 'rgba(85,171,128,.15)'
                      : '',
                }}
                onClick={() => {
                  handleCatalogItemSelect(catalogItem.id, catalogItem);
                }}
              >
                <div>
                  {index + 1}. {catalogItem.name}
                </div>
                <Can I={accessType} a={permissionKey}>
                  <PopContent
                    id={catalogItem.id}
                    data={catalogItem}
                    editClick={editClick}
                    deleteClick={deleteClick}
                  />
                </Can>
              </li>
            ))}
          </ul>
        </div>
      </Spin>
    </Fragment>
  );
};
