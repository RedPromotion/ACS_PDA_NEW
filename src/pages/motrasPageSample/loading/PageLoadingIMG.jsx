//리액트
import { useEffect, useState, useRef, useCallback, } from "react";
import { useRootContext } from '../../context/RootContext'
//api
import useFetch from '../../api/useFetch'
import UseFetchParam from '../../api/UseFetchParam'
import useFetchDateTime from '../../api/useFetchDateTime'
//mui
import { Stack, Typography, TextField, Grid, InputAdornment, IconButton, Button,
    Dialog, DialogContent, DialogTitle, Box,
} from '@mui/material';
//커스텀
import CatTextField from '../../components/CatTextField'
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import getDateTimeFormat  from "../../functions/getDateTimeFormat";
//아이콘
import KeyboardIcon from '@mui/icons-material/Keyboard';
/*******************************************************************************************
@Procedure
팔레트 : 
    PDA_LOADING_PALLET_BARCODE_L
IMG제품 : 
    PDA_LOADING_IMG_BARCODE_MAPPING_L
메인프레임: 
    PSP_L_LOADING_MAINFRAME_CHECK
세이브 : 
    PDA_LOADING_IMG_BARCODE_CHECK_BEFORE_SAVE_L : IMG바코드 검사
    PSP_S_LOADING_UTB_RES : 실제 등록 (갯수만큼 반복)
    PDA_LOADING_UTB_RES_CHECK_S : 저장 갯수 체크 (문제시 롤백하는 프로시저)
    PDA_LOADING_PRINT_DATA_S : 프린트 데이터 만들기 
*******************************************************************************************/
/*******************************************************************************************
@verison   
DATE        AUTHOR              DESCRIPTION
----------	---------------		------------------------------- 
2024-12-26	sj_hong				프로그램 배포
2025-05-09  sj_hong             리팩토링 (vite+SWC전환), 인덱스드디비 제거
2025-05-23  sj_hong             페이지 테스트 완료, 데이터그리드 최신이 위로 가도록 순서 변경
2025-05-26  sj_hong             현장 개별 테스트 완료, 프로미스 올 병렬처리
2025-06-10  sj_hong             IMG바코드 체크 함수 에러 체크 수정
2025-06-12  sj_hong             팔레트에 선 적재 된 바코드 대상을 플래그 값으로 구분하여 검사 면제처리
2025-06-13  sj_hong             바코드 수동입력 기능추가 (수동입력시 IMG바코드 체크 진행함), Ref위주로 변경
*******************************************************************************************/
/*******************************************************************************************
@Page PageLoadingIMG.jsx
@Role Motras PDA > 적재 > IMG적재관리 페이지 
@description - 사용빈도 매우 높은 페이지, 거의 매일 사용
*******************************************************************************************/
export default function PageLoadingIMG() {

    const {
        setPopup, setOnLoading,
        isTopBarVisible, setIsTopBarVisible,        
    } = useRootContext();

    //위치지정Ref
    const palletTextFieldInputRef = useRef(null);//팔레트바코드_텍스트필드_위치_참조
    const IMGTextFieldInputRef = useRef(null);//IMG바코드_텍스트필드_위치_참조
    const MainFrameTextFieldInputRef = useRef(null);//메인프레임바코드_텍스트필드_위치_참조
    const manualBarcodeInputRef = useRef(null);//수동입력바코드_텍스트필드_위치_참조

    //값저장Ref
    const scanLocationRef = useRef('BARCODE-PALLET');//입력될포커스위치저장
    const palletBarcodeValueRef = useRef('');//팔레트바코드_값저장
    const IMGBarcodeValueRef = useRef('');//IMG바코드_값저장
    const MainFrameBarcodeValueRef = useRef('');//메인프레임바코드값저장
    const currentPartNoRef = useRef('');//IMG바코드의_파트넘버저장
    const currentAlcCodeRef = useRef('');//IMG바코드의_ALC코드저장
    const isUseMainFrameBarcodeRef = useRef(false);//메인프레임바코드_값저장

    //팔레트적재시간
    const [palletPackDate, setPalletPackDate] = useState('');
    const palletPackDateRef = useRef('');
    useEffect(() => { palletPackDateRef.current = palletPackDate }, [palletPackDate]);

    //데이터그리드 값 자료
    const [dataRows, setDataRows] = useState([]);
    const dataRowsRef = useRef('');
    useEffect(() => { dataRowsRef.current = dataRows }, [dataRows]);

    //팔레트 최대 적재 수량 
    const [maxLoadingCount, setMaxLoadingCount] = useState(0);
    const maxLoadingCountRef = useRef(0);
    useEffect(() => { maxLoadingCountRef.current = maxLoadingCount }, [maxLoadingCount]);

    //키보드 수동 입력 여부 상태값
    const [isShowManualBarcodeInput, setIsShowManualBarcodeInput] = useState(false);
    const [manualInputTarget, setManualInputTarget] = useState('');

    // 네이티브 메시지 콜백 
    const onMessage = useCallback((event) => {
        onReadDataFromNative(event); // WebView에서 받아온 데이터 읽기
    }, []);

    useEffect(() => { 
        //탑바 없으면 다시 부르기
        if(!isTopBarVisible){setIsTopBarVisible(true)}
        // 초기 팔레트 바코드 포커스
        onMoveFocus('PALLET') 
        //네이티브 기능 불러오기
        document.addEventListener('message', onMessage);
        return () => {
            document.removeEventListener('message', onMessage);
        }
    }, []);

    useEffect(() => {
        //수동입력팝업 열린 이후 포커스 이동하는 루틴
        if (isShowManualBarcodeInput) {
            setTimeout(() => {
                manualBarcodeInputRef.current?.focus();
            }, 100);
        }
    }, [isShowManualBarcodeInput]);

    /** 네이티브에서 올려주는 값 받기 */
    const onReadDataFromNative = (e) => {
        const type = JSON.parse(e.data).type;
        if (type === 'SCANDATA') {
            const { scannedData } = JSON.parse(e.data);
            //바코드읽기
            if (scanLocationRef.current === 'BARCODE-PALLET') {
                onScanBarcodePallet(scannedData.data);
            }
            else if (scanLocationRef.current === 'BARCODE-IMG') {
                onScanBarcodeIMG(scannedData.data);
            }
            else if (scanLocationRef.current === 'BARCODE-MAINFRAME') {
                onScanBarcodeMainFrame(scannedData.data);
            }
        }
        if (type === 'GET_WIFI_CURRENT_SIGNAL_STRENGTH') {
            const { wifiCurrentSignalStrength } = JSON.parse(e.data);
            if (wifiCurrentSignalStrength <= -85) {
                setPopup('무선랜 신호가 약하거나 끊겼습니다.');
                return
            }
        }
    }

    /** 네이티브앱에서 기준삼을 바코드 텍스트필드의 아이디 값 저장 */
    const onCaptureTextFieldIdForNative = (e) => {        
        scanLocationRef.current = e.target.id; // 구분 기준 플래그 값 부여
    }

    /** 특정 ID 문자열에 따라 포커스를 해당 컴포넌트로 이동시킨다.     
     * @param {'PALLET' | 'IMG' | 'MAINFRAME'} idRef 포커스를 이동할 대상 식별자.
    */
    const onMoveFocus = ( idRef ) => {
        const idRefUpper = idRef.toUpperCase()
        if(!idRefUpper){
            setPopup('포커스 에러', `이동 대상 미지정`);
            return
        }
        else if( idRefUpper === 'PALLET' && palletTextFieldInputRef.current ){
            palletBarcodeValueRef.current = '';
            palletTextFieldInputRef.current.value = '';
            palletTextFieldInputRef.current.focus();
            scanLocationRef.current = 'BARCODE-PALLET';
        }
        else if( idRefUpper === 'IMG' && IMGTextFieldInputRef.current ){
            IMGBarcodeValueRef.current = '';
            IMGTextFieldInputRef.current.value = '';
            IMGTextFieldInputRef.current.focus();
            scanLocationRef.current = 'BARCODE-IMG';
        }
        else if( idRefUpper === 'MAINFRAME' && MainFrameTextFieldInputRef.current ){
            MainFrameBarcodeValueRef.current = '';
            MainFrameTextFieldInputRef.current.value = '';
            MainFrameTextFieldInputRef.current.focus();
            scanLocationRef.current = 'BARCODE-MAINFRAME';
        }
        else {
            setPopup('포커스 에러', `${idRefUpper}로 이동실패`);
        }
    }

    /** 팔레트 스캔 */
    const onScanBarcodePallet = async ( scannedBarcode )=> { 
        try{
            setOnLoading(true);            
            if( !scannedBarcode ){
                setPopup('팔레트 바코드 오류', '팔레트 바코드가 입력되지 않았습니다.');
                onMoveFocus("PALLET")                
                return
            }
            if( scannedBarcode.trim().length !== 5  ){
                
                setPopup('팔레트 바코드 오류', 'PALLET NO 타입 오류');
                onMoveFocus("PALLET")                
                return
            }
            const fetchResult = await useFetch({
                procedure:"PDA_LOADING_PALLET_BARCODE_L", //팔레트 검사 프로시저
                parameter:[ scannedBarcode ],  //팔레트 바코드
                EventType:"Barcode read",
                EventName:"IMG PALLET barcode Read",
            })
            /*
                //바코드팔레트결과_메모
                fetchResult[0] 배열에 최대값, DB에서 보내는 날짜, 메인프레임 사용 여부 등 플래그 값 보냄
                fetchResult[1] 배열에 작업하던 팔레트 조회 결과 있는지 출력함
            */
            if( !fetchResult[0][0].DB_DATE ){
                onMoveFocus("PALLET")
                setPopup('팔레트 정보 오류', '적재일자 수신 실패.');                
                return
            }
            if( !fetchResult[0][0].MAXCNT ){
                onMoveFocus("PALLET")
                setPopup('팔레트 정보 오류', '팔레트 최대 적재수량 수신 실패.');                
                return
            }

            //조회된 값 저장 (0번 배열, 첫번째)            
            palletBarcodeValueRef.current = scannedBarcode;
            palletTextFieldInputRef.current.value = scannedBarcode;
            setPalletPackDate( getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS",fetchResult[0][0].DB_DATE) );
            setMaxLoadingCount( fetchResult[0][0].MAXCNT );

            //데이터그리드 초기화
            setDataRows([])

            //팔레트에 적재된 정보 있으면 표에 추가해서 이어서 진행 (1번 배열, 두번째)
            if( fetchResult[1].length >= 1 && fetchResult[1][0].BARCODE ){
                setDataRows(
                    fetchResult[1].map(item => ({
                        BARCODE: item.BARCODE,
                        RPACKDATE: item.RPACKDATE ? getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", item.RPACKDATE) : '',
                        QCDATE: item.QCDATE ? getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", item.QCDATE) : '',
                        STOREDATE: item.STOREDATE ? getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", item.STOREDATE) : '',
                        LASER: '',
                        HOTKNIFE: '',
                        SKIN_BARCODE: '',
                        clmFlag: '1',
                        MAINFR_BARCODE: item.MAINFR_BARCODE,
                        PART_NO: item.PART_NO,
                        ALC_CODE: item.ALC_CODE,
                        isInspectedBefore: true//데이터표에_입력된_바코드의_검사여부_구분값(2025.06.12.hsj추가)
                    }))
                )
            }
                        
            // 팔레트 입력 성공 시, 적재 바코드 입력으로 이동
            onMoveFocus("IMG")
        }
        catch(error){
            setPopup('팔레트 에러', `${error}`);
            setPalletPackDate(' ');
            palletBarcodeValueRef.current = '';
            palletTextFieldInputRef.current.value = '';
            onMoveFocus("PALLET")
        }
        finally{
            setOnLoading(false);            
        }
    }

    /** IMG 스캔 */
    const onScanBarcodeIMG = async ( scannedBarcode ) => {
        try{
            setOnLoading(true);
             if( !palletBarcodeValueRef.current ){
                setPopup('적재 바코드 오류', '팔레트 바코드가 아직 입력되지 않았습니다.');
                onMoveFocus("PALLET");
                return
            }
            if( !scannedBarcode ){
                setPopup('적재 바코드 오류', '적재 바코드가 입력되지 않았습니다.');
                onMoveFocus("IMG");
                return
            }
            if ( dataRowsRef.current.length >= maxLoadingCountRef.current ) { // 수량적재 초과 체크
                setPopup(`적재 초과 불가`, `${maxLoadingCountRef.current}개 이상 적재불가`);
                onMoveFocus("IMG");
                return
            }

            const fetchResult = await useFetch({
                procedure:"PDA_LOADING_IMG_BARCODE_MAPPING_L",//최소한의 바코드 검사만 하는 IMG 바코드 리딩 프로시저, 진짜 검사는 등록에서함 
                parameter:[ scannedBarcode ],  //적재바코드 (매트릭스 바코드 변환 전)
                EventType:"barcode scan",
                EventName:"IMG Loading Barcode Scan and Check",
            })

            // 중복 바코드 조회실패
            if( !fetchResult[0][0].BARCODE ) {
                setPopup(`바코드 조회 에러`, `조회할 수 없는 IMG 바코드입니다.`)
                onMoveFocus("IMG");
                return
            }
            // 중복 바코드 예외처리            
            if( dataRowsRef.current.some(row => row.BARCODE === fetchResult[0][0].BARCODE) ) {
                setPopup(`중복 스캔 오류`, `이미 처리된 제품입니다. ${fetchResult[0][0].BARCODE}`)
                onMoveFocus("IMG");
                return
            }            
            // 반제품과 완제품 혼합 예외처리
            const mismatchRow = dataRowsRef.current.find(row => row.PART_NO !== fetchResult[0][0].PART_NO);
            if (mismatchRow) {
                setPopup(
                    `혼합 적재 오류`,
                    `바코드 ${fetchResult[0][0].BARCODE} 반제품/완제품은 혼합 불가. [${mismatchRow.PART_NO}/${fetchResult[0][0].PART_NO}]`
                );
                onMoveFocus("IMG");
                return;
            }
            // ALC 코드 불일치
            const mismatchAlcRow = dataRowsRef.current.find(row => row.ALC_CODE !== fetchResult[0][0].ALC_CODE);
            if (mismatchAlcRow) {
                setPopup(
                    `혼합 적재 오류`,
                    `바코드 ${fetchResult[0][0].BARCODE} ALC Code가 다릅니다. [${mismatchAlcRow.ALC_CODE}/${fetchResult[0][0].ALC_CODE}]`
                );
                onMoveFocus("IMG");
                return;
            }
            // 신규 반제품 여부 플래그 값 설정 체크
            if( fetchResult[0][0].IS_USE_MAINFRAME_BARCODE !== 'Y' && fetchResult[0][0].IS_USE_MAINFRAME_BARCODE !== 'N' ){
                setPopup(
                    `반제품 여부`, 
                    `반제품 여부가 불확실합니다. 관리자에게 문의해주세요.[반제품여부:${fetchResult[0][0].IS_USE_MAINFRAME_BARCODE}]`
                )
                onMoveFocus("IMG");
                return;
            }

            //수동입력일 경우 IMG 바코드 타당성 검사 진행 (수동입력오류가능성은 높으니 검사 실시)        
            if( isShowManualBarcodeInput ){
                await useFetch({
                    procedure: "PDA_LOADING_IMG_BARCODE_CHECK_BEFORE_SAVE_L",
                    parameter: [
                        fetchResult[0][0].BARCODE,//IMG바코드
                        palletBarcodeValueRef.current,//팔레트바코드
                    ],
                    EventType: "barcode check",
                    EventName: "IMG barcode check before save",                    
                })                
            }

            // 값저장
            IMGTextFieldInputRef.current.value = fetchResult[0][0].BARCODE;
            IMGBarcodeValueRef.current = fetchResult[0][0].BARCODE;
            currentPartNoRef.current = fetchResult[0][0].PART_NO;
            currentAlcCodeRef.current = fetchResult[0][0].ALC_CODE;            
            isUseMainFrameBarcodeRef.current = fetchResult[0][0].IS_USE_MAINFRAME_BARCODE === 'Y' ? true : false

            //분기에 따라 다음 처리 진행
            if( isUseMainFrameBarcodeRef.current ){ 
                onMoveFocus("MAINFRAME");
            }
            else{ 
               onRegistBarcodeToDataGrid();
            }
        }
        catch(error){
            setPopup('IMG 에러', `${error}`);
            onMoveFocus("IMG");
        }
        finally{
            setOnLoading(false);            
        }
    }

    /** 메인프레임 스캔 */
    const onScanBarcodeMainFrame = async ( scannedBarcode ) => {
        try{
            setOnLoading(true);
            if( !isUseMainFrameBarcodeRef.current ){
                setPopup('바코드 에러', '해당 적재는 메인프레임 바코드를 사용하지 않습니다.')
                onMoveFocus("IMG")
                return
            }
            if( !scannedBarcode ){
                setPopup('바코드 에러', `메인프레임 바코드가 입력되지 않았습니다.`);
                onMoveFocus("MAINFRAME")
                return
            }
            if( !IMGBarcodeValueRef.current ){
                setPopup('바코드 에러', `IMG바코드가 입력되지 않았습니다.`);
                onMoveFocus("IMG")
                return
            }
            const fetchResult = await useFetch({
                procedure:"PSP_L_LOADING_MAINFRAME_CHECK", // 메인프레임 바코드 리딩 프로시저 (매핑전환)
                parameter:[
                    palletBarcodeValueRef.current//팔레트바코드 (프로시저 내에서 사용하진 않음.)
                    , IMGBarcodeValueRef.current //IMG바코드 (메인프레임바코드와 같은지만 비교함)
                    , scannedBarcode //메인프레임바코드
                ]
            })
            if( !fetchResult[0][0].MAINFR_SERIAL ){      
                onMoveFocus("MAINFRAME");
                setPopup('바코드 에러', `메인프레임 바코드 조회 실패`)
                return
            }

            //결과에대한_처리
            if( fetchResult[0][0].OKNG === 'NG' ){
                onMoveFocus("MAINFRAME");
                setPopup('바코드 에러', '적재불가 메인프레임.')
                return
            }            
            else if( fetchResult[0][0].OKNG === 'OK' ){                
                MainFrameBarcodeValueRef.current = fetchResult[0][0].MAINFR_SERIAL;
                MainFrameTextFieldInputRef.current.value = fetchResult[0][0].MAINFR_SERIAL;
                onRegistBarcodeToDataGrid();
            }
            else{ //기타 예외처리 (여기 타면 안됨)
                onMoveFocus("MAINFRAME");
                setPopup('바코드 에러', '에러가 발생하였습니다.')
                return
            }
        }
        catch(error){
            setPopup('메인프레임 에러', `${error}`);
        }
        finally{
            setOnLoading(false);
            
        }
    }

    /** 현재까지 입력된 바코드 데이터 데이터표에 추가하기 */
    const onRegistBarcodeToDataGrid = async () => {
        try{
            setOnLoading(true);
            //초과적재 예외처리
            if ( dataRowsRef.current.length >= Number(maxLoadingCountRef.current)  ) {
                onMoveFocus("IMG");
                setPopup(`적재 초과`, `${maxLoadingCountRef.current}개 이상 적재불가`)
                return
            }
        
            //데이터표 등록을 위한 서버 시간 휙득 
            const nowDatabaseTime = await useFetchDateTime({format: "YYYY-MM-DD HH:DD:SS.SSS"});
            setDataRows((prevGridData) => [
                ...prevGridData,
                {
                    BARCODE			: 	IMGBarcodeValueRef.current
                    ,RPACKDATE		: 	nowDatabaseTime //현재시간
                    ,QCDATE			: 	'' // IMG적재 바코드 찍을때에 UTB_RES테이블 조회하면 값 찾을 수 있으나, 원본CS에 공백줘서 동일하게 처리
                    ,STOREDATE		: 	'' // IMG적재 바코드 찍을때에 UTB_RES테이블 조회하면 값 찾을 수 있으나, 원본CS에 공백줘서 동일하게 처리
                    ,LASER			: 	'' //발포적재에서 사용하는 컬럼
                    ,HOTKNIFE		: 	'' //발포적재에서 사용하는 컬럼
                    ,SKIN_BARCODE	: 	'' //발포적재에서 사용하는 컬럼
                    ,clmFlag		: 	'0'
                    ,MAINFR_BARCODE	: 	isUseMainFrameBarcodeRef.current === true ? MainFrameBarcodeValueRef.current : '' 
                    ,PART_NO		: 	currentPartNoRef.current
                    ,ALC_CODE		: 	currentAlcCodeRef.current
                    ,isInspectedBefore : false//데이터표에_입력된_바코드의_검사여부_구분값(2025.06.12.hsj추가)
                }
            ])

            //입력 받을 값 초기화 후 포커스 이동
            IMGBarcodeValueRef.current = '';
            IMGTextFieldInputRef.current.value = '';
            MainFrameBarcodeValueRef.current = '';
            MainFrameTextFieldInputRef.current.value = '';
            currentPartNoRef.current = '';
            currentAlcCodeRef.current = '';
            onMoveFocus("IMG");
        }
        catch(error){
            setPopup('등록 에러', `${error}`);
        }
        finally{
            setOnLoading(false);            
        }
    }

    /** 현재까지의 데이터를 실제 데이터베이스에 저장 */
    const onCommitDataToDatabase = async () => {
        try{            
            setOnLoading(true);
            if( !palletBarcodeValueRef.current ){
                onMoveFocus("PALLET")
                setPopup('적재 불가', `적재할 팔레트가 선택되지 않았습니다..`)
                return
            }
            if( dataRowsRef.current.length === 0 ){ // 적재 찍은 게 없으면 예외처리
                onMoveFocus("IMG")
                setPopup('적재 불가', `적재할 대상이 없습니다. 내용을 등록해주세요.`)
                return
            } 
            if ( dataRowsRef.current.length > Number(maxLoadingCountRef.current) ) { // 수량적재 초과 체크 (등록시에는 수량이 같은건 통과)
                onMoveFocus("IMG")
                setPopup(`적재 초과`, `${maxLoadingCountRef.current}개 이상 적재불가`)
                return
            }

            //저장 시에 몰아서 하는 IMG바코드 적합성 검사(병렬처리)
            const imgBarcodesCheckRequests = dataRowsRef.current
            .filter((row) => row.isInspectedBefore !== true)//이전에 검사되지 않았다면 모두 검사 대상으로 처리
            .map((row) =>
                UseFetchParam({
                    procedure: "PDA_LOADING_IMG_BARCODE_CHECK_BEFORE_SAVE_L",
                    parameter: [
                        row.BARCODE,//IMG바코드
                        palletBarcodeValueRef.current,//팔레트바코드
                    ],
                    EventType: "barcode check",
                    EventName: "IMG barcode check before save",
                    isVoidProcedure: true,
                })
            );
            await Promise.all(imgBarcodesCheckRequests);//병렬저장처리

           //데이터저장(병렬저장처리)
           const serverDateTime = await useFetchDateTime({format: "YYYY-MM-DD HH:DD:SS.SSS"})
           const saveRequests = dataRowsRef.current.map((row) =>
                UseFetchParam({
                    procedure: "PSP_S_LOADING_UTB_RES",
                    parameter: [
                        row.BARCODE,//@pBARCODE//IMG바코드
                        palletBarcodeValueRef.current,//@pPLT_NO//팔레트바코드
                        palletPackDateRef.current,//@pPACKDATE//팔레트적재시간
                        row.RPACKDATE,//@pRPACKDATE//각_IMG바코드_적재시간
                        serverDateTime,//@pQCDATE//개별_저장시간
                        row.LASER,//@pLASER//실제로는엠코어(미사용)(발포적재에서사용하는값)
                        row.HOTKNIFE,//@pHOTKNIFE//핫나이프(미사용)(발포적재에서사용하는값)
                        row.SKIN_BARCODE,//@pSKIN//스킨바코드(미사용)(발포적재에서사용하는값)
                        row.MAINFR_BARCODE,//@pMAINFRAME//메인프레임바코드
                        localStorage.getItem('userEmp')//@p_save_by//저장한사람
                    ],
                    EventType: "save data",
                    EventName: "save loading IMG Data",
                    isVoidProcedure: true,
                })
            );
            await Promise.all(saveRequests);//병렬저장처리

            //저장 후에 저장확인검사 실적재체크
            const result3 = await UseFetchParam({
                procedure:"PDA_LOADING_UTB_RES_CHECK_S", // 적재 등록 수량 비교 검사 후 문제시 롤백하는 프로시저
                parameter:[ 
                    palletBarcodeValueRef.current// 팔레트번호
                    , palletPackDateRef.current// 적재일자 , 팔레트 바코드 찍은 날짜시간 (적재수량검사 프로시저에서 검사기준으로 삼으니 값 일치해야함)
                    , dataRowsRef.current.length // PDA프론트화면에서 처리한 바코드의 갯수
                ],
                EventType:"check data and rollback",
                EventName:"check loading IMG, if false then null update",
            })
            // 불일치 감지 시 알림, 롤백은 이미 동작함
            if ( result3[0].RESULT === 'N' ) {
                setPopup('등록 실패',  `${ result3[0].MESSAGE ? result3[0].MESSAGE : '바코드 수량과 실 적재 수량이 다릅니다. 다시 적재해 주십시오' }`)
                return
            }
            //성공데이터기반_프린트출력정보생성
            const fetchPrintDataResult = await UseFetchParam({
                procedure:"PDA_LOADING_PRINT_DATA_S",  // 프린트 적재 조회 및 저장
                parameter:[
                    palletBarcodeValueRef.current// 팔레트 번호
                    , localStorage.getItem("userEmp") // 저장자
                    , dataRowsRef.current.length // 데이터그리드의 길이
                ], 
                EventType:"save data",
                EventName:"save load print data",
            })
            setPopup(`적재 성공`, `총 제품 갯수 ${fetchPrintDataResult[0].PACK_COUNT}개 가 적재되었습니다.`);  
            onPageClearAll();
        }
        catch(error){
            setPopup('저장 에러', `${error}`);
        }
        finally{
            setOnLoading(false);
        }
    }

    /** 페이지 초기화 */
    const onPageClearAll = () => {
        //팔레트입력초기화
        palletBarcodeValueRef.current = '';
        palletTextFieldInputRef.current.value = '';
        setPalletPackDate('');
        //IMG_관련_입력_초기화
        IMGBarcodeValueRef.current = '';
        IMGTextFieldInputRef.current.value = '';
        currentPartNoRef.current = '';
        currentAlcCodeRef.current = '';
        //메인프레임입력초기화
        MainFrameBarcodeValueRef.current = '';
        MainFrameTextFieldInputRef.current.value = '';
        isUseMainFrameBarcodeRef.current = false;
        //데이터 표 초기화
        setDataRows([]);
        setMaxLoadingCount(0);  
        //포커스이동
        onMoveFocus("PALLET")
    }

    /* 수동입력 팝업창 구성 */
    const RenderKeyboardManualInputpopup = () => {
        const [manualInputValue, setManualInputValue] = useState('');
        const buttonStyle = { height: 50, fontSize: 24 }
        /*바코드 수동입력 동작함수*/
        const handleManualBarcodeInput = () => {
            if(!manualInputTarget){
                return
            }
            switch (manualInputTarget) {
                case '팔레트':
                    onScanBarcodePallet(manualInputValue);
                    break;
                case 'IMG':
                    onScanBarcodeIMG(manualInputValue);
                    break;
                case '메인프레임':
                    onScanBarcodeMainFrame(manualInputValue);
                    break;
                default:
                    setPopup('알 수 없는 입력 대상:', `${manualInputTarget}`);
            }
            // 입력 후 초기화 및 닫기
            setManualInputValue('');
            setIsShowManualBarcodeInput(false);
        };
        //바코드 수동입력 팝업 구현
        return(
            <Dialog
                open={isShowManualBarcodeInput}
                fullWidth
                keepMounted                
                PaperProps={{
                    sx: {
                        position: 'absolute',
                        top: '70px', // 원하는 위치로 고정
                        left: '50%',
                        transform: 'translateX(-50%)', // 수평 중앙
                        m: 0,
                    },
                }}                
            >
                <DialogTitle>{`${manualInputTarget}바코드 수동 입력`}</DialogTitle>
                <DialogContent>
                    <Box display="grid" m={1} gap={1}>
                        <TextField
                            label={`${manualInputTarget} 바코드 수동 입력`}
                            inputRef={manualBarcodeInputRef}
                            value={manualInputValue}
                            autoComplete="off"
                            onChange={(e) => setManualInputValue(e.target.value)}
                            inputProps={{ enterKeyHint: 'done' }}
                            InputLabelProps={{ shrink: true }}
                            onKeyDown={
                                (event)=>{
                                    if(event.key === 'Enter'){
                                        event.preventDefault();
                                        handleManualBarcodeInput()
                                    }
                                }
                            }
                        />
                        <Button
                            variant="contained"
                            fullWidth
                            sx={buttonStyle}
                            color={'primary'}
                            onClick={handleManualBarcodeInput}
                        >
                            {'입력'}
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={buttonStyle}
                            color={'warning'}
                            onClick={() => {setIsShowManualBarcodeInput(false)}}
                        >
                            {'취소'}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        )
    }

    return (
    <Stack m={1}>
        <Grid container spacing={1} mb={1}>
            <Grid size={4}>
                <TextField
                    label={"팔레트"}
                    id={'BARCODE-PALLET'}
                    inputRef={palletTextFieldInputRef}
                    autoComplete="off"
                    size= {"small"}
                    fullWidth     
                    onClick={onCaptureTextFieldIdForNative}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ 
                        enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                        readOnly: true
                    }}
                    slotProps={
                        {input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {
                                            setManualInputTarget('팔레트')
                                            setIsShowManualBarcodeInput(true)}
                                        }
                                    >
                                        <KeyboardIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Grid>
            <Grid size={8}>
                 <CatTextField
                    label={"팔레트 적재시간"}
                    value={palletPackDate}
                    size= {"small"}
                    readOnly={true}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                        backgroundColor: '#f0f0f0', 
                        color: '#555',
                    }}                    
                />
            </Grid>
        </Grid>
        <Stack gap={1} mb={1} direction={'row'}>
            <TextField
                label={"IMG 바코드"}
                id={'BARCODE-IMG'}
                inputRef={IMGTextFieldInputRef}
                onClick={onCaptureTextFieldIdForNative}
                autoComplete={"off"}
                size= {"small"}
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{ 
                    enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                    readOnly: true
                }}
                slotProps={
                    {input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => {
                                        setManualInputTarget('IMG')
                                        setIsShowManualBarcodeInput(true)}
                                    }
                                >
                                    <KeyboardIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </Stack>
        <Stack gap={1} mb={1} direction={'row'}>
            <TextField
                label={"메인프레임 바코드"}
                id={'BARCODE-MAINFRAME'}
                inputRef={MainFrameTextFieldInputRef}
                onClick={onCaptureTextFieldIdForNative}
                autoComplete={"off"}
                InputLabelProps={{ shrink: true }}
                size= {"small"}
                fullWidth
                inputProps={{ 
                    enterKeyHint: 'done',//모바일_키보드에서_'완료'_표시
                    readOnly: true
                }}
                slotProps={
                    {input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => {
                                        setManualInputTarget('메인프레임')
                                        setIsShowManualBarcodeInput(true)}
                                    }
                                >
                                    <KeyboardIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </Stack>
         <Stack mb={1} >
            <CatDataGrid
                row={[...dataRows].reverse()} //최신순정렬
                col={[
                    { field: 'BARCODE', headerName: 'Barcode', width: 220, }, //1 원본 clmBarcode
                    { field: 'RPACKDATE', headerName: '적재일자', width: 190, }, //2 원본 clmRPackDate Date
                    { field: 'QCDATE', headerName: 'QC검사일자', width: 190, },	//3 원본 clmQCDate date2
                    { field: 'STOREDATE', headerName: '적재일자', width: 190, },	//4 원본 clmStoreDate date3
                    { field: 'LASER', headerName: '레이져스콜링바코드', width: 100, },	//5 원본 clmLaser  Mcore
                    { field: 'HOTKNIFE', headerName: 'HOTNIFE코드', width: 100, },	//6 원본 clmGotKnife Hot 
                    { field: 'SKIN_BARCODE', headerName: '스킨바코드', width: 100, },	//7 원본 clmSkin Skin
                    { field: 'clmFlag', headerName: 'flag', width: 100, },	//8 원본 clmFlag
                    { field: 'MAINFR_BARCODE', headerName: '메인프레임', width: 150, },	//9 원본 MainFrame
                    { field: 'PART_NO', headerName: '제품PART번호', width: 130, },	 //10 원본 PART_NO
                    { field: 'ALC_CODE', headerName: '차종_코드', width: 100, }, //11 원본 ALC_CODE	
                ]}                
                style={{height: 260, width:'100%'}}
                initialState={{
                    columns: {
                        columnVisibilityModel: { //특정컬럼 숨기기
                            id: false, 
                            RPACKDATE: false,
                            QCDATE: false,
                            STOREDATE: false,
                            LASER: false,
                            HOTKNIFE: false,
                            SKIN_BARCODE: false,
                            clmFlag: false,
                            PART_NO: false,
                            ALC_CODE: false,
                        }
                    }
                }}
            />
        </Stack>
        <Stack mb={1} gap={1} direction={'row'} alignSelf={"center"}>
            <Typography> COUNT : { dataRows.length }  /  MAX : { maxLoadingCount } </Typography> 
        </Stack>
        <Stack gap={1} mb={1} direction={'column'}>
            <CatButtonBigOne 
                buttonLabel="적재"
                onClick={onCommitDataToDatabase}
            />
            <CatButtonBigOne
                buttonLabel="초기화" 
                onClick={onPageClearAll}
            /> 
        </Stack>
        <RenderKeyboardManualInputpopup/>
    </Stack>
    )
}