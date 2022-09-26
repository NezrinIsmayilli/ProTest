/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { setSelectedProducts } from 'store/actions/sales-operation';
import { ProModal, ProInput } from 'components/Lib';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { Button } from 'antd';
import { toast } from 'react-toastify';
import styles from '../styles.module.scss';

const SerialNumber = ({ value, index, onRemove, usedSerialNumber }) => (
    <div className={styles.serialNumber}>
        <span>{value}</span>
        <Button
            disabled={usedSerialNumber?.includes(value)}
            shape="circle"
            icon="minus"
            onClick={() => onRemove(index)}
            className={styles.minusSerialNumberButton}
        />
    </div>
);

const SerialNumbers = ({
    selectedProducts,
    setSelectedProducts,
    selectedRow,
    isVisible,
    toggleModal,
}) => {
    const { id, usedSerialNumber } = selectedRow;
    const [serialNumberInput, setSerialNumberInput] = useState(undefined);
    const [serialNumbers, setSerialNumbers] = useState([]);

    const handleSerialNumberChange = e => {
        setSerialNumberInput(e.target.value);
    };

    const handleModal = () => {
        toggleModal();
    };
    const addSerialNumber = () => {
        if (!serialNumberInput) {
            return toast.error('Seriya nömrəsi qeyd edilməyib');
        }
        if (serialNumbers.includes(serialNumberInput.trim())) {
            return toast.error('Qeyd edilmiş seriya nömrəsi artıq mövcuddur.');
        }

        setSerialNumbers(prevSerialNumbers => [
            ...prevSerialNumbers,
            serialNumberInput.trim(),
        ]);
        setSerialNumberInput(undefined);
        document.getElementById('serialBox').focus();
    };

    const removeSerialNumber = index => {
        setSerialNumbers(prevSerialNumbers =>
            prevSerialNumbers.filter((_, serialIndex) => serialIndex !== index)
        );
    };

    const completeOperation = () => {
        const newSelectedProducts = selectedProducts.map(selectedProduct => {
            if (selectedProduct.id === id) {
                return {
                    ...selectedProduct,
                    invoiceQuantity: serialNumbers.length,
                    serialNumbers,
                };
            }
            return selectedProduct;
        });
        setSelectedProducts({ newSelectedProducts });
        toggleModal();
    };

    useEffect(() => {
        if (isVisible) {
            setSerialNumbers(selectedRow.serialNumbers || []);
        } else {
            setSerialNumberInput(undefined);
            setSerialNumbers([]);
        }
    }, [isVisible]);

    return (
        <ProModal
            maskClosable
            width={600}
            isVisible={isVisible}
            customStyles={styles.AddSerialNumbersModal}
            handleModal={handleModal}
        >
            <div className={styles.AddSerialNumbers}>
                <h2>Seriya nömrələri</h2>
                {serialNumbers?.some(item =>
                    usedSerialNumber?.includes(item)
                ) && (
                    <div className={styles.infoWarning}>
                        <p className={styles.fade}>
                            İstifadə olunmuş seriya nömrələrini silmək mümkün
                            deyil.
                        </p>
                        <div>
                            <ExclamationIcon />
                        </div>
                    </div>
                )}

                <div className={styles.serialNumberInputBox}>
                    <ProInput
                        id="serialBox"
                        className={styles.serialNumberInput}
                        placeholder="Yazın"
                        value={serialNumberInput}
                        onChange={handleSerialNumberChange}
                        onPressEnter={addSerialNumber}
                    />
                    <Button
                        onClick={addSerialNumber}
                        shape="circle"
                        icon="plus"
                        className={styles.customCircleButton}
                    />
                </div>
                <div className={styles.serialNumbers}>
                    {serialNumbers.map((value, index) => (
                        <SerialNumber
                            usedSerialNumber={usedSerialNumber}
                            index={index}
                            onRemove={removeSerialNumber}
                            value={value}
                            key={index}
                        />
                    ))}
                </div>
                <div className={styles.serialNumberFooter}>
                    <Button
                        onClick={completeOperation}
                        disabled={serialNumbers.length === 0}
                        size="large"
                        style={{ minWidth: 100 }}
                        type="primary"
                    >
                        Əlavə et
                    </Button>
                    <span>
                        Toplam: <strong>{serialNumbers.length}</strong>
                    </span>
                </div>
            </div>
        </ProModal>
    );
};

const mapStateToProps = state => ({
    selectedProducts: state.salesOperation.selectedProducts,
});
export const AddSerialNumbers = connect(
    mapStateToProps,
    {
        setSelectedProducts,
    }
)(SerialNumbers);
