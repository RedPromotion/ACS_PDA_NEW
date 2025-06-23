import { React, useEffect, useState, useRef, useCallback, } from "react";//리액트
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
1.02		2025-05-23	sj_hong				DataGrid 역순(최신우선) 으로 변경
*******************************************************************************************/
/*******************************************************************************************	
@Page PageTransferForming.jsx
@Role Motras PDA > 출하 메뉴 > 발포 이관 페이지
@description 이전 명칭 : FrmTransBalpo.cs , [EAI].[dbo].[IRTSKIN] 테이블 조회 및 저장 함. (천안공장)
*******************************************************************************************/
export default function PageTransferForming() {

    const { setPopup, setOnLoading, setDecision, isTopBarVisible, setIsTopBarVisible, } = useRootContext();

    const scanLocationRef = useRef('transferFormingBarcode'); //네이티브에서 기준삼을 스캔 위치 플래그 값 (매개변수에 처음 지정위치 포함)

	const [barcode, setBarcode] = useState('');//바코드
	const focuseBarcode = useRef(null);//팔레트 텍스트필드 포커스 기준	

	const [gridFoamingTransfer, setGridFoamingTransfer] = useState({ //이관 팔레트 내용 데이터그리드
		columns : [			
			{ field: 'barcode', headerName: '바코드', width: 100 }, 
			{ field: 'Column1', headerName: '바코드2', width: 100 },
			{ field: 'PLT_NO', headerName: '팔레트 번호', width: 100 },
			{ field: 'skin_barcode', headerName: '스킨 바코드', width: 100 },
			{ field: '발포시간', headerName: '발포시간', width: 100 },	// 프로시저 컬럼명이 발포시간임
		],
		rows : [],		
	});

	const [count, setCount] = useState(0); //조회된 카운트	

	// 셋함수 연동
	const barcode_Ref = useRef(''); 
	const gridFoamingTransfer_Ref = useRef(''); 
	const count_Ref = useRef(0); 
	useEffect(() => {  barcode_Ref.current = barcode }, [barcode]);
	useEffect(() => {  gridFoamingTransfer_Ref.current = gridFoamingTransfer }, [gridFoamingTransfer]);
	useEffect(() => {  count_Ref.current = count }, [count]);

	// 네이티브 메시지 콜백 
	const onMessage = useCallback((event) => {
		nativeReadData(event); // WebView에서 받아온 데이터 읽기
	}, []); 

	useEffect(() => { 
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		onFocuseBarcode();
		//네이티브 불러오기
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
		if (type === 'SCANDATA') {			
			const { scannedData, scannedLabelType, type } = JSON.parse(e.data); 
			try{
				if (scanLocationRef.current === 'transferFormingBarcode') {
					onReadBarcode(scannedData.data);					
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
		scanLocationRef.current = 'transferFormingBarcode';
		if (focuseBarcode.current){
			focuseBarcode.current.value = ''
			focuseBarcode.current.focus(); // 바코드 시작 포커스 이동
			
		}
	}

	/** 텍스트필드 엔터키 동작  */
    const onKeydownForEvent = (event) => {
        if(event.key !== 'Enter'){
            return
        }
        if(event.key === 'Enter' &&  scanLocationRef.current === 'transferFormingBarcode'){
            event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
            onReadBarcode(event.target.value);
            return
        }
    } 

	/** 바코드 입력 */
	const onReadBarcode = (scannedBarcode)=> {		
		setOnLoading(true);
		if( !scannedBarcode ){
			setPopup(`바코드 오류`, `바코드를 입력해 주세요.`);
			onFocuseBarcode()
			setOnLoading(false);
			return;
		}
		(async () => {
			try {				
				const result = await UseFetchParam({
					procedure:"PSP_L_BALPO_TRANSFER", //천안공장 테이블 발포 조회
					parameter:[ scannedBarcode ], 
					EventType:"barcode read",
					EventName:"search forming Transfer data",
					isSelectMultiple:true, //0번 배열은 조회 결과 값, 1번 배열은 count조회 수
				});					

				if( result[0].length === 0 || !result ){ 					
					throw new Error(`조회된 발포이관 대상의 결과가 없습니다.`);			
				}
				if ( ! scannedBarcode === result[0][0].PLT_NO  ) {
					throw new Error(`조회된 발포이관 대상의 정보가 상이합니다.  [${scannedBarcode} : ${result[0][0].PLT_NO}]`);
				}

				setBarcode(scannedBarcode);
			
				///0번 배열, 조회값
				setGridFoamingTransfer({
					...gridFoamingTransfer_Ref.current,
					rows: result[0].map(data => ({
						barcode: data['barcode'],
						Column1: data['Column1'],
						PLT_NO: data['PLT_NO'],
						skin_barcode: data['skin_barcode'],
						발포시간: data['발포시간'],
					}))
				});
			
				//1번 배열, 조회된 결과 수
				setCount(result[1].CNT);	
			} 
			catch (err) {
				setPopup('스캔 에러', `${err}`);
				setGridFoamingTransfer({
					...gridFoamingTransfer_Ref.current,
					rows: []
				});
			} 
			finally {
				setOnLoading(false);
			}
		})();
	}

	/** 이관 버튼, 목록에 저장된 바코드 리스트 저장 */
	const onTransferForming = ()=> {

		/** (내부함수) 발포이관 확정 버튼 클릭 이벤트 (실제 저장 진행) */
		const confirmSave = () => {
			//발포이관 저장 진행
			setOnLoading(true);	
			(async () => {
				try {
					const result = await UseFetchParam({
						procedure:'PSP_S_BALPO_TRANSFER', 
						parameter:[barcode_Ref.current],
						EventType:"save data",
						EventName:"save forming transfer data",
					});	
					setPopup('입고', `입고처리 되었습니다.`);
					onReset(); // 초기화 함수 호출
				} 
				catch (err) {
					setPopup(`이관 실패`, `${err}`);
				}
				finally {
					setOnLoading(false);
				}
			})();
		}

		// ##### 실제 함수 시작점  #####
		if(!isNaN(count_Ref.current)){ // 만약 카운트가 숫자가 아닐 경우,
			setCount(Number(count_Ref.current)); // 숫자로 변경하여 비교
		}		
		if( !count_Ref.current === 0 && barcode_Ref.current === ''){ //미입력 예외처리, 입력도 없는데 찍은 바코드도 없음
			setPopup(`이관할 바코드를 입력해주세요.`);
			onFocuseBarcode()
			return;
		}

		if( count_Ref.current === 0 ){ //미입력, 대상없을 경우 에외처리
			setPopup(`입고할 반제품(천안)이 없습니다.`);
			onFocuseBarcode()
			return;
		}
		if(count_Ref.current !== gridFoamingTransfer_Ref.current.rows.length){// 갯수 불일치 예외 처리 
			setDecision({
				open: true,
				title: "추가 갯수 오류",
				text: "실제 갯수와 추가된 갯수가 일치하지 않습니다. 다시 입력하시겠습니까?",
				okText: "예", // 다시 입력
				noText: "아니요", // 저장 취소
				okEvent: () => { onReset() },
				noEvent: () => { return },
			})
		}
		else if(count_Ref.current === gridFoamingTransfer_Ref.current.rows.length){ // 갯수 일치, 바로 저장여부 묻고 진행
			setDecision({
				open: true,
				title: "확인",
				text: "저장하시겠습니까",
				okText: "Yes",
				noText: "No",
				okEvent: confirmSave, // 저장 진행
				noEvent: ()=> { return }, // 저장 절차 취소
			})
		}
	}

	/** 초기화 버튼, 화면 내용 초기화 */
	const onReset = ()=> {		
		setBarcode('')
		setGridFoamingTransfer({
			...gridFoamingTransfer_Ref.current,
			rows: [],
		})
		setCount(0)
		onFocuseBarcode()
	}

    return (
    <Stack gap={1} m={1}>
        <CatBarcodeNative
            label={'바코드'}
            id={'transferFormingBarcode'}
            onClick={onClickForNative}
            onKeyDown={onKeydownForEvent}
            inputRef={focuseBarcode}
        />
       <Typography> 
            바코드 : {barcode} 
        </Typography>
        <CatDataGrid 
            row={[...gridFoamingTransfer.rows].reverse()} 
            col={gridFoamingTransfer.columns}
        />
        <Typography sx={{ display: 'flex', justifyContent: 'center' }}>
            COUNT : {count}
        </Typography>
        <CatButtonBigOne 
            buttonLabel='이관'
            onClick={onTransferForming} 
        /> 
        <CatButtonBigOne 
            buttonLabel='초기화' 
            onClick={onReset}
        /> 
    </Stack>
    )
}