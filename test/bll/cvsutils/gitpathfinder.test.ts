"use strict";

import {assert} from "chai";
import {Process} from "../../../src/bll/moduleinterfaces/process";
import {GitPathFinder} from "../../../src/bll/cvsutils/gitpathfinder";
import {AsyncChildProcess} from "../../../src/bll/moduleinterfaces/asyncchildprocess";
import {AsyncFs} from "../../../src/bll/moduleinterfaces/asyncfs";
import {MessageConstants} from "../../../src/bll/utils/messageconstants";

suite("Git Path Finder", () => {
    test("should handle \"git\" path for win32", function (done) {
        const processMock = new ProcessMock("win32");
        const childProcessMock = new GitInPathChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "git");
                done();
            }
        );
    });

    test("should handle \"git\" path for linux", function (done) {
        const processMock = new ProcessMock("linux");
        const childProcessMock = new GitInPathChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "git");
                done();
            }
        );
    });

    test("should handle \"git\" path for macOS", function (done) {
        const processMock = new ProcessMock("darwin");
        const childProcessMock = new GitInPathChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "git");
                done();
            }
        );
    });

    test("should handle \"git\" in the \"ProgramFiles/Git/cmd\" for win32", function (done) {
        const processMock = new ProcessMock("win32");
        const childProcessMock = new GitInProgramFilesFolderChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "ProgramFilesPath\\Git\\cmd\\git.exe");
                done();
            }
        );
    });

    test("should handle \"git\" in the \"PortableGitFolder\" for win32", function (done) {
        const processMock = new ProcessMock("win32");
        const childProcessMock = new GitInGitHubFolderChildProcessMock();
        const fsMock = new ReadPortableGitFolderFsMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock, fsMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "LOCALAPPDATAPath\\GitHub\\PortableGitFolder\\cmd\\git.exe");
                done();
            }
        );
    });

    test("should handle \"git\" is not installed for win32", function (done) {
        const processMock = new ProcessMock("win32");
        const childProcessMock = new GitIsNotInstalledChildProcessMock();
        const fsMock = new ReadPortableGitFolderFsMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock, fsMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        );
    });

    test("should handle \"git\" is not installed for linux", function (done) {
        const processMock = new ProcessMock("linux");
        const childProcessMock = new GitIsNotInstalledChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        );
    });

    test("should handle \"git\" is not installed for darwin", function (done) {
        const processMock = new ProcessMock("darwin");
        const childProcessMock = new GitIsNotInstalledChildProcessMock();
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, "Git path is not found!");
                done();
            }
        );
    });

    test("should handle \"git\" in the \"/usr/bin/\" for linux with xcode-select installed", function (done) {
        const processMock = new ProcessMock("darwin");
        const xcodeSelectInstalled = true;
        const childProcessMock = new GitInUserBinChildProcessMock(xcodeSelectInstalled);
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().then((gitPath) => {
                assert.equal(gitPath, "/usr/bin/git");
                done();
            }
        );
    });

    test("should handle \"git\" in the \"/usr/bin/\" for linux without xcode-select installed", function (done) {
        const processMock = new ProcessMock("darwin");
        const xcodeSelectInstalled = false;
        const childProcessMock = new GitInUserBinChildProcessMock(xcodeSelectInstalled);
        const gitPathFinder: GitPathFinder = new GitPathFinder(childProcessMock, processMock);
        gitPathFinder.find().catch((err: Error) => {
                assert.equal(err.message, MessageConstants.GIT_PATH_IS_NOT_FOUND);
                done();
            }
        );
    });

});

class ProcessMock implements Process {
    private _platform: NodeJS.Platform;
    constructor(platform: NodeJS.Platform) {
        this._platform = platform;
    }
    public get platform(): NodeJS.Platform {
        return this._platform;
    }
    public get env(): string[] {
        const args = [];
        args["ProgramW6432"] = "ProgramW6432Path";
        args["ProgramFiles(x86)"] = "ProgramFiles(x86)Path";
        args["ProgramFiles"] = "ProgramFilesPath";
        args["LOCALAPPDATA"] = "LOCALAPPDATAPath";
        return args;
    }
}

class GitInPathChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleDarwinWhichGit(arg)
            .then(void 0, () => this.handleGitInPath(arg));
    }

    handleGitInPath(arg: string): Promise<any> {
        if (arg === "\"git\" --version") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    handleDarwinWhichGit(arg: string): Promise<any> {
        if (arg === "which git") {
            const mockObject = {
                stdout: "git"
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}

class GitInProgramFilesFolderChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleGinInProgramFiles(arg);
    }

    handleGinInProgramFiles(arg: string): Promise<any> {
        if (arg === "\"ProgramFilesPath\\Git\\cmd\\git.exe\" --version") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}

class GitInGitHubFolderChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return this.handleGinInProgramFiles(arg);
    }

    handleGinInProgramFiles(arg: string): Promise<any> {
        if (arg === "\"LOCALAPPDATAPath\\GitHub\\PortableGitFolder\\cmd\\git.exe\" --version") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}

class ReadPortableGitFolderFsMock implements AsyncFs {
    readdir(path: string): Promise<string[]> {
        const mockArgs : string[] = [];
        mockArgs.push("PortableGitFolder");
        return Promise.resolve(mockArgs);
    }
}

class GitInUserBinChildProcessMock implements AsyncChildProcess {

    private readonly xcodeSelectInstalled : boolean;
    constructor(xcodeSelectInstalled: boolean = true) {
        this.xcodeSelectInstalled = xcodeSelectInstalled;
    }

    exec(arg: string): Promise<any> {
        return this.handleDarwinWhichGit(arg)
            .then(void 0, () => this.handleGitInPath(arg))
            .then(void 0, () => this.handleDirrectoryCheck(arg));
    }

    handleGitInPath(arg: string): Promise<any> {
        if (arg === "\"/usr/bin/git\" --version") {
            const gitVersion = "git version 2.13.2.windows.1";
            const mockObject = {
                stdout: gitVersion
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    handleDarwinWhichGit(arg: string): Promise<any> {
        if (arg === "which git") {
            const mockObject = {
                stdout: "/usr/bin/git"
            };
            return Promise.resolve<any>(mockObject);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    handleDirrectoryCheck(arg: string): Promise<any> {
        if (arg === "xcode-select -p" && this.xcodeSelectInstalled) {
            return Promise.resolve<any>(undefined);
        } else if (arg === "xcode-select -p" && !this.xcodeSelectInstalled) {
            const err: any = {
                code: 2
            };
            return Promise.reject<any>(err);
        } else {
            return Promise.reject<any>(undefined);
        }
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}

class GitIsNotInstalledChildProcessMock implements AsyncChildProcess {
    exec(arg: string): Promise<any> {
        return Promise.reject<any>(undefined);
    }

    spawn(...args: string[]): Promise<any> {
        return undefined;
    }
}