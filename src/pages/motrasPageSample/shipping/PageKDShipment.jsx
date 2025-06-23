import { useEffect, useState, useRef, useCallback, } from "react";//리액트
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
import { Stack  } from '@mui/material';
import CatTextField from '../../components/CatTextField'
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatSelect from '../../components/CatSelect'
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
@Page PageKDShipment.jsx
@Role Motras PDA > 출하 메뉴 > KD출하 페이지
@description 이전 명칭 frmCKDChulha.cs
*******************************************************************************************/
export default function PageKDShipment() {

	const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
	} = useRootContext();

    /* -----------------------------------------------------*/
	// 페이지 플래그 값 리스트 //  
	const [pageFlag, setPageFlag] = useState('inputBarcode');//페이지의 보여줄 상태 플래그 값 
	/* --------------------------------------------------------
	* inputBarcode 			출하 바코드 입력화면 (시작화면)
	* regist 				등록 입력창 
	* registDetail 			상세세등록 입력창
	* -----------------------------------------------------*/ 

	const [DataGrid_KD, setDataGrid_KD]  = useState({ //KD출하 데이터그리드
		columns : [
			{ field: 'PalletNo', headerName: '바코드', width: 100 },
			{ field: 'PACKDATE', headerName: '입고일자', width: 200 },
		],
		rows : [],
		selected: {
            type: 'include',
            ids: new Set(),
        },
	});

	// 출하 저장 과정에서의 성공 실패 바코드 처리값 저장
	const filteredRows_ref = useRef([]);
	const savedBarcode_ref = useRef([]);
	const faildBarcode_ref = useRef([]);
	const faileMsgSave_ref = useRef('');

	const [KDSPOT, setKDSPOT] = useState({selected: "", options: []}); //출하처
	const [deliveryTransport, setDeliveryTransport] = useState({selected: "", options: []});  //직송차량
	const [textTransport, setTextTransport] = useState('')//직속차량 수동입력
	const [textDriver, setTextDriver] = useState('')//운전기사 수동입력
	const [textCost, setTextCost] = useState('')//단가수동입력

	const focuseBarcode = useRef(null); //팔레트 텍스트필드 포커스 기준
	const scanLocationRef = useRef('KDShipmentpalletBarcode'); //네이티브에서 기준삼을 스캔 위치 플래그 값 (매개변수에 처음 지정위치 포함)

	const dataGrid_KD_Ref = useRef('');	
	useEffect(() => {   dataGrid_KD_Ref.current = DataGrid_KD  }, [DataGrid_KD]);	
	const KDSPOT_ref = useRef(''); 
	useEffect(() => {  KDSPOT_ref.current = KDSPOT }, [KDSPOT]);
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

	//시작설정
	useEffect(() => { 
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		onFocuseBarcode();
		setOnLoading(true);
		(async () => {
			try {
				//업체정보
				const result = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user",//코드 기준 검색 프로시저
					parameter:["ASSPOT"], 
					EventType:"load code",
					EventName:"AS SPOT search",
				});
				setKDSPOT({
					...KDSPOT,					
					options: result.map(data => ({
						value: data['업체코드'],
						label: data['업체명'],
					}))
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

    //선택된 출하처에 맞는 차량 정보 가져오기
	useEffect(() => { 		
		if( !KDSPOT.selected ){ //출하처 미 선택 시 작동 안함
			return;
		}
		//조회시작
		setOnLoading(true);
		(async () => {
			try {
				//업체정보
				const result = await UseFetchParam({
					procedure:"pk_load_sp_code_id_by_user",//코드 기준 검색 프로시저
					parameter:[
						"TRUC"
						,
						`TRUCK_CODE IN 
						(SELECT TRUCK_CODE 
							FROM M_TCST(nolock) 
							WHERE SPOT_CODE = ${KDSPOT.selected})`
					], 
					EventType:"load coad",
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
			} catch (err) {			  				
				setPopup(`차량정보를 가져오지 못 했습니다. ${err}`);
			} finally {
				setOnLoading(false);
			}
		})();
	}, [KDSPOT.selected]);

	//바코드 입력 페이지 플래그 값 상태에서 포커스 이동
	useEffect(() => { 
		if(pageFlag === 'inputBarcode'){
			onFocuseBarcode();
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
				if (scanLocationRef.current === 'KDShipmentpalletBarcode') {
					handleBarcodeInput(scannedData.data);					
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
        if(event.key === 'Enter' &&  scanLocationRef.current === 'KDShipmentpalletBarcode'){
            event.preventDefault(); // 기본 엔터 동작(폼 제출 등) 방지
            handleBarcodeInput(event.target.value);
			return
        }
    } 

	/** 바코드 포커스 이동 */
	const onFocuseBarcode = () => {
		scanLocationRef.current = 'KDShipmentpalletBarcode';
		if ( focuseBarcode.current ){
			focuseBarcode.current.value = ''
			focuseBarcode.current.focus(); // 바코드 시작 포커스 이동
		}
		if( document.getElementById('KDShipmentpalletBarcode') ){
            document.getElementById('KDShipmentpalletBarcode').value = '';
        }
	}

    /** 바코드 입력 */
	const handleBarcodeInput = (scannedBarcode) => {		
		setOnLoading(true);		
		if( scannedBarcode.trim().length !== 5 ){			
			setOnLoading(false);
			setPopup(`바코드 오류`, `바코드 길이 오류 [제한:5동일]`);
			onFocuseBarcode();
			return;
		}
		if( dataGrid_KD_Ref.current.rows.some( row => row.PalletNo === scannedBarcode )){
			setOnLoading(false);
			setPopup(`바코드 오류`,`"${scannedBarcode}"는 이미 입력한 팔레트입니다.`);
			onFocuseBarcode();
			return;
		}
		(async () => {
			try {
				const result = await UseFetchParam({
					procedure:"PDA_ASCHULHA_BARCODE_CHECK_L",  
					//팔레트 체크 (원본:PSP_L_ASCHULHA_BARCODE_CHECK)(대체:PDA_ASCHULHA_BARCODE_CHECK_L)  
					//프로시저 이름이 AS출하로 되어있지만 원본도 PSP_L_ASCHULHA_BARCODE_CHECK 였으며, KD출하이름은 아님					
					parameter:[scannedBarcode], 
					EventType:"barcodeScan",
					EventName:"AS shipment check",
				});					
				if(result[0].Column1 === "OK"){ 
					setDataGrid_KD((prevDataGrid_KD) => ({
						...prevDataGrid_KD,
						rows: [
						  ...prevDataGrid_KD.rows,
						  {
							id: scannedBarcode, 
							PalletNo: scannedBarcode, // 스캔한 바코드
							PACKDATE: result[0].Column2 // 적재 날짜
						  }
						]
					}));
				}
			} 
			catch (err) {				
				setPopup(`${err}`);
			} 
			finally {				
				setOnLoading(false);
				onFocuseBarcode();
			}
		})();
	};

	/** 등록버튼 이벤트, 창 전환 */
	const handleClickOpen = () => {
		if(DataGrid_KD.rows.length === 0){
			setPopup(`팔레트 바코드가 입력되지 않았습니다.`)
			return;
		}
		
		// 등록하면에서 입력 받아야할 값 초기화,
		setKDSPOT({
			...KDSPOT,
			selected: ""
		})
		setDeliveryTransport({
			...deliveryTransport,
			selected: ""
		})
		setTextTransport('');
		setTextDriver('');
		setTextCost('');

		//페이지 이동
		setPageFlag("regist");
	}

	/** 입력창에서 뒤로 가기 */
	const handleClose = () => {
		if (pageFlag === 'regist' ) { //일반입력창에서 바코드 입력창으로 이동
			setPageFlag('inputBarcode');
		}
		if (pageFlag === 'registDetail' ) { //상세입력창에서 일반입력으로 이동
			setPageFlag('regist');
			setTextTransport('')
			setTextDriver('')
			setTextCost('')
		}
	};

	/** 직송차량버튼 클릭, 상세입력 */
	const onPageRagistDetail = () => {
		if(  dataGrid_KD_Ref.current.rows.length === 0 ){
			setPopup('출하 대상이 될 팔레트가 없습니다.')
			return;
		}
		setPageFlag('registDetail');
	};

	/** 전송 버튼 클릭 */
	const onSave = () => {
		setOnLoading(true);
		if( dataGrid_KD_Ref.current.rows.length === 0 ){  
			setPopup(`에러`, `스캔한 팔레트가 없습니다.`);
			return;
		}
		if( !KDSPOT_ref.current.selected ){
			setPopup('출하처 미선택',`출하처가 선택되지 않았습니다.`);
			return;
		}
		(async () => {
			try {
				const result1 = await UseFetchParam({
					api: "GENERAL",		
					procedure:"ESP_L_SHIPNUM_CREATE", //출하번호 채번 프로시저 
					parameter:null, // 매개변수 받지 않음. 
					EventType:"load ERP code",
					EventName:"Create KD shipment ERP code",					
				}); // result1[0].Column1에 ERP 출하 채번으로 나옴
				// 출하번호(ERP번호) 안 나올 시 예외처리
				if( !result1[0].Column1 ){ 
					throw new Error(`ERP번호가 없습니다. 관리자에게 문의하세요. `);					
				} 
				// 상세정보 입력정보 값 없을 시, 0으로 값을 바꿈 
				if( pageFlag === 'registDetail' && !textTransport_ref.current ){
					textTransport_ref.current = 0 ;
					setTextTransport('0')
				}
				if( pageFlag === 'registDetail' && !textDriver_ref.current ){
					textDriver_ref.current = 0 ;
					setTextDriver('0')
				}
				if( pageFlag === 'registDetail' && !textCost_ref.current ){
					textCost_ref.current = 0 ;
					setTextCost('0')
				}
				if( pageFlag === 'regist' && !deliveryTransport_ref.current.selected ){
					deliveryTransport_ref.current.selected = 0 ;
					setDeliveryTransport((prevState) => ({
						...prevState, 
						selected: '0', 
					}));
				}

				// 저장 하기 전 임시 저장할 배열 처리 데이터 저장용 값 초기화
				filteredRows_ref.current = dataGrid_KD_Ref.current.rows //기존 팔레트 복사본
				savedBarcode_ref.current = [] //성공 시 누적하여 저장
				faildBarcode_ref.current = [] //실패 시 누적하여 저장
				faileMsgSave_ref.current = '' //실패된 기록과 바코드 누적하여 기록 저장

				//반복하여 입력된 팔레트들을 하나씩 처리 
				for (const row of dataGrid_KD_Ref.current.rows) {
					try {
						const result2 = await UseFetchParam({
							procedure:"CSP_DBSave_CKDPACK", //KD출하 등록 프로시저
							parameter:[ 
								row.PalletNo, //팔레트(Pallet)
								KDSPOT.selected, //출하처(spot_code)
								pageFlag === 'registDetail' ? textTransport : deliveryTransport.selected, //트럭코드(truck_code)
								pageFlag === 'registDetail' ? textDriver : "" ,  //운전기사(driver)
								pageFlag === 'registDetail' ? Number(textCost) : "" , //운송가격(truck_cost)
								result1[0].Column1 //출하번호(erpnum )
							], 
							EventType:"save data",
							EventName:"save KD shipment",
							isVoidProcedure: true,
						})
						filteredRows_ref.current = filteredRows_ref.current.filter(item => item.barcode !== row.PalletNo); //성공시 그리드에서 제외
						savedBarcode_ref.current.push(row.PalletNo) // 성공 값 저장
					} 
					catch (err) {							
						faildBarcode_ref.current .push(row.PalletNo) //실패 팔레트 바코드 저장
						faileMsgSave_ref.current  += `${row.PalletNo} : ${err} | ` //실패 사유 저장
					}												
				}

				//결과 알림 분기문
				if (faildBarcode_ref.current.length === 0){ // 전체성공, 실패한 경우가 없는 경우
					setPopup('KD출하 성공', `전체 출하처리 되었습니다.`);
				}					
				else if (faildBarcode_ref.current.length > 0 && savedBarcode_ref.current.length > 0 ) { // 일부실패
					setPopup('일부 KD출하 실패',`일부 팔레트가 출하되지 않았습니다. [성공${savedBarcode_ref.current.length} / 실패${faildBarcode_ref.current.length}] [에러:${faileMsgSave_ref.current}]`);
				}
				else if (savedBarcode_ref.current.length === 0) { // 전체실패
					setPopup('KD출하실패',`바코드 전체가 출하되지 않았습니다. [${faileMsgSave_ref.current}]`);
				}

				// 저장 실패한 바코드만 데이터그리드에 남김 (없을 경우 공백)
				setDataGrid_KD((prevState) => ({
					...prevState, // 이전 상태 복사					
					rows: faildBarcode_ref.current, // 실패하고 남은 바코드 저장
					selected: { // 선택 값 초기화
						type: 'include',
						ids: new Set(), 
					},
				}));
				// 데이터 처리 이후 화면 값 초기화
				setKDSPOT((prevState) => ({
					...prevState,
					selected: "",
				}));
				setDeliveryTransport((prevState) => ({
					...prevState,
					selected: "",
				}));
				setTextTransport('')
				setTextDriver('')
				setTextCost('')

				setPageFlag('inputBarcode');//페이지 변경
				onFocuseBarcode()
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
    <Stack gap={1} m={1}>
            {pageFlag === 'inputBarcode' && //바코드입력창
		<>		
			<CatBarcodeNative
				label={'팔레트 바코드'}
				id={'KDShipmentpalletBarcode'}
				onClick={onClickForNative}
				onKeyDown={onKeydownForEvent}
				inputRef={focuseBarcode}
			/>
			<CatDataGrid 
				row={ [...DataGrid_KD.rows].reverse() }
				col={DataGrid_KD.columns}
				rowSelectionModel={DataGrid_KD.selected} // 선택 상태 유지
				checkboxSelection
				onRowSelectionModelChange={(newSelection) => { // 선택된 행의 배열 저장
					setDataGrid_KD((prevState) => ({
						...prevState,
						selected: newSelection
					}))
					onFocuseBarcode();
				}}
			/>
			<CatButtonBigOne 
				buttonLabel='KD출하 등록'
				onClick={handleClickOpen} 
			/>
			<CatButtonBigOne
				buttonLabel='선택 삭제'
				onClick={() => {
					const sel = dataGrid_KD_Ref.current.selected;
					if ( !sel.ids || sel.ids.size === 0) {
						setPopup('삭제 실패', '선택된 삭제 대상이 없습니다.');
						return;
					  }
					setDataGrid_KD((prevState) => ({
						...prevState
						, rows: prevState.rows.filter((row) => !prevState.selected.includes(row.id))
						, selected: {
                            type: 'include',
                            ids: new Set(),
                        },
					}))
					onFocuseBarcode();
				}}
			/>
			<CatButtonBigOne
				buttonLabel='전체 삭제'
				onClick={() => { 
					setDataGrid_KD((prevState) => ({
						...prevState
						, rows: []
						, selected: {
                            type: 'include',
                            ids: new Set(),
                        }
					}))
					onFocuseBarcode();
				}}
			/>
		</>
		}

		{pageFlag === 'regist' && //차량입력
		<>
			<CatSelect
				label="출하처"				
				value={KDSPOT.selected} 
				option={KDSPOT.options}
				onChange={(event) => {	
					setKDSPOT({
						...KDSPOT,
						selected: event.target.value
					})
				}}
			/>	
			<CatSelect
				label="차량"				
				value={deliveryTransport.selected} 
				option={deliveryTransport.options}
				onChange={(event) => {
					setDeliveryTransport({
						...deliveryTransport,
						selected: event.target.value
					})
				}}
			/>
			<CatButtonBigOne
				buttonLabel={"전송"} 
				onClick={onSave}
			/>	
			<CatButtonBigOne
				buttonLabel={"직송차량"} 
				onClick={onPageRagistDetail}
			/>	
			<CatButtonBigOne
				buttonLabel={"이전"} 
				onClick={handleClose}
			/>	
		</>
		}

		{pageFlag === 'registDetail' && //직속차량입력
		<>
			<CatSelect
				label="출하처"				
				value={KDSPOT.selected} 
				option={KDSPOT.options}
				onChange={(event) => {	
					setKDSPOT({
						...KDSPOT,
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
				type="number"
				onChange={(event) => {
					setTextCost(event.target.value);
				}}
			/>
			<CatButtonBigOne 
				buttonLabel={"전송"} 
				onClick={onSave}
			/>	
			<CatButtonBigOne 
				buttonLabel={"이전"} 
				onClick={handleClose}
			/>		
		</>
		}
    </Stack>
    )
}