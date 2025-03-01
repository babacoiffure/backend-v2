import { WSManager } from "../libraries/ws-manager";
import { chatEventsHandler } from "./events/chat.event";

export const wsManager = new WSManager();

wsManager.addEvents("chat/message:read", chatEventsHandler.events);
