import { createReducer } from 'redux-starter-kit';
import { currentYear } from 'utils';

import {
  resetConfiguration,
  setIsEditible,
  setBonusConfiguration,
  setSelectedConfiguration,
  setProductConfiguration,
  setEmployeeBonuses,
  setSelectedEmployeeBonuses,
  setSelectedProductConfiguration,
} from 'store/actions/finance/salesBonus';

const initialState = {
  bonusConfiguration: [],
  productConfiguration: [],
  selectedProductConfiguration: [],
  employeeBonuses: [],
  selectedEmployeeBonuses: [],
  selectedConfiguration: undefined,
  calendarSelectedYear: currentYear,
  selectedCalendarDay: undefined,
};

export const bonusConfigurationReducer = createReducer(initialState, {
  [setBonusConfiguration]: (state, action) => ({
    ...state,
    bonusConfiguration: action.payload.data,
    selectedConfiguration:
      state.selectedConfiguration || action.payload.data[0],
  }),
  [setSelectedConfiguration]: (state, action) => ({
    ...state,
    selectedConfiguration: action.payload.attribute,
  }),
  [setIsEditible]: (state, action) => ({
    ...state,
    isEditible: action.payload.attribute,
  }),
  [setProductConfiguration]: (state, action) => ({
    ...state,
    productConfiguration: action.payload.data,
  }),
  [setEmployeeBonuses]: (state, action) => ({
    ...state,
    employeeBonuses: action.payload.data,
  }),
  [setSelectedEmployeeBonuses]: (state, action) => ({
    ...state,
    selectedEmployeeBonuses: action.payload.data,
  }),
  [setSelectedProductConfiguration]: (state, action) => {
    const { newSelectedProducts } = action.payload;
    return {
      ...state,
      selectedProductConfiguration: newSelectedProducts,
    };
  },
  [resetConfiguration]: () => initialState,
});
