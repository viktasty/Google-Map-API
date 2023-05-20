import { useState } from 'react';
import { Form, Button, FormControl, InputGroup, Row, Col, Table } from 'react-bootstrap';
import { OverlayTrigger, Popover, FaUser, FaTrash, FaEnvelope, FaLock, FaPhone, FaMapMarkedAlt, FaIdCard, FaMapMarkerAlt, FaPlus, FaClipboard, FaCheck } from 'react-icons/fa';
import ClientInfo from './ClientInfo';
import StatesContext from './StatesContext';
import OutputURL from './OutputURL';
import ClientsTable from './ClientsTable';
const InputForm = () => {

  const [states, setStates] = useState({
    clients: [],
    client: {},
    routeClients: [],
    url:"url:",
    toastErr:false,
    copied:false,
    params: {
      draggedIndex: null,
      hoveredIndex: null,
    },
  });
  // const clientList = Object.keys(states.client);
  const handleDelete = key => {
    const i=states.routeClients.findIndex(but=>but.id==key);
    const newRouteClients = [...states.routeClients];
    newRouteClients.splice(i, 1);
    setStates(pre => ({ ...pre, routeClients: newRouteClients }));
  }
  const handleDragStart = (event, button) => {
    event.dataTransfer.setData("text/plain", button.id);
    setStates(pre => ({ ...pre, params: { ...pre.params, draggedIndex: button.id } }));
  }
  const handleDragEnd = (event, button) => {
    setStates(pre => ({ ...pre, params: { ...pre.params, draggedIndex: null, hoveredIndex: null } }));
  }
  const handleDragOver = (event, button, index) => {
    event.preventDefault();
    if (states.params.draggedIndex !== button.id) {
      setStates(pre => ({ ...pre, params: { ...pre.params, hoveredIndex: button.id } }));
    }
  }
  const handleDrop = (event, button) => {
    const droppedButtonId = event.dataTransfer.getData("text");
    const droppedButton = states.routeClients.find(
      button => button.id == droppedButtonId
    );
    const draggedButton = states.routeClients.find(
      item => item == button
    );


    const draggedButtonIndex = states.routeClients.indexOf(droppedButton);
    const droppedButtonIndex = states.routeClients.indexOf(draggedButton);
    const newButtons = states.routeClients.slice();
    if (draggedButtonIndex > droppedButtonIndex) {
      const rmIt = newButtons.splice(draggedButtonIndex, 1);
      newButtons.splice(droppedButtonIndex, 0, rmIt[0]);
    } else {
      newButtons.splice(droppedButtonIndex, 0, newButtons[draggedButtonIndex]);
      newButtons.splice(draggedButtonIndex, 1);
    }
    // alert(JSON.stringify(newButtons))
    setStates(pre => ({ ...pre, routeClients: newButtons, params: { ...pre.params, draggedIndex: null, hoveredIndex: null } }));
  }

  const shouldAddSpace = (index) => {
    if (states.params.draggedIndex == null || states.params.hoveredIndex == null) {
      return false;
    }
    const [start, end] = [states.params.draggedIndex, states.params.hoveredIndex].sort();
    return start < index && index < end;
  }
  return (
    <StatesContext.Provider value={[states, setStates]}>
      <Row>
        <Col sm={4}>
          <ClientInfo />
        </Col>
        <Col sm={4}>
          <OutputURL />
        </Col>
        <Col sm={3}>
          <h4>Routes</h4>
          <ul>
          {states.routeClients.map((button, i, arr) => (
            <li key={button.id}><Button variant='success' className={`button-transition ${states.params.draggedIndex === button.id ? "dragging" : ""}${shouldAddSpace(button.id) ? "space-filler" : ""}`}
              style={{
                width: '100%', position: 'static', top: `${i * 50}px`, margin: '10px 0 10px 0',
                // color:states.params.hoveredIndex==button.id?"red":"blue"
                transform: `scale(${states.params.hoveredIndex == button.id ? "1.05" : "1.0"}) rotate(0deg)`
              }}
              key={button.id}
              draggable="true"
              onDragStart={event => handleDragStart(event, button)}
              onDragOver={event => handleDragOver(event, button, button.id)}
              onDragEnd={event => handleDragEnd(event)}
              onDrop={event => handleDrop(event, button)}>
              <span style={{ float: 'left' }}><FaMapMarkerAlt />{(i == 0) ? 'LEAVE' : (i == arr.length - 1) ? "ARRIVE" : (i + 1)}&gt;</span>
              {button.elem.formBasicName} ({button.elem.formBasicLatitude},{button.elem.formBasicLongitude})
              <a onClick={()=>handleDelete(button.id)} style={{ float: 'right', fontSize: '0.8em' }}><FaTrash />Delete</a>
            </Button></li>
          ))}
          </ul>

        </Col>
      </Row>
      <ClientsTable />

    </StatesContext.Provider>
  );
}
export default InputForm;