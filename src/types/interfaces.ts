import type { ActionType } from './enums';

export interface IAction {
  type: ActionType | null;
  position: number;
  uuid: string;
}

export interface IRoom {
  uid: string;
  title: string,
  lastAction: IAction;
  videoLink: string;
}
