/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
	Sidebar,
	ProSelect,
	ProSidebarItem,
	ProTypeFilterButton,
	ProAsyncSelect,
} from 'components/Lib';
import { fetchCatalogs, fetchFilteredCatalogs } from 'store/actions/catalog';
import { connect } from 'react-redux';
import { productTypes } from 'utils';
import { useCatalog } from 'hooks';
import { Col, Row, Select, Icon } from 'antd';
import { ReactComponent as DownArrow } from 'assets/img/icons/downarrow.svg';
import styles from '../styles.module.scss';

const { Option } = Select;
const CatalogsSideBar = ({
	filters,
	fetchCatalogs,
	fetchFilteredCatalogs,
	onFilter,
	setSubCatalogs,
	setSelectedItemId,
	openedSidebar,
	setOpenedSidebar,
}) => {
	const [componentIsMounted, setComponentIsMounted] = useState(false);
	const [catalogs, setCatalogs] = useState({ root: [], children: {} });
	const [filterSelectedCatalog, setFilterSelectedCatalog] = useState({
		root: [],
	});
	const [selectedCatalogs, setSelectedCatalogs] = useState([]);
	const {
		parentCatalogs,
		childCatalogs,
		handleParentCatalogsChange,
		handleChildCatalogsChange,
	} = useCatalog();

	const handleSerialNumber = type => {
		onFilter('serialNumber', type);
	};
	useEffect(() => {
		if (catalogs.root.length === 0) fetchCatalogs();
	}, []);

	useEffect(() => {
		if (parentCatalogs.length > 0) {
			const firstCatalog = parentCatalogs[0]?.id;
			setSelectedItemId(firstCatalog);
			setSubCatalogs(catalogs.children[firstCatalog]);
		}
	}, [parentCatalogs[0]?.id]);

	useEffect(() => {
		if (componentIsMounted) {
			onFilter(
				'rootCatalogs',
				parentCatalogs.map(parentCatalog => parentCatalog.id)
			);
			onFilter(
				'productCatalogs',
				childCatalogs.map(childCatalog => childCatalog.id)
			);
		} else {
			setComponentIsMounted(true);
		}
	}, [parentCatalogs, childCatalogs]);

	const ajaxCatalogsSelectRequest = (
		page = 1,
		limit = 20,
		search = '',
		stateReset = 0,
		onSuccessCallback
	) => {
		const defaultFilters = { limit, page, name: search };
		fetchFilteredCatalogs(defaultFilters, data => {
			let appendList = {};
			if (data.data) {
				appendList = data.data;
			}
			if (onSuccessCallback !== undefined) {
				onSuccessCallback(!Object.keys(appendList).length);
			}
			if (stateReset) {
				setCatalogs(appendList);
			} else {
				setCatalogs({
					...appendList,
					root: catalogs.root.concat(appendList.root),
				});
			}
		});
	};
	return (
		<Sidebar
			title="Kataloq"
			openedSidebar={openedSidebar}
			setOpenedSidebar={setOpenedSidebar}
		>
			<ProSidebarItem label="Kataloq növü">
				<ProSelect
					allowClear
					onChange={value =>
						onFilter(
							'serviceType',
							value === 2 ? 1 : value === 1 ? 2 : undefined
						)
					}
					data={productTypes}
				/>
			</ProSidebarItem>
			<ProSidebarItem label="Seriya nömrə">
				<Row>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hamısı"
							isActive={filters.serialNumber === undefined}
							onClick={() => handleSerialNumber(undefined)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Hə"
							isActive={
								filters.serialNumber === 2 ? 'primary' : ''
							}
							onClick={() => handleSerialNumber(2)}
						/>
					</Col>
					<Col span={8}>
						<ProTypeFilterButton
							label="Yox"
							onClick={() => handleSerialNumber(1)}
							isActive={
								filters.serialNumber === 1 ? 'primary' : ''
							}
						/>
					</Col>
				</Row>
			</ProSidebarItem>
			<ProSidebarItem label="Kataloq">
				<ProAsyncSelect
					mode="multiple"
					selectRequest={ajaxCatalogsSelectRequest}
					valueOnChange={newCatalogs => {
						setSelectedCatalogs([
							...selectedCatalogs,
							...catalogs.root
								?.filter(catalog =>
									newCatalogs.includes(catalog.id)
								)
								.filter(
									d =>
										!new Set(
											selectedCatalogs.map(de => de.id)
										).has(d.id)
								),
						]);
						filterSelectedCatalog.root.length > 0
							? handleParentCatalogsChange(
								newCatalogs,
								[
									...filterSelectedCatalog.root,
									...catalogs.root.filter(
										item =>
											!filterSelectedCatalog.root
												.map(({ id }) => id)
												?.includes(item.id)
									),
								]
									?.filter(catalog =>
										newCatalogs.includes(catalog.id)
									)
									.map(catalog => ({ props: { catalog } }))
							)
							: handleParentCatalogsChange(
								newCatalogs,
								[
									...selectedCatalogs,
									...catalogs.root?.filter(
										d =>
											!new Set(
												selectedCatalogs.map(
													de => de.id
												)
											).has(d.id)
									),
								]
									?.filter(catalog =>
										newCatalogs.includes(catalog.id)
									)
									.map(catalog => ({ props: { catalog } }))
							);
					}}
					data={
						filterSelectedCatalog.root.length > 0
							? [
								...filterSelectedCatalog.root,
								...catalogs.root.filter(
									item =>
										!filterSelectedCatalog.root
											.map(({ id }) => id)
											?.includes(item.id)
								),
							]
							: catalogs.root || []
					}
					// data={catalogs.root || []}
					value={
						filters.rootCatalogs
							? filters.rootCatalogs.map(Number)
							: parentCatalogs.map(
								parentCatalog => parentCatalog.id
							)
					}
				/>
			</ProSidebarItem>

			<ProSidebarItem label="Alt kataloq">
				<Select
					// loading={isLoading}
					value={childCatalogs.map(childCatalog => childCatalog.id)}
					onChange={(newCatalogs, options) =>
						handleChildCatalogsChange(newCatalogs, options)
					}
					mode="multiple"
					placeholder="Seçin"
					suffixIcon={<Icon component={DownArrow} />}
					showArrow
					disabled={!parentCatalogs.length}
					className={styles.select}
					size="large"
					allowClear
					filterOption={(input, option) =>
						option.props.children
							.replace('İ', 'I')
							.toLowerCase()
							.includes(input.replace('İ', 'I').toLowerCase())
					}
				>
					{parentCatalogs.map(parentCatalog =>
						catalogs.children[parentCatalog.id]?.map(subCatalog => (
							<Option
								key={subCatalog.id}
								value={subCatalog.id}
								id={subCatalog.id}
								className={styles.dropdown}
								catalog={subCatalog}
							>
								{subCatalog.name}
							</Option>
						))
					)}
				</Select>
			</ProSidebarItem>
		</Sidebar>
	);
};

const mapStateToProps = state => ({
	catalogs: state.catalogsReducer.catalogs,
});

export default connect(
	mapStateToProps,
	{
		fetchCatalogs,
		fetchFilteredCatalogs,
	}
)(CatalogsSideBar);
