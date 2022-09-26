import React from 'react';
import { connect } from 'react-redux';
import { ProDatePicker, ProFormItem } from 'components/Lib';
import moment from 'moment';
import { requiredRule } from 'utils/rules';
import { fullDateTimeWithSecond } from 'utils';
import styles from '../../../styles.module.scss';

const DateField = props => {
    const { form, field, invoiceInfo } = props;
    const { label, name, placeholder } = field;
    const { getFieldDecorator, getFieldError } = form;
    const disabledDate = current => current && current > moment();
    const disabledPurchaseEditDate = current =>
        current &&
        current > moment(invoiceInfo.operationDate, fullDateTimeWithSecond);

    return (
        <div className={styles.field}>
            <ProFormItem label={label} help={getFieldError(name)?.[0]}>
                {getFieldDecorator(name, {
                    getValueFromEvent: date => date,
                    rules: [requiredRule],
                })(
                    <ProDatePicker
                        size="large"
                        format={fullDateTimeWithSecond}
                        allowClear={false}
                        disabled={
                            invoiceInfo?.hasAnyRelatedOperation &&
                            (invoiceInfo?.invoiceType !== 1 &&
                                invoiceInfo?.invoiceType !== 10)
                        }
                        disabledDate={
                            invoiceInfo?.invoiceType === 1 ||
                            (invoiceInfo?.invoiceType === 10 &&
                                invoiceInfo?.hasAnyRelatedOperation)
                                ? disabledPurchaseEditDate
                                : disabledDate
                        }
                        placeholder={placeholder}
                    />
                )}
            </ProFormItem>
        </div>
    );
};

const mapStateToProps = () => ({});

export const Date = connect(
    mapStateToProps,
    {}
)(DateField);
