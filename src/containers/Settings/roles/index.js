import React from 'react';
import { SettingsCollapse, SettingsPanel, CustomHeader } from 'components/Lib';
import { connect } from 'react-redux';

// panels
import Groups from './Groups';
import Privilege from './Privilege';

function Roles({ permissions }) {
	const isReadOnly =
		permissions.find(per => per.key === 'msk_permissions').permission === 1;
	return (
		<div style={{ marginBottom: '160px' }}>
			<SettingsCollapse>
				<SettingsPanel
					header={<CustomHeader title="Qruplar" />}
					key="1"
				>
					<Groups />
				</SettingsPanel>
				{!isReadOnly && (
					<SettingsPanel
						header={<CustomHeader title="Hüquqlar" />}
						key="2"
					>
						<Privilege />
					</SettingsPanel>
				)}
			</SettingsCollapse>
		</div>
	);
}
const mapStateToProps = state => ({
	permissions: state.permissionsReducer.permissions,
});

// export default Roles;
export default connect(mapStateToProps)(Roles);
