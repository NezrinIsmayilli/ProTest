/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Modal, Spin } from 'antd';
import { usePrevious } from 'hooks';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { connect } from 'react-redux';

// actions
import {
  fetchExpenseCatalogs,
  setExpenseCatalogs,
} from 'store/actions/expenseCatalog';
import { fetchExpenseItems, setExpenseItems } from 'store/actions/expenseItem';

import styles from './catalog.module.scss';

const classNames = {
  enter: styles.rowEnter,
  enterActive: styles.rowEnterActive,
  exit: styles.rowExit,
  exitActive: styles.rowExitActive,
};

// CategoryTree
const CategoryTree = props => {
  const {
    expenseCatalogs,
    path,
    selected,
    open,
    close,
    isCatalogLoading,
  } = props;
  const { children, root } = expenseCatalogs;

  function loop(items) {
    return items.map(({ name, id, parentId }) => {
      const hasChild = children[id] && children[id].length > 0;
      // const canHaveChild = !!root.find(cat => cat.id === parentId);
      const isSelected = selected === id;

      // if id is in opening path [] render its children
      if (path.includes(id)) {
        return (
          <React.Fragment key={id}>
            <button
              key={id}
              className={styles.item}
              type="button"
              onClick={() => {
                // it is opened already send close handler
                close(parentId, id, name);
              }}
              style={{
                background: isSelected ? '#b4b4b4' : '',
                color: isSelected ? '#fff' : '',
              }}
            >
              {hasChild && (
                <span className={styles.arrow}>
                  {isSelected ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </span>
              )}
              <span>{name}</span>
            </button>

            <div style={{ marginLeft: 20 }}>{loop(children[id])}</div>
          </React.Fragment>
        );
      }

      return (
        <button
          key={id}
          className={styles.item}
          type="button"
          onClick={() => {
            open(hasChild, parentId, id, name);
          }}
          style={{
            background: isSelected ? '#b4b4b4' : '',
            color: isSelected ? '#fff' : '',
          }}
        >
          {hasChild && (
            <span className={styles.arrow}>
              {isSelected ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
            </span>
          )}
          <span>{name}</span>
        </button>
      );
    });
  }

  return (
    <Spin size="large" className={styles.spin} spinning={isCatalogLoading}>
      <div className={styles.categoryWrapper}>{loop(root)}</div>
    </Spin>
  );
};

// Expenses
const Expenses = props => {
  const {
    expenseItems = [],
    isExpenseItemsLoading,
    addToTempBucket,
    tempBucket,
    bucket,
  } = props;

  return (
    <Spin size="large" spinning={isExpenseItemsLoading} className={styles.spin}>
      {expenseItems.map(expense => {
        const { name, id } = expense;

        const isClicked =
          bucket.find(item => item.id === id) ||
          tempBucket.find(item => item.id === id);

        return (
          <button
            key={id}
            type="button"
            className={`${styles.product} ${isClicked ? styles.disabled : ''}`}
            onClick={() => !isClicked && addToTempBucket(expense)}
          >
            <span>{name}</span>

            <i>
              <FaPlus />
            </i>
          </button>
        );
      })}
    </Spin>
  );
};

// SelectedExpenses
const SelectedExpenses = props => {
  const { bucket, tempBucket, removeFromBucket, removeFromTempBucket } = props;
  const prevBucketLength = usePrevious(tempBucket.length);
  const scrollBottom = useRef(null);

  useEffect(() => {
    // only scroll to bottom when new child added, not while removed
    if (prevBucketLength < tempBucket.length) {
      scrollBottom.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [prevBucketLength, tempBucket]);

  return (
    <ul className={styles.selectedProducts}>
      <TransitionGroup component={null}>
        {bucket.map(({ name, id, catalogName }) => (
          <CSSTransition
            key={id}
            timeout={200}
            unmountOnExit
            classNames={classNames}
          >
            <li key={id} onClick={() => removeFromBucket(id)}>
              <div>
                <p>{catalogName}</p>
                {name}
              </div>
              <button type="button">
                <FaMinus />
              </button>
            </li>
          </CSSTransition>
        ))}
        {tempBucket.map(({ name, id, catalogName }) => (
          <CSSTransition
            key={id}
            timeout={200}
            unmountOnExit
            classNames={classNames}
          >
            <li key={id} onClick={() => removeFromTempBucket(id)}>
              <div>
                <p>{catalogName}</p>
                {name}
              </div>
              <button type="button">
                <FaMinus />
              </button>
            </li>
          </CSSTransition>
        ))}
      </TransitionGroup>
      {/* this is for scroll to the bottom when new child added */}
      <div ref={scrollBottom} style={{ height: 0 }}></div>
    </ul>
  );
};

/**
 *  Expenses Catalog Modal -> CategoryTree | Expenses | SelectedExpenses
 */

function ChooseFromCatalog(props) {
  const {
    // parent state
    bucket = [],
    isCatalogModalOpen,

    // parent actions
    closeCatalogModal,
    addSelectedExpensesToBucket,
    resetBucket,
    removeFromBucket,

    // redux state
    expenseCatalogs,
    expenseItems,
    isCatalogLoading,
    isExpenseItemsLoading,

    // redux actions
    fetchExpenseCatalogs,
    fetchExpenseItems,
    setExpenseItems,
    setExpenseCatalogs,
  } = props;

  const [state, setState] = useState({
    path: [], // for controlling category tree . open/close
    tempBucket: [], // temporary bucket, don't add products directly to main bucket until add btn clicked
    selected: null, // id of selected category
    catalogName: null,
  });

  const { path, tempBucket, selected, catalogName } = state;

  useEffect(() => {
    if (expenseCatalogs.root.length === 0 && isCatalogModalOpen) {
      fetchExpenseCatalogs({ filters: {} });
    }
  }, [isCatalogModalOpen]);

  //  reset catalog state onUnmount
  useEffect(
    () => () => {
      setExpenseItems({ data: [] });
      setExpenseCatalogs({ data: { root: [], children: {} } });
      resetBucket();
      setState({
        path: [],
        tempBucket: [],
        selected: null,
        catalogName: null,
      });
    },
    []
  );

  // open clicked category tree node
  function open(hasChild, parentId, id, name) {
    setState({
      ...state,
      path: hasChild ? [parentId, id] : state.path,
      selected: id,
      catalogName: name,
    });

    // check if it is last level category that
    // it can not have child and fetch its expenses by catagery id
    if (!hasChild && selected !== id) {
      fetchExpenseItems({ attribute: id });
    }
  }

  // close clicked category tree node
  function close(parentId, id) {
    setState(state => ({
      ...state,
      path: [parentId, ...state.path.filter(ID => id !== ID)],
      selected: null,
    }));
  }

  function addToTempBucket(expense) {
    const newExpense = {
      ...expense,
      catalogName,
      responsiblePerson: null,
      expenseAmount: null,
      currency: null,
    };

    setState({
      ...state,
      tempBucket: [...tempBucket, newExpense],
    });
  }

  function removeFromTempBucket(id) {
    setState({ ...state, tempBucket: tempBucket.filter(row => row.id !== id) });
  }

  // reset main and temp bucket expenses
  function resetAllBucket() {
    resetBucket();
    setState(state => ({ ...state, tempBucket: [], catalogName: null }));
  }

  function submitSelectedExpenses() {
    addSelectedExpensesToBucket(tempBucket);
    setState(state => ({ ...state, tempBucket: [] }));
  }

  return (
    <Modal
      title="Kataloq"
      visible={isCatalogModalOpen}
      centered
      width={900}
      onCancel={closeCatalogModal}
      wrapClassName={styles.modal}
      footer={null}
    >
      <>
        <Row gutter={24}>
          <Col span={8}>
            <div className={styles.colTitle}>Kategoriyalar</div>
            <div className={`scrollbar ${styles.treeWrapper}`}>
              {/*   CategoryTree   */}
              <CategoryTree
                {...{
                  expenseCatalogs,
                  selected,
                  path,
                  open,
                  close,
                  isCatalogLoading,
                }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.colTitle}>Maddələr</div>
            <div className={`scrollbar ${styles.treeWrapper}`}>
              {/*   Expenses List of current selected Category   */}
              <Expenses
                {...{
                  isExpenseItemsLoading,
                  addToTempBucket,
                  tempBucket,
                  bucket,
                  expenseItems,
                }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.colTitle}>
              Seçilmiş maddələr
              <button type="button" onClick={resetAllBucket}>
                Sıfırla
              </button>
            </div>
            <div className={`scrollbar ${styles.treeWrapper} ${styles.gray}`}>
              {/* Selected Expenses  */}
              <SelectedExpenses
                {...{
                  bucket,
                  tempBucket,
                  removeFromBucket,
                  removeFromTempBucket,
                }}
              />
            </div>
          </Col>
        </Row>

        {/*  custom modal Footer  */}
        <div className="ant-modal-footer">
          <div className={styles.tableFooter}>
            <p>
              Ümumi maddə sayı:{' '}
              <strong> {bucket.length + tempBucket.length} </strong>
            </p>
            <div>
              <Button size="large" onClick={closeCatalogModal}>
                İmtina
              </Button>
              <Button
                disabled={false}
                type="primary"
                htmlType="submit"
                size="large"
                onClick={submitSelectedExpenses}
              >
                Əlavə et
              </Button>
            </div>
          </div>
        </div>
      </>
    </Modal>
  );
}

const mapStateToProps = state => ({
  expenseCatalogs: state.expenseCatalogReducer.expenseCatalogs,
  isCatalogLoading: state.expenseCatalogReducer.isLoading,
  expenseItems: state.expenseItems.expenseItems,
  isExpenseItemsLoading: state.expenseItems.isLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchExpenseCatalogs,
    fetchExpenseItems,
    setExpenseCatalogs,
    setExpenseItems,
  }
)(ChooseFromCatalog);
