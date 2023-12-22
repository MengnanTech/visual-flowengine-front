import axios, {AxiosInstance, AxiosResponse} from "axios";
import {message} from 'antd'
import {InternalAxiosRequestConfig} from "axios";
import {accessToken} from "@/config/Constant.ts";

const instance: AxiosInstance = axios.create({
    timeout: 10000, // 设置超时时间10s
    baseURL: "https://www.ikuning.com",   //根据自己配置的反向代理去设置不同环境的baeUrl
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
})
const httpCode: any = {
    400: '请求参数错误',
    401: '权限不足, 请重新登录',
    403: '服务器拒绝本次访问',
    404: '请求资源未找到',
    500: '内部服务器错误',
    501: '服务器不支持该请求中使用的方法',
    502: '网关错误',
    504: '网关超时'
}
export interface Result<T> {
    code: number;
    requestId: string;
    data: T;
    msg: string;
}

/** 添加请求拦截器 **/
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!config.url?.includes("/public")) {
        const token = localStorage.getItem(accessToken);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
}, error => {
    // 对请求错误做些什么
    return Promise.reject(error)
})

/** 添加响应拦截器  **/
instance.interceptors.response.use((response: AxiosResponse) => {

    if (response.status === 200 && response.data.code === 200) {

        return Promise.resolve(response)
    } else {
        message.error("请求错误：" + response.data.msg).then(r => r);
        return Promise.reject(response.data)
    }
}, (error) => {

    if (error.response) {
        // // 根据请求失败的http状态码去给用户相应的提示
        const tips = error.response.status in httpCode ? httpCode[error.response.status] : error.response.data.message
        message.error("请求错误：" + tips).then(r => r)
        // // token或者登陆失效情况下跳转到登录页面，根据实际情况，在这里可以根据不同的响应错误结果，做对应的事。这里我以401判断为例
        if (error.response.status === 401) {
            //针对框架跳转到登陆页面
        }
        return Promise.reject(error)
    } else {
        message.error('请求超时, 请刷新重试').then(r => r)
        return Promise.reject('请求超时, 请刷新重试')
    }
})

/**
 * 封装get方法
 * @param url  请求url
 * @param params  请求参数
 * @returns {Promise}
 */
export function get<T>(url: string, params: any): Promise<Result<T>> {
    return new Promise<Result<T>>((resolve, reject) => {
        instance.get(url, {params: params,}).then((response) => {
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        });
    });
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post<T>(url: string, data: any): Promise<Result<T>> {
    return new Promise<Result<T>>((resolve, reject) => {
        instance.post(url, data).then((response) => {
                resolve(response.data);
            },
            (err) => {
                reject(err);
            }
        );
    });
}


/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put<T>(url: string, data: any): Promise<Result<T>> {
    return new Promise<Result<T>>((resolve, reject) => {
            instance.put(url, data).then(
                (response) => {
                    resolve(response.data);
                },
                (err) => {
                    reject(err);
                }
            );
        }
    );
}
