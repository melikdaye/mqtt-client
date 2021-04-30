import React, { createContext, useEffect, useState } from 'react';
// import Connection from './Connection';
import Publisher from './Publisher';
import Subscriber from './Subscriber';
import Receiver from './Receiver';
import mqtt from 'mqtt';

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


    if (!client) {

      const record = {
        host: 'afcert.airfill.info',
        clientId: `mqttjs_ + ${Math.random().toString(16).substr(2, 8)}`,
        port: 8083,
        username: "airfill",
        password: "airfillnet",
      };
      const {host, clientId, port, username, password} = record;
      const url = `ws://${host}:${port}/mqtt`;
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
      })});
      client.on('error', (err) => {
        console.error('Connection error: ', err);
        client.end();
      });
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting');
      });
      client.on('message', (topic, message) => {
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

  return (
    <>
      {/*<Connection connect={mqttConnect} disconnect={mqttDisconnect} connectBtn={connectStatus} />*/}
      <QosOption.Provider value={qosOption}>
        {/*<Subscriber sub={mqttSub} unSub={mqttUnSub} showUnsub={isSubed} />*/}
        <Publisher publish={mqttPublish} />
      </QosOption.Provider>
      <Receiver payload={payload}/>
    </>
  );
}

export default HookMqtt;
