import React, { useState } from "react";
import {Button, Form, Container, Row, Col, Table, Modal, Alert, InputGroup} from "react-bootstrap";
import memoryUtils from "../utils/memory";
import { useHistory } from 'react-router-dom';
import memory from "../utils/memory";

const divStyle = {
  margin: "auto",
  border: "1px solid #eee",
  padding: "10px",
  borderRadius: "10px"
};


export default function Search() {
  const history = useHistory();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [acceptName, setAcceptName] = useState();

  const [message, setMessage] = useState();

  const [array, setArray] = useState([]);

  const [show, setShow] = useState(false);
  // const [send, setSend] = useState(false)

  const handleClose = () => setShow(false);

  const handleShow = (e) => {
    setShow(true);
    console.log(e.target.parentElement.parentElement.childNodes[3].innerText)
    setAcceptName(e.target.parentElement.parentElement.childNodes[3].innerText);
  }

  const cancelCourse = () => document.getElementById("search-form").reset();

  const handleChange = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const searchName = form.searchName.value;
    const searchDesc = form.searchDesc.value;
    const searchKw = form.searchKeywords.value;
    const useremail = memoryUtils.token;
    console.log(searchName, searchDesc, JSON.stringify(searchKw));
    const searchResult = fetch('http://localhost:5014/search/charity', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body:JSON.stringify({
        "name":searchName,
        "description": searchDesc,
        "needs": searchKw,
        "email": useremail
      })
    }).then(res => res.json().then(result => setArray(result.information))
    )
  }

  const sendMessage = () => {
    const messageFetch = fetch("http://localhost:5014/communication/request", {
      method:"PUT",
      headers: {
        "Authorization": memoryUtils.token,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        "message": message,
        "email": acceptName,
        "role": "1"
      })
    }).then(res => {
      if (res.status === 200){
        alert("Message send successful!")
        // setSend(true)
      }
      setShow(false);
      return res.json()
    })
      .then(data => console.log(data))
  }

  const sumListNeeds = (data) => {
    let needsList = "";
    for (let j = 0; j < data.length; j++) {
      if (data[j] === "Empty") {
        continue;
      } else {
        if (j === data.length - 1) {
          needsList += data[j];
        } else {
          needsList += data[j] + ", ";
        }
      }
    }
    if (needsList.slice(-2) ===', '){
      needsList = needsList.slice(0,-2);
    }
    return needsList;
  }

  const connection = (number) => {
    if (number === 1){
      return <td>waiting</td>
    }else if (number === 2){
      return <td>connected</td>
    }else if (number === 3){
      return (<td><Button variant="outline-primary" onClick={handleShow}>
        send again</Button></td>)
    }else {
      return (<td><Button variant="outline-primary" onClick={handleShow}>
        send</Button></td>);
    }
  }

  const handleProfile = (e) => {
    memory.toEmail = e.target.parentElement.parentElement.childNodes[3].innerText;
    memory.toRole = "1";
    const number = e.target.parentElement.parentElement.childNodes[5].innerText
    if (number === 'waiting'){
      memory.number = "1";
    }else if (number === 'connected'){
      memory.number = '2';
    }else if (number === 'send again'){
      memory.number = '3';
    }else {
      memory.number = '4';
    }
    history.push('/CharityProfile');
  }

  const showTable = () => {
    if (dropdownVisible === true) {
      if (array !== undefined){
        console.log(array)
        return (
          <Table striped bordered hover>
            <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Email</th>
              <th>Needs</th>
              <th>Connection</th>
              <th>Detail</th>
            </tr>
            </thead>
            <tbody>
            {array.map((i, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{i.name}</td>
                <td>{typeof i.description === "string" ? i.description.substring(0, 20) : i.description}</td>
                <td>{i.email}</td>
                <td>{sumListNeeds(i.needs)}</td>
                {connection(i.is_connected)}
                <td><Button variant="outline-primary" onClick={handleProfile}>view more</Button></td>
              </tr>
            ))}
            </tbody>
          </Table>
        )
      }else {
        return (
          <Container >
            <Alert style={{margin:"0 160px",width: "70%"}} variant="light">
              No result found.
            </Alert>
          </Container>);
      }
    }
  }

  return(
    <Container>
      <Row className="justify-content-md-center">
        <Col md={{ span: 8, offset: 3 }} style={divStyle}>
          <Form className="mb-3" noValidate id="search-form" onSubmit={handleChange}>
            <Form.Group className="mb-3" controlId="searchName">
              <Form.Label>Search charity's name:</Form.Label>
              <Form.Control require type="text" placeholder="Enter name" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="searchDesc">
              <Form.Label>Charity's Description:</Form.Label>
              <Form.Control require type="text" placeholder="Description..." />
            </Form.Group>
            <Form.Group className="mb-3" controlId="searchKeywords">
              <Form.Label>Other search keyword / need:</Form.Label>
              <Form.Control require type="text" placeholder="foods ..." />
            </Form.Group>
            <Button block variant="outline-primary" type="submit" onClick={() => setDropdownVisible(true)}>
              Search
            </Button>
            <Button block variant="outline-danger" onClick={cancelCourse}>
              Clear
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
      {showTable()}
      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>Send Message</Modal.Title>
        </Modal.Header>
        <InputGroup style={{height : '200px'}} onMouseLeave={(e) => setMessage(e.target.value)}>
          <Form.Control as='textarea' />
        </InputGroup>
        <Modal.Footer>
          <Button variant="secondary" onClick={sendMessage}>
            send
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      </Row>
    </Container>
  );}