import React from "react";
import { Select, Box, InputLabel, MenuItem, FormControl } from "@mui/material";

/**
 * MUI 기반 셀렉트 컴포넌트
 *
 * @param {Object} props - 컴포넌트의 속성
 * @param {Array<{ value: string, label: string }>} props.option - (필수) key와 value를 포함한 옵션 배열
 * @param {string} props.value - (필수) 선택된 라벨의 실제 값
 * @param {string} [props.label] - 셀렉트에 표기될 텍스트 라벨
 * @param {Function} props.onChange - (필수) 선택 값 변경 시 실행할 이벤트 핸들러
 * 
 * @description
 * - MUI의 Select 컴포넌트를 활용하여 드롭다운을 생성
 * - 옵션이 없을 경우 'No options' 메시지를 표시
 * - 최대 높이 500px로 설정된 드롭다운 메뉴
 *
 * @author sj_hong
 * @updated 2025-03-24 16:25
 * @example
 * <CatSelect 
 *   option={[{ value: "1", label: "Option 1" }, { value: "2", label: "Option 2" }]} 
 *   value="1" 
 *   label="선택하세요" 
 *   onChange={(e) => console.log(e.target.value)} 
 * />
 */
export default function CatSelect({ option = [], value = '', label, onChange }) {

	const commonMenuProps = {
		disablePortal: true,
		PaperProps: { style: { maxHeight: 500 } },
	};

	return (
		<Box display="flex">
			<FormControl fullWidth>
				<InputLabel id="select-label">{label}</InputLabel>
				<Select
					labelId="select-label"
					value={value}
					onChange={onChange}
					label={label}
					MenuProps={commonMenuProps}
				>
					{option.length > 0 ? (
						option.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))
					) 
					: 
					(
						<MenuItem disabled style={{ color: '#aaa', fontStyle: 'italic' }}>
							No options
						</MenuItem>
					)}
				</Select>
			</FormControl>
		</Box>
	);
}




/**************************************************************************************************************************
          .         .                                                                                                      
         ,8.       ,8.                   .8.          b.             8 8 8888      88          .8.          8 8888         
        ,888.     ,888.                 .888.         888o.          8 8 8888      88         .888.         8 8888         
       .`8888.   .`8888.               :88888.        Y88888o.       8 8 8888      88        :88888.        8 8888         
      ,8.`8888. ,8.`8888.             . `88888.       .`Y888888o.    8 8 8888      88       . `88888.       8 8888         
     ,8'8.`8888,8^8.`8888.           .8. `88888.      8o. `Y888888o. 8 8 8888      88      .8. `88888.      8 8888         
    ,8' `8.`8888' `8.`8888.         .8`8. `88888.     8`Y8o. `Y88888o8 8 8888      88     .8`8. `88888.     8 8888         
   ,8'   `8.`88'   `8.`8888.       .8' `8. `88888.    8   `Y8o. `Y8888 8 8888      88    .8' `8. `88888.    8 8888         
  ,8'     `8.`'     `8.`8888.     .8'   `8. `88888.   8      `Y8o. `Y8 ` 8888     ,8P   .8'   `8. `88888.   8 8888         
 ,8'       `8        `8.`8888.   .888888888. `88888.  8         `Y8o.`   8888   ,d8P   .888888888. `88888.  8 8888         
,8'         `         `8.`8888. .8'       `8. `88888. 8            `Yo    `Y88888P'   .8'       `8. `88888. 8 888888888888 
***************************************************************************************************************************
// [사용방법 예시]
***********************************
	
	//선택될 목록 설정
	const options = [
		{ value: '1', label: '옵션 1' },
		{ value: '2', label: '옵션 2' },
		{ value: '3', label: '옵션 3' },
	];

	//저장할 값 선언
	const [selectedValue, setSelectedValue] = useState('1');

	//이벤트선언
	const handleChange = (event) => {
	    setSelectedValue(event.target.value);
  	};

	//태그 사용
	return (
	<>
	<CatSelect
		label={'라벨텍스트'}
		option={options}
		value={selectedValue}
		onChange={handleChange}		
	/>
	</>
	)


**************************************************************************************************************************
// 객체로 값 할당하기
***********************************

	const [select, setSelect] = useState({
		selected: "1", 
		options: [
			{ value: '1', label: '옵션 1' },
			{ value: '2', label: '옵션 2' },
			{ value: '3', label: '옵션 3' },
		]
	});

	//태그 사용
	return (
	<>
		<CatSelect/
			label={'선택 샘플 예시 1'}
			option={options}
			value={selectedValue}
			onChange={(event) => {
				// select 객체를 복사하고 selected만 업데이트
				setSelect(prevState => ({
					...prevState,
					selected: event.target.value, // 선택된 값만 변경
				}));
			}}
		/>
	</>
	)

***************************************************************************************************************************/


