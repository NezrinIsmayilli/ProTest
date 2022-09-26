import React, { useState } from 'react';
import { Row, Input, Col, Tooltip } from 'antd';
import { ProFormItem, ProWrapper, ProSelect, ProAsyncSelect } from 'components/Lib';
import { BsInfo } from 'react-icons/all';
import {
    requiredRule,
    minLengthRule,
    shortTextMaxRule,
    mediumTextMaxRule,
    longTextMaxRule,
    dinamicMinLengthRule,
    dinamicMaxLengthRule,
} from 'utils/rules';
import { contactTypes, contactCategories } from 'utils';
import { MobileNumber, Email, Website } from '../shared/inputs';
import styles from './styles.module.scss';

export default function MainInfo({
    form,
    fetchUsers,
    contactInformation,
    handleAddValue,
    handleDeleteValue,
    fetchCustomerTypes
}) {
    const { getFieldDecorator, getFieldValue, getFieldError } = form;
    const [users, setUsers] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]);
    const handleFacebookValue = event => {
        const re = /^[a-zA-Z0-9|.]+$/;
        if (re.test(event.target.value)) return event.target.value;
        if (event.target.value === '') return null;
        return getFieldValue('facebook');
    };

    const ajaxUsersSelectRequest = (
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

    const ajaxCustomerTypeSelectRequest = (
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
        };
        fetchCustomerTypes({
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
                    setCustomerTypes(appendList);
                } else {
                    setCustomerTypes(customerTypes.concat(appendList));
                }
            },
        });
    };

    return (
        <>
            <Row className={styles.sectionHeader}>
                <span>Şəxsi məlumatlar</span>
            </Row>
            <ProFormItem
                label="Əlaqə adı"
                name="name"
                help={getFieldError('name')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('name', {
                    rules: [requiredRule, minLengthRule, mediumTextMaxRule],
                })(
                    <Input
                        size="large"
                        className={styles.select}
                        placeholder="Yazın"
                    />
                )}
            </ProFormItem>
            <ProFormItem
                label="Əlaqə tipi"
                help={getFieldError('type')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('type', {
                    rules: [requiredRule],
                })(<ProSelect data={contactTypes} />)}
            </ProFormItem>
            <ProFormItem
                label="Kateqoriya"
                help={getFieldError('category')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('category', {
                    rules: [requiredRule],
                })(
                    <ProSelect
                        mode="multiple"
                        data={Object.values(contactCategories)}
                    />
                )}
            </ProFormItem>
            <ProFormItem
                label="VÖEN"
                help={getFieldError('voen')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('voen', {
                    rules: [shortTextMaxRule],
                })(
                    <Input
                        size="large"
                        className={styles.select}
                        placeholder="Yazın"
                    />
                )}
            </ProFormItem>
            <ProFormItem
                label="Menecer"
                help={getFieldError('manager')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('manager')(
                    <ProAsyncSelect
                        data={users}
                        keys={['name', 'lastName']}
                        selectRequest={ajaxUsersSelectRequest} />
                )}
            </ProFormItem>
            <ProFormItem
                label="Qiymət tipi"
                help={getFieldError('customerType')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('customerType')(
                    <ProAsyncSelect
                        data={[{ id: 0, name: 'Satış' }, ...customerTypes]}
                        placeholder="Satış"
                        selectRequest={ajaxCustomerTypeSelectRequest}
                        className={styles.customerTypeStyle}
                    />
                )}
            </ProFormItem>
            <Row className={styles.sectionHeader}>
                <span>Əlaqə məlumatları</span>
            </Row>
            {contactInformation.numbers.map((number, index) => (
                <MobileNumber
                    key={index}
                    value={number}
                    index={index}
                    type="numbers"
                    label="Mobil telefon"
                    placeholder="(xxx) xx xxx xx xx"
                    handleAddValue={handleAddValue}
                    handleDeleteValue={handleDeleteValue}
                    getFieldDecorator={getFieldDecorator}
                    getFieldError={getFieldError}
                    getFieldValue={getFieldValue}
                />
            ))}
            {contactInformation.emails.map((email, index) => (
                <Email
                    key={index}
                    value={email}
                    index={index}
                    type="emails"
                    label="Email"
                    placeholder="email@prospect.az"
                    handleAddValue={handleAddValue}
                    handleDeleteValue={handleDeleteValue}
                    getFieldDecorator={getFieldDecorator}
                    getFieldError={getFieldError}
                />
            ))}
            {contactInformation.websites.map((website, index) => (
                <Website
                    key={index}
                    value={website}
                    index={index}
                    type="websites"
                    label="Website"
                    placeholder="prospect.az"
                    handleAddValue={handleAddValue}
                    handleDeleteValue={handleDeleteValue}
                    getFieldDecorator={getFieldDecorator}
                    getFieldError={getFieldError}
                />
            ))}
            <Row
                style={{
                    margin: '10px 0',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Col sm={20} lg={22}>
                    <ProFormItem
                        label="Facebook istifadəçi adı"
                        help={getFieldError('facebook')?.[0]}
                    >
                        {getFieldDecorator('facebook', {
                            getValueFromEvent: event =>
                                handleFacebookValue(event),
                            rules: [dinamicMinLengthRule(5)],
                        })(
                            <Input
                                size="large"
                                className={`${styles.select}`}
                                style={{ width: '98%' }}
                                placeholder="Yazın"
                            />
                        )}
                    </ProFormItem>
                </Col>
                <Col sm={4} lg={2}>
                    <div className={styles.customInfo}>
                        <Tooltip
                            placement="right"
                            title={
                                'Facebook ünvanında "/" işarəsindən sonrakı hissəni əlavə edin.'
                            }
                        >
                            <BsInfo />
                        </Tooltip>
                    </div>
                </Col>
            </Row>
            <ProFormItem
                label="Ünvan"
                help={getFieldError('address')?.[0]}
                customStyle={styles.formItem}
            >
                {getFieldDecorator('address', {
                    rules: [dinamicMaxLengthRule(500)],
                })(
                    <Input
                        size="large"
                        className={`${styles.select}`}
                        placeholder="Yazın"
                    />
                )}
            </ProFormItem>
            {/* <Row className={styles.sectionHeader}>
                <span>Əlavə məlumat</span>
              </Row> */}
            <ProFormItem
                label="Əlavə məlumat"
                help={getFieldError('description')?.[0]}
                customStyle={styles.formItem}
                style={{ height: '120px', marginBottom: '20px' }}
            >
                {getFieldDecorator('description', {
                    rules: [dinamicMaxLengthRule(1000)],
                })(
                    <Input.TextArea
                        style={{
                            width: '100%',
                            marginTop: '4px',
                            fontSize: '14px',
                        }}
                        rows={4}
                        placeholder="Yazın"
                    />
                )}
            </ProFormItem>
        </>
    );
}
