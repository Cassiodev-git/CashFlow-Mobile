import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export function scale(size: number): number {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / BASE_WIDTH) * size);
}

export function verticalScale(size: number): number {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT / BASE_HEIGHT) * size);
}

export function moderateScale(size: number, factor = 0.5): number {
  return PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor);
}

export const ScaledSheet = {
    create: (styles: any) => {
        const scaledStyles: any = {};

        for (const key in styles) {
        scaledStyles[key] = { ...styles[key] };
        for (const prop in styles[key]) {
            const value = styles[key][prop];
            
            if (typeof value === 'number') {
                if (prop === 'fontSize') {
                    scaledStyles[key][prop] = moderateScale(value);
                } 
                else if ([
                    'borderRadius', 
                    'borderTopLeftRadius', 
                    'borderTopRightRadius', 
                    'borderBottomLeftRadius', 
                    'borderBottomRightRadius',
                    'borderWidth',
                    'borderTopWidth',
                    'borderBottomWidth',
                    'borderLeftWidth',
                    'borderRightWidth'
                ].includes(prop)) {
                    scaledStyles[key][prop] = moderateScale(value, 0.3); 
                } 
                else if (['padding', 'paddingLeft', 'paddingRight', 'margin', 'marginLeft', 'marginRight', 'gap', 'width'].includes(prop)) {
                    scaledStyles[key][prop] = scale(value);
                } 
                else if (['height', 'paddingTop', 'paddingBottom', 'marginTop', 'marginBottom', 'top', 'bottom'].includes(prop)) {
                    scaledStyles[key][prop] = verticalScale(value);
                }
            }
        }
        }
        return StyleSheet.create(scaledStyles);
    }
};