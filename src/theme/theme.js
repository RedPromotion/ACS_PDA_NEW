//라이브러리 사용
import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

//테마 가져오기
import { paletteThemes } from "./paletteTheme"; // 색상 가져오기
import { typographyThemes } from "./fontTheme"; // 폰트 가져오기

/**
 * 🎨 동적으로 MUI 테마를 생성하는 함수
 * 
 * @param {object} options - 테마 옵션 객체
 * @param {"default" | "light" | "dark" | "dark_Blue" | "light_Yellow" | "light_Red" | "dark_khaki"} [options.themeMode="default"] - 적용할 테마 모드z
 * @param {"default" | "comic" | "impact" | "serif" | "sansSerif" | "monospace" | "fantasy" | "cursive" | "systemDefault" | "ridibatang"} [options.fontStyle="default"] - 적용할 폰트 스타일
 * 
 * @author sj_hong
 * @updated 2025-02-19T17:00:00Z
 * @example
 * // 기본 테마 사용
 * const theme = getTheme();
 * 
 * // 기본 테마 + 기본 폰트 명시적 사용
 * const defaultTheme = getTheme({ themeMode: "default", fontStyle: "default" });
 * 
 * // 다크 테마 + Comic Sans 폰트 적용
 * const darkComicTheme = getTheme({ themeMode: "dark", fontStyle: "comic" });
 */
export const getTheme = ({ themeMode = "default", fontStyle = "default" } = {}) => { 
  
  // 유효하지 않은 theme 매개변수 값 처리
  const validThemeMode = paletteThemes[themeMode] ? themeMode : "default";
  const validFontStyle = typographyThemes[fontStyle] ? fontStyle : "default";  
  const fontAddOption = {
    components: {
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            fontFamily: 'inherit', // 전체 테마의 폰트를 따르도록 설정
            fontSize: 'inherit',
          },
        },
      },
  },
  }

  return createTheme(
    deepmerge(
      paletteThemes[validThemeMode], 
      deepmerge(
        typographyThemes[validFontStyle], fontAddOption
      )
    )
  );
};

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
**************************************************************************************************************************/
/****************************************************************************************
✅ 테마 적용 예시
******************

import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "./theme"; // 테마 설정 파일

const theme = getTheme("dark", "comic"); // 🌙 다크 테마 + 코믹 산스 폰트 적용

export default function App() {
  return (
    <ThemeProvider theme={theme}>
        // 나머지 코드
    </ThemeProvider>
    );
  }

****************************************************************************************
✅ 동적 테마 변경 가능 설정 예시 
*******************************

const [themeMode, setThemeMode] = useState("light");
const [fontStyle, setFontStyle] = useState("default");

const theme = getTheme(themeMode, fontStyle);

<ThemeProvider theme={theme}>
  <button onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}>
    테마 변경
  </button>
  <button onClick={() => setFontStyle(fontStyle === "default" ? "comic" : "default")}>
    폰트 변경
  </button>
</ThemeProvider>;

****************************************************************************************/