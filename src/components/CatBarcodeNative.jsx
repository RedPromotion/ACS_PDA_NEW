import { React, useEffect, useState, useRef } from "react";
import { TextField, Box} from '@mui/material';
/*******************************************************************************************
@verison
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
0.01        2024-11-12  sj_hong             신규생성
0.02        2024-11-21  sj_hong             클릭이벤트 DOM 요소 존재 확인 조건문 추가 
0.03        2024-12-04  sj_hong             클릭이벤트 
0.03        2024-12-04  sj_hong             컴포넌트 내부 스타일 제거
*******************************************************************************************/
/*******************************************************************************************	 
@Component CatBarcodeNative.jsx
@Function 네이티브용 onChange 바코드 입력창
@param  {string} label  (선택) 텍스트필드 라벨 값
@param  {string} id     (필수) 텍스트필드 id 값 
@param  {string} onClick(선택) 텍스트필드 초기화 후 이벤트 동작
@description  텍스트박스 클릭하면 입력된 값 삭제됨 
*******************************************************************************************/
export default function CatBarcodeNative ({ label='바코드' , id='', onClick, style={height:'40px'}, ...Prop}) {

    /** 기본 클릭이벤트, 클릭 시 내부 값 삭제 / 외부 온클릭 값 있으면 미사용 */
    const handleDefaultClick = (event) => {
        if( !document.getElementById(event.target.id) || !document.getElementById(event.target.id).value ){
            return
        }
        if( document.getElementById(event.target.id).value !== '' ){
            document.getElementById(event.target.id).value = ''
        }
    };

	return (
        <Box display="flex" sx={style}>
			<TextField
				variant={"outlined"}
				size= {"small"}
				autoComplete={'off'}
				fullWidth
                label={label}
                id={id}
                onClick={onClick || handleDefaultClick} // 외부 핸들러 우선
                 InputLabelProps={{ shrink: true }} //라벨 항상 상단에 표시
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
/**************************************************************************************************************************
 


**************************************************************************************************************************
// 기본 사용 예시
**************************************************************************************************************************

const focuseBarcode = useRef(null); //팔레트 텍스트필드 포커스 기준

return(
    <>  
        <im.CatBarcodeNative
            label={'바코드'}
            id={'Barcode'}
            onChange={onChange} 
            inputRef={focuseBarcode} 
        />
    </>
)




**************************************************************************************************************************
// native 사용 예시 
**************************************************************************************************************************

    onst focuseBarcode = useRef(null); //팔레트 텍스트필드 포커스 기준

    const onClick = (event)=> {		
        scanLocationRef.current = event.target.id;
        document.getElementById(event.target.id).value = '';
    }

    const scanLocationRef = useRef(''); // 바코드 스캔 위치	

	const onMessage = useCallback((event) => {
        ReadData(event); // WebView에서 받아온 데이터 읽기
    }, []); 

	useEffect(() => {
		document.addEventListener('message', onMessage);
		return () => {
			document.removeEventListener('message', onMessage);
		}
	}, []);

	// 네이티브 데이터 읽기 동작
	const ReadData = (e) => {
		const type = JSON.parse(e.data).type;        
		if (type === 'GET_WIFI_CURRENT_SIGNAL_STRENGTH') {
			const { wifiCurrentSignalStrength, type } = JSON.parse(e.data);
			if (wifiCurrentSignalStrength <= -85) {
				setPopup('무선랜 신호가 약하거나 끊겼습니다.');
				return
			}
		}
		if (type === 'SCANDATA') {
			const { scannedData, scannedLabelType, type } = JSON.parse(e.data);            			
			if (scanLocationRef.current === 'shipmentCancelBarcode') {  				
				onInputBarcode(scannedData.data);				
			}
		}
	}

    return(
        <>  
            <im.CatBarcodeNative
                label={'바코드'}
                id={''}
                onClick={onClick} 
                inputRef={focuseBarcode} 
            />
        </>
    )


**************************************************************************************************************************/
