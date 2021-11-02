import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  DropdownButton,
  Dropdown,
  InputGroup
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { data } from "../modes/data";

const ColStyle = {
  display: "flex",
  alignItems: "center",
};

const RowStyle = {
  padding: "15px 20px",
};
const headStyle = {
  padding: "13px 0",
  borderBottom: "1px solid #eee",
};

const secColumnStyle = {
  margin: "0px auto 0",
  border: "1px solid #eee",
  borderTop: null,
};

export default function Profiles() {
  const history = useHistory();

  const [CharityName, setCharityName] = useState("");
  const [CharityDescription, setCharityDescription] = useState("");
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [threeValue, setThreeValue] = useState("");
  const [company, setCompany] = useState("");
  const [define, setDefine] = useState("");

  let email = JSON.parse(localStorage.getItem("Email"));

  const ajax = () => {
    const res = fetch("http://localhost:5014/profile/sponsor", {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          setCharityName(data.name);
          setCharityDescription(data.description);
          setCompany(data.link);
          setFirstValue(
            Array.isArray(data.needs) && data.needs.length > 0
              ? data.needs[0]
              : ""
          );
          setSecondValue(
            Array.isArray(data.needs) && data.needs.length > 1
              ? data.needs[1]
              : ""
          );
          setThreeValue(
            Array.isArray(data.needs) && data.needs.length > 2
              ? data.needs[2]
              : ""
          );
          if (data.newDefine !== 'Empty'){
            setDefine(data.newDefine);
          }

          console.log(data, "data.....");
        });
      } else {
        alert("Invalid input !");
      }
    });
  };

  useEffect(() => {
    ajax();
  }, []);

  const handleNameValue = (e) => {
    let nameValue = e.target.value;
    setCharityName(nameValue);
  };

  const handleDescription = (e) => {
    const descriptionValue = e.target.value;
    console.log(descriptionValue)
    setCharityDescription(descriptionValue);
  };

  const handleSelectFirst = (e) => {
    let selectedFirstValue = e.target.value;
    setFirstValue(selectedFirstValue);
  };

  const handleSelectSecond = (e) => {
    let selectedSecondValue = e.target.value;
    setSecondValue(selectedSecondValue);
  };

  const handleSelectThree = (e) => {
    let selectedThreeValue = e.target.value;
    setThreeValue(selectedThreeValue);
  };

  const handleCompany = (e) => {
    let Company = e.target.value;
    setCompany(Company);
  };

  const handelDefine = (e) => {
    let Define = e.target.value;
    console.log(Define);
    setDefine(Define);
  };

  const handleClick = (e) => {
    let params = new Object();
    params.name = CharityName;
    params.description = CharityDescription;
    params.firstNeed = firstValue;
    params.secondNeed = secondValue;
    params.thirdNeed = threeValue;
    params.link = company;
    if (define === ''){
      params.defineNeed = 'Empty';
    }else{
      params.defineNeed = define;
    }

    e.preventDefault();
    submitAjax(params);
    console.log(JSON.stringify(params), "params");
    // alert(0)
  };

  const submitAjax = (params) => {
    const data = fetch("http://localhost:5014/profile/sponsor/change", {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        email,
        ...params,
      }),
    }).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          console.log(data)
          alert("Update your profile success!");
        });
      } else {
        alert('something wrong')
      }
    });
  };

  const handelCancel = () => {
    history.replace("/SponsorProfile");
  };

  const needs = [
    "None",
    "foods",
    "clothes",
    "shoes",
    "laptops",
    "books",
    "toys",
  ];

  return (
    <Container
      className="justify-content-md-center"
      style={{ margin: "30px auto 100px auto" }}
    >
      <Form className="mb-3" noValidate>
        <Row>
          <Col md={{ span: 6, offset: 3 }} style={{ border: "1px solid #eee" }}>
            <Row
              type="flex"
              justify="space-between"
              align="middle"
              style={headStyle}
            >
              <Col style={ColStyle}>
                <h4 style={{ textAlign: "left", width: "100%" }}>
                  Sponsor profile update
                </h4>
              </Col>
            </Row>
            <Row style={RowStyle}>
              <Col>
                <Form.Group controlId="formControlsTextarea">
                  <Form.Label md={4}>Sponsor name:</Form.Label>
                  <Form.Control
                    md={8}
                    require
                    type="text"
                    placeholder=""
                    onChange={handleNameValue}
                    value={CharityName}
                  />
                </Form.Group>
                <Form.Group controlId="formControlsTextarea">
                  <Form.Label md={4}>Description & Cause:</Form.Label>
                  <Form.Control
                    md={8}
                    as="textarea"
                    style={{ height: "200px" }}
                    componentClass="textarea"
                    onChange={handleDescription}
                    value={CharityDescription}
                  />
                </Form.Group>
                <Form.Group controlId="formControlsTextarea">
                  <Form.Label md={4}>Company website link:</Form.Label>
                  <InputGroup className="mb-3" >
                    <InputGroup.Text id="basic-addon3">
                      https://
                    </InputGroup.Text >
                    <Form.Control
                      md={8}
                      require
                      type="link"
                      placeholder="www.google.com"
                      value={company}
                      onChange={handleCompany}
                    />
                  </InputGroup>
                </Form.Group>

              </Col>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col md={{ span: 6, offset: 3 }} style={secColumnStyle}>
            <Row style={RowStyle}>
              <Col style={ColStyle}>What we are able to provide...</Col>
            </Row>
            <Row style={RowStyle}>
              <Col md={5}>Select charities' needs:</Col>
              <Col md={6}>
                <Form.Group controlId="formNeeds">
                  <Form.Control
                    as="select"
                    value={firstValue}
                    onChange={handleSelectFirst}
                  >
                    {needs.map((item, index) => {
                      return <option key={index}>{item}</option>;
                    })}
                  </Form.Control>
                  <Form.Control
                    style={{ margin: "3px auto" }}
                    as="select"
                    onChange={handleSelectSecond}
                    value={secondValue}
                  >
                    {needs.map((item, index) => {
                      return <option key={index}>{item}</option>;
                    })}
                  </Form.Control>
                  <Form.Control
                    style={{ margin: "3px auto" }}
                    as="select"
                    onChange={handleSelectThree}
                    value={threeValue}
                  >
                    {needs.map((item, index) => {
                      return <option key={index}>{item}</option>;
                    })}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="formControlsTextarea">
              <Form.Label md={4}>
                Define new thing that you can provide:
              </Form.Label>
              <Form.Control
                md={8}
                require
                type="text"
                placeholder=""
                value={define}
                onChange={handelDefine}
              />
            </Form.Group>
            <Button
              style={{ margin: "15px 0" }}
              className="ml-3"
              variant="outline-primary"
              type="submit"
              onClick={handleClick}
            >
              Update
            </Button>
            <Button
              className="ml-3"
              variant="outline-danger"
              onClick={handelCancel}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
