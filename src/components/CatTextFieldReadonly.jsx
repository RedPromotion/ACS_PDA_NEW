import { TextField } from '@mui/material';

/**
 * CatTextFieldReadonly 컴포넌트는 읽기 전용 텍스트 필드를 제공하는 UI 컴포넌트입니다.
 *
 * @param {Object} props - 컴포넌트에 전달되는 속성 객체
 * @param {string} [props.label=''] - 텍스트 필드의 라벨을 지정하는 문자열
 * @param {string} [props.value=''] - 텍스트 필드에 표시할 값
 * @param {Object} [props.style={ height: '35px', backgroundColor: 'grey.200' }] - 텍스트 필드에 적용할 스타일 객체
 * @param {Object} [props.textFieldProps={}] - MUI TextField에 전달할 추가 속성 객체 (예: placeholder, disabled 등)
 *
 * @description
 * - Material-UI의 `TextField`를 활용하여 읽기 전용 입력 필드를 생성합니다.
 * - `autoComplete="off"`을 적용하여 자동 완성을 방지합니다.
 * - `InputProps={{ readOnly: true }}`를 설정하여 입력이 불가능한 상태로 만듭니다.
 * - `textFieldProps`를 추가하여 추가적인 `TextField` 속성을 확장할 수 있습니다.
 * 
 * @author sj_hong
 * @updated 2025-03-24 16:25
 * @example
 * <CatTextFieldReadonly 
 * 	 label={"라벨 명칭"} 
 * 	 value={'값'} 
 * />
 */
export default function CatTextFieldReadonly ({label = '' , value = '', height = '35px'}) {
	return (
    <TextField
      label={label}
      value={value}
      variant="filled"
      size= {"small"}
      fullWidth		
      autoComplete="off" // 자동완성 끄기
      inputProps={{ 
        readOnly: true 
      }}
      sx={{
        height: height, // 원하는 높이로 조절
      }}
    />
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
**************************************************************************************************************************

기본 사용 예시
***********************************

	return (
		<CatTextFieldReadonly
			label={"라벨 명칭"} 
			value={값} 
			style={height: '35px'}
		/>
	)


**************************************************************************************************************************/
