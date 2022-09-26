import React, { useState } from 'react';
import {
	Sidebar,
	ProSearch,
	ProSidebarItem,
	ProTypeFilterButton,
} from 'components/Lib';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'antd';

const PartnersSidebar = ({ filters, onFilter, handlePaginationChange, openedSidebar, setOpenedSidebar }) => {

	const [name, setName] = useState(filters.name ? filters.name : undefined);
	const [email, setEmail] = useState(filters.email ? filters.email : undefined);
	const [description, setDescription] = useState(filters.description ? filters.description : undefined);
	const handleDefaultFilter = (type, value) => {
		handlePaginationChange(1)
		onFilter(type, value);
	};
	const handleChange = (e, value) => {
		setDescription(e.target.value)
		if (e.target.value === '') {
			onFilter('description', value);
			handlePaginationChange(1)
		}
	};
	const { t } = useTranslation();
	return (
		<Sidebar
			title={t('relations:main:partner')}
			openedSidebar={openedSidebar}
			setOpenedSidebar={setOpenedSidebar}
		>
			<ProSidebarItem label={t('relations:partners:partner')}>
				<ProSearch
					onChange={e => {
						setName(e.target.value)
						if (e.target.value === '') {
							handleDefaultFilter('name', undefined)
							handlePaginationChange(1)
						}
					}
					}
					onSearch={value => handleDefaultFilter('name', value)}
					value={name} />
			</ProSidebarItem>

			<ProSidebarItem label={t('relations:partners:email')}>
				<ProSearch
					onChange={e => {
						setEmail(e.target.value);
						if (e.target.value === '') {
							handleDefaultFilter('email', undefined)
							handlePaginationChange(1)
						}
					}}
					onSearch={value => handleDefaultFilter('email', value)}
					value={email} />
			</ProSidebarItem>

			<ProSidebarItem label={t('relations:partners:type')}>
				<Row>
					<Col span={8}>
						<ProTypeFilterButton
							label={t('relations:partners:all')}
							isActive={!filters.status}
							onClick={() => handleDefaultFilter('status', null)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label={t('relations:partners:deActive')}
							isActive={filters.status === 'deactive'}
							onClick={() => handleDefaultFilter('status', 'deactive')}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label={t('relations:partners:active')}
							isActive={filters.status === 'active'}
							onClick={() => handleDefaultFilter('status', 'active')}
						/>
					</Col>
				</Row>
			</ProSidebarItem>
			<ProSidebarItem label={t('relations:partners:additionalInfo')}>
				<ProSearch
					onSearch={value => handleDefaultFilter('description', value)}
					onChange={(e, value) => handleChange(e, value)}
					value={description}
				/>
			</ProSidebarItem>
		</Sidebar>
	);
};

export default PartnersSidebar;
