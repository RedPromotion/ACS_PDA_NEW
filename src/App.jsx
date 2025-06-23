import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme/theme.js"
import Home from "@mui/icons-material/Home";
import CodeIcon from '@mui/icons-material/Code';

//컨텍스트
import { RootProvider } from "./context/RootContext.jsx";

//베이스 페이지
import Login        from './pages/base/Login'; 
import HomePage     from './pages/base/HomePage';
import TopBar       from './pages/base/TopBar';
import SideMenubar  from "./pages/base/SideMenubar.jsx";

//개발 페이지
import TestPage   from './pages/dev/TestPage';
import SamplePage from './pages/dev/SamplePage.jsx'

/*******************************************************************************************
 * @name App.jsx
 * @description PDA SYSTEM App
*******************************************************************************************/
export default function App() {

  const pages = [
    //기본
    { path:'HomePage', name:'HomePage', element:<HomePage/>, icon:<Home/>},
    //개발 및 참조 페이지
    { path:'TestPage', name:'TestPage', element:<TestPage/>, icon:<CodeIcon/>}, //개발 중 테스트하는 페이지
    { path:'SamplePage', name:'SamplePage', element:<SamplePage/>},//샘플 참조페이지 (커스텀훅 위주)
    // ... 하위에 페이지 추가 ...
  ]

  /** pages객체에 따라 route만들어주는 함수 */
  const onRoute = (pages) => {
    return(
      <>
        {pages.map((page) => (
          <Route
            exact
            key={page.path}
            path={page.path}
            element={<>{page.element}</>}
          />
        ))}
      </>
    )
  }

  return ( 
    <ThemeProvider theme={getTheme({ themeMode: 'default', fontStyle: "default" })}>
      <RootProvider>
        <CssBaseline />
          {/* 라우팅 */}
          <BrowserRouter basename={"/"}>
            {/* 탑바 & 사이드메뉴바 생성  */}
            <TopBar pagesData={pages}/>
            <SideMenubar pagesData={pages}/>
            {/* 주소 라우팅 */}
            <Routes>
              {/* 로그인 페이지 */}
              <Route path="/" element={<Login />} />
              <Route path="/Login" element={<Login />} />
              {/* 운영되는 페이지 */}
              {onRoute(pages)}
            </Routes>
          </BrowserRouter>
      </RootProvider>
    </ThemeProvider> 
  );
}