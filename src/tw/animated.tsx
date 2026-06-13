import React from 'react';
import {
  ScrollView as RNScrollView,
  Text as RNText,
  View as RNView,
} from 'react-native';
import RNAnimated from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { PressableScale } from './index';

const AnimatedView = withUniwind(RNAnimated.createAnimatedComponent(RNView));
const AnimatedScrollView = withUniwind(
  RNAnimated.createAnimatedComponent(RNScrollView),
);
const AnimatedText = withUniwind(RNAnimated.createAnimatedComponent(RNText));
const AnimatedPressableScale = withUniwind(
  RNAnimated.createAnimatedComponent(
    PressableScale as React.ComponentType<any>,
  ),
);

export const Animated = {
  ...RNAnimated,
  View: AnimatedView,
  ScrollView: AnimatedScrollView,
  Text: AnimatedText,
  PressableScale: AnimatedPressableScale,
};
