import { useEffect, useState, useRef } from "react"; 
import { useRootContext } from '@RootContext';
import useFetch from '../../api/useFetch'
//리액트엠유아이
import { Box, Typography, Button, TextField, Stack } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
//커스텀 컴포넌트
import CatDataGrid from '../../components/CatDataGrid'
import CatButtonBigOne from '../../components/CatButtonBigOne'
import CatTextField from '../../components/CatTextField'
import getDateTimeFormat from "../../functions/getDateTimeFormat";
/*********************************************
 * @name SamplePage.jsx
 * @description  
 * - PDA 샘플 페이지
 * - 기본 동작 구조 구축해놓음
**********************************************/
export default function SamplePage () {

  const { setPopup, setOnLoading, } = useRootContext();

  const [barcode, setBarcode] = useState('');
  const [gridRows, setGridRows] = useState([]);

  const buttonRef = useRef(null);

  /** 데이터그리드 추가 */
  const onInputBarcodeToDataGrid = (barcode) => {
    if (!barcode?.trim()){
      setPopup('입력 공백', '입력된 바코드가 없습니다.');
      return
    }    
    if (gridRows.some(row => row.BARCODE === barcode)) {
      setPopup('중복 입력', '이미 입력된 바코드입니다.');
      return
    }

    console.log(barcode);

    const newRow = {
      id: Date.now(), // 고유 ID
      BARCODE: barcode,
      //DATE: new Date().toISOString().slice(0, 19).replace('T', ' '), //자바스크립트 날짜 구성
      DATE: getDateTimeFormat("YYYY-MM-DD HH:DD:SS.SSS", new Date()), //함수기능 불러오기 
      UNVISIBLE_FLAG: 'N',
    };

    setGridRows(prev => [...prev, newRow]);
  };

  /** 데이터그리드 클리어 버튼 이벤트 */
  const onClickSaveButton = async () => {
    if (gridRows.length === 0) {
      setPopup('알림', '저장할 데이터가 없습니다.');
      return;
    }
    try {
      setOnLoading(true);

      //저장 API 호출할 부분
      /*
      const fetchResult = await useFetch({ // fetchResult에 결과 조회값 저장 (이중배열)
        procedure:"PDA_PROCEDURE_TO_UES_TEST_S", //프로시저 할당
        parameter:[ parameter1, parameter2], //배열 형태로 매개변수 할당
        EventType:"SAVE",
        EventName:"SAVE",
      });
      */

      setPopup('성공', `${gridRows.length}건 저장 완료`);
      console.table(gridRows);
      setGridRows([]);
    } 
    catch (error) {
      setPopup('오류', '저장 중 오류 발생');
    } 
    finally {
      setOnLoading(false);
    }
  };


  /** 데이터그리드 클리어 버튼 이벤트 */
  const onClickClearDataGridButton = () => {
    setGridRows([]);
  }

  return (
    <Stack m={1} gap={1}>
      <CatTextField
        label={"바코드"}
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onInputBarcodeToDataGrid(event.target.value);
            event.target.value = '';
            setBarcode(''); // ✅ 상태 초기화
          }
        }}
      />
      <Stack>
        <CatDataGrid
          row={gridRows}
          col={[
            { field: 'BARCODE', headerName: '바코드', width: 200, },
            { field: 'DATE', headerName: '입력일자', width: 190, },
            { field: 'UNVISIBLE_FLAG', headerName: 'FLAG', width: 190, },
          ]}
          initialState={{
            columns: {
                columnVisibilityModel: { //특정컬럼 숨기기
                    id: false, 
                    UNVISIBLE_FLAG: false, //실제론있으나 컬럼보이지않게됨
                }
            }
          }}
        />
      </Stack>
      <Stack>
        <CatButtonBigOne
          buttonLabel="저장"
          onClick={onClickSaveButton}
        />
      </Stack>
      <Stack>
        <CatButtonBigOne
          buttonLabel="전체 삭제"
          onClick={onClickClearDataGridButton}
        />
      </Stack>
    </Stack>
  );
}