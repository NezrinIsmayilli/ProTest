/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { Input, Empty, Spin } from 'antd';
import { connect } from 'react-redux';
import _ from 'lodash';
import { useFilterHandle } from 'hooks';
import moment from 'moment';
import { SocketContext } from 'context/socket-context';

import {
    fetchConversations,
    fetchMessages,
    fetchMessagesCount,
    getFacebookContact,
} from 'store/actions/calls/messaging';

import { getContactsInfo } from 'store/actions/contacts-new';

import MesgSideBar from './Sidebar';

import styles from './styles.module.scss';

import { ChatCard, UserInfoDrawwer, Messaging } from './#shared';

const Messages = props => {
    const {
        fetchConversations,
        fetchMessages,
        fetchMessagesCount,
        getFacebookContact,
        profile,
        tenant,
        isLoading,
        actionLoading,
        actionIsLoading,
        conversations: converstationList,
        messages: messagesList,
        getContactsInfo,
        permissionsByKeyValue,
    } = props;

    React.useEffect(() => {
        fetchConversations();
    }, []);

    const { Search } = Input;

    const [filters, onFilter] = useFilterHandle(
        {
            directions: [1],
            statuses: [2],
            dateFrom: undefined,
            dateTo: undefined,
            fromNumber: undefined,
            toNumber: undefined,
            fromOperators: [],
            toOperators: [],
            callbackStatuses: [],
            waitTimeFrom: null,
            waitTimeTo: null,
            ivrs: [],
            limit: 8,
            page: 1,
        },
        ({ filters }) => {
            // fetchInternalCalls({
            //   filters,
            //   onSuccessCallback: response => {
            //     setMissedCallData(response.data);
            //     getTotalCallCount({ filters });
            //   },
            // });
        }
    );

    const { procall_messages } = permissionsByKeyValue;
    const isEditDisabled = procall_messages.permission !== 2;
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = React.useState(0);
    const [messages, setMessages] = React.useState([]);
    const [uInfo, setUInfo] = React.useState(false);
    const [uDetails, setUDetails] = React.useState({});

    React.useEffect(() => {
        setConversations(converstationList);
    }, [converstationList]);

    React.useEffect(() => {
        const messages = _.cloneDeep(messagesList);
        setMessages(messages.reverse());
    }, [messagesList]);

    const toggleSelected = id => {
        if (id !== selected) {
            fetchMessagesCount({ id });
            fetchMessages({
                id,
                page: 1,
                limit: 10,
                onSuccessCallback: () => setSelected(id),
            });

            const newConversation = _.cloneDeep(conversations);
            const index = newConversation.findIndex(
                conversation => +conversation.id === +id
            );
            newConversation[index].unread = false;
            setConversations(newConversation);
        }
    };

    const [socket] = React.useContext(SocketContext);

    React.useEffect(() => {
        socket.off('message').on('message', async item => {
            if (item.sender) {
                const exist = await conversations.find(
                    person => +person.contact.identifier === +item.sender
                );

                if (exist && +exist.id === +selected) {
                    const newMessages = [...messages];
                    newMessages.push({
                        messageAttachments: item.messageAttachments,
                        channel: {
                            ...exist.channel,
                        },
                        direction: 'incoming',
                        id: null,
                        mid: null,
                        status: 'delivered',
                        text: item.text || '',
                        createdAt: moment(),
                        updatedAt: moment(),
                    });

                    setMessages(newMessages);
                } else if (exist && +exist.id !== +selected) {
                    const newConversation = _.cloneDeep(conversations);
                    const index = newConversation.findIndex(
                        person => +person.contact.identifier === +item.sender
                    );
                    newConversation[index].unread = true;
                    newConversation[index].lastMessage = [
                        {
                            id: null,
                            mid: item.mid,
                            text: item.text,
                            createdAt: moment(),
                            direction: 'incoming',
                            messageAttachments: [],
                        },
                    ];
                    setConversations(newConversation);
                } else {
                    getFacebookContact({
                        id: item.sender,
                        onSuccessCallback: response => {
                            const newConversation = _.cloneDeep(conversations);
                            newConversation.push({
                                id: null,
                                contact: {
                                    avatar: response.avatar,
                                    name: response.name,
                                    surname: response.surname,
                                    identifier: item.sender,
                                },
                                unread: true,
                                lastMessage: [
                                    {
                                        id: null,
                                        mid: item.mid,
                                        text: item.text,
                                        createdAt: moment(),
                                        direction: 'incoming',
                                        messageAttachments: [],
                                    },
                                ],
                                channel: null,
                            });
                            setConversations(newConversation);
                        },
                    });
                }
            }
        });
    }, [conversations, messages, selected]);

    const getContactInfo = id => {
        if (id) {
            getContactsInfo(id, response => {
                setUDetails(response);
            });
            setUInfo(true);
        }
    };

    return (
        <>
            <MesgSideBar filters={filters} onFilter={onFilter} />
            <div className={styles.container}>
                <aside>
                    <div className={styles.tabs}>
                        {/* <Badge count={3}>
                            <button type="button" className={styles.active}>
                                Söhbətlər
                            </button>
                        </Badge>
                        <Badge count={10}>
                            <button type="button">Mənim söhbətlərim</button>
                        </Badge> */}
                    </div>
                    <div
                        className={`${styles.chats} ${selected ? styles.in : null
                            }`}
                    >
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <Spin size="large" color="#6f8fc9" />
                            </div>
                        ) : null}

                        <div className={styles.search}>
                            <Search placeholder="Axtar" onSearch={() => { }} />
                        </div>
                        <ul>
                            {conversations &&
                                conversations.map(item => (
                                    <ChatCard
                                        item={item}
                                        selected={selected}
                                        toggleSelected={toggleSelected}
                                    />
                                ))}
                        </ul>
                    </div>
                </aside>
                <main className={selected ? styles.in : null}>
                    {actionLoading ? (
                        <div className={styles.loadingContainer}>
                            <Spin size="large" />
                        </div>
                    ) : null}

                    {selected && messages ? (
                        <Messaging
                            selected={selected}
                            chats={conversations}
                            messages={messages}
                            setMessages={setMessages}
                            uInfo={uInfo}
                            getContactInfo={getContactInfo}
                            profile={profile}
                            tenant={tenant}
                            disabled={isEditDisabled}
                        />
                    ) : (
                        <div className={styles.emptyContainer}>
                            <Empty description="Mesajı görmək üçün söhbətə daxil olun" />
                        </div>
                    )}

                    <UserInfoDrawwer
                        selected={selected}
                        uInfo={uInfo}
                        setUInfo={setUInfo}
                        uDetails={uDetails}
                        chats={conversations}
                        loading={actionIsLoading}
                    />
                </main>
            </div>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    profile: state.profileReducer.profile,
    conversations: state.MessagingReducer.conversations,
    messages: state.MessagingReducer.messages,
    isLoading: state.MessagingReducer.isLoading,
    actionLoading: state.MessagingReducer.actionLoading,
    actionIsLoading: state.newContactsReducer.actionIsLoading,
    permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
    mapStateToProps,
    {
        fetchConversations,
        fetchMessages,
        fetchMessagesCount,
        getFacebookContact,
        getContactsInfo,
    }
)(Messages);
