/**
 * Created by tanxiangyuan on 16/8/18.
 */
'use strict';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import color from 'colorful';
import async from 'async';
import util from '../lib/util';


const anymockHome = util.getAnyMockHome();
const defDir = path.join(anymockHome, 'prj-defs');
const fileReadOptions = {
    encoding: 'utf8'
};


if (!fs.existsSync(defDir)) {
    try {
        fs.mkdirSync(defDir, 0x1ff);
    } catch (e) {
    }
}
function getDefsList(cb) {
    if (!cb) return;
    let fileNames = _.filter(fs.readdirSync(defDir),(fileName)=>{
        return /\.json$/.test(fileName);
    });
    if (fileNames.length > 0) {

        async.parallel(fileNames.map(function (fileName) {
            return function (callback) {
                fs.readFile(path.join(defDir, fileName), fileReadOptions, function (err, data) {
                    callback(err, data && JSON.parse(data));
                })
            }
        }), function (err, result) {
            if (err) {
                console.trace(err);
                cb.call(null, null, err);
            } else {
                cb.call(null, _.reject(result, function (o) {
                    return !o;
                }));
            }
        });

    } else {
        cb.call(null, {})
    }
}
function buildFilePathById(prjId) {
    return path.join(defDir, prjId + '.json');
}
/**
 * 获取全部的项目定义
 * @param cb
 */
function getDefs(cb) {
    cb && getDefsList(function (defList, err) {
        if (err) {
            cb.call(null, null, err);
            return;
        }
        let result = {};
        defList.forEach(function (o) {
            if (o) {
                result[o.prjId] = o;
            }
        });
        cb.call(null, result);
    });
}
/**
 * 获取当前激活的项目
 * @param cb
 */
function getActiveDef(cb) {
    cb && getDefsList(function (defList, err) {
        let result = {};
        if (!err) {
            try{
                defList.forEach(function (o) {
                    if (o && o.active === true) {
                        result[o.prjId] = o;
                    }
                });
            }catch (e){
                err = e;
            }

        }
        cb.call(null, result, err);
    });
}
/**
 * 根据项目id获取项目定义
 * @param prjId
 * @param cb
 */
function getDef(prjId, cb) {
    if (!prjId) {
        throw new Error('invalid parameter, prjId is required!');
    }
    if (!cb) {
        throw new Error('invalid parameter, callback is required!');
    }
    let filePath = buildFilePathById(prjId);
    if (!fs.existsSync(filePath)) {
        throw new Error(`invalid prjId:${prjId}`);
    }
    fs.readFile(filePath, fileReadOptions, function (err, data) {
        if (err) {
            throw err;
        }
        cb.call(null, data ? JSON.parse(data) : {})
    })
}
/**
 * 保存项目定义
 * @param def
 */
function saveDef(def) {
    if (!_.isPlainObject(def)) {
        throw new Error('project def must be a plain object !');
    }
    if (!def.prjId) {
        throw new Error('prjId of project def is required !');
    }
    var filePath = buildFilePathById(def.prjId);
    if (fs.existsSync(filePath)) {
        let saved = fs.readFileSync(filePath, fileReadOptions);
        def = _.merge(saved ? JSON.parse(saved) : {}, def);
        fs.unlinkSync(filePath);
    }
    fs.writeFileSync(filePath, utils.stringify(def), {
        encoding: 'utf8',
        mode: 0o777
    });
}

/**
 * 获取可用的接口定义
 * @param cb
 */
function getActiveInterfaceDef(cb) {
    cb && getActiveDef(function (defs, err) {
        let result = {};
        if (!err) {
            Object.getOwnPropertyNames(defs).forEach((propertyName)=> {
                Object.getOwnPropertyNames(defs[propertyName]).forEach((interfacePath)=> {
                    result[interfacePath] = interfaceDefFormate(defs[propertyName][interfacePath]);
                });
            });
        }
        cb.call(null, result, err);
    });
}
function interfaceDefFormate(def) {
    if (def.rewriteURL && ef.rewriteURL.active === true) {
        return {
            rewriteURL: def.rewriteURL.url
        }
    }
    if (def.rewriteData && ef.rewriteData.active === true) {
        return {
            rewriteData: def.rewriteData.data
        }
    }
    if (def.versions) {
        let names = Object.getOwnPropertyNames(def.versions);
        for (let l = names.length; l > 0; l--) {
            let _version = def.versions[names[l - 1]];
            if (_version.active === true) {
                return {
                    inputs: _version.inputs,
                    outputs: _version.outputs
                }
            }
        }
    }
    return {};
}
exports.saveDef               = saveDef;
exports.getDef                = getDef;
exports.getActiveDef          = getActiveDef;
exports.getDefs               = getDefs;
exports.getActiveInterfaceDef = getActiveInterfaceDef;