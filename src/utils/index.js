import createReducer from './reducerCreator';

export {
  updateQueryStringParameter,
  addQueryStringToURL,
  getQueryStringFromUrl,
} from './history';

export { messages } from './messages';

export { groupByKey } from './groupByKey';
export { toastHelper } from './toastHelper';
export {
  today,
  yesterday,
  todayWithMinutes,
  dateFormat,
  formItemSize,
  accountTypeOptions,
  operationNames,
  expeditorStages,
  thisWeekStart,
  thisWeekEnd,
  thisMonthStart,
  thisMonthEnd,
  thisYearStart,
  thisYearEnd,
  connectTypes,
  userSearchConnectOperationTypes,
  workerOperationTypes,
  reportHistoryOperationStatus,
  formatDate,
  defaultFormItemSize,
  optionsMonth,
  optionsYear,
  currentDay,
  currentMonth,
  currentYear,
  minimumDate,
  maximumDate,
  userConnectTypesNames,
  contactTypes,
  contactCategories,
  userStatusTypes,
  fullDateTimeWithSecond,
  productTypes,
  typeOfOperations,
  paymentStatuses,
  re_percent,
  accountTypes,
  paymentType,
  re_amount,
  re_paymentAmount,
  orderStages,
  sortedStatuses,
  visualStatuses,
  historyStatuses,
  orderStatuses,
  order_statuses,
  fullDateTime,
  orderTabs,
  orderTabsOrder,
  orderDirections,
  re_quantity,
  expenseTypes,
  years,
  months,
  quarters,
  profitAndLossSummaryRows,
  profitAndLossReportsWithoutDetail,
  balanceSheetWithoutDetail,
  internalCallTabs,
  allModules,
  moduleForFilter,
} from './constants';
export { isFormValid } from './isFormValid';
export { createReducer };
export { decToRgb } from './decToRgb';
export { apiErrorMessageResolver } from './apiErrorMessageResolver';
export { ErrorMessage } from './errorMessage';
export { filterQueryResolver } from './filterQueryResolver';
export { getSalaryOperationTypeName } from './getSalaryOperationTypeName';
export { exportFileDownloadHandle } from './exportFileDownloadHandle';
export { onChangeDateHandle } from './onChangeDateHandle';
export {
  AppealHistoryStatus,
  AppealHistoryStatusData,
  AppealStatus,
  AppealStatusData,
  FamilyStatusData,
  FamilyStatus,
  GenderStatusData,
  GenderStatus,
  ExperienceStatus,
  ExperienceStatusData,
  EducationStatus,
  EducationStatusData,
  WorkGraphicStatus,
  WorkGraphicStatusData,
  AppealOriginTypes,
  AppealRoutesStatus,
  InterviewResultOptions,
  languagesPossessionData,
} from './jobsStatusConstants';

export {
  attendanceJournalStatusData,
  employeeActivityTypes,
  workTimeEventCodes,
} from './hrmConstants';

export { useShallowEqualSelector } from './useShallowEqualSelector';
export { getRandomArbitrary } from './getRandomArbitrary';
export { deleteModalHelper } from './deleteModalHelper';
export { featuresNamesByGroupKey } from './constants';
export { isValidNumber } from './inputValidations';
export { getAvaliableTab } from './getAvaliableTab';
export { formatToLocaleString } from './formatToLocaleString';
export { toFixedNumber } from './toFixedNumber';
export {
  formatNumberToLocale,
  getDifference,
  customRound,
  roundToDown,
  roundToUp,
  round,
  defaultNumberFormat,
  getPriceValue,
} from './formatNumberToLocale';
export {
  getLeastPermissionKey,
  getHighestPermissionKey,
  getFirstSuitableKey,
  getPermissionsByGroupKey,
  getSubGroupKey,
} from './permissions';

/* 
    Array tools
*/

export {
  addArrayItems,
  removeArrayItem,
  removeArrayItems,
  mapArray,
  reduceArray,
  findArrayItem,
  addFieldToArrayItem,
  addFieldsToArrayItem,
} from './arrayTools';
export { clearUserData } from './clearUserData';
export { default as exportTableToExcel } from './exportTableToExcel';
