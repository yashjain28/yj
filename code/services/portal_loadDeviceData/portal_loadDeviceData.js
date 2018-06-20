var TABLESLIST=[{name: "modbus_coils"},
                {name: "modbus_inputregisters"},
                {name: "modbus_holdingregisters"},
                {name: "modbus_inputs"}];

function portal_loadDeviceData(req, resp){
    ClearBlade.init({request:req});
    var data={};
    TABLESLIST.forEach(function(t){
        var q=ClearBlade.Query({collectionName:t.name});
        if (req.params.edgeid)
            q.equalTo("edgeid", req.params.edgeid);
        promiseQuery(q).then(function(results){
        data[t.name]=results[0];
        })
        .catch(function(err) {
            resp.error(err);
        });
    });
    resp.success(data);
}


function promiseQuery(query) {
    d = Q.defer();
    var cb = function(err, result) {
        if (err) {
            d.reject(new Error(result));
        } else {
            d.resolve(result.DATA);
        }
    };
    query.fetch(cb);
    return d.promise;
}