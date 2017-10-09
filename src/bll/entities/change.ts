"use strict";

import {Build} from "./build";
import {Logger} from "../utils/logger";

export class Change {

    public readonly id: number;
    public readonly isPersonal: boolean;
    public readonly status: string;
    public builds: Build[]; //TODO: make readonly

    public constructor(id: number, isPersonal: boolean, status: string, builds: Build[]) {
        this.id = id;
        this.isPersonal = isPersonal;
        this.status = status;
        this.builds = builds;
    }

    public toString(): string {
        return `${this.id}:${this.status}`;
    }

    public static fromXmlRpcObject(changeObj: any): Change {
        if (!changeObj) {
            throw "Not Change Object Error";
        }
        const isPersonal: boolean = Change.isPersonal(changeObj);
        const id: number = Change.getId(changeObj);
        const status: string = Change.getStatus(changeObj);
        const builds: Build[] = Change.getBuilds(changeObj);

        const instance: Change = new Change(id, isPersonal, status, builds);
        return instance;
    }

    private static isPersonal(changeObj: any): boolean {
        if (!changeObj ||
            !changeObj.mod ||
            !changeObj.mod[0] ||
            changeObj.mod[0].personal === undefined ||
            changeObj.mod[0].personal[0] === undefined) {
            Logger.logDebug(`ChangeItemProxy#isPersonal: isPersonal is not reachable. default: false`);
            return false;
        }
        return (changeObj.mod[0].personal[0] === "true");
    }

    private static getId(changeObj: any): number {
        if (!changeObj ||
            !changeObj.mod ||
            !changeObj.mod[0] ||
            changeObj.mod[0].id === undefined ||
            changeObj.mod[0].id[0] === undefined) {
            Logger.logDebug(`ChangeItemProxy#id: id is not reachable. default: -1`);
            return -1;
        }
        return changeObj.mod[0].id[0];
    }

    private static getStatus(changeObj: any): string {
        if (!changeObj ||
            !changeObj.myStatus ||
            !changeObj.myStatus[0]) {
            Logger.logDebug(`ChangeItemProxy#status: status is not reachable. default: UNKNOWN`);
            return "UNKNOWN";
        }
        return changeObj.myStatus[0];
    }

    private static getBuilds(changeObj: any): Build[] {
        if (!changeObj ||
            !changeObj.myTypeToInstanceMap ||
            !changeObj.myTypeToInstanceMap[0] ||
            !changeObj.myTypeToInstanceMap[0].entry ||
            !changeObj.myTypeToInstanceMap[0].entry[0] ||
            !changeObj.myTypeToInstanceMap[0].entry[0].Build ||
            !changeObj.myTypeToInstanceMap[0].entry[0].Build[0] ||
            !changeObj.myTypeToInstanceMap[0].entry[0].Build[0].id) {
            Logger.logDebug(`ChangeItemProxy#constructor: builds is not reachable`);
            return [];
        }
        const builds: Build[] = [];
        changeObj.myTypeToInstanceMap[0].entry.forEach((entry) => {
            if (entry && entry.Build && entry.Build[0]) {
                builds.push(Build.fromXmlRpcObject(entry.Build[0]));
            }
        });
        return builds;
    }

}