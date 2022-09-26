export function groupByKey(array, keyProp) {
  const groups = {};

  for (const item of array) {
    const key = item[keyProp];

    if (!groups[key]) groups[key] = [];

    groups[key].push(item);
  }

  return groups;

  // return arr.reduce((val, item) => {
  //   (val[item[key]] = val[item[key]] || []).push(item);
  //   return val;
  // }, {});
}
