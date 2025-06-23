import { useEffect, useState, useRef, useCallback } from "react"; //리액트 
import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
import getDateTimeFormat from "../../functions/getDateTimeFormat";
import { Stack, TextField, Typography, InputAdornment, IconButton, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatTextField from '../../components/CatTextField'
/*******************************************************************************************
@_memo 바코드 리딩 순서 가능 분기 (2025년05월.sj_hong)
1. QL차종          (팔레트 > 완제품 > 스킨 > 엠코어) 
3. 스킨사용         (팔레트 > 완제품 > 스킨)
4. 그 외           (팔레트 > 완제품 )
*******************************************************************************************/
/*******************************************************************************************
@PROCEDURE
- 팔레트 바코드 읽기: 
    PSP_L_PALLET_MASTER_CHECK
    PSP_L_PALLET_STATUS_CHECK
    PSP_L_BAR_DISPLAY
- 완제품 바코드 읽기: 
            (미사용.통합시도_프로시저)PDA_LOADING_FORMING_ASSEMBLY_BARCODE_L
    PDA_LOADING_FORMING_ASSEMBLY_BARCODE_MAPPING_CHANGE_L
    PSP_L_GET_UTB_RES_CHECK
    PSP_L_TOUCH_UP_RESULT_PDA
    PDA_SCAN_MASTER_CHECK_V3_L
- 스킨 바코드 읽기: 
    PDA_LOADING_FORMING_SKIN_BARCODE_L 
- 엠코어 바코드 읽기: 
    X : 프로시저 미사용 
- 저장하기:
    PDA_LOADING_FORMING_UPDATE_UTB_RES_S    : 개별_저장_프로시저
    PDA_LOADING_FORMING_RES_UPDATE_CHECK_S  : 개별_저장_후_확인_프로시저_(갯수기준)
    PDA_LOADING_FORMING_PRINT_DATA_S        : 프린트_정보_저장_프로시저
*******************************************************************************************/
/*******************************************************************************************
@버전   
DATE        AUTHOR              DESCRIPTION
----------	---------------		------------------------------- 
2024-12-26	sj_hong				프로그램 배포
2025-05-23  sj_hong             (vite+SWC)전환+Ref동작형식으로_리팩토링
2025-05-27  sj_hong             데이터그리드 최신순으로 정렬
2025-06-16  sj_hong             브라켓바코드 추가 대비 예비코드 제거, 최종검사 여부 검사 로직 수리
*******************************************************************************************/
/*******************************************************************************************	
@Page pageLoadingForming.jsx
@Role Motras PDA > 적재 > 발포적재관리 페이지 
@version 전체_페이지_로직_및_코드_리팩토링
@description - 사용빈도 매우 높은 페이지, 거의 매일 사용 (이전페이지명칭frmLoadManagement)
*******************************************************************************************/
export default function PageLoadingForming() {

    //콘텍스트_공용_가져오기
    const {
        setPopup, setOnLoading, 
        isTopBarVisible, setIsTopBarVisible, 
        isUseManualInputContext, 
    } = useRootContext();
        
    //텍스트필드_위치_지정
    const palletBarcodeInputRef = useRef(null); //팔레트바코드필드위치
    const assemblyBarcodeInputRef = useRef(null); //완제품바코드필드위치
    const skinBarcodeInputRef = useRef(null); //스킨바코드필드위치
    const mcoreBarcodeInputRef = useRef(null); //엠코어바코드필드위치    
    
    //바코드 값 저장 Ref
    const scanLocationValueRef = useRef('BARCODE-PALLET'); //네이티브_스캔_기준이_될_스캔_위치정보_저장
    const palletBarcodeValueRef = useRef(' ');
    const assemblyBarcodeValueRef = useRef(' ');
    const skinBarcodeValueRef = useRef(' ');
    const mcoreBarcodeValueRef = useRef(' ');    
    const expectedSkinPartNumberReference = useRef(''); //플래그_분기_및_값_체크 저장

    //팔레트_적재_날짜시간_상태값
    const [palletPackDate, setPalletPackDate] = useState(''); 
    const palletPackDateValueRef = useRef('');
    useEffect(() => { palletPackDateValueRef.current = palletPackDate }, [palletPackDate]);

    //팔레트_최대_카운트_표기_상태값 
    const [textMaxCount, setTextMaxCount] = useState(0);
    const textMaxCountValueRef = useRef(''); 
    useEffect(() => { textMaxCountValueRef.current = textMaxCount }, [textMaxCount]);

    //데이터그리드_표_데이터_정보
    const [dataGridRows, setDataGridRows] = useState([]);
    const dataGridRowsValueRef = useRef(''); 
    useEffect(() => { dataGridRowsValueRef.current = dataGridRows }, [dataGridRows]);

    //바코드 사용 여부를 상태를 객체로 묶어서 관리
    const [barcodeUsageFlags, setBarcodeUsageFlags] = useState({
        skin: false,
        mcore: false,
    });
    const barcodeUsageFlagsRef = useRef(barcodeUsageFlags);    
    useEffect(() => { barcodeUsageFlagsRef.current = barcodeUsageFlags }, [barcodeUsageFlags]);

    //컬럼 보여주는 상태 값(사용여부 변경되는 컬럼은 값 있어야 보여주기)
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({
        //항상 보여주는 값
        BARCODE: true,
        //선택적으로 보여주는 컬럼값, 사용되어야 보여지도록 설정
        SKIN: dataGridRows[0]?.SKIN ? true : false,
        MCORE: dataGridRows[0]?.MCORE ? true : false,
        //보여주지않는값
        id: false,
        RPACKDATE: true,
        QCDATE: false,
        STOREDATE: false,
        HOTKNIFE: false,
        FLAG: false,
    });

    // 네이티브 메시지 콜백 
    const onMessage = useCallback((event) => {
        onReadDataFromNative(event); // WebView에서 받아온 데이터 읽기
    }, []); 

    useEffect(() => {
        if(!isTopBarVisible){setIsTopBarVisible(true)}
        onMoveFocus("PALLET");
        //네이티브연동
        document.addEventListener('message', onMessage);
        return () => {
            document.removeEventListener('message', onMessage);
        }
    }, []);

    // 네이티브 에서 보낸 데이터 받아서 조건에 따라 할당 후 이벤트 동작하기
    const onReadDataFromNative = (e) => {
        const type = JSON.parse(e.data).type;
        if (type === 'SCANDATA') {
            const { scannedData, scannedLabelType, type } = JSON.parse(e.data);
            //수동입력상태이면_네이티브_바코드거부
            if( isUseManualInputContext ){
                setPopup('수동입력 상태', '수동입력 상태입니다. 설정에서 수동입력을 꺼주세요.')
                return;
            }
            //바코드읽기
            if (scanLocationValueRef.current === 'BARCODE-PALLET') {
                onPalletBarcodeScan(scannedData.data);
            }
            else if (scanLocationValueRef.current === 'BARCODE-ASSEMBLY') {
                onAssemblyBarcodeScan(scannedData.data);
            }	
            else if (scanLocationValueRef.current === 'BARCODE-SKIN') {
                onSkinBarcodeRead(scannedData.data);
            }
            else if (scanLocationValueRef.current === 'BARCODE-MCORE') {
                onMcoreBarcodeRead(scannedData.data);
            }
        }
        if (type === 'GET_WIFI_CURRENT_SIGNAL_STRENGTH') {
            const { wifiCurrentSignalStrength, type } = JSON.parse(e.data);
            if (wifiCurrentSignalStrength <= -85) {
                setPopup('WIFI 에러', '무선랜 신호가 약하거나 끊겼습니다.');
                return
            }
        }
    }

    //컬럼 보여주기 반응 반영 이펙트
    useEffect(() => {
        if (!dataGridRows || dataGridRows.length === 0) {
            return;
        }
        //변경사항 감지 시 컬럼 보여주기 상태 값 변경
        setColumnVisibilityModel(prev => ({
            ...prev,
            SKIN: !!dataGridRows[0].SKIN,
            MCORE: !!dataGridRows[0].MCORE,
        }));
        //최대적재수량까지 도달하면 포커스 해제 (키보드숨기기_기능)
        if (dataGridRowsValueRef.current.length == textMaxCountValueRef.current) {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
    }, [dataGridRows]);

    /** 특정 ID 문자열에 따라 포커스를 해당 컴포넌트로 이동시킨다.     
    * @param {'PALLET' | 'ASSEMBLY' | 'SKIN' | 'MCORE' } idRef 포커스를 이동할 대상 식별자.
    * @description 기능 : 포커스 이동, 이동된 포커스 내부 값 삭제, 포커스플래그상태 값 갱신 
    */
    const onMoveFocus = ( idRef )  => {
        if(!idRef){
            setPopup('포커스 에러', `이동 대상 미지정`);
            return;
        }
        const idRefUpper = idRef.toUpperCase();
        if( idRefUpper === 'PALLET' && palletBarcodeInputRef.current ){
            scanLocationValueRef.current = 'BARCODE-PALLET';
            palletBarcodeInputRef.current.value = '';
            palletBarcodeInputRef.current.focus();
        }
        else if( idRefUpper === 'ASSEMBLY' && assemblyBarcodeInputRef.current ){
            scanLocationValueRef.current = 'BARCODE-ASSEMBLY';
            assemblyBarcodeInputRef.current.value = '';
            assemblyBarcodeInputRef.current.focus();
        }
        else if( idRefUpper === 'SKIN' && skinBarcodeInputRef.current ){ 
            scanLocationValueRef.current = 'BARCODE-SKIN';
            skinBarcodeInputRef.current.value = '';
            skinBarcodeInputRef.current.focus();
        }
        else if( idRefUpper === 'MCORE' && mcoreBarcodeInputRef.current ){
            scanLocationValueRef.current = 'BARCODE-MCORE';
            mcoreBarcodeInputRef.current.value = '';
            mcoreBarcodeInputRef.current.focus();
        }
        else {
            setPopup('포커스 에러', `${idRefUpper}바코드로 이동실패`);
        }
    }

    /** 함께 연동되는 2개의 Ref 값 초기화 */
    const onClearInput = (inputRef, valueRef) => {
        if (inputRef.current) inputRef.current.value = '';
        if (valueRef?.current !== undefined) valueRef.current = '';
    };

    /** 클릭된 텍스트필드 위치 아이디 저장 */
    const onSaveClickedLocation = (event) => {
        scanLocationValueRef.current = event.target.id; // 구분 기준 플래그 값 부여        
    }

    /** 팔레트 바코드 리딩 (원본:txtPalletNo_KeyPress)  */
    const onPalletBarcodeScan = async ( scannedBarcode )=> {  
        const errorDialogTitle = '팔레트 바코드 오류';
        try {
            setOnLoading(true);
            if( !scannedBarcode ){
                onMoveFocus("PALLET");
                setPopup(errorDialogTitle, 'PALLET NO 이 입력되지 않았습니다.');
                return
            }
            if( scannedBarcode.length !== 5 ){
                onMoveFocus("PALLET");
                setPopup(errorDialogTitle, 'PALLET NO 타입 오류');
                return
            }            
            setDataGridRows([]);
            const palletMasterCheck = await useFetch({
                procedure:"PSP_L_PALLET_MASTER_CHECK",
                parameter:[ scannedBarcode ],
            })
            if(palletMasterCheck[0][0].RESULT !== 'Y'){
                setPopup(errorDialogTitle, 'PALLET 번호 등록 요망')
                onMoveFocus("PALLET");
                return
            }
            if(palletMasterCheck[0][0].VALID === ''){
                setPopup(errorDialogTitle, '사용불가 처리된 PALLET 번호')
                onMoveFocus("PALLET");
                return
            }
            if(palletMasterCheck[0][0].PRTFLG === ''){
                setPopup(errorDialogTitle, '미발행 PALLET 번호')
                onMoveFocus("PALLET");
                return
            }
            if(palletMasterCheck[0][0].MAXCNT && palletMasterCheck[0][0].DB_DATE){
                setTextMaxCount(palletMasterCheck[0][0].MAXCNT); //최대 적재수량 정보
                const formattedDateTime = getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", palletMasterCheck[0][0].DB_DATE);
                setPalletPackDate(formattedDateTime); //데이터베이스에서 가져오는 현재 시간
            }
            else{
                setPopup(errorDialogTitle, '팔레트 적재 수량 정보 휙득 실패')
                onMoveFocus("PALLET");
                return
            }
            const palletStatusCheck = await useFetch({
                procedure:"PSP_L_PALLET_STATUS_CHECK",
                parameter:[ scannedBarcode ], 
            })
            if(palletStatusCheck[0][0].RESULT === "Y" && !palletStatusCheck[0][0].STOREDATE===""){
                setPopup(errorDialogTitle, '출하장 입고 처리 완료된 PALLET 입니다.');
                onMoveFocus("PALLET");
                return
            }
            if(palletStatusCheck[0][0].RESULT === "Y"){
                setPalletPackDate(palletStatusCheck[0][0].PACKDATE);                
            }
            const palletDisplay = await useFetch({
                procedure:"PSP_L_BAR_DISPLAY",
                parameter:[ scannedBarcode ],
            })
            //이전에 하던 작업 내용 있으면 가져오기
            if(palletDisplay[0].length > 0){
                setDataGridRows(
                    palletDisplay[0].map(row => ({
                        BARCODE     :  row.BARCODE,
                        RPACKDATE   :  getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", row.RPACKDATE),//적재일자
                        QCDATE      :  getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", row.QCDATE),//큐씨검사일자
                        STOREDATE   :  getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", row.STOREDATE),//출하장입고일자
                        MCORE       :  row.LASER,//엠코어스코링바코드(DB에서는_레이저라고나옴)
                        HOTKNIFE    :  row.HOTKNIFE,//핫나이프바코드(미사용)      
                        SKIN        :  row.SKIN_BARCODE,//스킨바코드
                        FLAG        :  '1'
                    }))
                );
            }
            
            //팔레트번호저장_및_완제품바코드이동
            palletBarcodeValueRef.current = scannedBarcode;
            palletBarcodeInputRef.current.value = scannedBarcode;
            onMoveFocus("ASSEMBLY");
        }
        catch(err){
            setTextMaxCount(0)
            setPalletPackDate(' ');
            setDataGridRows([]);
            setPopup(errorDialogTitle, `${err}`);
        }
        finally{
            setOnLoading(false);
        }
    } 

    /** 완제품 바코드 리딩 (원본:txtAssyNo_KeyPress)  */
    const onAssemblyBarcodeScan  = async ( scannedBarcode ) => {
        const errorDialogTitle = '완제품 바코드 오류';
        try {
            setOnLoading(true);
            if( dataGridRowsValueRef.current.length >= textMaxCountValueRef.current ){
                setPopup('초과 적재 오류', `${textMaxCountValueRef.current}개 초과 적재 불가`);
                assemblyBarcodeInputRef.current.value = ''; //값 입력 취소
                if (document.activeElement instanceof HTMLElement) { //전체 포커스 해제
                    document.activeElement.blur();
                }
                return
            }
            if( !palletBarcodeValueRef.current ){
                setPopup(errorDialogTitle, 'PALLET 가 입력되지 않았습니다.');
                onMoveFocus("PALLET");
                return
            }
            if( !scannedBarcode ){
                setPopup(errorDialogTitle, '바코드가 입력되지 않았습니다.');
                onMoveFocus("ASSEMBLY");
                return
            }
            //완제품 바코드 매핑 매칭
            const result1 = await UseFetchParam({
                procedure:"PDA_LOADING_FORMING_ASSEMBLY_BARCODE_MAPPING_CHANGE_L",//바코드매핑하여_교체함(원본:CSP_L_BARCODE_LOAD_CHANGE_PDA)
                parameter:[ scannedBarcode ],//완제품_바코드
            })
            const changedAssemblyBarcode = result1[0].Column1;
            if( !changedAssemblyBarcode ){
                setPopup(errorDialogTitle, `2D바코드 조회오류 ${changedAssemblyBarcode}`);	
                onMoveFocus("ASSEMBLY");
                return
            }
            if( changedAssemblyBarcode.length < 23 ){
                setPopup(errorDialogTitle, `완제품 바코드 길이 오류`);	
                onMoveFocus("ASSEMBLY");
                return
            }
            if( changedAssemblyBarcode.split(' ')[0].trim() === 'XXXXXXXXXXXXXX' ){
                setPopup(errorDialogTitle, `적재불가능 바코드`);	
                onMoveFocus("ASSEMBLY");
                return
            }
            if( dataGridRowsValueRef.current.some((row) => row["BARCODE"]?.trim() === changedAssemblyBarcode) ){
                setPopup(errorDialogTitle, `중복 스캔, 이미 처리된 제품입니다.`)
                onMoveFocus("ASSEMBLY");
                return
            }
            //다른 종류 제품 적재 시 예외처리
            if(dataGridRowsValueRef.current.length > 0){
                const currentPartNo = dataGridRowsValueRef.current[0].BARCODE.split(' ')[0].trim();
                const currentAssyNo = changedAssemblyBarcode.split(' ')[0].trim();
                //아래 비교 값은 허용
                const isAcceptableMismatch = ( 
                    (currentPartNo === "84710D9000WK" && currentAssyNo === "84710D9000WK_") ||
                    (currentPartNo === "84710D9000WK_" && currentAssyNo === "84710D9000WK")
                );
                if (currentPartNo !== currentAssyNo && !isAcceptableMismatch) {
                    setPopup(errorDialogTitle, `완제품 바코드 이종입니다.[${currentPartNo}/${currentAssyNo}]`);
                    onMoveFocus("ASSEMBLY");
                    return;
                }
            }
            const result2 = await UseFetchParam({
                procedure:"PSP_L_GET_UTB_RES_CHECK",
                parameter:[
                    changedAssemblyBarcode,
                    palletBarcodeValueRef.current
                ], 
            })
            if( result2.length > 0 ){
                if (result2[0].STOREDATE.trim()) {
                    setPopup(errorDialogTitle, `출하장 입고 처리 완료 바코드`);	
                    onMoveFocus("ASSEMBLY");
                    return
                }
                if (result2[0].QCDATE.trim()) {
                    setPopup(errorDialogTitle, `이미 적재 처리된 바코드`);	
                    onMoveFocus("ASSEMBLY");
                    return
                }
            }
            else{
                setPopup(errorDialogTitle, `완제품 ${changedAssemblyBarcode} 정보 없음`);	
                onMoveFocus("ASSEMBLY");
                return
            }

            // 최종검사 여부 가져오기 
            const touchUpResult = await UseFetchParam({
                procedure:"PSP_L_TOUCH_UP_RESULT_PDA",
                parameter:[ changedAssemblyBarcode ], //완제품 바코드
            })
            if(touchUpResult[0].ALL_RESULT === 'NG'){
                setPopup(errorDialogTitle, `최종 검사 'NG'판정, 적재 불가`);
                onMoveFocus("ASSEMBLY");
                return
            }
            if(touchUpResult[0].ALL_RESULT === 'NOT'){
                setPopup(errorDialogTitle, `최종 검사 이력이 없습니다.`);
                onMoveFocus("ASSEMBLY");
                return
            }

            //다음 바코드 처리 분기 가져오기
            const masterCheckResult = await UseFetchParam({
                procedure:"PDA_SCAN_MASTER_CHECK_V3_L",
                parameter:[ changedAssemblyBarcode ], 
            })

            //분기 정보 저장
            setBarcodeUsageFlags({
                skin:   masterCheckResult[0].IS_USE_CHECK_SKIN === 'Y' ? true : false
                ,mcore: masterCheckResult[0].IS_USE_CHECK_MCORE === 'Y' ? true : false                
            })
            expectedSkinPartNumberReference.current = masterCheckResult[0].SKIN_PART_NO

            //바코드 저장 및 후순서 바코드 정리
            assemblyBarcodeValueRef.current = changedAssemblyBarcode;
            assemblyBarcodeInputRef.current.val = changedAssemblyBarcode;
            onClearInput(skinBarcodeInputRef, skinBarcodeValueRef);
            onClearInput(mcoreBarcodeInputRef, mcoreBarcodeValueRef);            

            //완료처리 혹은 다음분기 이동
            if(masterCheckResult[0].IS_USE_CHECK_SKIN === 'Y'){
                onMoveFocus("SKIN");
            }
            else{
                onRegistBarcodeToDataGrid();
            }
        }
        catch(err){
            setPopup(errorDialogTitle, `${err}`);
            onMoveFocus("ASSEMBLY");
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 스킨 바코드 리딩 (원본:txtSkin_KeyPress) */
    const onSkinBarcodeRead  = async ( scannedBarcode ) => {
        const errorDialogTitle = '스킨 바코드 오류';
        try {
            setOnLoading(true);
            if( !barcodeUsageFlagsRef.current.skin ){
                setPopup(errorDialogTitle, `스킨바코드 입력불가.`);
                onMoveFocus("SKIN");
                return
            }
            if( !scannedBarcode ){
                setPopup(errorDialogTitle, '스킨바코드가 입력되지 않았습니다.');
                onMoveFocus("SKIN");
                return
            }
            if( scannedBarcode.length != 14 ){                
                setPopup(errorDialogTitle, '스킨 바코드 길이 오류');
                onMoveFocus("SKIN");
                return
            }
            if( dataGridRowsValueRef.current.length > 0 
                &&  dataGridRowsValueRef.current.some((row) => row['SKIN']?.trim() === scannedBarcode.trim()) ){
                setPopup(errorDialogTitle, `${scannedBarcode}는 리스트에 존재하는 스킨바코드입니다.`);
                onMoveFocus("SKIN");
                return
            }            
            const SkinCheckResult = await useFetch({
                procedure:"PDA_LOADING_FORMING_SKIN_BARCODE_L",
                parameter:[ 
                    scannedBarcode//스킨바코드
                ,   assemblyBarcodeValueRef.current.split(' ')[0].trim()//바코드앞부분이 제품번호와 동일하여 잘라서 파트넘버 대용으로 사용함
                ,   expectedSkinPartNumberReference.current //스킨재검사
                ],
                EventType:"barcode Scan",
                EventName:"loading Skin Barcode Check",                
            })

            skinBarcodeValueRef.current = scannedBarcode;
            skinBarcodeInputRef.current.value = scannedBarcode;

            //등록 혹은 다음 바코드로 이동
            if(barcodeUsageFlags.mcore){
                onMoveFocus("MCORE")
            }
            else{
                onRegistBarcodeToDataGrid();
            }
        }
        catch(err){
            setPopup(errorDialogTitle, `${err}`);
            onMoveFocus("SKIN");
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 엠코어 바코드 리딩 (LASER는 없어진 이름)(원본:txtLaser_KeyPress) */
    const onMcoreBarcodeRead  = ( scannedBarcode ) => { 
        const errorDialogTitle = 'MCORE 바코드 오류';
        try {
            setOnLoading(true);
            if( !barcodeUsageFlagsRef.current.mcore ){
                setPopup(errorDialogTitle, 'MCORE 바코드 입력불가.');
                onMoveFocus("MCORE");
                return
            }
            if( !scannedBarcode ){                
                setPopup(errorDialogTitle, 'MCORE 바코드가 입력되지 않았습니다.');
                onMoveFocus("MCORE");
                return
            }
            if( scannedBarcode === skinBarcodeValueRef.current ){
                setPopup('알림', '스킨바코드입니다.');
                onMoveFocus("MCORE");
                return
            }
            mcoreBarcodeValueRef.current = scannedBarcode;
            mcoreBarcodeInputRef.current.value = scannedBarcode;
            //등록
            onRegistBarcodeToDataGrid();
        }
        catch(err){
            setPopup('엠코어 바코드 에러', `${err}`);
            onMoveFocus("MCORE");
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 바코드 매칭, 데이터추가하는 함수 (표에 추가하고 팔레트 제외한 입력 초기화) (원본:BarcodeMatchingValidation) */
    const onRegistBarcodeToDataGrid = async () => { 
        try {
            setOnLoading(true);
            //적재초과방지(같은수량까지는허용)
            if (dataGridRowsValueRef.current.length > Number(textMaxCountValueRef.current)) { 
                setPopup('팔레트 적재 초과', `최대 적재수량 ${Number(textMaxCountValueRef.current)} 을 초과 할 수 없습니다.`)
                return
            }
            const registBarcodeDateTime 
                //= getNowDateTime("YYYY-MM-DD HH:DD:SS.SSS")//등록버튼클릭한_시간(JS)
                = await useFetchDateTime({format: "YYYY-MM-DD HH:DD:SS.SSS"})//등록버튼클릭한_시간(DB)
            //등록
            setDataGridRows((previousData)=> ([
                ...previousData, 
                {
                    BARCODE		: 	assemblyBarcodeValueRef.current//완제품바코드
                ,   RPACKDATE	:   registBarcodeDateTime//적재일자(현재시간저장)
                ,   QCDATE		: 	''//검사일자(원본값도_공백)
                ,   STOREDATE	: 	''//출하장입고일자(원본값도_공백)
                ,   SKIN	    : 	skinBarcodeValueRef.current//스킨바코드
                ,   MCORE		: 	mcoreBarcodeValueRef.current//엠코어스코링바코드                
                ,   HOTKNIFE	: 	''//핫나이프바코드(2025년.미사용확인)
                ,   FLAG		: 	'0'
                }
            ]));

            //입력값 초기화
            onClearInput(assemblyBarcodeInputRef, assemblyBarcodeValueRef);
            onClearInput(skinBarcodeInputRef, skinBarcodeValueRef);
            onClearInput(mcoreBarcodeInputRef, mcoreBarcodeValueRef);            
            expectedSkinPartNumberReference.current='';
            setBarcodeUsageFlags({skin: false, mcore: false});

            //다음 바코드 입력으로 이동, 최대치 까지 적재했다면 포커스 이동 안하고 포커스 해제            
            onMoveFocus("ASSEMBLY");
        }
        catch(err){
            setPopup('바코드 표 등록 에러', `${err}`);
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 적재 버튼 이벤트 (원본:btnLoad_Click) */
    const onCommitDataRowsToDatabase = async () => { 
        try {
            setOnLoading(true);
            if( !palletBarcodeValueRef.current ){
                setPopup('적재 실패','팔레트 바코드 스캔 요망')
                onMoveFocus("PALLET");
                return
            }
            if( dataGridRowsValueRef.current.length === 0 ){
                setPopup('적재 불가','바코드 스캔 요망')
                onMoveFocus("ASSEMBLY");
                return
            }
            //등록버튼클릭한_시간
             const executeLoadingClickDateTime = await useFetchDateTime({
                format: "YYYY-MM-DD HH:DD:SS.SSS"
            });            
            //데이터그리드 값 반복하여 저장 시도(병렬저장처리)
            const saveRequests = dataGridRowsValueRef.current.map((row) =>
                UseFetchParam({
                    procedure: "PDA_LOADING_FORMING_UPDATE_UTB_RES_S",
                    parameter: [
                        row.BARCODE,//@pBARCODE//완제품바코드
                        palletBarcodeValueRef.current,//@pPLT_NO//팔레트
                        getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", palletPackDateValueRef.current),//@pPACKDATE//팔레트적재시간
                        row.RPACKDATE,//@pRPACKDATE//각_제품_별_적재시간
                        executeLoadingClickDateTime,//@pQCDATE//등록버튼_클릭한_시간
                        row.MCORE,//@pLASER//엠코어(현장명칭은_엠코어)
                        '',//@@pHOTKNIFE//HOTKNIFE핫나이프여부(미사용)
                        row.SKIN,//@pSKIN//스킨
                        localStorage.getItem('userEmp'),//@p_save_by//저장자
                    ],
                    EventType: "save data",
                    EventName: "save loading forming Data",
                    isVoidProcedure: true,
                })
            );
            await Promise.all(saveRequests); //동시저장시도
            //반복문 종료 후, 실적 체크  (팔레트바코드 찍은 PACKDATE기준으로 정상등록여부체크)
            const result2 = await UseFetchParam({
                procedure:"PDA_LOADING_FORMING_RES_UPDATE_CHECK_S",//등록확인_후_문제시_롤백하는_프로시저
                parameter:[ 
                    palletBarcodeValueRef.current//@P_PLT_NO//팔레트번호
                    , getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", palletPackDateValueRef.current)//@P_PACKDATE//팔레트적재시간
                    , dataGridRowsValueRef.current.length//@P_PACK_COUNT//프론트페이지_적재수량
                ], 
                EventType:"check data and rollback",
                EventName:"check loading Forming, if false then null update",
                isVoidProcedure: true //조회결과는 없음
            })
            // 프린트 데이터 추가  (PSP_L_PRINT_DATA + PSP_S_PRINT_DATA_SAVE_PDA) 
            const savePrintDataFetchResult = await UseFetchParam({
                procedure:"PDA_LOADING_FORMING_PRINT_DATA_S",  // 프린트 적재 조회 및 저장
                parameter:[
                    palletBarcodeValueRef.current// 팔레트 번호
                    , localStorage.getItem("userEmp") // 저장자 
                    , dataGridRowsValueRef.current.length // 데이터그리드의 길이
                ], 
                EventType:"save data",
                EventName:"save load print data",
            })
            setPopup(`적재 성공`, `총 제품 갯수 ${savePrintDataFetchResult[0].PACK_COUNT}개 가 적재되었습니다.`);	
            onPageAllClear();
        }
        catch(err){
            setPopup('저장 에러', `${err}`);
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 초기화 버튼 이벤트 원본:btnClear_Click)  */
    const onPageAllClear = () => {
        try {
            setOnLoading(true);
            onClearInput(palletBarcodeInputRef, palletBarcodeValueRef);
            onClearInput(assemblyBarcodeInputRef, assemblyBarcodeValueRef);
            onClearInput(skinBarcodeInputRef, skinBarcodeValueRef);
            onClearInput(mcoreBarcodeInputRef, mcoreBarcodeValueRef);            
            expectedSkinPartNumberReference.current = '';
            setDataGridRows([]);
            setPalletPackDate(' ');
            setTextMaxCount(0);
            setBarcodeUsageFlags({skin: false, mcore: false});
            setColumnVisibilityModel(prev => ({
                ...prev,
                SKIN: false,
                MCORE: false,                
            }));
            onMoveFocus("PALLET")
        }
        catch(err){
            setPopup('초기화 에러', `${err}`);
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 텍스트필드 비우는 아이콘버튼 적용 함수 */
    const renderInputSlotProps = (inputRef) => {
        return {
            input: {
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="clear input"
                            onClick={() => {
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                }
                            }}
                            edge="end"
                        >
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                ),
            },
        };
    };

    return (
    <Stack gap={1} m={1}>
        <Stack gap={1} direction={"row"}> 
            <TextField
                label={'팔레트'}
                id={'BARCODE-PALLET'}
                onClick={onSaveClickedLocation}
                inputRef={palletBarcodeInputRef}
                size= {"small"}
                autoComplete={"off"}
                sx={{ flex: 1 }}
                inputProps={{ 
                    enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                    readOnly: isUseManualInputContext ? false : true,
                }}
                onKeyDown={(event) => {
                    if(event.key === 'Enter' && isUseManualInputContext){
                        onPalletBarcodeScan(event.target.value); 
                    }
                }}
                InputLabelProps={{ shrink: true }}
                slotProps={renderInputSlotProps(palletBarcodeInputRef)}
            />
            <TextField
                label={'적재시간'}
                value={palletPackDate}
                size= {"small"}
                inputProps={{ readOnly: true, }}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                    flex: 2 ,
                    backgroundColor: '#f0f0f0', 
                    color: '#555',
                }}
            />
        </Stack>
        <Stack gap={1} direction={"row"}>
            <TextField
                label={'완제품 바코드'}
                id={'BARCODE-ASSEMBLY'}
                onClick={onSaveClickedLocation}
                inputRef={assemblyBarcodeInputRef}
                size= {"small"}
                autoComplete={"off"}
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{
                    enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                    readOnly: isUseManualInputContext ? false : true,
                }}
                onKeyDown={(event) => {
                    if(event.key === 'Enter' && isUseManualInputContext ){
                        onAssemblyBarcodeScan(event.target.value);
                    }
                }}
                slotProps={renderInputSlotProps(assemblyBarcodeInputRef)}
            />
        </Stack>
        <Stack gap={1} direction={"row"}>
            <TextField
                label={ barcodeUsageFlags.skin ? 'SKIN' : '미사용' }
                id={'BARCODE-SKIN'}
                onClick={onSaveClickedLocation}
                inputRef={skinBarcodeInputRef}
                size= {"small"}
                autoComplete={"off"}
                sx= {{ backgroundColor: barcodeUsageFlags.skin ? undefined : "#f5f5f5" }}
                InputLabelProps={{ shrink: true }}
                fullWidth                
                inputProps={{ 
                    enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                    readOnly: isUseManualInputContext ? false : true,
                }}
                onKeyDown={(event) => {
                    if(event.key === 'Enter'  && isUseManualInputContext ){
                        onSkinBarcodeRead(event.target.value);
                    }
                }}
                slotProps={renderInputSlotProps(skinBarcodeInputRef)}
            />
            <TextField
                label={ barcodeUsageFlags.mcore ? 'MCORE' : '미사용' }
                id={'BARCODE-MCORE'}
                onClick={onSaveClickedLocation}
                inputRef={mcoreBarcodeInputRef}
                size= {"small"}
                autoComplete={"off"}
                sx= {{ backgroundColor: barcodeUsageFlags.mcore ? undefined : "#f5f5f5" }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{ 
                    enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                    readOnly: isUseManualInputContext ? false : true,
                    
                }}
                onKeyDown={(event) => {
                    if(event.key === 'Enter' && isUseManualInputContext){
                        onMcoreBarcodeRead(event.target.value);
                    }
                }}
                slotProps={renderInputSlotProps(mcoreBarcodeInputRef)}
            />
        </Stack>
        <CatDataGrid
            style={{height: 270, width:'100%'}}
            row={[...dataGridRows].reverse()}//입력의_역순으로_보이기
            col={[
                //실제 보여지는 컬럼
                { field: 'BARCODE', headerName: 'Barcode', width: 220,  },
                { field: 'SKIN', headerName: 'Skin', width: 150  },
                { field: 'MCORE', headerName: 'Mcore', width: 160 },                
                //데이터 저장용 컬럼
                { field: 'RPACKDATE', headerName: 'Date', width: 180 },
                { field: 'QCDATE', headerName: 'date2',  },
                { field: 'STOREDATE', headerName: 'date3', },
                { field: 'HOTKNIFE', headerName: 'Hot',  },
                { field: 'FLAG', headerName: 'flag', },
            ]}
            columnVisibilityModel={columnVisibilityModel}
        />         
        <Typography align="center"> COUNT : { dataGridRows.length }  /  MAX : { textMaxCount } </Typography> 
        <CatButtonBigOne
            buttonLabel={`적재`}
            onClick={onCommitDataRowsToDatabase}            
        />	
        <CatButtonBigOne
            buttonLabel={'초기화'}
            onClick={onPageAllClear}
        />
    </Stack>
    );
}