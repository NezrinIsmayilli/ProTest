import { useCallback, useRef, useReducer, useEffect } from 'react';
import { checkStartWithSpace } from 'utils/inputValidations';
import { toast } from 'react-toastify';

const intialState = {
  open: false,
  error: false,
  value: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'field':
      return {
        ...state,
        value: action.payload.length > 120 ? state.value : action.payload,
        error: false,
      };
    case 'error':
      return {
        ...state,
        error: true,
      };
    case 'open':
      return {
        open: !state.open,
        value: '',
        error: false,
      };
    case 'reset':
      return intialState;
    default:
      return state;
  }
}
/**
 * @description 0ne Input handle helper
 * @param {Number} index - for identify input
 * @param {Function} submitHandle - on submit func
 */
export function useToggledInputHandle(index, submitHandle) {
  const [state, dispatch] = useReducer(reducer, intialState);
  const { open, error, value } = state;
  const inputRef = useRef();

  const inputChangeHandle = useCallback(event => {
    dispatch({ type: 'field', payload: event.target.value });
  }, []);

  const handleSubmit = useCallback(
    event => {
      if (event) event.preventDefault();
      if (!value || checkStartWithSpace(value)) {
        dispatch({ type: 'error' });
        inputRef.current.focus();
        return;
      }
      submitHandle(index, value, ({ error }) => {
        if (
          error?.response?.data?.error?.type ===
          'offline_reason.create.duplicate.name'
        ) {
          return toast.error('Bu oflayn səbəbi artıq mövcuddur');
        }
        if (
          error?.response?.data?.error?.errors?.name ===
          'This value is too short. It should have 3 characters or more.'
        ) {
          return toast.error('3 simvoldan az ola bilməz');
        }
        if (
          error?.response?.data?.error?.errors?.name ===
          'This value is too long. It should have 30 characters or less.'
        ) {
          return toast.error('30 simvoldan çox ola bilməz');
        }
      });
      dispatch({ type: 'reset' });
    },
    [index, submitHandle, value]
  );

  const toggleHandle = useCallback(event => {
    if (event) event.preventDefault();
    dispatch({ type: 'open' });
  }, []);

  const onKeyUp = useCallback(
    event => {
      if (event) event.preventDefault();
      if (event && event.keyCode === 13) handleSubmit(event);
      if (event && event.keyCode === 27) toggleHandle();
    },
    [handleSubmit, toggleHandle]
  );

  useEffect(() => {
    if (open) {
      inputRef.current.focus();
    }
  }, [open]);

  return {
    open,
    error,
    value,
    inputChangeHandle,
    handleSubmit,
    toggleHandle,
    inputRef,
    onKeyUp,
  };
}
