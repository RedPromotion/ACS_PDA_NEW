import { React, useEffect, useState, useRef, useCallback, } from "react";//리액트
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
import { Stack, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import CatTextField from '../../components/CatTextField'
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatSelect from '../../components/CatSelect'
import CatBarcodeNative from '../../components/CatBarcodeNative'
import getDateTimeFormat  from "../../functions/getDateTimeFormat";
/*******************************************************************************************
@버전     
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
1.00		2024-12-26	sj_hong				프로그램 배포
1.02		2025-05-14	sj_hong				vite+SWC 업데이트
*******************************************************************************************/
/*******************************************************************************************
@name PageShipmentCancel.jsx
@Role Motras PDA > 출하 메뉴 > 출하 취소 페이지 
@description 
-	이전 명칭 frmChulhaCancel.cs
-	PSP_L_OUTPUT_CANCEL_BARCODE_CHECK 프로시저의 0번째 조회문의 4번째 count컬럼이 없음 (예외처리는 완료)
*******************************************************************************************/
export default function PageShipmentCancel() {

 	const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
	 } = useRootContext();

    const scanLocationRef = useRef('shipmentCancelBarcode'); // 네이티브에서 기준삼을 스캔 위치 플래그 값  (매개변수에 처음 지정위치 포함)
	
	const focuseBarcode = useRef(null); //팔레트 텍스트필드 포커스 기준

	const [count, setCount] = useState(0); //조회된 카운트 저장

	const [gridShipCancel, setGridShipCancel] = useState({ //데이터그리드 값
		columns: [						
			{ field: '바코드', headerName: '바코드', width: 220},
			{ field: '팔레트', headerName: '팔레트', width: 100 },
			{ field: '납품사업장', headerName: '납품사업장', width: 130 },
			{ field: '적재일자', headerName: '적재일자', width: 200 },
			{ field: '출하일자', headerName: '출하일자', width: 200 },
		],
		rows: [],
	});
	
	const [palletInformation, setPalletInformation] = useState({ //텍스트박스 표기 팔레트 정보
		PLT_NO: '',
		PACKDATE: '',
		LASER: ''
	});	
	
	//셋함수 연동	
	const gridShipCancel_Ref = useRef(''); 	
	const palletInformation_Ref = useRef(''); 	
	useEffect(() => {  gridShipCancel_Ref.current = gridShipCancel }, [gridShipCancel]);
	useEffect(() => {  palletInformation_Ref.current = palletInformation }, [palletInformation]);

	// 네이티브 메시지 콜백 
	const onMessage = useCallback((event) => {
        nativeReadData(event); // WebView에서 받아온 데이터 읽기
    }, []); 

	//네이티브 불러오기
	useEffect(() => {
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		onFocuseBarcode();
		document.addEventListener('message', onMessage);
		return () => {
			document.removeEventListener('message', onMessage);
		}
	}, []);
	
	/** 네이티브기준 값 전달 */
	const onClickForNative = (event) => {	
		if (document.getElementById(event.target.id)) {
		  document.getElementById(event.target.id).value = ''; // 바코드 초기화
		}
		scanLocationRef.current = event.target.id; // 구분 기준 플래그 값 부여
	};
	
	// 네이티브 에서 보낸 데이터 읽기
	const nativeReadData = (e) => {
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
			try{
				if (scanLocationRef.current === 'shipmentCancelBarcode') {
					onInputBarcode(scannedData.data);					
				}
			}
			finally{
				scanLocationRef.current = ''; //스캔 감지 이후 플래그 값 초기화
			}
		}
	}

	 /** 텍스트필드 엔터키 동작  */
	 const onKeydownForEvent = (event) => {
        if(event.key !== 'Enter'){
            return
        }
        if(event.key === 'Enter' &&  scanLocationRef.current === 'shipmentCancelBarcode'){
            event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
            onInputBarcode(event.target.value);
            return
        }
    }  

	/** 바코드 포커스 이동 */
	const onFocuseBarcode = () => {
		scanLocationRef.current = 'shipmentCancelBarcode'; // 구분 기준 플래그 값
		if ( focuseBarcode.current ){
			focuseBarcode.current.value = ''
			focuseBarcode.current.focus(); // 바코드 시작 포커스 이동	
		}
	}

	/** 바코드 입력 */
	const onInputBarcode = ( scanBarcode ) => {
		setOnLoading(true);
		if( !scanBarcode ){
			setPopup('바코드를 입력해주세요.');
			onFocuseBarcode();
			return ;
		}
		if( scanBarcode.length < 23 ){
			setPopup('바코드를 길이가 잘못 되었습니다.');
			onFocuseBarcode();
			return ;
		}	
		(async () => {
			try {
				//2D바코드 수정
				const result1 = await UseFetchParam({
					procedure:"CSP_L_BARCODE_LOAD_CHANGE", //바코드 매핑 프로시저
					parameter:[scanBarcode, ''], // 아웃풋 프로시저로 공백변수 할당
					EventType:"barcode mapping",
					EventName:"shipment cancel barcode mapping",
					UserMessageIsError: false,
				});	
				//바코드 체크 
				const result2 = await UseFetchParam({
					api: "GENERAL",			
					procedure:"PDA_OUTPUT_CANCEL_BARCODE_CHECK_L", // 테스트 용 예상 프로시저  // 기존 프로시저 : PSP_L_OUTPUT_CANCEL_BARCODE_CHECK
					parameter:[ result1[0].Column1 ], //매핑바코드 전달 
					EventType:"check data",
					EventName:"load shipment cancel barcode data",
					isSelectMultiple: true,	 
						// 0번(첫번째) 배열은 텍스트필드 정보 1개 행의 값
						// 1번(두번쨰) 배열은 조회된 여러 행의 값
				});
				if( !result2[0][0].PLT_NO ){
					setPopup(`바코드 에러`,`팔레트 번호 조회 불가 [팔레트: '${result2[0][0].PLT_NO}']`);
					return
				}
				if( !result2[0][0].LASER ){
					setPopup(`바코드 에러`,`ERP번호 조회 불가 [ERP : '${result2[0][0].LASER}]'`);
					return
				}

				// 텍스트필드 반영  0번(첫번째) 배열
				setPalletInformation({					
					PLT_NO: 	result2[0][0].PLT_NO, 	//txtPallet
					PACKDATE: 	im.formatDateToYYYYMMDDHHMMSSfff(result2[0][0].PACKDATE), 	//날짜 값이 리액트 및 API에서 왜곡되어 재가공
					LASER: 		result2[0][0].LASER  	//erpNum
					//txtAllCount : result2[0][0].txtAllCount   //ds.Tables[0].Rows[0][3].ToString(), txtAllCount 가 있었어야함
				})

				// txtAllCount 있는 지 검사하는 로직
				if(result2[0][0].txtAllCount){  // C# 단말기에만 있던 txtAllCount이 프로시저에서 제공될 경우
					setCount(Number(result2[0][0].txtAllCount))
				}
				else{ // C# 단말기에만 있던 txtAllCount이 프로시저에 없을 경우,					
					setCount(Number(result2[1].length))
				}
							
				// 데이터 그리드 반영  1번(두번쨰) 배열
				setGridShipCancel({
					...gridShipCancel_Ref.current,
					rows: result2[1].map(data => ({
						id: data['바코드'].trim(), 
						바코드: data['바코드'].trim(), 
						팔레트: data['팔레트'].trim(),
						납품사업장: data['납품사업장'].trim(),
						적재일자: data['적재일자'].trim(),
						출하일자: data['출하일자'].trim(),
					}))			
				})
			} 
			catch (err) {
				setPopup(`${err}`);
			} 
			finally {
				onFocuseBarcode();
				setOnLoading(false);
			}
		})();	
	};

	/** 출하 취소 버튼 클릭  */
	const onExcuteCancelShipment = () => {	
		if( gridShipCancel_Ref.current.rows.length === 0 ){
			setPopup('출하 취소 실패','등록된 출하취소 대상 팔레트가 없습니다.');
			onFocuseBarcode();
			return ;
		}
		if ( !palletInformation_Ref.current.PLT_NO ) {
			setPopup('출하 취소 실패','적합한 출하취소 팔레트가 없습니다.');
			onFocuseBarcode();
			return ;
		} 
		setOnLoading(true);
		(async () => {
			try {
				const result = await UseFetchParam({
					api: "GENERAL",
					procedure:"PSP_S_OUTPUT_CANCEL", //팔레트 단위로 출하 취소 프로시저
					parameter:	[ 
						palletInformation_Ref.current.PLT_NO  	//@p_Pallet 	출하 취소할 팔레트 번호
						,palletInformation_Ref.current.PACKDATE //@p_PackDate 	팔레트 적재일자
						,palletInformation_Ref.current.LASER 	//@p_ErpNum 	이알피번호 
					], 
					EventType:"save data",
					EventName:"cancel shipment data",
					isVoidProcedure: true,
				});	

				// 알림
				setPopup(`출하 취소 되었습니다.`);

				//입력 초기화
				setGridShipCancel({ //데이터그리드 초기화
					...gridShipCancel,
					rows: [],
				})
				setPalletInformation({//텍스트박스 정보 초기화
					PLT_NO: '',		
					PACKDATE: '',
					LASER: ''
				})
				setCount(0);//텍스트박스 중 카운트 초기화				
				onFocuseBarcode();
			} 
			catch (err) {	
				setPopup(`${err}`);
			} 
			finally {
				setOnLoading(false);
			}
		})();
	};

    return (
    <Stack m={1}>
        <CatBarcodeNative
			label={'바코드'}
			id={'shipmentCancelBarcode'}
			onClick={onClickForNative}
			onKeyDown={onKeydownForEvent}
			inputRef={focuseBarcode}
		/>
		<Box display="flex" mt={1}>
			<Box flex={3} mr={1}>
				<TextField
					variant="filled"
					size= {"small"}
					label="팔레트"
					value={palletInformation.PLT_NO}
					sx={{height: '100%', width: '100%'}}
					InputProps={{ readOnly: true, }}
					InputLabelProps={{ shrink: true }}
				/>
			</Box>
			<Box flex={1}>
				<TextField
					variant="filled"
					type="number"
					label="Count"
					size= {"small"}
					value={count}
					sx={{height: '100%', width: '100%'}}
					InputProps={{ readOnly: true, }}
					InputLabelProps={{ shrink: true }}
				/>
			</Box>
		</Box>
		<Box display="flex" mt={1} mb={1}>
			<TextField
				variant={"filled"}
				size= {"small"}	
				label={"팔레트 일자"}
				value={palletInformation.PACKDATE}
				sx={{ width: '100%'}}
				InputProps={{ readOnly: true, }}
				InputLabelProps={{ shrink: true }}
			/>
		</Box>
		<CatDataGrid
			rows={gridShipCancel.rows} 
			col={gridShipCancel.columns} 
		/>
        <Stack mt={2}>
            <CatButtonBigOne 
                buttonLabel='출하 취소' 
                onClick={onExcuteCancelShipment}
            />
        </Stack>
    </Stack>
    )
}