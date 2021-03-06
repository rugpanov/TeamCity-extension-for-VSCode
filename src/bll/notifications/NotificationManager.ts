import {TcNotificationMessage} from "./TcNotificationMessage";
import {MessageManager} from "../../view/messagemanager";
import {TYPES} from "../utils/constants";
import {inject, injectable} from "inversify";
import opn = require("opn");
import {TcNotificationStatus} from "./TcNotificationStatus";

@injectable()
export class NotificationManager {
    private static readonly OPEN_IN_BROWSER: string = "Open in Browser";
    public constructor(@inject(TYPES.MessageManager) private readonly myMassageManager: MessageManager) {
        //
    }

    public async showNotificationMessage(notificationMessage: TcNotificationMessage): Promise<void> {
        if (!notificationMessage || !notificationMessage.myMessage) {
            return;
        }

        const messageToShow: string = `[${notificationMessage.myEventType.myName}] ${notificationMessage.myMessage}`;
        const messageItem: MessageItem = {title: NotificationManager.OPEN_IN_BROWSER};

        const notificationStatus: TcNotificationStatus
            = TcNotificationStatus.getStatus(notificationMessage.myEventType.myStatus);

        let result: MessageItem;
        if (notificationStatus.isSuccessful()) {
            result = await this.myMassageManager.showInfoMessage(messageToShow, messageItem);
        } else if (notificationStatus.isFailed()) {
            result = await this.myMassageManager.showErrorMessage(messageToShow, messageItem);
        } else {
            result = await this.myMassageManager.showWarningMessage(messageToShow, messageItem);
        }

        if (result && result.title === NotificationManager.OPEN_IN_BROWSER) {
            opn(notificationMessage.myDetailLink);
        }
    }
}

interface MessageItem {
    title: string;
}
