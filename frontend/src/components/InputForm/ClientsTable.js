import { useContext } from 'react';
import { Form, Button, FormControl, InputGroup, Row, Col, Table } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkedAlt, FaIdCard, FaMapMarkerAlt, FaPlus, FaTrash } from 'react-icons/fa';
import StatesContext from './StatesContext';

const ButtonAddRoute=({onClick})=>{

  return(
      <Button onClick={onClick}><FaPlus/>Add to route</Button>
  )
}
const ButtonDelete=({onClick})=>(
        <Button variant='danger' style={{marginLeft:'20px'}} onClick={onClick}><FaTrash/>Delete</Button>
    )
const ClientsTable=()=>{
    const [states,setStates]=useContext(StatesContext);
    const handleAdd=(client)=>{
        let i=states.routeClients.length || 0;
        if(i>0)i=states.routeClients[i-1].id+1;
        setStates(pre=>({...pre,routeClients:[...pre.routeClients,{elem:client,id:i}]}));
    }
    const handleDelete=(key)=>{
        const newClients=[...states.clients];
        newClients.splice(key,1);
        setStates(pre=>({...pre,clients:newClients}));
    }
    return(
      <Row><Col sm={1}/>
        <Col sm={10}>
        <Table striped border="true" hover style={{margin:'15px'}}>
          <thead>
            <tr>
              <th><FaIdCard />ID</th>
              <th><FaUser />Name</th>
              <th><FaMapMarkerAlt />Latitude</th>
              <th><FaMapMarkerAlt />Longitude</th>
              <th style={{ width: '30%' }}><FaMapMarkedAlt />Address</th>
              <th>Short URL <Button variant='success' style={{boxShadow:'5px 5px 5px rgba(0, 0, 0, 1)'}}> <FaMapMarkerAlt/> </Button></th>
              <th><FaPhone/>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              states.clients.map((client,key)=>(
                <tr key={key}>
                <td>{client.formBasicID}</td>
                  <td>{client.formBasicName}</td>
                  <td>{client.formBasicLatitude}</td>
                  <td>{client.formBasicLongitude}</td>
                  <td>{client.formBasicAddress}</td>
                  <td>{client.shoutURL}</td>
                  <td>{client.phoneNumber}</td>
                  <td>
                    <ButtonAddRoute onClick={()=>handleAdd(client)}/>
                    <ButtonDelete onClick={()=>handleDelete(key)}/>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        </Col></Row>
    )
}
export default ClientsTable;