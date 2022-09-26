import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import { Tooltip, Icon } from 'antd';

import { inviteUser, deleteUserById, fetchUsers } from 'store/actions/users';

import { toast } from 'react-toastify';
import { connectTypes, userConnectTypesNames } from 'utils';

import styles from '../styles.module.scss';

const statusIconSize = { fontSize: 27, color: '#55ab80' };

const { Connected, Invite, ReInvite, ReSend } = connectTypes;

const Icons = {
  [Invite]: <Icon type="notification" style={statusIconSize} />,

  [ReSend]: <Icon type="history" style={statusIconSize} />,

  [ReInvite]: <Icon type="reload" style={statusIconSize} />,

  [Connected]: <Icon type="check-circle" style={statusIconSize} />,
};

function UserStatus(props) {
  const {
    data,
    // store
    filters,
    // actions
    inviteUser,
    fetchUsers,
  } = props;

  const { isConnected: status, id, isItMe, email, roleId } = data;

  const inviteSuccessCallback = () => {
    toast.success('Dəvət göndərildi', {
      className: 'success-toast',
    });
    fetchUsers({ filters });
  };

  const inviteUserHandle = () =>
    inviteUser(
      { tenantPerson: id, email, role: roleId },
      inviteSuccessCallback
    );

  return (
    <Fragment>
      <Tooltip title={userConnectTypesNames[status]}>
        <button
          type="button"
          aria-label={userConnectTypesNames[status]}
          onClick={status === 2 ? null : inviteUserHandle}
          className={styles.customButton}
          disabled={status === 1}
          style={{ marginLeft: '5px' }}
        >
          {Icons[status]}
        </button>
      </Tooltip>
    </Fragment>
  );
}

const mapStateToProps = state => ({
  usersLoading: !!state.loadings.fetchUsers,
  filters: state.usersReducer.filters,
});

export default connect(
  mapStateToProps,
  {
    inviteUser,
    deleteUserById,
    fetchUsers,
  }
)(UserStatus);
