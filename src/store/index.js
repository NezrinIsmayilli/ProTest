import {
    configureStore,
    combineReducers,
    getDefaultMiddleware,
} from 'redux-starter-kit';
import apiMiddleware from './middleware/api';
// reducers
import { authReducer } from './reducers/auth';
import {
    profileReducer,
    tenantReducer,
    logsReducer,
    requisitesReducer,
} from './reducers/profile';
import { tableConfigurationReducer } from './reducers/settings/tableConfiguration';
import { kassaReducer } from './reducers/settings/kassa';
import { vezifelerReducer } from './reducers/settings/vezifeler';
import { anbarReducer } from './reducers/settings/anbar';
import { muqavileTypesReducer } from './reducers/settings/muqavile';
import { mehsulReducer } from './reducers/settings/mehsul';
import { creditReducer } from './reducers/settings/credit';
import { rolesReducer } from './reducers/settings/roles';
import { hrReducer } from './reducers/settings/hr';
import { offlineReasonReducer } from './reducers/settings/offlineReason';
import { serialNumberPrefixReducer } from './reducers/settings/serialNumberPrefix';
import { orderRolesReducer } from './reducers/settings/order-roles';
import { callRolesReducer } from './reducers/settings/call-roles';
import { applyTypesReducer } from './reducers/settings/applyTypes';
import { IVRReducer } from './reducers/settings/ivr';
import { GatewaysReducer } from './reducers/settings/gateways';
import { IntegrationReducer } from './reducers/settings/integrations';
import { OperatorGroupReducer } from './reducers/settings/operatorGroup';
import { WorkScheduleReducer } from './reducers/settings/work-schedule';
import { internalCallsReducer } from './reducers/calls/internalCalls';
import { callReportsReducer } from './reducers/calls/reports';
import { MessagingReducer } from './reducers/calls/messaging';
import { FaqReducer } from './reducers/calls/faq';
import { FopReducer } from './reducers/calls/fop';
import { invoicesReducer } from './reducers/operations/add/invoices';
import { advancePaymentReducer } from './reducers/operations/add/advancePayment';
import { cashBoxBalanceReducer } from './reducers/operations/add/cashBoxBalance';
import {
    currenciesReducer,
    convertCurrency,
} from './reducers/operations/add/currencies';
import { expenseItemsByCatalogId } from './reducers/operations/add/expenseItemsByCatalogId';
import { hrmEmployeesReducer } from './reducers/operations/add/hrmEmployees';
import { financeReportsReducer } from './reducers/finance/reports';

import { structureReducer } from './reducers/structure';
import { employeesReducer } from './reducers/employees';
import { stockReducer } from './reducers/stock';
import { bronReducer } from './reducers/bron';
import { productReducer } from './reducers/product';
import { salesAndBuysReducer } from './reducers/salesAndBuys';
import { businessUnitReducer } from './reducers/businessUnit';
import { loadingReducer } from './reducers/loading';
import { permissionsReducer } from './reducers/permissions';
import { catalogsReducer } from './reducers/catalog';
import { salesOperationsReducer } from './reducers/operations';
import { financeOperationsReducer } from './reducers/finance/operations';
import { paymentTableReducer } from './reducers/finance/paymentTable';
import { contactsReducer } from './reducers/relations';
import { contractsReducer } from './reducers/contracts';
import { expenseCatalogReducer } from './reducers/expenseCatalog';
import { transactionCatalog } from './reducers/operations/add/transactionCatalog';
import { expenseItems } from './reducers/expenseItems';
import { settlementsReducer } from './reducers/settlements';
import { workSchedulesReducer } from './reducers/hrm/attendance/workSchedules';
import { workScheduleDaysReducer } from './reducers/hrm/attendance/workScheduleDays';
import { nonWorkingDaysReducer } from './reducers/hrm/attendance/nonWorkingDays';
import { workersReducer } from './reducers/hrm/workers';
import { hrmCalendarReducer } from './reducers/hrm/calendars';
import { attachmentReducer } from './reducers/attachment/index';
// import { salesReportReducer } from './reducers/salesReport/index';
import { expenseReportReducer } from './reducers/expenseReport';
import { employeeActivitiesReducer } from './reducers/employeeActivity';
import { vacationReducer } from './reducers/employeeActivity/employeeActivityVacation';
import { sickLeaveReducer } from './reducers/employeeActivity/employeeActivitySickLeave';
import { businessTripReducer } from './reducers/employeeActivity/employeeActivityBusinessTrip';
import { timeOffReducer } from './reducers/employeeActivity/employeeActivityTimeOff';
import { appointmentReducer } from './reducers/employeeActivity/employeeActivityAppointment';
import { fireReducer } from './reducers/employeeActivity/employeeActivityFire';
import { partnersReducer } from './reducers/partners';
import { goodsReducer } from './reducers/goods';
import { ordersReducer } from './reducers/orders';
import { orderReportReducer } from './reducers/reports/order-report';
import { measurementsReducer } from './reducers/measurements';
import { newContactsReducer } from './reducers/contacts-new';
// Operations
import { goodsTurnoversReducer } from './reducers/operations/goods-turnovers';
import { soldItemsReducer } from './reducers/operations/sold-items';
import { purchasedItemsReducer } from './reducers/operations/purchased-items';
// jobs
import {
    parametersReducer,
    appealsReducer,
    interviewReducer,
    vacanciesReducer,
    announcementsReducer,
    trainingsReducer,
} from './reducers/jobs';
import { appealsCountsReducer } from './reducers/jobs/appeals/appeals-counts';
import { vacancyCountsReducer } from './reducers/jobs/vacancies/vacancy-counts';

