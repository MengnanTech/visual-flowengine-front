export interface UsernameLoginRequest {
    username: string;
    password: string;

}
export interface WorkflowRequest {

    requestNo: number;
    workflowName: string;
    scriptParams: Map<string, any>;
    contextParams: Map<string, any>;
}

export interface EmailRegistrationRequest {
    email: string;
    password: string;
}

export interface PhoneRegistrationRequest {
    phoneNumber: string;
    verificationCode: string;
}

export interface UsernameRegistrationRequest {
    username: string;
    password: string;
    captchaCode: string;
    sex: string;
    userTail: string;
}

export interface WechatRegistrationRequest {
    openId: string;
    nickname: string;
}

export interface PostRequest {
    title: string;
    type: number;
    content: string;
    attachments: Attachment[];
    topicContent: string;
    location: Location;
    isDraft: boolean;
}

export interface Attachment {
    name: string;
    url: string;
}


export interface ExecWorkflowFile {
    fileNameList: string[];
    binding: Map<string, any>;
}

export interface RegisterWorkflowMetadata {
    workflowMetadataName: string;
}

export interface ScriptRequest {
    requestUlid: string;
    scriptId: string;
    scriptName: string;
    scriptContent: string;
    scriptLinkContent: string[];
    scriptType: string;
    scriptVersion: string;
    scriptParams: Map<string, any>;
    contextParams: Map<string, any>;
}

export interface SocketRequest {
    session: string;
    roomId: string;
}

export interface WorkflowMetadataQuery {
    workflowMetadataId: number;
    workflowMetadataName: string;
}

export interface WorkflowMetadataRequest {
    workflowMetadataId: number;
    scriptMetadata: ScriptMetadata;
}

export interface ScriptContent {
    scriptDetail: string;
    scriptContentLink: string[];
}

export interface ScriptMetadata {
    scriptId: number;
    scriptContent: ScriptContent;
    scriptName: string;
    scriptType: string;
    scriptVersion: number;
    env: string;
    version: number;
    childrenType: string;
    children: ScriptMetadata[];
}

export interface WorkflowTaskQuery {
    workflowTaskNo: number;
    workflowMetadataId: number;
    workflowTaskName: string;
    workflowTaskStatus: string;
}
