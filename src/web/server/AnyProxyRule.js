/**
 * Created by tanxiangyuan on 16/8/22.
 */
import util from '../../models/util';

function mergeCORSHeader(reqHeader, originHeader) {
    var targetObj = originHeader || {};

    delete targetObj["Access-Control-Allow-Credentials"];
    delete targetObj["Access-Control-Allow-Origin"];
    delete targetObj["Access-Control-Allow-Methods"];
    delete targetObj["Access-Control-Allow-Headers"];

    targetObj["access-control-allow-credentials"] = "true";
    targetObj["access-control-allow-origin"] = reqHeader['origin'] || "-___-||";
    targetObj["access-control-allow-methods"] = "GET, POST, PUT";
    targetObj["access-control-allow-headers"] = reqHeader['access-control-request-headers'] || "-___-||";

    return targetObj;
}
function findInterfaceDefByUrl(model, url) {
    if (model.interfaces) {
        //按路径长度倒排接口路径,最大匹配策略
        var sortedInterfacePath = _.sortBy(Object.getOwnPropertyNames(model.interfaces), (o)=> {
                return -o.length;
            }),
            length = sortedInterfacePath.length;
        for (var i = 0; i < length; i++) {
            if (url.match(util.buildRegExp(sortedInterfacePath[i]))) {
                return model.interfaces(sortedInterfacePath[i]);//终止循环
            }
        }

    }
    return false;
}
function buildUrlModel(url) {
    var matches = url.match(/(http.?):\/\/(.*\.[^:]*):?([\d]{1,4})?(.*)?/);
    if (matches) {
        return {
            protocol: matches[1] || 'http',
            host: matches[2],
            port: matches[3] || 80,
            pathAndQuery: matches[4] || '/'
        }
    }
}
module.exports.buildRule = function (model) {
    return {
        summary: function () {
            return "this is a anymock rule for AnyProxy";
        },
        shouldInterceptHttpsReq: function (req) {
            return true;
        },
        replaceRequestData: function (req, data) {
            return data;
        },
        replaceResponseStatusCode: function (req, res, statusCode) {
            return statusCode;
        },

        shouldUseLocalResponse: function (req, reqBody) {
            return model.crossDomain || model.interfaces != null;
        },
        dealLocalResponse: function (req, reqBody, callback) {
            var headers = req.headers,
                body = '',
                code = 200;
            if (model.crossDomain && req.method == "OPTIONS") {
                headers = mergeCORSHeader(headers);
            }
            var interfaceDef = findInterfaceDefByUrl(model, req.url);
            if (interfaceDef) {
                if (interfaceDef.rewriteData) {
                    body = interfaceDef.rewriteData;
                } else if (interfaceDef.outputs) {
                    //TODO:验证输入参数
                    //TODO:根据outputs生成mock数据

                }
            }
            callback(code, headers, body);
        },
        replaceServerResDataAsync: function (req, res, serverResData, callback) {
            var newDataStr = serverResData.toString();
            if (/html/i.test(res.headers['content-type'])) {

                if (model.addConsole) {
                    newDataStr += '<script src=\"//cdn.jsdelivr.net/eruda/1.0.0/eruda.min.js\"></script><script>eruda.init();</script>';
                }
                if (model.appendHtml) {
                    newDataStr += model.appendHtml;
                }
            }
            callback(newDataStr);
        },
        replaceRequestProtocol: function (req, protocol) {
            var interfaceDef = findInterfaceDefByUrl(model, req.url),
                matches;
            if (interfaceDef && interfaceDef.rewriteURL && (matches = interfaceDef.rewriteURL.match(/(http.?):\/\//))) {
                return matches[1] || protocol;
            }
            return protocol;
        },
        replaceRequestOption: function (req, option) {
            var newOption = option;
            if (model.clearCache) {
                delete newOption.headers['if-none-match'];
                delete newOption.headers['if-modified-since'];
            }
            var interfaceDef = findInterfaceDefByUrl(model, req.url);
            if (interfaceDef && interfaceDef.rewriteURL) {
                var urlModel = buildUrlModel(interfaceDef.rewriteURL);
                newOption.hostname = urlModel.host;
                if (urlModel.port && urlModel.port != 80) {
                    newOption.port = urlModel.port;
                }
                newOption.path = urlModel.pathAndQuery;
            }
            return newOption;
        },
        replaceResponseHeader: function (req, res, header) {
            header = header || {};
            if (model.clearCache) {
                header["Cache-Control"] = "no-cache, no-store, must-revalidate";
                header["Pragma"] = "no-cache";
                header["Expires"] = 0;
            }
            if(model.crossDomain){
                header = mergeCORSHeader(req.headers,header);
            }
            return header;
        }
    }
};