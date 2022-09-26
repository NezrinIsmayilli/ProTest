import { connectTypes, userSearchConnectOperationTypes } from './constants';

export const checkIsConnected = (itemValue, filterValue) => {
  if (filterValue !== false) {
    if (filterValue === userSearchConnectOperationTypes.Not_Connected) {
      return (
        itemValue === connectTypes.Invite ||
        itemValue === connectTypes.ReSend ||
        itemValue === connectTypes.ReInvite
      );
    }
    if (filterValue === userSearchConnectOperationTypes.Connected) {
      return itemValue === connectTypes.Connected;
    }
    if (filterValue === userSearchConnectOperationTypes.All) {
      return true;
    }
    return false;
  }
  return true;
};

export const checkName = (itemValue, filterValue) => {
  if (filterValue !== false && filterValue) {
    return String(itemValue)
      .toLowerCase()
      .includes(String(filterValue).toLowerCase());
  }
  return true;
};

export const checkRoleId = (itemValue, filterValue) => {
  if (filterValue !== false  && filterValue) {
    return itemValue === filterValue;
  }
  return true;
};
