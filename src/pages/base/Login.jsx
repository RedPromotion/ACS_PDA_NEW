import { useEffect, useState, useRef } from "react"; 
import { useNavigate  } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

import MotrasLogoImage from '../../assets/logo/MotrasLogo.png'
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION

import { useRootContext } from '../../context/RootContext'
import useFetch from '../../api/useFetch'
import useFetchDateTime from '../../api/useFetchDateTime'

/*******************************************************************************************
@verison
VER         DATE        AUTHOR            DESCRIPTION
----------  ----------	---------------		------------------------------- 
0.01        2025-05-07   sj_hong          신규생성 (vite+swc)
*******************************************************************************************/
/*******************************************************************************************	 
@Page login.jsx
@Name 로그인 페이지
@description 
- (기능) 이미 로그인 되어 있는 상태 시 메인페이지로 이동함 
- 공장 추가 시 프론트 페이지에서 수정필요함
*******************************************************************************************/
export default function Login () {

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const userIdRef = useRef(null);
  const userPasswordRef = useRef(null);

  const navigate = useNavigate(); 

  const { 
    setPopup, setOnLoading,
    isTopBarVisible, setIsTopBarVisible,
    isSideMenuBarVisible, setIsSideMenuBarVisible,
  } = useRootContext();

  useEffect(() => {
    //로그인 정보가 세션이 이미 있으면 로그인페이지 자동 통과
    if( localStorage.getItem('userID') && localStorage.getItem('userPlant') ){
      setIsTopBarVisible(true);
      setIsSideMenuBarVisible(true);
      navigate('/HomePage');
    }
    else{
      setIsTopBarVisible(false);
      setIsSideMenuBarVisible(false);
    }
  }, []);

  /** 로그인 시도 */
  const onLogin = async ()  => {
    try {
      setOnLoading(true);
      if(!userId){
        setPopup(`아이디 미입력`, `아이디가 입력되지 않았습니다.`)
        userIdRef.current?.focus();
        return
      }
      if(!password){
        setPopup(`비밀번호 미입력`, `비밀번호가 입력되지 않았습니다.`)
        userPasswordRef.current?.focus();
        return
      }

      localStorage.setItem('userEmp', '테스트 직원');
      localStorage.setItem('userID', '테스트 아이디');
      localStorage.setItem('userName', '테스트 사용자');
      localStorage.setItem('userPlant', 'TEST_FACTORY');
      localStorage.setItem('userPlantName', '테스트 공장');
      if (!isTopBarVisible) setIsTopBarVisible(true);//탑바 없으면 켜기
      if (!isSideMenuBarVisible) setIsSideMenuBarVisible(true);//로그인 성공 시 사이드메뉴 켜지도록 하기
      navigate('/HomePage');

      return 
      //모트라스 로그인 예시       
      const fetchResult = await useFetch({
        api: "GENERAL",
        procedure:"PDA_LOGIN_L", // 로그인 검사 프로시저
        parameter:[ userId, password ], 
        userID: 'TryLoginWithoutID',//로그인 시, 아이디 없으니 임시로 부여
	      userPlant: 'MOBISGJ_IP',//로그인 시, 공장 정보 없으니 임시로 부여
        EventType:"LOGIN",
        EventName:"LOGIN",
      });
      if( fetchResult[0][0].RESULT === 'OK' ){//로그인 성공
        localStorage.setItem('userEmp', userId);//출하페이지_구버전_스토리지명칭(리팩토링전까지는_유지)
        localStorage.setItem('userID', userId);//새로바꿀_스토리지_명칭
        localStorage.setItem('userName', fetchResult[0][0].EMP_NAME);//유저명
        localStorage.setItem('userPlant', fetchResult[0][0].PLANT);//공장코드
        localStorage.setItem('userPlantName', fetchResult[0][0].PLANT_NAME);//공장명칭
        if (!isTopBarVisible) setIsTopBarVisible(true);//탑바 없으면 켜기
        if (!isSideMenuBarVisible) setIsSideMenuBarVisible(true);//로그인 성공 시 사이드메뉴 켜지도록 하기
        navigate('/HomePage');
      }
      else if( !fetchResult[0][0].RESULT || fetchResult[0][0].RESULT !== 'OK' ){
        setPopup('로그인 실패',`로그인 할 수 없습니다. 아이디와 비밀번호를 확인해 주세요.`)
        localStorage.clear();
        userIdRef.current?.focus();
        return
      }
      else{
        setPopup('로그인 에러',`로그인 할 수 없습니다. 관리자에게 문의해주세요.`)
        localStorage.clear();
        userIdRef.current?.focus();
        return
      }
    } 
    catch (error) {
      setPopup('로그인 에러', `로그인 할 수 없습니다. [${error}]`);
      localStorage.clear();
      userIdRef.current.focus();       
    }
    finally{
      setOnLoading(false);
    }
  };

  return (
    <Box>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100vh',
          pt: 1,
          pb: 3,
        }}
      >
        <Box sx={{ p: 1, textAlign: 'center', width: '100%', maxWidth: 600, }}>
          <img src={MotrasLogoImage} alt="Motras Logo" style={{ width: '100%' }} />
          <Typography variant="subtitle1">
            {appName} ver. {appVersion}
          </Typography>
        </Box>

        <Box sx={{ p: 1, width: '100%', maxWidth: 600 }}>
          <TextField
            fullWidth
            inputRef={userIdRef}
            autoFocus
            id="IdInputTextField"
            label="ID"
            variant="outlined"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                userPasswordRef.current.focus();
              }
            }}
            slotProps={{
              input: {
                endAdornment: userId && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear input"
                      onClick={() => setUserId('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ p: 1, width: '100%', maxWidth: 600 }}>
          <TextField
            fullWidth
            id="PwInputTextField"
            inputRef={userPasswordRef}
            label="PASSWORD"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onLogin();
              }
            }}
            slotProps={{
              input: {
                endAdornment: password && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear input"
                      onClick={() => setPassword('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}          
          />
        </Box>

        <Box sx={{ p: 1, width: '100%', maxWidth: 600 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={onLogin}
            sx={{ height: 50, fontSize: 24 }}
          >
            로그인
          </Button>
        </Box>
      </Container>
    </Box>
  );
}