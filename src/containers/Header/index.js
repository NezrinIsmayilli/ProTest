/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/az';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Popover, Dropdown, Tooltip, Avatar, List } from 'antd';
import { Can, ProInput } from 'components/Lib';
import { FaUserAlt, FaSignOutAlt, FaCogs, FaCog } from 'react-icons/fa';
import { AppstoreAddOutlined, PlusCircleFilled } from '@ant-design/icons';
import { cookies } from 'utils/cookies';
import { clearUserData } from 'utils/clearUserData';
import { accessTypes, permissions } from 'config/permissions';
import { getHighestPermissionKey } from 'utils';
import i18n from 'i18next';
import { useNotificationsHandle } from '../ApiNotifications/useNotificationsHandle';
import Notifications from '../ApiNotifications/Notifications';
import styles from './style.module.sass';

const iconStyles = {
    position: 'relative',
    top: 4,
    fontSize: '17px',
    marginRight: '5px',
    width: '16px',
};

const userDropDownContent = (
    <div className={styles['dropdown-menu']}>
        <Link
            to="/profile/main"
            className={styles['dropdown-item']}
        // href="https://devapp.prospectsmb.com/profile/main"
        >
            <FaUserAlt style={iconStyles} /> Şəxsi məlumat
        </Link>
        <button
            onClick={() => clearUserData({ reload: true })}
            type="button"
            className={styles.dropdownButton}
            href="/login"
        >
            <FaSignOutAlt style={iconStyles} /> Sistemdən çıx
        </button>
    </div>
);

const TitleContent = ({ tenants, tenantId, changeDefaultTenant }) => (
    <div className={styles.company_list}>
        {tenants.map(item => (
            <ul key={tenantId} className={styles.title_content}>
                <li>
                    <a
                        href="javascript:;"
                        className={+tenantId === item.id ? styles.active : ''}
                        onClick={
                            tenants.length > 1
                                ? () => changeDefaultTenant(item.id)
                                : () => { }
                        }
                    >
                        <Avatar
                            size={32}
                            alt="Avatar"
                            src={
                                item.attachment
                                    ? item.attachment.thumb
                                    : '/img/samples/clogo.png'
                            }
                        />
                        {item.name}
                    </a>
                </li>
            </ul>
        ))}
    </div>
);

