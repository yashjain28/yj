var _resp, _req;
var _record;
COILSTABLE="modbus_coils";
INPUTSTABLE="modbus_inputs";
INPUTREGISTERSTABLE="modbus_inputregisters";
HOLDINGREGISTERSTABLE="modbus_holdingregisters";

function _processModBusResponse(req, resp){
    ClearBlade.init({request:req});
    log(req);
    var bitcode=-1;
    var dbvalues={};
    _resp=resp;
    _req=req;
    var body=JSON.parse(req.params.body);
    //Default values to send
    dbvalues.edgeid=ClearBlade.edgeId();
    dbvalues.modbushost=body.request.ModbusHost;
    dbvalues.unit_id=body.request.UnitID;
    dbvalues.base_addr=body.request.StartAddress;
    dbvalues.addr_length=body.request.AddressCount;
    dbvalues.timestamp= new Date(Date.now()).toISOString();
    
    //g_deleteMessages(req.params.topic); //Clean up old data
    //Coil Reading Mode
    if (body.request.FunctionCode==MBFUNCTION.READCOIL) {
        log("READCOIL");
        bitcode=generateBitCode(body.response.Data);
        dbvalues.bitcode=bitcode;
        processRecord(COILSTABLE, dbvalues);
    } 
    else if (body.request.FunctionCode==MBFUNCTION.READINPUT) {
        log("READINPUT");
        bitcode=generateBitCode(body.response.Data);
        dbvalues.bitcode=bitcode;
        processRecord(INPUTSTABLE, dbvalues);
    }
    else if (body.request.FunctionCode==MBFUNCTION.READHOLDINGREGISTERS) {
        log("READHOLDINGREGISTERS");
        dbvalues.data=JSON.stringify(body.response.Data);
        processRegisterRecord(HOLDINGREGISTERSTABLE, dbvalues);
    }
    else if (body.request.FunctionCode==MBFUNCTION.READINPUTREGISTERS) {
        log("READINPUTREGISTERS");
        dbvalues.data=JSON.stringify(body.response.Data);
        processRegisterRecord(INPUTREGISTERSTABLE, dbvalues);
    }
}

//Process I/O Record
function processRecord(TABLE, dbvalues) {
    findRecord(TABLE, dbvalues)
        .then(function(result) { 
            if(result.length>0) {
                if (result[0].bitcode!=dbvalues.bitcode) //Update if the data has changed
                    updateRecord(TABLE, result[0].item_id, dbvalues); }
            else
                createRecord(TABLE,dbvalues);
        });
}

//Process Register Record
function processRegisterRecord(TABLE, dbvalues) {
    findRecord(TABLE, dbvalues)
        .then(function(result) { 
            if(result.length>0) {
                if (result[0].data!=dbvalues.data) //Update if the data has changed
                    updateRecord(TABLE, result[0].item_id, dbvalues); }
            else
                createRecord(TABLE,dbvalues);
        });
}

//Update an existing record
function updateRecord(TABLE, itemID, values) {
    var query = ClearBlade.Query({collectionName:TABLE});
    query.equalTo('item_id', itemID);
    query.update(values, statusCallBack);
}

//Create a record
function createRecord(TABLE, values) {
    var col = ClearBlade.Collection( {collectionName: TABLE } );
    col.create(values, statusCallBack);
}

function findRecord(TABLE, values) {
    _record=values; //Global for inner loop
    log("processRecord");
    var query = ClearBlade.Query({collectionName: TABLE});
    query.equalTo('edgeid', values.edgeid);
    //query.equalTo('modbushost', values.modbushost);
    query.equalTo('unit_id', values.unit_id);
    query.equalTo('base_addr', values.base_addr);
    query.equalTo('addr_length', values.addr_length);
    
    d = Q.defer();
	query.fetch(function(err, result) {
        if (err) {
            d.reject(new Error(err));
        } else {
            d.resolve(result.DATA);
        }
    });
    return d.promise;
}

//Shared Status Callback
var statusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
    	_resp.error(data);
    } else {
        log(data);
    	_resp.success(data);
    }
};

function generateBitCode(data) {
    var s="";
    data.forEach(function(i){
    if(i)
        s="1" + s;
    else
        s="0" + s;
    });
    return parseInt(s, 2);
}
