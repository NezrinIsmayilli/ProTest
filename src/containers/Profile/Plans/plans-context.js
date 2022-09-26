/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useContext,
  createContext,
  useMemo,
  useReducer,
  useSelector,
  useEffect,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useDispatch } from 'react-redux';
import { fetchOverallPrice } from 'store/actions/subscription';

import { createReducer } from 'utils';

const PlansContext = createContext(null);

const userMinCount = 0;
const employeesMinCount = 0;

const constants = {
  user: {
    priceMonthly: 1,
    priceYearly: 1,
  },
  employees: {
    priceMonthly: 1,
    priceYearly: 1,
  },
};

const initialState = {
  activeModule: undefined,
  selectedPacks: {},

  // priceMonthly, priceYearly
  priceType: 'priceMonthly',

  editMode: false,

  limits: {
    users: undefined,
    employees: undefined,
  },

  limitsPrice: {
    users: undefined,
    employees: undefined,
  },

  overall: 0,
};

const plansReducer = createReducer(initialState, {
  activeModuleChangeHandle: (state, action) => ({
    ...state,
    activeModule: action.key,
  }),

  packSelectHandle: (state, action) => {
    if ((action.key === 'task' || action.key === 'projobs') && !action.pack) {
      return {
        ...state,
        selectedPacks: {
          ...state.selectedPacks,
          [action.key]: action.packages[action.key]?.[0],
        },
      };
    }

    return {
      ...state,
      selectedPacks: {
        ...state.selectedPacks,
        [action.key]: action.pack,
      },
    };
  },

  priceTypeChangeHandle: (state, action) => ({
    ...state,
    priceType: action.priceType,
  }),

  editModeToggle: (state, action) => ({
    ...state,
    editMode: action.editMode,
  }),

  updateLimits: (state, action) => {
    const { priceType } = state;
    const { limitKey, value } = action;

    const price =
      limitKey === 'users'
        ? value * constants.user[priceType]
        : value * constants.employees[priceType];

    return {
      ...state,
      limitsPrice: {
        ...state.limitsPrice,
        [limitKey]: price,
      },
      limits: {
        ...state.limits,
        [limitKey]: value,
      },
    };
  },

  initState: (state, action) => {
    const {
      data: { limits, selectedPacks },
    } = action;

    const limitsPrice = {
      users: (limits.users - userMinCount) * constants.user.priceMonthly,
      employees:
        (limits.employees - employeesMinCount) *
        constants.employees.priceMonthly,
    };

    return {
      ...state,
      selectedPacks,
      limits,
      limitsPrice,
      editMode: false,
    };
  },
});

function PlansContextProvider({ packages, packageKeys, limits, ...rest }) {
  const [state, dispatch] = useReducer(plansReducer, initialState);

  const activeModuleChangeHandle = key =>
    dispatch({ type: 'activeModuleChangeHandle', key });

  const packSelectHandle = (key, pack) =>
    dispatch({ type: 'packSelectHandle', key, pack, packages, packageKeys });

  const priceTypeChangeHandle = priceType =>
    dispatch({ type: 'priceTypeChangeHandle', priceType });

  const editModeOn = () => dispatch({ type: 'editModeToggle', editMode: true });
  const editModeOff = ({ reset = true }) => {
    if (reset) {
      const selectedPacks = {};

      packageKeys.forEach(key => {
        const packs = packages[key];

        packs.forEach(pack => pack.isPurchased && (selectedPacks[key] = pack));
      });

      return dispatch({ type: 'initState', data: { limits, selectedPacks } });
    }

    dispatch({ type: 'editModeToggle', editMode: false });
  };

  const limitsUpdateHandle = ({ limitKey, value }) =>
    dispatch({
      type: 'updateLimits',
      limitKey,
      value,
    });

  const {
    priceType,
    limitsPrice,
    selectedPacks,
    limits: { users: usersCount, employees: employeesCount },
  } = state;
  const { users, employees } = limitsPrice;

  const selectedPacksLength = Object.values(selectedPacks).filter(Boolean)
    .length;

  // init state
  useEffect(() => {
    if (packageKeys.length > 0) {
      const selectedPacks = {};

      packageKeys.forEach(key => {
        const packs = packages[key];

        packs.forEach(pack => pack.isPurchased && (selectedPacks[key] = pack));
      });

      dispatch({
        type: 'initState',
        data: {
          limits: {
            users: limits.users - 3,
            employees: limits.employees - 20,
          },
          selectedPacks,
        },
      });
    }
  }, [packageKeys]);

  const calculateOverallHandle = () => {
    const packages_ul = [];
    // get selected packs id
    for (const key of Object.keys(selectedPacks)) {
      const pack = selectedPacks[key];

      if (pack) {
        packages_ul.push(pack.id);
      }
    }

    const status = priceType === 'priceMonthly' ? 2 : 3;
    const userCount = state.limits.users;
    const employeeCount = state.limits.employees;

    reduxDispatch(
      fetchOverallPrice({
        cardType: 'v',
        userCount,
        employeeCount,
        status,
        packages_ul,
      })
    );
  };

  const [debouncedHandler] = useDebouncedCallback(() => {
    calculateOverallHandle();
  }, 600);

  const reduxDispatch = useDispatch();

  useEffect(() => {
    debouncedHandler();
  }, [
    usersCount,
    employeesCount,
    priceType,
    users,
    employees,
    selectedPacksLength,
  ]);

  const value = useMemo(
    () => ({
      ...state,
      activeModuleChangeHandle,
      packSelectHandle,
      priceTypeChangeHandle,
      editModeOn,
      editModeOff,
      limitsUpdateHandle,
    }),
    [state]
  );

  return <PlansContext.Provider value={value} {...rest} />;
}

function usePlansContext() {
  const context = useContext(PlansContext);

  if (context === undefined) {
    throw Error('usePlansContext must be used within a provider');
  }

  return context;
}

export { usePlansContext, PlansContextProvider };

// const overall = useMemo(() => {
//   let overall = 0;

//   Object.keys(selectedPacks).forEach(key => {
//     if (key) {
//       const { priceMonthly, priceYearly } = selectedPacks[key] || {};

//       overall +=
//         priceType === 'priceMonthly'
//           ? Number(priceMonthly)
//           : Number(priceYearly);
//     }
//   });

//   const UsersPrice =
//     usersCount * constants.user[priceType] +
//     employeesCount * constants.employees[priceType];

//   return overall + UsersPrice;
// }, [
//   usersCount,
//   employeesCount,
//   priceType,
//   // users,
//   // employees,
//   selectedPacksLength,
// ]);
