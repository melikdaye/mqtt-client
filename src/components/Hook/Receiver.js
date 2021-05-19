import React, { useEffect, useState } from 'react';
import { Card, List} from 'antd';
import ComboBox from 'react-responsive-combo-box'
import Snackbar from "@material-ui/core/Snackbar";



const Receiver = ({ payload,client }) => {
  const [parameters, setParameters] = useState({})
  const [enodeb_devices, setEnodebDevices] = useState([])
  const [currentDeviceParameter, setCurrentDeviceParameter] = useState([])
  const [selectedOption, setSelectedOption] = useState("");
  const [informMessage, setInformMessage] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {

    if (payload.topic==="status") {
      let parsed_message=JSON.parse(payload.message)
      if (parsed_message["type"]==="device_list"){

          setEnodebDevices(enedob_devices => parsed_message["online_devices"])


      }
    else if (parsed_message["type"]==="currentParameters"){
        setParameters(parameters =>  parsed_message["device_parameters"])

      }
    else if (parsed_message["type"]==="inform"){

        setInformMessage("Status Code : " + parsed_message["HttpStatus"] + "\n" + "Reason : " + parsed_message["reason"])
        setOpen(true)
      }
    else if (parsed_message["type"]==="inform_update"){

        setInformMessage("Device ID : " + parsed_message["id"] + "\n" +  "Paramater : " + parsed_message["label"] + " updated as : " + parsed_message["new_value"])
        setOpen(true)
      }

    }


    }, [payload])

  const renderListItem = (item) => (

    <List.Item>
      <List.Item.Meta
        title={item.label}
        description={item.value}
      />
    </List.Item>
  )

  function getDeviceParameters(option){
    setSelectedOption(option)
    for (let i = 0; i < enodeb_devices.length; i++) {
      if(enodeb_devices[i]["_SerialNumber"]===option){
        let selectedParameters=parameters[enodeb_devices[i]["_id"]]
        let sorted = Object.keys(selectedParameters)
            .sort()
            .reduce((acc, key) => ({
              ...acc, [key]: selectedParameters[key]
            }), {})
        setCurrentDeviceParameter(sorted)

      }
    }
  }

  function DeviceList(props) {

    const devices = props.enodeb_devices;
    const listItems = devices.map((number) =>
       number["_SerialNumber"]
    );
    return [
        <ComboBox options={listItems}
        placeholder="Choose Device"
        optionsListMaxHeight={300}
        focusColor="#20C374"
        onSelect={(option) => getDeviceParameters(option)}
        enableAutocomplete
        />,

    ];
  }

  function setParameter(e){
    currentDeviceParameter[e.target.parentElement.innerText]["_value"]=e.target.value
    currentDeviceParameter[e.target.parentElement.innerText]["edit"]=true
  }

  function ListItem(props) {
    // Correct! There is no need to specify the key here:
    const style = {
      width:100,
      height: 25,
      position:"absolute",
      left:250,

    };

    return(
    <li><label >

      {props.label}
      <textarea  defaultValue ={props.value} style={style} onChange={setParameter.bind(this)}/>
    </label></li>)

  }

  function setParametersMqtt (event){
    let deviceId=enodeb_devices[Object.keys(enodeb_devices).filter(x=>enodeb_devices[x]["_SerialNumber"]===selectedOption)]["_id"]
    event.preventDefault()
    let changedParameters=Object.keys(currentDeviceParameter).filter(x=>currentDeviceParameter[x]).filter(x=>currentDeviceParameter[x]["edit"]===true).reduce((obj, key) => {obj[key] = currentDeviceParameter[key];
      return obj;}, {})
    if (Object.keys(changedParameters).length>0)
        client.publish("test/enodeb/acs",JSON.stringify({"type":"setParameter","parameters":changedParameters,"id":deviceId}))
        Object.keys(currentDeviceParameter).filter(x=>currentDeviceParameter[x]).filter(x=>currentDeviceParameter[x]["edit"]===true).forEach((value, index) => currentDeviceParameter[value]["edit"]=false)
  }

  function ConfigForm(props) {
    const deviceProps= props.properties;
    const listItems = Object.keys(deviceProps).filter(x => deviceProps[x]).map((label) =>
        // Correct! Key should be specified inside the array.
        <ListItem key={label} label={label} value={deviceProps[label]["_value"]} />
    );
    return (
        <form onSubmit={event => setParametersMqtt(event)}>
          {listItems}
          <input type="submit" value="Kaydet" />
        </form>
    );
  }

  const handleClose = () => {
    setOpen(false);
  };

  return [
    <Card  title="Device Config Wizard">
      <DeviceList enodeb_devices={enodeb_devices} />
      <ConfigForm properties={currentDeviceParameter} />
    </Card>,
  <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      onClose={handleClose}
      message={informMessage}
      key={ 'bottom' + 'right'}/>
  ];
}

export default Receiver;
