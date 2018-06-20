function _readHoldingRegisters(req, resp){
    ClearBlade.init({request:req});
    _req=req;
    _resp=resp;
	if (ClearBlade.isEdge()) {
    	g_deleteMessages(MODBUSREQUESTTOPIC);
        var msg = ClearBlade.Messaging();
        msg.publish(MODBUSREQUESTTOPIC,JSON.stringify({
            ModbusHost: MBHOST,
            FunctionCode: MBFUNCTION.READHOLDINGREGISTERS,
            UnitID: DEFAULTUNIT,
            StartAddress: STARTADDR,
            AddressCount: ENDADDR,
            Data: []}));
        resp.success(MODBUSREQUESTTOPIC);
	} else
	resp.success("Code can only execute on an edge");
}
