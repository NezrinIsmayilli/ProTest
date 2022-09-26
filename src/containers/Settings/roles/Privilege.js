/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Row, Col, Spin, Collapse } from 'antd';
import { ProSelect, Table, ProEmpty,ProAsyncSelect } from 'components/Lib';

import {
	fetchRoles,
	fetchFeaturesByRoleId,
	changeRolePermissionByRoleId,
	resetRolesFeaturesData,
} from 'store/actions/settings/roles';

import { groupByKey, featuresNamesByGroupKey } from 'utils';

import style from './styles.module.scss';

const customPanelStyle = {
	background: '#e8e8e8',
	borderRadius: 4,
	marginBottom: 8,
	border: 0,
	overflow: 'hidden',
};

const readable_permissions = [
	'stocks_products_price',
	'stock_report_average_value',
	'stock_report_total',
	'stock_report_details_cost',
	'stock_report_details_cost_main',
	'stock_report_details_cost_total',
	'sales_operations_sales_from_invoices',
	'stock_report_average_value1',
	'stock_report_average_value2',
	'sales_operations_rfc_from_invoices',
	'sales_operations_rts_from_invoices',
	'sales_sold_items_cost',
	'sales_sold_items_cost_main',
	'sales_sold_items_cost_main_total',
	'sales_purchased_items_price_per_item',
	'sales_purchased_items_total_price',
	'sales_purchased_items_discount',
	'sales_purchased_items_endprice',
	'sales_purchased_items_per_item_endprice',
	'sales_purchased_items_main_currency',
	'sales_purchased_items_details',
	'sales_sold_items_margin',
	'projobs_create_new_vacancy',
	'projobs_create_new_training',
];
const permissionsVariants = [
	{
		id: 0,
		name: 'Gizlətmək',
	},
	{
		id: 1,
		name: 'Görmək',
	},
	{
		id: 2,
		name: 'Tam',
	},
];

const RenderPermissionSelect = ({
	permission,
	roleId,
	feature,
	changeRolePermissionByRoleId,
	featuresLoading,
}) => {
	function onSelect(value) {
		changeRolePermissionByRoleId(roleId, {
			feature,
			permission: value,
		});
	}

	return (
		<div className={style.permissionSelectContainer}>
			<div className={style.permissionSelect}>
				{featuresLoading ? null : (
					<ProSelect
						style={{ marginBottom: 0 }}
						getPopupContainer={null}
						data={
							readable_permissions.includes(feature)
								? permissionsVariants.filter(
									permissionVariant =>
										permissionVariant.id !== 1
								)
								: permissionsVariants
						}
						defaultValue={
							permission === 0
								? permission
								: permission || undefined
						}
						onSelect={onSelect}
						placeholder="Hüququ seçin"
						size="default"
						allowClear={false}
					/>
				)}
			</div>
		</div>
	);
};

function Privilege(props) {
	const {
		rolesLoading,
		featuresLoading,
		groupedFeatures,
		// actions
		fetchRoles,
		fetchFeaturesByRoleId,
		changeRolePermissionByRoleId,
		resetRolesFeaturesData,
		features,
	} = props;
	const [selectedRole, setSelectedRole] = useState(undefined);
	const [roles, setRoles] = useState([]);

	// reset data
	useEffect(() => () => resetRolesFeaturesData(), []);


	useEffect(() => {
		console.log('features', features);
	}, [features]);

	useEffect(() => {
		if (selectedRole) {
			fetchFeaturesByRoleId(selectedRole);
		}
	}, [selectedRole]);

	const ajaxRolesSelectRequest = (
		page = 1,
		limit = 20,
		search = '',
		stateReset = 0,
		onSuccessCallback
	) => {
		const defaultFilters = {
				limit,
				page,
				'filters[search]': search
		};
		fetchRoles({
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
							setRoles(appendList);
						} else {
							setRoles(roles.concat(appendList));
						}
				},
		});
	};

	const columns = [
		{
			title: 'Modulun adı',
			dataIndex: 'name',
			key: 'feature_id',
		},
		{
			title: 'Hüquq növü',
			dataIndex: 'permission',
			key: 'key',
			render: (value, row) => (
				<RenderPermissionSelect
					permission={value}
					roleId={selectedRole}
					feature={row.key}
					{...{ changeRolePermissionByRoleId, featuresLoading }}
				/>
			),
		},
	];

	return (
		<>
			<Row style={{ marginBottom: 16 }}>
				<Col
					span={8}
					style={{ maxWidth: 285 }}
					className={style.privilegeSelect}
				>
					<ProAsyncSelect
						data={roles}
						value={selectedRole}
						selectRequest={ajaxRolesSelectRequest}
						valueOnChange={setSelectedRole}
						placeholder="Qrup seçin"
						size="default"
						allowClear={false}
					/>
				</Col>
			</Row>
			<Row style={{minHeight:"300px"}}>
				<Col style={{ maxWidth: 900, marginBottom: 50}}>
					<Spin
						style={{ display: 'block' }}
						spinning={featuresLoading}
					>
						<Collapse
							accordion
							expandIconPosition="right"
							defaultActiveKey={['0']}
							bordered={false}
						>
							{Object.keys(groupedFeatures).map(
								(item, index) =>
									item !== 'undefined' &&
									item !== 'contact_center' && ( // remove this line to show all features
										<Collapse.Panel
											key={index}
											header={
												featuresNamesByGroupKey[item]
											}
											style={customPanelStyle}
										>
											<Table
												showHeader={false}
												rowClassName={style.row}
												dataSource={
													groupedFeatures[item]
												}
												rowKey={record =>
													record.feature_id
												}
												columns={columns}
											/>
										</Collapse.Panel>
									)
							)}
						</Collapse>
					</Spin>

					{!selectedRole && (
						<ProEmpty description="Hüquqları görmək üçün qrup seçin" />
					)}
				</Col>
			</Row>
		</>
	);
}

const getGroupedFeatures = createSelector(
	state => state.rolesReducer.features,
	features => groupByKey(features, 'group_key')
);

const mapStateToProps = state => ({
	roles: state.rolesReducer.roles,
	features: state.rolesReducer.features,
	groupedFeatures: getGroupedFeatures(state),
	rolesLoading: !!state.loadings.roleActionsLoading,
	featuresLoading: !!state.loadings.fetchFeaturesByRoleId,
	actionLoading: !!state.loadings.changeRolePermissionByRoleId,
});

export default connect(
	mapStateToProps,
	{
		fetchRoles,
		fetchFeaturesByRoleId,
		changeRolePermissionByRoleId,
		resetRolesFeaturesData,
	}
)(Privilege);
