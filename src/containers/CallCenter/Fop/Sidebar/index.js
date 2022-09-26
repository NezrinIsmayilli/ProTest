import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { Sidebar, ProSidebarItem, ProSelect } from 'components/Lib';

import {
    fetchOperatorGroup,
    fetchSelectedOperatorGroup,
} from 'store/actions/settings/operatorGroup';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';
import { fetchFilteredContacts } from 'store/actions/contacts-new';

const FopSideBar = ({
    fetchOperatorGroup,
    fetchCallOperators,
    fetchSelectedOperatorGroup,
    operators,
    operatorGroup,
    onFilter,
    fetchFilteredContacts,
    isLoading,
}) => {
    const [operatorList, setOperatorList] = React.useState([]);
    const [selectedOperator, setSelectedOperator] = React.useState([]);

    useEffect(() => {
        fetchOperatorGroup();
        fetchCallOperators();
    }, [fetchCallOperators, fetchOperatorGroup]);

    useEffect(() => {
        if (operators.length > 0) {
            setOperatorList(operators);
        }
    }, [operators]);

    const handleDefaultFilters = (type, value) => {
        if (type === 'operatorGroup' && value > 0) {
            fetchSelectedOperatorGroup({
                id: value,
                onSuccessCallback: data => {
                    setOperatorList(data?.data?.agents);
                },
            });
        } else if (
            type === 'operatorGroup' &&
            (value <= 0 || value === undefined)
        ) {
            setOperatorList(operators);
        }

        if (type === 'operator') {
            setSelectedOperator({ id: value });
        }

        onFilter(type, value);
    };

    return (
        <Sidebar title="İzləmə paneli">
            <ProSidebarItem label="Operator qrupu">
                <ProSelect
                    onChange={operatorGroup =>
                        handleDefaultFilters('operatorGroup', operatorGroup)
                    }
                    showArrow
                    data={operatorGroup}
                    loading={isLoading}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Operator">
                <ProSelect
                    onChange={operatorList =>
                        handleDefaultFilters('operators', operatorList)
                    }
                    showArrow
                    data={operatorList.map(operator => ({
                        ...operator,
                        id: operator?.prospectTenantPerson?.id,
                        name: operator.prospectTenantPerson
                            ? `${operator?.prospectTenantPerson?.name} ${operator?.prospectTenantPerson?.lastName
                                ? operator?.prospectTenantPerson?.lastName
                                : ''
                            } (${operator?.number})`
                            : operator?.number,
                    }))}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    folders: state.FaqReducer.folders,
    operatorGroup: state.OperatorGroupReducer.operatorGroup,
    operators: state.internalCallsReducer.operators,
    isLoading: state.OperatorGroupReducer.isLoading,
    actionLoading: state.FaqReducer.actionLoading,
});

export default connect(
    mapStateToProps,
    {
        fetchOperatorGroup,
        fetchCallOperators,
        fetchSelectedOperatorGroup,
        fetchFilteredContacts,
    }
)(FopSideBar);
