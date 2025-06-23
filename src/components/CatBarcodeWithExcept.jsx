import { React, useState } from "react";
import { TextField, Box } from "@mui/material";
/**
 * CatBarcodeWithButton 컴포넌트 - 바코드 입력창
 * 
 * @param {Object} props - 컴포넌트의 props
 * @param {function} props.setBarcode - (필수) 바코드 값을 상위 컴포넌트로 전달하는 콜백 함수
 * @param {number|string} [props.limitSameLength] - 바코드 입력 길이를 특정 값으로 제한
 * @param {number|string} [props.limitMaxLength] - 바코드 입력 값 최대 길이 제한
 * @param {number|string} [props.limitMinLength] - 바코드 입력 값 최소 길이 제한
 * @param {string} [props.label='Barcode'] - 바코드 입력 필드의 라벨
 * @param {boolean} [props.isClearOnClickBarcode=true] - 입력 필드를 클릭 시 기존 값 삭제 여부
 * @param {Object} [props.style={height:'55px', width: '100%'}] - 입력 필드 스타일 설정
 * @param {Object} [props.Prop] - 추가적인 TextField 속성들 (예: `placeholder`, `disabled` 등)
 * 
 * @author sj_hong 
 * @updated 2025-03-24 16:23
 * @example
 * // 기본 사용 예제
 * <CatBarcodeWithExcept
 *    label="바코드 입력"
 *    setBarcode={(scannedBarcode) => console.log(scannedBarcode)}
 *    limitMinLength={5}
 *    limitMaxLength={10}
 *    autoFocus // 첫 입력 바코드에서 필요시 사용
 * />
 */
export default function CatBarcodeWithExcept ({ 
    setBarcode, 
    label = 'Barcode',
    limitMinLength,
    limitMaxLength,
    limitSameLength,
    isClearOnClickBarcode = true,
    style = {height:'55px', width: '100%'},  
    ...Prop
}) 
{
    const [inputValue, setInputValue] = useState(''); //입력바코드 텍스트    
    const [isErrorFlag, setIsErrorFlag] = useState(false); //에러 불리언 플래그 값
    const [isErrorMsg, setIsErrorMsg] = useState(''); //에러 텍스트 값

    /** 바코드 입력 시, 입력값 저장 함수 */
    const handleInputChange = (event) => {
        const newValue = event.target.value.trim();
        setInputValue(newValue);        
    };

    /** 입력 필드 클릭 시, 에러 상태 초기화 */
    const handleClickField = () => {
        if (isErrorFlag) setIsErrorFlag(false);
        if (isClearOnClickBarcode) setInputValue('');
    };

    /** 엔터 입력 시, 바코드 값 검증 및 상위 컴포넌트로 전달 */
    const handleKeyDown = (event) => {
        if (event.key !== 'Enter') return;

        const barcodeLength = inputValue.length;
        const minLength = convertToNumber(limitMinLength);
        const maxLength = convertToNumber(limitMaxLength);
        const sameLength = convertToNumber(limitSameLength);

        if (!inputValue) {
            return setErrorState('바코드 오류, 미입력');
        }
        if (sameLength > 0 && barcodeLength !== sameLength) {
            return setErrorState(`바코드 입력 오류 (현재: ${barcodeLength} / 제한길이: ${sameLength} 동일)`);
        }
        if (maxLength > 0 && barcodeLength > maxLength) {
            return setErrorState(`바코드 입력 초과 (현재: ${barcodeLength} / 제한길이: 최대 ${maxLength})`);
        }
        if (minLength > 0 && barcodeLength < minLength) {
            return setErrorState(`바코드 입력 부족 (현재: ${barcodeLength} / 제한: 최소 ${minLength})`);
        }
        if (!setBarcode) {
            return setErrorState(`바코드 입력 값(setBarcode) 지정되지 않음`);
        }

        // ✅ 예외 조건을 모두 통과한 경우 바코드 함수 실행
        setBarcode(inputValue);
        setIsErrorFlag(false);
        setInputValue('');
    };

    /** 에러 상태 업데이트 */
    const setErrorState = (message) => {
        setIsErrorFlag(true);
        setIsErrorMsg(message);
    };

    /** 문자열이 숫자로 변환 가능하면 변환, 그렇지 않으면 원본 반환 */
    const convertToNumber = (value) => {
        const num = parseInt(value, 10);
        return Number.isNaN(num) ? value : num;
    };

	return (
        <Box display="flex" mb={isErrorFlag ? 4 : 1} >            
            <TextField
                variant="outlined"
                label= {label}
                sx={style}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleClickField}
                error={isErrorFlag} 
                helperText={isErrorFlag ? isErrorMsg : ""}
                autoComplete="off" // 자동완성 끄기
                {...Prop}
            />        
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
//상위 페이지에서의 코드 간단 사용 예시
***********************************    

    const onBarcodeReadEvent = (scannedData) => {
        console.log(scannedData); // 입력된 바코드 출력        
    }

    <CatBarcodeWithExcept
        label={'라벨'}
        setBarcode={onBarcodeReadEvent}
    />

***************************************************************************************************************************
//상위 페이지에서의 코드 상세 사용 예시
*************************************
    
    <CatBarcodeWithExcept
        label={'라벨'}
        setBarcode={onEvent}
        limitSameLength={5}  // 선택적 사용
        autoFocus // 선택적 사용
        inputRef={focusPallet} // 선택적 사용
    />

*******************************************************************************************/
