import {ExpandableItem} from "./expandableitem";
import {TreeItemCollapsibleState} from "vscode";
import {Parameter} from "../Parameter";
import {ParameterItem} from "./ParameterItem";

export class ParametersSetItem extends ExpandableItem {
    public readonly children: ParameterItem[] = [];

    constructor(label: string, params: Parameter[]) {
        super(label, TreeItemCollapsibleState.Expanded);

        if (params.length === 0) {
            this.collapsibleState = TreeItemCollapsibleState.None;
        }

        params.forEach((param) => {
            this.children.push(new ParameterItem(param));
        });

        this.contextValue = label.toLowerCase().replace(" ", "_");
    }

    public updateParameters(params: Parameter[]) {
        if (params.length === 0) {
            this.collapsibleState = TreeItemCollapsibleState.None;
        } else if (this.collapsibleState === TreeItemCollapsibleState.None) {
            this.collapsibleState = TreeItemCollapsibleState.Expanded;
        }

        this.children.length = 0;
        params.forEach((param) => {
            this.children.push(new ParameterItem(param));
        });
    }

    public hasChildren() {
        return this.children && this.children.length !== 0;
    }
}
