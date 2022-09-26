/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import pL from 'js-regex-pl';
import queryString from 'query-string';
// utils
import { messages } from 'utils';
import { clearUserData } from 'utils/clearUserData';
import { checkSpaceinValue } from 'utils/inputValidations';
import { ReactComponent as Detail } from 'assets/img/icons/help.svg';
// actions
import { register, resetUserInfo } from 'store/actions/auth';
import axios from 'axios';

// components
import { Button, Input, Form, Tooltip, Popover } from 'antd';
import MaskedInput from 'antd-mask-input';
import { ProFormItem, ProSelect, ProInput } from 'components/Lib';
import { minLengthRule } from 'utils/rules';
import { FormLayout } from '../#shared';
import InformModal from './InformModal';
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
  wrongInformation,
  emailFormat,
} = messages;

// form validation rules
const requiredRule = {
  required: true,
  message: requiredText,
};

const emailRule = {
  type: 'email',
  message: emailFormat,
};

const fullNameMinRule = {
  min: 3,
  message: mintextLimitMessage(3),
};
const fullNameMaxRule = {
  max: 30,
  message: maxtextLimitMessage(30),
};
const companyNameMinRule = {
  min: 3,
  message: mintextLimitMessage(3),
};

const companyNameMaxRule = {
  max: 70,
  message: maxtextLimitMessage(70),
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

function Register(props) {
  const { register, resetUserInfo, isLoading, apiError, form } = props;

  const [sectors, setSectors] = useState([]);
  const [informModalIsVisible, setInformModalIsVisible] = useState(false);
  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    getFieldValue,
    resetFields,
    setFields,
  } = form;

  useEffect(() => () => resetUserInfo(), []);

  useEffect(() => {
    clearUserData({ reload: false });
  }, []);

  const handleInformModal = () => {
    if (informModalIsVisible) {
      resetFields();
    }
    setInformModalIsVisible(!informModalIsVisible);
  };
  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields();
    validateFields(
      [
        'fullName',
        'company',
        'email',
        'phoneNumber',
        'password',
        'employee_count',
        'business_segment',
      ],
      (err, values) => {
        if (!err) {
          const {
            business_segment,
            company,
            email,
            employee_count,
            fullName,
            password,
            phoneNumber,
          } = values;
          register(
            {
              business_segment: business_segment || null,
              company: company.trim(),
              email,
              employee_count: employee_count || null,
              fullName,
              password,
              phoneNumber: `+${phoneNumber}`,
            },
            () => {
              handleInformModal();
            },
            ({ error }) => {
              const { messageKey } = error.response.data.error;
              if (messageKey === 'email_exists') {
                setFields({
                  email: {
                    name: 'email',
                    value: getFieldValue('email'),
                    errors: ['Bu E-poçt ünvanı artıq qeydiyyatdan keçmişdir.'],
                  },
                });
              } else if (messageKey === 'company_name_exists') {
                setFields({
                  company: {
                    name: 'company',
                    value: getFieldValue('company'),
                    errors: ['Bu adlı şirkət artıq mövcuddur.'],
                  },
                });
              } else if (
                error.response.data.error.errors.email[0] ===
                'This value is not a valid email address.'
              ) {
                setFields({
                  email: {
                    name: 'email',
                    value: getFieldValue('email'),
                    errors: [
                      'Bu dəyər düzgün e-poçt ünvanı deyil. Nümunə: devsales@prospectsmb.com',
                    ],
                  },
                });
              }
            }
          );
        }
      }
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
    if (value?.length < 8) {
      return callback('Ən azı 8 simvoldan ibarət olmalıdır');
    }
    if (!oneLowerCharacter.test(value)) {
      return callback('Ən azı 1 kiçik hərfdən ibarət olmalıdır');
    }
    if (!oneUpperCharacter.test(value)) {
      return callback('Ən azı 1 böyük hərfdən ibarət olmalıdır');
    }
    if (!oneDigit.test(value)) {
      return callback('Ən azı 1 rəqəmdən ibarət olmalıdır');
    }
    if (!oneNonWordCharacter.test(value)) {
      return callback(
        `Ən azı 1 xüsusi simvoldan ${special_symbols} ibarət olmalıdır.`
      );
    }
    if (value === fullName || value === company) {
      return callback(
        'Daxil edilmiş şirkət adı və ya tam adı ilə eyni ola bilməz'
      );
    }
    if (value && checkSequence(value)) {
      return callback('Şifrə ardıcıllıqdan ibarət ola bilməz.');
    }
    return callback();
  };

  const popOverContent = () => {
    const password = getFieldValue('password');
    const company = getFieldValue('value');
    const fullName = getFieldValue('fullName');
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
          • Ən azı 8 simvoldan ibarət olmalıdır
        </p>
        <p
          className={styles.field}
          style={
            password && oneLowerCharacter.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          • Ən azı 1 kiçik hərfdən ibarət olmalıdır
        </p>
        <p
          className={styles.field}
          style={
            password && oneUpperCharacter.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          • Ən azı 1 böyük hərfdən ibarət olmalıdır
        </p>
        <p
          className={styles.field}
          style={
            password && oneDigit.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          • Ən azı 1 rəqəmdən ibarət olmalıdır
        </p>
        <p
          className={styles.field}
          style={
            password && oneNonWordCharacter.test(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          • Ən azı 1 xüsusi simvoldan {special_symbols} ibarət olmalıdır.
        </p>
        <p
          className={styles.field}
          style={
            password && (password !== fullName || password !== company)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          • Daxil edilmiş şirkət adı və ya tam adı ilə eyni ola bilməz
        </p>
        <p
          className={styles.field}
          style={
            password && !checkSequence(password)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          • Ardıcıllıqdan ibarət ola bilməz
        </p>
      </div>
    );
  };
  const checkPhoneNumber = (rule, value, callback) => {
    const regex = /(\+|)994(012|060|099|010|050|051|055|070|077|099|12|60|99|10|50|51|55|70|77|99)\d{7}$/;
    if (!regex.test(value)) {
      return callback('Nömrə düzgün daxil edilməyib');
    }
    callback();
  };
  const validateOnlyLettersAndSpace = (rule, value, callback) => {
    if (value) {
      const regex = new RegExp(
        `^([a-zA-Z${pL}-&']{1,})( |)([a-zA-Z${pL}-&']{1,})( |)([a-zA-Z${pL}-&']{1,})$`
      );
      if (!regex.test(value)) {
        return callback('Tam ad düzgün daxil edilməyib.');
      }
    }
    return callback();
  };
  const validateCompanyName = (rule, value, callback) => {
    if (value) {
      const regex = new RegExp(
        `^([a-zA-Z${pL}0-9-&']{1,})( |)([a-zA-Z${pL}0-9-&']{1,})( |)([a-zA-Z${pL}0-9-&']{1,})$`
      );
      if (!regex.test(value)) {
        return callback('Şirkət adı düzgün daxil edilməyib.');
      }
    }
    callback();
  };

  const url =
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_API_URL_PROJOBS
      : process.env.REACT_APP_DEV_API_URL_PROJOBS;

  useEffect(() => {
    axios.get(`${url}/sectors`).then(({ data }) => setSectors(data.data));
  }, []);
  return (
    <FormLayout>
      <InformModal
        isVisible={informModalIsVisible}
        handleModal={handleInformModal}
        displayName={getFieldValue('fullName')}
      />
      <h1 className={styles.header}>
        İndi qeydiyyatdan keçin və 30 gün pulsuz istifadə edin
      </h1>
      {/* <p className={styles.apiError} style={{ opacity: apiError ? 1 : 0 }}>
        {apiError || wrongInformation}
      </p> */}

      <Form onSubmit={handleSubmit} noValidate={false}>
        {/* full name */}

        <ProFormItem
          label="Tam ad"
          name="fullName"
          help={getFieldError('fullName')?.[0]}
          style={{ marginBottom: '30px' }}
        >
          {getFieldDecorator('fullName', {
            rules: [
              requiredRule,
              fullNameMinRule,
              fullNameMaxRule,
              {
                validator: validateOnlyLettersAndSpace,
              },
            ],
            getValueFromEvent: event => {
              if (event.target.value !== getFieldValue('fullName')) {
                if (getFieldValue('company')) {
                  form.validateFields(['company'], { force: true });
                }
                if (getFieldValue('password')) {
                  form.validateFields(['password'], { force: true });
                }
              }
              return event.target.value;
            },
          })(
            <ProInput
              placeholder="Adınızı daxil edin"
              size="large"
              autoComplete="off"
            />
          )}
        </ProFormItem>

        {/* company */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ProFormItem
            label="Şirkət adı"
            help={getFieldError('company')?.[0]}
            style={{ flex: 1, marginRight: '10px' }}
          >
            {getFieldDecorator('company', {
              getValueFromEvent: event => {
                if (event.target.value !== getFieldValue('company')) {
                  if (getFieldValue('fullName')) {
                    form.validateFields(['fullName'], {
                      force: true,
                    });
                  }
                  if (getFieldValue('password')) {
                    form.validateFields(['password'], {
                      force: true,
                    });
                  }
                }
                return event.target.value;
              },
              rules: [
                { validator: validateCompanyName },
                requiredRule,
                companyNameMinRule,
                companyNameMaxRule,
              ],
            })(
              <ProInput
                placeholder="Şirkət adını daxil edin"
                size="large"
                autoComplete="off"
              />
            )}
          </ProFormItem>
          <ProFormItem
            label="Əməkdaşların sayı"
            style={{ flex: 0.5 }}
            help={getFieldError('employee_count')?.[0]}
          >
            {getFieldDecorator('employee_count', {
              rules: [],
            })(
              <ProSelect
                data={[
                  { id: '1-5', name: '1-5 işçi' },
                  { id: '5-20', name: '5-20 işçi' },
                  { id: '20-50', name: '20-50 işçi' },
                  { id: '50-250', name: '50-250 işçi' },
                  { id: '>250', name: '>250 işçi' },
                ]}
                placeholder="Əməkdaş sayını seçin"
              />
            )}
          </ProFormItem>
        </div>

        {/* biznes sahəsi */}
        <ProFormItem
          label="Biznes sahəsi"
          help={getFieldError('business_segment')?.[0]}
        >
          {getFieldDecorator('business_segment', {
            rules: [],
          })(<ProSelect data={sectors} placeholder="Biznes sahəsini seçin" />)}
        </ProFormItem>
        {/* email */}
        <ProFormItem
          label="E-poçt ünvanı"
          help={getFieldError('email')?.[0]}
          style={{ marginBottom: '30px' }}
        >
          {getFieldDecorator('email', {
            rules: [requiredRule, emailRule],
          })(
            <ProInput
              placeholder="Email ünvanınızı daxil edin"
              size="large"
              autoComplete="off"
            />
          )}
        </ProFormItem>

        {/* comapany */}
        <ProFormItem
          label={
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <span>Telefon nömrəsi</span>
              <Tooltip title="Nümunə: (994) 77 277-62-77" placement="top">
                <Detail style={{ marginLeft: '5px', cursor: 'pointer' }} />
              </Tooltip>
            </div>
          }
          help={getFieldError('phoneNumber')?.[0]}
        >
          {getFieldDecorator('phoneNumber', {
            rules: [
              requiredRule,
              {
                min: 12,
                message: 'Nömrə düzgün daxil edilməyib.',
                transform: value =>
                  String(value)
                    .replace(/ /g, '')
                    .replace(/_/g, '')
                    .replace(/-/g, '')
                    .replace('(', '')
                    .replace(')', ''),
              },
              {
                validator: checkPhoneNumber,
                transform: value =>
                  String(value)
                    .replace(/ /g, '')
                    .replace(/_/g, '')
                    .replace(/-/g, '')
                    .replace('(', '')
                    .replace(')', ''),
              },
            ],
          })(
            <MaskedInput
              size="large"
              mask="(111) 11 111 11 11"
              autoComplete="off"
              placeholder="Telefon nömrənizi daxil edin"
            />
          )}
        </ProFormItem>

        {/* password */}
        <ProFormItem noStyle style={{ margin: '30px 0' }}>
          {getFieldDecorator('test', {})(
            <Popover
              trigger="click"
              placement="right"
              arrowPointAtCenter
              content={popOverContent()}
              title="Şifrə:"
            >
              <ProFormItem
                label="Şifrə"
                name="password"
                help={getFieldError('password')?.[0]}
                style={{ marginBottom: '30px' }}
              >
                {getFieldDecorator('password', {
                  getValueFromEvent: event => {
                    if (
                      event.target.value !== getFieldValue('pass') &&
                      getFieldValue('fullName')
                    ) {
                      form.validateFields(['fullName'], { force: true });
                    }
                    return event.target.value;
                  },
                  rules: [
                    requiredRule,
                    whitespaceRule,
                    {
                      validator: validateToNextPassword,
                    },
                  ],
                })(
                  <Input.Password
                    size="large"
                    placeholder="Şifrənizi daxil edin"
                  />
                )}
              </ProFormItem>
            </Popover>
          )}
        </ProFormItem>

        {/* action buttons */}
        <Button
          block
          className={styles.submitButton}
          type="primary"
          loading={isLoading}
          size="large"
          htmlType="submit"
        >
          Təsdiq et
        </Button>

        <Link to="/login">
          <Button className={styles.grayColor} size="large" ghost block>
            Daxil olun
          </Button>
        </Link>
      </Form>
    </FormLayout>
  );
}

const WrappedRegister = Form.create({ name: 'registerForm' })(Register);

const mapStateToProps = state => ({
  data: state.authReducer.data,
  isLoading: !!state.loadings.auth,
  apiError: state.authReducer.apiError,
});

export default connect(
  mapStateToProps,
  { register, resetUserInfo }
)(WrappedRegister);
