(function() {
"use strict";

var obj_cache = {};
var were_live = (typeof IPython !== "undefined");

IPython.sanja = function(libname, hash) {
    if (obj_cache.hasOwnProperty(hash)) {
        return Promise.resolve(obj_cache[hash])
    }

    if (were_live) {
        var md = IPython.notebook.metadata;
        if ((md.sanja || {}).hasOwnProperty(libname)
                && md.sanja[libname].hash === hash) {
            var obj = eval(IPython.notebook.metadata.sanja[libname].source);
            obj_cache[hash] = obj;
            return Promise.resolve(obj);
        }

        var comm = IPython.notebook.kernel.comm_manager.new_comm('sanja',{
            name: libname,
            hash: hash
        });

        return new Promise(function(resolve, reject) {
            comm.on_msg(function(msg) {
                var data = msg.content.data;
                IPython.notebook.metadata.sanja[libname] = data;
                var obj = eval(data.source);
                obj_cache[data.hash] = obj;
                resolve(obj);
            });

            comm.on_close(function(msg) {
                reject(msg.content.data);
            })
        })
    }
}
})();
