import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";

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

export default function Profile() {
  const history = useHistory();

  const [CharityName, setCharityName] = useState("");
  const [CharityDescription, setCharityDescription] = useState("");
  const [firstValue, setFirstValue] = useState("");
  const [secondVlue, setSecondValue] = useState("");
  const [threeVlue, setThreeValue] = useState("");
  const [defineValue, setDefineValue] = useState("");

  let email = JSON.parse(localStorage.getItem("Email"));

  const ajax = () => {
    const data = fetch("http://localhost:5014/profile/charity", {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          console.log(data, ".......");
          setCharityName(data.name);
          setCharityDescription(data.description);
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
            setDefineValue(data.newDefine);
          }
        });
      } else {
        alert("Invalid input !");
      }
    });
  };

  useEffect(() => {
    ajax();
  }, []);

  const submitAjax = (params) => {
    if (params.name === ""){
      alert('Name could not be empty');
    }
    const data = fetch("http://localhost:5014/profile/charity/change", {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        email,
        ...params,
      }),
    }).then((res) => {
      if (res.status === 200) {
        res.json().then((data) => {
          alert("Your profile is updated successfully!");
        });
      } else {
      }
    });
  };

  const handleCancel = () => {
    history.push("/CharityProfile");
  };

  const handleNameValue = (e) => {
    let naemValue = e.target.value;
    setCharityName(naemValue);
  };

  const handleDescription = (e) => {
    let descriptionValue = e.target.value;
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
    let selectedSecondValue = e.target.value;
    setThreeValue(selectedSecondValue);
  };

  const handleDefine = (e) => {
    let defineValue = e.target.value;
    setDefineValue(defineValue);
  };

  const handleClick = (e) => {
    let params = new Object();
    params.name = CharityName;
    params.description = CharityDescription;
    params.firstNeed = firstValue;
    params.secondNeed = secondVlue;
    params.thirdNeed = threeVlue;
    if (defineValue === ''){
      params.defineNeed = 'Empty';
    }else{
      params.defineNeed = defineValue;
    }

    e.preventDefault();
    console.log(params)

    submitAjax(params);
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
                  Charity profile update
                </h4>
              </Col>
            </Row>
            <Row style={RowStyle}>
              <Col>
                <Form.Group controlId="formControlsTextarea">
                  <Form.Label md={4}>Charity name:</Form.Label>
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
                    // placeholder=""
                    onChange={handleDescription}
                    value={CharityDescription}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col md={{ span: 6, offset: 3 }} style={secColumnStyle}>
            <Row style={RowStyle}>
              <Col style={ColStyle}>What we want...</Col>
            </Row>
            <Row style={RowStyle}>
              <Col md={4}>Select needs:</Col>
              <Col md={8}>
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
                    defaultValue="None"
                    onChange={handleSelectSecond}
                    value={secondVlue}
                  >
                    {needs.map((item, index) => {
                      return <option key={index}>{item}</option>;
                    })}
                  </Form.Control>
                  <Form.Control
                    style={{ margin: "3px auto" }}
                    as="select"
                    defaultValue="None"
                    onChange={handleSelectThree}
                    value={threeVlue}
                  >
                    {needs.map((item, index) => {
                      return <option key={index}>{item}</option>;
                    })}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row style={RowStyle}>
              <Col>
                <Form.Label md={4}>Define new need (Optional):</Form.Label>
                <Form.Control
                  md={8}
                  require
                  placeholder=""
                  onChange={handleDefine}
                  value={defineValue}
                />
              </Col>
            </Row>
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
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
