import {post} from "./http";
import {UsernameLoginRequest, WorkflowRequest} from "./model/request.ts";

//用户相关
export const loginAPI = (data: UsernameLoginRequest) => post<string>('/api/public/username/login', data);


//workflow相关
export const execScriptAPI = (data: WorkflowRequest) => post<null>('/api/engine/exec', data);


//帖子相关

