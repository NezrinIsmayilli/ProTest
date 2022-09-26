import React from 'react';
import { connect } from 'react-redux';
import {
	updateContractDetails,
	updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import { ProSelect, ProFormItem } from 'components/Lib';
import { Row, Col } from 'antd';
import styles from '../../styles.module.scss';

const ContractField = props => {
	const {
		form,
		contracts,
		contractsLoading,
		updateContractDetails,
		updateInvoiceCurrencyCode,
		contractDetails,
	} = props;
	const {
		getFieldError,
		getFieldDecorator,
		getFieldValue,
		setFieldsValue,
	} = form;
	const {
		isContractSelected,
		contractAmount,
		contractBalance,
		currencyCode,
	} = contractDetails;

	return (
		<Col xl={6} md={12} sm={12} xs={24}>
			<ProFormItem
				label="Müqavilə"
				help={getFieldError('contract')?.[0]}
				helperText={
					isContractSelected ? (
						<span className={styles.contractBalance}>
							Müqavilə limiti: { }{' '}
							<strong style={{ color: '#55AB80' }}>
								{Number(contractAmount)
									? `${Number(
										contractBalance
									)} ${currencyCode}`
									: 'Limitsiz'}
							</strong>
						</span>
					) : null
				}
			>
				{getFieldDecorator('contract', {
					getValueFromEvent: contractId => {
						const selectedContract =
							contracts.find(
								contract => contract.id === contractId
							) || {};
						const {
							amount,
							rest,
							currencycode,
							currency_id,
						} = selectedContract;
						if (contractId) {
							setFieldsValue({ currency: currency_id });
							updateInvoiceCurrencyCode(currencycode);
							updateContractDetails({
								isContractSelected: contractId,
								contractAmount: Number(amount),
								contractBalance: Number(rest),
								currencyCode: currencycode,
							});
						} else {
							updateContractDetails();
						}

						return contractId;
					},
					rules: [],
				})(
					<ProSelect
						loading={contractsLoading}
						disabled={contractsLoading || !getFieldValue('client')}
						placeholder="Seçin"
						data={contracts.filter(
							contract =>
								contract.direction === 2 &&
								contract.counterparty_id ===
								getFieldValue('client')
						)}
						keys={['contract_no']}
					/>
				)}
			</ProFormItem>
		</Col>
	);
};

const mapStateToProps = state => ({
	contractDetails: state.salesOperation.contractDetails,
	contractsLoading: state.loadings.fetchContracts,
	contracts: state.contractsReducer.contracts,
});

export default connect(
	mapStateToProps,
	{
		updateInvoiceCurrencyCode,
		updateContractDetails,
	}
)(ContractField);
