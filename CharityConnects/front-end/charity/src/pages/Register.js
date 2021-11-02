import React, {useState} from "react";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  ToggleButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import memoryUtils from "../utils/memory";
import storageUtils from "../utils/storage";

const divStyle = {
  margin: "50px auto",
  border: "1px solid #eee",
  padding: "15px",
  borderRadius: "10px",
};

function Register() {
  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const [role, setRole] = useState("1");


  const token = memoryUtils.token;
  const roleStorage = memoryUtils.role;
  console.log(token);
  if (token.length !== undefined) {
    if (roleStorage === "1"){
      history.push('/CharityProfile');
    }else {
      history.push('/SponsorProfile');
    }
  }

  const option = (vals) => {
    setRole(vals);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);

    const email = form.formBasicEmail.value;
    const password1 = form.basicPassword.value;
    const password2 = form.comPassword.value;
    const name = form.userName.value;
    console.log(email.length, password1.length, password2.length, name.length, role);

    if (email.length !== 0 && password1.length !== 0 && password2.length !== 0 && name.length !== 0) {
      if (password1 !== password2){
        alert('Two passwords are different');
      }else {
        const res = await fetch('http://localhost:5014/user/register', {
          headers: { 'Content-type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password1,
            password2,
            role
          })
        })
        // const token = await res.json();
        if (res.status === 201) {
          memoryUtils.token = email;
          storageUtils.saveToken(email);
          memoryUtils.role = role;
          storageUtils.saveRole(role);
          res.json().then(data => console.log(data));
          if (role === "1") {
            history.push('/CharityProfile');
          }else {
            history.push('/SponsorProfile');
          }
          window.location.reload();
        } else if (res.status === 200) {
          alert('The email address is already exists');
        }else {
          alert('The email address format is wrong');
        }
      }

    }
  };

  return (
    <>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={{ span: 6, offset: 3 }} style={divStyle}>
            <Form className="mb-3" noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="userName">
                <Form.Label>Name</Form.Label>
                <Form.Control required type="text" placeholder="name" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control required type="email" placeholder="example@gmail.com" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="basicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control required type="password" placeholder="Password" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="comPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control required type="password" placeholder="Password" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="character">
                <Form.Label>Select one character</Form.Label>
                <br />
                <ToggleButtonGroup type="radio" name="options" defaultValue={"1"} onChange={option}>
                  <ToggleButton variant="secondary" id="charity" value={"1"}>
                    Charity
                  </ToggleButton>
                  <ToggleButton variant="secondary" id="sponsor" value={"2"}>
                    Sponsor
                  </ToggleButton>
                </ToggleButtonGroup>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Agree our Term of Use" />
              </Form.Group>
              <Button className="mr-3" variant="primary" type="submit">
                Sign up
              </Button>
              <Button variant="outline-danger" href="/">
                Cancel
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Register;
