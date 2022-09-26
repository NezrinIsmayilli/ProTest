import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { permissions, accessTypes } from 'config/permissions';
import { Can } from 'components/Lib';
import { Button, Spin } from 'antd';

// icons
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';

import styles from '../styles.module.scss';

const { manage } = accessTypes;

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
    <Can I={manage} a={permissions.msk_callcenter}>
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
          editClick(id, { name }, 'catalog');
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
    </Can>
  </div>
);

function ApplyTypes(props) {
  const {
    applyTypes,
    isLoading,
    selectedItemId,
    altClick,
    deleteClick,
    editClick,
    selectItem,
    applyTypesCount,
    permissionsList,
  } = props;

  const permissionsMsk = permissionsList.filter(
    permission => permission.key === 'msk_callcenter'
  );

  return (
    <Fragment>
      <Button
        type="primary"
        block
        size="large"
        className={styles.addCategoryButton}
        onClick={permissionsMsk[0].permission !== 1 ? altClick : null}
      >
        Müraciət növü ({applyTypesCount || 0})
        <Can I={manage} a={permissions.msk_callcenter}>
          <FaPlus className={styles.buttonIcon} />
        </Can>
      </Button>

      <Spin size="large" className={styles.spinStyle} spinning={isLoading}>
        <div className={styles.products}>
          <ul className={styles.productList}>
            {applyTypes.map(({ name, id }) => (
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
                <div>{name}</div>
                <PopContent
                  {...{
                    editClick,
                    deleteClick,
                    id,
                    name,
                  }}
                ></PopContent>
              </li>
            ))}
          </ul>
        </div>
      </Spin>
    </Fragment>
  );
}

const mapStateToProps = state => ({
  isLoading: state.applyTypesReducer.isLoading,
  applyTypesCount: state.applyTypesReducer.applyTypes.length,
  applyTypes: state.applyTypesReducer.applyTypes,
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  {}
)(ApplyTypes);
