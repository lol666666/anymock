import fetch from 'isomorphic-fetch';
import {assign} from 'lodash';

require('es6-promise').polyfill();

// 定义 fetch 默认选项， 看 https://github.com/github/fetch
const defaultOptions = {
    method: 'post',
    credentials: 'include', //设置该属性可以把 cookie 信息传到后台
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'x-requested-with': 'XMLHttpRequest'
    }
};

function checkStatus(response) {
    const status = response.status;
    if (status >= 200 && status < 300) {
        return response;
    }
    let error = new Error(response.statusText);
    error.response = response;
    error.errorCode = status;
    throw error;
}

/**
 * 封装 fetch
 * 根据业务需求，还可以在出错的地方处理相应的功能
 * @param url
 * @param body //往后台传递的 json 参数
 * @param options // 可选参数项
 * @param loginVerify // 是否在该方法中校验登录
 * @returns {Promise.<TResult>}
 */
function request({url, body = {}, options, loginVerify = true}) {
    if (!url) {
        let error = new Error('请传入 url');
        error.errorCode = 0;
        return Promise.reject(error);
    }


    /*    const protocol = location.protocol;
     let fullUrl;
     if (url.indexOf('http') === 0) {
     fullUrl = url;
     } else {
     fullUrl = (url.indexOf(URL_ROOT) === -1) ? protocol + URL_ROOT + url : protocol + url;
     }*/

    let _options = assign({}, defaultOptions, options);
    if(_options.method !== 'GET'){
        let _body = assign({}, body);

        Object.keys(_body).forEach((item) => {
            if (_body[item] === null || _body[item] === undefined ||
                _body[item] === 'null' || _body[item] === 'undefined') {
                delete _body[item];
            }
        });
        _options.body = JSON.stringify(_body);
    }

    return fetch(url, _options)
        .then(checkStatus)
        .then(response =>
            response.json().then(json => ({json, response}))
        ).then(({json, response}) => {
            if (json.code != 0) {
                let error = new Error(json.msg);
                error.code = json.code;
                return Promise.reject(error);
            }
            return {json, response};
        }).catch((error) => {
            return Promise.reject(error);
        });
}

function get(url,options={}) {
    options.method='GET';
    return request({url,options})
}
function post(url,params={}) {
    return request({url,options:params.options,body:params.body})
}
function del(url,params={}) {
    params.options = params.options || {};
    params.options.method='DELETE';
    return request({url,options:params.options,body:params.body})
}

export default {
    get,
    post,
    del,
    fetch:fetch
};
