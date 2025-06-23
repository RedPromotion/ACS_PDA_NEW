import { useEffect, useState, useRef, useCallback, } from "react";
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
@Page PageStockIn.jsx
@Role Motras PDA > 출하 > 입고 페이지
@description 적재 관리 페이지에서 적재된 대상을 입고처리하는 페이지 (적재페이지에서 적재가 되어야 조회가능 )
*******************************************************************************************/
export default function PageStockIn() {

	const { 
		setPopup, setOnLoading,
		isTopBarVisible, setIsTopBarVisible,
	} = useRootContext();

    const [isMainPage, setIsMainPage] = useState(true); // 참값: 메인바코드조회페이지 , 거짓: 팔레트_상세정보페이지

	//입고 화면 팔레트 데이터그리드 값
	const [gridInputPallet, setGridInputPallet] = useState({
		columns : [
			{field: 'id', headerName: '', hide: true, width: 0,},
			{field: '팔렛트번호', headerName: '팔렛트 번호', width: 130,},
			{field: '적재일자', headerName: '적재 일자', width: 200,},
		],
		rows : [],
		openDetail : "",
	});
	const [selectedInputPallet, setSelectedInputPallet] = useState({
		type: 'include',
		ids: new Set(),
	}); 
	// 선택한 입고 대상 팔레트

	// 팔레트 적재 품목 상세 리스트 보여주는 페이지의 데이터 값
	const [gridPackedPart, setGridPackedPart] = useState({
		columns : [
			{field: 'id', headerName: 'id',  hide: true },
			{field: '바코드', headerName: '바코드',  width: 220 },
			{field: '품번', headerName: '품번', width: 150 },
			{field: '생산일자', headerName: '생산일자', width: 210 },
			{field: '적재일자', headerName: '적재일자', width: 210 },
		],
		rows : [],
		selected: {
            type: 'include',
            ids: new Set(), 
        },
	});

    useEffect(() => {
		if(!isTopBarVisible){setIsTopBarVisible(true)}
		onInputRefreshList(); // 페이지 로드 시 입고 조회 1회 자동실시
	}, []);

    
	/** 입고 화면에서 새로고침 클릭 시, 입고 품목 보여주기 */
	const onInputRefreshList = async ()=> {				
		try {
			setOnLoading(true);	
			const result = await UseFetchParam({ //result에 값 저장
				api: "GENERAL",
				procedure:"PSP_L_CHULHA_STORED_PLT_LIST",  //출하 입고 대상 팔레트 조회 
				parameter: ['1'],  //매개변수 부여하나 프로시저에서는 사용하지 않음
				EventType:"load data",
				EventName:"load shipment Stored Pallet List",
			});	
			//입고할 팔레트 없는 예외조건
			if( result[0].팔렛트번호 === ''){ 
				setPopup('입고 조회 결과', `조회된 입고 팔레트가 없습니다.`);
				return;
			}
			//입고 대상 팔레트 조회결과 출력
			setGridInputPallet({
				...gridInputPallet,
				rows: result.map(data => ({
					id: data['팔렛트번호'],
					팔렛트번호: data['팔렛트번호'],
					적재일자: data['적재일자'],
				}))
			})
		} 
		catch (err) {	
			setPopup('입고 조회 실패', `입고할 팔레트 조회에 실패했습니다. ${err}`);
		} 
		finally {
			setOnLoading(false)
		}		
	}


	/** 입고화면 상태에서, 팔레트 클릭 시, 입고팔레트 상세 정보 보는 이벤트 */
	const oninputOnClickGridCell = (params)=> {
		 // 조회된 내용이 없는 경우
		if(gridInputPallet.rows.length === 0  ){ 
			return; // 알림없이 동작만 안함
		}
		setOnLoading(true);
		(async () => {				
			try {
				const result = await UseFetchParam({
					procedure:"PSP_L_CHULHA_STORED_PART_LIST", 
					parameter: [ params.row.팔렛트번호 ],
					EventType:"load data",
					EventName:"loda shipment stored data by pallet",
				});	
				setGridPackedPart(prevState => ({ 
					...prevState, 
					rows: result.map(data => ({					  
					  id: data['바코드'] ,
					  바코드: data['바코드'] ,
					  품번: data['품번'] ,
					  생산일자: data['생산일자'] ,
					  적재일자: data['적재일자'] ,					  
					}))
				}));				
				setGridInputPallet({
					...gridInputPallet
					, openDetail: params.row.팔렛트번호
				})
				setIsMainPage(false); //팔레트 정보 열람 페이지로 이동
			} 
			catch (err) {					
				setPopup(`에러`,`${err}`);
			} 
			finally {
				setOnLoading(false);
			}
		})();
	}


	/** 입고 상태의 등록버튼 클릭 시, 데이터표에서 선택된 대상들만 등록 */
	const oninputOnCLickRegist = async ()=> {
		setOnLoading(true);
		if( gridInputPallet.rows.length === 0 ){
			setPopup("등록할 입고 대상 바코드가 없습니다.");
			return;
		}
		if (selectedInputPallet.ids.size === 0) {
			setPopup("선택된 입고 대상 바코드가 없습니다.");
			return;
		}
		// 선택된 출하 팔레트 저장 시작					
		try {
			// 변경된 팔레트 데이터 및 성공과 실패 팔레트 저장
			let filteredRows = gridInputPallet.rows //기존 팔레트 복사본
			let savedBarcode = [] //성공 시 누적하여 저장
			let faildBarcode = [] //실패 시 누적하여 저장
			let faileMsgSave = '' //실패된 기록과 바코드 누적하여 기록 저장
							
			for (const palletBarcode of selectedInputPallet.ids) {

				//팔레트 바코드 처리 시도 (실패, 성공 시 분기 다름)
				try {
					const result = await UseFetchParam({
						procedure:"PDA_CHULHA_INPUT_PROC_S", // 이전 프로시저 PSP_S_CHULHA_INPUT_PROC, 프로시저 구문 오류만 수정
						parameter: [palletBarcode], // 팔레트 바코드
						EventType:"save data",
						EventName:"shipment data save",
						isVoidProcedure: true,
					});
					filteredRows = filteredRows.filter(item => item.barcode !== palletBarcode); //성공시 해당 팔레트를 그리드에서 제외
					savedBarcode.push(palletBarcode) // 성공 값 저장
				} 
				catch (err) {	
					faildBarcode.push(palletBarcode) //실패 팔레트 바코드 저장
					faileMsgSave += `${palletBarcode} : ${err} | ` //실패 사유 저장
				}
	
				// 저장 실패한 바코드만 데이터그리드에 남김
				setGridInputPallet({
					...gridInputPallet,
					rows: faildBarcode // 실패하고 남은 바코드
				})
			}
			
			//알림 전체성공
			if (faildBarcode.length === 0){
				setPopup('입고 성공',`전체 입고처리 되었습니다.`);
			}
			//알림 일부실패
			else if (faildBarcode.length > 0) {
				setPopup('입고 부분 성공',`일부 팔레트가 입고되지 않았습니다. [성공${savedBarcode.length} / 실패${faildBarcode.length}] [${faileMsgSave}]`);
			}
			//알림 전체실패
			else if (savedBarcode.length === 0) {
				setPopup('입고실패',`바코드 전체가 입고되지 않았습니다. [${faileMsgSave}]`);
			}
		}
		catch (err) {	
			setPopup(`${err}`);
		} 
		finally{
			setOnLoading(false);
		}		
	}


	/** 입고 화면에서 삭제 버튼, 선택된 전체대상을 선택해제 */
	const onInputGridDelete = ()=> {
		// 선택 정보 값 없으면 동작 안함
		if (!selectedInputPallet || selectedInputPallet.ids.size === 0) {
			setPopup('삭제 오류', '삭제할 입고 대상이 없습니다.');
			return;
		}
		// 선택된 ID 목록
  		const selectedIds = selectedInputPallet.ids;
		// rows 필터링해서 삭제
		setGridInputPallet((prevState) => ({
			...prevState,
			rows: prevState.rows.filter((row) => !selectedIds.has(row.id))
		}));
		
		// 선택 초기화
		setSelectedInputPallet({
			type: 'include',
			ids: new Set(),
		});
	}


	/** 팔레트 정보 보기 페이지에서 나가기 */
	const onExitPalletDetailDataPage = ()=> {
		// 메인 시작 페이지 이동
		setIsMainPage(true); 
		// 팔레트 리스트 정보 열람 페이지 내부 값 초기화 
		setGridPackedPart({
			...gridPackedPart,
			rows : [],
		})
	}


    return (
    <Stack gap={1} m={1}>
        {isMainPage === true && // 입고 메인 페이지, 입고 가능 팔레트 조회 가능
        <>
            <CatButtonBigOne // 입고할 물품 불러오는 버튼
                buttonLabel='새로고침'
                onClick={ onInputRefreshList }
            />
            <CatDataGrid
                col={gridInputPallet.columns}
                row={gridInputPallet.rows}
                onRowClick={oninputOnClickGridCell}  // 행 클릭 이벤트, 데이터 표에서 특정 팔레트 정보 열람                
                checkboxSelection // 체크 기능 켜기
                rowSelectionModel={ selectedInputPallet } // 선택값 저장
                onRowSelectionModelChange={(newRowSelection) => { // 선택이벤트
                    setSelectedInputPallet( newRowSelection )
                }}
            />
            <CatButtonBigOne
                buttonLabel='등록' // 입고 등록
                onClick={ oninputOnCLickRegist } 
            />
            <CatButtonBigOne
                buttonLabel='삭제' // 입고 삭제
                onClick={ onInputGridDelete }
            />
        </>
		}
		{isMainPage === false && // 특정 팔레트 하위 리스트 값 보기 
		<>
			<Box display="flex" m={1} gap={1} sx={{  border: '1px solid black' }}>
				<Typography> 팔레트 바코드 : { gridInputPallet.openDetail } </Typography> 
			</Box>
			<CatDataGrid
				row={gridPackedPart.rows}
				col={gridPackedPart.columns}
			/>
			<CatButtonBigOne
				buttonLabel='이전'
				onClick={ onExitPalletDetailDataPage }
			/>
		</>
		}
    </Stack>
    )
}