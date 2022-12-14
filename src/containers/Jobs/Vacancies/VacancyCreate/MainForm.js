/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { connect } from 'react-redux';

// Components
import { Col, Form, Input, Row } from 'antd';
import {
    ProJobsSelect,
    ProContent,
    ProFormItem,
    NumericInput,
} from 'components/Lib';

// utils
import {
    EducationStatusData,
    FamilyStatusData,
    GenderStatusData,
    WorkGraphicStatusData,
} from 'utils/jobsStatusConstants';
import { messages } from 'utils';

// actions
import {
    fetchCities,
    fetchSector,
    fetchCategories,
    fetchPositions,
    fetchCurrencies,
    fetchLanguages,
} from 'store/actions/jobs/parameters';

const { TextArea } = Input;

const rule = {
    required: true,
    message: messages.requiredText,
};

// forward MainForm ref
function MainForm(props, ref) {
    const {
        parameters: {
            cities,
            sectors,
            categories,
            positions,
            currencies,
            languages,
        },
        form,
        loadings,

        // actions
        fetchCities,
        fetchSector,
        fetchCategories,
        fetchPositions,
        fetchCurrencies,
        fetchLanguages,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        getFieldValue,
        setFieldsValue,
        resetFields,
    } = form;

    // expose form to control it from parent
    useImperativeHandle(ref, () => ({
        form,
    }));

    // fetching ProJobsSelect options
    useEffect(() => {
        if (cities.length === 0) {
            fetchCities();
        }

        if (sectors.length === 0) {
            fetchSector();
        }

        if (categories.length === 0) {
            fetchCategories();
        }

        if (currencies.length === 0) {
            fetchCurrencies();
        }

        if (languages.length === 0) {
            fetchLanguages();
        }
    }, []);

    const minRule = {
        min: 1,
        type: 'number',
        transform: value => value && Number(value),
        message: '1-d??n az olmamal??d??r',
    };

    const maxRule = {
        max: 99,
        type: 'number',
        transform: value => value && Number(value),
        message: '99-dan ??ox olmaz',
    };

    const getError = field => getFieldError(field)?.[0];

    useEffect(() => {
        if (categories.length === 1) {
            setFieldsValue({
                category: categories[0].id,
            });
        }
        if (cities.length === 1) {
            setFieldsValue({
                city: cities[0].id,
            });
        }
    }, [categories, cities]);

    useEffect(() => {
        if (positions.length === 1) {
            setFieldsValue({
                position: positions[0].id,
            });
        }
    }, [positions]);

    return (
        <Form ref={ref}>
            <ProContent title="1. ??sas">
                <Row gutter={32}>
                    <Col span={8}>
                        {/*  Elan ad?? - required */}
                        <ProFormItem
                            label="Vakansiya ad??"
                            help={getError('name')}
                        >
                            {getFieldDecorator('name', {
                                rules: [
                                    rule,
                                    {
                                        max: 180,
                                        message: messages.maxtextLimitMessage(
                                            180
                                        ),
                                    },
                                ],
                            })(<Input autoFocus />)}
                        </ProFormItem>

                        {/* Kompaniya ad??  - required */}
                        <ProFormItem
                            label="Kompaniya ad??"
                            help={getError('companyName')}
                        >
                            {getFieldDecorator('companyName', {
                                rules: [
                                    rule,
                                    {
                                        max: 180,
                                        message: messages.maxtextLimitMessage(
                                            180
                                        ),
                                    },
                                ],
                            })(<Input />)}
                        </ProFormItem>

                        <Row gutter={12}>
                            <Col span={12}>
                                {/* Kateqoriya */}
                                <ProFormItem
                                    label="Kateqoriya"
                                    help={getError('category')}
                                >
                                    {getFieldDecorator('category', {
                                        rules: [rule],
                                    })(
                                        <ProJobsSelect
                                            size="default"
                                            data={categories}
                                            hasError={
                                                !!getFieldError('category')
                                            }
                                            disabled={loadings.categories}
                                            loading={loadings.categories}
                                            onChange={category => {
                                                resetFields(['position']);
                                                fetchPositions(category);
                                            }}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>

                            <Col span={12}>
                                {/* V??zif?? - required */}
                                <ProFormItem
                                    label="V??zif??"
                                    help={getError('position')}
                                >
                                    {getFieldDecorator('position', {
                                        rules: [rule],
                                    })(
                                        <ProJobsSelect
                                            size="default"
                                            data={positions}
                                            hasError={
                                                !!getFieldError('position')
                                            }
                                            disabled={
                                                loadings.positions ||
                                                !getFieldValue('category')
                                            }
                                            loading={loadings.positions}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>

                        {/* ????h??r - required  */}
                        <ProFormItem label="????h??r" help={getError('city')}>
                            {getFieldDecorator('city', {
                                rules: [rule],
                            })(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={cities}
                                    hasError={!!getFieldError('city')}
                                    disabled={loadings.cities}
                                    loading={loadings.cities}
                                />
                            )}
                        </ProFormItem>

                        <ProFormItem label="Sektor" help={getError('sector')}>
                            {getFieldDecorator('sector', {
                                rules: [rule],
                            })(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={sectors}
                                    hasError={!!getFieldError('sector')}
                                    disabled={loadings.sectors}
                                    loading={loadings.sectors}
                                />
                            )}
                        </ProFormItem>
                    </Col>

                    <Col span={8}>
                        {/* Cinsi */}
                        <ProFormItem label="Cinsi">
                            {getFieldDecorator('gender')(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={GenderStatusData}
                                />
                            )}
                        </ProFormItem>

                        {/* Ya?? h??ddi */}
                        <Row gutter={32}>
                            <Col span={12}>
                                <ProFormItem
                                    label="Ya?? h??ddi"
                                    help={getError('fromAge')}
                                >
                                    {getFieldDecorator('fromAge', {
                                        rules: [
                                            minRule,
                                            maxRule,
                                            {
                                                validator: (
                                                    rule,
                                                    value,
                                                    callback
                                                ) => {
                                                    const toAge = getFieldValue(
                                                        'toAge'
                                                    );
                                                    if (
                                                        Number(value) >
                                                            Number(toAge) &&
                                                        toAge
                                                    ) {
                                                        callback(true);
                                                    } else {
                                                        callback();
                                                    }
                                                },
                                                message:
                                                    'maks. ya??dan ??ox olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="d??n" />)}
                                </ProFormItem>
                            </Col>

                            <Col span={12}>
                                <ProFormItem label=" " help={getError('toAge')}>
                                    {getFieldDecorator('toAge', {
                                        rules: [
                                            minRule,
                                            maxRule,
                                            {
                                                validator: (
                                                    rule,
                                                    value,
                                                    callback
                                                ) => {
                                                    const fromAge = getFieldValue(
                                                        'fromAge'
                                                    );
                                                    if (
                                                        fromAge &&
                                                        value &&
                                                        Number(value) <
                                                            Number(fromAge)
                                                    ) {
                                                        callback(true);
                                                    } else {
                                                        callback();
                                                    }
                                                },
                                                message: 'min.ya??dan az olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="d??k" />)}
                                </ProFormItem>
                            </Col>
                        </Row>

                        {/* T??hsil */}
                        <ProFormItem label="T??hsil">
                            {getFieldDecorator('education')(
                                <ProJobsSelect
                                    allowClear
                                    size="default"
                                    data={EducationStatusData}
                                />
                            )}
                        </ProFormItem>

                        {/* Ail?? v??zy??ti */}
                        <ProFormItem label="Ail?? v??ziyy??ti">
                            {getFieldDecorator('familyStatus')(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={FamilyStatusData}
                                />
                            )}
                        </ProFormItem>

                        {/* ???? t??cr??b??si */}
                        <Row gutter={32}>
                            <Col span={12}>
                                <ProFormItem
                                    label="???? t??cr??b??si"
                                    help={getError('minExperience')}
                                >
                                    {getFieldDecorator('minExperience', {
                                        rules: [
                                            {
                                                max: 99,
                                                min: 1,
                                                type: 'number',
                                                transform: value =>
                                                    value && Number(value),
                                                message:
                                                    '1-d??n az, 99-dan ??ox olmamal??d??r',
                                            },
                                            {
                                                validator: (
                                                    rule,
                                                    value,
                                                    callback
                                                ) => {
                                                    const maxExperience = getFieldValue(
                                                        'maxExperience'
                                                    );
                                                    if (
                                                        Number(value) >
                                                            Number(
                                                                maxExperience
                                                            ) &&
                                                        maxExperience
                                                    ) {
                                                        callback(true);
                                                    } else {
                                                        callback();
                                                    }
                                                },
                                                message:
                                                    'maks. ild??n ??ox olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="d??n" />)}
                                </ProFormItem>
                            </Col>

                            <Col span={12}>
                                <ProFormItem
                                    label=" "
                                    help={getError('maxExperience')}
                                >
                                    {getFieldDecorator('maxExperience', {
                                        rules: [
                                            {
                                                max: 99,
                                                min: 0,
                                                type: 'number',
                                                transform: value =>
                                                    value && Number(value),
                                                message:
                                                    '1-d??n az, 99-dan ??ox olmamal??d??r',
                                            },
                                            {
                                                validator: (
                                                    rule,
                                                    value,
                                                    callback
                                                ) => {
                                                    const minExperience = getFieldValue(
                                                        'minExperience'
                                                    );
                                                    if (
                                                        minExperience &&
                                                        value &&
                                                        Number(value) <
                                                            Number(
                                                                minExperience
                                                            )
                                                    ) {
                                                        callback(true);
                                                    } else {
                                                        callback();
                                                    }
                                                },
                                                message:
                                                    'minimum ild??n az olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="d??k" />)}
                                </ProFormItem>
                            </Col>
                        </Row>
                    </Col>

                    <Col span={8}>
                        {/* Dil */}
                        <ProFormItem label="Dil" autoHeight>
                            {getFieldDecorator('languages_ul', {
                                initialValue: [],
                            })(
                                <ProJobsSelect
                                    mode="multiple"
                                    allowClear
                                    data={languages}
                                    disabled={loadings.languages}
                                    loading={loadings.languages}
                                    size="default"
                                />
                            )}
                        </ProFormItem>

                        {/* Maa?? */}
                        <ProFormItem label="??d??ni?? valyutas??">
                            {getFieldDecorator('currency')(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={currencies}
                                    placeholder="AZN"
                                    disabled
                                />
                            )}
                        </ProFormItem>

                        <Row gutter={32}>
                            <Col span={12}>
                                <ProFormItem
                                    label="??m??k haqq??"
                                    help={getError('minSalary')}
                                >
                                    {getFieldDecorator('minSalary', {
                                        rules: [
                                            {
                                                max: 9999999999,
                                                min: 0,
                                                type: 'number',
                                                transform: value =>
                                                    value && Number(value),
                                                message:
                                                    '10 r??q??md??n ??ox olmaml??d??r',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="d??n" />)}
                                </ProFormItem>
                            </Col>

                            <Col span={12}>
                                <ProFormItem
                                    label=" "
                                    help={getError('maxSalary')}
                                >
                                    {getFieldDecorator('maxSalary', {
                                        rules: [
                                            {
                                                max: 9999999999,
                                                min: 0,
                                                type: 'number',
                                                transform: value =>
                                                    value && Number(value),
                                                message:
                                                    '10 r??q??md??n ??ox olmaml??d??r',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="d??k" />)}
                                </ProFormItem>
                            </Col>
                        </Row>

                        {/*  ???? c??dv??li */}
                        <ProFormItem label="???? c??dv??li">
                            {getFieldDecorator('workGraphic')(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={WorkGraphicStatusData}
                                />
                            )}
                        </ProFormItem>
                    </Col>

                    <Col span={24}>
                        {/* Namiz??d?? t??l??bl??r  - required */}
                        <ProFormItem
                            label="Namiz??d?? t??l??bl??r"
                            autoHeight
                            help={getFieldError('requirements')?.[0]}
                        >
                            {getFieldDecorator('requirements', {
                                rules: [
                                    rule,
                                    {
                                        max: 2000,
                                        message: messages.maxtextLimitMessage(
                                            2000
                                        ),
                                    },
                                ],
                            })(<TextArea rows="5" allowClear />)}
                        </ProFormItem>

                        {/* ??trafl??  - required */}
                        <ProFormItem
                            label="??trafl??"
                            autoHeight
                            help={getFieldError('description')?.[0]}
                        >
                            {getFieldDecorator('description', {
                                rules: [
                                    rule,
                                    {
                                        max: 2000,
                                        message: messages.maxtextLimitMessage(
                                            2000
                                        ),
                                    },
                                ],
                            })(<TextArea rows="5" allowClear />)}
                        </ProFormItem>
                    </Col>
                </Row>
            </ProContent>
        </Form>
    );
}

const EnhancedMainForm = Form.create({ name: 'vacancyForm' })(
    forwardRef(MainForm)
);

const mapStateToProps = state => ({
    parameters: state.parametersReducer,
    loadings: state.loadings,
});

export default connect(
    mapStateToProps,
    {
        fetchCities,
        fetchSector,
        fetchCategories,
        fetchPositions,
        fetchCurrencies,
        fetchLanguages,
    }
)(EnhancedMainForm);
