import { useEffect, useState, useRef } from "react"; 
import { Box, Typography, Button, TextField } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useRootContext } from '@RootContext';
/*********************************************
 * @name testPage.jsx
 * @description  
 * - 기능 테스트 페이지
**********************************************/
export default function TestPage () {

  const { setPopup, setOnLoading, } = useRootContext();
  const buttonRef = useRef(null);


  //컬럼 보여주기 반응 반영 이펙트
  useEffect(() => {
     buttonRef.current?.focus();
  }, []);
  

  // 가짜 데이터 생성
  const initialRows = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    barcode: `BCODE-${1000 + i}`,
    date: new Date(2025, 4, i + 1).toLocaleDateString(),
  }));

  const [rows, setRows] = useState(initialRows);
  const [selectionModel, setSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });

  // 컬럼 정의
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "barcode", headerName: "바코드", width: 150 },
    { field: "date", headerName: "입고일자", width: 150 },
  ];

  // 선택 변경 핸들러
  const handleSelectionChange = (newSelection) => {
    setSelectionModel(Array.isArray(newSelection)
      ? { type: "include", ids: new Set(newSelection) }
      : newSelection
    );
  };

  // 부분 삭제
  const handleDeleteSelected = () => {
    if (!selectionModel.ids || selectionModel.ids.size === 0) {
      setPopup("삭제 실패", "선택된 삭제 대상이 없습니다.");
      return;
    }
    setRows(prev => prev.filter(row => !selectionModel.ids.has(row.id)));
    setSelectionModel({ type: "include", ids: new Set() });
  };

  // 전체 삭제
  const handleDeleteAll = () => {
    if (rows.length === 0) {
      setPopup("삭제 실패", "삭제할 데이터가 없습니다.");
      return;
    }
    setRows([]);
    setSelectionModel({ type: "include", ids: new Set() });
  };

  useEffect(() => {
    console.log("현재 선택된 ID:", Array.from(selectionModel.ids));
  }, [selectionModel]);
  
  const focusButton = () => {
    buttonRef.current?.focus(); // 이게 정상 동작함
  };


  return (
    <Box m={2}>
      <Typography variant="h5" gutterBottom>
        DataGrid 선택 및 삭제 예제
      </Typography>
      <Box margin={1}>
        <TextField 
        fullWidth
        label={'테스트 입력창'}        
        autoComplete="off"
      />
      </Box>      
      <Box mb={2} display="flex" gap={1}>
        <Button variant="contained" onClick={handleDeleteSelected}>
          선택 삭제
        </Button>
        <Button variant="outlined" color="error" onClick={handleDeleteAll}>
          전체 삭제
        </Button>
        <Button variant="outlined" color="info" onClick={() => { playAlramSound() }}>
          알람 켜기
        </Button>        
      </Box>
      <Box mb={2} display="flex" gap={1}>
        <Button
          variant="contained"
          component="button"
          ref={buttonRef} // 이때 buttonRef는 실제 button을 참조함
        >
          버튼
        </Button>
        <Button onClick={focusButton}>버튼에 포커스 주기</Button>
      </Box>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleSelectionChange}
          getRowId={(row) => row.id}
          disableColumnMenu
          density="compact"
        />
      </Box>
    </Box>
  );
}