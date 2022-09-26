import React,{useState} from 'react';
import { connect, useDispatch } from 'react-redux';
import { setSelectedUnitUser } from 'store/actions/businessUnit';
import { ProSelect, ProAsyncSelect, ProButton } from 'components/Lib';
import styles from '../../styles.module.scss';
import { fetchUsers } from 'store/actions/users';

const UpdateUserModal = props => {
  const {
    isLoading,
    setSelectedUnitUser,
    selectedUnitUser,
    toggleRoleModal,
    selectedUsers,
    setSelectedUsers,
    fetchUsers
  } = props;

  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const handleSelectUser = userIds => {
    const [userId] = userIds;
    const newUsers = users.find(user => user.id === userId);
    setSelectedUsers(prevSelectedUsers => [...prevSelectedUsers, newUsers]);
  };
  const handleSelectedUserChange = selectedUserIds => {
    const newUsers = selectedUsers.filter(user =>
      selectedUserIds.includes(user.id)
    );
    setSelectedUsers(newUsers);
  };
  const handleCreateUnitUser = () => {
    const data = selectedUsers.map(selectedUser => ({
      tenantPersonId: selectedUser.id,
      tenantPersonName: selectedUser.name,
      tenantPersonLastname: selectedUser.lastName,
    }));
    dispatch(
      setSelectedUnitUser({
        newSelectedUnitUser: [...data, ...selectedUnitUser],
      })
    );
    toggleRoleModal();
    setSelectedUsers([]);
  };

  const ajaxUsersSelectRequest = (
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
    fetchUsers({
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
                setUsers(appendList);
            } else {
                setUsers(users.concat(appendList));
            }
        },
    });
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Əlavə et</h2>
      <div>
        <span className={styles.selectLabel}>İstifadəçilər</span>
        <ProAsyncSelect
          loading={isLoading}
          mode="multiple"
          value={[]}
          keys={['name', 'lastName']}
          selectRequest={ajaxUsersSelectRequest}
          className={styles.selectBox}
          valueOnChange={handleSelectUser}
          data={users.filter(
            user =>
              ![
                ...selectedUsers.map(selectedUser => selectedUser.id),
                ...selectedUnitUser.map(unitUser => unitUser.tenantPersonId),
              ].includes(user.id)
          )}
        />
      </div>
      <div>
        <span className={styles.selectLabel}>Seçilmiş istifadəçilər</span>
        <ProSelect
          className={styles.selectBox}
          mode="multiple"
          keys={['name', 'lastName']}
          onChange={handleSelectedUserChange}
          value={selectedUsers.map(selected => selected.id)}
          data={selectedUsers}
        />
      </div>
      <div>
        <ProButton
          disabled={selectedUsers.length === 0}
          onClick={handleCreateUnitUser}
        >
          Təsdiq et
        </ProButton>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedUnitUser: state.businessUnitReducer.selectedUnitUser,
});

export const UpdateUsers = connect(
  mapStateToProps,
  {
    setSelectedUnitUser,
    fetchUsers
  }
)(UpdateUserModal);
