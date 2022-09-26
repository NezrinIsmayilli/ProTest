import React from 'react';
import { connect } from 'react-redux';
import { permissions, accessTypes } from 'config/permissions';
import { Table, ProButton, Can } from 'components/Lib';

import { DeleteTwoTone, SettingTwoTone } from '@ant-design/icons';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';

const { manage } = accessTypes;

const Role = props => {
	const {
		label,
		data,
		type,
		toggleRoleModal,
		handleRemoveTenantPersonRole,
		handleShowSettingModal,
		fetchCallRolesLoading,
		deleteCallRoleLoading,
		operatorUsers,
		isLoading,
	} = props;

	const columns = [
		{
			title: '№',
			dataIndex: 'id',
			align: 'left',
			width: 80,
			render: (value, item, index) => index + 1,
		},
		{
			title: `${label}`,
			dataIndex: 'operator',
			align: 'left',
			render: value =>
				`${value?.prospectTenantPerson?.name || ''} ${value
					?.prospectTenantPerson?.lastName || ''} ${value
						?.prospectTenantPerson?.patronymic || ''}`,
		},
		{
			title: 'Nömrə',
			dataIndex: 'operator',
			align: 'left',
			render: value =>
				operatorUsers.map(operator => {
					if (operator.id === value?.id) {
						return operator.number;
					}
				}) || '-',
		},
		// {
		//     title: 'Alternativ nömrə',
		//     dataIndex: 'operator',
		//     align: 'left',
		//     render: value => '-',
		// },
		{
			title: 'Tənzimləmələr',
			dataIndex: 'operator',
			align: 'center',
			render: value => (
				<SettingTwoTone
					style={{ fontSize: '16px', cursor: 'pointer' }}
					onClick={() =>
						handleShowSettingModal(
							value.id,
							`${value.prospectTenantPerson.name} ${value.prospectTenantPerson.lastName}`
						)
					}
				/>
			),
		},
	];

	columns.push({
		title: (
			<Can I={manage} a={permissions.msk_callcenter}>
				Sil
			</Can>
		),
		dataIndex: 'id',
		key: 'delete',
		align: 'center',
		width: 60,
		render: value => (
			<Can I={manage} a={permissions.msk_callcenter}>
				<DeleteTwoTone
					style={{ fontSize: '16px', cursor: 'pointer' }}
					onClick={() => handleRemoveTenantPersonRole(value)}
					twoToneColor="#eb2f96"
				/>
			</Can>
		),
	});

	return (
		<div>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
				}}
			>
				<Can I={manage} a={permissions.msk_callcenter}>
					<ProButton
						style={{ margin: '10px 0' }}
						onClick={() => toggleRoleModal(type)}
					>
						{label} əlavə et
					</ProButton>
				</Can>
			</div>
			<Table
				columns={columns}
				dataSource={data}
				scroll={{ x: 'none' }}
				loading={
					deleteCallRoleLoading || fetchCallRolesLoading || isLoading
				}
			/>
		</div>
	);
};

const mapStateToProps = state => ({
	deleteCallRoleLoading: state.loadings.deleteCallRole,
	fetchCallRolesLoading: state.loadings.fetchCallRoles,
	isLoading: state.loadings.fetchCallOperators,
});

export const TenantRole = connect(
	mapStateToProps,
	{ fetchCallOperators }
)(Role);
