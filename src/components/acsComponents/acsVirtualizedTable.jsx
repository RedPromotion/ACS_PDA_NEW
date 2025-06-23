import React, { useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Paper, Checkbox, TableCell } from "@mui/material";
import { AutoSizer, Column, Table } from "react-virtualized";

// 스타일을 styled API로 대체
const FlexContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
});

const TableRowHover = styled('div')({
  "&:hover": {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});

const MuiVirtualizedTable = ({
  classes,
  columns,
  rowHeight,
  headerHeight,
  onRowClick,
  isSelected,
  handleAllClick,
  ...tableProps
}) => {
  const getRowClassName = ({ index }) => {
    return `${classes.tableRow} ${index !== -1 && onRowClick ? classes.tableRowHover : ''}`;
  };

  const cellRenderer = ({ cellData, columnIndex }) => {
    if (columnIndex === 0) {
      return (
        <TableCell component="div" className={`${classes.tableCell} ${classes.flexContainer}`}>
          <Checkbox checked={isSelected(cellData)} />
        </TableCell>
      );
    } else {
      return (
        <TableCell
          component="div"
          className={`${classes.tableCell} ${classes.flexContainer}`}
          align={columns[columnIndex].numeric ? 'right' : 'left'}>
          {cellData}
        </TableCell>
      );
    }
  };

  const headerRenderer = ({ label, columnIndex }) => {
    return columnIndex === 0 ? (
      <TableCell
        component="div"
        className={`${classes.tableCell} ${classes.flexContainer}`}
        align={columns[columnIndex].numeric ? 'right' : 'left'}>
        <Checkbox onChange={handleAllClick} />
      </TableCell>
    ) : (
      <TableCell
        component="div"
        className={`${classes.tableCell} ${classes.flexContainer}`}
        align={columns[columnIndex].numeric ? 'right' : 'left'}>
        <span>{label}</span>
      </TableCell>
    );
  };

  return (
    <AutoSizer>
      {({ height }) => (
        <Table
          height={height}
          width={1000}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          className={classes.table}
          {...tableProps}
          rowClassName={getRowClassName}>
          {columns.map(({ dataKey, ...other }, index) => (
            <Column
              key={dataKey}
              headerRenderer={(headerProps) =>
                headerRenderer({
                  ...headerProps,
                  columnIndex: index,
                })
              }
              className={classes.flexContainer}
              cellRenderer={cellRenderer}
              dataKey={dataKey}
              {...other}
            />
          ))}
        </Table>
      )}
    </AutoSizer>
  );
};

MuiVirtualizedTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  isSelected: PropTypes.func.isRequired,
  handleAllClick: PropTypes.func.isRequired,
};

const VirtualizedTable = MuiVirtualizedTable;

/***********************************************************************
 * @Memo 2025년 01월14일 메모 SJ_HONg
 * @Description 대규모 데이터 가상화 랜더링 방식의 데이터그리드 컴포넌트
************************************************************************/
export default function AcsVirtualizedTable({ data }) {
  
  const rows = data.map((data, i) => ({
    id: i,
    ...data,
  }));

  const columns = Object.keys(rows[0]).map((key) => ({
    width: 100,
    label: key,
    dataKey: key,
  }));

  const [selected, setSelected] = useState([]);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleAllClick = (e) => {
    if (e.target.checked) {
      const newSelecteds = rows.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = ({ index }) => {
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, index];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  return (
    <Paper sx={{ height: 300, width: "100%" }}>
      <VirtualizedTable
        rowCount={rows.length}
        rowGetter={({ index }) => rows[index]}
        columns={columns}
        onRowClick={handleClick}
        handleAllClick={handleAllClick}
        isSelected={isSelected}
      />
    </Paper>
  );
}
