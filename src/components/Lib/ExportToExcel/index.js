import React, { useEffect, useState } from 'react';
import { ExcelButton } from 'components/Lib';
import ReactExport from 'react-data-export';
import { Modal, Spin } from 'antd';
import styles from './styles.module.scss';
import { toast } from 'react-toastify';

const { ExcelFile } = ReactExport;
const { ExcelSheet } = ReactExport.ExcelFile;

const ExportToExcel = props => {
	const {
		data: incomingData,
		columns,
		loading,
		disable,
		getExportData,
		excelTitle = '',
		columnHeaderStyle = {
			style: {
				font: { color: { rgb: 'FFFFFF' }, bold: true },
				fill: { patternType: 'solid', fgColor: { rgb: '55ab80' } },
			},
		},
		excelName = 'file',
		filename = 'file',
		count
	} = props;

	const [data, setData] = useState([])
	const [newColumns, setColumns] = useState(columns)
	const [exportModal, setExportModal] = useState(false);

	useEffect(() => {
		setExportModal(false)
		setData(incomingData)
	}, [incomingData])
	const multiDataSet = [
		{
			columns: columns.length>3? [
				{
					title: '',
				},
				{
					title: '',
				},
				{
					title: 'Prospect Cloud ERP',
					style: {
						font: { color: { rgb: '55ab80' }, bold: true, sz: '15' },
						alignment: {
							wrapText: false,
							horizontal: 'right',
						},
					},
				},
				{
					title: `/ ${excelTitle}`,
					style: {
						font: { sz: '15', bold: true },
					},
				},
				{
					title: '',
				},
			]:[	{
				title: 'Prospect Cloud ERP',
				style: {
					font: { color: { rgb: '55ab80' }, bold: true, sz: '15' },
					alignment: {
						wrapText: false,
						horizontal: 'right',
					},
				},
			},
			{
				title: `/ ${excelTitle}`,
				style: {
					font: { sz: '15', bold: true },
				},
			},
			{
				title: '',
			}]
			,
			data: [[]],
		},
		{
			ySteps: 0,
			columns: newColumns,
			data,
		},
	];
	const getData = async () => {
		if(count > 5000) {
            toast.error(
                'Excel-ə çıxarış edilən sətrlərin sayı 5000-dən çox ola bilməz.'
            );
		}
		else {
			setData([])
			getExportData()
			setExportModal(true)
		}
	}

	// useEffect(() => {
	// 	setExportModal(false)
	// }, [incomingData])

	useEffect(() => {
		let newColumn = columns.map(column => Object.assign(column, columnHeaderStyle)
		)
		setColumns(newColumn)
	}, [columns])

	return (
		<>
			<Modal
				maskClosable
				width={600}
				visible={exportModal}
				closable={false}
				footer={null}
				style={{ marginTop: '100px' }}
			>
				<div className={styles.addContacts}>
					<h3>Excel sənədi yüklənir.......</h3>
					<div className={styles.addContacts_text}>
						Yüklənmə prosesi 1-2 dəqiqə davam edə bilər......
					</div>
					<Spin
						size="large"
						spinning
						style={{ marginBottom: '20px' }}
					/>
				</div>
			</Modal>
			<ExcelButton onClick={getData} history={loading} disabled={disable} />
			{data.length > 0 && (
				<ExcelFile hideElement>
					<ExcelSheet dataSet={multiDataSet} name={excelName} />
				</ExcelFile>
			)}
		</>
	);
};


export default ExportToExcel;
