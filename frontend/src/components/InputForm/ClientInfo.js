import { useState, useContext } from 'react';

import { Form, Button, FormControl, InputGroup, Row, Col, Table } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkedAlt, FaIdCard, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import StatesContext from './StatesContext';
const ClientInfo = () => {
    const [states, setStates] = useContext(StatesContext);

    

    

    const handleAdd = () => {
        let newClients = [...states.clients]
        newClients.push(states.client);
        setStates(pre => { return { ...pre, clients: newClients, client: {} } })
    }
    const handleInput = e => {
        const { id, value } = e.target;
        setStates((pre) => {
            return { ...pre, client: { ...pre.client, [id]: value } };
        });
    }
    
    return (
        <>
            <h4>Input Client Information</h4>
            <Form className='k-form' style={{
                left: 0,
                right: 0,
                margin: '0px 0px 10px 0px'
            }}>

                <Form.Group controlId="formBasicID">
                    <Row>
                        <Form.Label column sm={4}>
                            ID <FaIdCard />
                        </Form.Label>
                        <Col sm={8}>
                            <FormControl onChange={handleInput} type="text" value={states.client['formBasicID'] || ''} placeholder="Enter ID" />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group controlId="formBasicName">
                    <Row>
                        <Form.Label column sm={4}>
                            Name <FaUser />
                        </Form.Label>
                        <Col sm={8}>
                            <FormControl onChange={handleInput} type="text" value={states.client.formBasicName || ''} placeholder="Enter name" />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group controlId="formBasicLatitude">
                    <Row>
                        <Form.Label column sm={4}>
                            Latitude <FaMapMarkerAlt />
                        </Form.Label>
                        <Col sm={8}>
                            <FormControl onChange={handleInput} type="text" value={states.client.formBasicLatitude || ''} placeholder="Enter latitude" />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group controlId="formBasicLongitude">
                    <Row>
                        <Form.Label column sm={4}>
                            Longitude <FaMapMarkerAlt />
                        </Form.Label>
                        <Col sm={8}>
                            <FormControl onChange={handleInput} type="text" value={states.client.formBasicLongitude || ''} placeholder="Enter longitude" />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group controlId="formBasicAddress">
                    <Row>
                        <Form.Label column sm={4}>
                            Address <FaMapMarkedAlt />
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control onChange={handleInput} as="textarea" value={states.client.formBasicAddress || ''} rows={3} placeholder="Enter address" />
                        </Col>
                    </Row>
                </Form.Group>
                <Button onClick={handleAdd}><FaPlus />Add</Button>
            </Form>
        </>
    )
}
export default ClientInfo;