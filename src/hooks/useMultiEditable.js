import { useState, useEffect, useRef } from 'react';
import useForm from 'react-hook-form';

export function useMultiEditable({ values, onSubmit }) {
  const [editable, setState] = useState(false);
  const {
    register,
    errors,
    handleSubmit,
    setValue,
    unregister,
    getValues,
    watch,
  } = useForm();

  function onChange(name, value) {
    setValue(name, value, true);
    // clearError(name);
  }

  function registerFields() {
    values.forEach(item => {
      const { name, value, required=true} = item;
      register({ name }, { required, validate: value => {
        if(name=='name'){
          if (value.length && value.length < 3) {
            return 'Bu dəyər 3 simvoldan az olmamalıdır.';
        }
        return true;
        }
    }});
      setValue(name, value);
    });
    
  }

  function unRegisterFields() {
    values.forEach(item => {
      unregister(item.name);
    });
  }

  function toggleHandle() {
    if (!editable) {
      registerFields();
    } else {
      unRegisterFields();
    }
    setState(!editable);
  }

  const saveHandle = handleSubmit(onSubmit);

  // save on ENTER press
  function onEnterKeyUp(event) {
    if (event.keyCode === 13) {
      saveHandle();
    }
  }

  // close edit mode on ESC press
  function onEscKeyDown(event) {
    if (event.keyCode === 27) {
      toggleHandle();
    }
  }

  // on edit mode focus on first input
  const firstInputRef = useRef(null);
  useEffect(() => {
    if (editable && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [editable]);

  const setEditable = value => {
    if (value) {
      registerFields();
    } else {
      unRegisterFields();
    }
    setState(value);
  };

  return {
    editable,
    onChange,
    firstInputRef,
    errors,
    handleSubmit,
    toggleHandle,
    onEnterKeyUp,
    onEscKeyDown,
    saveHandle,
    getValues,
    watch,
    setEditable,
  };
}