const SettingsPopoverdata = [
    {
        title: 'Kassa',
        desc: 'Yeni valyutalar əlavə edin',
        path: '/settings/msk/cashbox',
        permission: permissions.msk_cashbox,
    },
    {
        title: 'Vəzifələr',
        desc: 'Şirkətiniz üçün yeni vəzifələr əlavə edin',
        path: '/settings/msk/positions',
        permission: permissions.msk_occupations,
    },
    {
        title: 'Anbar',
        desc: 'Şirkətinizə bağlı anbarları idarə edin',
        path: '/settings/msk/storehouse',
        permission: permissions.msk_warehouse,
    },
    {
        title: 'Məhsul',
        desc: 'Şirkətiniz üçün məhsullara əlaqəli parametrlər təyin edin',
        path: '/settings/msk/product',
        permission: permissions.msk_product,
    },
    {
        title: 'Kredit',
        desc: 'Kredit növünü təyin edin',
        path: '/settings/msk/credit',
        permission: permissions.credits,
    },
    {
        title: 'Müqavilə',
        desc: 'Müqavilə tiplərini təyin edin',
        path: '/settings/msk/contract',
        permission: permissions.msk_contract,
    },
    {
        title: 'İstifadəçi hüquqları',
        desc: 'İstifadəçi hüquqları üçün parametrləri təyin edin',
        path: '/settings/msk/groups',
        permission: permissions.msk_permissions,
    },
    {
        title: 'İnsan resursları',
        desc: 'İnsan resursları üçün parametrləri təyin edin',
        path: '/settings/msk/hr',
        permission: permissions.msk_hrm,
    },
    {
        title: 'Bildirişlər',
        desc: 'Bildirişlər üçün parametrləri təyin edin',
        path: '/settings/msk/notification',
        permission: permissions.telegram_notifications,
    },
    {
        title: 'Sənədlər',
        desc: 'Sənədlər üçün parametrləri təyin edin',
        path: '/settings/msk/documents',
        permission: permissions.msk_documents,
    },
    {
        title: 'Sifariş tənzimləmələri',
        desc: 'Sifarişlər üçün parametrləri təyin edin',
        path: '/settings/msk/order-roles',
        permission: permissions.msk_order,
    },
    {
        title: 'Əlaqə mərkəzi',
        desc: 'Zənglər üçün parametrləri təyin edin',
        path: '/settings/msk/calls',
        permission: permissions.msk_callcenter,
    },
    {
        title: 'İnteqrasiya',
        desc: 'İnteqrasiya üçün parametrləri təyin edin',
        path: '/settings/msk/integration',
        permission: permissions.msk_integrations,
    },
    {
        title: 'FAQ',
        desc: 'FAQ üçün parametrləri təyin edin',
        path: '/settings/msk/faq',
        permission: permissions.msk_faq,
    },
    {
        title: 'Anbar qalığı',
        desc: 'İlkin qalıqlar/Anbar əlavə edin',
        path: '/settings/initial-remains/initial-remains-warehouse',
        permission: permissions.sales_init_invoice,
    },
    {
        title: 'Hesab',
        desc: 'İlkin qalıqlar/Hesab əlavə edin',
        path: '/settings/initial-remains/initial-remains-cashbox',
        permission: permissions.transaction_initial_balance,
    },
    {
        title: 'Borc',
        desc: 'İlkin qalıqlar/Borc əlavə edin',
        path: '/settings/initial-remains/initial-remains-debt',
        permission: permissions.sales_initial_debt,
    },
];
const Title = () => (
    <Link to="/settings">
        <span style={{ color: '#fff' }}>MSK</span>
    </Link>
);
const ToolPopoverContent = ({ data, type = 'msk' }) => {
    const [dataSource, setData] = useState(data);
    const [value, setValue] = useState(null);

    const filterList = e => {
        setValue(e.target.value);
    };
    useEffect(() => {
        value
            ? setData(
                data.filter(item =>
                    item.title
                        .toLowerCase()
                        .includes(value.trim().toLowerCase())
                )
            )
            : setData(data);
    }, [value]);
    return (
        <>
            <ProInput
                allowClear
                placeholder="Axtarış Edin..."
                className={styles.filter_list}
                onChange={e => filterList(e)}
            />
            <List
                className={`scrollbar ${styles.tool_popover_list}`}
                itemLayout="horizontal"
                dataSource={dataSource}
                renderItem={({ title, desc, path, permission }) =>
                    type === 'msk' ? (
                        <Can I={accessTypes.read} a={permission}>
                            <Link to={path}>
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <span className={styles.gear_icon}>
                                                <FaCog />
                                            </span>
                                        }
                                        title={title}
                                        description={desc}
                                    />
                                </List.Item>
                            </Link>
                        </Can>
                    ) : (
                        <Can I={accessTypes.manage} a={permission}>
                            <Link to={path}>
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <span className={styles.add_icon}>
                                                <PlusCircleFilled />
                                            </span>
                                        }
                                        title={title}
                                        description={desc}
                                    />
                                </List.Item>
                            </Link>
                        </Can>
                    )
                }
            />
        </>
    );
};

moment.locale(i18n.language || 'az');
const now = moment().format('D MMMM YYYY');
const week = moment().format('dddd');

const homePath = '/profile/main';

