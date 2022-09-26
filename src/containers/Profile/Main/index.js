/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
// ui
import { Row, Col, Button, Input, Form } from 'antd';
import {
	ProfileLayout,
	ProFormItem,
	ProSelect,
	ProDatePicker,
	UserAvatar,
	ProMaskedInput,
} from 'components/Lib';

// utils
import {
	defaultFormItemSize,
	GenderStatusData,
	dateFormat,
	messages,
} from 'utils';
// actions
import { editProfileInfo, fetchProfileInfo } from 'store/actions/profile';
import { uploadAttachment } from 'store/actions/attachment';
import DefaultSidebar from '../Sidebar';

// shared
import { ProfileSkeleton } from '../shared';

const baseRules = [
	{
		required: true,
		message: messages.requiredText,
	},
	{
		max: 15,
		message: messages.maxtextLimitMessage(15),
	},
];
const emailRules = [
	{
		required: true,
		message: messages.requiredText,
	},
	{
		max: 30,
		message: messages.maxtextLimitMessage(30),
	},
];

function Main(props) {
	const {
		form,
		profile,
		// profileLoading,
		editProfileInfoLoading,
		uploadLoading,
		// actions
		editProfileInfo,
		uploadAttachment,
	} = props;

	const avatarRef = useRef(null);

	const {
		getFieldDecorator,
		getFieldError,
		validateFields,
		setFieldsValue,
	} = form;

	const {
		attachment: attachmentProfile,
		birthday,
		email,
		gender,
		lastname,
		name,
		phoneNumber,
		mobileNumber,
	} = profile || {};

	useEffect(() => {
		if (!name) {
			fetchProfileInfo();
		}
	}, []);

	const handleSubmit = e => {
		e.preventDefault();

		validateFields((errors, values) => {
			if (!errors) {
				const { attachment, ...rest } = values;

				const data = {
					...rest,
					language: profile.language || 'az',
					attachment: attachment || attachmentProfile?.id || null,
					birthday: values.birthday
						? moment(values.birthday).format(dateFormat)
						: null,
				};

				const formData = avatarRef.current.getFormData();

				if (formData) {
					uploadAttachment(formData, params =>
						editProfileInfo({ ...data, attachment: params?.data?.id })
					);
				} else {
					editProfileInfo(data);
				}
			}
		});
	};

	if (!name) {
		return <ProfileSkeleton />;
	}

	return (
		<>
			<DefaultSidebar />
			<ProfileLayout>
				<Row gutter={24}>
					<Col span={24}>
						{getFieldDecorator('attachment')(
							<UserAvatar
								ref={avatarRef}
								loading={editProfileInfoLoading || uploadLoading}
								src={attachmentProfile?.url}
								attachment={attachmentProfile}
								setFieldsValue={setFieldsValue}
								name={`${name} ${lastname || ''}`}
							/>
						)}
					</Col>
					<Col xs={24} md={12}>
						<ProFormItem label="Ad" help={getFieldError('name')?.[0]}>
							{getFieldDecorator('name', {
								initialValue: name,
								rules: baseRules,
							})(<Input />)}
						</ProFormItem>
					</Col>
					<Col xs={24} md={12}>
						<ProFormItem label="Soyad" help={getFieldError('lastname')?.[0]}>
							{getFieldDecorator('lastname', {
								initialValue: lastname,
								rules: baseRules,
							})(<Input />)}
						</ProFormItem>
					</Col>
					<Col xs={24} md={12}>
						<ProFormItem label="Email" help={getFieldError('email')?.[0]}>
							{getFieldDecorator('email', {
								initialValue: email,
								rules: [
									...emailRules,
									{
										type: 'email',
										message: messages.emailFormat,
									},
								],
							})(<Input />)}
						</ProFormItem>
					</Col>
					{/* <Col span={12}>
          <ProFormItem label="Dil">
            <ProSelect size={defaultFormItemSize} />
          </ProFormItem>
        </Col> */}
				</Row>

				<Row gutter={24}>
					<Col xs={24} md={12}>
						<ProFormItem label="Telefon">
							{getFieldDecorator('phoneNumber', {
								initialValue: phoneNumber,
							})(
								<ProMaskedInput
									placeholder="(+994) 99 999-99-99"
									mask="mobilePhoneMask"
								/>
							)}
						</ProFormItem>
					</Col>
					<Col xs={24} md={12}>
						<ProFormItem label="Doğum tarixi">
							{getFieldDecorator('birthday', {
								initialValue: birthday ? moment(birthday, dateFormat) : null,
							})(<ProDatePicker allowClear size={defaultFormItemSize} />)}
						</ProFormItem>
					</Col>

					<Col xs={24} md={12}>
						<ProFormItem label="Mobil nömrə">
							{getFieldDecorator('mobileNumber', {
								initialValue: mobileNumber,
							})(
								<ProMaskedInput
									placeholder="(+994) 99 999-99-99"
									mask="mobilePhoneMask"
								/>
							)}
						</ProFormItem>
					</Col>
					<Col xs={24} md={12}>
						<ProFormItem label="Cinsi" help={getFieldError('gender')?.[0]}>
							{getFieldDecorator('gender', {
								initialValue: gender,
								rules: [
									{
										required: true,
										message: messages.requiredText,
									},
								],
							})(
								<ProSelect size={defaultFormItemSize} data={GenderStatusData} />
							)}
						</ProFormItem>
					</Col>
					<Col span={12}>
						{/* SAVE BUTTON */}
						<Button
							type="primary"
							size="large"
							htmlType="submit"
							onClick={handleSubmit}
							loading={editProfileInfoLoading || uploadLoading}
						// disabled={!isFieldsTouched()}
						>
							Yadda saxla
						</Button>
						{/* /SAVE BUTTON */}
					</Col>
				</Row>
			</ProfileLayout>
		</>
	);
}

const mapStateToProps = state => ({
	profile: state.profileReducer.profile,
	profileLoading: !!state.loadings.fetchProfile,
	editProfileInfoLoading: !!state.loadings.editProfileInfo,
	uploadLoading: !!state.loadings.uploadAttachment,
});

export default connect(
	mapStateToProps,
	{ editProfileInfo, uploadAttachment }
)(Form.create({ name: 'profile' })(Main));
