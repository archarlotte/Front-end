import React, { Component } from "react";
import {
  Table,
  Container,
  Row,
  Alert,
  Spinner,
  Modal,
  Button, Form, InputGroup,
} from "react-bootstrap";
import axios from "axios";
import memoryUtils from "../utils/memory";
import storageUtils from "../utils/storage";

export default class Recommendation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: false,
      err: false,
      rec_data: [],
      labelFilter: null,
      textFilter: null,
      tmpEmail: "",
      msg: "",
      show: false,
    };
  }

  componentDidMount() {
    const userEmail = storageUtils.getToken();
    const userRole = storageUtils.getRole();
    const _this = this;
    axios
      .post("http://127.0.0.1:5014/recommend/", {
        from_email: userEmail,
        userRole: userRole,
      })
      .then(function (response) {
        _this.setState({
          status: true,
          rec_data: response.data.data,
        });
      })
      .catch(function (error) {
        console.log("error", error);
        _this.setState({
          status: true,
          err: true,
        });
      });
  }

  handleSendMessage = () => {
    const _this = this;
    let message = this.state.msg;
    const to_email = this.state.tmpEmail;
    console.log(message, to_email);
    axios
      .put(
        "http://localhost:5014/communication/request",
        {
          message: message,
          email: to_email,
          // role 2: send to sp
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
          console.log(res);
          alert("Message send successful!");
          window.location.reload();
        } else if (res.status === 203) {
          alert("Connection is waiting for response.");
        }
        _this.setState({ show: false });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  sumListNeeds(data) {
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

  connection = (number) => {
    // send but not be confirmed by the opposite user
    if (number === 1) {
      return (
        <Button variant="light" disabled>
          waiting
        </Button>
      );
    }
    // send but not be rejected by the opposite user
    else if (number === 3) {
      return (
        <Button
          variant="outline-warning"
          onClick={() => this.setState({ show: true })}
        >
          send again
        </Button>
      );
    }
    // never send meaasge before
    else {
      return (
        <Button
          variant="outline-primary"
          onClick={() => this.setState({ show: true })}
        >
          send
        </Button>
      );
    }
  };

  handleClose = () => this.setState({ show: false });

  render() {
    let filteredData = this.state.rec_data;

    const containerstyle = {
      margin: "30px auto",
      padding: "15px",
      border: "1px solid #ececec",
      borderRadius: "10px",
    };

    if (this.state.labelFilter) {
      filteredData = this.state.rec_data.filter(
        (dt) => dt.name === this.state.labelFilter
      );
    }

    if (this.state.textFilter) {
      filteredData = this.state.rec_data.filter((dt) =>
        dt.needs.includes(this.state.textFilter)
      );
    }

    // option 1: no data found
    if (
      this.state.status === true &&
      this.state.err === false &&
      this.state.rec_data.length === 0
    ) {
      return (
        <Container style={{ margin: "30px auto" }}>
          <Alert variant="dark">
            No recommendations were found. Guess you're interested in our
            <Alert.Link href="/biggestsponsor"> biggest sponsors</Alert.Link>?
            Give it a click if you like.
          </Alert>
        </Container>
      );
    }
    // option 2: loading
    else if (this.state.status === false && this.state.err === false) {
      return (
        <Container style={containerstyle}>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
      );
    }
    // option 3: error information -> Only charity can see recommendations
    else if (this.state.err === true) {
      return (
        <Container style={{ margin: "30px auto" }}>
          <Alert variant="dark">
            Only charity can see recommendations. Guess you're interested in our
            <Alert.Link href="/biggestsponsor"> biggest sponsors</Alert.Link>?
            Give it a click if you like.
          </Alert>
        </Container>
      );
    }
    // option 4: have data to render
    else {
      return (
        <Container style={{ margin: "20px auto" }}>
          <Alert variant="light">
            There is the recommendation results based on your needs, also sorted
            by the relevance of your needs! <br />
            If you want to filer result, please type full value in any of the
            input field.
          </Alert>
          <Row className="justify-content-md-center">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    Sponsor Name
                    <br />
                    <input
                      type="text"
                      value={this.state.labelFilter}
                      onChange={(e) =>
                        this.setState({ labelFilter: e.target.value })
                      }
                    />
                  </th>
                  <th>
                    Needs
                    <br />
                    <input
                      type="text"
                      value={this.state.textFilter}
                      onChange={(e) =>
                        this.setState({ textFilter: e.target.value })
                      }
                    />
                  </th>
                  <th>Make connection</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((info, index) => (
                  <tr>
                    <td>{index}</td>
                    <td>{info.name}</td>
                    <td>{this.sumListNeeds(info.needs)}</td>
                    <td
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#FFFF",
                      }}
                      onClick={() =>
                        this.setState({ tmpEmail: info.email, show: true })
                      }
                    >
                      {this.connection(info.is_connected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

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
        </Container>
      );
    }
  }
}
