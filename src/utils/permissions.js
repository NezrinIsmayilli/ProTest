export const getLeastPermissionKey = (selectedPermissions = []) => {
	let leastPermissionValue = 3;
	let leastPermissionKey = null;

	selectedPermissions.forEach(selectedPermission => {
		if (selectedPermission.permission < leastPermissionValue) {
			leastPermissionValue = selectedPermission.permission;
			leastPermissionKey = selectedPermission.key;
		}
	});
	return leastPermissionKey;
};

export const getHighestPermissionKey = (selectedPermissions = []) => {
	let highestPermissionValue = -1;
	let highestPermissionKey = null;

	selectedPermissions.forEach(selectedPermission => {
		if (selectedPermission.permission > highestPermissionValue) {
			highestPermissionValue = selectedPermission.permission;
			highestPermissionKey = selectedPermission.key;
		}
	});

	return highestPermissionKey;
};

export const getFirstSuitableKey = (
	selectedPermissions = [],
	permissionNumber = 1
) =>
	selectedPermissions.find(
		selectedPermission => selectedPermission.permission >= permissionNumber
	)?.key;

export const getPermissionsByGroupKey = (permissions, key) =>
	permissions.filter(permission => permission.group_key === key);

export const getSubGroupKey = (permissions, key) =>
	permissions.filter(permission => permission.key === key)[0]?.sub_group_key;
