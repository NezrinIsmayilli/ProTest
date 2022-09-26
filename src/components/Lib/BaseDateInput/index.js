/* eslint-disable react/no-multi-comp */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

import MomentLocaleUtils, {
  formatDate,
  parseDate,
} from 'react-day-picker/moment';

import 'moment/locale/az';
import 'moment/locale/ru';
import { useTranslation } from 'react-i18next';

const CustomInput = forwardRef(function CustomInput(props, ref) {
  return <input ref={ref} className="form-control" {...props} />;
});

export const BaseDateInput = ({ placeholder, onDayChange, value }) => {
  const { i18n } = useTranslation();
  const selectedLanguage = i18n.language;
  return (
    <DayPickerInput
      {...{ onDayChange, placeholder, value }}
      format="DD-MM-YYYY"
      formatDate={formatDate}
      parseDate={parseDate}
      component={CustomInput}
      dayPickerProps={{
        locale: selectedLanguage,
        localeUtils: MomentLocaleUtils,
      }}
    />
  );
};

BaseDateInput.propTypes = {
  placeholder: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  title: PropTypes.string,
  onDayChange: PropTypes.func,
  language: PropTypes.string,
};
