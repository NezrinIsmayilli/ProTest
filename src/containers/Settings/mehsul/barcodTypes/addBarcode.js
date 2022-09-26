import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { connect } from 'react-redux';
import { Input, Form, Checkbox, Row, Col, Tooltip, Slider, Spin } from 'antd';
import { MdInfo } from 'react-icons/md';
import { requiredRule, minLengthRule, dinamicMaxLengthRule } from 'utils/rules';
import {
  ProFormItem,
  ProButton,
  ProSelect,
  SettingsCollapse,
  SettingsPanel,
  ProTypeFilterButton,
} from 'components/Lib';
import styles from './styles.module.scss';

const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
const AddBarcode = props => {
  const { form, onCancel, visible, positionEditHandle, barcodTypes } = props;
  const {
    validateFields,
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    getFieldValue,
  } = form;

  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [fontSize, setFontSize] = useState(20);
  const [textFontSize, setTextFontSize] = useState(20);
  const [font, setFont] = useState('1');
  const [textAlign, setTextAlign] = useState(1);
  const [textType, setTextType] = useState();
  const [defaultCode, setDefaultCode] = useState('0000000000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [lineColor, setLineColor] = useState('#000');
  const [defaultFrontCode, setDefaultFrontCode] = useState('XXXXXXXXXXXXX');
  const [defaultStandart, setDefaultStandart] = useState();
  const [defaultShowNumber, setDefaultShowNumber] = useState();
  const [defaultTitle, setDefaultTitle] = useState();
  const [secondP, setSecondP] = useState('95px');

  const handleBgColor = e => {
    setBgColor(e.target.value);
  };

  const handleLineColor = e => {
    setLineColor(e.target.value);
  };

  useEffect(() => {
    if (!defaultStandart) {
      setFieldsValue({ countryCode: undefined, code: undefined });
    }
  }, [defaultStandart]);

  useEffect(() => {
    if (width === 1) {
      setSecondP(textFontSize > 14 ? 'auto' : '50px');
    } else if (width === 2) {
      setSecondP(
        textFontSize > 29 ? '131px' : textFontSize > 25 ? '105px' : '95px'
      );
    } else if (width === 3) {
      setSecondP('140px');
    } else {
      setSecondP('180px');
    }
  }, [width, fontSize]);
  useEffect(() => {
    if (width === 1) {
      setTextFontSize(fontSize > 13 ? fontSize - 8 : 6);
    } else if (width === 2) {
      setTextFontSize(
        fontSize > 25 ? fontSize - 6 : fontSize > 13 ? fontSize - 4 : 10
      );
    } else if (width === 3) {
      setTextFontSize(
        fontSize > 25 ? fontSize - 4 : fontSize > 11 ? fontSize - 2 : 10
      );
    } else {
      setTextFontSize(fontSize);
    }
  }, [width, fontSize]);

  useEffect(() => {
    if (barcodTypes && barcodTypes.length > 0) {
      setFieldsValue({
        type: 'EAN-13',
        code:
          barcodTypes[0].producerCode !== null
            ? `${barcodTypes[0].producerCode}`
            : undefined,
        countryCode:
          barcodTypes[0].countryCode !== null
            ? `${barcodTypes[0].countryCode}`
            : undefined,
      });
      setDefaultStandart(
        barcodTypes[0].producerCode !== null ||
          barcodTypes[0].countryCode !== null
      );
      setDefaultShowNumber(barcodTypes[0].showNumber);
      setDefaultTitle(barcodTypes[0]?.title !== null);
      setWidth(
        Number(barcodTypes[0]?.barWidth) === 0
          ? 2
          : Number(barcodTypes[0]?.barWidth)
      );
      setHeight(
        barcodTypes[0]?.barHeight !== null ? barcodTypes[0]?.barHeight : 100
      );
      setFontSize(
        barcodTypes[0]?.fontSize !== null ? barcodTypes[0]?.fontSize : 20
      );
      setTextAlign(
        barcodTypes[0]?.textAlign === 'left'
          ? 1
          : barcodTypes[0]?.textAlign === 'center'
          ? 2
          : barcodTypes[0]?.textAlign === 'right'
          ? 3
          : 2
      );
      setFont(barcodTypes[0]?.font !== null ? barcodTypes[0]?.font : '1');
      setTextType(Number(barcodTypes[0]?.fontOptions));
      setBgColor(barcodTypes[0]?.barBackground || '#FFFFFF');
      setLineColor(barcodTypes[0]?.lineColor || '#000');
    } else {
      setFieldsValue({
        type: 'EAN-13',
      });
    }
  }, [barcodTypes, setFieldsValue, visible]);
  useEffect(() => {
    if (barcodTypes && barcodTypes.length > 0) {
      setFieldsValue({
        barcodeTitle: barcodTypes[0].title,
      });
    }
  }, [defaultTitle]);

  const handleExpenseSubmit = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { barcodeTitle, countryCode, code } = values;
        const newBarcode = {
          type: 2,
          length: 13,
          countryCode: countryCode === undefined ? null : countryCode,
          producerCode: code === undefined ? null : code,
          showNumber: defaultShowNumber,
          title: barcodeTitle,
          barWidth: `${width}`,
          barHeight: `${height}`,
          barBackground: bgColor,
          lineColor,
          textAlign:
            textAlign === 1
              ? 'left'
              : textAlign === 2
              ? 'center'
              : textAlign === 3
              ? 'right'
              : 'center',
          font,
          fontOptions: textType ? `${textType}` : undefined,
          fontSize: `${fontSize}`,
          isActive: barcodTypes?.[0]?.isActive || false,
        };
        positionEditHandle(2, newBarcode);
      }
    });
  };

  useEffect(() => {
    const countryData = getFieldValue('countryCode');
    const codeData = getFieldValue('code');
    const countryLength = countryData?.length || 0;
    const codeLength = codeData?.length || 0;
    const length = 12 - (countryLength + codeLength);
    const s = '0'.repeat(length);
    const allData = `${countryData || ''}${codeData || ''}${s}`;
    setDefaultCode(allData);
  }, [getFieldValue('countryCode'), getFieldValue('code')]);

  useEffect(() => {
    const countryData = getFieldValue('countryCode');
    const codeData = getFieldValue('code');
    const countryLength = countryData?.length || 0;
    const codeLength = codeData?.length || 0;
    const length = 13 - (countryLength + codeLength);

    const s = 'X'.repeat(length);
    const allData = `${countryData || ''}${codeData || ''}${s}`;
    setDefaultFrontCode(allData);
  }, [getFieldValue('countryCode'), getFieldValue('code')]);
  useEffect(() => {
    JsBarcode('#barcode', defaultCode, {
      format: 'ean13',
      displayValue: false,
      background: bgColor,
      lineColor,
      fontSize,
      height,
      width,
      textAlign:
        textAlign === 1
          ? 'left'
          : textAlign === 2
          ? 'center'
          : textAlign === 3
          ? 'right'
          : 'center',
      fontOptions: textType === 1 ? 'bold' : textType === 2 ? 'italic' : '',
    });
  }, [
    width,
    height,
    fontSize,
    textAlign,
    textType,
    getFieldValue,
    defaultCode,
    bgColor,
    lineColor,
  ]);

  const onWidthSlideChange = e => {
    setWidth(e);
  };
  const onHeightSlideChange = e => {
    setHeight(e);
  };
  const onFontSizeSlideChange = e => {
    setFontSize(e);
  };
  const handleTextAlign = id => {
    setTextAlign(id);
  };
  const handleTextType = id => {
    if (textType === id) {
      setTextType();
    } else {
      setTextType(id);
    }
  };

  return (
    <div className={styles.UpdateRole}>
      <h2>Düzəliş et</h2>
      <Spin spinning={false}>
        <Form onSubmit={event => handleExpenseSubmit(event)}>
          <ProFormItem
            label="Barkod tipi"
            customStyle={styles.formItem}
            help={getFieldError('type')?.[0]}
            style={{ height: '80px', margin: '0 16px' }}
          >
            {getFieldDecorator('type', {
              rules: [],
            })(<Input disabled size="large" placeholder="Yazın" />)}
          </ProFormItem>
          <SettingsCollapse
            className={styles.ivrCollapse}
            style={{ margin: 0, padding: 0 }}
            accordion={false}
            defaultActiveKey={['1', '2']}
          >
            <SettingsPanel
              style={{ margin: '0 0 10px 0', padding: 0 }}
              header={<p className={styles.ivrHeader}>Tənzimləmələr</p>}
              key={1}
            >
              <Row>
                <ProFormItem
                  label=""
                  customStyle={styles.formItem}
                  help={getFieldError('isStandart')?.[0]}
                >
                  {getFieldDecorator('isStandart', {
                    rules: [],
                  })(
                    <Checkbox
                      className={styles.checkbox}
                      checked={defaultStandart}
                      onChange={event =>
                        setDefaultStandart(event.target.checked)
                      }
                    >
                      Standarta uyğun
                    </Checkbox>
                  )}
                </ProFormItem>
              </Row>
              <Row gutter={6}>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>Ölkə kodu</p>
                        <Tooltip title="GS1 təşkilatının dünya ölkələri üçün təyin etdiyi kod daxil edilməlidir">
                          <MdInfo
                            style={{
                              color: '#464A4B',
                            }}
                            size={20}
                          />
                        </Tooltip>
                      </>
                    }
                    customStyle={styles.formItem}
                    help={getFieldError('countryCode')?.[0]}
                  >
                    {getFieldDecorator('countryCode', {
                      getValueFromEvent: event => {
                        if (
                          re.test(event.target.value) &&
                          event.target.value < 1000 &&
                          event.target.value.length < 4
                        ) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`countryCode`);
                      },
                      rules: defaultStandart
                        ? [requiredRule, minLengthRule]
                        : [minLengthRule],
                    })(
                      <Input
                        disabled={!defaultStandart}
                        size="large"
                        placeholder="Yazın"
                      />
                    )}
                  </ProFormItem>
                </Col>
                <Col span={12}>
                  <ProFormItem
                    label={
                      <>
                        <p className={styles.labelText}>İstehsalçı kodu</p>
                        <Tooltip title="GS1 təşkilatının şirkətiniz üçün təyin etdiyi istehsalçı kodu daxil edilməlidir">
                          <MdInfo
                            style={{
                              color: '#464A4B',
                            }}
                            size={20}
                          />
                        </Tooltip>
                      </>
                    }
                    customStyle={styles.formItem}
                    help={getFieldError('code')?.[0]}
                  >
                    {getFieldDecorator('code', {
                      getValueFromEvent: event => {
                        if (
                          re.test(event.target.value) &&
                          event.target.value < 100000000 &&
                          event.target.value.length < 9
                        ) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`code`);
                      },
                      rules: defaultStandart
                        ? [requiredRule, minLengthRule]
                        : [minLengthRule],
                    })(
                      <Input
                        disabled={!defaultStandart}
                        size="large"
                        placeholder="Yazın"
                      />
                    )}
                  </ProFormItem>
                </Col>
              </Row>
              <Row>
                <ProFormItem
                  label=""
                  customStyle={styles.formItem}
                  help={getFieldError('isNumberVisible')?.[0]}
                >
                  {getFieldDecorator('isNumberVisible', {
                    rules: [],
                  })(
                    <Checkbox
                      className={styles.checkbox}
                      checked={defaultShowNumber}
                      onChange={event =>
                        setDefaultShowNumber(event.target.checked)
                      }
                    >
                      Barkodun altında rəqəmləri göstər
                    </Checkbox>
                  )}
                </ProFormItem>
              </Row>
              <Row>
                <ProFormItem
                  label=""
                  customStyle={styles.formItem}
                  help={getFieldError('isHeaderVisible')?.[0]}
                >
                  {getFieldDecorator('isHeaderVisible', {
                    rules: [],
                  })(
                    <Checkbox
                      className={styles.checkbox}
                      checked={defaultTitle}
                      onChange={event => setDefaultTitle(event.target.checked)}
                    >
                      Barkodun başlığını göstər
                    </Checkbox>
                  )}
                </ProFormItem>
              </Row>
              {defaultTitle ? (
                <Row>
                  <ProFormItem
                    label="Başlıq"
                    customStyle={styles.formItem}
                    help={getFieldError('barcodeTitle')?.[0]}
                  >
                    {getFieldDecorator('barcodeTitle', {
                      getValueFromEvent: event => {
                        if (event.target.value.length < 16) {
                          return event.target.value;
                        }
                        if (event.target.value === '') {
                          return null;
                        }
                        return getFieldValue(`barcodeTitle`);
                      },
                      rules: [requiredRule, minLengthRule],
                    })(<Input size="large" placeholder="Yazın" />)}
                  </ProFormItem>
                </Row>
              ) : null}
            </SettingsPanel>
          </SettingsCollapse>
          <Row style={{ display: 'flex', justifyContent: 'center' }}>
            <div>{getFieldValue('barcodeTitle')}</div>
          </Row>
          <Row
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
                backgroundColor: bgColor,
              }}
            >
              <svg id="barcode"></svg>
              {defaultShowNumber ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: textFontSize,
                    fontWeight: textType === 1 ? 'bold' : '',
                    fontStyle: textType === 2 ? 'italic' : '',
                    justifyContent: 'space-between',
                    marginRight:
                      width === 4 ? '35px' : width === 1 ? '10px' : '20px',
                    marginTop:
                      width === 1
                        ? textFontSize > 18
                          ? '-14px'
                          : '-10px'
                        : '-20px',
                    zIndex: '1',
                  }}
                >
                  <p
                    style={{
                      color: lineColor,
                      width: '20px',
                      textAlign: 'right',
                      fontFamily:
                        font === '1'
                          ? '"Lucida Console", "Courier New", monospace'
                          : font === '2'
                          ? 'Arial, Helvetica, sans-serif'
                          : font === '3'
                          ? '"Times New Roman", Times, serif'
                          : font === '4'
                          ? 'Impact, fantasy'
                          : font === '5'
                          ? 'Snell Roundhand, cursive'
                          : '"Lucida Console", "Courier New", monospace',
                    }}
                  >
                    {defaultFrontCode.charAt(0)}
                  </p>
                  <p
                    style={{
                      color: lineColor,
                      width: secondP,
                      marginLeft:
                        fontSize < 26
                          ? width === 1
                            ? '0'
                            : width === 3
                            ? '4%'
                            : '7%'
                          : '0%',
                      textAlign:
                        textAlign === 1
                          ? 'left'
                          : textAlign === 2
                          ? 'center'
                          : textAlign === 3
                          ? 'right'
                          : 'center',
                      fontFamily:
                        font === '1'
                          ? '"Lucida Console", "Courier New", monospace'
                          : font === '2'
                          ? 'Arial, Helvetica, sans-serif'
                          : font === '3'
                          ? '"Times New Roman", Times, serif'
                          : font === '4'
                          ? 'Impact, fantasy'
                          : font === '5'
                          ? 'Snell Roundhand, cursive'
                          : '"Lucida Console", "Courier New", monospace',
                    }}
                  >
                    {defaultFrontCode.slice(1, 7)}
                  </p>
                  <p
                    style={{
                      color: lineColor,
                      width: secondP,
                      marginLeft:
                        width === 1
                          ? '0'
                          : width === 3
                          ? '4%'
                          : fontSize < 26
                          ? '7%'
                          : '0%',
                      textAlign:
                        textAlign === 1
                          ? 'left'
                          : textAlign === 2
                          ? 'center'
                          : textAlign === 3
                          ? 'right'
                          : 'center',
                      fontFamily:
                        font === '1'
                          ? '"Lucida Console", "Courier New", monospace'
                          : font === '2'
                          ? 'Arial, Helvetica, sans-serif'
                          : font === '3'
                          ? '"Times New Roman", Times, serif'
                          : font === '4'
                          ? 'Impact, fantasy'
                          : font === '5'
                          ? 'Snell Roundhand, cursive'
                          : '"Lucida Console", "Courier New", monospace',
                    }}
                  >
                    {defaultFrontCode.slice(7)}
                  </p>
                </div>
              ) : null}
            </div>
          </Row>

          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Çubuğun eni</p>
            </Col>
            <Col className={styles.slider} span={13}>
              <Slider
                min={1}
                max={4}
                defaultValue={width}
                value={width}
                trackStyle={{ height: '10px', backgroundColor: '#55ab80' }}
                handleStyle={{ height: '20px', width: '20px' }}
                onChange={onWidthSlideChange}
              />
            </Col>
            <Col span={3}>
              <p className={styles.slideNumber}>{width}</p>
            </Col>
          </Row>
          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Hündürlük</p>
            </Col>
            <Col className={styles.slider} span={13}>
              <Slider
                min={10}
                max={150}
                step={5}
                defaultValue={height}
                value={height}
                trackStyle={{ height: '10px', backgroundColor: '#55ab80' }}
                handleStyle={{ height: '20px', width: '20px' }}
                onChange={onHeightSlideChange}
              />
            </Col>
            <Col span={3}>
              <p className={styles.slideNumber}>{height}</p>
            </Col>
          </Row>
          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Arxa fon</p>
            </Col>
            <Col
              span={13}
              className={styles.colorPicker}
              style={{ padding: '0 5px' }}
            >
              <input
                className={styles.colorPickerColor}
                type="color"
                value={bgColor}
                onChange={handleBgColor}
              />
              <input
                className={styles.colorPickerText}
                type="text"
                value={bgColor}
                onChange={handleBgColor}
              />
            </Col>
            <Col span={3}></Col>
          </Row>
          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Xəttlərin rəngi</p>
            </Col>
            <Col span={13} style={{ padding: '0 5px' }}>
              <input
                className={styles.colorPickerColor}
                type="color"
                value={lineColor}
                onChange={handleLineColor}
              />
              <input
                className={styles.colorPickerText}
                type="text"
                value={lineColor}
                onChange={handleLineColor}
              />
            </Col>
            <Col span={3}></Col>
          </Row>
          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Mətnin düzülüşü</p>
            </Col>
            <Col span={13} style={{ padding: '0 5px' }}>
              <Row gutter={2}>
                <Col span={8}>
                  <ProTypeFilterButton
                    label="Sol"
                    isActive={textAlign === 1}
                    onClick={() => handleTextAlign(1)}
                  />
                </Col>
                <Col span={8}>
                  <ProTypeFilterButton
                    label="Mərkəz"
                    isActive={textAlign === 2}
                    onClick={() => handleTextAlign(2)}
                  />
                </Col>
                <Col span={8}>
                  <ProTypeFilterButton
                    label="Sağ"
                    isActive={textAlign === 3}
                    onClick={() => handleTextAlign(3)}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={3}></Col>
          </Row>
          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Şrift</p>
            </Col>
            <Col span={13} style={{ padding: '0 5px' }}>
              <ProSelect
                data={[
                  { id: '1', name: 'Monospace' },
                  { id: '2', name: 'Sans-serif' },
                  { id: '3', name: 'Serif' },
                  { id: '4', name: 'Fantasy' },
                  { id: '5', name: 'Cursive' },
                ]}
                keys={['name']}
                value={font}
                onChange={id => setFont(id)}
              />
            </Col>
            <Col span={3}></Col>
          </Row>
          <Row className={styles.slideRow}>
            <Col span={6}>
              <p className={styles.slideText}>Şrift seçimləri</p>
            </Col>
            <Col span={13} style={{ padding: '0 5px' }}>
              <Row gutter={2}>
                <Col span={12}>
                  <ProTypeFilterButton
                    label="Qalın"
                    isActive={textType === 1}
                    onClick={() => handleTextType(1)}
                    style={{ fontWeight: 'bolder' }}
                  />
                </Col>
                <Col span={12}>
                  <ProTypeFilterButton
                    label="Kursiv"
                    isActive={textType === 2}
                    onClick={() => handleTextType(2)}
                    style={{ fontStyle: 'italic' }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={3}></Col>
          </Row>
          <Row className={styles.slideRow} style={{ marginBottom: '15px' }}>
            <Col span={6}>
              <p className={styles.slideText}>Şrift ölçüsü</p>
            </Col>
            <Col className={styles.slider} span={13}>
              <Slider
                min={10}
                max={width === 1 ? 26 : width === 2 ? 30 : 36}
                defaultValue={fontSize}
                value={fontSize}
                trackStyle={{ height: '10px', backgroundColor: '#55ab80' }}
                handleStyle={{ height: '20px', width: '20px' }}
                onChange={onFontSizeSlideChange}
              />
            </Col>
            <Col span={3}>
              <p className={styles.slideNumber}>{fontSize}</p>
            </Col>
          </Row>
          <ProButton htmlType="submit" style={{ marginRight: '10px' }}>
            Təsdiq et
          </ProButton>
          <ProButton onClick={onCancel} type="danger">
            Ləğv et
          </ProButton>
        </Form>
      </Spin>
    </div>
  );
};

const mapStateToProps = state => ({
  barcodTypes: state.mehsulReducer.barcodTypes,
});

export default connect(
  mapStateToProps,
  {}
)(Form.create({ name: 'BarcodeForm' })(AddBarcode));
