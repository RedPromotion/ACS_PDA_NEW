import { TextField, Box, FormControl } from "@mui/material";

/**
 * 한 줄 입력을 위한 MUI 기반 텍스트 필드 컴포넌트 (Controlled / Uncontrolled 지원)
 * @param {Object} props - 컴포넌트 매개변수
 * @param {string} [props.label] - 입력 필드 라벨 텍스트
 * @param {string} [props.value] - 현재 값 (controlled일 경우 필수)
 * @param {function} [props.onChange] - 입력 변경 핸들러
 * @param {boolean} [props.readOnly=false] - 읽기 전용 여부
 * @param {boolean} [props.readOnlyStyle=true] - 읽기 전용일 때 회색 스타일 적용 여부
 * @param {TextFieldProps} [props.inputProps] - MUI TextField의 추가 속성
 * 
 * @description
 * - controlled: value + onChange 전달 시
 * - uncontrolled: defaultValue만 전달 시
 * - fullWidth, size=small, autoComplete=off, enterKeyHint=done, shrink 라벨은 항상 적용됨
 * 
 * @example
 * <CatTextField label="바코드" defaultValue="초기값" inputRef={ref} />
 * <CatTextField label="바코드" value={state} onChange={setState} />
 */
export default function CatTextField({
  label = '',
  value,
  onChange,
  defaultValue,
  inputRef,
  ...rest
}) {
  const isControlled = value !== undefined && onChange !== undefined;

  return (
    <FormControl fullWidth>
      <Box display="flex">
        <TextField
          fullWidth
          label={label}
          size="small"
          autoComplete="off"
          InputProps={{
            enterKeyHint: 'done',
          }}
          InputLabelProps={{ shrink: true }}
          inputRef={inputRef}
          {...(isControlled
            ? { value, onChange }
            : { defaultValue })}
          {...rest}
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

-------------------------------------
// 1. Uncontrolled 상태로 사용하기
-------------------------------------

const inputRef = useRef();

<CatTextField
  label="바코드"
  defaultValue="초기값"
  inputRef={inputRef}
/>


-------------------------------------
// 2. Controlled상태로 사용하기
-------------------------------------

const [barcode, setBarcode] = useState('');

<CatTextField
  label="바코드"
  value={barcode}
  onChange={(e) => setBarcode(e.target.value)}
/>


**************************************************************************************************************************/