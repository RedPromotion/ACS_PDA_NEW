import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRootContext } from '@RootContext'
/*******************************************************************************************/
//MUI
import { Close, Description, Folder, ExpandMore, } from '@mui/icons-material';
import { Drawer, Button, Box, Typography,
    ListItem, ListItemText, ListItemIcon, ListItemButton,
    Accordion, AccordionSummary, AccordionDetails, List
} from '@mui/material';
/*******************************************************************************************/
//APP_INFORMATION
const appName = import.meta.env.VITE_APP_NAME
const appVersion = import.meta.env.VITE_APP_VERSION
/*******************************************************************************************
 * @name SideMenubar.jsx
 * @description
 * - 사이드 메뉴바 구성
 * - app.js 에서 정의된 페이지 정보로 메뉴 구성하는 페이지
*******************************************************************************************/
export default function SideMenubar({ pagesData }) {

  const { isSideMenuBarVisible, setIsSideMenuBarVisible, setTopBarMenuName } = useRootContext();

  /** 메뉴 닫기 */
  const onCloseSideMenu = () => {
      setIsSideMenuBarVisible(false);
  }

  /** (화면구성) 사이드메뉴바 닫기 */
  const RenderMenuCloseButton = ()=> {
    return(
    <Box style={{ margin: "10px" }} >
        <Button 
        variant="contained"
        fullWidth
        size="large"
        style={{ height: '50px' }}
        onClick={onCloseSideMenu}
        >
        메뉴 닫기
        </Button>
    </Box>
    )
  }

  /** (화면구성) 로그아웃 버튼, */
  const RenderLogoutButton = ()=> {    
    return(
      <Link 
          to={"/"}
          style={{ margin: "10px" }} 
          onClick={onCloseSideMenu}>  
          <Button
          variant="contained" 
          color="error" 
          onClick={() => { localStorage.clear();  }} 
          style={{height: "50px"}} 
          fullWidth
          >
          로그아웃
          </Button>
      </Link> 
    )
  }

  /** (화면구성) 버전 및 앱 정보 */
  const RenderVersionInformation = ()=> {
    return(
      <Box m={2}>
        <Typography>{`${appName||'' } ver.${appVersion||''}`}</Typography>
      </Box> 
    )
  }

  return (
    <Drawer
      open={isSideMenuBarVisible}
      onClose={onCloseSideMenu}
      keepMounted={true}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ 
        sx: {
            width: `70%`,
            overflowX: "hidden", // 좌우 스크롤 제거 
        }
      }}
    >
      <Box sx={{ padding: 1 }}>
        {/* 기본 홈 페이지 생성 */}
        <CreateMenuSinglePage data={pagesData} pagePath='HomePage' onClick={onCloseSideMenu} />
        {/* 운영 페이지 */}
        { localStorage.getItem('userEmp') && localStorage.getItem('userPlant') &&
          <RenderRecursiveMenu
            pageData={pagesData}
            onClick={onCloseSideMenu}
            structure={[
              {
                type: 'folder',
                name: '샘플 폴더',
                children: [
                  { type: 'page', path: 'SamplePage' },
                ]
              },
              {
                type: 'folder',
                name: '개발 폴더',
                children: [
                  { type: 'page', path: 'TestPage' },
                ]
              },
            ]}
          />
        }                       
      </Box>
      <RenderMenuCloseButton/>
      <RenderLogoutButton/>
      <RenderVersionInformation/>
    </Drawer>
  );
};




/**
 * @use (메뉴생성) 폴더 메뉴 만드는 함수 
 * @example 
  <CreateSingleFolder
    folderName="적재"
    childrenPages={[
        'PageLoadingForming', 
        'PageLoadingIMG', 
        'pageLoadingPartScrap'
    ]}
    pagesData={pagesData}
    onClick={onCloseSideMenu}
  />
 */
export const CreateSingleFolder = ({ folderName = '폴더 이름없음', childrenPages = [], pagesData = [], onClick }) => {
    return (
        <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMore />}>
            <Folder style={{ marginRight: 8 }} />
            <Typography>{folderName}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: 2 }}>
            <List disablePadding>
            {childrenPages.map((path, idx) => (
                <CreateMenuSinglePage
                key={path + idx}
                data={pagesData}
                pagePath={path}
                onClick={onClick}
                />
            ))}
            </List>
        </AccordionDetails>
        </Accordion>
    );
};

/** 
 * @use (메뉴생성) 폴더 없이 페이지 개별 생성
 * @example 
  <CreateMenuSinglePage data={pagesData} pagePath = 'HomePage' onClick={onCloseSideMenu} />
 */
export const CreateMenuSinglePage = ({ data = [], pagePath = '', onClick, defaultIcon = <Description /> }) => {
    const matchedPage = data.find(page => page.path.toLowerCase() === pagePath.toLowerCase());
  
    if (!matchedPage) {
      return (
        <ListItem disablePadding>
          <ListItemIcon><Close color="error" /></ListItemIcon>
          <ListItemText
            primary={
              <Typography color="error">
                (Error) 찾을 수 없는 페이지 ({pagePath || '경로 없음'})
              </Typography>
            }
          />
        </ListItem>
      );
    }
  
    return (
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={`/${matchedPage.path}`}
          onClick={onClick}
        >
          <ListItemIcon>{matchedPage.icon || defaultIcon}</ListItemIcon>
          <ListItemText primary={matchedPage.name} />
        </ListItemButton>
      </ListItem>
    );
};

/** 
 * @use (메뉴생성) 다중 폴더 생성
 * @description 재귀함수, 깊이 무한 설정가능
 * @example 
    const folderStructure = [
        { type: 'page', path: 'HomePage' },
        {
          type: 'folder',
          name: '출하 관련',
          children: [
            { type: 'page', path: 'PageLoadingForming' },
            { type: 'page', path: 'PageLoadingIMG' },
            {
              type: 'folder',
              name: '적재 관련',
              children: [
                { type: 'page', path: 'pageLoadingPartScrap' }
              ]
            }
          ]
        },
        { type: 'page', path: 'testPage' }
    ];
    <RenderRecursiveMenu structure={folderStructure} pageData={pagesData} onClick={onCloseSideMenu} />
 */
export const RenderRecursiveMenu = ({ structure = [], pageData = [], onClick }) => {
    return (
      <>
        {structure.map((item, idx) => {
          if (item.type === 'page') {
            return (
              <CreateMenuSinglePage
                key={item.path + idx}
                data={pageData}
                pagePath={item.path}
                onClick={onClick}
              />
            );
          } 
          else if (item.type === 'folder') {
            return (
              <Accordion key={item.name + idx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Folder sx={{ mr: 1 }} />
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pl: 2 }}>
                  <List disablePadding>
                    <RenderRecursiveMenu structure={item.children} pageData={pageData} onClick={onClick} />
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          }
          else {
            return null;
          }
        })}
      </>
    );
};