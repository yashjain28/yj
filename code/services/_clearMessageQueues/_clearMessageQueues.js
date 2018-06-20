MESSAGECOUNT=999 //Max Messages for edge
cycles=1; //Hack for running message queue clean up if more than 1000 messages
var _resp;
function _clearMessageQueues(req, resp){
    //This erases the messages from the messagequeue to prevent overrunning storage on the micro instance.
    ClearBlade.init({request: req});
    _resp=resp;
    var msg = ClearBlade.Messaging();
   //getMessageCount(MODBUSRESPONSETOPIC, msg)
   i=0;
    while (i<cycles)  {
        msg.getAndDeleteMessageHistory(MODBUSRESPONSETOPIC, MESSAGECOUNT, new Date().getTime() / 1000, null, null, callback);
        i++;
    }
    
    i=0;
    while (i<cycles)  {
        msg.getAndDeleteMessageHistory(MODBUSERRORTOPIC, MESSAGECOUNT, new Date().getTime() / 1000, null, null, callback);
        i++;
    }
    
    resp.success(true);
    
}

var getMessageCount=function(topic, msg) {
    msg.getMessageHistory(topic, null, MESSAGECOUNT, callback);
};

var callback=function(err, result) {
    d = Q.defer();
        if (err) {
            d.reject(new Error(err));
        } else {
            d.resolve(result);
        }
    return d.promise;
};