import { createAction } from 'redux-actions';
import { ICanvasWidthProps, IDeviceTypes } from './contexts';

export enum CanvasConfigActionEnums {
  SetCanvasWidth = 'SET_FORM_WIDTH',
  SetCanvasZoom = 'SET_FORM_ZOOM',
  SetDesignerDevice = 'SET_DESIGNER_DEVICE',
  SetScreenWidth = 'SET_SCREEN_WIDTH',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setCanvasZoomAction = createAction<number, number>(CanvasConfigActionEnums.SetCanvasZoom, (p) => p);

export const setCanvasWidthAction = createAction<ICanvasWidthProps, ICanvasWidthProps>(CanvasConfigActionEnums.SetCanvasWidth, (p) => p);

export const setScreenWidthAction = createAction<number, number>(CanvasConfigActionEnums.SetScreenWidth, (p) => p);

export const setDesignerDeviceAction = createAction<IDeviceTypes, IDeviceTypes>(CanvasConfigActionEnums.SetDesignerDevice, (p) => p);
/* NEW_ACTION_GOES_HERE */
