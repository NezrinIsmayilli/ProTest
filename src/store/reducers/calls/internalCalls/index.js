import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
	setInternalCalls,
	setCallOperators,
	setUsedCallOperators,
	setUsedCallContacts,
	setCallCount,
	setSelectedCall,
	setSelectedCallParticipant,
} from 'store/actions/calls/internalCalls';

const initialState = {
	internalCalls: [],
	selectedCall: [],
	selectedCallParticipant: [],
	usedOperators: [],
	usedCallContacts: [],
	operators: [],
	isLoading: false,
	actionLoading: false,
	total: 0,
};

export const internalCallsReducer = createReducer(initialState, {
	[apiStart]: (state, action) => {
		if (action.payload === 'internalCalls') {
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
	},
	[apiEnd]: (state, action) => {
		if (action.payload === 'internalCalls') {
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
	},

	[setInternalCalls]: (state, action) => ({
		...state,
		internalCalls: action.payload.data,
	}),
	[setSelectedCall]: (state, action) => ({
		...state,
		selectedCall: action.payload.data,
	}),
	[setSelectedCallParticipant]: (state, action) => ({
		...state,
		selectedCallParticipant: action.payload.data,
	}),
	[setCallOperators]: (state, action) => ({
		...state,
		operators: action.payload.data,
	}),
	[setUsedCallOperators]: (state, action) => ({
		...state,
		usedOperators: action.payload.data,
	}),
	[setUsedCallContacts]: (state, action) => ({
		...state,
		usedCallContacts: action.payload.data,
	}),
	[setCallCount]: (state, action) => ({
		...state,
		total: action.payload,
	}),
});
