/* eslint-disable react-hooks/exhaustive-deps */
import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { connect } from 'react-redux';

// Components
import { Col, Form, Input, Row, Radio, Checkbox } from 'antd';
import {
    ProJobsSelect,
    ProContent,
    ProFormItem,
    NumericInput,
} from 'components/Lib';

// utils
import { messages } from 'utils';
// actions
import {
    fetchCities,
    fetchSector,
    fetchCategoriesTrainings,
    fetchDirectionsTrainings,
    fetchLanguages,
    fetchFormats,
    fetchStations,
} from 'store/actions/jobs/parameters';

const { TextArea } = Input;

const rule = {
    required: true,
    message: messages.requiredText,
};

const maxRule = {
    max: 9999999999,
    min: 0,
    type: 'number',
    transform: value => value && Number(value),
    message: '10 rəqəmdən çox olmamlıdır',
};
// forward MainForm ref
function MainForm(props, ref) {
    const {
        parameters: {
            cities,
            categoriesTg,
            directions,
            languages,
            formats,
            stations,
        },
        form,
        loadings,

        // actions
        fetchCities,
        fetchCategoriesTrainings,
        fetchDirectionsTrainings,
        fetchLanguages,
        fetchFormats,
        fetchStations,
    } = props;

    const {
        getFieldDecorator,
        getFieldError,
        getFieldValue,
        resetFields,
        setFieldsValue,
    } = form;

    const [freePrice, setFreePrice] = useState(false);

    // expose form to control it from parent
    useImperativeHandle(ref, () => ({
        form,
    }));

    // fetching ProJobsSelect options
    useEffect(() => {
        if (cities.length === 0) {
            fetchCities();
        }

        if (categoriesTg.length === 0) {
            fetchCategoriesTrainings();
        }

        if (languages.length === 0) {
            fetchLanguages();
        }

        if (formats.length === 0) {
            fetchFormats();
        }
        if (stations.length === 0) {
            fetchStations();
        }
    }, []);

    useEffect(() => {
        if (categoriesTg.length === 1) {
            setFieldsValue({
                category: categoriesTg[0].id,
            });
        }
        if (cities.length === 1) {
            setFieldsValue({
                city: cities[0].id,
            });
        }
        if (languages.length === 1) {
            setFieldsValue({
                languages_ul: languages[0].value,
            });
        }
        if (formats.length === 1) {
            setFieldsValue({
                formats_ul: formats[0].id,
            });
        }
    }, [categoriesTg, cities, languages, formats]);

    useEffect(() => {
        if (directions.length === 1) {
            setFieldsValue({
                direction: directions[0].id,
            });
        }
    }, [directions]);

    const getError = field => getFieldError(field)?.[0];

    const handleUseVat = event => {
        setFreePrice(event.target.checked);
        if (event.target.checked) {
            setFieldsValue({
                minPrice: undefined,
                maxPrice: undefined,
            });
        }
    };
    return (
        <Form ref={ref}>
            <ProContent title="1. Əsas">
                <Row gutter={32}>
                    {/* col-1 */}
                    <Col span={8}>
                        {/*  Training name - required */}
                        <ProFormItem
                            label="Təlimin adı"
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
                            })(
                                <Input
                                    autoFocus
                                    placeholder="Təlimin adını daxil edin"
                                />
                            )}
                        </ProFormItem>

                        <Row gutter={12}>
                            <Col span={12}>
                                {/* Category - required */}
                                <ProFormItem
                                    label="Təlimin kateqoriyası"
                                    help={getError('category')}
                                >
                                    {getFieldDecorator('category', {
                                        rules: [rule],
                                    })(
                                        <ProJobsSelect
                                            size="default"
                                            data={categoriesTg}
                                            hasError={
                                                !!getFieldError('category')
                                            }
                                            disabled={loadings.categoriesTg}
                                            loading={loadings.categoriesTg}
                                            onChange={category => {
                                                resetFields(['direction']);
                                                fetchDirectionsTrainings(
                                                    category
                                                );
                                            }}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>

                            <Col span={12}>
                                {/* direction - required */}
                                <ProFormItem
                                    label="Təlimin istiqaməti"
                                    help={getError('direction')}
                                >
                                    {getFieldDecorator('direction', {
                                        rules: [rule],
                                    })(
                                        <ProJobsSelect
                                            size="default"
                                            data={directions}
                                            hasError={
                                                !!getFieldError('direction')
                                            }
                                            disabled={
                                                loadings.directions ||
                                                !getFieldValue('category')
                                            }
                                            loading={loadings.directions}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>

                        <ProFormItem
                            label="Cəmi təlim saatları"
                            help={getError('hours')}
                        >
                            {getFieldDecorator('hours', {
                                rules: [rule],
                            })(
                                <Input
                                    placeholder="Saatı daxil edin"
                                    type="number"
                                />
                            )}
                        </ProFormItem>

                        {/* City - required  */}
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
                    </Col>

                    {/* col-2 */}
                    <Col span={8}>
                        {/*  Training educator - required */}
                        <ProFormItem
                            label="Təlimçi"
                            help={getError('educator')}
                        >
                            {getFieldDecorator('educator', {
                                rules: [
                                    rule,
                                    {
                                        max: 180,
                                        message: messages.maxtextLimitMessage(
                                            180
                                        ),
                                    },
                                ],
                            })(
                                <Input placeholder="Təlimçinin adını daxil edin" />
                            )}
                        </ProFormItem>
                        {/* Languages */}
                        <ProFormItem label="Dil" autoHeight>
                            {getFieldDecorator('languages_ul', {
                                rules: [rule],
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

                        {/* Trainings formats - required  */}
                        <ProFormItem label="Təlimin formatı" autoHeight>
                            {getFieldDecorator('formats_ul', {
                                rules: [rule],
                            })(
                                <ProJobsSelect
                                    mode="multiple"
                                    allowClear
                                    data={formats}
                                    disabled={loadings.formats}
                                    loading={loadings.formats}
                                    size="default"
                                />
                            )}
                        </ProFormItem>

                        {/* Trainings stations - required  */}
                        <ProFormItem label="Yaxın metro stansiyası" autoHeight>
                            {getFieldDecorator('stations_ul', {
                                rules: [],
                            })(
                                <ProJobsSelect
                                    mode="multiple"
                                    allowClear
                                    data={stations}
                                    disabled={loadings.stations}
                                    loading={loadings.stations}
                                    size="default"
                                />
                            )}
                        </ProFormItem>
                    </Col>

                    {/* col-3 */}
                    <Col span={8}>
                        <Row gutter={32}>
                            {/* Min & Max Price */}
                            <Col span={12}>
                                <ProFormItem
                                    label="Təlimin qiyməti"
                                    help={getError('minPrice')}
                                >
                                    {getFieldDecorator('minPrice', {
                                        rules: !freePrice
                                            ? [rule, maxRule]
                                            : [],
                                    })(
                                        <NumericInput
                                            addonAfter="dən"
                                            placeholder="AZN"
                                            disabled={freePrice}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>

                            <Col span={12}>
                                <ProFormItem
                                    label=" "
                                    help={getError('maxPrice')}
                                >
                                    {getFieldDecorator('maxPrice', {
                                        rules: !freePrice ? [maxRule] : [],
                                    })(
                                        <NumericInput
                                            addonAfter="dək"
                                            placeholder="AZN"
                                            disabled={freePrice}
                                        />
                                    )}
                                </ProFormItem>
                            </Col>
                        </Row>
                        <ProFormItem
                            label="Ödənişsiz"
                            help={getFieldDecorator('free')?.[!freePrice]}
                        >
                            {getFieldDecorator('free', {
                                rules: [],
                            })(
                                <Checkbox
                                    checked={freePrice}
                                    onChange={handleUseVat}
                                />
                            )}
                        </ProFormItem>

                        <ProFormItem
                            required
                            label="Sertifikatlaşdırma"
                            help={getFieldDecorator('certification')?.[0]}
                        >
                            {getFieldDecorator('certification', {
                                rules: [],
                            })(
                                <Radio.Group value={1}>
                                    <Radio value={0}>Bəli</Radio>
                                    <Radio value={1}>Xeyr</Radio>
                                </Radio.Group>
                            )}
                        </ProFormItem>
                    </Col>

                    {/* col-4 */}
                    <Col span={24}>
                        {/* Description  - required */}
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
                            })(
                                <TextArea
                                    rows="5"
                                    allowClear
                                    placeholder="Təlim haqqında məlumatı daxil edin"
                                />
                            )}
                        </ProFormItem>
                    </Col>
                </Row>
            </ProContent>
        </Form>
    );
}

const EnhancedMainForm = Form.create({ name: 'trainingsForm' })(
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
        fetchCategoriesTrainings,
        fetchDirectionsTrainings,
        fetchLanguages,
        fetchFormats,
        fetchStations,
    }
)(EnhancedMainForm);
