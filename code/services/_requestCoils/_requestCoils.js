/**
 * _requestCoils <FUNCTION PURPOSE>
 * @param {string} req - Request to the code service
 * @param {string} resp - Response from the code service
 */
function _requestCoils(req, resp){
    ClearBlade.init({request:req});
    _req=req;
    _resp=resp;
	if (ClearBlade.isEdge()) {
    	g_deleteMessages(MODBUSREQUESTTOPIC);
        var msg = ClearBlade.Messaging();
        msg.publish(MODBUSREQUESTTOPIC,JSON.stringify({
            ModbusHost: MBHOST,
            FunctionCode: 1,
            UnitID: DEFAULTUNIT,
            StartAddress: STARTADDR,
            AddressCount: ENDADDR,
            Data: []}));
        resp.success(MODBUSREQUESTTOPIC);
	} else
	resp.success("Code can only execute on an edge");
}
