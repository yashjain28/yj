var DEVICETABLE="device_profile";
function device_profile(req, resp){
    ClearBlade.init({request:req});
    r=req.params;
    var q=ClearBlade.Query({collectionName:DEVICETABLE});
    if (r.deviceid){
        q.equalTo("device_type", r.devicetype);
    }

    promiseQuery(q).then(function(r){
        profiles={};
        r.forEach(function(f) {
            profiles[f.profile_name]=f;
            
        });
        resp.success(profiles);
    })
    .catch(function(err) {
        resp.error(err);
    });
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
