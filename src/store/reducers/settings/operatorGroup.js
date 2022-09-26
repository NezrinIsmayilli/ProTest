import { createReducer } from 'redux-starter-kit';
import { setOperatorGroup } from 'store/actions/settings/operatorGroup';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
	operatorGroup: [],
	isLoading: false,
	actionLoading: false,
	// unused
	added: false,
	edited: false,
};

export const OperatorGroupReducer = createReducer(initialState, {
	[apiStart]: (state, action) => {
		if (action.payload === 'fetchIvr') {
			return {
				...state,
				isLoading: true,
			};
		}
		if (action.payload === 'action') {
			return {
				...state,
				actionLoading: true,
			};
		}
		if (action.payload === 'fetchOperatorGroup') {
			return {
				...state,
				actionLoading: true,
			};
		}
	},
	[apiEnd]: (state, action) => {
		if (action.payload === 'fetchIvr') {
			return {
				...state,
				isLoading: false,
			};
		}
		if (action.payload === 'action') {
			return {
				...state,
				actionLoading: false,
			};
		}
		if (action.payload === 'fetchOperatorGroup') {
			return {
				...state,
				actionLoading: false,
			};
		}
	},
	[setOperatorGroup]: (state, action) => ({
		...initialState,
		operatorGroup: action.payload.data,
		added: action.payload.attribute === 'added',
		edited: action.payload.attribute === 'edited',
	}),
});
