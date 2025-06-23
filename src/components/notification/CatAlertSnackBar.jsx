import React from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';
/**
 * CatSnackBar 컴포넌트
 * Material-UI의 Snackbar와 Alert를 사용하여 사용자에게 알림 메시지를 표시합니다.
 *
 * @param {Object} props - 컴포넌트에 전달되는 props 객체.
 * @param {boolean} props.open - (필수) 스낵바가 표시될지 여부.
 * @param {function} props.onClose - (필수) 스낵바가 닫힐 때 호출되는 콜백 함수.
 * @param {string} [props.text='알림'] - (필수) 알림에 표시할 텍스트 메시지.
 * @param {'success'|'info'|'warning'|'error'} [props.severity='info'] - 알림의 심각도 형태.
 * @param {'standard'|'outlined'|'filled'} [props.variant='standard'] - 알림의 스타일 유형.
 * @param {'bottom'|'top'} [props.vertical='bottom'] - 스낵바의 수직 위치.
 * @param {'center'|'left'|'right'} [props.horizontal='left'] - 스낵바의 수평 위치.
 * @param {number} [props.durationSeconds=2] - 스낵바가 자동으로 닫히기 전의 시간(초 단위).
 * @param {number} [props.vibrateSecond=0] - 진동효과 시간(초 단위).
 * @param {Object} [props.textStlye] - Alert 내부의 Typography에 적용할 sx 스타일 객체. 
 * 
 * @author sj_hong
 * @updated 2025-02-18T10:49:00Z
 * @example
 *  const [openAlert, setOpenAlert] = useState(false); //플래그 기준값
 *  const handleAlertClose = () => {
 *    setOpenAlert(false);
 *  }  
 * 
 *  return (
 *   <CateAlertSnackBar
 *     open={openAlert}
 *     onClose={handleAlertClose}
 *     text={'알림이 제공됨'}
 *   />
 *  )
 */
