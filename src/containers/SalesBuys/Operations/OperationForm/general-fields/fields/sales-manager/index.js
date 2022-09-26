import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { fetchUsers } from 'store/actions/users';
import { ProSelect, ProAsyncSelect, ProFormItem } from 'components/Lib';
import { requiredRule } from 'utils/rules';
import { useParams } from 'react-router-dom';
import styles from '../../../styles.module.scss';

const SalesManagerField = props => {
    const {
        form,
        field,
        usersLoading,
        invoiceInfo,
        disabled,
        fetchUsers,
    } = props;
    const { getFieldError, getFieldDecorator, setFieldsValue } = form;
    const { label, placeholder, name } = field;
    const { id } = useParams();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!id) {
            if (users.length === 1) {
                setFieldsValue({
                    salesman: users[0].id,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users]);

    useEffect(() => {
        if (id && invoiceInfo) {
            ajaxSalesmansSelectRequest(1, 20, '', 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, invoiceInfo?.businessUnitId]);

    const ajaxSalesmansSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const defaultFilters = {
            limit,
            page,
            'filters[search]': search,
            businessUnitIds:
                id && invoiceInfo
                    ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : [],
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
        <div className={styles.field}>
            <ProFormItem label={label} help={getFieldError(name)?.[0]}>
                {getFieldDecorator(name, {
                    getValueFromEvent: category => category,
                    rules: [requiredRule],
                })(
                    <ProAsyncSelect
                        allowClear={false}
                        keys={['name', 'lastName']}
                        // loading={usersLoading}
                        selectRequest={ajaxSalesmansSelectRequest}
                        data={
                            id && invoiceInfo
                                ? [
                                      {
                                          id: invoiceInfo?.salesmanId,
                                          name: invoiceInfo?.salesmanName,
                                          lastName:
                                              invoiceInfo?.salesmanLastName,
                                      },
                                      ...users.filter(
                                          user =>
                                              user.id !==
                                              invoiceInfo?.salesmanId
                                      ),
                                  ]
                                : users
                        }
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )}
            </ProFormItem>
        </div>
    );
};

const mapStateToProps = state => ({
    usersLoading: state.loadings.fetchUsers,
});

export const SalesManager = connect(
    mapStateToProps,
    { fetchUsers }
)(SalesManagerField);
