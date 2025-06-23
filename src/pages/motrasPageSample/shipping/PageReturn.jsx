import { useEffect, useState, useRef, useCallback, } from "react";//리액트
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import {
	Stack, TextField, Typography, IconButton, FormControlLabel, Checkbox,
	TableContainer, Table, TableBody, TableRow, TableCell, Paper, InputAdornment,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatSelect from '../../components/CatSelect'
import CatTextField from '../../components/CatTextField'
import getDateTimeFormat  from "../../functions/getDateTimeFormat";
/*******************************************************************************************
@verison     
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
1.00		2024-12-26	sj_hong				프로그램 배포
1.01		2025-05-14	sj_hong				vite+SWC 업데이트
1.02        2025-05-29  sj_hong             바코드 수동 입력 추가, Ref중심으로 변수 개편
1.03        2025-06-17  sj_hong             바코드 읽기 함수의 프로시저 수정
*******************************************************************************************/
/*******************************************************************************************	
@Page PageReturn.jsx
@Role Motras PDA > 출하 메뉴 > 반입 페이지
@description 이전 명칭 frmReturn.cs
*******************************************************************************************/
export default function PageReturn() {

	const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
		isUseManualInputContext,
	} = useRootContext();    

	////페이지의 보여줄 상태 플래그 값
	const [pageFlag, setPageFlag] = useState('INPUT_BARCODE'); // INPUT_BARCODE : 바코드 입력 페이지 INPUT_DETAIL : 반입 처리 페이지
	const [isFailBaseDataReady , setIsFailBaseDataReady] = useState(false);

	const barcodeInputRef = useRef(null);
	const barcodeValueRef = useRef('');
	const returnTypeFlagRef = useRef('');//반입(0) 혹은 폐기(1) 플래그, 초기값공백으로 설정

	const tableMetaData = [
		{ key: 'BARCODE', label: '바코드' },
		{ key: 'CAR', label: '차종' },
		{ key: 'LRHD', label: '좌우핸들(L/R)' },
		{ key: 'ALC', label: '엑셀' },
		{ key: 'AIR_BAG', label: '에어백' },
		{ key: 'COLOR', label: '색상' },
		{ key: 'PROD_DATE', label: '생산일자' },
		{ key: 'SHIP_DATE', label: '출하일자' },
		{ key: 'SPOT', label: '적재위치' },
	];
	const [values, setValues] = useState(() =>
		Object.fromEntries(tableMetaData.map(item => [item.key, '']))
	);
	const updateTableValues = (newValues) => {
		setValues(prev => ({ ...prev, ...newValues }));
	};

	const [badListDataGridRows, setBadListDataGridRows] = useState([]);//불량리스트선택표
	const selectedDataGridBadValueRef = useRef('')//불량분류표에서 선택한 값

	//전송 입력 데이터 저장 (페이지 로딩 시 처음만 불러옴)
	const [optionState, setOptionState] = useState({        
		deliverySpot: [],//납품처
		liableSpot: [],//귀책선
		badReason: [],//불량사유
		badPoint: [],//불량부위
	});
	
	//납품사업장_정보_선택
	const [deliverySpot, SetDeliverySpot] = useState('');
	const deliverySpotCopyValueRef = useRef('');
	useEffect(() => { deliverySpotCopyValueRef.current = deliverySpot }, [deliverySpot]);

	const [isUseLiableSpot, setIsUseLiableSpot] = useState(false);//귀책처_사용_여부

	//귀책처_선택    
	const [liableSpot, setLiableSpot] = useState(''); //귀책처 값 저장
	const liableSpotCopyValueRef = useRef('');
	useEffect(() => { liableSpotCopyValueRef.current = liableSpot }, [liableSpot]);
	
	//불량부위_선택
	const [badPoint, setBadPoint] = useState('');
	const badPointCopyValueRef = useRef('');
	useEffect(() => { badPointCopyValueRef.current = badPoint }, [badPoint]);

	//불량사유_선택
	const [badReason, setBadReason] = useState("");
	const badReasonCopyValueRef = useRef('');
	useEffect(() => { badReasonCopyValueRef.current = badReason }, [badReason]);

	const onMessage = useCallback((event) => {
		nativeReadData(event); // WebView에서 받아온 데이터 읽기
	}, []); 

	useEffect(() => {
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		//페이지_기본정보_불러오기
		(async () => {
			try {            
				//납품사업장 정보 불러오기
				const spotFetchResult = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user", 
					parameter:["SPOT", ""], 
					EventType:"code load",
					EventName:"SPOT Code search",
				});
				if(!spotFetchResult){
					setPopup('데이터 불러오기 오류', `납품사업장 정보를 가져오지 못 했습니다.`);
					setIsFailBaseDataReady(true);
					return;
				}                
				//귀책선 정보 가져오기
				const prodDeptFetchResult = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user", 
					parameter:["PROD_DEPT"], 
					EventType:"code load",
					EventName:"PROD_DEPT Code search",
				});
				if(!prodDeptFetchResult){
					setPopup('데이터 불러오기 오류', `귀책선 정보를 가져오지 못 했습니다.`);
					setIsFailBaseDataReady(true);
					return;
				}               
				//불량부위 정보 가져오기
				const badPointFetchResult = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user", 
					parameter:["ERR_POINT"], 
					EventType:"code load",
					EventName:"ERR_POINT Code search",
				});
				if(!badPointFetchResult){
					setPopup('데이터 불러오기 오류', `불량부위 정보를 가져오지 못 했습니다.`);
					setIsFailBaseDataReady(true);
					return;
				}
				//전체 불러오기 성공, 페이지에 저장
				setOptionState({
					deliverySpot: spotFetchResult.map(row => ({
						value: row["업체코드"],
						label: row["업체명"].trim(),
					})),
					liableSpot: prodDeptFetchResult.map(row => ({
						value: row["PROD_CODE"],
						label: row["PROD_NAME"],
					})),
					badReason: [
						{ value: "작업자 불량", label: "작업"},
						{ value: "설비불량", label: "설비"},
						{ value: "자재불량", label: "자재"},
						{ value: "운반불량", label: "운반"},
					],
					badPoint: badPointFetchResult.map(row => ({
						value: row["부위코드"].trim(),
						label: row["부위명"].trim(),
					})),
				})
			} 
			catch (err) {
				setPopup('에러', '초기 데이터를 가져오지 못 했습니다.');
				setIsFailBaseDataReady(true);
			}
		})();
		//포커스 이동
		onMoveFocusToBarcode();
		//네이티브 불러오기
		document.addEventListener('message', onMessage);
		return () => {
			document.removeEventListener('message', onMessage);
		}		
	}, []);

	/** 불량 사유 선택 시 불량코드 리스트 가져오기 */
	useEffect(() => {
		if(!badReason){ // 선택된 대분류 불량사유 없으면 불량리스트 안 불러옴.
			return;
		}
		setOnLoading(true);
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"PSP_L_BAD_LIST", 
					parameter:[badReason], 
				});	
				const resultAfterTrim = result.map(item => {
					return {
						...item,
						불량코드: item["@@불량코드"].trim(),
						대분류: item.대분류.trim(),
						중분류: item.중분류.trim(),
						소분류: item.소분류.trim(),
					};
				})
				setBadListDataGridRows(resultAfterTrim);//불량리스트 표 갱신
				selectedDataGridBadValueRef.current = '';//불량표 선택값 초기화
			} 
			catch (err) {
				setPopup(`[${err}]`);
			} 
			finally {
				setOnLoading(false);
			}
		})();
	}, [badReason]); 

	// 네이티브 에서 보낸 데이터 읽기
	const nativeReadData = (e) => {
		const type = JSON.parse(e.data).type;
		if (type === 'SCANDATA') {
			const { scannedData, scannedLabelType, type } = JSON.parse(e.data); 
			try{
				setOnLoading(true);				
				//바코드 페이지면 바코드 스캔
				if(pageFlag === 'INPUT_BARCODE' && !isUseManualInputContext ){
					onBarcodeScan(scannedData.data);
				}
				//바코드 페이지 벗어난 입력창이 었다면 바코드 창을 되돌아가서 입력
				else if(pageFlag === 'INPUT_DETAIL' && !isUseManualInputContext){
					onPageReset();
					onBarcodeScan(scannedData.data);
				}
			}
			finally{
				setOnLoading(false);
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

	/** 바코드 읽기 포커스 이동 */
	const onMoveFocusToBarcode = () => {
		try{
			if(barcodeInputRef.current){
				barcodeInputRef.current.focus();
			}
		}
		catch(error){
			setPopup('바코드 포커싱 에러', `${error}`)
		}
	}

	/** 바코드 입력값, 저장값, 내부 상세정보 전부 초기화 */
	const onResetBarcodeData = () => {
		try{            
			//바코드 초기화
			barcodeValueRef.current = '';//바코드실제값저장
			if(barcodeInputRef.current){
				barcodeInputRef.current.value = '';//텍스트필드초기화    
			}
			//바코드 정보값 초기화
			updateTableValues({
				BARCODE: '',
				CAR: '',
				LRHD: '',
				ALC: '',
				AIR_BAG: '',
				COLOR: '',
				PROD_DATE: '',
				SHIP_DATE: '',
				SPOT: '',
			});
		}
		catch(err){
			setPopup('에러','바코드 정보 초기화 실패')
		}
	}

	/** 반입페이지 바코드 스캔 리딩 (구버전txtBarcode_KeyPress)*/
	const onBarcodeScan = async (scannedBarcode) => {
		const errorDialogTitle = '바코드 스캔 에러';
		try{
			setOnLoading(true);
			if(!scannedBarcode){
				setPopup(errorDialogTitle,`바코드가 입력되지 않았습니다..`);
				onResetBarcodeData();
				onMoveFocusToBarcode();
				return
			}
			if(scannedBarcode.trim().length < 23){
				setPopup(errorDialogTitle,`바코드 길이가 잘못 되었습니다.`);
				onResetBarcodeData();
				onMoveFocusToBarcode();
				return
			}
			//바코드매핑조회
			const barcodeMappingResult = await useFetch({
				procedure:"PDA_SHIPPING_RETURN_BARCODE_MAPPING_CHANGE_L",//(2024년 이전 프로시저 CSP_L_BARCODE_LOAD_CHANGE)
				parameter:[scannedBarcode], 
				EventType:"barcode Scan",
				EventName:"barcode mapping Scan",
			});
			//변경된바코드로검사및조회
			const barcodeScanResult = await useFetch({
				procedure:"PSP_L_RETURN_BARCODE_RES",
				parameter:[barcodeMappingResult[0][0].MappingBarcode],
				EventType:"data load",
				EventName:"return target data load",
			});
			if(!barcodeScanResult){
				setPopup(errorDialogTitle, `조회 대상 바코드가 없습니다.`);
				onResetBarcodeData();
				onMoveFocusToBarcode();
				return
			}
			//바코드_저장
			if(barcodeInputRef.current){
				barcodeInputRef.current.value = '';//텍스트필드초기화 
			}
			barcodeValueRef.current = barcodeMappingResult[0][0].MappingBarcode;//바코드실제값저장
			//반입_대상_정보갱신
			updateTableValues({
				BARCODE: barcodeScanResult[0][0].바코드
				,CAR: barcodeScanResult[0][0].차종
				,LRHD: barcodeScanResult[0][0].LRHD
				,ALC: barcodeScanResult[0][0].ALC
				,AIR_BAG: barcodeScanResult[0][0].AIR_BAG
				,COLOR: barcodeScanResult[0][0].COLOR
				,PROD_DATE: barcodeScanResult[0][0].생산일자
				,SHIP_DATE: barcodeScanResult[0][0].출하일자
				,SPOT: barcodeScanResult[0][0].출하처
			});
		}
		catch(error){
			setPopup('바코드 스캔 에러', `${error}`)
			onResetBarcodeData();
			onMoveFocusToBarcode();
		}
		finally{
			setOnLoading(false);
		}
	}

	/** 반입 정보 저장 */
	const onSaveReturnData = async () => {
		try{
			setOnLoading(true);                                
			if( !deliverySpot ){
				setPopup('사업장 미선택','선택된 납품사업장이 없습니다. ');
				return;
			}
			if( isUseLiableSpot === true && !isUseLiableSpot ){ //귀책선 입력한다고 해놓고 입력 안 했을때
				setPopup('귀책선 미선택','귀책선 사용을 체크했지만 선택된 귀책선이 없습니다.');
				return;
			}		
			if( !badReason ){
				setPopup('불량사유 미선택','선택된 불량 사유가 없습니다.');
				return;
			}	
			if( !selectedDataGridBadValueRef.current ){
				setPopup('불량분류 미선택','표에서 선택된 불량분류가 없습니다.');
				return;
			}
			if( !badPoint ){
				setPopup('불량부위 미선택','선택된 불량부위가 없습니다.');
				return;
			}
			if( returnTypeFlagRef.current !== '0' && returnTypeFlagRef.current !== '1' ){
				setPopup('처리 여부 미선택','반입 및 폐기 처리 여부가 선택되지 않았습니다.');
				return;
			}
			const returnFetchResult = await useFetch({
				procedure:"PDA_RETURN_PROC_S",//(기존프로시저 [PSP_S_RETURN_PROC])
				parameter:	[
					barcodeValueRef.current, //바코드//@P_BARCODE
					deliverySpotCopyValueRef.current, //선택된 납품사업장//@P_SPOT
					isUseLiableSpot ? liableSpotCopyValueRef.current : '',//귀책선//@P_PROD
					selectedDataGridBadValueRef.current,//불량코드_선택값//@P_BAD_CODE
					badPointCopyValueRef.current,//불량부위//@P_BAD_POINT
					returnTypeFlagRef.current, //반입, 폐기 여부 (0이면 반입, 1이면 폐기)//@P_IS_SCRAP
				],
			})
			//결과 저장 후,출력
			const returnResultFalg = returnFetchResult[0][0].RETURN_RESULT//프로시저 결과 플래그 반환
			if(returnResultFalg === 'RETURN'){
				setPopup('반입 성공',`[${barcodeValueRef.current}] 반입처리 되었습니다.`);
			}
			else if(returnResultFalg === 'SCRAP'){
				setPopup('폐기 성공',`[${barcodeValueRef.current}] 폐기처리 되었습니다.`);
			}
			else if(returnResultFalg !== 'RETURN' && returnResultFalg !== 'SCRAP' ){
				setPopup('에러',`[${barcodeValueRef.current}] 처리 여부가 불분명합니다.`);
			}
			//공통 사항, 페이지 초기화
			setPageFlag('INPUT_BARCODE');
			onPageReset();//입력값 전체 초기화
		}
		catch(err){
			setPopup(`${returnTypeFlagRef.current === '1' ?'폐기':'반입'}  처리 에러`, `${err}`)
		}
		finally{
			setOnLoading(false);
		}
	}

	/** 페이지 초기화 */
	const onPageReset = () => {
		setPageFlag('INPUT_BARCODE');
		setIsFailBaseDataReady(false);
		returnTypeFlagRef.current = '';        
		barcodeValueRef.current = '';        
		SetDeliverySpot('');
		setIsUseLiableSpot(false);
		setLiableSpot('');
		setBadPoint('');
		setBadReason('');
		onResetBarcodeData();
		onMoveFocusToBarcode();
	}
	
	return (
	<Stack gap={1} m={1} >
	{/* ===== 반입 바코드 입력 페이지 ===== */}
	{pageFlag === 'INPUT_BARCODE' &&
	<>
		<TextField
			label={'바코드'}
			inputRef={barcodeInputRef}
			size="small"
			autoFocus
			autoComplete={'Off'}
			InputProps={{
				readOnly: !isUseManualInputContext ? true : false,
				endAdornment: (
					<InputAdornment position="end">
						<IconButton
							aria-label="clear input"
							onClick={() => {
								if(barcodeInputRef.current){
									barcodeInputRef.current.value = '';
									barcodeInputRef.current.focus();
								}
							}}
							edge="end"
						>
							<ClearIcon />
						</IconButton>
					</InputAdornment>
				),
			}}
			inputProps={{ enterKeyHint: 'done' }}
			 InputLabelProps={{ shrink: true }}
			onKeyDown={(event) => {
				//수동입력기능 켜져야 동작
				if(event.key === 'Enter' && isUseManualInputContext){
					onBarcodeScan(event.target.value);
				}
			}}
		/>
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 400 }}>
				<TableBody>
				{tableMetaData.map((item) => (
					<TableRow key={item.key} >
						{/* 첫번째열 (속성) */}
						<TableCell
							component="th"
							scope="row"
							sx={{
								width: '30%',
								fontWeight: 'bold',
								border: '1px solid #e0e0e0',
								padding: '12px 12px',
							}}
						>
							{item.label}
						</TableCell>
						{/* 두번째열 (값)*/}
						<TableCell
							sx={{
								width: '70%',
								border: '1px solid #e0e0e0',
								padding: '12px 12px',
								}}
						>
							{values[item.key]}
						</TableCell>
					</TableRow>
				))}
				</TableBody>
			</Table>
		</TableContainer>
		{/* 초기 데이터 불러와져야 버튼 생성 */}       
		{ isFailBaseDataReady ? 
		( // 데이터 불러오기 실패 처리 시, 진행할 버튼 숨기기
			<Typography align="center">페이지 기본 정보 불러오기 실패</Typography>
		)
		:
		( // 일반 (로딩중 && 기초 페이지 데이터 있는 경우)
		<>
			<CatButtonBigOne
				buttonLabel={"수정"}
				onClick={() => {
					if(!barcodeValueRef.current){
						setPopup(`반입 대상 없음`, `입력된 바코드가 없습니다.`)
						return
					}
					returnTypeFlagRef.current='0';//반입(0) 혹은 폐기(1) 플래그, 초기값공백으로 설정
					setPageFlag('INPUT_DETAIL');
				}}
			/>
			<CatButtonBigOne
				buttonLabel={"폐기"}
				onClick={() => {
					 if(!barcodeValueRef.current){
						setPopup(`반입 대상 없음`, `입력된 바코드가 없습니다.`)
						return
					}
					returnTypeFlagRef.current='1';//반입(0) 혹은 폐기(1) 플래그, 초기값공백으로 설정
					setPageFlag('INPUT_DETAIL');
				}}
			/>
		</>
		)} 
	</>
	}
	{/* ===== 반입 상세 정보 입력 페이지 ===== */}
	{pageFlag === 'INPUT_DETAIL' &&
	<>        
		<CatSelect
			label="납품사업장"
			value={deliverySpot}
			option={optionState.deliverySpot}
			onChange={(e) => {SetDeliverySpot(e.target.value)}}
		/>
		<Stack direction="row">
			<FormControlLabel
				control={
				<Checkbox
					checked={isUseLiableSpot}
					value="input"
					size="large"
					onChange={() =>{setIsUseLiableSpot(!isUseLiableSpot)}}
				/>
				}
				label={ isUseLiableSpot ? "" : "귀책선 사용 여부"}
			/>	            
			{isUseLiableSpot &&
			<Stack sx={{ flexGrow: 1 }}>
				<CatSelect
					label="귀책선"
					option={optionState.liableSpot}
					value={liableSpot}
					onChange={(e) => {setLiableSpot(e.target.value)}}
				/>
			</Stack>
			}
		</Stack>
		<CatSelect
			label="불량사유"
			value={badReason}
			option={[
				{ value: "작업자 불량", label: "작업"},
				{ value: "설비불량", label: "설비"},
				{ value: "자재불량", label: "자재"},
				{ value: "운반불량", label: "운반"},
			]}
			onChange={(e) => {  
				setBadReason(e.target.value);
			}}
		/>
		<CatDataGrid
			col={[
				//{ field: '불량코드', 	headerName: '불량코드', width: 90, hide: true },
				{ field: '대분류', headerName: '대분류', width: 100, },
				{ field: '중분류', headerName: '중분류', width: 100, },
				{ field: '소분류', headerName: '소분류', width: 170, },
			]}
			row={badListDataGridRows}
			onRowClick={(params)=> {  
				selectedDataGridBadValueRef.current = params.row.불량코드;
			}}
		/>
		<CatSelect
			label="불량부위"            
			value={badPoint}
			option={optionState.badPoint}
			onChange={(e) => {setBadPoint(e.target.value)}}
		/>
		 <CatButtonBigOne
			buttonLabel={"전송"}
			onClick={onSaveReturnData}
		/>
		<CatButtonBigOne
			buttonLabel={"취소"}
			onClick={() => {setPageFlag('INPUT_BARCODE')}}
		/>
	</>
	}
	</Stack>
	)
}