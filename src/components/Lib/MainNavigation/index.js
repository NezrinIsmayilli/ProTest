import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { permissions, accessTypes } from 'config/permissions';
import { getHighestPermissionKey, getPermissionsByGroupKey } from 'utils';
import { useTranslation } from 'react-i18next';
import Can from '../Can';
import styles from './styles.module.scss';

const { read } = accessTypes;

export function NavigationLink({ path, icon, children, link }) {
    return (
        <li className={styles.item}>
            {link ? (
                <a href={path} className={styles.link}>
                    <img
                        width={33}
                        height={32}
                        src={icon}
                        alt={children}
                        className={styles.icon}
                    />
                    <span className={styles.linkText}>{children}</span>
                </a>
            ) : (
                <NavLink
                    to={path}
                    className={styles.link}
                    activeClassName={styles.active}
                >
                    <img src={icon} alt={children} className={styles.icon} />
                    <span className={styles.linkText}>{children}</span>
                </NavLink>
            )}
        </li>
    );
}

NavigationLink.propTypes = {
    path: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired,
    link: PropTypes.bool,
};

function Navigation(props) {
    const { t } = useTranslation();
    const { permissionsList, showMainNav, setShowMainNav } = props;

    return (
        <nav className={`${styles.nav} ${showMainNav && styles.show}`}>
            <ul className={styles.ul}>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'dashboard')
                    )}
                >
                    <NavigationLink
                        path="/dashboard"
                        icon="/img/icons/dashboard2.svg"
                    >
                        {t('mainNavigation:controlPanel')}
                    </NavigationLink>
                </Can>
                <Can I={read} a={permissions.users}>
                    <NavigationLink
                        path="/users"
                        icon="/img/icons/employees.svg"
                    >
                        {t('mainNavigation:users')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'contact')
                    )}
                >
                    <NavigationLink
                        path="/relations"
                        icon="/img/icons/contacts.svg"
                    >
                        {t('mainNavigation:contacts')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'stock')
                    )}
                >
                    <NavigationLink
                        path="/warehouse"
                        icon="/img/icons/warehouse.svg"
                    >
                        {t('mainNavigation:stock')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'sales')
                    )}
                >
                    <NavigationLink path="/sales" icon="/img/icons/stock.svg">
                        {t('mainNavigation:sales')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'transaction')
                    )}
                >
                    <NavigationLink
                        path="/finance"
                        icon="/img/icons/maliyye.svg"
                    >
                        {t('mainNavigation:finance')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'hrm')
                    )}
                >
                    <NavigationLink path="/hrm" icon="/img/icons/hrm.svg">
                        {t('mainNavigation:hrm')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'order')
                    )}
                >
                    <NavigationLink path="/orders" icon="/img/icons/orders.svg">
                        {t('mainNavigation:order')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(permissionsList, 'call_center')
                    )}
                >
                    <NavigationLink
                        path="/call-center"
                        icon="/img/icons/call-center.svg"
                    >
                        {t('mainNavigation:callCenter')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(
                            permissionsList.filter(
                                permission =>
                                    permission.key !== 'balance_report'
                            ),
                            'report'
                        )
                    )}
                >
                    <NavigationLink
                        path="/reports"
                        icon="/img/icons/reports-2.svg"
                    >
                        {t('mainNavigation:report')}
                    </NavigationLink>
                </Can>
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(
                            permissionsList,
                            'business_unit'
                        )
                    )}
                >
                    <NavigationLink
                        path="/business_unit"
                        icon="/img/icons/business-unit.svg"
                    >
                        {t('mainNavigation:businessUnit')}
                    </NavigationLink>
                </Can>
                {/* recruitment */}
                <Can
                    I={read}
                    a={getHighestPermissionKey(
                        getPermissionsByGroupKey(
                            permissionsList.filter(
                                permission =>
                                    permission.key !==
                                    'projobs_create_new_vacancy' &&
                                    permission.key !==
                                    'projobs_create_new_training'
                            ),
                            'projobs'
                        )
                    )}
                >
                    <NavigationLink
                        path="/recruitment"
                        icon="/img/icons/building.svg"
                    >
                        {t('mainNavigation:projobs')}
                    </NavigationLink>
                </Can>
                {/* <Can
				I={read}
				a={getHighestPermissionKey(
					getPermissionsByGroupKey(
					permissionsList.filter(
						permission => permission.key !== 'balance_report'
					),
					'report'
					)
				)}
				> */}
                {/* <NavigationLink path="/tasks" icon="/img/icons/tasks.svg">
                    {t('mainNavigation:task')}
                </NavigationLink> */}
                {/* </Can> */}
            </ul>
        </nav>
    );
}

const mapStateToProps = state => ({
    permissionsList: state.permissionsReducer.permissions,
});

export const MainNavigation = connect(
    mapStateToProps,
    null
)(Navigation);
