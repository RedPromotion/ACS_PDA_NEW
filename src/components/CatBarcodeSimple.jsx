import { TextField, Box } from "@mui/material";
/**
 * CatBarcodeSimple 바코드 입력을 위한 TextField 컴포넌트
 * 
 * @param {Object} props - 컴포넌트의 props
 * @param {string} [props.label='바코드'] - TextField의 라벨 텍스트 
 * @param {Object} [props.style={ height: '40px' }] - 추가적인 스타일 설정
 * @param {Object} [props.Prop] - 기타 `TextField`의 속성들 (`variant`, `size`, `fullWidth` 등)
 * 
 * @author sj_hong 
 * @updated 2025-02-18T10:49:00Z
 * @example
 * <CatBarcodeSimple 
 *      label={'바코드'} 
 *      id={'Barcode'} 
 *      onChange={onChange} 
 *      inputRef={focuseBarcode} 
 *  />
 */
export default function CatBarcodeSimple({ label = '바코드', style={ height: '55px' },  ...Prop }) {
    return (  
        <Box display="flex" ml={1} mr={1} mb={1}>
            <TextField
                variant="outlined"
                size="small"
                autoComplete="off"
                fullWidth
                label={label}
                sx={style}
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
        <CatBarcodeSimple
            label={'바코드'}
            id={'Barcode'}
            onChange={onChange} 
            inputRef={focuseBarcode} 
        />
    </>
)




**************************************************************************************************************************
// native 기능 사용 예시 
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
            <CatBarcodeSimple
                label={'바코드'}
                id={''}
                onClick={onClick} 
                inputRef={focuseBarcode} 
            />
        </>
    )


**************************************************************************************************************************/
