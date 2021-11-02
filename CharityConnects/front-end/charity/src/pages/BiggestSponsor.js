import React, { Component } from "react";
import { Container, Alert, Tabs, Tab, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export class BiggestSponsor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: false,
      rec_data: [],
      detail: false,
    };
  }

  componentDidMount() {
    const _this = this;
    axios
      .get("http://127.0.0.1:5014/homepage/biggestsponsor", {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        },
        crossdomain: true,
      })
      .then(function (response) {
        _this.setState({
          status: true,
          rec_data: response.data.data,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    let sponsors = this.state.rec_data;
    const continerStyle = {
      width: "80%",
      margin: "30px auto",
      padding: "15px",
      border: "2px solid #ececec",
      borderRadius: "10px",
    };

    if (this.state.status === false) {
      return (
        <>
          <Container style={{ width: "80%", margin: "30px auto" }}>
            <Alert variant="secondary">
              These are Top 10 Sponsors of our website.
            </Alert>
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </Container>
        </>
      );
    } else {
      return (
        <div>
          <Container style={{ width: "80%", margin: "30px auto" }}>
            <Alert variant="secondary">
              These are Top 10 Sponsors of our website.
            </Alert>
          </Container>

          {sponsors.map((info, index) => (
            <Container key={index} style={continerStyle}>
              <Tabs defaultActiveKey="info">
                <Tab
                  eventKey="info"
                  title="Sponsor Information"
                  style={{ padding: "15px 10px" }}
                >
                  <strong>{info.name}</strong>
                  <br />
                  Supporting charities number: {info.num}
                </Tab>
                <Tab eventKey="detail" title="Detail">
                  <br />
                  <strong>Description: </strong>
                  {info.description}
                  <br />
                  <strong>Email: </strong>
                  {info.email}
                  <br />
                  <Link
                    to={{
                      pathname: "/BiggestSponsorProfile",
                      state: { email: info.email },
                    }}
                  >
                    View Full Profile
                  </Link>
                </Tab>
              </Tabs>
            </Container>
          ))}
        </div>
      );
    }
  }
}

export default BiggestSponsor;
