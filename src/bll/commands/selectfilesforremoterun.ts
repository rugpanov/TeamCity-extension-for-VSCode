"use strict";

import {Logger} from "../utils/logger";
import {CheckInInfo} from "../entities/checkininfo";
import {CvsProviderProxy} from "../../dal/cvsproviderproxy";
import {inject, injectable} from "inversify";
import {TYPES} from "../utils/constants";
import {ResourceProvider} from "../../view/dataproviders/resourceprovider";

@injectable()
export class SelectFilesForRemoteRun implements Command {

    private readonly cvsProvider: CvsProviderProxy;
    private readonly resourceProvider: ResourceProvider;

    public constructor(@inject(TYPES.CvsProviderProxy) providerProxy: CvsProviderProxy,
                       @inject(TYPES.ResourceProvider) resourceProvider: ResourceProvider) {
        this.cvsProvider = providerProxy;
        this.resourceProvider = resourceProvider;
    }

    public async exec(): Promise<void> {
        Logger.logInfo("SelectFilesForRemoteRun#exec: start");
        const checkInInfo: CheckInInfo[] = await this.cvsProvider.getRequiredCheckInInfo();
        this.resourceProvider.setContent(checkInInfo);
    }
}
