import { HEIGHT, MARGIN_WIDTH, MIN_LEDGE, Side, WIDTH } from "@/configs/constants";
import React, { JSX, useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { snapPoint, useVector } from "react-native-redash";
import Wave from "./wave";

const PREV = WIDTH;
const NEXT = 0;
const LEFT_SNAP_POINTS = [MARGIN_WIDTH, PREV];
const RIGHT_SNAP_POINTS = [NEXT, WIDTH - MARGIN_WIDTH];

interface SliderProps {
  index: number;
  setIndex: (value: number) => void;
  children: JSX.Element;
  prev?: JSX.Element;
  next?: JSX.Element;
}

const Slider = ({
  index,
  children: current,
  prev,
  next,
  setIndex,
}: SliderProps) => {
  const hasPrev = !!prev;
  const hasNext = !!next;
  const zIndex = useSharedValue(0);
  const activeSide = useSharedValue(Side.NONE);
  const isTransitionLeft = useSharedValue(false);
  const isTransitionRight = useSharedValue(false);
  const left = useVector(MIN_LEDGE, HEIGHT / 2);
  const right = useVector(MIN_LEDGE, HEIGHT / 2);

	  const panGesture = Gesture.Pan()
	    .onStart(({ x }) => {
	      if (x <= MARGIN_WIDTH && hasPrev) {
	        activeSide.set(Side.LEFT);
	        zIndex.set(100);
	      } else if (x >= WIDTH - MARGIN_WIDTH && hasNext) {
	        activeSide.set(Side.RIGHT);
	      } else {
	        activeSide.set(Side.NONE);
	      }
	    })
	    .onUpdate(({ x, y }) => {
	      if (activeSide.get() === Side.LEFT) {
	        left.x.set(Math.max(x, MARGIN_WIDTH));
	        left.y.set(y);
	      } else if (activeSide.get() === Side.RIGHT) {
	        right.x.set(Math.max(WIDTH - x, MARGIN_WIDTH));
	        right.y.set(y);
	      }
	    })
	    .onEnd(({ x, velocityX, velocityY }) => {
	      if (activeSide.get() === Side.LEFT) {
	        const dest = snapPoint(x, velocityX, LEFT_SNAP_POINTS);
	        isTransitionLeft.set(dest === PREV);
	        left.x.set(withSpring(
	          dest,
	          {
	            velocity: velocityX,
	            overshootClamping: isTransitionLeft.get() ? true : false,
	            damping: isTransitionLeft.get() ? 100 : 0.01,
	            mass: isTransitionLeft.get() ? 100 : 0.01,
	          },
	          () => {
	            if (isTransitionLeft.get()) {
	              runOnJS(setIndex)(index - 1);
	            } else {
	              zIndex.set(0);
	              activeSide.set(Side.NONE);
	            }
	          }
	        ));
	        left.y.set(withSpring(HEIGHT / 2, { velocity: velocityY }));
	      } else if (activeSide.get() === Side.RIGHT) {
	        const dest = snapPoint(x, velocityX, RIGHT_SNAP_POINTS);
	        isTransitionRight.set(dest === NEXT);
	        right.x.set(withSpring(
	          WIDTH - dest,
	          {
	            velocity: velocityX,
	            overshootClamping: isTransitionRight.get() ? true : false,
	            damping: isTransitionRight.get() ? 100 : 0.01,
	            mass: isTransitionRight.get() ? 100 : 0.01,
	          },
	          () => {
	            if (isTransitionRight.get()) {
	              runOnJS(setIndex)(index + 1);
	            } else {
	              activeSide.set(Side.NONE);
	            }
	          }
	        ));
	        right.y.set(withSpring(HEIGHT / 2, { velocity: velocityY }));
	      }
	    });

	  const leftStyle = useAnimatedStyle(() => ({
	    zIndex: zIndex.get(),
	  }));

	  useEffect(() => {
	    if (Platform.OS === "ios") {
	      right.x.set(withSpring(WIDTH * 0.167));
	    } else {
	      right.x.set(withSpring(WIDTH * 0.185));
	    }
	  }, [left, right]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={StyleSheet.absoluteFill}>
        {current}
        {prev && (
          <Animated.View style={[StyleSheet.absoluteFill, leftStyle]}>
            <Wave
              side={Side.LEFT}
              position={left}
              isTransitioning={isTransitionLeft}
            >
              {prev}
            </Wave>
          </Animated.View>
        )}
        {next && (
          <View style={StyleSheet.absoluteFill}>
            <Wave
              side={Side.RIGHT}
              position={right}
              isTransitioning={isTransitionRight}
            >
              {next}
            </Wave>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default Slider;
