import React, { Component } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  InputGroup,
  Table,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import memoryUtils from "../utils/memory";

export class BiggestSponsorProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tmpEmail: this.props.history.location.state.email,
      name: "",
      needs: [],
      description: "",
      show: false,
      msg: "",
      is_connected: "",
    };
  }

  componentDidMount() {
    const _this = this;
    let email = JSON.parse(localStorage.getItem("Email"));
    // if email is sponsor's email
    axios
      .post("http://127.0.0.1:5014/profile/sponsor/biggestsponsor/details", {
        sponsor_email: _this.state.tmpEmail,
        charity_email: email,
      })
      .then(function (res) {
        // console.log(res);
        if (res.status === 200) {
          _this.setState({
            loading: false,
            show: false,
            name: res.data.name,
            description: res.data.description,
            needs: res.data.needs,
            is_connected: res.data.is_connected,
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  setDescriptionValue(desc) {
    if (desc) {
      return desc;
    }
    return "None";
  }

  handleClose = () => this.setState({ show: false });

  handleShow = () => this.setState({ show: true });

  handleSendMessage() {
    let email = JSON.parse(localStorage.getItem("Email"));
    let to_email = this.state.tmpEmail;
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
            // 2: ch send to sp
            role: "2",
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
          _this.setState({ show: false, is_connected: "waiting" });
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
    const colStyle = {
      margin: "50px auto",
      padding: "15px",
      border: "1px solid #eee",
      borderRadius: "10px",
    };

    const divStyle = {
      margin: "20px 20px",
      padding: 10,
      border: "1px solid #eeeeee",
      borderRadius: "10px",
    };

    const connection = (number) => {
      if (memoryUtils.role === "1" && this.state.loading === false) {
        if (number === 1) {
          return (
            <Button className="mr-3" variant="outline-primary" disabled>
              Waiting
            </Button>
          );
        } else if (number === 2) {
          return (
            <Button className="mr-3" variant="outline-primary" disabled>
              Connected
            </Button>
          );
        } else if (number === 3) {
          return (
            <Button
              className="mr-3"
              variant="outline-primary"
              onClick={this.handleShow.bind(this)}
            >
              Send message Again
            </Button>
          );
        } else {
          return (
            <Button
              className="mr-3"
              variant="outline-primary"
              onClick={this.handleShow.bind(this)}
            >
              Send message
            </Button>
          );
        }
      } else {
        <></>;
      }
    };

    const descLength = () => {
      let length = this.state.descriptionValue.length;
      if (length !== null) {
        return length;
      } else {
        return 100;
      }
    };

    return (
      <div>
        <Container>
          <Form className="mb-3" noValidate>
            <Row className="justify-content-md-center">
              <Col md={{ span: 6, offset: 3 }} style={colStyle}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ textAlign: "left", width: "100%" }}>
                    Sponsor profile
                  </div>
                </div>
                <div style={divStyle}>
                  <Form.Group className="mb-3" controlId="userName">
                    <Form.Label>Name </Form.Label>
                    <InputGroup>
                      <Form.Control
                        require
                        type="text"
                        disabled
                        value={
                          this.state.loading ? "Loading..." : this.state.name
                        }
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      require
                      as="textarea"
                      disabled
                      value={
                        this.state.loading
                          ? "Loading..."
                          : this.setDescriptionValue(this.state.description)
                      }
                      style={descLength > 200 ?
                        {height:`${descLength - 50}px`} :
                        {height: '100px'}}
                    />
                  </Form.Group>
                  <Form.Label>Provide:</Form.Label>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Provide</th>
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
                  <div style={{ display: "flex" }}>
                    <div></div>
                    <div style={{ marginLeft: "auto" }}>
                      {connection(this.state.is_connected)}
                      <Button
                        className="mr-3"
                        variant="outline-secondary"
                        href="/biggestsponsor"
                      >
                        Back to Top 10 Biggest Sponsors
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>

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
        </Container>
      </div>
    );
  }
}

export default BiggestSponsorProfile;
