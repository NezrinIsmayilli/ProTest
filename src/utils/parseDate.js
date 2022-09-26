import moment from 'moment';

export const parseDate = (date, format = 'L HH:mm') =>
  moment(date).format(format);
