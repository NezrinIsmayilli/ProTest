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
        message: '1-dən az olmamalıdır',
    };

    const maxRule = {
        max: 99,
        type: 'number',
        transform: value => value && Number(value),
        message: '99-dan çox olmaz',
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
            <ProContent title="1. Əsas">
                <Row gutter={32}>
                    <Col span={8}>
                        {/*  Elan adı - required */}
                        <ProFormItem
                            label="Vakansiya adı"
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

                        {/* Kompaniya adı  - required */}
                        <ProFormItem
                            label="Kompaniya adı"
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
                                {/* Vəzifə - required */}
                                <ProFormItem
                                    label="Vəzifə"
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

                        {/* Şəhər - required  */}
                        <ProFormItem label="Şəhər" help={getError('city')}>
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

                        {/* Yaş həddi */}
                        <Row gutter={32}>
                            <Col span={12}>
                                <ProFormItem
                                    label="Yaş həddi"
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
                                                    'maks. yaşdan çox olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="dən" />)}
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
                                                message: 'min.yaşdan az olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="dək" />)}
                                </ProFormItem>
                            </Col>
                        </Row>

                        {/* Təhsil */}
                        <ProFormItem label="Təhsil">
                            {getFieldDecorator('education')(
                                <ProJobsSelect
                                    allowClear
                                    size="default"
                                    data={EducationStatusData}
                                />
                            )}
                        </ProFormItem>

                        {/* Ailə vəzyəti */}
                        <ProFormItem label="Ailə vəziyyəti">
                            {getFieldDecorator('familyStatus')(
                                <ProJobsSelect
                                    size="default"
                                    allowClear
                                    data={FamilyStatusData}
                                />
                            )}
                        </ProFormItem>

                        {/* İş təcrübəsi */}
                        <Row gutter={32}>
                            <Col span={12}>
                                <ProFormItem
                                    label="İş təcrübəsi"
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
                                                    '1-dən az, 99-dan çox olmamalıdır',
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
                                                    'maks. ildən çox olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="dən" />)}
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
                                                    '1-dən az, 99-dan çox olmamalıdır',
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
                                                    'minimum ildən az olmaz',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="dək" />)}
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

                        {/* Maaş */}
                        <ProFormItem label="Ödəniş valyutası">
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
                                    label="Əmək haqqı"
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
                                                    '10 rəqəmdən çox olmamlıdır',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="dən" />)}
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
                                                    '10 rəqəmdən çox olmamlıdır',
                                            },
                                        ],
                                    })(<NumericInput addonAfter="dək" />)}
                                </ProFormItem>
                            </Col>
                        </Row>

                        {/*  İş cədvəli */}
                        <ProFormItem label="İş cədvəli">
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
                        {/* Namizədə tələblər  - required */}
                        <ProFormItem
                            label="Namizədə tələblər"
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

                        {/* Ətraflı  - required */}
                        <ProFormItem
                            label="Ətraflı"
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
