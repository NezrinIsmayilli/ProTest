import React from 'react';
import { Avatar } from 'antd';
import { HiOutlineChevronRight } from 'react-icons/all';
import { contactTypes, contactCategories } from 'utils';
import styles from '../../styles.module.scss';

export function UserInfoDrawwer({
    selected,
    uInfo,
    setUInfo,
    uDetails,
    chats,
}) {
    const info = chats.filter(itm => itm.id === selected)[0];

    return (
        <div
            className={`${styles.userInfoContainer} ${
                uInfo ? styles.show : null
            }`}
        >
            <div className={styles.userClose}>
                <button type="button" onClick={() => setUInfo(false)}>
                    <HiOutlineChevronRight />
                </button>
            </div>
            <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                    <Avatar
                        src={info?.contact?.avatar || '/img/default.jpg'}
                        size={78}
                        shape="circle"
                    />
                </div>
                <div className={styles.userInfoName}>
                    {`${info?.contact?.name} ${info?.contact?.surname}`}
                </div>
                <div className={styles.userInfoTabs}>
                    <button type="button" className={styles.active}>
                        Şəxsi məlumatlar
                    </button>
                    <button type="button" disabled>
                        Tarixçə
                    </button>
                    <button type="button" disabled>
                        Media və fayllar
                    </button>
                </div>
                <div className={styles.userInfoListContent}>
                    <ul className={styles.userInfoList}>
                        <li>
                            <div> Adı </div>
                            <span>
                                {uDetails?.data?.name
                                    ? uDetails.data.name.split(' ')[0]
                                    : 'Yoxdur'}
                            </span>
                        </li>
                        <li>
                            <div> Soyadı </div>
                            <span>
                                {uDetails?.data?.name
                                    ? uDetails.data.name.split(' ')[1]
                                    : 'Yoxdur'}
                            </span>
                        </li>
                        <li>
                            <div> Email </div>
                            {uDetails?.data?.emails.map(email => (
                                <span>{email}</span>
                            )) || 'Yoxdur'}
                        </li>
                        <li>
                            <div> Ünvan </div>
                            <span>{uDetails?.data?.address || 'Yoxdur'}</span>
                        </li>
                        <li>
                            <div> Əlaqə nömrəsi </div>
                            {uDetails?.data?.phoneNumbers.map(number => (
                                <span>{number}</span>
                            )) || 'Yoxdur'}
                        </li>
                        <li>
                            <div> Əlaqə tipi </div>
                            <span>
                                {uDetails?.data?.typeId
                                    ? contactTypes[(uDetails?.data?.typeId)]
                                          .name
                                    : 'Yoxdur'}
                            </span>
                        </li>
                        <li>
                            <div> Kateqoriya </div>
                            {uDetails?.data?.categoryIds.map(category => (
                                <span>{contactCategories[category].name}</span>
                            )) || 'Yoxdur'}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
