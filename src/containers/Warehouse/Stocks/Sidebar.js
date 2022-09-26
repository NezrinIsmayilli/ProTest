/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
	Sidebar,
	ProSearch,
	ProSidebarItem,
	ProSelect,
	ProAsyncSelect,
} from 'components/Lib';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { connect } from 'react-redux';

const StocksSidebar = props => {
	const {
		onFilter,
		filters,
		profile,
		handlePaginationChange,
		fetchBusinessUnitList,
		openedSidebar,
		setOpenedSidebar,
	} = props;
	const [stockName, setStockName] = useState(filters.q ? filters.q : null);
	const [businessUnits, setBusinessUnits] = useState([]);
	const [
		filterSelectedBusinessUnit,
		setFilterSelectedBusinessUnit,
	] = useState([]);
	useEffect(() => {
		if (filters.businessUnitIds) {
			fetchBusinessUnitList({
				filters: {
					isDeleted: 0,
					businessUnitIds: profile.businessUnits?.map(({ id }) => id),
					ids: filters.businessUnitIds.map(Number),
				},
				onSuccess: data => {
					const appendList = [];
					if (data.data) {
						data.data.forEach(element => {
							appendList.push({
								id: element.id,
								name: element.name,
								...element,
							});
						});
					}
					setFilterSelectedBusinessUnit(appendList);
				},
			});
		}
	}, []);
	const ajaxBusinessUnitSelectRequest = (
		page = 1,
		limit = 20,
		search = '',
		stateReset = 0,
		onSuccessCallback
	) => {
		const filters = {
			limit,
			page,
			name: search,
			isDeleted: 0,
			businessUnitIds: profile.businessUnits?.map(({ id }) => id),
		};
		fetchBusinessUnitList({
			filters,
			onSuccess: data => {
				const appendList = [];
				if (data.data) {
					data.data.forEach(element => {
						appendList.push({
							id: element.id,
							name: element.name,
							...element,
						});
					});
				}
				if (onSuccessCallback !== undefined) {
					onSuccessCallback(!appendList.length);
				}
				if (stateReset) {
					setBusinessUnits(appendList);
				} else {
					setBusinessUnits(businessUnits.concat(appendList));
				}
			},
		});
	};

	return (
		<Sidebar
			title="Anbar"
			openedSidebar={openedSidebar}
			setOpenedSidebar={setOpenedSidebar}
		>
			{businessUnits?.length === 1 &&
				profile.businessUnits.length === 0 ? null : (
				<ProSidebarItem label="Biznes blok">
					<ProAsyncSelect
						selectRequest={ajaxBusinessUnitSelectRequest}
						mode="multiple"
						valueOnChange={values => {
							handlePaginationChange(1);
							onFilter('businessUnitIds', values);
						}}
						value={
							filters.businessUnitIds
								? filters.businessUnitIds.map(Number)
								: businessUnits?.length === 1
									? businessUnits[0]?.id === null
										? businessUnits[0]?.name
										: businessUnits[0]?.id
									: filters.businessUnitIds
						}
						disabled={businessUnits?.length === 1}
						data={
							filterSelectedBusinessUnit.length > 0
								? [
									...filterSelectedBusinessUnit.filter(
										item => item.id !== null
									),
									...businessUnits
										?.map(item =>
											item.id === null
												? { ...item, id: 0 }
												: item
										)
										.filter(
											item =>
												!filterSelectedBusinessUnit
													.map(({ id }) => id)
													?.includes(item.id)
										),
								]
								: businessUnits?.map(item =>
									item.id === null
										? { ...item, id: 0 }
										: item
								)
						}
						disabledBusinessUnit={businessUnits?.length === 1}
					/>
				</ProSidebarItem>
			)}
			<ProSidebarItem label="Anbar adı">
				<ProSearch
					onChange={e => {
						setStockName(e.target.value);
						if (e.target.value === '') {
							handlePaginationChange(1);
							onFilter('q', undefined);
						}
					}}
					onSearch={value => {
						handlePaginationChange(1);
						onFilter('q', value);
					}}
					value={stockName}
				/>
			</ProSidebarItem>
		</Sidebar>
	);
};

const mapStateToProps = state => ({
	stocks: state.stockReducer.stocks,
});

export default connect(
	mapStateToProps,
	{ fetchBusinessUnitList }
)(StocksSidebar);
