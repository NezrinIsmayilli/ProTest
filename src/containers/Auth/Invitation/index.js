import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';

// utils
import { messages } from 'utils';
import { clearUserData } from 'utils/clearUserData';
import { checkSpaceinValue } from 'utils/inputValidations';

// actions
import { resetUserInfo, setPassword } from 'store/actions/auth';

// components
import { Button, Input, Form, Popover } from 'antd';
import { ProFormItem } from 'components/Lib';
import { FormLayout } from '../#shared';

// styles
import styles from '../styles.module.scss';

const oneLowerCharacter = /^(?=.*[a-z])/;
const oneUpperCharacter = /^(?=.*[A-Z])/;
const oneDigit = /(?=.*\d)/;
const oneNonWordCharacter = /([~?_=,.:;'"<*&{(^%$>\][+!@)}/|-])/;
const special_symbols = `(<*&(^%$>!@)`;
const {
    requiredText,
    mintextLimitMessage,
    maxtextLimitMessage,
    noWhitespaceMessage,
    passwordRepeatError,
    wrongInformation,
} = messages;

// form validation rules
const requiredRule = {
    required: true,
    message: requiredText,
};

const passwordMinRule = {
    min: 6,
    message: mintextLimitMessage(6),
};

const passwordMaxRule = {
    max: 250,
    message: maxtextLimitMessage(250),
};

const whitespaceRule = {
    whitespace: true,
    message: noWhitespaceMessage,
    validator: (rule, value, callback) => {
        if (checkSpaceinValue(value)) {
            callback(true);
        } else {
            callback();
        }
    },
};

function Invitation(props) {
    const {
        setPassword,
        resetUserInfo,
        isSubmitLoading,
        apiError,
        form,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        validateFields,
        getFieldValue,
    } = form;

    const history = useHistory();
    const { search } = useLocation();
    const { token } = queryString.parse(search);

    const [isPasswordRepeatDirty, setPasswordRepeatDirty] = useState(false);
    const [title, setTitle] = useState('??ifr??ni t??yin edin');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => resetUserInfo(), []);

    useEffect(() => {
        clearUserData({ reload: false });
    }, []);

    function handleSubmit(e) {
        e.preventDefault();

        validateFields((err, values) => {
            if (!err) {
                setPassword(`/invitation/accept/${token}`, values, onSuccess);
            }
        });
    }

    function onSuccess() {
        setTitle(
            '??m??liyyat u??urla tamamland??, giri?? s??hif??sin?? y??nl??ndirilirsiniz..'
        );

        setTimeout(() => history.replace('/login'), 2000);
    }

    const handlePasswordRepeatBlur = e => {
        const { value } = e.target;
        setPasswordRepeatDirty(isPasswordRepeatDirty || !!value);
    };

    const compareToFirstPassword = (rule, value, callback) => {
        if (value && value !== getFieldValue('password')) {
            callback(passwordRepeatError);
        } else {
            callback();
        }
    };
    const popOverContent = () => {
        const password = getFieldValue('password');
        return (
            <div style={{ padding: '10px 20px', maxWidth: '340px' }}>
                <p
                    className={styles.field}
                    style={
                        password && password?.length > 7
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    ??? ??n az?? 8 simvoldan ibar??t olmal??d??r
                </p>
                <p
                    className={styles.field}
                    style={
                        password && oneLowerCharacter.test(password)
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    ??? ??n az?? 1 ki??ik h??rfd??n ibar??t olmal??d??r
                </p>
                <p
                    className={styles.field}
                    style={
                        password && oneUpperCharacter.test(password)
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    ??? ??n az?? 1 b??y??k h??rfd??n ibar??t olmal??d??r
                </p>
                <p
                    className={styles.field}
                    style={
                        password && oneDigit.test(password)
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    ??? ??n az?? 1 r??q??md??n ibar??t olmal??d??r
                </p>
                <p
                    className={styles.field}
                    style={
                        password && oneNonWordCharacter.test(password)
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    ??? ??n az?? 1 x??susi simvoldan {special_symbols} ibar??t
                    olmal??d??r.
                </p>
                <p
                    className={styles.field}
                    style={
                        password && !checkSequence(password)
                            ? { color: 'green' }
                            : { color: 'red' }
                    }
                >
                    ??? Ard??c??ll??qdan ibar??t ola bilm??z
                </p>
            </div>
        );
    };
    const checkSequence = value => {
        let count = 0;
        for (let i = 1; i < value.length; i += 1) {
            if (value.charCodeAt(i) - value.charCodeAt(i - 1) === 1) count += 1;
            else count = 0;
            if (count === 2) return true;
        }
        return false;
    };
    const validateToNextPassword = (rule, value, callback) => {
        const fullName = getFieldValue('fullName');
        const company = getFieldValue('company');
        if (value && isPasswordRepeatDirty) {
            form.validateFields(['passwordRepeat'], { force: true });
        }
        if (value?.length < 8) {
            return callback('??n az?? 8 simvoldan ibar??t olmal??d??r');
        }
        if (!oneLowerCharacter.test(value)) {
            return callback('??n az?? 1 ki??ik h??rfd??n ibar??t olmal??d??r');
        }
        if (!oneUpperCharacter.test(value)) {
            return callback('??n az?? 1 b??y??k h??rfd??n ibar??t olmal??d??r');
        }
        if (!oneDigit.test(value)) {
            return callback('??n az?? 1 r??q??md??n ibar??t olmal??d??r');
        }
        if (!oneNonWordCharacter.test(value)) {
            return callback(
                `??n az?? 1 x??susi simvoldan ${special_symbols} ibar??t olmal??d??r.`
            );
        }
        if (value === fullName || value === company) {
            return callback(
                'Daxil edilmi?? ??irk??t ad?? v?? ya tam ad?? il?? eyni ola bilm??z'
            );
        }
        if (value && checkSequence(value)) {
            return callback('??ifr?? ard??c??ll??qdan ibar??t ola bilm??z.');
        }
        return callback();
    };

    return (
        <FormLayout>
            <h1 className={styles.header}>{title}</h1>
            <p
                className={styles.apiError}
                style={{ opacity: apiError ? 1 : 0 }}
            >
                {apiError || wrongInformation}
            </p>

            <Form onSubmit={handleSubmit} hideRequiredMark noValidate>
                {/* password */}
                <ProFormItem noStyle style={{ margin: '30px 0' }}>
                    {getFieldDecorator('test', {})(
                        <Popover
                            trigger="click"
                            placement="right"
                            arrowPointAtCenter
                            content={popOverContent()}
                            title="??ifr??:"
                        >
                            <ProFormItem
                                label="??ifr??"
                                help={getFieldError('password')?.[0]}
                            >
                                {getFieldDecorator('password', {
                                    rules: [
                                        {
                                            validator: validateToNextPassword,
                                        },
                                        whitespaceRule,
                                        requiredRule,
                                        passwordMinRule,
                                        passwordMaxRule,
                                    ],
                                })(<Input.Password size="large" />)}
                            </ProFormItem>
                        </Popover>
                    )}
                </ProFormItem>
                {/* passwordRepeat */}
                <ProFormItem
                    label="??ifr??nin t??krar??"
                    help={getFieldError('passwordRepeat')?.[0]}
                >
                    {getFieldDecorator('passwordRepeat', {
                        rules: [
                            {
                                validator: compareToFirstPassword,
                            },
                            whitespaceRule,
                            requiredRule,
                            passwordMinRule,
                            passwordMaxRule,
                        ],
                    })(
                        <Input.Password
                            size="large"
                            onBlur={handlePasswordRepeatBlur}
                        />
                    )}
                </ProFormItem>

                {/* action buttons */}
                <Button
                    htmlType="submit"
                    className={styles.submitButton}
                    type="primary"
                    loading={isSubmitLoading}
                    block
                    size="large"
                >
                    T??sdiq et
                </Button>
            </Form>
        </FormLayout>
    );
}

const WrappedInvitation = Form.create({
    name: 'Invitation',
})(Invitation);

const mapStateToProps = state => ({
    isSubmitLoading: !!state.loadings.setPassword,
    apiError: state.authReducer.apiError,
});

export default connect(
    mapStateToProps,
    {
        resetUserInfo,
        setPassword,
    }
)(WrappedInvitation);
