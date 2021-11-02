import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  InputGroup,
  Table,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import memoryUtils from "../utils/memory";

const divStyle = {
  margin: "50px auto",
  padding: "15px",
  border: "1px solid #ececec",
  borderRadius: "10px",
};

const msgStyle = {
  marginTop: 5,
  marginLeft: "auto",
  border: "1px solid #ccc",
  padding: "0 10px",
  borderRadius: 50,
};

export default function Sponsor() {
  const history = useHistory();

  const [nameValue, setNameValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [dataListSecond, setDataListSecond] = useState();
  const [isloading, setIsLoading] = useState(true);

  const [sponsorLink, setSponsorLink] = useState();
  const [isNewDefine, setIsNewDefine] = useState("");

  let email = JSON.parse(localStorage.getItem("Email"));

  const ajax = () => {
    // send message to get profile of a specific sponsor
    const data = fetch("http://localhost:5014/profile/sponsor", {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          setNameValue(data.name);
          if (data.description){
            setDescriptionValue(data.description);
          }else {
            setDescriptionValue('None');
          }


          setDataListSecond(data.needs);
          if (data.link !== null){
            setSponsorLink(`http://${data.link}`);
          }else {
            setSponsorLink(data.link)
          }
          setIsLoading(false);
          if (data.newDefine === 'Empty'){
            setIsNewDefine("");
          }else if (data.newDefine) {
            setIsNewDefine(data.newDefine);
          }
          console.log(data, "data.....");
        });
      } else {
        alert("Invalid input !");
      }
    });
  };

  useEffect(() => ajax(), []);

  const token = memoryUtils.token;
  if (token.length === undefined) {
    history.push("/login");
  }

  const handleClick = () => alert("sendMessage");

  const handleHref = () => history.push("/SponsorProfileUpdate");

  return (
    <Container>
      <Form className="mb-3" noValidate>
        <Row className="justify-content-md-center">
          <Col md={{ span: 6, offset: 3 }} style={divStyle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h4 style={{ textAlign: "left", width: "100%" }}>
                Sponsor profile
              </h4>
            </div>
            <div
              style={{
                border: "1px solid #eeeeee",
                margin: "20px 20px",
                padding: 10,
              }}
            >
              <Form.Group className="mb-3" controlId="userName">
                <Form.Label>Name </Form.Label>
                <InputGroup>
                  <Form.Control
                    require
                    disabled
                    type="text"
                    value={isloading ? "loading..." : nameValue}
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea"
                              require
                              plaintext
                              readOnly
                              value={isloading ? "loading..." : descriptionValue}
                              style={typeof descriptionValue === 'string' && descriptionValue.length > 200 ?
                                {height:`${descriptionValue.length - 50}px`} :
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
                  {dataListSecond &&
                    dataListSecond.map((item, index) => (
                      <tr>
                        <td>{index}</td>
                        <td>{item}</td>
                      </tr>
                    ))}
                  {isNewDefine ? (
                    <tr>
                      <td>{dataListSecond.length}</td>
                      <td>{isNewDefine}</td>
                    </tr>
                  ) : (
                    <></>
                  )}
                </tbody>
              </Table>
              Official Link:&nbsp;
              <a href={sponsorLink} target="_blank">{sponsorLink}</a>
              <div style={{ display: "flex" }}>
                <div></div>
                <div style={{ marginLeft: "auto" }}>
                  <Button
                    className="mr-3"
                    variant="primary"
                    type="submit"
                    onClick={handleHref}
                  >
                    <span class="iconfont">&#xe89a;</span>
                    &nbsp; Update
                  </Button>
                  <Button className="mr-3" variant="outline-danger" href="/">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
