import React from 'react';
import { Col, Input, Row, Select } from 'antd';
import {
  AddFormModal,
  InputBox,
} from 'containers/Settings/#shared';

const { Option } = Select;

export function AddEditAnbar({ onChange, visible, onCancel, form }) {
  const {
    name,
    socketType,
    structure,
    personInCharge,
    lat,
    lng,
    area,
  } = form;

  return (
    <AddFormModal confirmText='Add warehouse' onCancel={onCancel} visible={visible} title='New warehouse'>
      <InputBox name={'name'} value={name} onChange={onChange} label='Name of warehouse'/>
      <InputBox defaultValue={socketType} onChange={(e) => onChange(e, 'socketType')}
                inputType='select' label='Warehouse type'>
        <Option value={1}>Jack</Option>
        <Option value={2}>Lucy</Option>
        <Option value={3}>
          Disabled
        </Option>
        <Option value={4}>yiminghe</Option>
      </InputBox>
      <InputBox onChange={(e) => onChange(e, 'structure')} defaultValue={structure}
                inputType='select' label='Structure'>
        <Option value={1}>Jack</Option>
        <Option value={2}>Lucy</Option>
        <Option value={3}>
          Disabled
        </Option>
        <Option value={4}>yiminghe</Option>
      </InputBox>
      <InputBox onChange={(e) => onChange(e, 'personInCharge')}
                defaultValue={personInCharge} inputType='select'
                label='Responsible person'>
        <Option value={1}>Jack</Option>
        <Option value={2}>Lucy</Option>
        <Option value={3}>
          Disabled
        </Option>
        <Option value={4}>yiminghe</Option>
      </InputBox>
      <Row gutter={10} style={{ display: 'flex', alignItems: 'flex-end' }}>
        <Col className="gutter-row" span={12}>
          <InputBox name={'lat'} type="number" value={lat} onChange={onChange} label='Coordination' placeholder='Width'/>
        </Col>
        <Col className="gutter-row" span={12}>
          <InputBox name={'lng'} type="number" value={lng} onChange={onChange} placeholder='Length'/>
        </Col>
      </Row>
      <InputBox name={'area'} type="number" value={area} onChange={onChange} disableGutter label='Area'/>
    </AddFormModal>
  );
}
