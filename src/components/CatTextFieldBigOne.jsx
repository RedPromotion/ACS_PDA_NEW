import { TextField, Box, FormControl } from "@mui/material";

/**
 * 한 줄 입력을 위한 MUI 기반 텍스트 필드 컴포넌트
 * @component
 * @param {Object} props - 컴포넌트 속성
 * @param {string} [props.label=''] - 텍스트 필드에 표시할 라벨 텍스트
 * @param {string} [props.value=''] - 입력 필드의 기본 값
 * @param {Object} [props.style={ height: '35px' }] - 텍스트 필드에 적용할 스타일 객체
 * @param {Object} [props.textProps] - 추가적인 TextField 속성을 위한 객체 (스프레드 연산자로 적용)
 * 
 * @description
 * - MUI의 FormControl, Box, TextField를 사용하여 한 줄 입력을 위한 필드를 생성
 * - 기본적으로 fullWidth, autoComplete="off" 옵션이 적용됨
 * - textProps를 통해 추가적인 MUI TextField 속성을 적용 가능
 * 
 * @author sj_hong
 * @updated 2025-03-24 16:25
 * @example
 * <CatTextFieldBigOne 
 *   label="라벨 명칭" 
 *   value={'값'} 
 *   onChange={(e) => console.log(e.target.value)} 
 *   style={{ height: '40px' }}
 * />
 */
export default function CatTextFieldBigOne({ label = '', value = '', style = { height: '35px' }, ...textProps }) {
    return (
        <FormControl fullWidth>
            <Box display="flex">
                <TextField
                    label={label}
                    value={value}
                    fullWidth
                    autoComplete="off"
                    sx={style}
                    {...textProps}
                />
            </Box>
        </FormControl>
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
**************

	return (
		<CatTextFieldReadonly
			label={"라벨 명칭"} 
			value={값} 
			style={height: '35px'}
		/>
	)


**************************************************************************************************************************/