export default function CatAlertSnackBar({ 
  open, 
  onClose,
  text = '알림',
  severity = "info",      // severity: 'success' | 'info' | 'warning' | 'error' 또는 1, 2, 3, 4 (또는 숫자형 문자열 혹은 숫자)
  variant = "standard",   // variant: 'standard' | 'outlined' | 'filled'
  vertical = 'bottom',    // vertical: 'bottom' | 'top'
  horizontal = 'left',    // horizontal: 'center' | 'left' | 'right'
  durationSeconds = 2,
  vibrateSecond = 0, 
  textStlye
}) {  

  // 오류 메시지를 누적할 배열
  let errors = [];

  // 숫자형이거나 숫자형 문자열이면 한 번에 처리
  if ((typeof severity === 'number') || (typeof severity === 'string' && !isNaN(Number(severity)))) {
    const numSeverity = Number(severity);
    switch (numSeverity) {
      case 1:
        severity = 'success';
        break;
      case 2:
        severity = 'info';
        break;
      case 3:
        severity = 'warning';
        break;
      case 4:
        severity = 'error';
        break;
      default:
        errors.push('severity'); 
        severity = 'info';
        break;
    }
  } 
  else if (typeof severity === 'string') { // 숫자로 변환할 수 없는 일반 문자열이면 소문자화하여 사용    
    severity = severity.toLowerCase();
  } 
  else {
    errors.push('severity');
  }

  // 나머지 prop들도 문자열인지 확인 후 소문자화
  if (typeof variant === 'string') {
    variant = variant.toLowerCase();
  } 
  else {
    errors.push('variant');
  }
  if (typeof vertical === 'string') {
    vertical = vertical.toLowerCase();
  } 
  else {
    errors.push('vertical');
  }
  if (typeof horizontal === 'string') {
    horizontal = horizontal.toLowerCase();
  } 
  else {
    errors.push('horizontal');
  }
  if (typeof text !== 'string') {
    errors.push('text');
    text = '알림';
  }

  // 각 prop별로 허용되는 값 목록
  const validSeverities = ['success', 'info', 'warning', 'error'];
  const validVariants = ['standard', 'outlined', 'filled'];
  const validVerticals = ['bottom', 'top'];
  const validHorizontals = ['center', 'left', 'right'];

  // 허용된 값이 아닌 경우 기본값으로 대체하고, 오류 메시지에 해당 prop명을 추가
  if (!validSeverities.includes(severity)) {
    errors.push('severity');
    severity = 'info';
  }
  if (!validVariants.includes(variant)) {
    errors.push('variant');
    variant = 'standard';
  }
  if (!validVerticals.includes(vertical)) {
    errors.push('vertical');
    vertical = 'bottom';
  }
  if (!validHorizontals.includes(horizontal)) {
    errors.push('horizontal');
    horizontal = 'left';
  }

  // durationSeconds 타입 검사
  if (typeof durationSeconds !== "number") {
    errors.push('durationSeconds');
    durationSeconds = 2;
  }

  // 만약 오류가 있다면, 오류 항목들을 text 메시지에 덧붙임
  if (errors.length > 0) {
    text += ` [Error in parameter(s): ${[...new Set(errors)].join(', ')}]`;
  }

  if (vibrateSecond > 0 || vibrateSecond ){

  }


  // 진동 기능 (!!주의!!리턴문 포함되어있음!)
  if ("vibrate" in navigator) { 
    if (typeof vibrateSecond === 'number' || (typeof vibrateSecond === 'string' && !isNaN(vibrateSecond))) {
      // 문자열 형태의 숫자에 대응
      const parsedVibrateSecond = typeof vibrateSecond === 'number' ? vibrateSecond : Number(vibrateSecond);
      if (parsedVibrateSecond === 0) {
        //아무일도 일어나지 않는다.
      } 
      else if (parsedVibrateSecond > 0) {
        navigator.vibrate(parsedVibrateSecond * 1000);
      } 
      else if (parsedVibrateSecond < 0) {
        console.warn('진동 시간은 0보다 커야 합니다.');
      }
    } 
    else {
      console.warn('진동 시간이 숫자가 아닙니다.');
    }
  } 
  else {
    console.warn('진동 기능을 지원하지 않습니다.');
  }
    
  return (
    <>
      <Snackbar
        open={open}
        onClose={onClose}
        autoHideDuration={Number(durationSeconds) * 1000}
        transitionDuration={{ enter: 0, exit: 0 }} // enter: 나타나는 시간, exit: 사라지는 시간을 설정 (닫힐 떄 값 초기화될때 모습 살짝 보이고 닫혀서 0으로 설정)
        anchorOrigin={{ vertical, horizontal }}
      >
        <Alert
          onClose={onClose}
          variant={variant}
          severity={severity}
          sx={{ width: '100%' }}
        >
          <Typography sx={textStlye}>
            {text}
          </Typography>
        </Alert>
      </Snackbar>
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
직접 태그 선언 & 기본 사용 예시
******************************

  return(
    <>  
      <CatSnackBar
        open={openAlert}
        onClose={handleAlertClose}
        text={'알림이 제공됨'}
      />
    </>
  )

**************************************************************************************************************************
직접 태그 선언 & 옵션 추가 사용 예시
**********************************

  const [openAlert, setOpenAlert] = useState(false); //플래그 기준값
  
  const handleAlertClose = () => {
    setOpenAlert(false);
  }

  return(
    <>  
      <CatSnackBar
          open={openAlert}
          onClose={handleAlertClose}
          text={'알림이 제공됨'}
          severity={'info'}
          variant={"standard"}
          vertical={'bottom'}
          horizontal={'left'}
          durationSeconds={2}
      />
    </>
  )
  
**************************************************************************************************************************
콘텍스트에서 가져와 사용 시 예시 
**********************************

  // 알림 메시지만 표현하기 
  setSnack('간단 스낵 메시지 호출')


  // 문자열로 표기하기
  setSnack('success', '성공 스낵바 메시지')


  // 숫자로 표기하는 사용 예시
  setSnack('3','경고 스낵 메시지 호출')


  // 매개변수 사용하여 상세히 표현하기
  setAlertSnackBar(prev => ({
    ...prev, // 이전 상태를 유지
    open: true,
    text: '알림이 제공됨',
    severity: 'info',
    variant: 'standard',
    vertical: 'bottom',
    horizontal: 'left',
    durationSeconds: 2    
}));


**************************************************************************************************************************/