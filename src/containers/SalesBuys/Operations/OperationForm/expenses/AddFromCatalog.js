/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal, ProSelect } from 'components/Lib';
import { setExpenses } from 'store/actions/sales-operation';
import { fetchExpenseCatalogs } from 'store/actions/expenseItem';
import { Button } from 'antd';
import styles from '../styles.module.scss';

const AddFromCatalogModal = ({
  isVisible,
  setExpenses,
  fetchExpenseCatalogs,
  expenseCatalogs,
  toggleModal,
  selectedExpenses,
}) => {
  const [selectedExpenseCatalogId, setSelectedExpenseCatalogId] = useState(
    undefined
  );
  const [expenseItems, setExpenseItems] = useState([]);
  const [selectedExpenseItemIds, setSelectedExpenseItemIds] = useState([]);

  const handleModal = () => {
    toggleModal();
  };

  const handleExpenseCatalogSelect = selectedCatalogId => {
    setSelectedExpenseCatalogId(selectedCatalogId);
  };

  const handleExpenseCatalogItemSelect = selectedExpenseItemIds => {
    setSelectedExpenseItemIds(prevSelectedExpenseItemIds => [
      ...prevSelectedExpenseItemIds,
      selectedExpenseItemIds[0],
    ]);
  };

  const handleSelectedExpenseItems = selectedExpenseItemIds => {
    setSelectedExpenseItemIds(selectedExpenseItemIds);
  };

  const clearModal = () => {
    setSelectedExpenseItemIds([]);
    setSelectedExpenseCatalogId(undefined);
  };
  const handleConfirmClick = () => {
    const newSelectedExpenses = expenseItems
      .filter(({ id }) => selectedExpenseItemIds.includes(id))
      .map(({ name, id, parentId }) => ({
        expense_name: name,
        id,
        parentId,
      }));
    setExpenses({
      newExpenses: [...selectedExpenses, ...newSelectedExpenses],
    });
    clearModal();
    toggleModal();
  };

  useEffect(() => {
    fetchExpenseCatalogs({}, ({ data }) => {
      if (data.root.length > 0) {
        const allExpenseItems = [].concat.apply(
          [],
          Object.values(data.children)
        );
        setExpenseItems(allExpenseItems);
      }
    });
  }, []);

  return (
    <ProModal
      maskClosable
      width={400}
      isVisible={isVisible}
      handleModal={handleModal}
      customStyles={styles.AddSerialNumbersModal}
    >
      <div className={styles.AddFromCatalog}>
        <h2>Kataloqdan seç</h2>

        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>
            Gömrük növlü xərc maddələri
          </span>
          <ProSelect
            allowClear={false}
            data={expenseCatalogs.root?.filter(({ type }) => type === 6) || []}
            value={selectedExpenseCatalogId}
            onChange={handleExpenseCatalogSelect}
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Xərc adları</span>
          <ProSelect
            value={[]}
            mode="multiple"
            onChange={handleExpenseCatalogItemSelect}
            data={
              selectedExpenseCatalogId
                ? expenseCatalogs.children[selectedExpenseCatalogId].filter(
                    ({ id }) =>
                      ![
                        ...selectedExpenseItemIds,
                        ...selectedExpenses.map(({ id }) => id),
                      ].includes(id)
                  )
                : []
            }
          />
        </div>
        <div className={styles.selectBox}>
          <span className={styles.selectLabel}>Seçilmiş xərc adları</span>
          <ProSelect
            value={selectedExpenseItemIds}
            mode="multiple"
            onChange={handleSelectedExpenseItems}
            data={expenseItems.filter(({ id }) =>
              selectedExpenseItemIds.includes(id)
            )}
          />
        </div>
        <div className={styles.button}>
          <Button
            type="primary"
            className={styles.confirmButton}
            onClick={handleConfirmClick}
          >
            Təsdiq et
          </Button>
        </div>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({
  expenseCatalogs: state.expenseItems.expenseCatalogs,
  selectedExpenses: state.salesOperation.selectedExpenses,
});

export const AddFromCatalog = connect(
  mapStateToProps,
  {
    setExpenses,
    fetchExpenseCatalogs,
  }
)(AddFromCatalogModal);
