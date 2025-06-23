/** 색상 테마 객체 */
export const paletteThemes = {
  // 기본 테마
  default: {
    palette: {
      mode: "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
      background: { default: "#ffffff", paper: "#f5f5f5" },
      text: { primary: "#000000" },
    },
  },
  // 주간 테마
  light: {
    palette: {
      mode: "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
      background: { default: "#ffffff", paper: "#f5f5f5" },
      text: { primary: "#000000" },
    },
  },
  // 야간 테마
  dark: {
    palette: {
      mode: "dark",
      primary: { main: "#ff5722" },
      secondary: { main: "#8e24aa" },
      background: { default: "#121212", paper: "#1e1e1e" },
      text: { primary: "#ffffff" },
    },
  },
  // 노랑 테마
  light_Yellow: {
      palette: {
        mode: "light",
        primary: { main: "#fbc02d" },
        secondary: { main: "#ffa000" },          
        text: { primary: "#212121" },
      },
  },
  // 빨강 테마
  light_Red: {
      palette: {
          mode: "light",
          primary: { main: "#d32f2f" },
          secondary: { main: "#b71c1c" },            
          text: { primary: "#212121" },
      },
  },
  // 다크 블루 테마
  dark_Blue: {
    palette: {
        mode: "dark",
        primary: { main: "#0D47A1" }, // 기존 파랑보다 어두운 톤
        secondary: { main: "#1565C0" }, // 서브 색상도 짙은 파랑
        background: { default: "#121212", paper: "#1E3A5F" }, // 다크모드에 적합한 블루 계열
        text: { primary: "#ffffff" },
    },
  },
  // 다크 카키 테마
  dark_khaki: {
      palette: {
        mode: "dark",
        primary: { main: "#2A6137" },
        secondary: { main: "#667700" },           
        text: { primary: "#ffffff" },
      },
  },    
};