function HeaderWithoutRouter(props) {
    const {
        profile,
        tenant,
        permissions: permissionsList,
        tenants,
        isLoading,
        showMainNav,
        setShowMainNav
    } = props;
    const canSeeMskIcon = permissionsList
        .filter(
            per =>
                per.group_key === 'settings' ||
                per.group_key === 'init_settings'
        )
        .find(item => item.permission > 0);
    const Shortcuts = [
        {
            title: 'Ticarət əməliyyatları',
            desc: 'Yeni ticarət əməliyyatı əlavə edin.',
            path: '/sales/operations/add',
            permission: getHighestPermissionKey(
                permissionsList.filter(
                    ({ group_key, sub_group_key }) =>
                        group_key === 'sales' && sub_group_key === 'operations'
                )
            ),
        },
        {
            title: 'Maliyyə əməliyyatları',
            desc: 'Yeni maliyyə əməliyyatı əlavə edin.',
            path: '/finance/operations/add',
            permission: getHighestPermissionKey(
                permissionsList.filter(
                    ({ group_key, sub_group_key }) =>
                        group_key === 'transaction' &&
                        sub_group_key === 'operations'
                )
            ),
        },
        {
            title: 'Yeni əlaqə',
            desc: 'Yeni əlaqələr əlavə edin.',
            path: '/relations/contacts/new',
            permission: 'contact',
        },
        {
            title: 'Yeni məhsul',
            desc: 'Yeni məhsullar əlavə edin.',
            path: '/warehouse/product/add',
            permission: 'stock_product',
        },
        {
            title: 'Yeni müqavilə',
            desc: 'Yeni müqavilələr əlavə edin.',
            path: '/sales/contracts/add',
            permission: 'sales_contract',
        },
        {
            title: 'Yeni əməkdaş',
            desc: 'Yeni əməkdaşlar əlavə edin.',
            path: '/hrm/employees/workers/add',
            permission: 'hrm_working_employees',
        },
        {
            title: 'Yeni sifariş',
            desc: 'Yeni sifarişlər əlavə edin.',
            path: '/orders/goods',
            permission: 'order_basket',
        },
    ];

    const tenantId = cookies.get('__TNT__');

    function changeDefaultTenant(id) {
        // window.localStorage.setItem('__TNT__', id);
        cookies.set('__TNT__', id);
        cookies.remove('_TKN_CALL_');
        window.setTimeout(() => {
            window.location = homePath;
        });
    }

    useNotificationsHandle();

    const [showToolsIcons, setShowToolsIcons] = React.useState(false)

    return (
        <header className={styles.header}>
            {/* LOGO */}
            <div className={styles.logo}>
                <Link to={homePath} title="home">
                    <img src="/img/logo.png" alt="Prospect SMB" />
                </Link>
            </div>
            {/* NOW TIME */}
            <div className={styles.header_panel}>
                <div className={styles.header_today}>
                    <span className={styles.today}>Bu gün, {now}</span>
                    <span>{week}</span>
                </div>

                <div className={styles.mainNav_hamburger}>
                    <button
                        type="button"
                        onClick={() => setShowMainNav(!showMainNav)}
                        className={showMainNav && styles.opened}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
                <div className={styles.tools_group_tools_icons_hamburger}>
                    <button
                        type="button"
                        onClick={() => setShowToolsIcons(!showToolsIcons)}
                        className={showToolsIcons && styles.opened}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
                <div
                    className={`${styles.tools_group_tools_icons
                        } ${showToolsIcons && styles.show}`}
                >
                    <div className={styles.tool_icons}>
                        {/* MSK list */}
                        {canSeeMskIcon && (
                            <Popover
                                placement="bottom"
                                title={<Title />}
                                content={
                                    <ToolPopoverContent
                                        data={SettingsPopoverdata}
                                    />
                                }
                                trigger="hover"
                                getPopupContainer={trigger => trigger.parentNode}
                                overlayClassName={styles.icon_popover_content}
                            >
                                <Link
                                    to="/settings"
                                    tabIndex={0}
                                    className={styles.tool_icon}
                                >
                                    <Tooltip
                                        placement="left"
                                        overlayStyle={{ fontSize: 12 }}
                                        title="Nizamlamalar"
                                    >
                                        <FaCogs />
                                    </Tooltip>
                                </Link>
                            </Popover>
                        )}

                        <Can
                            I={accessTypes.manage}
                            a={
                                permissions.import_purchase || // İdxal alışı
                                permissions.sales_invoice || // Satış əməliyyatı
                                permissions.purchase_invoice || // Alış əməliyyatı
                                permissions.return_from_customer_invoice || // Geri alma əməliyyatı
                                permissions.return_to_supplier_invoice || // Geri qaytarma əməliyyatı
                                permissions.transfer_invoice || // Transfer əməliyyatı
                                permissions.remove_invoice || // Silinmə əməliyyatı
                                permissions.sales_contract || // Müqavilələr
                                permissions.transaction_invoice_payment || // Qaimə əməliyyatları
                                permissions.transaction_expense_payment || // Xərclər
                                permissions.salary_payment || // Əməkhaqqı əməliyyatları
                                permissions.transaction_advance_payment || // Avans
                                permissions.transaction_tenant_person_payment || // Təhtəl hesab
                                permissions.transaction_balance_creation_payment || // Təsisçi
                                permissions.money_transfer || // Transfer əməliyyatı
                                permissions.hrm_working_employees || // İşçilər
                                permissions.order_basket || // Məhsul kataloqu
                                permissions.stock_product || // Məhsullar
                                permissions.contact // Əlaqələr
                            }
                        >
                            <Popover
                                placement="bottom"
                                title="Qısa keçidlər"
                                content={
                                    <ToolPopoverContent
                                        data={Shortcuts}
                                        type="shortcut"
                                    />
                                }
                                trigger="hover"
                                getPopupContainer={trigger => trigger.parentNode}
                                overlayClassName={styles.icon_popover_content}
                            >
                                <span tabIndex={0} className={styles.tool_icon}>
                                    <Tooltip
                                        placement="left"
                                        overlayStyle={{ fontSize: 12 }}
                                        title="Qısa keçidlər"
                                    >
                                        <AppstoreAddOutlined />
                                    </Tooltip>
                                </span>
                            </Popover>
                        </Can>

                        {/* Notifications */}
                        <Notifications />
                    </div>

                    <div className={styles.header_user_tools_group}>
                        <ul className={styles.header_user_panel}>
                            {/* companies list */}
                            <Popover
                                placement="bottom"
                                content={
                                    <TitleContent
                                        {...{
                                            tenants,
                                            tenantId,
                                            changeDefaultTenant,
                                        }}
                                    />
                                }
                                trigger="click"
                                overlayClassName={styles.title_popover}
                            >
                                <li className={styles.holding}>
                                    <button
                                        className={styles['dropdown-toggle']}
                                        type="button"
                                    >
                                        <span style={{ margin: 0 }}>
                                            {tenant.name ||
                                                (isLoading && 'loading...')}
                                        </span>
                                        {/* <span>
                                        <img src="/img/icons/arrow-down.svg" alt="arrow down" />
                                    </span> */}
                                    </button>
                                </li>
                            </Popover>

                            {/* profile/signout buttons */}
                            <li className={styles.user}>
                                <Dropdown
                                    overlay={userDropDownContent}
                                    placement="bottomCenter"
                                    trigger={['click']}
                                >
                                    <button
                                        className={`${styles['dropdown-toggle']} ${styles.profileImg
                                            }`}
                                        type="button"
                                    >
                                        <img
                                            src={
                                                profile?.attachment?.thumb ||
                                                '/img/default.jpg'
                                            }
                                            alt="profile"
                                        />
                                    </button>
                                </Dropdown>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}

const mapStateToProps = state => ({
    tenants: state.tenantReducer.tenants,
    tenant: state.tenantReducer.tenant,
    isLoading: !!state.loadings.tenants,
    permissions: state.permissionsReducer.permissions,
    // notifications - to do,
    profile: state.profileReducer.profile,
});

export const Header = connect(mapStateToProps)(HeaderWithoutRouter);
