import { useMemo, useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography,
    Popover, Box, FormControlLabel, Switch,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from 'react-router-dom';
import { useRootContext } from '../../context/RootContext'
/*******************************************************************************************
@verison   
VER         DATE        AUTHOR              DESCRIPTION
----------  ----------	---------------		------------------------------- 
1.00        2025-05-09  sj_hong             리팩토링 (vite+SWC전환) 시 생성됨
1.01        2025-05-27  sj_hong             발포적재 페이지 수동입력 옵션 추가
*******************************************************************************************/
/**********************************************************
 * TopBar 컴포넌트
 * @param {string} pageName - 현재 페이지명
 * @param {function} onMenuClick - 사이드메뉴 오픈 함수
**********************************************************/
export default function TopBar({ pagesData }) {

    const { 
      isTopBarVisible, 
      isSideMenuBarVisible, 
      setIsSideMenuBarVisible,
      isUseManualInputContext,
      setIsUseManualInputContext,
    } = useRootContext();
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState('');
    
    /** url 주소를 메뉴정보와 비교하여 탑베 라벨 출력하는 함수 */
    const currentPageName = useMemo(() => {
        if (!Array.isArray(pagesData)) return '알 수 없는 페이지';
        const currentPath = location.pathname.replace(/^\//, '');
        setCurrentPath(currentPath); //페이지url경로저장
        const match = pagesData.find(page => page.path.toLowerCase() === currentPath.toLowerCase());
        return match ? match.name : '알 수 없는 페이지';
    }, [location.pathname, pagesData]);


    // ▼ 제어판 팝업 관련 상태
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpenSettings = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseSettings = () => {
        setAnchorEl(null);
    };
    const isSettingsOpen = Boolean(anchorEl);

    // 스위치 토글 기능 구현
    const handleToggleChange = (event) => {
      setIsUseManualInputContext(event.target.checked);
    };

    return (
    <>
      {isTopBarVisible && (
        <AppBar position="static" id="appbar">
          <Toolbar>

            {/* 왼쪽 메뉴 버튼 */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setIsSideMenuBarVisible(!isSideMenuBarVisible)}
              sx={{ mr: 2 }}
            >
              <MenuIcon sx={{ fontSize: '2rem' }} />
            </IconButton>

            {/* 페이지 제목 표기하기 */}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {currentPageName || 'PageName Missing'}
            </Typography>

            {/* 우측 설정 버튼 */}            
            {['TestPage'].includes(currentPath) && //괄호에 페이지 URL 명칭 추가하여 옵션창 띄우기 가능
            typeof isUseManualInputContext !== 'undefined' &&
            <>
              {/* 오른쪽 미니 제어판의 아이콘 버튼 */}
              <IconButton color="inherit" onClick={handleOpenSettings}>
                <SettingsIcon />
              </IconButton>

              {/* Popover - 페이지 내의 미니 제어판 (필요시 사용하기) */}              
              <Popover 
              open={isSettingsOpen}
              anchorEl={anchorEl}
              onClose={handleCloseSettings}
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
              }}
              transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
              }}
              >
              <Box sx={{ p: 2, minWidth: 200 }}>
                <Typography variant="subtitle1"> 페이지 설정 </Typography>                
                  <FormControlLabel
                    control={
                        <Switch
                            checked={isUseManualInputContext}
                            onChange={handleToggleChange}
                            color="primary"
                        />
                    }
                    label={isUseManualInputContext ? '수동입력(켜짐)' : '수동입력(꺼짐)'}
                    sx={{ mt: 2 }}
                  />
              </Box>
              </Popover>
            </>
            }            
          </Toolbar>
        </AppBar>
      )}
    </>
  );
}