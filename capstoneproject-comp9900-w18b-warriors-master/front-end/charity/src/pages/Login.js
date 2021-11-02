import React, {useState} from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import memoryUtils from '../utils/memory';
import storageUtils from '../utils/storage';

const divStyle = {
  margin: "100px auto",
  border: "1px solid #eee",
  padding: "15px",
  borderRadius: "10px",
}

function Login() {
  const history = useHistory();
  const token = memoryUtils.token;
  const roleStorage = memoryUtils.role;
  const [validated, setValidated] = useState(false);

  if (token.length !== undefined) {
    if (roleStorage === "1") {
      history.push('/CharityProfile');
    }else {
      history.push('/SponsorProfile');
    }
  }

  const handleSubmit = (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);
    e.preventDefault();

    const email = form.formBasicEmail.value;
    const password = form.formBasicPassword.value;

    if (email.length !== 0 && password.length !== 0) {
      const loginData = fetch('http://localhost:5014/user/login', {
        headers: { 'Content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        })
      }).then( res => {
        if (res.status === 200) {
          memoryUtils.token = email
          storageUtils.saveToken(email)
          res.json().then(data => {
            memoryUtils.role = data.role;
            storageUtils.saveRole(data.role);
            if (data.role === "1") {
              history.replace('/CharityProfile');
            } else {
              history.replace('/SponsorProfile')
            }
            window.location.reload();
          })
        } else if (res.status === 400){
          alert("Login fail: account doesnt exist");
        }
        else {
          alert('The email address or password may be wrong!');
        }
      })
    }
  };

  return (
    <div>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={{ span: 6, offset: 3 }} style={divStyle}>
            <Form className="mb-3" noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control required type="email" placeholder="Enter email" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control required type="password" placeholder="Password" />
              </Form.Group>
              <Button className="mr-3" variant="outline-primary" type="submit">
                Submit
              </Button>
              <Button variant="outline-danger" href="/">Cancel</Button>
              <Button className="ml-5" variant="primary" href="/register">
                Sign up
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
