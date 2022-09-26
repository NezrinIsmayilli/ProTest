/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { EditableRow, DeleteModal, Can } from 'components/Lib';
import { Row, Col, Spin } from 'antd';
import { accessTypes, permissions } from 'config/permissions';
import { useToggledInputHandle } from 'hooks/useToggledInputHandle';
import {
	fetchRoles,
	editRoleById,
	createRole,
	deleteRoleById,
} from 'store/actions/settings/roles';

// shared components
import { AddButton, AddRow } from '../#shared';

import styles from '../index.module.sass';

function Groups(props) {
	const {
		roles,
		isLoading,
		fetchRoles,
		editRoleById,
		createRole,
		deleteRoleById,
	} = props;
const [groupRole,SetGroupRole]=useState([]);
	useEffect(() => {
			fetchRoles({filters:{limit:1000},
				onSuccessCallback:data => {
				SetGroupRole(data.data);}},);
	}, []);

	const {
		open,
		error,
		value,
		inputChangeHandle,
		handleSubmit,
		toggleHandle,
		inputRef,
		onKeyUp,
	} = useToggledInputHandle('roleTypes', (_, name) => createRole({ name }));

	const roleEditHandle = useCallback((id, name) => {
		editRoleById(id, { name });
	}, []);

	return (
		<>
			<Can I={accessTypes.manage} a={permissions.msk_permissions}>
				<AddButton onClick={toggleHandle}> Yeni qrup</AddButton>
			</Can>

			<Row>
				<Col>
					<Spin size="large" spinning={isLoading}>
						<table
							className={`${styles['table-msk']} ${styles['table-msk-hesab']
								}`}
						>
							<thead>
								<tr>
									<th>№</th>
									<th>Qruplar</th>
								</tr>
							</thead>
							<tbody>
								{open && (
									<AddRow
										{...{
											value,
											inputRef,
											onKeyUp,
											inputChangeHandle,
											error,
											toggleHandle,
											handleSubmit,
										}}
										placeholder="Qrup adı"
										maxLength={30}
									/>
								)}
								{groupRole.map(({ id, name }, index) => (
									<EditableRow
										key={id}
										{...{ id, name, index }}
										placeholder="Qrup adı"
										maxLength={30}
										editHandle={roleEditHandle}
										deleteHandle={DeleteModal(
											id,
											deleteRoleById
										)}
										permission={permissions.msk_permissions}
									/>
								))}
							</tbody>
						</table>
					</Spin>
				</Col>
			</Row>
		</>
	);
}

const mapStateToProps = state => ({
	roles: state.rolesReducer.roles,
	isLoading: !!state.loadings.roleActionsLoading,
});

export default connect(
	mapStateToProps,
	{
		fetchRoles,
		editRoleById,
		createRole,
		deleteRoleById,
	}
)(Groups);
