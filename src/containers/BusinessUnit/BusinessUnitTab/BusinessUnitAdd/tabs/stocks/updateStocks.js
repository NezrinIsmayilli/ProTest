import React,{useState} from 'react';
import { connect, useDispatch } from 'react-redux';
import { setSelectedUnitStock } from 'store/actions/businessUnit';
import { ProSelect, ProAsyncSelect, ProButton } from 'components/Lib';
import styles from '../../styles.module.scss';
import { fetchFilteredStocks } from 'store/actions/stock';

const UpdateStocksModal = props => {
  const {
    fromTransfer,
    toggleRoleModal,
    setSelectedUnitStock,
    selectedUnitStock,
    selectedStocks,
    setSelectedStocks,
    fetchFilteredStocks
  } = props;

  const [stocks, setStocks] = useState([]);
  const [transferStocks, setTransferStocks] = useState([]);

  const dispatch = useDispatch();
  const handleSelectStock = stockIds => {
    const [stockId] = stockIds;
    const newStocks = transferStocks.find(stock => stock.id === stockId);
    if (fromTransfer) {
      setSelectedStocks(prevSelectedStocks => [
        ...prevSelectedStocks,
        { ...newStocks, stockId: newStocks?.id, stockName: newStocks?.name },
      ]);
    } else {
      setSelectedStocks(prevSelectedStocks => [
        ...prevSelectedStocks,
        newStocks,
      ]);
    }
  };
  const handleSelectedStockChange = selectedStockIds => {
    const newStocks = selectedStocks.filter(stock =>
      selectedStockIds.includes(stock.id)
    );
    setSelectedStocks(newStocks);
  };
  const handleCreateUnitStocks = () => {
    const data = fromTransfer
      ? selectedUnitStock.map(selectedUnit => {
          if (selectedUnit.id === fromTransfer) {
            return {
              ...selectedUnit,
              transferStocks: [
                ...selectedStocks,
                ...selectedUnit.transferStocks,
              ],
            };
          }
          return {
            ...selectedUnit,
          };
        })
      : selectedStocks.map(selectedStock => ({
          id: selectedStock.id,
          name: selectedStock.name,
          transferStocks: [],
        }));

    dispatch(
      setSelectedUnitStock({
        newSelectedUnitStock: fromTransfer
          ? [...data]
          : [...data, ...selectedUnitStock],
      })
    );
    toggleRoleModal();
    setSelectedStocks([]);
  };

  const ajaxStocksSelectRequest = (
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
    fetchFilteredStocks({
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
                setStocks(appendList);
                setTransferStocks(appendList);
            } else {
              setStocks(stocks.concat(appendList));
              setTransferStocks(transferStocks.concat(appendList))
            }
        },
    });
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Əlavə et</h2>
      <div>
        <span className={styles.selectLabel}>Anbarlar</span>
        <ProAsyncSelect
          mode="multiple"
          value={[]}
          className={styles.selectBox}
          selectRequest={ajaxStocksSelectRequest}
          valueOnChange={handleSelectStock}
          data={
            fromTransfer
              ? transferStocks.filter(
                  stock =>
                    ![
                      ...selectedStocks?.map(selectedStock => selectedStock.id),
                      ...selectedUnitStock
                        ?.find(unitStocks => unitStocks.id === fromTransfer)
                        .transferStocks.map(transfer => transfer.stockId),
                      ...selectedUnitStock.map(unitStock => unitStock.id),
                    ].includes(stock.id)
                )
              : stocks.filter(
                  stock =>
                    ![
                      ...selectedStocks.map(selectedStock => selectedStock.id),
                      ...selectedUnitStock.map(unitStock => unitStock.id),
                      ...[].concat(
                        ...selectedUnitStock
                          .filter(
                            unitStock => unitStock.transferStocks?.length > 0
                          )
                          .map(item =>
                            item.transferStocks.map(({ stockId }) => stockId)
                          )
                      ),
                    ].includes(stock.id)
                )
          }
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Seçilmiş anbarlar</span>
        <ProSelect
          className={styles.selectBox}
          mode="multiple"
          onChange={handleSelectedStockChange}
          value={selectedStocks.map(selected => selected.id)}
          data={selectedStocks}
        />
      </div>
      <div>
        <ProButton
          disabled={selectedStocks.length === 0}
          onClick={handleCreateUnitStocks}
        >
          Təsdiq et
        </ProButton>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedUnitStock: state.businessUnitReducer.selectedUnitStock,
});

export const UpdateStocks = connect(
  mapStateToProps,
  {
    setSelectedUnitStock,
    fetchFilteredStocks
  }
)(UpdateStocksModal);
