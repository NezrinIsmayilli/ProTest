import { useRef, useState, useEffect } from 'react';

/**
 * @description Helper hook for work with editable inputs
 * @param {String} defaultValue
 */
export function useEditableInput(defaultValue) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [editable, setEditable] = useState(false);
  const editableRef = useRef(null);

  function inputChangeHandle(event) {
    setInputValue(event.target.value);
  }

  function changeEditableHandle() {
    setEditable(!editable);
  }

  useEffect(() => {
    if (editable && editableRef.current) {
      editableRef.current.focus();
    }
  }, [editable, inputValue]);

  return {
    editable,
    inputValue,
    editableRef,
    inputChangeHandle,
    changeEditableHandle,
    setInputValue,
  };
}
