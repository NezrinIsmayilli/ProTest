/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon, Popover, Input, Spin, Tree } from 'antd';
import {
  DeleteModal,
  // Can
} from 'components/Lib';

// icons
import {
  FaPlus,
  FaMinus,
  FaPencilAlt,
  FaTrash,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

// utils
import { useEditableInput } from 'hooks';
// import { accessTypes } from 'config/permissions';

// styles
import styles from './styles.module.scss';

// const { manage } = accessTypes;

const { TreeNode } = Tree;

// options popup content - alt & edit & delete
const PopContent = ({ altClick, editClick, deleteClick }) => (
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
      type="button"
      onClick={e => {
        e.stopPropagation();
        editClick();
      }}
    >
      <span>
        <FaPencilAlt />
      </span>
      Redaktə et
    </button>
    {deleteClick && (
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          deleteClick();
        }}
      >
        <span>
          <FaTrash />
        </span>
        Sil
      </button>
    )}
  </div>
);

PopContent.propTypes = {
  altClick: PropTypes.any,
  editClick: PropTypes.any,
  deleteClick: PropTypes.any,
};

// options popup container and trigger button
const PopoverAndDots = ({ deleteClick, altClick, editClick }) => (
  <Popover
    placement="leftTop"
    content={<PopContent {...{ deleteClick, altClick, editClick }} />}
    trigger="focus"
  >
    <button
      type="button"
      className={styles.more}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <Icon type="more" />
    </button>
  </Popover>
);

PopoverAndDots.propTypes = {
  altClick: PropTypes.any,
  editClick: PropTypes.any,
  deleteClick: PropTypes.any,
};

function CategoryItem(props) {
  const {
    id,
    name,
    hasChild,
    selected,
    isRootItem,
    deleteClick,
    drawerToggle,
    addSubCategory,
    editSubcategory,
    itemType,
  } = props;

  // control editable state and input value
  const {
    editable,
    inputValue,
    inputChangeHandle,
    changeEditableHandle,
    setInputValue,
  } = useEditableInput(name);

  // submit edit on editable
  function submitEdit(e) {
    e.stopPropagation();
    changeEditableHandle();
    if (editable && inputValue) {
      editSubcategory(id, inputValue);
    } else {
      setInputValue(name);
    }
  }

  function cancel(e) {
    e.stopPropagation();
    changeEditableHandle();

    setInputValue(name);
  }

  // if ENTER pressed
  function onEnterKeyUp(event) {
    if (event.keyCode === 13) {
      if (editable) {
        submitEdit(event);
        return;
      }
      if (open) {
        submitAdd(event);
      }
    }
  }

  // sub categry add - handle
  const [{ open, value }, setSubMenu] = useState({ open: false, value: '' });

  function subMenuToggle() {
    setSubMenu(prevState => ({ open: !prevState.open, value: '' }));
  }

  function subMenuNameChangeHandle(e) {
    e.persist();
    setSubMenu(prevState => ({ ...prevState, value: e.target.value }));
  }

  function submitAdd(e) {
    e.stopPropagation();
    if (value && open) {
      addSubCategory(value, id);
    }
    subMenuToggle();
  }

  return (
    <>
      <div
        className={styles.item}
        role="button"
        tabIndex={0}
        style={{
          background: selected && !hasChild ? 'rgba(85,171,128,.15)' : '',
        }}
      >
        {/* if has sub categories show icon */}
        {hasChild && (
          <span className={styles.arrow}>
            {/* if selected */}
            {selected ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
          </span>
        )}
        <div className={styles.truncate}>
          {editable ? (
            <div className={`${styles.altInput} ${styles.editInput}`}>
              <Input
                placeholder="kataloqun adı"
                value={inputValue}
                onChange={e => {
                  e.stopPropagation();
                  inputChangeHandle(e);
                }}
                onKeyUp={onEnterKeyUp}
                autoFocus
                style={{
                  borderColor: !inputValue ? 'red' : '#dedede',
                }}
              />
              {/* edit submit */}
              <button type="button" onClick={submitEdit}>
                <FaCheck />
              </button>
              {/* edit cancel */}
              <button type="button" onClick={cancel}>
                <FaTimes />
              </button>
            </div>
          ) : (
            // non editable mode
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              {itemType === 1 ? (
                <FaPlus color="#55AB80" style={{ marginRight: '5px' }} />
              ) : (
                <FaMinus color="#FF716A" style={{ marginRight: '5px' }} />
              )}
              <div> {name}</div>
            </div>
          )}
        </div>

        <PopoverAndDots
          // altClick={(canHaveChild || isRootItem) && !open && subMenuToggle}
          editClick={isRootItem ? drawerToggle : changeEditableHandle}
          deleteClick={!hasChild && deleteClick}
        />
      </div>
      {/* if - sub cat add state active */}
      {open && (
        <div className={styles.altInput}>
          <Input
            placeholder="Alt kataloqun adı"
            value={value}
            onChange={e => {
              subMenuNameChangeHandle(e);
            }}
            onKeyUp={onEnterKeyUp}
            style={{
              borderColor: !value ? 'red' : '#dedede',
            }}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
          {/* add submit */}
          <button type="button" onClick={submitAdd}>
            <FaCheck />
          </button>
          {/* add cancel */}
          <button type="button" onClick={submitAdd}>
            <FaTimes />
          </button>
        </div>
      )}
    </>
  );
}

CategoryItem.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
  hasChild: PropTypes.bool,
  selected: PropTypes.bool,
  isRootItem: PropTypes.bool,
  deleteClick: PropTypes.func,
  drawerToggle: PropTypes.func,
  addSubCategory: PropTypes.func,
  editSubcategory: PropTypes.func,
};

