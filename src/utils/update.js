'use strict'

import { App } from 'nw.gui'
import path from 'path'

const { manifest } = App
const options = { method: 'GET', mode: 'cors', credentials: 'include' }
let tmpUpdateJson = null

var gui = require('nw.gui');
var updater = require('node-webkit-updater');
var copyPath, execPath, upd;

//获取最新版本的相关信息
export function getUpdateJson(noCache) {
    if (!noCache && tmpUpdateJson) return Promise.resolve(tmpUpdateJson)
    return window.fetch(manifest.manifestUrl + '?' + new Date().getTime(), options)
        .then(resp => resp.json())
        .then(json => {
            tmpUpdateJson = json
            return tmpUpdateJson
        }).catch(() => {
            // alert("链接服务器失败");
            //gui.App.quit();
        })
}

// 版本更新相关代码
export function checkUpdate() {
    getUpdateJson().then(json => {
        upd = new updater(json);
        //检查是否在临时目录
        if (gui.App.argv.length) {
            copyPath = gui.App.argv[0];
            execPath = gui.App.argv[1];
            //复制临时到真实
            copynow(path.dirname(process.execPath), copyPath, () => {
                alert('更新成功！！');
                gui.Shell.openItem(execPath)
                gui.App.quit();
            })
        } else {
            upd.checkNewVersion(function(error, newVersionExists, manifest) {
                //检查更新
                if (json.version === App.manifest.version) {
                    return;

                }
                alert("发现新版本！！")
                upd.download(function(error, filename) {
                    if (!error) {
                        //解压临时目录的最新压缩包
                        upd.unpack(filename, function(error, newAppPath) {
                            if (!error) {
                                //运行临时目录下的最新版本应用并且关闭当前应用
                                upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()]);
                                gui.App.quit();
                            }
                        }, manifest);
                    }
                }, manifest);

            });
        }
    })
}
var copyCount = 0;
var totalCount = 0;
//复制临时目录到真实目录
function copynow(src, dst, func) {
    var fs = require('fs'),
        stat = fs.stat;

    var copy = function(src, dst) {
        // 读取目录中的所有文件/目录
        fs.readdir(src, function(err, paths) {
            if (err) {
                throw err;
            }
            totalCount = totalCount + paths.length;
            paths.forEach(function(path) {
                var _src = src + '/' + path,
                    _dst = dst + '/' + path,
                    readable, writable;

                stat(_src, function(err, st) {
                    if (err) {
                        throw err;
                    }

                    // 判断是否为文件
                    if (st.isFile()) {
                        // 创建读取流
                        readable = fs.createReadStream(_src);
                        // 创建写入流
                        writable = fs.createWriteStream(_dst);
                        // 通过管道来传输流
                        readable.pipe(writable).on('close', () => {
                            copyCount++;



                            //判断是否复制完成
                            if (copyCount === (totalCount - 2)) {
                                func();
                            }
                        })
                    }
                    // 如果是目录则递归调用自身
                    else if (st.isDirectory()) {
                        exists(_src, _dst, copy);
                    }
                });
            });
        });
    };
    // 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
    var exists = function(src, dst, callback) {
        fs.exists(dst, function(exists) {
            // 已存在
            if (exists) {
                callback(src, dst);
            }
            // 不存在
            else {
                fs.mkdir(dst, function() {
                    callback(src, dst);
                });
            }
        });
    };

    // 复制目录

    exists(src, dst, copy);
}