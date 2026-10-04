import { createTheme, createBox, createText } from '@shopify/restyle';
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const scale = (size: number) => PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
const verticalScale = (size: number) => PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
const moderateScale = (size: number, factor = 0.5) => PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor);

const lightTheme = createTheme({
  colors: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    card: "#FFFFFF",

    textPrimary: "#191D29",
    textSecondary: "#6F7583",
    textMuted: "#A5ABB6",
    textInverse: "#FFFFFF",
    modalOverlay: 'rgba(0, 0, 0, 0.5)',

    primary: "#289653",
    primaryDark: "#1E7A42",
    primaryLight: "#E4F5EA",
    success: "#289653",
    successLight: "#E4F5EA",

    danger: "#FF4747",
    dangerLight: "#FFE3E3",

    warning: "#F5B82E",
    warningLight: "#FFF2CC",

    income: "#289653",
    incomeLight: "#E4F5EA",
    expense: "#FF4747",
    expenseLight: "#FFE3E3",

    chartBlue: "#4D8FEA",
    chartPurple: "#8A6FC0",

    inputBackground: "#F1F3F6",
    inputBorder: "#CDD5DF",
    inputBorderFocus: "#289653",
    inputBorderError: "#FF4747",
    placeholder: "#A5ABB6",

    icon: "#191D29",
    iconMuted: "#737986",
    border: "#ECEFF3",
    divider: "#F0F2F5",
    tabInactive: "#737986",
  },

  spacing: {
    none: 0,
    xs: scale(4),
    s: scale(8),
    m: scale(16),
    l: scale(24),
    xl: scale(32),
    xxl: scale(40),
  },

  borderRadii: {
    none: 0,
    xs: scale(4),
    s: scale(8),
    m: scale(12),
    l: scale(16),
    xl: scale(24),
  },

  textVariants: {
    defaults: {
      color: 'textPrimary',
      fontSize: moderateScale(14),
    },
    titleLarge: {
      fontSize: moderateScale(24),
      fontWeight: '700',
    },
    titleMedium: {
      fontSize: moderateScale(18),
      fontWeight: '600',
    },
    body: {
      fontSize: moderateScale(14),
    },
    caption: {
      fontSize: moderateScale(12),
      color: 'textSecondary',
    },
  },

  breakpoints: {
    phone: 0,
    tablet: 768,
  },
});

const darkTheme = createTheme({
  ...lightTheme,
  colors: {
    ...lightTheme.colors,

    background: "#0E1014",
    surface: "#1A1D23",
    card: "#1A1D23",

    textPrimary: "#FFFFFF",
    textSecondary: "#A3A8B3",
    textMuted: "#6E7480",
    textInverse: "#191D29",

    modalOverlay: 'rgba(0, 0, 0, 0.7)',

    primary: "#3DA65A",
    primaryDark: "#2E8748",
    primaryLight: "#1F3A28",

    success: "#3DA65A",
    successLight: "#1F3A28",

    danger: "#F05A5A",
    dangerLight: "#3A2020",

    warning: "#D9A441",
    warningLight: "#3A3120",

    income: "#3DA65A",
    incomeLight: "#1F3A28",

    expense: "#F05A5A",
    expenseLight: "#3A2020",

    chartBlue: "#5C9CFF",
    chartPurple: "#9A7BFF",

    inputBackground: "#20242C",
    inputBorder: "#2A2F39",
    inputBorderFocus: "#3DA65A",
    inputBorderError: "#F05A5A",

    placeholder: "#6E7480",

    icon: "#FFFFFF",
    iconMuted: "#8C929E",

    border: "#2A2F39",
    divider: "#20242C",

    tabInactive: "#8C929E",
  },
});

export type Theme = typeof lightTheme;
export const Box = createBox<Theme>();
export const Text = createText<Theme>();

export { lightTheme, darkTheme, scale, verticalScale, moderateScale };