/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	fetchInternalCalls,
	fetchInternalCallsRecording,
	getTotalCallCount,
	fetchSelectedCall,
	fetchSelectedCallParticipant,
} from 'store/actions/calls/internalCalls';
import { accessTypes, permissions } from 'config/permissions';
import { ExcelButton, Can } from 'components/Lib';
import { cookies } from 'utils/cookies';
import { useFilterHandle } from 'hooks';
import MoreDetails from '../InternalCalls/internalCallDetail';
import CallSidebar from './Sidebar';
import Table from './Table';
import CallTabs from '../Tabs';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
const token = cookies.get('_TKN_CALL_');
const url =
	process.env.NODE_ENV === 'production'
		? process.env.REACT_APP_API_URL_PROCALL
		: process.env.REACT_APP_DEV_API_URL_PROCALL;
const Answered = props => {
	const {
		fetchInternalCalls,
		fetchSelectedCallParticipant,
		fetchSelectedCall,
		getTotalCallCount,
		selectedCallDetail,
		selectedCallParticipant,
	} = props;

	const history = useHistory();
  const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });

	const [excelFileLoading, setExcelFileLoading] = useState(false);
	const [selectedCall, setSelectedCall] = useState(undefined);
	const [detailIsVisible, setDetailIsVisible] = useState(false);
	const [answeredCallData, setAnsweredCallData] = useState([]);
	const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
	const [data, setData] = useState([
		{
			id: null,
			record: null,
		},
	]);
	const [filters, onFilter,setFilters] = useFilterHandle(
		{
			directions:params.directions ? params.directions : [1, 2],
			statuses:params.statuses ? params.statuses : [1],
			dateFrom: params.dateFrom ? params.dateFrom :undefined,
      dateTo: params.dateTo ? params.dateTo : undefined,
			fromNumber:params.fromNumber ? params.fromNumber : undefined,
			toNumber:params.toNumber ? params.toNumber : undefined,
			prospectContacts:params.prospectContacts ? params.prospectContacts : [],
			types:params.types ? params.types :undefined,
			appealTypes:params.appealTypes ? params.appealTypes : [],
			fromOperators:params.fromOperators ? params.fromOperators : [],
			toOperators:params.toOperators ? params.toOperators : [],
			operators:params.operators ? params.operators : undefined,
			parentAppealTypes:params.parentAppealTypes ? params.parentAppealTypes : undefined,
			appealTypes:params.appealTypes ? params.appealTypes : undefined,
			limit: pageSize,
      page: currentPage,
		},
		({ filters }) => {
			const query = filterQueryResolver({ ...filters });
            if (typeof filters.history === 'undefined') {
                history.push({
                    search: query,
                });
            }
			fetchInternalCalls({
				filters,
				onSuccessCallback: response => {
					setAnsweredCallData(response.data);
					getTotalCallCount({ filters });
					response.data.map(index =>
						index.recording
							? fetch(
								`${url}/recordings/${index.recording?.id}/download`,
								{
									method: 'GET',
									headers: {
										'X-AUTH-PROTOKEN': token,
									},
								}
							)
								.then(response => response.blob())
								.then(blob => {
									const objectUrl = window.URL.createObjectURL(
										blob
									);
									setData(prevState => [
										...prevState,
										{
											id: index.recording?.id,
											record: objectUrl,
										},
									]);
								})
							: null
					);
				},
			});
		}
	);

	const [rerender, setRerender] = useState(0);
  const popstateEvent = () => {
      setRerender(rerender + 1);
  };

  useEffect(() => {
      window.addEventListener('popstate', popstateEvent);
      return () => window.removeEventListener('popstate', popstateEvent);
  }, [rerender]);

  useEffect(() => {
      const parmas = queryString.parse(location.search, {
          arrayFormat: 'bracket',
      });

      if (rerender > 0) {
          parmas.history = 1;

          if (parmas.page && !isNaN(parmas.page)) {
              setCurrentPage(parseInt(parmas.page));
          }
          setFilters({ ...parmas });
      }
  }, [rerender]);

	const handleChange = value => {
    onFilter('page', value);
		return (() => setCurrentPage(value))();
  };

	useEffect(() => {
		if (selectedCall) {
			setDetailIsVisible(true);
			fetchSelectedCall({ id: selectedCall?.id });
			fetchSelectedCallParticipant({ id: selectedCall?.id });
		}
	}, [selectedCall]);
	const handleCalls = () => { };
	return (
		<>
			<CallSidebar
				filters={filters}
				onFilter={onFilter}
				setAnsweredCallData={setAnsweredCallData}
				handleChange={handleChange}
			/>
			{detailIsVisible && (
				<MoreDetails
					data={data}
					visible={detailIsVisible}
					setIsVisible={setDetailIsVisible}
					selectedCall={selectedCall}
					selectedCallDetail={selectedCallDetail}
					selectedCallParticipant={selectedCallParticipant}
					setSelectedCall={setSelectedCall}
					filter={filters}
					isView="answered"
				/>
			)}
			<section
				id="container-area"
				className="aside scrollbar"
				style={{
					paddingBottom: 100,
					display: 'flex',
					flexDirection: 'column',
					paddingTop: 24,
					paddingRight: 32,
					paddingLeft: 32,
				}}
			>
				<CallTabs>
					<Can I={accessTypes.manage} a={permissions.answered_calls}>
						<ExcelButton
							loading={excelFileLoading}
							onClick={handleCalls}
						/>
					</Can>
				</CallTabs>
				<Table
					filters={filters}
					onFilter={onFilter}
					data={data}
					currentPage={currentPage}
					pageSize={pageSize}
					setPageSize={setPageSize}
					handleChange={handleChange}
					answeredCallData={answeredCallData}
					setSelectedCall={setSelectedCall}
				/>
			</section>
		</>
	);
};

const mapStateToProps = state => ({
	selectedCallDetail: state.internalCallsReducer.selectedCall,
	selectedCallParticipant: state.internalCallsReducer.selectedCallParticipant,
	permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export const AnsweredCalls = connect(
	mapStateToProps,
	{
		fetchInternalCalls,
		fetchInternalCallsRecording,
		getTotalCallCount,
		fetchSelectedCall,
		fetchSelectedCallParticipant,
	}
)(Answered);
