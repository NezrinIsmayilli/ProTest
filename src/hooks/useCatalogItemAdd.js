import { useReducer, useCallback } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'formToggle':
      return {
        ...action.initialState,
        isFormOpen: !state.isFormOpen,
      };
    case 'onChange':
      return {
        ...state,
        values: {
          ...state.values,
          [action.name]: action.value,
        },
        errors: {
          ...state.errors,
          [action.name]: false,
        },
      };
    case 'validate':
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.errors,
        },
      };
    default:
      throw new Error();
  }
}

export function useCatalogItemAdd(initialState) {
  const [state, disptach] = useReducer(reducer, initialState);

  const formToggle = useCallback(
    () => disptach({ type: 'formToggle', initialState }),
    [initialState]
  );

  const handleChange = useCallback(e => {
    if (e) {
      return disptach({
        type: 'onChange',
        name: e.target.name,
        value: e.target.value,
      });
    }
  }, []);

  const validate = useCallback(
    errors => disptach({ type: 'validate', errors }),
    []
  );

  return { state, formToggle, handleChange, validate };
}