export function ProTree(props) {
  const {
    data,
    loading,
    drawerToggle,
    setRootEditMode,
    addSubCategory,
    editSubcategory,
    deleteCatalog,
    fetchItemsByCatalog,
    setCatalogId,
    query,
    type,
    // permission,
  } = props;

  const { root, children } = data;

  // Category tree handle
  const [state, setState] = useState({
    expandedKeys: [],
    selectedKeys: [],
  });

  const onSelect = selectedKeys => {
    // alert(selectedKeys)
    setState({
      selectedKeys,
      expandedKeys: selectedKeys,
    });
  };

  // if selected category dont have children call get products action
  useEffect(() => {
    const catalogId = state.selectedKeys[0];
    const hasChild = children[catalogId] && children[catalogId].length > 0;
    if (!hasChild && catalogId) {
      fetchItemsByCatalog({ attribute: catalogId, query });
    } else {
      setCatalogId(null);
    }
  }, [state.selectedKeys[0]]);

  // TREE NODES
  const renderTreeNodes = data =>
    data.map(item => {
      const hasChild = children[item.id] && children[item.id].length > 0;

      const canHaveChild = !!root.find(cat => cat.id === item.parentId);

      const isRootItem = !!root.find(root => root.id === item.id);

      const onDrawerToggle = () => {
        setRootEditMode(item.id);
        drawerToggle(item.id);
      };

      if (hasChild) {
        return (
          <TreeNode
            key={item.id}
            type={type}
            title={
              <CategoryItem
                name={item.name}
                itemType={item.type}
                id={item.id}
                selected={+item.id === +state.selectedKeys[0]}
                {...{
                  hasChild,
                  canHaveChild,
                  isRootItem,
                  addSubCategory,
                  editSubcategory,
                }}
                drawerToggle={onDrawerToggle}
                type={type}
              />
            }
            dataRef={item}
          >
            {renderTreeNodes(children[item.id])}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          type={type}
          key={item.id}
          title={
            <CategoryItem
              name={item.name}
              id={item.id}
              {...{
                canHaveChild,
                isRootItem,

                addSubCategory,
                editSubcategory,
              }}
              type={type}
              drawerToggle={onDrawerToggle}
              deleteClick={DeleteModal(item.id, deleteCatalog)}
              selected={+item.id === +state.selectedKeys[0]}
              itemType={item.type}
            />
          }
        />
      );
    });

  return (
    <Spin size="large" className={styles.spinStyle} spinning={loading}>
      <Tree
        className={styles.customTree}
        blockNode
        expandedKeys={state.expandedKeys}
        autoExpandParent
        onSelect={onSelect}
        selectedKeys={state.selectedKeys}
        type={type}
      >
        {renderTreeNodes(root)}
      </Tree>
    </Spin>
  );
}

ProTree.propTypes = {
  data: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  drawerToggle: PropTypes.func,
  setRootEditMode: PropTypes.func,
  addSubCategory: PropTypes.func,
  editSubcategory: PropTypes.func,
  deleteCatalog: PropTypes.func,
  fetchItemsByCatalog: PropTypes.func,
  setCatalogId: PropTypes.func,
};
