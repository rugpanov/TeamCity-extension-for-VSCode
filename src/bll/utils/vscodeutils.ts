import {extensions, version} from "vscode";
import {Constants} from "./constants";

export class VsCodeUtils {

    private static extensionVersion: string;

    public static getUserAgentString() : string {
        this.extensionVersion = this.extensionVersion || extensions.getExtension(Constants.EXTENSION_ID).packageJSON.version;
        return `${Constants.VISUAL_STUDIO_CODE}/${version} (TeamCity Integration ${this.extensionVersion})`;
    }
}
