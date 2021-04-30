import React, { useEffect, useState } from 'react';
import { Card, List} from 'antd';
import ComboBox from 'react-responsive-combo-box'

const Receiver = ({ payload }) => {
  const [messages, setMessages] = useState([])
  const [enodeb_devices, setEnodebDevices] = useState([])

  useEffect(() => {
    if (payload.topic) {
      let parsed_message=JSON.parse(payload.message)
      if (parsed_message["type"]==="device_list"){
        for (let i = 0; i <parsed_message["online_enodeb_devices"].length ; i++) {


          setEnodebDevices(enedob_devices => [...enedob_devices, parsed_message["online_enodeb_devices"][i]["_SerialNumber"]])
        }
      console.log({enodeb_devices})

      }
      setMessages(messages => [...messages, payload])
    }
  }, [payload,enodeb_devices])

  const renderListItem = (item) => (
    <List.Item>
      <List.Item.Meta
        title={item.topic}
        description={item.message}
      />
    </List.Item>
  )



  return (
    <Card
      title="Receiver"
    >
      <ComboBox options={enodeb_devices} enableAutocomplete />
      <List
        size="small"
        bordered
        dataSource={messages}
        renderItem={renderListItem}
      />

      <List
          size="small"
          bordered
          dataSource={enodeb_devices}

      />
    </Card>
  );
}

export default Receiver;
