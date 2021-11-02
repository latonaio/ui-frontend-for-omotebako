import React from "react";

const SelectHundred = () => {
  const hundred = [];

  hundred.push({
    value: '-',
    label: '-'
  });

  for (let i = 1; i < 101; i++) {
    hundred.push({
      value: i.toString(),
      label: i.toString()
    });
  }

  return hundred.map((number) => (
    <option
      value={number.value}
      selected={
        number.value === '-'
      }
    >
      { number.label}
    </option>
  ))
};

export default SelectHundred;