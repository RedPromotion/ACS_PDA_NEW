import { React, useEffect, useState, useRef, useCallback } from "react"; //리액트 
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
import getDateTimeFormat  from "../../functions/getDateTimeFormat";
import { Stack, Typography } from '@mui/material';
import CatTextField from '../../components/CatTextField'
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatSelect from '../../components/CatSelect'
/*******************************************************************************************
@verison   
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
1.00		2024-12-26	sj_hong				프로그램 배포
1.01        2025-05-14  sj_hong             Vite+SWC 페이지로 적용
*******************************************************************************************/
/*******************************************************************************************	
@Page PagePartScrap.jsx
@Role_Loading Motras PDA > 적재 > 적재취소
@Role_shipment Motras PDA > 출하 > 제품폐기
@description - 적재와 출하 양쪽에서 공통으로 사용
*******************************************************************************************/
export default function PagePartScrap() {

    const { setPopup, setOnLoading, } = useRootContext();

    const [scannedBarcode, setScannedBarcode] = useState('');  //스캔된 바코드 값 저장
	const [pageFlag, setPageFlag] = useState('inputBarcode'); //페이지의 보여줄 상태 플래그(inputBarcode, inputScrapDetail) 

	const [select_BadPoint, setSelect_BadPoint] = useState({selected: "", options: []}); //불량부위 셀렉트
	const [select_BadReason, setSelect_BadReason] = useState({ 	//불량사유 셀렉트
		selected: "", 
		options: [
			{ value: '작업자 불량', label: '작업자 불량' },
			{ value: '설비불량', label: '설비 불량' },
			{ value: '자재불량', label: '자재 불량' },
			{ value: '운반불량', label: '운반 불량' },
			{ value: '금형개발', label: '금형 개발' },
			{ value: 'TEST', label: 'TEST' },
		]
	}); 	

	const [gridBadReason, setGridBadReason]  = useState({ //불량사유 선택 데이터그리드 값
		columns : [
			{ field: '대분류', headerName: '대분류', width: '150'},
			{ field: '중분류', headerName: '중분류', width: '130' },
			{ field: '소분류', headerName: '소분류', width: '200'},
		],
		rows : '', //그리드값
		selected : [], //선택값
	});
	
	const focuseBarcode = useRef(null); //팔레트 텍스트필드 포커스 기준
	const scanLocationRef = useRef('partScrapBarcode'); // 네이티브에서 기준삼을 스캔 위치 플래그 값 (매개변수에 처음 지정위치 포함)

	//셋함수 따라서 저장하는 ref
	const scannedBarcode_Ref = useRef(''); 
	const select_BadPoint_Ref = useRef(''); 
	const select_BadReason_Ref = useRef(''); 
	const gridBadReason_Ref = useRef(''); 

	//셋함수 따라하는 이펙트
	useEffect(() => { scannedBarcode_Ref.current = scannedBarcode }, [scannedBarcode]);
	useEffect(() => { select_BadPoint_Ref.current = select_BadPoint }, [select_BadPoint]);
	useEffect(() => { select_BadReason_Ref.current = select_BadReason }, [select_BadReason]);	
	useEffect(() => { gridBadReason_Ref.current = gridBadReason }, [gridBadReason]);	

	// 네이티브 메시지 콜백 
	const onMessage = useCallback((event) => {
		nativeReadData(event); // WebView에서 받아온 데이터 읽기
	}, []); 

    
	useEffect(() => { 
		onFocuseBarcode();
		setOnLoading(true);
		(async () => {
			try { // // 불량부위 정보 DB에서 가져오기
				const result = await UseFetchParam({
					procedure:"pk_load_sp_code_id_BY_USER", //코드 기준 검색 프로시저
					parameter:["ERR_POINT"], 
					EventType:"load code",
					EventName:"ERP bad point load",
				});
				// 데이터그리드에 맞도록 컬럼 명 수정 후 저장
				setSelect_BadPoint(prevState => ({
					...prevState,
					options: result.map(data => ({
						id: data['부위코드'].trim(),
						value: data['부위코드'].trim(),
						label: data['부위명'],
					}))
				}));
			} 
			catch (err) {
				setPopup(`불량부위 정보를 가져오지 못 했습니다. [${err}]`);
			}	
			finally{
				setOnLoading(false);
			}		
		})();

		//네이티브 호출
		document.addEventListener('message', onMessage);
		return () => { 
			document.removeEventListener('message', onMessage) 
		}
	  }, []);

	  useEffect(() => {  
		onFocuseBarcode(); 
	 }, [pageFlag]);

	  //상세입력 중 불량사유(selectedBadReason) 선택되면 해당하는 불량정보 하위 데이터 표 값 가져오기
	  useEffect(() => { 
		if(!select_BadReason.selected){ // 선택된 대분류 불량사유 없으면 불량리스트 안 불러옴.
			return;
		}
		(async () => {
			try {
				const result = await UseFetchParam({                
					procedure:"PSP_L_BAD_LIST", //불량사유 프로시저
					parameter:[select_BadReason.selected], 
					EventType:"useEffect",
					EventName:"Load BadPointOption Data Load",
				});			
				// 데이터그리드에 맞도록 컬럼 명 수정 후 저장
				setGridBadReason(prevState => ({
					...prevState,
					rows: result.map(data => ({
						id: data['@@불량코드'], 
						value: data['@@불량코드'],
						대분류: data['대분류'].trim(),
						중분류: data['중분류'].trim(),
						소분류: data['소분류'].trim(),
					}))
				}));
			} catch (err) {			  
				setPopup(`불량사유 정보를 가져오지 못 했습니다. [${err}]`);
			}
		})();
	  }, [select_BadReason.selected]);

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
		if (type === 'SCANDATA') {			
			const { scannedData, scannedLabelType, type } = JSON.parse(e.data); 					
			try{
				if (scanLocationRef.current === 'partScrapBarcode') {
					handleBarcodeInput(scannedData.data);					
				}
			}
			finally{
				scanLocationRef.current = ''; //스캔 감지 이후 플래그 값 초기화
			}
		}
		if (type === 'GET_WIFI_CURRENT_SIGNAL_STRENGTH') {
			const { wifiCurrentSignalStrength, type } = JSON.parse(e.data);
			if (wifiCurrentSignalStrength <= -85) {
				setPopup('무선랜 신호가 약하거나 끊겼습니다.');
				return
			}
		}
	}

	 /** 텍스트필드 엔터키 동작  */
	 const onKeydownForEvent = (event) => {
        if(event.key !== 'Enter'){
            return
        }
        if(event.key === 'Enter' &&  scanLocationRef.current === 'partScrapBarcode'){
            event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
            handleBarcodeInput(event.target.value);
            return
        }
    }  

	/** 바코드 포커스 이동 */
	const onFocuseBarcode = () => {
		scanLocationRef.current = 'partScrapBarcode';
		if (focuseBarcode.current){
			focuseBarcode.current.value = ''
			focuseBarcode.current.focus(); 
			
		}
	}

	/** 바코드 입력 감지, 바코드 매핑 하여 변경 시도함 */
	const handleBarcodeInput = ( insertBarcode ) =>  {
		setOnLoading(true);
		if( insertBarcode.trim().length < 23 ){ 			
			onFocuseBarcode()
			setPopup(`바코드 에러`,`잘못된 제품바코드입니다.`);
			setOnLoading(false);
			return
		}
		(async () => {
			try {
				const result = await UseFetchParam({					
					procedure:"CSP_L_BARCODE_LOAD_CHANGE", //바코드 매핑 확인 프로시저 (아웃풋_프로시저)
					parameter:[insertBarcode, ''], 
					EventType:"Scan Barcode",
					EventName:"barcode mapping",					
				});
				setScannedBarcode( result[0].Column1 );	//SQL에서 교체된 바코드 컬럼 저장됨
			} 
			catch (err) {				  							
				setPopup('바코드 에러', `바코드 인식에 실패했습니다. [바코드: ${insertBarcode}]  ${err}`);
				setScannedBarcode('');					
			}
			finally {
				onFocuseBarcode()
				setOnLoading(false);
			}
		})();
	}

	/** 제품폐기 버튼 클릭, 폐기 가능한지 검사하고 폐기 정보 입력 페이지로 전환 */
	const onPageToPartScrap = () => {
		setOnLoading(true)
		if( !scannedBarcode_Ref.current ) {
			setPopup('바코드 미입력',"바코드가 입력되지 않았습니다.")
			return;
		}		
		(async () => {
			try {
				const result = await UseFetchParam({					
					procedure:"PSP_L_PART_SCRAP_BARCODE_CHECK", // 부품 폐기 가능한지 바코드 검사
					parameter:[scannedBarcode_Ref.current], 
					EventType:"Barcode check",
					EventName:"part scrap posible check",
					isVoidProcedure: true, //예외처리만 하는 프로시저
				});						
				setPageFlag('inputScrapDetail'); // 검사 시 문제 없으면, 상세입력 페이지로 이동
			} 
			catch (err) {				  							
				setPopup(`제품폐기를 진행할 수 없습니다. [바코드: ${scannedBarcode_Ref.current}] ${err}`);								
			}
			finally {
				setOnLoading(false);
			}
		})();		
	}

	/** 적재취소 버튼 이벤트, 바로 적재 취소를 시도함 */
	const onCancelStore = () => {		
		setOnLoading(true);
		if( !scannedBarcode_Ref.current ) {
			setPopup('바코드 미입력',"바코드가 입력되지 않았습니다.")
			return;
		}		
		(async () => {
			try {					
				const result = await UseFetchParam({
					api: 'GENERAL',
					procedure:"PSP_S_STORE_CANCEL", //적재취소 프로시저 
					parameter:[scannedBarcode_Ref.current],
					EventType:"BARCODE",
					EventName:"PART STORE CANCEL",
					isVoidProcedure: true,
				});
				setPopup( '적재 취소', `${scannedBarcode_Ref.current} 의 적재가 취소되었습니다.` )
				setScannedBarcode('');
				onFocuseBarcode()				
			} 
			catch (err) {
				setPopup(`적재취소에 오류가 발생하였습니다. [바코드: ${scannedBarcode_Ref.current}]  ${err}`);
			} 
			finally {
				setOnLoading(false);
			}
		})();									
	}

	/** 제품폐기 버튼클릭하여 이동 후 전송 버튼 클릭 이벤트 */
	const onSubmitScrap = () => {
		setOnLoading(true);
		if( !scannedBarcode_Ref.current ) {	 
			setPopup('바코드 없음',"폐기할 바코드가 없습니다.")			
			return;
		}
		if( !select_BadPoint_Ref.current.selected ) {	
			setPopup('에러',"불량부위가 선택되지 않았습니다.")
			return;
		}
		if( !select_BadReason_Ref.current.selected ) {
			setPopup('에러',"불량사유가 선택되지 않았습니다.")
			return;
		}
		if( !gridBadReason_Ref.current.selected ) {
			setPopup('에러',"불량분류가 선택되지 않았습니다. 표에서 선택하세요.")
			return;
		}
		(async () => {
			try {
				const result = await UseFetchParam({ 
					api: "GENERAL",
					procedure:"PSP_S_PROD_ERROR_CODE",
					parameter:[
						scannedBarcode_Ref.current // @pBarcode  바코드
						,"N" // @pLastChk 고정된 값
						,select_BadPoint_Ref.current.selected // @pErrPcode  불량부위  
						,gridBadReason_Ref.current.selected // @pISBadBtn  선택불량
						,select_BadReason_Ref.current.selected // @pErrCode  불량사유
					],  
					EventType:"pallet save", 
					EventName:"update Part Scrap data",
					isVoidProcedure: true,
				});
				
				// 알림
				setPopup(`저장되었습니다.`);

				// 폐기 성공 이후 입력 및 화면 초기화
				setPageFlag("inputBarcode"); //바코드 입력 화면으로 이동
				setScannedBarcode(""); //바코드 초기화
				setSelect_BadPoint({...select_BadPoint, selected: ""}); //불량부위 초기화
				setSelect_BadReason({...select_BadReason, selected: ""});//불량사유 초기화
				setGridBadReason({...gridBadReason, selected: []})//불량텍스트 초기화

				onFocuseBarcode()
			} 
			catch (err) { // 예외 처리 
				setPopup(`제품을 폐기 하지 못 했습니다. [${err}]`);
			} 
			finally {
				setOnLoading(false);
			}
		})();
	}
	
	/** 제품폐기 상세입력에서 나가기 버튼 클릭 이벤트 */
	const onPageToInputBarcode = () => {
		setPageFlag("inputBarcode");
		setSelect_BadPoint({...select_BadPoint, selected: ""}); //불량부위 초기화
		setSelect_BadReason({...select_BadReason, selected: ""});//불량사유 초기화
		setGridBadReason({...gridBadReason,selected: []})//불량텍스트 초기화	
	}

	return (
	<Stack gap={1} m={1}>
		{pageFlag === 'inputBarcode' && // 기본 시작 입력화면
		<>			
			<CatTextField
				label={'바코드'}
				id={'partScrapBarcode'}
				onClick={onClickForNative}
				onKeyDown={onKeydownForEvent}
				inputRef={focuseBarcode}
			/>
            <Typography>입력된 바코드: {scannedBarcode}</Typography>
			<CatButtonBigOne
				buttonLabel='적재 취소'
				onClick={onCancelStore}
			/>	
			<CatButtonBigOne
				buttonLabel='제품 폐기'
				onClick={onPageToPartScrap}
			/>	
		</>
		}	
		{pageFlag === 'inputScrapDetail' && //제품폐기 버튼 클릭 후 상세 입력 화면
		<>			
			<CatTextField
				label="입력된 바코드" 
				value={scannedBarcode}
                readOnly={true}
			/>
			<CatSelect
				label="불량 부위"			
				value={select_BadPoint.selected}
				option={select_BadPoint.options}
				onChange={(event) => {
					setSelect_BadPoint(prevState => ({
						...prevState,
						selected: event.target.value
					}));
				}}
			/>
			<CatSelect
				label="불량 사유"			
				value={select_BadReason.selected} 
				option={select_BadReason.options}
				onChange={(event) => {	
					//불량사유 값 갱신
					setSelect_BadReason(prevState => ({
						...prevState,
						selected: event.target.value
					}));		
					//후속 선택 값 분류 초기화 
					setGridBadReason(prevState => ({
						...prevState,
						selected: ""
					}));		
				}}
			/>
			<CatDataGrid 		
				col={gridBadReason.columns} 
				row={gridBadReason.rows}
				onRowClick={(params) => {
					setGridBadReason(prevState => ({
						...prevState,
						selected: params.row.value
					}));
				}}
			/>
			<CatButtonBigOne 
				buttonLabel='전송'
				onClick={onSubmitScrap}
			/>
			<CatButtonBigOne 
				buttonLabel='이전'
				onClick={onPageToInputBarcode}
			/>	
		</>		
		}		
	</Stack>
	);
}