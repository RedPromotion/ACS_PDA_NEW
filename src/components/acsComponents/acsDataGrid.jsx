import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function AcsDataGrid({ width, height, rows, cols, ...props }) {
  
  // 컬럼의 sortable을 false로 설정하는 로직
  const changedCols = cols.map((column) => ({
    ...column,
    sortable: false,
  }));

  return (
    <div style={{ height: height, width: width }}>
      <DataGrid
        rows={rows}
        columns={changedCols}
        density="compact"
        hideFooter
        disableColumnMenu
        {...props}
      />
    </div>
  );
}

AcsDataGrid.defaultProps = {
  height: 300,
  width: '100%',
};