// hrm
import {
    attendanceReducer,
    reportReducer,
    hrmFinesReducer,
    hrmTimecardReducer,
} from './reducers/hrm';

import { usersReducer } from './reducers/users';

import { contactReducer } from './reducers/contact';
import { subscriptionReducer } from './reducers/subscription';
import { apiNotificationsReducer } from './reducers/apiNotifications';

// terminal
import { terminalCommandReducer } from './reducers/proTerminal';

// recievables and payables
import { recievablesAndPayablesReducer } from './reducers/recievablesAndPayables';
import { vatInvoicesReducer } from './reducers/vat-invoices';

// Reports
import {
    salesReportReducer,
    debtsTurnoversReducer,
    balanceSheetReducer,
    profitAndLossReducer,
    profitCenterReducer,
    expensesReducer,
} from './reducers/reports';
// salesBonus
import { bonusConfigurationReducer } from './reducers/finance/salesBonus/configurations';
import { notificationsReducer } from './reducers/settings/notification';
import { salesOperation } from './reducers/sales';
import { tasksReducer } from './reducers/tasks';
import { projectsReducer } from './reducers/projects';
import { appsReducer } from './reducers/apps';

// Excel Reducers
import { allStocksModuleReducer, allSalesInovicesReducer, allTransactionListReducer, allReportsModuleReducer } from './reducers/export-to-excel';

const appReducer = combineReducers({
    authReducer,
    loadings: loadingReducer,
    tableConfigurationReducer,
    kassaReducer,
    vezifelerReducer,
    anbarReducer,
    muqavileTypesReducer,
    mehsulReducer,
    creditReducer,
    rolesReducer,
    profileReducer,
    tenantReducer,
    requisitesReducer,
    logsReducer,
    structureReducer,
    employeesReducer,
    stockReducer,
    bronReducer,
    productReducer,
    permissionsReducer,
    catalogsReducer,
    salesOperationsReducer,
    financeOperationsReducer,
    paymentTableReducer,
    contactsReducer,
    contractsReducer,
    invoicesReducer,
    advancePaymentReducer,
    expenseCatalogReducer,
    expenseItems,
    settlementsReducer,
    hrReducer,
    offlineReasonReducer,
    serialNumberPrefixReducer,
    workSchedulesReducer,
    transactionCatalog,
    workScheduleDaysReducer,
    nonWorkingDaysReducer,
    workersReducer,
    hrmCalendarReducer,
    attachmentReducer,
    // salesReportReducer,
    expenseReportReducer,
    employeeActivitiesReducer,
    vacationReducer,
    sickLeaveReducer,
    businessTripReducer,
    timeOffReducer,
    appointmentReducer,
    fireReducer,
    // jobs
    parametersReducer,
    appealsReducer,
    interviewReducer,
    vacanciesReducer,
    announcementsReducer,
    contactReducer,
    currenciesReducer,
    appealsCountsReducer,
    vacancyCountsReducer,
    trainingsReducer,

    // hrm
    attendanceReducer,
    reportReducer,
    hrmTimecardReducer,
    hrmFinesReducer,
    usersReducer,

    subscriptionReducer,

    // notifications
    apiNotificationsReducer,

    // terminal
    terminalCommandReducer,

    convertCurrency,
    cashBoxBalanceReducer,

    expenseItemsByCatalogId,
    hrmEmployeesReducer,
    financeReportsReducer,

    salesAndBuysReducer,
    // partners
    partnersReducer,
    // goods
    goodsReducer,

    // orders
    ordersReducer,
    orderReportReducer,

    // measurements
    measurementsReducer,

    // recievables and payablesReducer
    recievablesAndPayablesReducer,
    newContactsReducer,

    // good-turnovers
    goodsTurnoversReducer,
    soldItemsReducer,
    purchasedItemsReducer,
    vatInvoicesReducer,

    // reports
    salesReport: salesReportReducer,
    balanceSheet: balanceSheetReducer,
    debtsTurnovers: debtsTurnoversReducer,
    profitAndLoss: profitAndLossReducer,
    profitCenter: profitCenterReducer,
    expenses: expensesReducer,
    salesOperation,
    orderRolesReducer,

    // businessUnit
    businessUnitReducer,
    // calls
    callRolesReducer,
    applyTypesReducer,
    IVRReducer,
    GatewaysReducer,
    IntegrationReducer,
    OperatorGroupReducer,
    WorkScheduleReducer,
    internalCallsReducer,
    callReportsReducer,
    MessagingReducer,
    FaqReducer,
    FopReducer,

    notificationsReducer,

    bonusConfigurationReducer,
    projectsReducer,
    tasksReducer,
    // apps
    appsReducer,

    // Excel Reducers 
    allStocksModuleReducer,
    allSalesInovicesReducer,
    allTransactionListReducer,
    allReportsModuleReducer
});

const rootReducer = (state, action) => {
    if (action.type === 'LOGOUT') {
        return undefined;
    }
    return appReducer(state, action);
};

export default function configureAppStore() {
    const store = configureStore({
        reducer: rootReducer,
        middleware: [...getDefaultMiddleware(), apiMiddleware],
    });
    return store;
}
