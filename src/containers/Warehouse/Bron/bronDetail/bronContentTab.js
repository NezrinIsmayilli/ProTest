import React, { useEffect, useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import { Row, Col, Button, Table, Input, Checkbox, Tooltip } from 'antd';
import { ProSelect } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import moment from 'moment';
import styles from '../../styles.module.scss';

const math = require('exact-math');

const HeaderItem = ({ gutterBottom = true, name, secondary, children }) => (
	<div className={styles.columnDetailItem}>
		<label
			style={{
				marginBottom: gutterBottom ? 12 : 0,
			}}
		>
			{name}
		</label>
		{secondary ? <span>{secondary}</span> : children}
	</div>
);

function BronInvoiceContentTab({
	details,
	visible,
	isLoading,
	tableDatas,
	setInvoiceLength,
}) {
	const componentRef = useRef();
	const [filters, setFilters] = useState({
		productNames: [],
		serialNumbers: [],
	});
	const [checked, setChecked] = useState(false);
	const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
	const {
		clientName,
		contractNo,
		invoiceNumber,
		createdAt,
		orderSerialNumber,
		orderDirection,
	} = details;

	const columns = [
		{
			title: '№',
			dataIndex: 'id',
			width: 80,
			render: (value, row, index) => index + 1,
		},
		{
			title: 'Məhsul adı',
			dataIndex: 'productName',
			width: 180,
		},
		{
			title: 'Say ',
			dataIndex: 'quantity',
			align: 'center',
			width: 80,
			render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
		},
		{
			title: 'Seriya nömrəsi',
			dataIndex: 'serialNumber',
			align: 'center',
			width: 140,
			render: value =>
				value ? (
					checked && value.length > 1 ? (
						<div style={{ display: 'inline-flex', alignItems: 'center' }}>
							{value[0]}
							<Tooltip
								placement="right"
								title={
									<div style={{ display: 'flex', flexDirection: 'column' }}>
										{value.map(serialNumber => (
											<span>{serialNumber}</span>
										))}
									</div>
								}
							>
								<span className={styles.serialNumberCount}>{value.length}</span>
							</Tooltip>
						</div>
					) : (
						value
					)
				) : (
					'-'
				),
		},
		{
			title: 'Ölçü vahidi',
			dataIndex: 'unitOfMeasurementName',
			align: 'center',
			width: 150,
		},
	];
	useEffect(() => {
		if (!visible) {
			setFilters({ productNames: [], serialNumbers: [] });
			setChecked(false);
		}
	}, [visible]);
	useEffect(() => {
		if (checked) {
			setInvoiceLength(
				getFilteredInvoices(mergedInvoiceContent, filters).reduce(
					(total, { quantity }) => math.add(total, Number(quantity) || 0),
					0
				)
			);
		} else {
			setInvoiceLength(
				getFilteredInvoices(tableDatas, filters).reduce(
					(total, { quantity }) => math.add(total, Number(quantity) || 0),
					0
				)
			);
		}
	}, [checked, filters, mergedInvoiceContent, tableDatas]);
	useEffect(() => {
		let tmp = {};
		if (checked && tableDatas.length > 0) {
			tableDatas.forEach((value, index) => {
				if (tmp[value.productId]) {
					tmp = {
						...tmp,
						[value.productId]: {
							...tmp[value.productId],
							quantity: tmp[value.productId].quantity + Number(value.quantity),
							serialNumber: value.serialNumber
								? [...tmp[value.productId].serialNumber, value.serialNumber]
								: undefined,
						},
					};
				} else {
					tmp[value.productId] = {
						id: index + 1,
						product: value.productId,
						productName: value.productName,
						catalogName: value.catalogName,
						serialNumber: value.serialNumber ? [value.serialNumber] : undefined,
						quantity: Number(value.quantity),
						unitOfMeasurementName: value.unitOfMeasurementName,
						currencyCode: value.currencyCode,
					};
				}
			});
			setMergedInvoiceContent(Object.values(tmp));
		} else {
			setMergedInvoiceContent([]);
		}
	}, [checked, tableDatas]);
	const handleCheckbox = checked => {
		if (checked) {
			setChecked(true);
		} else {
			setChecked(false);
		}
	};
	const filterDuplicates = (tableDatas, field) => {
		const data = [];
		return tableDatas.reduce((total, current) => {
			if (data.includes(current[field])) {
				return total;
			}
			data.push(current[field]);
			return [...total, { name: current[field] }];
		}, []);
	};
	const filterSerialNumber = (tableDatas, field) =>
		tableDatas.reduce((total, current) => {
			if (current[field] === null) {
				return total;
			}
			return [...total, { name: current[field] }];
		}, []);

	const handleFilter = (type, value) => {
		setFilters(prevFilters => ({
			...prevFilters,
			[type]: value,
		}));
	};
	const getFilteredInvoices = (tableData, { productNames, serialNumbers }) => {
		if (productNames.length > 0 || serialNumbers.length > 0) {
			const newtableDatas = tableData.filter(
				({ productName, serialNumber }) => {
					if (
						(productNames.length > 0
							? productNames.includes(productName)
							: true) &&
						(serialNumbers.length > 0
							? checked
								? serialNumber?.some(serialNum =>
									serialNumbers.includes(serialNum)
								)
								: serialNumbers.includes(serialNumber)
							: true)
					) {
						return true;
					}
					return false;
				}
			);
			return newtableDatas;
		}
		return tableData;
	};
	return (
		<div ref={componentRef} style={{ width: '100%', paddingTop: '20px' }}>
			{/* <div
                className={styles.exportBox}
                style={{
                    marginTop: 40,
                }}
            > */}
			<Row gutter={16}>
				{/* <div className={styles.exportBox}> */}
				{clientName ? (
					<Col md={24} sm={24} xs={24}>
						<div
							className={styles.columnDetailItem}
							style={{ marginBottom: 20 }}
						>
							<label
								style={{
									fontWeight: 600,
									fontSize: 24,
									lineHeight: '24px',
									marginBottom: 10,
									color: '#373737',
								}}
							>
								{clientName}
							</label>
						</div>
					</Col>
				) : (
					''
				)}
				<Col md={6} sm={12} xs={24}>
					<HeaderItem name="Sənəd" secondary={invoiceNumber || '-'} />
				</Col>
				<Col md={6} sm={12} xs={24}>
					<HeaderItem name="Müqavilə" secondary={contractNo || '-'} />
				</Col>
				<Col md={6} sm={12} xs={24}>
					<HeaderItem
						name="Sifariş"
						secondary={
							orderSerialNumber
								? orderDirection === 1
									? `SFD${moment(
										createdAt.replace(
											/(\d\d)-(\d\d)-(\d{4})/,
											'$3'
										),
										'YYYY'
									).format('YYYY')}/${orderSerialNumber}`
									: `SFX${moment(
										createdAt.replace(
											/(\d\d)-(\d\d)-(\d{4})/,
											'$3'
										),
										'YYYY'
									).format('YYYY')}/${orderSerialNumber}`
								: '-'
						}
					/>
				</Col>
				<Col md={6} sm={12} xs={24}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<HeaderItem
							name="Tarix"
							secondary={
								createdAt?.replace(
									/(\d{4})-(\d\d)-(\d\d)/,
									'$3-$2-$1'
								) || '-'
							}
						/>
						{/* </div> */}
						<ReactToPrint
							trigger={() => (
								<Button
									className={styles.customSquareButton}
									style={{ marginRight: 10, marginTop: 10 }}
									shape="circle"
									icon="printer"
								/>
							)}
							content={() => componentRef.current}
						/>
					</div>
				</Col>
				{/* </div> */}
			</Row>
			<Row gutter={16}>
				<div
					style={{
						marginTop: 40,
					}}
				>
					<Col md={6} sm={12} xs={24}>
						<Input.Group>
							<span className={styles.filterName}>Məhsul adı</span>
							<ProSelect
								mode="multiple"
								id={false}
								size="medium"
								value={filters.productNames}
								data={filterDuplicates(tableDatas, 'productName')}
								onChange={values =>
									handleFilter('productNames', values)
								}
							/>
						</Input.Group>
					</Col>
					<Col md={6} sm={12} xs={24}>
						<Input.Group>
							<span className={styles.filterName}>
								Seriya nömrəsi
							</span>
							<ProSelect
								mode="multiple"
								id={false}
								size="medium"
								value={filters.serialNumbers}
								data={filterSerialNumber(
									tableDatas,
									'serialNumber'
								)}
								onChange={values =>
									handleFilter('serialNumbers', values)
								}
							/>
						</Input.Group>
					</Col>
					<Col md={12} sm={12} xs={24}>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '23px' }}>
							<Checkbox
								onChange={event => handleCheckbox(event.target.checked)}
								checked={checked}
							>
								Qruplaşdır
							</Checkbox>
						</div>
					</Col>
				</div>
			</Row>
			<div
				className={styles.opInvTable}
				style={{
					marginTop: 32,
					maxHeight: 600,
					overflowY: 'auto',
				}}
			>
				<Table
					scroll={{ x: 'max-content' }}
					dataSource={
						checked
							? getFilteredInvoices(mergedInvoiceContent, filters)
							: getFilteredInvoices(tableDatas, filters)
					}
					loading={isLoading}
					className={styles.opInvoiceContentTable}
					columns={columns}
					pagination={false}
					rowKey={record => record.id}
					rowClassName={styles.row}
				/>
			</div>
		</div>
	);
}

export default BronInvoiceContentTab;
