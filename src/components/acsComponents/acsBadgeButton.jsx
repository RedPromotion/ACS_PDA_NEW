import { Badge, Button } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";

/*******************************************************************************************	 
@name AcsBadgeButton.jsx
@Role 버튼에 숫자 표기해주는 버튼 + 뱃지 컴포넌트
@param  {number} badgeContent 버튼에 표현될 숫자 입력
@param  {string} children 버튼 텍스트
@param  {string} props 버튼 추가 기능 구현
@description 2025년 MUI v5 기준 업데이트
*******************************************************************************************/
export default function AcsBadgeButton({ badgeContent, children, ...props }) {
  return (
    <Badge
      badgeContent={badgeContent}
      color="secondary"
      max={9999}
      sx={{
        "& .MuiBadge-badge": {
          right: "15px",
          top: "10px",
          fontSize: "1.1rem",
        },
        display: "block",
      }}
    >
      <Button
        {...props}
        sx={{
          display: "block",
        }}
      >
        {children}
      </Button>
    </Badge>
  );
}

//기본 값 설정
AcsBadgeButton.defaultProps = {
  badgeContent: 0,
};

//타입 검증
AcsBadgeButton.propTypes = {
  badgeContent: PropTypes.number,
  children: PropTypes.node.isRequired,
};