import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { setSelectedUnitCashbox } from 'store/actions/businessUnit';
import { ProSelect, ProAsyncSelect, ProButton } from 'components/Lib';
import styles from '../../styles.module.scss';
import { fetchFilteredCashboxes } from 'store/actions/settings/kassa';

const UpdateCashboxModal = props => {
  const {
    fromTransfer,
    selectedUnitCashbox,
    setSelectedUnitCashbox,
    toggleRoleModal,
    selectedCashbox,
    setSelectedCashbox,
    cashboxType,
    setCashboxType,
    fetchFilteredCashboxes
  } = props;

  const [cashbox, setCashbox] = useState([]);
  const [transferCashbox, setTransferCashbox] = useState([]);
  const dispatch = useDispatch();

  const handleSelectCashbox = cashboxIds => {
    const [cashboxId] = cashboxIds;
    const newCashboxes = transferCashbox.find(
      cashbox => cashbox.id === cashboxId
    );
    if (fromTransfer) {
      setSelectedCashbox(prevSelectedCashbox => [
        ...prevSelectedCashbox,
        {
          ...newCashboxes,
          cashboxId: newCashboxes?.id,
          cashboxName: newCashboxes?.name,
        },
      ]);
    } else {
      setSelectedCashbox(prevSelectedCashbox => [
        ...prevSelectedCashbox,
        newCashboxes,
      ]);
    }
  };
  const handleSelectedCashboxChange = selectedCashboxIds => {
    const newCashboxes = transferCashbox.filter(cashbox =>
      selectedCashboxIds.includes(cashbox.id)
    );
    setSelectedCashbox(newCashboxes);
  };
  const handleCashboxType = id => {
    setCashboxType(id);
  };
  const handleCreateUnitCashbox = () => {
    const data = fromTransfer
      ? selectedUnitCashbox.map(selectedUnit => {
          if (selectedUnit.id === fromTransfer) {
            return {
              ...selectedUnit,
              transferCashboxes: [
                ...selectedUnit.transferCashboxes,
                ...selectedCashbox,
              ],
            };
          }
          return {
            ...selectedUnit,
          };
        })
      : selectedCashbox.map(selectedCashbox => ({
          id: selectedCashbox.id,
          name: selectedCashbox.name,
          type: selectedCashbox.type,
          transferCashboxes: [],
        }));
    dispatch(
      setSelectedUnitCashbox({
        newSelectedUnitCashbox: fromTransfer
          ? [...data]
          : [...data, ...selectedUnitCashbox],
      })
    );
    toggleRoleModal();
    setSelectedCashbox([]);
  };

  const ajaxCashboxSelectRequest = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
    const defaultFilters = {
        limit,
        page,
        search,
    };
    fetchFilteredCashboxes({
        filters: defaultFilters,
        onSuccessCallback: data => {
            const appendList = [];
            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!appendList.length);
            }
            if (stateReset) {
                setCashbox(appendList);
                setTransferCashbox(appendList);
            } else {
                setCashbox(cashbox.concat(appendList));
                setTransferCashbox(cashbox.concat(appendList));
            }
        },
    });
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Əlavə et</h2>
      <div>
        <span className={styles.selectLabel}>Hesab növləri</span>
        <ProSelect
          className={styles.selectBox}
          value={cashboxType}
          data={[
            { id: 1, name: 'Nəğd' },
            { id: 2, name: 'Bank Transferi' },
            { id: 3, name: 'Kart ödənişi' },
            { id: 4, name: 'Digər' },
          ]}
          onChange={handleCashboxType}
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Hesablar</span>
        <ProAsyncSelect
          disabled={!cashboxType}
          mode="multiple"
          value={[]}
          className={styles.selectBox}
          valueOnChange={handleSelectCashbox}
          selectRequest={ajaxCashboxSelectRequest}
          data={
            fromTransfer
              ? transferCashbox.filter(
                  item =>
                    item.type === cashboxType &&
                    ![
                      ...selectedCashbox.map(selectedItem => selectedItem.id),
                      ...selectedUnitCashbox
                        ?.find(unitCashbox => unitCashbox.id === fromTransfer)
                        .transferCashboxes.map(transfer => transfer.cashboxId),
                      ...selectedUnitCashbox.map(unitCashbox => unitCashbox.id),
                    ].includes(item.id)
                )
              : cashbox.filter(
                  item =>
                    item.type === cashboxType &&
                    ![
                      ...selectedCashbox.map(selectedItem => selectedItem.id),
                      ...selectedUnitCashbox.map(unitCashbox => unitCashbox.id),
                      ...[].concat(
                        ...selectedUnitCashbox
                          .filter(
                            unitCashbox =>
                              unitCashbox.transferCashboxes?.length > 0
                          )
                          .map(item =>
                            item.transferCashboxes.map(
                              ({ cashboxId }) => cashboxId
                            )
                          )
                      ),
                    ].includes(item.id)
                )
          }
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Seçilmiş hesablar</span>
        <ProSelect
          className={styles.selectBox}
          mode="multiple"
          onChange={handleSelectedCashboxChange}
          value={selectedCashbox.map(selected => selected.id)}
          data={selectedCashbox}
        />
      </div>
      <div>
        <ProButton
          disabled={selectedCashbox.length === 0}
          onClick={handleCreateUnitCashbox}
        >
          Təsdiq et
        </ProButton>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedUnitCashbox: state.businessUnitReducer.selectedUnitCashbox,
});

export const UpdateCashbox = connect(
  mapStateToProps,
  {
    setSelectedUnitCashbox,
    fetchFilteredCashboxes
  }
)(UpdateCashboxModal);
