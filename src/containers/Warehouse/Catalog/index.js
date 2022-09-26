/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'antd';
import swal from '@sweetalert/with-react';
// actions
import {
	fetchCatalogs,
	deleteCatalog,
	editCatalog,
	createCatalog,
	fetchFilteredCatalogs,
} from 'store/actions/catalog';
import { useFilterHandle } from 'hooks';
import AddCatalog from 'components/Lib/AddCatalog/AddCatalog';
import { IoFilterCircleOutline } from 'react-icons/io5';
import CatalogsSideBar from './Sidebar';
import SubCatalogs from './subCatalogs';
import Catalogs from './catalogs';

import styles from '../styles.module.scss'

function Kataloqlar(props) {
	const {
		fetchFilteredCatalogs,
		filteredCatalogs,
		fetchCatalogs,
		deleteCatalog,
		catalogs,
	} = props;

	const [filters, onFilter] = useFilterHandle(
		{
			serviceType: undefined,
			serialNumber: undefined,
			catalogId: undefined,
			parentCatalogIds: undefined,
			catalogIds: undefined,
			limit: 1000,
			q: undefined,
		},
		({ filters }) => {
			fetchFilteredCatalogs(filters);
		}
	);

	const [subCatalogs, setSubCatalogs] = useState([]);
	const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(
		undefined
	);
	const [editCatalogDefaults, setEditCatalogDefaults] = useState({});
	const [selectedItemId, setSelectedItemId] = useState(undefined);
	const [parentCatalogName, setParentCatalogName] = useState(undefined);
	const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
	const [catalogModalType, setCatalogModalType] = useState('');
	const [edit, setEdit] = useState('add');

	useEffect(() => {
		if (catalogs.root.length <= 0) {
			fetchCatalogs();
		}
	}, []);

	useEffect(() => {
		if (selectedItemId) setSubCatalogs(catalogs.children[selectedItemId]);
	}, [catalogs]);

	const handleNewCatalogClick = type => {
		setCatalogModalType(type);
		setCatalogModalIsVisible(true);
		setEdit('add');
	};
	const handleSelectRootCatalog = vals => {
		setSelectedItemId(vals.id);
		setParentCatalogName(vals.name);
		setSubCatalogs(catalogs.children[vals.id]);
	};

	useEffect(
		() => {
			if (filteredCatalogs?.root?.length > 0) {
				const firstCatalogId = filteredCatalogs?.root[0]?.id;
				const firstCatalogName = filteredCatalogs?.root[0]?.name;
				setSelectedItemId(firstCatalogId);
				setParentCatalogName(firstCatalogName);
				setSubCatalogs(catalogs.children[firstCatalogId]);
			}
		},
		[filteredCatalogs?.root[0]?.id],
		filteredCatalogs?.root[0]?.name
	);

	const onSuccessAddModal = () => { };
	const removeCatalog = catalogId => {
		swal({
			title: 'Diqqət!',
			text: 'Silmək istədiyinizə əminsiniz?',
			buttons: ['Ləğv et', 'Sil'],
			dangerMode: true,
		}).then(willDelete => {
			if (willDelete) {
				if (catalogId === selectedItemId) setSelectedItemId(undefined);
				deleteCatalog(catalogId);
			}
		});
	};
	const onUpdate = (id, data) => {
		setEditCatalogDefaults({ ...data });
		setSelectedItemForUpdate(id);
		setEdit('edit');
		setCatalogModalIsVisible(true);
	};

	const [openedSidebar, setOpenedSidebar] = React.useState(false);

	return (
		<div>
			<CatalogsSideBar
				{...{
					filters,
					onFilter,
					setSubCatalogs,
					setSelectedItemId,
					openedSidebar,
					setOpenedSidebar
				}}
			/>
			<AddCatalog
				isVisible={catalogModalIsVisible}
				setIsVisible={setCatalogModalIsVisible}
				type={catalogModalType}
				parentCatalogId={selectedItemId}
				parentCatalogName={parentCatalogName}
				setParentCatalogName={setParentCatalogName}
				onSuccessAddModal={onSuccessAddModal}
				editCatalogDefaults={editCatalogDefaults}
				edit={edit}
				selectedItemForUpdate={selectedItemForUpdate}
			/>
			<section
				className="scrollbar aside"
				style={{ padding: '40px 32px' }}
			>
				<Row className={styles.pageToolsContainer}>
					<Col>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'flex-end',
							}}
						>
							<div className={styles.responsiveFilterButton}>
								<button
									type="button"
									onClick={() => setOpenedSidebar(!openedSidebar)}
								>
									<IoFilterCircleOutline />
								</button>
							</div>
						</div>
					</Col>
				</Row>
				<Row gutter={8}>
					<Col xs={12} sm={12} md={12}>
						<Catalogs
							filters={filters}
							deleteClick={removeCatalog}
							editClick={onUpdate}
							altClick={() => handleNewCatalogClick('catalog')}
							selectItem={handleSelectRootCatalog}
							{...{
								selectedItemId,
								parentCatalogName,
							}}
						/>
					</Col>
					<Col xs={12} sm={12} md={12}>
						<SubCatalogs
							filters={filters}
							deleteClick={removeCatalog}
							editClick={onUpdate}
							disabledCreate={selectedItemId === undefined}
							altClick={() =>
								handleNewCatalogClick('sub-catalog')
							}
							items={subCatalogs}
							{...{
								selectedItemId,
								parentCatalogName,
							}}
						/>
					</Col>
				</Row>
			</section>
		</div>
	);
}

const mapStateToProps = state => ({
	catalogsCount: state.catalogsReducer.filteredCatalogs.root.length,
	catalogs: state.catalogsReducer.catalogs,
	filteredCatalogs: state.catalogsReducer.filteredCatalogs,
});

export default connect(
	mapStateToProps,
	{
		fetchCatalogs,
		deleteCatalog,
		editCatalog,
		createCatalog,
		fetchFilteredCatalogs,
	}
)(Kataloqlar);
