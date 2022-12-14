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
                    errors: ['Bu E-po??t ??nvan?? art??q qeydiyyatdan ke??mi??dir.'],
                  },
                });
              } else if (messageKey === 'company_name_exists') {
                setFields({
                  company: {
                    name: 'company',
                    value: getFieldValue('company'),
                    errors: ['Bu adl?? ??irk??t art??q m??vcuddur.'],
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
                      'Bu d??y??r d??zg??n e-po??t ??nvan?? deyil. N??mun??: devsales@prospectsmb.com',
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
          ??? ??n az?? 1 x??susi simvoldan {special_symbols} ibar??t olmal??d??r.
        </p>
        <p
          className={styles.field}
          style={
            password && (password !== fullName || password !== company)
              ? { color: 'green' }
              : { color: 'red' }
          }
        >
          ??? Daxil edilmi?? ??irk??t ad?? v?? ya tam ad?? il?? eyni ola bilm??z
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
  const checkPhoneNumber = (rule, value, callback) => {
    const regex = /(\+|)994(012|060|099|010|050|051|055|070|077|099|12|60|99|10|50|51|55|70|77|99)\d{7}$/;
    if (!regex.test(value)) {
      return callback('N??mr?? d??zg??n daxil edilm??yib');
    }
    callback();
  };
  const validateOnlyLettersAndSpace = (rule, value, callback) => {
    if (value) {
      const regex = new RegExp(
        `^([a-zA-Z${pL}-&']{1,})( |)([a-zA-Z${pL}-&']{1,})( |)([a-zA-Z${pL}-&']{1,})$`
      );
      if (!regex.test(value)) {
        return callback('Tam ad d??zg??n daxil edilm??yib.');
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
        return callback('??irk??t ad?? d??zg??n daxil edilm??yib.');
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
        ??ndi qeydiyyatdan ke??in v?? 30 g??n pulsuz istifad?? edin
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
              placeholder="Ad??n??z?? daxil edin"
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
            label="??irk??t ad??"
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
                placeholder="??irk??t ad??n?? daxil edin"
                size="large"
                autoComplete="off"
              />
            )}
          </ProFormItem>
          <ProFormItem
            label="??m??kda??lar??n say??"
            style={{ flex: 0.5 }}
            help={getFieldError('employee_count')?.[0]}
          >
            {getFieldDecorator('employee_count', {
              rules: [],
            })(
              <ProSelect
                data={[
                  { id: '1-5', name: '1-5 i????i' },
                  { id: '5-20', name: '5-20 i????i' },
                  { id: '20-50', name: '20-50 i????i' },
                  { id: '50-250', name: '50-250 i????i' },
                  { id: '>250', name: '>250 i????i' },
                ]}
                placeholder="??m??kda?? say??n?? se??in"
              />
            )}
          </ProFormItem>
        </div>

        {/* biznes sah??si */}
        <ProFormItem
          label="Biznes sah??si"
          help={getFieldError('business_segment')?.[0]}
        >
          {getFieldDecorator('business_segment', {
            rules: [],
          })(<ProSelect data={sectors} placeholder="Biznes sah??sini se??in" />)}
        </ProFormItem>
        {/* email */}
        <ProFormItem
          label="E-po??t ??nvan??"
          help={getFieldError('email')?.[0]}
          style={{ marginBottom: '30px' }}
        >
          {getFieldDecorator('email', {
            rules: [requiredRule, emailRule],
          })(
            <ProInput
              placeholder="Email ??nvan??n??z?? daxil edin"
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
              <span>Telefon n??mr??si</span>
              <Tooltip title="N??mun??: (994) 77 277-62-77" placement="top">
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
                message: 'N??mr?? d??zg??n daxil edilm??yib.',
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
              placeholder="Telefon n??mr??nizi daxil edin"
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
              title="??ifr??:"
            >
              <ProFormItem
                label="??ifr??"
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
                    placeholder="??ifr??nizi daxil edin"
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
          T??sdiq et
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
