import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { permissions, accessTypes } from 'config/permissions';
import { Can } from 'components/Lib';
import styles from '../styles.module.scss';

const { manage } = accessTypes;

const PopContent = ({ altClick, editClick, deleteClick, id, name }) => (
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
          editClick(id, { name }, 'sub-catalog');
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

function SubApplyType(props) {
  const {
    isLoading,
    selectedItemId,
    disabledCreate,
    deleteClick,
    editClick,
    altClick,
    items,
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
        disabled={disabledCreate}
        size="large"
        className={styles.addCategoryButton}
        onClick={permissionsMsk[0].permission !== 1 ? altClick : null}
      >
        Alt müraciət növü ({items?.length || 0})
        <Can I={manage} a={permissions.msk_callcenter}>
          <FaPlus className={styles.buttonIcon} />
        </Can>
      </Button>
      <Spin size="large" className={styles.spinStyle} spinning={isLoading}>
        <div className={styles.products}>
          <ul className={styles.productList}>
            {items?.map(({ name, id }, index) => (
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
                <PopContent
                  {...{ deleteClick, editClick, id, name }}
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
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  {}
)(SubApplyType);
