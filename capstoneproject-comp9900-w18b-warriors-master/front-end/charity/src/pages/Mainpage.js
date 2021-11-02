import React, { Component } from "react";
import { Jumbotron, Carousel, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

class Mainpage extends Component {
  constructor(props) {
    super(props);
    this.state = { graph: [] };
  }

  componentDidMount() {
    const _this = this;
    axios
      .get("./api/homepage.json")
      .then(function (response) {
        _this.setState({
          graph: response.data.data,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    const itemList = this.state.graph;

    const itemStyle = {
      padding: "10px 10px",
      backgroundColor: "#dddee1",

      textAlign: "center",
    };
    return (
      <div style={{ backgroundColor: "#e9ecef" }}>
        <Carousel>
          {itemList.map((item) => {
            return (
              <Carousel.Item key={item.id} interval={3000}>
                <img
                  style={{ height: "400px" }}
                  className="d-block w-100"
                  src={item.name}
                  alt="slides"
                />
                <Carousel.Caption id={item.id}>
                  <h3>{item.desc}</h3>
                </Carousel.Caption>
              </Carousel.Item>
            );
          })}
        </Carousel>
        <Container>
          <Row style={{ margin: "40px auto 0" }}>
            <Col sm={6} md={3}>
              <div style={itemStyle}>
                <h2 className="display-6"> 15+ Sponsors</h2>
              </div>
            </Col>
            <Col sm={6} md={3}>
              <div style={itemStyle}>
                <h2 className="display-6">15+ Charities</h2>
              </div>
            </Col>
            <Col sm={6} md={3}>
              <div style={itemStyle}>
                <h2 className="display-6">200+ Users</h2>
              </div>
            </Col>
            <Col sm={6} md={3}>
              <div style={itemStyle}>
                <h2 className="display-6">500+ Viewed</h2>
              </div>
            </Col>
          </Row>
        </Container>
        <Jumbotron>
          <h1 className="display-3">Build Connections in the world.</h1>
          <p className="lead">
            We provide services and connections for charities and sponsors.
          </p>
          <p className="lead">
            Charity Connect Platform makes it easy for your company to do good,
            with our unified platform. Let us solve all of your Workplace
            Giving, Materials Giving, Charity Connecting and Fundraising
            needs... all in one place.
          </p>
          <p className="lead">
            As a charity, you can create and manage your profile, including your
            name, description, and cause. You can also maintain a list of needs
            on your profile by choosing needs from a needs registry or defining
            new needs.
          </p>
          <p className="lead">
            As a sponsor, you are able to create your own profile, edit profile,
            add description about what you could provide and add a link about
            your company. We appreciate your help and also help your to
            advertise your company.
          </p>
          <hr className="my-2" />
          <p>
            For more information, you can contact our team member through email.
          </p>
        </Jumbotron>
      </div>
    );
  }
}

export default Mainpage;
