import { Image as RNImage } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);
const StyledAnimatedExpoImage = withUniwind(AnimatedExpoImage);

type ImageStyle = React.ComponentProps<typeof RNImage>['style'] & {
  objectFit?: React.ComponentProps<typeof RNImage>['contentFit'];
  objectPosition?: React.ComponentProps<typeof RNImage>['contentPosition'];
};

export type ImageProps = Omit<
  React.ComponentProps<typeof AnimatedExpoImage>,
  'style'
> & {
  style?: ImageStyle;
  className?: string;
};

export const Image = (props: ImageProps) => {
  const { className, style, ...rest } = props;
  const flattened = StyleSheet.flatten(style) || {};
  const { objectFit, objectPosition, ...styleRest } = flattened as ImageStyle;

  return (
    <StyledAnimatedExpoImage
      className={className}
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...rest}
      source={
        typeof rest.source === 'string' ? { uri: rest.source } : rest.source
      }
      style={
        styleRest as React.ComponentProps<typeof AnimatedExpoImage>['style']
      }
    />
  );
};
Image.displayName = 'Image';
