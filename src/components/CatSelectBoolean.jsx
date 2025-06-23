import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * @component
 * @description True/False 값을 선택할 수 있는 드롭다운 컴포넌트입니다.
 * @param {object} props - 컴포넌트 props
 * @param {string} props.label - 셀렉트의 라벨 텍스트 변경
 * @param {string} props.value - 현재 선택된 값 ("true" 또는 "false"). 이 값은 부모 컴포넌트에서 관리되어야 합니다.
 * @param {function} props.setValue - 선택된 값이 변경될 때 호출되는 함수. 이 함수는 부모 컴포넌트의 상태 업데이트 함수여야 합니다. 선택된 "true" 또는 "false" 값이 인자로 전달됩니다.
 * @returns {JSX.Element} True/False 선택 드롭다운
 * @example
 * // 부모 컴포넌트에서 CatSelectBoolean 컴포넌트 사용 예시
 * function ParentComponent() {
 * const [isCat, setIsCat] = useState('true');
 *
 * const handleCatChange = (newValue) => {
 * setIsCat(newValue);
 * console.log('선택된 값:', newValue);
 * };
 *
 * return (
 * <div>
 * <CatSelectBoolean value={isCat} setValue={handleCatChange} />
 * <p>선택된 값: {isCat}</p>
 * </div>
 * );
 * }
 */
export default function CatSelectBoolean({ label = 'True/False 선택', value, setValue }) {

    const handleChange = (event) => {
        const val = event.target.value;
        if (val === 'true') setValue(true);
        else if (val === 'false') setValue(false);
    };

  return (
    <FormControl fullWidth>
      <InputLabel id="true-false-label">{label}</InputLabel>
      <Select
        labelId="true-false-label"
        id="true-false-select"
        value={String(value)} // boolean -> string 변환
        label={label}
        onChange={handleChange}
      >
        <MenuItem value="true">True</MenuItem>
        <MenuItem value="false">False</MenuItem>
      </Select>
    </FormControl>
  );
}