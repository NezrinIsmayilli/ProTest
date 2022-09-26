/* eslint-disable prefer-destructuring */
import { createReducer } from 'redux-starter-kit';

import {
    setReports,
    setReportsHistory,
    resetFilters,
    reportsSearchHandle,
    reportsSalaryFilter,
} from 'store/actions/hrm/report';

const initialState = {
    reports: [],
    reportsHistory: [],
    query: '',
    reportsFilteredData: [],
};
const math = require('exact-math');

export const reportReducer = createReducer(initialState, {
    [setReportsHistory]: (state, action) => ({
        ...state,
        reportsHistory: action.payload.data,
    }),
    [resetFilters]: (state, action) => ({
        ...state,
        query: undefined,
        from: undefined,
        to: undefined,
    }),
    [setReports]: (state, action) => {
        const { query } = state;
        const { data } = action.payload;

        if (!query) {
            return {
                ...state,
                reports: data,
                reportsFilteredData: addFooter(data),
            };
        }

        const result = data.filter(
            item =>
                String(item.name)
                    .toLowerCase()
                    .includes(String(query).toLowerCase()) ||
                String(item.surname)
                    .toLowerCase()
                    .includes(String(query).toLowerCase())
        );

        return {
            ...state,
            data,
            reportsFilteredData: addFooter(result),
        };
    },
    [reportsSearchHandle]: (state, action) => {
        const query = action.payload;

        const { reports, from, to } = state;

        const result = reports.filter(
            item =>
                (query
                    ? `${String(item.name)} ${String(item.surname)} ${String(
                          item.patronymic
                      )}`
                          .toLowerCase()
                          .includes(String(query).toLowerCase())
                    : true) &&
                (from ? Number(item.salary) > Number(from) : true) &&
                (to ? Number(item.salary) < Number(to) : true)
        );

        return {
            ...state,
            reportsFilteredData: addFooter(result),
            query,
        };
    },

    [reportsSalaryFilter]: (state, action) => {
        const { from, to } = action.payload;
        const { reports } = state;
        if (!from && !to) {
            return {
                ...state,
                reportsFilteredData: addFooter(reports),
            };
        }
        const result = reports.filter(
            item =>
                (from ? Number(item.salary) > Number(from) : true) &&
                (to ? Number(item.salary) < Number(to) : true)
        );

        return {
            ...state,
            reportsFilteredData: addFooter(result),
            from: from || undefined,
            to: to || undefined,
        };
    },
});

// function formatTotalTextByCurrency(currencies) {
//   const formattedResult = [];

//   Object.keys(currencies).forEach(currency => {
//     const text = `${currencies[currency]} ${currency}`;
//     formattedResult.push(text);
//   });

//   return formattedResult.join(', ');
// }

export function addFooter(data) {
    const result = {
        id: 'isFooter',
        totalCurrentBalanceInMainCurrency: null,
        totalLatenessPenaltyInMainCurrency: null,
        totalPreviousBalanceInMainCurrency: null,
        totalSalaryAdditionInMainCurrency: null,
        totalSalaryDeductionInMainCurrency: null,
        totalSalaryInMainCurrency: null,
        totalSalaryPaymentInMainCurrency: null,
        totalTotalSalaryInMainCurrency: null,
        totalSalesBonusAmount: null,
    };

    result.totalCurrentBalanceInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.currentBalanceInMainCurrency) || 0),
        0
    );
    result.totalLatenessPenaltyInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.latenessPenaltyInMainCurrency) || 0),
        0
    );
    result.totalPreviousBalanceInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.previousBalanceInMainCurrency) || 0),
        0
    );
    result.totalSalaryAdditionInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.salaryAdditionInMainCurrency) || 0),
        0
    );
    result.totalSalaryDeductionInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.salaryDeductionInMainCurrency) || 0),
        0
    );
    result.totalSalaryInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.salaryInMainCurrency) || 0),
        0
    );
    result.totalSalesBonusAmount = data.reduce(
        (total, current) =>
            math.add(total, Number(current.salesBonusAmount) || 0),
        0
    );
    result.totalSalaryPaymentInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.salaryPaymentInMainCurrency) || 0),
        0
    );
    result.totalTotalSalaryInMainCurrency = data.reduce(
        (total, current) =>
            math.add(total, Number(current.totalSalaryInMainCurrency) || 0),
        0
    );
    return [...data, result];
    //   const columnTotals = {};
    //   const lastRowData = {
    //     // currencyCode: '',
    //     // name: '',
    //     // surname: '',
    //     id: 'isFooter',
    //   };
    //   data.forEach(employee => {
    //     const { currencyCode } = employee;
    //     Object.keys(employee).forEach(key => {
    //       if (['id', 'name', 'surname', 'currencyCode'].includes(key)) return;
    //       if (!columnTotals[key]) {
    //         columnTotals[key] = {};
    //       }
    //       const sum = columnTotals[key][currencyCode];
    //       if (sum === undefined) {
    //         columnTotals[key][currencyCode] = Number(employee[key]);
    //       } else {
    //         columnTotals[key][currencyCode] = sum + Number(employee[key]);
    //       }
    //     });
    //   });
    //   Object.keys(columnTotals).forEach(key => {
    //     console.log(columnTotals[key]);
    //     lastRowData[key] = formatTotalTextByCurrency(columnTotals[key]);
    //   });
    //   return [...data, lastRowData];
}
