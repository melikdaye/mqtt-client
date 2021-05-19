import React, { createContext, useEffect, useState } from 'react';
// import Connection from './Connection';
import Publisher from './Publisher';
import Subscriber from './Subscriber';
import Receiver from './Receiver';
import UserReceiver from "./UserReceiver";
import mqtt from 'mqtt';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';



export const QosOption = createContext([])
const qosOption = [
  {
    label: '0',
    value: 0,
  }, {
    label: '1',
    value: 1,
  }, {
    label: '2',
    value: 2,
  },
];


const HookMqtt = () => {
  const [client, setClient] = useState(null);
  const [isSubed, setIsSub] = useState(false);
  const [payload, setPayload] = useState({});
  const [connectStatus, setConnectStatus] = useState('Connect');
  const [tabValue, setTabValue] = useState(0);


    if (!client) {

      const record = {
        host: 'afcert.airfill.info',
        clientId: `mqttjs_ + ${Math.random().toString(16).substr(2, 8)}`,
        port: 443,
        username: "airfill",
        password: "airfillnet",
      };
      const {host, clientId, port, username, password} = record;
      const url = `wss://${host}:${port}/mqtt`;
      const options = {
        keepalive: 30,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        will: {
          topic: 'WillMsg',
          payload: 'Connection Closed abnormally..!',
          qos: 0,
          retain: false
        },
        rejectUnauthorized: false
      };
      options.clientId = clientId;
      options.username = username;
      options.password = password;
      setConnectStatus('Connecting');
      setClient(mqtt.connect(url, options));
    }

  useEffect(() => {

    if (client) {
      client.on('connect', () => {
        setConnectStatus('Connected');
        client.subscribe("status", {value: 0}, (error) => {
          if (error) {
            console.log('Subscribe to topics error', error)
            return
          }
          setIsSub(true)

      })
        client.subscribe("test/enodeb/acs/status", {value: 0}, (error) => {
          if (error) {
            console.log('Subscribe to topics error', error)
            return
          }
          setIsSub(true)

        })

        client.publish("test/enodeb/acs",JSON.stringify({"type":"refresh"}),{qos:0,retain:true}, (error) => {
            if (error) {
              console.log('Publish error', error)
            }
        })
        console.log("send refresh command")
      });
      client.on('error', (err) => {
        console.error('Connection error: ', err);
        client.end();
      });
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });
      client.on('message', (topic, message) => {
        console.log(topic)
        const payload = { topic, message: message.toString() };
        setPayload(payload);
      });
    }
  }, [client]);

  const mqttDisconnect = () => {
    if (client) {
      client.end(() => {
        setConnectStatus('Connect');
      });
    }
  }

  const mqttPublish = (context) => {
    if (client) {
      const { topic, qos, payload } = context;
      client.publish(topic, payload, { qos }, error => {
        if (error) {
          console.log('Publish error: ', error);
        }
      });
    }
  }

  const mqttSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription;
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log('Subscribe to topics error', error)
          return
        }
        setIsSub(true)
      });
    }
  };

  const mqttUnSub = (subscription) => {
    if (client) {
      const { topic } = subscription;
      client.unsubscribe(topic, error => {
        if (error) {
          console.log('Unsubscribe error', error)
          return
        }
        setIsSub(false);
      });
    }
  };

  function TabPanel(props) {
    const { children, value, index,...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{width: "100%"}}
        >
          {value === index && (
              <Box p={3}>
                <Typography>{children}</Typography>
              </Box>
          )}
        </div>
    );
  };

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };


  return (
    <>
      {/*<Connection connect={mqttConnect} disconnect={mqttDisconnect} connectBtn={connectStatus} />*/}
      {/*<QosOption.Provider value={qosOption}>*/}
      {/*  /!*<Subscriber sub={mqttSub} unSub={mqttUnSub} showUnsub={isSubed} />*!/*/}
      {/*  <Publisher publish={mqttPublish} />*/}
      {/*</QosOption.Provider>*/}

      {/*<AppBar position="static">*/}
      {/*  <Tabs value={tabValue} onChange={handleChange} aria-label="simple tabs example">*/}
      {/*    <Tab label="Super User" {...a11yProps(0)} />*/}
      {/*    <Tab label="User" {...a11yProps(1)} />*/}
      {/*  </Tabs>*/}
      {/*</AppBar>*/}
      {/*<TabPanel value={tabValue} index={0}>*/}
      {/*  <Receiver payload={payload} client={client}/>*/}
      {/*</TabPanel>*/}
      {/*<TabPanel value={tabValue} index={1}>*/}

      {/*</TabPanel>*/}

      <UserReceiver payload={payload} client={client} />

    </>
  );
}

export default HookMqtt;
