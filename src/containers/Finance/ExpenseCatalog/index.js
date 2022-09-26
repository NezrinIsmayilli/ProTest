/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import {
  deleteExpenseItem,
  fetchExpenseCatalogs,
} from 'store/actions/expenseItem';
import { deleteExpenseCatalog } from 'store/actions/expenseCatalog';
import { CatalogItems, UpdateExpenseModal } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';
import swal from '@sweetalert/with-react';

import ExpCatalogSideBar from './expCatalogSideBar';
import styles from './styles.module.scss';

function Expense(props) {
  const {
    isLoading,
    expenseItemDeleting,
    expenseCatalogDeleting,
    fetchExpenseCatalogs,
    creatingExpenseCatalog,
    expenseCatalogs,
    deleteExpenseItem,
    deleteExpenseCatalog,
  } = props;
  const [selectedExpenseCatalogIds, setSelectedExpenseCatalogIds] = useState(
    []
  );
  const [selectedExpenseItems, setSelectedExpenseItems] = useState([]);
  const [selectedExpenseTypes, setSelectedExpenseTypes] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState({
    id: undefined,
    name: undefined,
    expenseType: undefined,
  });
  const [defaultUpdateData, setDefaultUpdateData] = useState({
    id: undefined,
    parentId: undefined,
    parentName: undefined,
    expenseType: undefined,
    name: undefined,
    type: undefined,
    editType: undefined,
  });
  const [updateModalIsVisible, setUpdateModalIsVisible] = useState(false);

  const toggleUpdateModal = () => {
    setUpdateModalIsVisible(
      prevUpdateModalIsVisible => !prevUpdateModalIsVisible
    );
  };

  const handleSelectedCatalogChange = (id, catalog) => {
    setSelectedCatalog({
      id,
      name: catalog?.name,
      expenseType: catalog?.type,
    });
  };

  const handleExpenseCatalogUpdate = (id, data) => {
    if (data) {
      setDefaultUpdateData({
        id,
        name: data.name,
        parentId: undefined,
        parentName: undefined,
        expenseType: data.type,
        type: 'catalog',
        editType: 'edit',
      });
    } else {
      setDefaultUpdateData({
        id: undefined,
        name: undefined,
        parentId: undefined,
        parentName: undefined,
        type: 'catalog',
        editType: 'new',
      });
    }

    toggleUpdateModal();
  };

  const handleExpenseItemUpdate = (id, data) => {
    if (data) {
      setDefaultUpdateData({
        id,
        name: data.name,
        parentId: selectedCatalog.id,
        parentName: selectedCatalog.name,
        type: 'item',
        editType: 'edit',
      });
    } else {
      setDefaultUpdateData({
        id: undefined,
        name: undefined,
        parentId: selectedCatalog.id,
        parentName: selectedCatalog.name,
        type: 'item',
        editType: 'new',
      });
    }
    toggleUpdateModal();
  };

  const handleExpenseItemDelete = id => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteExpenseItem(id, fetchExpenseCatalogs);
      }
    });
  };
  const handleExpenseCatalogDelete = id => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteExpenseCatalog(id, () => {
          setSelectedCatalog({
            id: undefined,
          });
          fetchExpenseCatalogs();
        });
      }
    });
  };

  const onSuccessCatalogUpdate = () => {
    toggleUpdateModal();
    fetchExpenseCatalogs();
  };
  const onSuccessItemUpdate = () => {
    toggleUpdateModal();
    fetchExpenseCatalogs();
  };

  useEffect(() => {
    fetchExpenseCatalogs();
  }, []);

  const expFilter = expenseCatalogs?.root?.filter(({ type }) =>
    selectedExpenseTypes.length > 0 ? selectedExpenseTypes.includes(type) : true
  );

  useEffect(() => {
    if (expFilter?.length > 0) {
      if (creatingExpenseCatalog !== undefined) {
        const firstCatalog = expFilter[expFilter?.length - 1];
        handleSelectedCatalogChange(firstCatalog.id, firstCatalog);
      } else {
        const firstCatalog = expFilter[0];
        handleSelectedCatalogChange(firstCatalog.id, firstCatalog);
      }
    }
  }, [expFilter?.[expFilter?.length - 1]?.id, expFilter?.[0]?.id]);

  return (
    <>
      <ExpCatalogSideBar
        selectedExpenseTypes={selectedExpenseTypes}
        selectedExpenseCatalogIds={selectedExpenseCatalogIds}
        setSelectedExpenseCatalogIds={setSelectedExpenseCatalogIds}
        selectedExpenseItems={selectedExpenseItems}
        setSelectedExpenseItems={setSelectedExpenseItems}
        handleSelectedCatalogChange={handleSelectedCatalogChange}
        setSelectedExpenseTypes={setSelectedExpenseTypes}
      />

      <section className="aside scrollbar">
        <UpdateExpenseModal
          defaultUpdateData={defaultUpdateData}
          onSuccessCatalogUpdate={onSuccessCatalogUpdate}
          onSuccessItemUpdate={onSuccessItemUpdate}
          handleModal={toggleUpdateModal}
          isVisible={updateModalIsVisible}
        />
        <Row>
          <Col span={12} className={styles.boxContainer}>
            <CatalogItems
              isLoading={isLoading || expenseCatalogDeleting}
              catalogName="Xərc maddələri"
              permissionKey={permissions.expenses}
              accessType={accessTypes.manage}
              selectedItem={selectedCatalog}
              addClick={handleExpenseCatalogUpdate}
              editClick={handleExpenseCatalogUpdate}
              deleteClick={handleExpenseCatalogDelete}
              catalogItems={
                selectedExpenseCatalogIds.length > 0
                  ? expenseCatalogs.root.filter(
                      ({ id, type }) =>
                        selectedExpenseCatalogIds.includes(id) &&
                        (selectedExpenseTypes.length > 0
                          ? selectedExpenseTypes.includes(type)
                          : true)
                    )
                  : expenseCatalogs?.root?.filter(({ type }) =>
                      selectedExpenseTypes.length > 0
                        ? selectedExpenseTypes.includes(type)
                        : true
                    ) || []
              }
              handleCatalogItemSelect={handleSelectedCatalogChange}
            />
          </Col>
          <Col span={12} className={styles.boxContainer}>
            <CatalogItems
              isLoading={isLoading || expenseItemDeleting}
              catalogName="Xərc adları"
              disabled={!selectedCatalog.id}
              permissionKey={permissions.expenses}
              addClick={handleExpenseItemUpdate}
              editClick={handleExpenseItemUpdate}
              deleteClick={handleExpenseItemDelete}
              catalogItems={
                selectedCatalog.id
                  ? selectedExpenseItems.some(
                      expenseItem => expenseItem.parentId === selectedCatalog.id
                    )
                    ? expenseCatalogs.children[selectedCatalog.id].filter(
                        expenseItem =>
                          selectedExpenseItems
                            .map(expenseItem => expenseItem.id)
                            .includes(expenseItem.id)
                      )
                    : expenseCatalogs.children[selectedCatalog.id]
                  : []
              }
            />
          </Col>
        </Row>
      </section>
    </>
  );
}

const mapStateToProps = state => ({
  isLoading: state.loadings.expenseCatalogs,
  creatingExpenseCatalog: state.loadings.createExpenseCatalog,
  expenseItemDeleting: state.loadings.deleteExpenseItem,
  expenseCatalogDeleting: state.loadings.deleteExpenseCatalog,
  expenseCatalogs: state.expenseItems.expenseCatalogs,
  expenseCatalogsIsLoading: state.loadings.expenseCatalogs,
});

export default connect(
  mapStateToProps,
  { deleteExpenseItem, deleteExpenseCatalog, fetchExpenseCatalogs }
)(Expense);
