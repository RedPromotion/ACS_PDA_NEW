import React, { forwardRef } from 'react';
import { TextField } from '@mui/material';


const AcsBarcode = forwardRef((props, ref) => {
  
  const textOnKeyDown = (e) => {
    console.log("keydown event");
    e.target.readOnly = false;
  };

  const textOnKeyUp = (e) => {
    console.log("acsbarcodeKeyCode : ", e.keyCode);
    if (e.keyCode === 13) {
      let data = e.target.value;
      console.log("acsbarcodeData : ", data);
      if (data === "") {
        navigator.vibrate(300);
        e.target.focus();
        return false;
      }
      props.handleBarcode(e); // handleBarcode는 부모 컴포넌트에서 넘겨준 함수로 가정
      e.target.value = "";
    }
  };

  const textOnChange = (e) => {
    console.log("1234", e.target.value);
  };

  return (
    <TextField
      ref={ref}
      id="acsBarcodeText"
      onKeyUp={textOnKeyUp}
      onKeyDown={textOnKeyDown}
      onChange={textOnChange}
      autoFocus
      inputMode="none"
      autoComplete="off"
      variant="outlined"  // 기본 스타일로 Outlined 사용
      sx={{
        width: '1px',
        height: '0px',
        outline: 'none',
        border: 'none',
        color: 'transparent',
        textShadow: '0 0 0 black',
        padding: 0, // 불필요한 여백 제거
      }}
    />
  );
});

export default AcsBarcode;
