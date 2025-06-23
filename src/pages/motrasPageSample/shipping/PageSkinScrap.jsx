import { React, useEffect, useState, useRef, useCallback, } from "react";
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
import { Stack, TextField, Button, Box, Typography, IconButton, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import CatTextField from '../../components/CatTextField'
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatSelect from '../../components/CatSelect'
import CatTextFieldReadonly from '../../components/CatTextFieldReadonly'
import CatBarcodeNative from '../../components/CatBarcodeNative'
import getDateTimeFormat  from "../../functions/getDateTimeFormat";
/*******************************************************************************************
@verison     
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
1.00		2024-12-26	sj_hong				프로그램 배포
1.01		2025-05-14	sj_hong				vite+SWC 업데이트
*******************************************************************************************/
/*******************************************************************************************	
@Page pageSkinScrap.jsx
@Role Motras PDA > 출하 메뉴 > 스킨 폐기 페이지
@description 이전 명칭 FrmSkinScrap.cs
*******************************************************************************************/
export default function PageSkinScrap() {
    
	const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
	} = useRootContext();

	const scanLocationRef = useRef('skinScrapBarcode'); // 네이티브에서 기준삼을 스캔 위치 플래그 값 (매개변수에 처음 지정위치 포함)
	const focuseBarcode = useRef(null); //팔레트 텍스트필드 포커스 기준

 	const [pageFlag, setPageFlag] = useState('inputBarcode');//페이지의 보여줄 상태 플래그 값 
	const [scannedBarcode, setScannedBarcode] = useState('');//바코드

	// 귀책선 (생산업체) 정보 값
	const [producerCompany, setProducerCompany] = useState({selected: "", options: []}); 

	//스킨폐기 불량코드 데이터그리드 값
	const [gridSkinBadCode, setGridSkinBadCode] = useState({
		columns : [
			{field: 'L_NAME', headerName: '대분류', width: 150,},
			{field: 'M_NAME', headerName: '중분류', width: 110,},
			{field: 'S_NAME', headerName: '소분류', width: 150,},
		],
		rows : [],
		selected : "",
	});

	//useState따라하는 ref
	const pageFlag_Ref = useRef(''); 
	const scannedBarcode_Ref = useRef(''); 
	const producerCompany_Ref = useRef(''); 
	const gridSkinBadCode_Ref = useRef(''); 
	useEffect(() => { pageFlag_Ref.current = pageFlag }, [pageFlag]);
	useEffect(() => { scannedBarcode_Ref.current = scannedBarcode }, [scannedBarcode]);
	useEffect(() => { producerCompany_Ref.current = producerCompany }, [producerCompany]);
	useEffect(() => { gridSkinBadCode_Ref.current = gridSkinBadCode }, [gridSkinBadCode]);	

	// 네이티브 메시지 콜백 
	const onMessage = useCallback((event) => {
        nativeReadData(event); // WebView에서 받아온 데이터 읽기
    }, []); 

	//페이지 시작 시 선택값 호출 후 저장
	useEffect(() => { 
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		onFocuseBarcode();
		setOnLoading(true);
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"pk_load_sp_code_id_BY_USER", //코드 기준 검색 프로시저
					parameter:["PROD_DEPT"], // 기업 정보 가져오기
					EventType:"",
					EventName:"",
				});
				setProducerCompany({
					...producerCompany,
					options: result.map(data => ({
						value: data['PROD_CODE'],
						label: data['PROD_NAME'],
					}))
				})
			} 
			catch (err) {	
				setPopup(`기업 정보를 가져오지 못 했습니다. [${err}]`);
			} 
			finally {
				setOnLoading(false);
			}
		})();

		// 스킨불량코드 가져오기		
		(async () => {	
			try {
				const result = await UseFetchParam({
					procedure:"PSP_L_SKIN_BAD_LIST", //스킨불량코드 가져오기
					parameter:[""], //실제로 매개변수 미사용 프로시저
					EventType:"useEffect",
					EventName:"Load selectable ProducerCompany Data Load",
				});	
				setGridSkinBadCode({
					...gridSkinBadCode, // 기존 객체를 유지
					rows: result.map(data => ({
					  ERR_CODE: data['@@불량코드'].trim(), 
					  L_NAME: data['대분류'].trim(),
					  M_NAME: data['중분류'].trim(),
					  S_NAME: data['소분류'].trim(),
					}))
				});
			}
			catch (err) {			  				
				setPopup(`불량 코드를 불러오지 못 했습니다.. [${err}]`);
			}
			finally {
				setOnLoading(false);
			}
		})();

		//네이티브 호출
		document.addEventListener('message', onMessage);		
		return () => {
			document.removeEventListener('message', onMessage);
		}
	}, []);

	useEffect(() => {  
		if(pageFlag === 'inputBarcode'){
			onFocuseBarcode()
		}
	 }, [pageFlag]);

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
				if (scanLocationRef.current === 'skinScrapBarcode') {
					onInputBarcode(scannedData.data);					
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

	/** 바코드 포커스 이동 */
	const onFocuseBarcode = () => {
		scanLocationRef.current = 'skinScrapBarcode';
		if ( focuseBarcode.current){
			focuseBarcode.current.value = ''
			focuseBarcode.current.focus(); // 바코드 시작 포커스 이동	
		}
	}

	/** 텍스트필드 엔터키 동작  */
	const onKeydownForEvent = (event) => {
		if(event.key !== 'Enter'){
			return
		}
		if(event.key === 'Enter' &&  scanLocationRef.current === 'skinScrapBarcode'){
			event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
			onInputBarcode(event.target.value);
			return
		}
	} 

	/** 바코드 입력 이벤트, 바코드 폐기 가능 여부 검사 */
	const onInputBarcode = (insertedBarcode)=> {
		setOnLoading(true);
		if( insertedBarcode.trim().length !== 14 ){
			setPopup(`바코드 오류`, `바코드를 입력해 주세요.`);
			onFocuseBarcode()
			setOnLoading(false);
			return
		}
		if( insertedBarcode.trim().length !== 14 ){
			setPopup(`바코드 오류`, `바코드 길이 오류 [제한:14동일]`);
			onFocuseBarcode()
			setOnLoading(false);
			return
		}
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"PSP_L_SKIN_RES_SEARCH", //바코드 존재 여부 검사 프로시저 
					parameter:[insertedBarcode], 
					EventType:"barcodeRead",
					EventName:"Skin Scrap barcodeRead",
				});
				if(result[0].Column1 === 'OK'){
					setScannedBarcode(insertedBarcode);
					onFocuseBarcode()
				} 
				else{
					throw new Error("바코드 조회 결과가 올바르지 않습니다.");
				}										
			} 
			catch (err) {			  					
				setPopup(`바코드 에러. [${err}]`);
			} 
			finally {
				setOnLoading(false);
			}
		})();
	}

	/** 스킨폐기 버튼 클릭 이벤트, 바코드 검사 후 상세 폐기 정보 입력 화면으로 이동 */
	const onPageChangeToDetail = ()=> {
		setOnLoading(true);
		if (scannedBarcode_Ref.current === ''){
			setPopup(`바코드를 입력해주세요.`);
			onFocuseBarcode()			
			setOnLoading(false);
			return;
		}		
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"PSP_L_SKIN_ERR_MODIFY_BARCODE_CHECK", // 바코드 체크
					parameter:[scannedBarcode_Ref.current], 
					EventType:"BarcodeCheck",
					EventName:"Skin Scrap Barcode check",
					isVoidProcedure: true,
				});	
				setPageFlag('inputScrapDetail');//페이지 전환
			} 
			catch (err) {	
				setPopup(`${err}`);
			} 
			finally {
				setOnLoading(false);
			}
		})();	
	}

	/** 스킨폐기 전송 버튼 클릭 이벤트 */
	const onSubmitSkinScrap = ()=> {
		setOnLoading(true);
		if(producerCompany_Ref.current.selected === ''){			
			setPopup(`귀책선(업체) 선택되지 않았습니다.`);
			setOnLoading(false);
			return
		}
		if(gridSkinBadCode_Ref.current.selected === ''){	
			setPopup(`불량유형이 표에서 선택되지 않았습니다.`);	
			setOnLoading(false);	
			return
		}		
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"PSP_S_SKIN_SCRAP",
					parameter:[
						scannedBarcode_Ref.current //바코드
						, producerCompany_Ref.current.selected //귀책선 회사
						, gridSkinBadCode_Ref.current.selected //불량코드
					], 
					EventType:"SAVE",
					EventName:"SkinScrap",
					isVoidProcedure: true, //조회결과 같은건 없는 프로시저
				});						
				
				setPageFlag('inputBarcode');//페이지 전환 
				setScannedBarcode("")//입력바코드 초기화
				setProducerCompany({...producerCompany, selected: ""})//귀책선초기화
				setGridSkinBadCode({...gridSkinBadCode, selected: ""})//폐기사유선택 초기화
				setPopup(`폐기처리 되었습니다.`)
			} 
			catch (err) {
				setPopup(`[${err}]`);
			} 
			finally {
				setOnLoading(false);
			}
		})()
	}

	/** 스킨폐기 바코드 입력화면으로 이동, 기본 창으로 변환 이벤트 */
	const onPageChangeToInputBarcode = ()=> {
		setPageFlag('inputBarcode'); // 페이지 전환
		setProducerCompany({...producerCompany, selected: ""})//입력하게 될 귀책선 초기화
		setGridSkinBadCode({...gridSkinBadCode, selected: ""})//입력하게 될 폐기사유선택 초기화
	}

    return (
    <Stack gap={2} m={1}>
        {pageFlag === 'inputBarcode' && // 기본 시작 입력화면
		<>
			<CatBarcodeNative
				label={'바코드'}
				id={'skinScrapBarcode'}
				onClick={onClickForNative}
				onKeyDown={onKeydownForEvent}
				inputRef={focuseBarcode}
			/>
			<CatTextFieldReadonly 
				label="입력된 스킨 폐기 대상 바코드" 
				value={scannedBarcode}				
			/>
			<CatButtonBigOne 
				buttonLabel={"스킨폐기"}
				onClick={onPageChangeToDetail}
			/>
		</>
		}
		{pageFlag === 'inputScrapDetail' && //스킨폐기 상세 입력화면
		<>
			<CatTextFieldReadonly 
				label="입력된 스킨 폐기 대상 바코드" 
				value={scannedBarcode}
			/>
			<CatSelect
				label={"귀책선 (생산업체)"}
				value={producerCompany.selected} 
				option={producerCompany.options}
				onChange={(event) => {	  
					setProducerCompany({ ...producerCompany, selected: event.target.value })   
				}}
			/>
			<CatDataGrid 
				row={gridSkinBadCode.rows} 
				col={gridSkinBadCode.columns}				
				onRowClick={(params) => {   
					setGridSkinBadCode({ ...gridSkinBadCode, selected: params.row.ERR_CODE})  					
				}}
			/>
			<CatButtonBigOne 
				buttonLabel={"전송"}
				onClick={onSubmitSkinScrap}
			/>
			<CatButtonBigOne
				buttonLabel={"이전"}
				onClick={onPageChangeToInputBarcode}
			/>
		</>
		}		
    </Stack>
    )
}