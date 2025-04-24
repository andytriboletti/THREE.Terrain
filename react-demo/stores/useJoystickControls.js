import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useJoystickControls = create(
  subscribeWithSelector((set, get) => {
    return {
      /**
       * Joystick controls
       */
      joystickDis: 0,
      joystickAng: 0,
      joystickRun: false,
      curButton1Pressed: false,
      curButton2Pressed: false,
      curButton3Pressed: false,
      curButton4Pressed: false,
      curButton5Pressed: false,

      /**
       * Set joystick values
       */
      setJoystick: (dis, ang, run) => {
        set(() => {
          return { joystickDis: dis, joystickAng: ang, joystickRun: run };
        });
      },

      /**
       * Reset joystick values
       */
      resetJoystick: () => {
        set(() => {
          return { joystickDis: 0, joystickAng: 0, joystickRun: false };
        });
      },

      /**
       * Get joystick values
       */
      getJoystickValues: () => {
        return {
          joystickDis: get().joystickDis,
          joystickAng: get().joystickAng,
          joystickRun: get().joystickRun,
        };
      },

      /**
       * Press button 1
       */
      pressButton1: () => {
        set(() => {
          return { curButton1Pressed: true };
        });
      },

      /**
       * Press button 2
       */
      pressButton2: () => {
        set(() => {
          return { curButton2Pressed: true };
        });
      },

      /**
       * Press button 3
       */
      pressButton3: () => {
        set(() => {
          return { curButton3Pressed: true };
        });
      },

      /**
       * Press button 4
       */
      pressButton4: () => {
        set(() => {
          return { curButton4Pressed: true };
        });
      },

      /**
       * Press button 5
       */
      pressButton5: () => {
        set(() => {
          return { curButton5Pressed: true };
        });
      },

      /**
       * Release all buttons
       */
      releaseAllButtons: () => {
        set(() => {
          return {
            curButton1Pressed: false,
            curButton2Pressed: false,
            curButton3Pressed: false,
            curButton4Pressed: false,
            curButton5Pressed: false,
          };
        });
      },
    };
  })
);
