import { defineStore } from 'pinia';
import { getDatabase, ref, set, onValue, get, child, remove, type Unsubscribe } from 'firebase/database';
import type { IAction, IRoom } from '../types/interfaces';
import { ActionType } from '../types/enums';

interface IState {
  type: ActionType | null;
  position: number;
  uuid: string;
  rooms: IRoom[];
}

export const useDbStore = defineStore('db', {
  state: (): IState => {
    return { type: null, position: 0, uuid: '', rooms: [] };
  },
  actions: {
    async createRoom(roomUid: string, videoLink: string) {
      await set(ref(getDatabase(), `rooms/${roomUid}/video-link`), videoLink);
    },
    async deleteRoom(roomUid: string) {
      await remove(ref(getDatabase(), `rooms/${roomUid}`));
    },
    async getAllRooms(): Promise<IRoom[]> {
      const snapshot = await get(child(ref(getDatabase()), `rooms`));
      let rooms: IRoom[] = [];

      if (!snapshot.exists()) {
        return rooms;
      }

      snapshot.forEach((childSnapshot) => {
        const foundRoom: IRoom = childSnapshot.val();
        foundRoom.uid = childSnapshot.key!;

        rooms.push(foundRoom);
      });

      return rooms;
    },
    watchRoomList(): Unsubscribe {
      const db = getDatabase();
      const roomsRef = ref(db, 'rooms');

      return onValue(roomsRef, (snapshot) => {
        if (!snapshot.exists()) {
          this.rooms = [];
          return;
        }

        this.rooms = [];

        snapshot.forEach((childSnapshot) => {
          const foundRoom = childSnapshot.val() as IRoom;
          foundRoom.uid = childSnapshot.key!;

          this.rooms.push(foundRoom);
        });

        console.log(this.rooms);
      });
    },
    async setLastAction(action: IAction, roomUid: string) {
      await set(ref(getDatabase(), `rooms/${roomUid}/last-action`), action);
    },
    async watchLastAction(roomUid: string, uuid: string) {
      await this.setLastAction({ type: ActionType.join, position: 0, uuid }, roomUid);
      const db = getDatabase();
      const lastActionRef = ref(db, `rooms/${roomUid}/last-action`);

      onValue(lastActionRef, (snapshot) => {
        if (!snapshot.exists()) {
          this.type = ActionType.kick;
          return;
        }

        const data = snapshot.val();
        this.type = data.type;
        this.position = data.position;
        this.uuid = data.uuid;
      });
    },
    async getVideoLink(roomUid: string): Promise<string | null> {
      const dbRef = ref(getDatabase());
      const spanshot = await get(child(dbRef, `rooms/${roomUid}/video-link`));

      return spanshot.exists() ? (spanshot.val() as string) : null;
    },
  },
});