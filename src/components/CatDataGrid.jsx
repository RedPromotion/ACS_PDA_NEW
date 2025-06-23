import { Box } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
/**
 * @name CatDataGrid
 * @param {Object} props - 컴포넌트에 전달되는 props 객체
 * @param {Array<Object>} props.row - (필수) 데이터 값 (배열 형태의 객체)
 * @param {Array<Object>} props.col - (필수) 컬럼 (배열 형태의 객체)
 * @param {Object} [props.style={height: 300}] - 데이터 그리드에 적용할 스타일 (예: { height: 300 })
 * @param {boolean} [props.visibleId=false] - (선택) ID 컬럼 보이기 여부 (`true`이면 표시, `false`이면 숨김)
 * @param {...any} props - 추가 속성 (추가로 전달되는 props)
 * 
 * @author sj_hong
 * @updated 2025-03-24 16:29
 * - CatDataGrid 컴포넌트는 데이터 그리드를 생성하는 컴포넌트입니다.
 * - 아이디가 없는 데이터에는 자동으로 id가 부여된 후 숨깁니다.
 * - 컬럼에 필드와 헤더 네임이 입력되지 않은 경우 경고를 표시합니다.
 * @example
 * <CatDataGrid
 *    row={rows}
 *    col={columns}
 * />
 */
export default function CatDataGrid ({ row, col, style={height: 300}, visibleID = false, ...props }) {	
	
	if(!col){
		console.error(`데이터그리드 필수 컬럼 설정 없음`);
		col = [{ field: 'id', headerName: 'ID' }]
	}

	/** 데이터에 id를 추가로 부여하여 값 교체 */
	const changedrows = Array.isArray(row) ? row.map((row, i) => ({
		id: row.id || i + 1,
		...row,
	})) : [];

	/** 컬럼에 자동 옵션 부여  */
	const changedcols = Array.isArray(col) ? col.map((column) => ({
		...column,
		sortable: false,
		field : column.field || 'field mssing',
		headerName: column.headerName || 'headerName missing',
		headerAlign: column.headerAlign || 'center',		
	})) : [];

	return (
		<>
        <Box display="flex">
			<DataGrid
				rows={changedrows}
				columns={changedcols}
				density="compact"
				isCellEditable={() => false} // 모든 셀을 수정 불가능하게 설정
				disableColumnMenu={true}
				hideFooter={true}
				sx={style}
				localeText={{
					noRowsLabel: ''
				}}
				initialState={{
					columns: {
						columnVisibilityModel: {
							id: visibleID, 
						},
					},
				}}							
				{...props}
			/>
        </Box>
		</>
	);
}

/**************************************************************************************************************************
          .         .                                                                                                      
         ,8.       ,8.                   .8.          b.             8 8 8888      88          .8.          8 8888         
        ,888.     ,888.                 .888.         888o.          8 8 8888      88         .888.         8 8888         
       .`8888.   .`8888.               :88888.        Y88888o.       8 8 8888      88        :88888.        8 8888         
      ,8.`8888. ,8.`8888.             . `88888.       .`Y888888o.    8 8 8888      88       . `88888.       8 8888         
     ,8'8.`8888,8^8.`8888.           .8. `88888.      8o. `Y888888o. 8 8 8888      88      .8. `88888.      8 8888         
    ,8' `8.`8888' `8.`8888.         .8`8. `88888.     8`Y8o. `Y88888o8 8 8888      88     .8`8. `88888.     8 8888         
   ,8'   `8.`88'   `8.`8888.       .8' `8. `88888.    8   `Y8o. `Y8888 8 8888      88    .8' `8. `88888.    8 8888         
  ,8'     `8.`'     `8.`8888.     .8'   `8. `88888.   8      `Y8o. `Y8 ` 8888     ,8P   .8'   `8. `88888.   8 8888         
 ,8'       `8        `8.`8888.   .888888888. `88888.  8         `Y8o.`   8888   ,d8P   .888888888. `88888.  8 8888         
,8'         `         `8.`8888. .8'       `8. `88888. 8            `Yo    `Y88888P'   .8'       `8. `88888. 8 888888888888 
**************************************************************************************************************************
//상위 페이지에서의 코드 사용 예시
***********************************

	// 컬럼 
	const columns = [
		{
			field: 'barcode',
			headerName: '바코드',
			width: 150,			
		},
		{
			field: 'qty',
			headerName: '수량',
			type: 'number',
			width: 110,			
		},
	];
	
	// 데이터 
	const [rows, setRows] = useState([
		{ barcode: '가짜테스트바코드1', qty: 14 },
		{ barcode: '가짜테스트바코드2', qty: 31 },
		{ barcode: '가짜테스트바코드3', qty: 31 },
	]);


    //태그 선언
    return (
		<>	
        	<CatDataGrid 
				row={rows} 
				col={columns} 
			/>
        </>
	);	


**************************************************************************************************************************
// 객체배열로 선언한 useState DataGrid 값 관리 예시
***********************************

	const [grid, setGrid] = useState({
		columns : [
			{ field: '필드1', headerName: '헤더1', width: 120, }, 
			{ field: '필드2', headerName: '헤더2', width: 120, }, 
		],
		rows : [],
		selected : [], 
	});

	
    //태그 선언
    return (
		<>	
        	<CatDataGrid 
				row={grid.rows} 
				col={grid.columns} 
			/>
        </>
	);	


**************************************************************************************************************************/
