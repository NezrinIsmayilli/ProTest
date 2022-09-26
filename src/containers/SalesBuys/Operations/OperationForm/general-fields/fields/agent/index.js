import React, { useState } from 'react';
import { connect } from 'react-redux';
import { ProAsyncSelect, ProFormItem } from 'components/Lib';
import { useParams } from 'react-router-dom';
import { fetchContacts } from 'store/actions/contact';
import styles from '../../../styles.module.scss';

const AgentField = props => {
    const { form, field, invoiceInfo, fetchContacts } = props;
    const { getFieldError, getFieldDecorator } = form;
    const { label, placeholder, name } = field;
    const { id } = useParams();
    const [agent, setAgent] = useState([]);

    const ajaxAgentSelectRequest = (
        page = 1,
        limit = 20,
        search = '',
        stateReset = 0,
        onSuccessCallback
    ) => {
        const filters = { limit, page, name: search };
        fetchContacts(filters, data => {
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
                setAgent(appendList);
            } else {
                setAgent(agent.concat(appendList));
            }
        });
    };

    return (
        <div className={styles.field}>
            <ProFormItem label={label} help={getFieldError(name)?.[0]}>
                {getFieldDecorator(name, {
                    getValueFromEvent: category => category,
                    rules: [],
                })(
                    <ProAsyncSelect
                        selectRequest={ajaxAgentSelectRequest}
                        data={
                            id && invoiceInfo && invoiceInfo?.agentId
                                ? [
                                      {
                                          id: invoiceInfo?.agentId,
                                          name: invoiceInfo?.agentName,
                                      },
                                      ...agent.filter(
                                          item =>
                                              item.id !== invoiceInfo?.agentId
                                      ),
                                  ]
                                : agent
                        }
                        placeholder={placeholder}
                    />
                )}
            </ProFormItem>
        </div>
    );
};

const mapStateToProps = state => ({
    contactsLoading: state.loadings.fetchContacts,
    contacts: state.newContactsReducer.contacts,
});

export const Agent = connect(
    mapStateToProps,
    { fetchContacts }
)(AgentField);
