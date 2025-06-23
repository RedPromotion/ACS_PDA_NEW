import {useEffect, useState, useRef, useCallback, } from "react";//리액트
import { useRootContext } from '../../context/RootContext'
import UseFetchParam from '../../api/UseFetchParam'
import useFetch from '../../api/useFetch'
import useFetchDateTime from '../../api/useFetchDateTime'
import { Stack } from '@mui/material';
import CatTextField from '../../components/CatTextField'
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatSelect from '../../components/CatSelect'
import CatBarcodeNative from '../../components/CatBarcodeNative'
/*******************************************************************************************
@버전   
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
1.00		2024-12-26	sj_hong				프로그램 배포
1.01		2025-01-03	sj_hong				주석 수정
1.02		2025-05-14	sj_hong				vite+SWC 업데이트
1.03		2025-05-23	sj_hong				DataGrid 역순(최신우선) 으로 변경
1.04		2025-05-27	sj_hong				프로미스올 전체성공 혹은 전체실패로 처리함
1.05		2025-06-04	sj_hong				출하 등록 후, 페이지 초기화 시도를 분리함
*******************************************************************************************/
/*******************************************************************************************
@기록
(2024.12.12.sj_Hong & 모트라스 김태화 매니저님) 
직송차량 입력은 단순 확인 용이며, 
MES웹에서 관리자가 상세정보를 입력하기 때문에 
PDA에서 출하 시 운전기사, 운전비용, 차량코드 등에 대해 미입력 예외처리 할 필요가 없음
PDA에서 출하 관련 정보 미입력시, 처리를 막는게 아닌 0으로 입력함.
*******************************************************************************************/
/*******************************************************************************************	
@Page PageShipment.jsx
@Role Motras PDA > 출하 메뉴 > 출하 페이지
@description 이전 명칭 FrmChulha , 입고는 바로 등록됨, 출하는 상세 정보 입력을 또 해줘야함 .
*******************************************************************************************/
export default function PageShipment() {

	const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
	} = useRootContext();

	const scanLocationRef = useRef('outputBarcode'); //네이티브에서 기준삼을 스캔 위치 플래그 값  (매개변수에 처음 지정위치 포함)
	const focuseBarcode = useRef(null);//팔레트 바코드 텍스트필드 포커스 기준
	
	/* -----------------------------------------------------*/
	 // 페이지 플래그 값 리스트 //  
	 const [pageFlag, setPageFlag] = useState('isInputBarcode');
	/* --------------------------------------------------------
	 * isInputBarcode 		출하 바코드 입력화면 (시작화면)
	 * isShipment 			등록 입력창 
	 * isShipmentDetail 	상세등록 입력창
	 * -----------------------------------------------------*/ 

	//출고 화면 팔레트 데이터그리드 값
	const [gridOutputPallet, setGridOutputPallet] = useState({
		rows : [],
		selected: {
            type: 'include',
            ids: new Set(),
        },
	});

	//선택성 정보들 (출하)
	const [shipmentSpot, setShipmentSpot] = useState({selected: "", options: []});//출하처 셀렉트
	const [deliveryTransport, setDeliveryTransport] = useState({selected: "", options: []});//직송차량 셀렉트
	const [textTransport, setTextTransport] = useState('')//직송차량 수동입력 텍스트박스
	const [textDriver, setTextDriver] = useState('')//운전기사 수동입력 텍스트박스
	const [textCost, setTextCost] = useState('')//단가수동입력	텍스트박스

	// 셋함수 연동 저장	
	const pageFlag_ref = useRef(''); 
	useEffect(() => {  pageFlag_ref.current = pageFlag }, [pageFlag]);
	const gridOutputPallet_ref = useRef(''); 
	useEffect(() => {  gridOutputPallet_ref.current = gridOutputPallet }, [gridOutputPallet]);
	const shipmentSpot_ref = useRef(''); 
	useEffect(() => {  shipmentSpot_ref.current = shipmentSpot }, [shipmentSpot]);
	const deliveryTransport_ref = useRef(''); 
	useEffect(() => {  deliveryTransport_ref.current = deliveryTransport }, [deliveryTransport]);
	const textTransport_ref = useRef(''); 
	useEffect(() => {  textTransport_ref.current = textTransport }, [textTransport]);
	const textDriver_ref = useRef(''); 
	useEffect(() => {  textDriver_ref.current = textDriver }, [textDriver]);
	const textCost_ref = useRef(''); 
	useEffect(() => {  textCost_ref.current = textCost }, [textCost]);
	
	// 네이티브 메시지 콜백 
	const onMessage = useCallback((event) => {
		nativeReadData(event); // WebView에서 받아온 데이터 읽기
	}, []); 

	//기본 정보 불러오기
	useEffect(() => { 
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		//출하처 업체 정보 가져오기
		(async () => {
			setOnLoading(true);	
			try {
				const result = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user",//코드 기준 검색 프로시저
					parameter:["SPOT", ''],  // 출하처 조회
					EventType:"load code",
					EventName:"SPOT_code",
				});							
				setShipmentSpot({
					...shipmentSpot,
					options: result.map(data => ({
						value: data['업체코드'],
						label: data['업체명'],
					})),					
					selected: result[0].업체코드 //불러온 옵션 들 중 첫번째 값 부여
				})
			} 
			catch (err) {
				setPopup(`출하처 정보를 가져오지 못 했습니다. ${err}`);
			} 
			finally {
				setOnLoading(false);
			}
		})();
		
		//네이티브 불러오기
		document.addEventListener('message', onMessage);
		return () => {
			document.removeEventListener('message', onMessage);
		}
	}, []);

	useEffect(() => {
		if(pageFlag === 'isInputBarcode'){ //출하페이지 바코드 입력 이면 포커스
			onFocuseBarcode();
		}	
	}, [pageFlag]);	

	//선택된 출하처에 맞는 차량 정보 가져오기
	useEffect(() => {
		//출하처 미 선택 시 작동 안하기
		if( !shipmentSpot.selected ){
			return;
		}
		setOnLoading(true);
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user",//코드 기준 검색 프로시저, 
					parameter:[
						"TRUC" // 출하처 별 할당된 차량 정보 호출
					 	,
						`TRUCK_CODE IN 
						(SELECT TRUCK_CODE 
						 FROM M_TCST(nolock)
						 WHERE SPOT_CODE = ${shipmentSpot.selected})`
					], 
					EventType:"load code",
					EventName:"TRUC search",
				});
				setDeliveryTransport({
					...deliveryTransport,
					selected: "",
					options: result.map(data => ({
						value: data['트럭코드'],
						label: data['트럭번호'],
					}))
				})
			} 
			catch (err) {
				setPopup(`차량정보를 가져오지 못 했습니다. ${err}`)
			} 
			finally {
				setOnLoading(false);
			}
		})();
	}, [shipmentSpot.selected]);

	// 네이티브 에서 보낸 데이터 읽기
	const nativeReadData = (e) => {
		const type = JSON.parse(e.data).type;     
		if (type === 'SCANDATA') {			
			const { scannedData, scannedLabelType, type } = JSON.parse(e.data); 
			if (scanLocationRef.current === 'outputBarcode') { // 출하바코드 플래그
				onOutputReadPalletBarcode(scannedData.data);					
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

	/** 네이티브가 판단할 수 있는 텍스트필드 기준 값 전달 */
	const onClickForNative = (event) => {	
		if (document.getElementById(event.target.id)) {
			document.getElementById(event.target.id).value = ''; // 바코드 초기화
		}
		scanLocationRef.current = event.target.id; // 구분 기준 플래그 값 부여
	};

	/** 바코드 포커스 이동 */
	const onFocuseBarcode = () => {
		scanLocationRef.current = 'outputBarcode';
		if( focuseBarcode.current ){
			focuseBarcode.current.value = ''
			focuseBarcode.current.focus();			
		}	
	}

    /** 텍스트필드 엔터키 동작  */
    const onKeydownForEvent = (event) => {
        if(event.key !== 'Enter'){
            return
        }
        if(event.key === 'Enter' && scanLocationRef.current === 'outputBarcode'){
            event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
            onOutputReadPalletBarcode(event.target.value);
            return
        }
    }

	/** 출하 바코드 등록 */
	const onOutputReadPalletBarcode = async ( scannedBarcode )=> {
		try {
			setOnLoading(true);
			if( !scannedBarcode ){
				setPopup(`바코드 에러`, `바코드를 입력해 주세요.`);
				onFocuseBarcode();
				return
			} 
			if( scannedBarcode.length !== 5 ){ 				
				setPopup(`바코드 에러`, `바코드 길이가 잘못 되었습니다.`);
				onFocuseBarcode();
				return
			}
			//겹치는게 있으면 중복 알림
			if( gridOutputPallet_ref.current.rows.filter((row) => row.barcode === scannedBarcode ).length > 0 ){ 		
				setPopup(`중복 팔레트`, `이미 입력한 팔레트입니다.`);	
				onFocuseBarcode();		
				return
			}
			
			const result = await UseFetchParam({
				procedure:"PSP_L_CHULHA_BARCODE_CHECK", // 처리 가능한 바코드 인지 확인하는 프로시저 
				parameter:[
					scannedBarcode, 
					'1' , // 출하페이지는 1이 플래그 고정값 (0이면 입고, 1이면 출하), (2024.12.04 입고페이지가 분리되어 입고0 넣을 일 없음)
				],
				EventType:"check data",
				EventName:"shipment check",
			});					
			// 바코드 조회 성공, 입력 처리
			if(result[0].Column1 === 'OK'){
				setGridOutputPallet({
					...gridOutputPallet_ref.current,
					rows: [
						...gridOutputPallet_ref.current.rows,
						{
							id: scannedBarcode, 
							barcode: scannedBarcode, 
							PACKDATE: result[0].Column2 //적재일자값
						}
					],
				})
			}
			else{
				setPopup('조회 실패',`조회에 실패했습니다.`);
			}
			
		} 
		catch (err) {
			setPopup(`${err}`);
		}
		finally {
			setOnLoading(false);
			onFocuseBarcode();
		}
	}

	/** 출하 상태에서 등록 시도 버튼 클릭 시, 페이지 변환 */
	const onOutputRegiestTryToDetail = async ()=> {
		if(gridOutputPallet_ref.current.rows.length === 0){
			setPopup('출하 대상이 될 팔레트가 없습니다.')
			return;
		}
		setPageFlag("isShipment");
	}

	/** 출하 대상 처리하는 함수 */
	const onOutputSaveShipment = async ()=> {
		try {
			if( gridOutputPallet_ref.current.rows.length === 0 ){  
				setPopup(`미입력 에러`, `스캔한 팔레트가 없습니다.`);
				return;
			}
			//출하처 미선택
			if( !shipmentSpot_ref.current.selected ){
				setPopup(`출하처 미선택`, `출하처가 선택되지 않았습니다.`);
				return;
			}
			
			setOnLoading(true);

			//ERP채번 (공통적용)
			const result1 = await UseFetchParam({                
				procedure:"ESP_L_SHIPNUM_CREATE", //출하ERP 채번 프로시저 
				parameter:null, // 매개변수 없는 프로시저
				EventType:"load data",
				EventName:"create shipment ERP code",
			});			
			const ERP_SHIPNUM = result1[0].Column1
			if( !ERP_SHIPNUM ){ //  result1.Column1 는 ERP채번 번호, ERP채번 실패 예외처리
				throw new Error(`ERP번호가 없습니다. 관리자에게 문의 바랍니다.`); //에러캐치로 이동됨				
			}

			// 상세정보 페이지의 입력정보 값 없을 시, 0으로 값을 바꿈 
			if( pageFlag === 'isShipmentDetail' && !textTransport_ref.current ){
				textTransport_ref.current = '0' ;
				setTextTransport('0')
			}
			if( pageFlag === 'isShipmentDetail' && !textDriver_ref.current ){
				textDriver_ref.current = '0' ;
				setTextDriver('0')
			}
			if( pageFlag === 'isShipmentDetail' && !textCost_ref.current ){
				textCost_ref.current = '0' ;
				setTextCost('0')
			}
			if( pageFlag === 'isShipment' && !deliveryTransport_ref.current.selected ){
				deliveryTransport_ref.current.selected = '0' ;
				setDeliveryTransport((prevState) => ({
					...prevState, 
					selected: '0',
				}));
			}

			// 출하 저장 시작
			const currentRows = gridOutputPallet_ref.current.rows;
			const results = await Promise.allSettled(
				currentRows.map(row =>
					UseFetchParam({
					procedure: 'PSP_S_CHULHA_OUTPUT_PROC',
					parameter: [
						row.barcode,
						shipmentSpot_ref.current.selected,
						pageFlag === 'isShipmentDetail' ? textTransport_ref.current : deliveryTransport_ref.current.selected,
						pageFlag === 'isShipmentDetail' ? textDriver_ref.current : '0',
						pageFlag === 'isShipmentDetail' ? textCost_ref.current : '0',
						ERP_SHIPNUM,
					],
					EventType: 'save data',
					EventName: 'save shipment output data',
					isVoidProcedure: true,
					})
					.then(() => row.barcode) // 성공한 barcode만 반환
				)
			);

			// 성공/실패 분리
			const successBarcodes = results.filter(r => r.status === 'fulfilled').map(r => r.value);

			//성공숫자와 실패숫자 저장
			const failedCount = results.filter(r => r.status === 'rejected').length;
			const successCount = successBarcodes.length;

			// 성공한 팔레트 기준으로 실패한 팔레트 정보 남기기
			const filteredRows = currentRows.filter(
				row => !successBarcodes.includes(row.barcode)
			);

			setGridOutputPallet({
				rows: filteredRows,
				selected: {
					type: 'include',
					ids: new Set(),
				},
			});

			if (failedCount === 0) {
				setPopup('출하 성공', `출하처리 완료 (${successCount}건 처리됨)`);				
			} 
			else if (successCount === 0) {
				setPopup('출하 실패', `(${failedCount}건 실패)`); 
			} 
			else {
				setPopup('부분 출하', `일부 출하 처리됨 (${successCount}건 성공, ${failedCount}건 실패)`);
			}

			//출하처 초기화
			setShipmentSpot((prevState) => ({
				...prevState, //이전 상태 복사
				selected: '', //선택 값 초기화
			}));

			//직송차량 선택 초기화
			setDeliveryTransport((prevState) => ({
				...prevState, //이전 상태 복사
				selected: '', //선택 값 초기화
			}));

			setTextTransport(''); //직송차량 초기화
			setTextDriver(''); //드라이버 초기화
			setTextCost(''); //단가 초기화

			//바코드 입력화면으로 이동
			setPageFlag('isInputBarcode');
			onFocuseBarcode();			
		}
		catch (err) {				
			setPopup('출하 실패', `출하 중 에러가 발생하였습니다. [${{err}}]`);
		}
		finally{
			setOnLoading(false);
		}
	}
    

    return (
    <Stack gap={1} m={1}>
        {pageFlag === 'isInputBarcode' && // 출하바코드 입력 페이지 (기본페이지)
		<>		
			<CatBarcodeNative
				label={'팔레트 바코드'}
				id={'outputBarcode'}
				onClick={onClickForNative}
				onKeyDown={onKeydownForEvent}
				inputRef={focuseBarcode}
			/>
			<CatDataGrid
				col={[			
					{field: 'barcode', headerName: '바코드', width: 110,},
					{field: 'PACKDATE', headerName: '입고일자', width: 200,},
				]}
				row={[...gridOutputPallet.rows].reverse()}
				rowSelectionModel={gridOutputPallet.selected} // 선택 상태 유지
				checkboxSelection
				onRowSelectionModelChange={(newSelection) => { // 선택된 행의 배열 저장
					setGridOutputPallet((prevState) => ({
						...prevState,
						selected: newSelection
					}))
				}}
			/>
			<CatButtonBigOne 
				buttonLabel='출하 등록'//(등록페이지로 이동)
				onClick={ onOutputRegiestTryToDetail } 
			/>
			<CatButtonBigOne
				buttonLabel='선택 삭제'
				onClick={() => {
                    const sel = gridOutputPallet_ref.current.selected;
					if (!sel.ids || sel.ids.size === 0) {
                        setPopup('삭제 실패','선택된 삭제 대상이 없습니다.');
                        return;
                    }
                    setGridOutputPallet(prevState => ({
                        ...prevState,
                        rows: prevState.rows.filter(row => !sel.ids.has(row.id)),                        
                        selected: {
                          type: 'include',
                          ids: new Set(),
                        },
                    }));
					onFocuseBarcode();
				}}
			/>
			<CatButtonBigOne
				buttonLabel='전체 삭제' // 출하 삭제
				onClick={() => { 
					setGridOutputPallet((prevState) => ({
						...prevState
						, rows: []
						, selected: {
                            type: 'include',
                            ids: new Set(),
                        },
					})) 
					onFocuseBarcode();
				}}
			/>
		</>
		}
		
		{pageFlag === 'isShipment' && //등록 입력창 (간단 선택입력)
		<>				
			<CatSelect
				label="출하처"
				value={shipmentSpot.selected} 
				option={shipmentSpot.options}
				onChange={(event) => {	
					setShipmentSpot({
						...shipmentSpot,
						selected: event.target.value
					})			
				}}
			/>					
			<CatSelect
				label="직송차량 (선택)"
				value={deliveryTransport.selected} 
				option={deliveryTransport.options}
				onChange={(event)=> {
					setDeliveryTransport({
						...deliveryTransport,
						selected: event.target.value
					})
				}}
			/>	
			<CatButtonBigOne
				buttonLabel='전송'
				onClick={ onOutputSaveShipment }
			/>	
			<CatButtonBigOne
				buttonLabel='직송차량'
				onClick={ () => { setPageFlag('isShipmentDetail') } }
			/>
			<CatButtonBigOne
				buttonLabel='이전'
				onClick={ () => { setPageFlag('isInputBarcode') } }
			/> 		
		</>
		}

		{pageFlag === 'isShipmentDetail' && //등록 상세입력창 (상세 입력)
		<>
			<CatSelect
				label="출하처"				
				value={shipmentSpot.selected} 
				option={shipmentSpot.options}
				onChange={(event) => {
					setShipmentSpot({
						...shipmentSpot,
						selected: event.target.value
					})			
				}}
			/>	
			<CatTextField
				label={"직송차량"}
				value={textTransport}
				onChange={(event) => {
					setTextTransport(event.target.value);
				}}
			/>
			<CatTextField
				label={"운전기사"}
				value={textDriver}
				onChange={(event) => {
					setTextDriver(event.target.value);
				}}
			/>
			<CatTextField
				label={"단가"}
				value={textCost}
				onChange={(event) => {
					setTextCost(event.target.value);
				}}
			/>
			<CatButtonBigOne
				buttonLabel='전송'
				onClick={ onOutputSaveShipment }
			/>
			<CatButtonBigOne
				buttonLabel='이전'
				onClick={ () => { setPageFlag('isShipment') } }
			/> 	
		</>
		}
    </Stack>
    )
}