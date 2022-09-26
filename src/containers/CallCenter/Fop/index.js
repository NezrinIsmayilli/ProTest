/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Avatar } from 'antd';
import { connect } from 'react-redux';
import { useFilterHandle } from 'hooks';
import { SocketContext } from 'context/socket-context';
import {
    MdLocalPhone,
    MdFactCheck,
    MdWatchLater,
    MdOutlinePowerSettingsNew,
    MdLens,
    MdRingVolume,
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
} from 'react-icons/md';

import { fetchOfflineOperators } from 'store/actions/calls/fop';

import FopSideBar from './Sidebar';

import { Timer } from './timer';

import styles from './styles.module.scss';

const Fop = props => {
    const { fetchOfflineOperators, tenant, offlineOperators } = props;

    React.useEffect(() => {
        fetchOfflineOperators();
    }, []);

    const [filters, onFilter] = useFilterHandle(
        {
            operatorGroup: null,
            operators: null,
        },
        ({ filters }) => {
            if (filters.operatorGroup) {
                fetchOfflineOperators({
                    filter: `&callcenters[]=${filters.operatorGroup}`,
                });
            }
        }
    );

    const [liveUsers, setLiveUsers] = React.useState([]);
    const [onlineUsers, setOnlineUsers] = React.useState([]);
    const [onCallUsers, setOnCallUsers] = React.useState([]);
    const [offlineUsers, setOfflineUsers] = React.useState([]);
    const [handlingUsers, setHandlingUsers] = React.useState([]);

    React.useEffect(() => {
        if (offlineOperators) {
            const offliners = [];
            offlineOperators.forEach(operator => {
                if (filters.operators && filters.operators > 0) {
                    if (
                        filters.operators ===
                        operator?.tenantPerson?.prospectTenantPerson?.id
                    ) {
                        offliners[
                            (operator?.tenantPerson?.prospectTenantPerson?.id)
                        ] = {
                            userId:
                                operator.tenantPerson.prospectTenantPerson.id,
                            status: 'offline',
                            name: `${operator.tenantPerson.prospectTenantPerson.name} ${operator.tenantPerson.prospectTenantPerson.lastName}`,
                            avatar:
                                operator.tenantPerson.prospectTenantPerson
                                    .attachment,
                            time: operator.startedAt,
                        };
                    }
                } else if (
                    filters.operators === undefined ||
                    filters.operators === null
                ) {
                    offliners[
                        (operator?.tenantPerson?.prospectTenantPerson?.id)
                    ] = {
                        userId: operator.tenantPerson.prospectTenantPerson.id,
                        status: 'offline',
                        name: `${operator.tenantPerson.prospectTenantPerson.name} ${operator.tenantPerson.prospectTenantPerson.lastName}`,
                        avatar:
                            operator.tenantPerson.prospectTenantPerson
                                .attachment,
                        time: operator.startedAt,
                    };
                }

                setOfflineUsers(offliners);
            });
        }
    }, [offlineOperators, filters.operators]);

    const [socket] = React.useContext(SocketContext);

    React.useEffect(() => {
        socket.emit('fetchMyFopList', {
            tenant: tenant.id,
        });
        socket.off('fopLive').on('fopLive', async data => {
            setLiveUsers(data);
        });
    }, [socket]);

    React.useEffect(() => {
        if (liveUsers) {
            const onlineUserList = [];
            const onCallUserList = [];
            const handlingUserList = [];

            Object.values(liveUsers).map(user => {
                if (filters.operators && filters.operators > 0) {
                    if (user.userId === filters.operators) {
                        if (
                            user.status === 'online' ||
                            user.status === 'ringing'
                        ) {
                            onlineUserList.push(user);
                        } else if (user.status === 'onCall') {
                            onCallUserList.push(user);
                        } else if (user.status === 'handling') {
                            handlingUserList.push(user);
                        }
                    }
                } else if (
                    (filters.operators === undefined ||
                        filters.operators === null) &&
                    filters.operatorGroup > 0
                ) {
                    if (user.groups.includes(filters.operatorGroup)) {
                        if (
                            user.status === 'online' ||
                            user.status === 'ringing'
                        ) {
                            onlineUserList.push(user);
                        } else if (user.status === 'onCall') {
                            onCallUserList.push(user);
                        } else if (user.status === 'handling') {
                            handlingUserList.push(user);
                        }
                    }
                } else if (
                    filters.operators === undefined ||
                    filters.operators === null
                ) {
                    if (user.status === 'online' || user.status === 'ringing') {
                        onlineUserList.push(user);
                    } else if (user.status === 'onCall') {
                        onCallUserList.push(user);
                    } else if (user.status === 'handling') {
                        handlingUserList.push(user);
                    }
                }
            });

            setTimeout(() => {
                if (filters.operatorGroup) {
                    fetchOfflineOperators({
                        filter: `&callcenters[]=${filters.operatorGroup}`,
                    });
                } else {
                    fetchOfflineOperators();
                }
            }, 1000);
            setOnlineUsers(onlineUserList);
            setOnCallUsers(onCallUserList);
            setHandlingUsers(handlingUserList);
        }
    }, [liveUsers, filters.operators, filters.operatorGroup]);

    const offlineRef = React.useRef();
    const onlineRef = React.useRef();
    const handlingRef = React.useRef();
    const onCallRef = React.useRef();

    const handleOnCallClick = React.useCallback(
        e => {
            if (onCallRef.current) {
                onCallRef.current.scrollBy({
                    behavior: 'smooth',
                    left: e === 'right' ? 200 : -200,
                });
            }
        },
        [onCallRef]
    );

    const handleHandlingClick = React.useCallback(
        e => {
            if (handlingRef.current) {
                handlingRef.current.scrollBy({
                    behavior: 'smooth',
                    left: e === 'right' ? 200 : -200,
                });
            }
        },
        [handlingRef]
    );

    const handleOnlineClick = React.useCallback(
        e => {
            if (onlineRef.current) {
                onlineRef.current.scrollBy({
                    behavior: 'smooth',
                    left: e === 'right' ? 200 : -200,
                });
            }
        },
        [onlineRef]
    );

    const handleOfflineClick = React.useCallback(
        e => {
            if (offlineRef.current) {
                offlineRef.current.scrollBy({
                    behavior: 'smooth',
                    left: e === 'right' ? 200 : -200,
                });
            }
        },
        [offlineRef]
    );

    return (
        <>
            <FopSideBar filters={filters} onFilter={onFilter} />
            <div className={styles.container}>
                <div className={styles.operatorBlock}>
                    <div className={styles.operatorBlockHeader}>
                        <div className={styles.operatorBlockHeaderTitle}>
                            <MdLocalPhone size={18} color="#1abc9c" />
                            Danışır ({onCallUsers.length || 0})
                        </div>
                        <div className={styles.operatorBlockHeaderButtons}>
                            <button
                                type="button"
                                onClick={() => handleOnCallClick('left')}
                            >
                                <MdKeyboardArrowLeft size={26} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOnCallClick('right')}
                            >
                                <MdKeyboardArrowRight size={26} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.operatorBlockBody}>
                        <div ref={onCallRef} className={styles.scrollContainer}>
                            {onCallUsers &&
                                onCallUsers.map(user => (
                                    <div
                                        className={`${styles.operators} ${styles.hoverable}`}
                                        key={user.userId}
                                    >
                                        <Avatar
                                            size={64}
                                            icon="user"
                                            src={user.attachement || null}
                                        />
                                        <div className={styles.operatorName}>
                                            {user.name}
                                        </div>
                                        <div className={styles.operatorStatus}>
                                            <MdLens size={14} color="#1abc9c" />
                                            Online
                                        </div>
                                        <div className={styles.operatorTime}>
                                            Danışır: [
                                            <Timer activitiDate={user.time} />]
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className={styles.operatorBlock}>
                    <div className={styles.operatorBlockHeader}>
                        <div className={styles.operatorBlockHeaderTitle}>
                            <MdFactCheck size={18} color="#e67e22" />
                            Zəngi emal edir ({handlingUsers.length || 0})
                        </div>
                        <div className={styles.operatorBlockHeaderButtons}>
                            <button
                                type="button"
                                onClick={() => handleHandlingClick('left')}
                            >
                                <MdKeyboardArrowLeft size={26} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleHandlingClick('right')}
                            >
                                <MdKeyboardArrowRight size={26} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.operatorBlockBody}>
                        <div
                            ref={handlingRef}
                            className={styles.scrollContainer}
                        >
                            {handlingUsers &&
                                handlingUsers.map(user => (
                                    <div
                                        className={styles.operators}
                                        key={user.userId}
                                        itemId={user.userId}
                                    >
                                        <Avatar
                                            size={64}
                                            icon="user"
                                            src={user.attachement || null}
                                        />
                                        <div className={styles.operatorName}>
                                            {user.name}
                                        </div>
                                        <div className={styles.operatorStatus}>
                                            <MdLens size={14} color="#e67e22" />
                                            Emal edir
                                        </div>
                                        <div className={styles.operatorTime}>
                                            ACW: [
                                            <Timer activitiDate={user.time} />]
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className={styles.operatorBlock}>
                    <div className={styles.operatorBlockHeader}>
                        <div className={styles.operatorBlockHeaderTitle}>
                            <MdWatchLater size={18} color="#2ecc71" />
                            Onlayn ({onlineUsers.length || 0})
                        </div>
                        <div className={styles.operatorBlockHeaderButtons}>
                            <button
                                type="button"
                                onClick={() => handleOnlineClick('left')}
                            >
                                <MdKeyboardArrowLeft size={26} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOnlineClick('right')}
                            >
                                <MdKeyboardArrowRight size={26} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.operatorBlockBody}>
                        <div ref={onlineRef} className={styles.scrollContainer}>
                            {onlineUsers &&
                                onlineUsers.map(user => (
                                    <div
                                        className={styles.operators}
                                        key={user.userId}
                                        itemId={user.userId}
                                    >
                                        <Avatar
                                            size={64}
                                            icon="user"
                                            src={user.attachement || null}
                                        />
                                        <div className={styles.operatorName}>
                                            {user.name}
                                        </div>
                                        <div className={styles.operatorStatus}>
                                            {user.status === 'online' ? (
                                                <>
                                                    <MdLens
                                                        size={14}
                                                        color="#1abc9c"
                                                    />
                                                    Gözləyir
                                                </>
                                            ) : (
                                                <>
                                                    <MdRingVolume
                                                        size={14}
                                                        color="#2ecc71"
                                                    />
                                                    Zəng daxil olur
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.operatorTime}>
                                            Gözləmə: [
                                            <Timer activitiDate={user.time} />]
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className={styles.operatorBlock}>
                    <div className={styles.operatorBlockHeader}>
                        <div className={styles.operatorBlockHeaderTitle}>
                            <MdOutlinePowerSettingsNew
                                size={18}
                                color="#e74c3c"
                            />
                            Oflayn ({Object.keys(offlineUsers).length || 0})
                        </div>
                        <div className={styles.operatorBlockHeaderButtons}>
                            <button
                                type="button"
                                onClick={() => handleOfflineClick('left')}
                            >
                                <MdKeyboardArrowLeft size={26} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOfflineClick('right')}
                            >
                                <MdKeyboardArrowRight size={26} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.operatorBlockBody}>
                        {offlineUsers && (
                            <div
                                ref={offlineRef}
                                className={styles.scrollContainer}
                            >
                                {offlineUsers &&
                                    offlineUsers.map(user => (
                                        <div
                                            className={styles.operators}
                                            itemId={user.userId}
                                            key={user.userId}
                                        >
                                            <Avatar
                                                size={64}
                                                icon="user"
                                                src={user.attachement || null}
                                            />
                                            <div
                                                className={styles.operatorName}
                                            >
                                                {user.name}
                                            </div>
                                            <div
                                                className={
                                                    styles.operatorStatus
                                                }
                                            >
                                                <MdLens
                                                    size={14}
                                                    color="#e74c3c"
                                                />
                                                Offline
                                            </div>
                                            <div
                                                className={styles.operatorTime}
                                            >
                                                [
                                                <Timer
                                                    activitiDate={user.time}
                                                />
                                                ]
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    profile: state.profileReducer.profile,
    offlineOperators: state.FopReducer.offlineOperators,
});

export default connect(
    mapStateToProps,
    {
        fetchOfflineOperators,
    }
)(Fop);
