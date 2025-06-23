import { React, useState } from "react";
import { Box, Button, TextField } from "@mui/material"
/**
 * CatBarcodeWithButton 컴포넌트 - 바코드 입력창과 조회 버튼을 포함한 컴포넌트
 * 
 * @param {Object} props - 컴포넌트의 props
 * @param {function} props.setBarcode - (필수) 값을 받을 콜백 함수, 매개변수로 반환함
 * @param {number} [props.limitSameLength] - 바코드 입력 값 동일하도록 제한설정
 * @param {number} [props.limitMaxLength] - 바코드 입력 값 최대 길이 제한설정
 * @param {number} [props.limitMinLength] - 바코드 입력 값 최소 길이 제한설정
 * @param {string} [props.label='Barcode'] - 바코드 입력 칸 라벨 명 설정
 * @param {boolean} [props.isClearOnClickBarcode=true] - 클릭 시 기존 바코드 값 삭제 여부
 * @param {number} [props.gap=1] - 버튼과 바코드 간 사이 크기 설정, 기본은 1
 * @param {Object} [props.barcodeStyle={height: '55px'}] - 바코드 전체 스타일 설정
 * @param {Object} [props.textFieldStyle={height: '100%', width: '100%'}] - 바코드 입력 텍스트필드 스타일
 * @param {string} [props.buttonLabel='조회'] - 버튼 명칭
 * @param {Object} [props.buttonStyle={height: '100%', minWidth: '130px', fontSize: 20}] - 버튼 스타일 설정
 * @param {Object} [props.Prop] - 텍스트필드 추가 설정 입력 (추가 props)
 * 
 * @author sj_hong 
 * @updated 2025-03-24 16:20
 * @example
 *   //기본 사용 예제
 *   <CatBarcodeWithButton 
 *      setBarcode= {(scannedBarcode) => { console.log(scannedBarcode) }}
 *      limitMinLength={5} // (옵션) 바코드 길이 제한  
 *      autoFocus // (옵션) 첫 입력 바코드에서 필요시 사용
 *   /> 
 */
export default function CatBarcodeWithButton({
    setBarcode,
    limitMinLength,
    limitMaxLength,
    limitSameLength,
    label = 'Barcode',
    isClearOnClickBarcode = true,
    gap = 1,
    barcodeStyle = { height: '55px' },
    textFieldStyle = { height: '100%', width: '100%' },    
    buttonStyle = { height: '100%', minWidth: '130px', fontSize: 20 },
    buttonLabel = '조회',
    ...Prop
}) {
    const [inputValue, setInputValue] = useState(''); // 입력 바코드 텍스트
    const [isErrorFlag, setIsErrorFlag] = useState(false); // 에러 여부
    const [isErrorMsg, setIsErrorMsg] = useState(''); // 에러 메시지

    /** 바코드 입력 시, 입력값 저장 */
    const handleInputChange = (event) => {
        setInputValue(event.target.value.trim());
    };

    /** 입력 필드 클릭 시, 에러 상태 초기화 */
    const handleClickField = () => {
        if (isErrorFlag) setIsErrorFlag(false);
        if (isClearOnClickBarcode) setInputValue('');
    };

    /** 엔터 입력 시, 바코드 값 저장 */
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') handleButtonClick();
    };

    /** 조회 버튼 클릭 시, 바코드 값을 반환 */
    const handleButtonClick = () => {
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
        <Box display="flex" mb={isErrorFlag ? 4 : 1} gap={gap} sx={barcodeStyle}>
            <TextField
                variant="outlined"
                label={label}
                sx={textFieldStyle}
                autoComplete="off"                
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleClickField}
                error={isErrorFlag}
                helperText={isErrorFlag ? isErrorMsg : ""}
                {...Prop}
            />
            <Button variant="contained" onClick={handleButtonClick} sx={buttonStyle}>
                {buttonLabel}
            </Button>
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
/**************************************************************************************************************************

    //바코드 저장
	const [scannedBarcode, setScannedBarcode] = useState('');  

    //콜백 함수 정의
    const handleBarcodeInput = (InputBarcode) => {        
		setScannedBarcode(InputBarcode);	
    };

    //태그 선언
    return (
		<>	
            <CatBarcodeWithButton 
                setsetBarcode={handleBarcodeInput}
                limitSameLength={8}
                limitMinLength={5} 
			    limitMaxLength={10}
                autoFocus // 필요시 사용                
            /> 
        </>
	);	

**************************************************************************************************************************/
