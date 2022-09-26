const math = require('exact-math');

export const addArrayItems = (newData, data) => [...newData, ...data];
export const removeArrayItem = (itemId, data) =>
  data.filter(dataItem => dataItem.id === itemId);
export const removeArrayItems = (itemIds, data) =>
  data.filter(dataItem => !itemIds.includes(dataItem.id));
export const mapArray = (key, data) => data.map(dataItem => dataItem[key]);
export const reduceArray = (key, data) =>
  data.reduce((total, current) => math.add(total, Number(current[key]), 0));
export const findArrayItem = (value, key, data) =>
  data.find(dataItem => dataItem[key] === value);
export const addFieldToArrayItem = (itemId, data, value, key) =>
  data.map(dataItem => {
    if (dataItem.id === itemId) {
      return {
        ...dataItem,
        [key]: value,
      };
    }
    return dataItem;
  });
export const addFieldsToArrayItem = (itemId, data, values) =>
  data.map(dataItem => {
    if (dataItem.id === itemId) {
      return {
        ...dataItem,
        ...values,
      };
    }
    return dataItem;
  });
