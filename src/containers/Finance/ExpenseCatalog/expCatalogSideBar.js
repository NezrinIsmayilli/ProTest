import React from 'react';
import { connect } from 'react-redux';
import { Select, Icon } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import { Sidebar, ProSidebarItem, ProSelect } from 'components/Lib';
import { setExpenseCatalogId } from 'store/actions/expenseItem';
import { expenseTypes } from 'utils';
import styles from '../Operations/styles.module.scss';

function ExpCatalogSideBar(props) {
  const {
    expenseCatalogs,
    selectedExpenseTypes,
    selectedExpenseCatalogIds,
    setSelectedExpenseCatalogIds,
    handleSelectedCatalogChange,
    selectedExpenseItems,
    setSelectedExpenseItems,
    setSelectedExpenseTypes,
  } = props;

  const handleChangeCategory = selectedCatalogIds => {
    handleSelectedCatalogChange(undefined);
    setSelectedExpenseCatalogIds(selectedCatalogIds);
    setSelectedExpenseItems(
      selectedExpenseItems.filter(selectedExpenseItem =>
        selectedCatalogIds.includes(selectedExpenseItem.parentId)
      )
    );
  };

  const handleExpenseItemChange = (expenseItemIds, events) => {
    setSelectedExpenseItems(events.map(event => event.props.catalog));
  };

  const handleSelectedExpenseTypes = types => {
    handleSelectedCatalogChange(undefined);
    setSelectedExpenseTypes(types);
  };

  return (
    <Sidebar title="Xərc maddələri">
      <div className={styles.Sidebar}>
        <ProSidebarItem label="Xərc növü">
          <ProSelect
            mode="multiple"
            onChange={handleSelectedExpenseTypes}
            data={expenseTypes}
            keys={['label']}
          />
        </ProSidebarItem>
        <ProSidebarItem label="Xərc maddəsi">
          <ProSelect
            mode="multiple"
            onChange={handleChangeCategory}
            value={selectedExpenseCatalogIds}
            data={
              expenseCatalogs?.root?.filter(({ type }) =>
                selectedExpenseTypes.length > 0
                  ? selectedExpenseTypes.includes(type)
                  : true
              ) || []
            }
          />
        </ProSidebarItem>
        <ProSidebarItem label="Xərcin adı">
          <Select
            mode="multiple"
            placeholder="Seçin"
            allowClear
            showArrow
            disabled={!selectedExpenseCatalogIds.length}
            value={selectedExpenseItems.map(expenseItem => expenseItem.id)}
            className={styles.select}
            size="large"
            onChange={handleExpenseItemChange}
            suffixIcon={<Icon component={DownArrow} />}
            filterOption={(input, option) =>
              option.props.children
                .replace('İ', 'I')
                .toLowerCase()
                .includes(input.replace('İ', 'I').toLowerCase())
            }
          >
            {selectedExpenseCatalogIds?.map(selectedExpenseCatalogId =>
              expenseCatalogs.children[selectedExpenseCatalogId]?.map(
                expenseItem => (
                  <Select.Option
                    key={expenseItem.id}
                    value={expenseItem.id}
                    className={styles.dropdown}
                    catalog={expenseItem}
                  >
                    {expenseItem.name}
                  </Select.Option>
                )
              )
            )}
          </Select>
        </ProSidebarItem>
      </div>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  expenseCatalogs: state.expenseItems.expenseCatalogs,
});
export default connect(
  mapStateToProps,
  { setExpenseCatalogId }
)(ExpCatalogSideBar);
