/* eslint-disable no-bitwise */
export function decToRgb(data, margin) {
  const marginValue = margin || 0;
  const colorRGB = [
    (data & 0xff0000) >> 16,
    (data & 0x00ff00) >> 8,
    data & 0x0000ff,
  ];
  return {
    width: '1em',
    height: '1em',
    padding: '10px',
    display: 'inline-block',
    borderRadius: '4px',
    marginTop: `${marginValue}`,
    background: `rgb(${colorRGB})`,
  };
}
