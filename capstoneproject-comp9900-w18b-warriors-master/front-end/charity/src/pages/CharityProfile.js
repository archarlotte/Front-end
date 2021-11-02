import React, { Component } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  InputGroup,
  Table, Modal,
} from "react-bootstrap";

import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import memory from "../utils/memory";
import memoryUtils from "../utils/memory";

export class CharityProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      nameValue: "",
      descriptionValue: "",
      connectedSponsor: [],
      needs: [],
      newDefine: "",
      show:false,
      msg: "",
      send:false
    };
  }

  componentDidMount() {
    let email = "";
    console.log(memory.toRole)
    console.log(memory.toEmail)
    if (memory.toRole === '1'){
      email = memory.toEmail;
    }else{
      email = JSON.parse(localStorage.getItem("Email"));
    }
    console.log(email);

    const _this = this;
    axios
      .post("http://localhost:5014/profile/charity", {
        email: email,
      })
      .then(function (response) {
        console.log(response.data);
        _this.setState({
          loading: false,
          nameValue: response.data.name,
          descriptionValue: response.data.description,
          connectedSponsor: response.data.connectedSponsor,
          needs: response.data.needs,
          newDefine: response.data.newDefine,
          show:false
        });
      })
      .catch(function (error) {
        console.log("error", error);
        _this.setState({
          loading: false,
        });
      });
  }

  setDescValue(desc) {
    if (desc) {
      return desc;
    }
    return "None";
  }

  setDefineValue(define) {
    if (define === "Empty") {
      return '';
    } else {
      return define;
    }
  }

  handleClose = () => this.setState({ show: false });

  handleShow = () => this.setState({ show: true });

  handleSendMessage() {
    let email = JSON.parse(localStorage.getItem("Email"));
    let to_email = memory.toEmail;
    let message = this.state.msg;
    const _this = this;

    if (email) {
      console.log(email, to_email, message);
      axios
        .put(
          "http://localhost:5014/communication/request",
          {
            message: message,
            email: to_email,
            // 2: sp send to ch
            role: "1",
          },
          {
            headers: {
              Authorization: memoryUtils.token,
              "Content-type": "application/json",
            },
          }
        )
        .then(function (res) {
          if (res.status === 200) {
            // console.log(res);
            alert("Message send successful!");
          }
          _this.setState({ show: false, is_connected: "waiting", send:true });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      alert(
        "If you want to view detail and send message, please login/register first."
      );
      this.props.history.push("/Login");
    }
  }

  render() {
    const divStyle = {
      margin: "50px auto",
      padding: "15px",
      border: "1px solid #ececec",
      borderRadius: "10px",
    };

    const spanStyle = {
      marginTop: 5,
      marginLeft: "auto",
      border: "1px solid #ccc",
      padding: "0 10px",
      borderRadius: 50,
      cursor: "pointer",
    };


    const connection = (number) => {
      console.log(number)
        if (number === "1") {
          return (
            <Button className="mr-3" variant="outline-primary" disabled>
              Waiting
            </Button>
          );
        }else if (number === "2") {
          return (
            <Button className="mr-3" variant="outline-primary" disabled>
              Connected
            </Button>
          );
        }else if (number === "3") {
          return (
            <Button
              className="mr-3"
              variant="outline-primary"
              onClick={this.handleShow.bind(this)}
              disabled={this.state.send}
            >
              {this.state.send ? "waiting" : "Send message Again"}
              {/*Send message Again*/}
            </Button>
          );
        }else {
          return (
            <Button
              className="mr-3"
              variant="outline-primary"
              onClick={this.handleShow.bind(this)}
              disabled={this.state.send}
            >
              {this.state.send ? "waiting" : "Send message"}
            </Button>
          );
        }
    };

    return (
      <>
        <Container>
          <Form className="mb-3" noValidate>
            <Row className="justify-content-md-center">
              <Col md={{ span: 6, offset: 3 }} style={divStyle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h4 style={{ textAlign: "left", width: "100%" }}>
                    Charity profile
                  </h4>
                </div>
                <div
                  style={{
                    border: "1px solid #eeeeee",
                    margin: "20px 20px",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <Form.Group className="mb-3" controlId="userName">
                    <Form.Label>Name</Form.Label>
                    <InputGroup>
                      <Form.Control
                        require
                        disabled
                        type="text"
                        value={
                          this.state.loading
                            ? "loading..."
                            : this.state.nameValue
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="userName">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      require
                      as='textarea'
                      plaintext
                      value={
                        this.state.loading
                          ? "loading..."
                          : this.setDescValue(this.state.descriptionValue)
                      }
                      style={typeof this.state.descriptionValue === 'string' && this.state.descriptionValue.length > 200 ?
                        {height:`${this.state.descriptionValue.length - 50}px`} :
                        {height: '100px'}}
                    />
                  </Form.Group>
                  <Form.Label>Sponsor(s)</Form.Label>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.connectedSponsor.map((item, index) => (
                        <tr>
                          <td>{index}</td>
                          <td>{item}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Form.Label>Needs</Form.Label>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Needs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.needs.map((item, index) => (
                        <tr>
                          <td>{index}</td>
                          <td>{item}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Form.Group className="mb-3" controlId="userName">
                    <Form.Label>Defined need</Form.Label>
                    <Form.Control
                      require
                      type="text"
                      disabled
                      value={
                        this.state.loading
                          ? "loading..."
                          : this.setDefineValue(this.state.newDefine)
                      }
                    />
                  </Form.Group>
                  <div style={{ display: "flex" }}>
                    <div></div>
                    <div style={{ marginLeft: "auto" }}>
                      { memory.toRole === '1' ? (connection(memory.number)) : (<></>)}
                      { memory.toRole === '1' ? (<></>) : (<Button
                        className="mr-3"
                        variant="primary"
                        type="submit"
                        href="/CharityProfileUpdate"
                      >
                        <span class="iconfont">&#xe89a;</span>
                        &nbsp; Update
                      </Button>)}
                      <Button
                        className="mr-3"
                        variant="outline-danger"
                        href="/"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
              <Modal show={this.state.show} onHide={this.handleClose.bind(this)}>
                <Modal.Header closeButton>
                  <Modal.Title>Send Message</Modal.Title>
                </Modal.Header>
                <InputGroup style={{height : '200px'}} onMouseLeave={(e) => this.setState({ msg: e.target.value })}>
                  <Form.Control as='textarea' />
                </InputGroup>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={this.handleSendMessage.bind(this)}
                  >
                    send
                  </Button>
                  <Button variant="primary" onClick={this.handleClose.bind(this)}>
                    Cancel
                  </Button>
                </Modal.Footer>
              </Modal>
            </Row>
          </Form>
        </Container>
      </>
    );
  }
}

export default CharityProfile;
