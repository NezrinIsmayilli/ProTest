import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { updatePaymentDetails } from 'store/actions/sales-operation';
import { connect } from 'react-redux';
import styles from '../styles.module.scss';

const Buttons = props => {
    const {
        creatingInvoice = false,
        editingInvoice = false,
        form,
        handleNewInvoice,
        productionInfoLoading,
    } = props;

    const { submit } = form;

    const history = useHistory();
    return (
        <div className={styles.ActionButtons}>
            <Button
                type="primary"
                onClick={() => {
                    submit(() => {
                        handleNewInvoice();
                    });
                }}
                loading={
                    creatingInvoice || editingInvoice || productionInfoLoading
                }
                disabled={productionInfoLoading}
                style={{ marginRight: '10px' }}
            >
                Təsdiq et
            </Button>
            <Button
                onClick={() =>
                    history.push(
                        '/settings/initial-remains/initial-remains-warehouse'
                    )
                }
                style={{ marginLeft: '10px' }}
            >
                Imtina et
            </Button>
        </div>
    );
};

const mapStateToProps = state => ({
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
    creatingInvoice: state.loadings.createInvoiceOperation,
    editingInvoice: state.loadings.editInvoiceOperation,
    productionInfoLoading: state.loadings.productionInfo,
});
export const ActionButtons = connect(
    mapStateToProps,
    {
        updatePaymentDetails,
    }
)(Buttons);
