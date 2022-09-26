import React, { useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { AddFormModal } from 'containers/Settings/#shared';
import styles from './styles.module.scss';
import RecievablesDetailsTab from './RecievablesDetailsTab';

const TableMenu = ({
    onFinClick,
    onInvConClick,
    onPaymentTableClick,
    hasCredit,
    invoiceType,
    endPrice,
}) => (
    <Menu>
        {/* <Menu.Item
        disabled={status === 3}
        onClick={() => history.push(`/finance/operations/add?id=${id}`)}
        key="0"
        className={styles.menuItem}
      >
        <span className={styles.menuText}>Ödəniş qəbul et</span>
      </Menu.Item> */}
        {Number(endPrice) > 0 ? (
            <Menu.Item key="1" onClick={onFinClick} className={styles.menuItem}>
                <span className={styles.menuText}>Maliyyə əməliyyatları</span>
            </Menu.Item>
        ) : null}
        {invoiceType !== 12 && invoiceType !== 13 ? (
            <Menu.Item
                key="2"
                onClick={onInvConClick}
                className={styles.menuItemEdit}
            >
                <span className={styles.menuText}>Qaimənin tərkibi</span>
            </Menu.Item>
        ) : null}
        {hasCredit ? (
            <Menu.Item
                key="3"
                onClick={onPaymentTableClick}
                className={styles.menuItemEdit}
            >
                <span className={styles.menuText}>Ödəniş cədvəli</span>
            </Menu.Item>
        ) : null}
    </Menu>
);

function RecievablesInvoiceAction({
    invoiceId,
    type,
    row,
    fromModal = false,
    forImport = false,
}) {
    const [details, setDetails] = useState(false);
    const [detailsTab, setDetailsTab] = useState(0);
    const handleDetailsModal = tabValue => {
        setDetails(!details);
        setDetailsTab(tabValue);
    };
    return (
        <div className={styles.productTableAction}>
            <Dropdown
                overlayStyle={{
                    boxShadow: '0px 2px 12px rgba(0,0,0,0.12)',
                }}
                getPopupContainer={() =>
                    document.getElementById(
                        fromModal
                            ? 'recievablesActionDropDownModal'
                            : 'recievablesActionDropDown'
                    )
                }
                overlay={
                    <TableMenu
                        status={row?.paymentStatus}
                        hasCredit={row?.creditId}
                        invoiceType={row?.invoiceType}
                        endPrice={row.endPrice}
                        id={invoiceId}
                        onFinClick={handleDetailsModal.bind(this, 0)}
                        onInvConClick={handleDetailsModal.bind(this, 1)}
                        onPaymentTableClick={handleDetailsModal.bind(this, 2)}
                    />
                }
                trigger={['click']}
            >
                <Button
                    className={styles.customCircleButton}
                    shape="circle"
                    icon="more"
                />
            </Dropdown>

            <AddFormModal
                width={1200}
                withOutConfirm
                onCancel={handleDetailsModal}
                visible={details}
            >
                <RecievablesDetailsTab
                    type={type}
                    row={row}
                    invoiceId={invoiceId}
                    setDetails={setDetails}
                    detailsTab={detailsTab}
                    setDetailsTab={setDetailsTab}
                    forImport={forImport}
                />
            </AddFormModal>
        </div>
    );
}

export default RecievablesInvoiceAction;
