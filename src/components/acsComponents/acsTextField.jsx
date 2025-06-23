import React from "react";
import { TextField } from "@mui/material";  // MUI v5에서 변경된 import


const AcsTextField = React.memo(function AcsTextField({ value, InputProps, inputProps, ...props}) {

  // 기본적으로 InputProps가 존재하면 그대로 사용, 아니면 inputProps를 사용하도록
  const finalInputProps = InputProps?.inputProps || inputProps;

  // finalInputProps에 tabIndex를 -1로 설정
  if (finalInputProps) {
    finalInputProps.tabIndex = -1;
  }

  return (
    <TextField
      autoComplete="off"
      {...props}
      value={value}
      InputProps={{ ...InputProps, inputProps: finalInputProps }}  // 둘을 병합하여 사용
    />
  );
});

AcsTextField.defaultProps = {
  variant: "outlined",
  size: "small",
  letterCase: "none",
  InputLabelProps: {
    shrink: true,
    style: { fontWeight: "bold", color: "#000", minWidth: "100%" },
  },
};

export default AcsTextField;

const makeSetCase = {
  upper: (letter) => letter.toUpperCase(),
  lower: (letter) => letter.toLowerCase(),
};
