import { useState, useEffect, useCallback } from 'react';
/**
 * @description Dropdown helper hook
 * @param {Boolean} autoClose - close automatically
 * @default {autoClose} true
 */
export function useDropDown(autoClose = true) {
  const [isOpen, SetIsOpen] = useState(false);

  const dropDownToggle = useCallback(() => {
    SetIsOpen(!isOpen);
  }, [isOpen]);
  useEffect(() => {
    if (autoClose) {
      if (isOpen) {
        document.addEventListener('click', dropDownToggle, { passive: true });
      }
      return () => {
        document.removeEventListener('click', dropDownToggle, false);
      };
    }
  }, [dropDownToggle, isOpen, autoClose]);

  return { isOpen, dropDownToggle };
}
