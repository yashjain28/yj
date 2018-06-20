#!/bin/bash
if [ "$EUID" -ne 0 ]
  then 
  	echo "---------Permissions Error---------"
  	echo "STOPPING: Please run as root or sudo"
  	echo "-----------------------------------"
  exit
fi

SCRIPTDIR="$( cd "$(dirname "$0")" ; pwd -P )"
CONFIGFILENAME="adapterconfig.txt"
source "$SCRIPTDIR/$CONFIGFILENAME"

echo "Adapter Service Name: $ADAPTERSERVICENAME"
echo "SystemD Path: $SYSTEMDPATH"
echo "Python File: $PYTHONFILE"
echo "Python Bin: $PYTHONBIN"
#echo "Network Service Name: $NETWORKSERVICENAME"

#Clean up any old adapter stuff
echo "------Cleaning Up Old Adapter Configurations"
systemctl stop "$ADAPTERSERVICENAME"
systemctl disable "$ADAPTERSERVICENAME"
rm "$SYSTEMDPATH/$ADAPTERSERVICENAME"

#Create a systemd service
echo "------Configuring Service"
cat >"$SYSTEMDPATH/$ADAPTERSERVICENAME" <<EOF
[Unit]
Description=$ADAPTERSERVICENAME
#After=$NETWORKSERVICENAME

[Service]
Type=simple
ExecStart=$PYTHONBIN $SCRIPTDIR/$PYTHONFILE --systemKey=$SYSTEMKEY --systemSecret=$SYSTEMSECRET --deviceID=$DEVICEID --activeKey=$ACTIVEKEY --logLevel=$LOGLEVEL --topicRoot=$ROOTTOPIC
Restart=on-abort
TimeoutSec=30
RestartSec=30
StartLimitInterval=350
StartLimitBurst=10

[Install]
WantedBy=multi-user.target 
EOF

#Install pip if its not installed already
if ! pip_loc="$(type -p "pip")" || [ -z "$pip_loc"]; then
 apt-get install python-pip -y
fi
echo "-----Install Pre-requisite sofware"
pip install -U pymodbus 
pip install -U twisted 
pip install -U clearblade

echo "------Reloading daemon"
systemctl daemon-reload
#Enable the adapter to start on reboot Note: remove this if you want to manually maintain the adapter
echo "------Enabling Startup on Reboot"
systemctl enable "$ADAPTERSERVICENAME"
systemctl start "$ADAPTERSERVICENAME"

echo "------$ADAPTERNAME Adapter Deployed"
