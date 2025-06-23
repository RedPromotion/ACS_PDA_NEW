import { useEffect, useState, useRef, useCallback, } from "react";//리액트
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
import { Stack, TextField, Button, Box,FormControl } from '@mui/material';
import CatTextField from '../../components/CatTextField'
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
@Page pageReturnSkinAndForming.jsx
@Role Motras PDA > 출하 > 스킨 및 발포 반품 운영 페이지
@description 이전 명칭 frmReturnBalpo.cs
*******************************************************************************************/
export default function PageReturnSkinAndForming() {

    const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
	} = useRootContext();

    const [selectedReturnType, setSelectedReturnType] = useState('skinReturn'); //반품종류 선택 플래그

	const scanLocationRef = useRef('skinReturnBarcode'); //네이티브에서 기준삼을 스캔 위치 플래그 값 (매개변수에 처음 지정위치 포함)

	const focuseSkinBarcode = useRef(null); //텍스트필드 포커스 기준
	const [scannedSkinData, setScannedSkinData] = useState({ // 스킨반품 스킨바코드 정보
		BARCODE: "", 
		PART_NO: "",
		PROD_DATE: "",
	}); 
	const [skinBadReason, setSkinBadReason] = useState({ // 스킨 반품 사유
		selected: "", 
		options: [
			{ value: '불량', label: '불량' },
			{ value: '과납', label: '과납' },
			{ value: '기타', label: '기타' },
		],
	}) 
	const [skinBadReasonRemark, setSkinBadReasonRemark] = useState(""); //스킨불량 반품처리사유

	const focuseFormingBarcode = useRef(null); //텍스트필드 포커스 기준
	const [scannedFormingData, setScannedFormingData] = useState({ // 발포반품 발포바코드 정보
		barcode: "", 
		part_no: "",
		SCRAP: "",
		prod_date: "",
	}); 
	const [formingBadReason, setFormingBadReason] = useState({ // 발포 반품 사유
		selected: "", 
		options: [
			{ value: '불량', label: '불량' },
			{ value: '과납', label: '과납' },
			{ value: '기타', label: '기타' },
		],
	});
	const [formingBadRemark, setFormingBadRemark] = useState(""); //발포불량 반품처리사유
		
	//셋함수 따라가는 스킨 변수 
	const scannedSkinData_Ref = useRef(''); 
	const skinBadReason_Ref = useRef(''); 
	const skinBadReasonRemark_Ref = useRef(''); 

	//셋함수 따라가는 발포 변수
	const scannedFormingData_Ref = useRef(''); 
	const formingBadReason_Ref = useRef(''); 
	const formingBadRemark_Ref = useRef(''); 

	//useState 따라가는 ref
	useEffect(() => {  scannedSkinData_Ref.current = scannedSkinData }, [scannedSkinData]);
	useEffect(() => {  skinBadReason_Ref.current = skinBadReason }, [skinBadReason]);
	useEffect(() => {  skinBadReasonRemark_Ref.current = skinBadReasonRemark }, [skinBadReasonRemark]);
	useEffect(() => {  scannedFormingData_Ref.current = scannedFormingData }, [scannedFormingData]);
	useEffect(() => {  formingBadReason_Ref.current = formingBadReason }, [formingBadReason]);
	useEffect(() => {  formingBadRemark_Ref.current = formingBadRemark }, [formingBadRemark]);
	
	
	// 네이티브 메시지 콜백 
	const onMessage = useCallback((event) => {
		nativeReadData(event); // WebView에서 받아온 데이터 읽기
	}, []); 
	

	/** 네이티브기준 값 전달 */
	const onClickForNative = (event) => {	
		if (document.getElementById(event.target.id)) {
			document.getElementById(event.target.id).value = ''; // 바코드 초기화
		}
		scanLocationRef.current = event.target.id; // 구분 기준 플래그 값 부여
	};
	
	useEffect(() => { 
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		// 바코드 시작 포커스 이동		
		if( selectedReturnType === 'skinReturn' && focuseSkinBarcode.current ){
			skinEventHandler.onFocuseBarcode();
		}
		if( selectedReturnType === 'formingReturn' && focuseFormingBarcode.current ){
			formingEventHandler.onFocuseBarcode();
		}		
		//네이티브 불러오기
		document.addEventListener('message', onMessage);
		return () => {
			document.removeEventListener('message', onMessage);
		}
	}, []);

	useEffect(() => {  // 페이지 선택시 바코드 초기화
		if(focuseSkinBarcode.current){
			focuseSkinBarcode.current.value = ''
			focuseSkinBarcode.current.focus(); 
		}
		if(focuseFormingBarcode.current){		
			focuseFormingBarcode.current.value = ''
			focuseFormingBarcode.current.focus(); 
		}			
	}, [selectedReturnType]);


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
				if (scanLocationRef.current === 'skinReturnBarcode') {
					skinEventHandler.onBarcodeReadSkin(scannedData.data);					
				}
				if (scanLocationRef.current === 'FormingReturnBarcode') {
					formingEventHandler.onBarcodeReadForming(scannedData.data);
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
		if(event.key === 'Enter' &&  scanLocationRef.current === 'skinReturnBarcode'){
			event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
			skinEventHandler.onBarcodeReadSkin(event.target.value)
			return
		}
		if (event.key === 'Enter' &&  scanLocationRef.current === 'FormingReturnBarcode') {
			event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
			formingEventHandler.onBarcodeReadForming(event.target.value)
			return
		}
	}  

	/** 스킨반품 이벤트  */
	const skinEventHandler = {

		/** 스킨반품 바코드 포커스 이동 */
		onFocuseBarcode : () => {
			scanLocationRef.current = 'skinReturnBarcode';
			if (focuseSkinBarcode.current){
				focuseSkinBarcode.current.value = ''
				focuseSkinBarcode.current.focus(); // 바코드 시작 포커스 이동
			}
		},

		/** 스킨반품 바코드 리딩 */
		onBarcodeReadSkin : (scannedBarcode) => {
			setOnLoading(true);
			if(!scannedBarcode) { 									
				setPopup('바코드 미입력','바코드를 입력해 주세요.');		
				document.getElementById('skinReturnBarcode').value = ''; //바코드 초기화
				if(focuseSkinBarcode){ focuseSkinBarcode.current.focus() }	
				setOnLoading(false);
				return;
			}	
			if( scannedBarcode.length !== 14) {	
				setPopup('바코드 오류', '바코드 길이가 잘못 되었습니다.');
				document.getElementById('skinReturnBarcode').value = ''; //바코드 초기화
				if(focuseSkinBarcode){ focuseSkinBarcode.current.focus() }	
				setOnLoading(false);
				return;
			}			
			(async () => {	
				try {
					const result = await UseFetchParam({
						api: "GENERAL",
						procedure:"PSP_L_SKIN_RETURN_BARCODE_RES", 
						parameter:[scannedBarcode], 
						EventType:"barcodeScan",
						EventName:"read barcode Skin return",
					});	
					setScannedSkinData({
						BARCODE: result[0].BARCODE,
						PART_NO: result[0].PART_NO,
						PROD_DATE: result[0].PROD_DATE,
					})
				} 
				catch (err) {
					setPopup('에러',`${err}`)
				} 
				finally {
					skinEventHandler.onFocuseBarcode()
					setOnLoading(false);
				}
			})();
		},

		/** 스킨 반품 등록 버튼 클릭, 진행 여부 확인 함  */
		 trySkinReturn : () => {
			if(!scannedSkinData.BARCODE){				
				setPopup('반품할 스킨 바코드를 입력하세요.');
				return;
			}
			if(!skinBadReason.selected){				
				setPopup('반품 사유 미선택','반품 사유를 선택하세요.');
				return;
			}
			if(skinBadReason.selected === '기타' && !skinBadReasonRemark ){ //직접입력 설정 해놓고 입력 값 없을 때				
				setPopup('반품 처리 미입력','반품 처리 사유를 입력하세요.');
				return;
			}
			setDecision({
				open: true,
				title: "스킨 반품 진행",
				text: `${scannedSkinData.BARCODE}를 반품하시겠습니까?`,
				okText: "스킨 반품",
				okEvent: skinEventHandler.onSkinReturn, //스킨반품 진행 함수 호출
				noText: "취소",				
				noEvent: null, //선택 팝업창 그냥 닫기
			});	
		},

		/** 스킨반품 진행 */
		onSkinReturn : () => {		
			setOnLoading(true);			
			(async () => {
				try {
					const result = await UseFetchParam({
						api: "GENERAL",
						procedure:"PSP_S_SKIN_RETURN_PROC", 
						parameter:	[
							scannedSkinData_Ref.current.BARCODE, 									
							skinBadReason_Ref.current.selected === '기타' ? skinBadReasonRemark_Ref.current  : skinBadReason_Ref.current.selected
						], 
						EventType:"save data",
						EventName:"save Skin return data",
						isVoidProcedure: true,
					});	
					setPopup('반품처리','스킨 반품처리 되었습니다.');
					
					//입력 정보 및 화면 초기화
					setScannedSkinData({BARCODE: "", PART_NO: "", PROD_DATE: "",})
					setSkinBadReason({...skinBadReason, selected: "" })
					setSkinBadReasonRemark("")
				}
				catch (err) {
					setPopup('에러',`[${err}]`);
				} 
				finally {
					skinEventHandler.onFocuseBarcode()
					setOnLoading(false);
				}
			})();
		},
	};

	/** 발포반품 이벤트 */
	const formingEventHandler = {		

		/** 스킨반품 바코드 포커스 이동 */
		onFocuseBarcode : () => {
			scanLocationRef.current = 'FormingReturnBarcode';
			if (focuseFormingBarcode.current){
				focuseFormingBarcode.current.value = ''
				focuseFormingBarcode.current.focus(); 
			}
		},

		/** 발포 바코드 리딩 */
		onBarcodeReadForming : (scannedBarcode) => {
			setOnLoading(true);
			if(!scannedBarcode) { 
				setPopup('바코드 미입력','바코드를 입력해주세요.');	
				formingEventHandler.onFocuseBarcode()
				setOnLoading(false);
				return;
			}		
			(async () => {			
				try {
					const result1 = await UseFetchParam({						
						procedure:"CSP_L_BARCODE_LOAD_CHANGE", 
						parameter:[scannedBarcode, ''], 
						EventType:"barcodeScan",
						EventName:"barcodeScan",						
					});	
					// 변환 바코드 조회 성공여부 
					if( !result1[0].Column1 ){ // 조회 값 없을 경우
						setPopup('바코드 오류','조회된 바코드가 없습니다.');
						return;
					}
					// 변환 바코드 길이 측정
					if( result1[0].Column1 < 23 ){ //23보다 짧을 경우
						setPopup('바코드 오류','바코드 길이가 잘못 되었습니다.');
						return;
					}
					// 천안 이관 검토
					if( result1[0].Column1[14] !== '5' ){ //14번째 문자가 5가 아닐 경우
						setPopup('바코드 오류','천안에서 이관된 제품이 아닙니다.');
						return;
					}
					const result2 = await UseFetchParam({
						api: "GENERAL",
						procedure:"PSP_L_BALPO_RETURN_BARCODE_RES",
						parameter: [result1[0].Column1 ], 
						EventType:"barcodeMapping",
						EventName:"barcodeMapping",
					});	
					// 화면에 값 저장
					setScannedFormingData({
						barcode: result2[0].barcode , 
						part_no: result2[0].part_no ,
						SCRAP: result2[0].SCRAP ,
						prod_date: result2[0].prod_date ,
					});
				} 
				catch (err) {	
					setPopup('에러',`${err}`);
				} 
				finally {				
					setOnLoading(false);
					formingEventHandler.onFocuseBarcode()
				}
			})();
		},	

		/** 발포 반품 등록 버튼 클릭 */
		tryFormingReturn : () => {		
			if(!scannedFormingData.BARCODE) {				
				setPopup('바코드 미입력',`반품할 발포 바코드를 입력하세요.`);
				return;
			}
			if(!formingBadReason.selected) {				
				setPopup('반품 사유 미선택',`반품 사유를 선택하세요.`);
				return;
			}
			if(formingBadReason.selected === '기타' && !formingBadRemark) {				
				setPopup('반품 처리 미입력',`반품처리사유를 입력하세요.`);
				return;
			}
			setDecision({
				open: true,
				title: "발포 반품 진행",
				text: `${scannedSkinData.BARCODE}를 반품하시겠습니까?`,
				okText: "발포 반품",
				okEvent: formingEventHandler.onFormingReturn,
				noText: "취소",
				noEvent: null, 				
			});	
		},

		/** 발포반품 진행 */
		onFormingReturn : () => {								
			setOnLoading(true);			
			(async () => {
				try {
					const result = await UseFetchParam({
						api: "GENERAL",
						procedure:"PSP_S_BALPO_RETURN_PROC", 
						parameter:	[
										scannedFormingData_Ref.current.BARCODE, 
										formingBadReason_Ref.current.selected === '기타' ? formingBadRemark_Ref.current : formingBadReason_Ref.current.selected , 
									], 
						EventType:"",
						EventName:"",
						isVoidProcedure: true,
					});
					setPopup('반품 처리',`발포 반품처리 되었습니다.`);
					
					//입력 정보 및 화면 초기화
					setScannedFormingData({	barcode: "", part_no: "", SCRAP: "", prod_date: "",})
					setFormingBadReason({...formingBadReason, selected: "" })
					setFormingBadRemark("")

					formingEventHandler.onFocuseBarcode()
				} 
				catch (err) {
					setPopup('에러',`[${err}]`);
				} 
				finally {
					setOnLoading(false);
				}
			})();
		}
	};	

	/** 스킨발품 & 발포반품 버튼 선택 컴포넌트 */
	const ReturnTypeSelectComponent = () => {
		const handleChange = (event) => {
			setSelectedReturnType(event.target.value);
		
		};		
		return(
			<FormControl fullWidth>							
				<Box display="flex" m={1} mb={2} gap={1}>
					<Button 
						fullWidth 
						value='skinReturn'
						onClick={handleChange}
						variant= {selectedReturnType === 'skinReturn' ?  "contained" : "outlined" }
					>
					스킨 반품
					</Button>
					<Button 
						fullWidth
						value='formingReturn'
						onClick={handleChange}
						variant= {selectedReturnType === 'formingReturn' ?  "contained" : "outlined" }
					>
					발포 반품
					</Button>
				</Box>				
			</FormControl>
		)
	}

    return (
    <Stack gap={2} m={1}>
        <ReturnTypeSelectComponent/> 
        {selectedReturnType === "skinReturn" && //스킨발포선택 탭 화면
		<>
			<CatBarcodeNative
				label={'바코드'}
				id={'skinReturnBarcode'}
				onClick={onClickForNative}
				onKeyDown={onKeydownForEvent}
				inputRef={focuseSkinBarcode}
			/>
			<CatTextFieldReadonly
				label={"입력된 바코드"} 
				value={scannedSkinData.BARCODE} 
			/>
			<CatTextFieldReadonly
				label={"품목"} 
				value={scannedSkinData.PART_NO}
			/>
			<CatTextFieldReadonly
				label={"생산일자"} 
				value={scannedSkinData.PROD_DATE}
			/>
			<CatSelect
				label="반품 사유"				
				value={skinBadReason.selected} 
				option={skinBadReason.options}
				onChange={(event) => {
					setSkinBadReason({
						...skinBadReason,
						selected: event.target.value
					})		
				}}
			/>			
			{skinBadReason.selected === "기타" && //기타는 반품사유 직접입력
			<CatTextField
				label={"반품 처리 시유"} 
				value={skinBadReasonRemark}
				onChange={(event) => {setSkinBadReasonRemark(event.target.value)}}
			/>
			}
			<CatButtonBigOne 
				buttonLabel='스킨 반품 등록' 
				onClick={skinEventHandler.trySkinReturn}
			/>
		</>
		}
		{selectedReturnType === "formingReturn" && //발포반품선택 탭 화면
		<>
			<CatBarcodeNative
				label={'바코드'}
				id={'FormingReturnBarcode'}
				onClick={onClickForNative}
				onKeyDown={onKeydownForEvent}
				inputRef={focuseFormingBarcode}
			/>
			<CatTextFieldReadonly
				label={"입력된 바코드"} 
				value={scannedFormingData.barcode} 
			/>		
			<CatTextFieldReadonly
				label={"품목"} 
				value={scannedFormingData.part_no} 
			/>		
			<CatTextFieldReadonly
				label={"생산일자"} 
				value={scannedFormingData.prod_date} 
			/>
			<CatSelect
				label="반품 사유"									
				value={formingBadReason.selected} 
				option={formingBadReason.options}
				onChange={(event) => {
					setFormingBadReason({
						...formingBadReason,
						selected: event.target.value
					})
				}}	
			/>			
			{formingBadReason.selected === "기타" && //기타는 반품사유 직접입력
			<CatTextField
				label={"반품처리"} 
				value={formingBadRemark}
				onChange={(event) => { setFormingBadRemark(event.target.value) }}
			/>
			}
			<CatButtonBigOne
				buttonLabel='발포 반품 등록' 
				onClick={formingEventHandler.tryFormingReturn}
			/>		
		</>
		}
    </Stack>
    )
}