import React from "react";
import { Nav, Button, Navbar } from "react-bootstrap";
import memoryUtils from "../../utils/memory";
import storageUtils from "../../utils/storage";
import { useHistory } from "react-router-dom";

export default function Header() {
  const history = useHistory();
  const role = memoryUtils.role;
  console.log(memoryUtils.token)

  const Logout = () => {
    storageUtils.removeToken();
    memoryUtils.token = {};
    storageUtils.removeRole();
    memoryUtils.role = {};
    history.push("/");
    window.location.reload();
  };

  const toLogin = () => {
    history.push("/login");
  };

  const recommend = () => {
    const token = memoryUtils.token;
    if (token.length === undefined) {
      history.push("/login");
    } else {
      history.push("/recommend");
    }
  };

  const toProfile = () => {
    if (role === "1") {
      history.replace("/CharityProfile");
    } else {
      history.replace("/SponsorProfile");
    }
  };

  const toMail = () => {
    history.replace("/mail");
  };

  return (
    <Navbar expand="lg" bg="light" variant="light">
      <Navbar.Brand href="/">
        <img
          src="https://static.thenounproject.com/png/3477853-200.png"
          style={{ height: "45px", weight: "45px" , padding: "5px 10px"}}
          alt="icon"
        />
        Charity Connect
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse>
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/biggestsponsor">Biggest Sponsor</Nav.Link>
          <Nav.Link onClick={recommend}>Recommendation</Nav.Link>
          {role === "2" ? (
            <Nav.Link href="/search">
              <span class="iconfont">&#xe89e;</span>&nbsp;Search
            </Nav.Link>
          ) : (
            <></>
          )}
        </Nav>

        <Nav className="justify-content-end">
          {memoryUtils.token.length === undefined ? (
            <>
              <Button
                className="mr-3"
                variant="outline-primary"
                id="loginBtn"
                onClick={toLogin}
              >
                Login
              </Button>
              <Button className="mr-3" variant="primary" href="/register">
                Sign up
              </Button>
            </>
          ) : (
            <>
              <Button
                className="mr-3"
                variant="outline-danger"
                onClick={toMail}
              >
                <span class="iconfont">&#xe8a0;</span>
                &nbsp;Mail
              </Button>
              <Button
                className="mr-3"
                variant="outline-info"
                onClick={toProfile}
              >
                <span class="iconfont">&#xe60a;</span>
                &nbsp;Profile
              </Button>
              <Button
                className="mr-3"
                variant="outline-danger"
                onClick={Logout}
              >
                Logout
              </Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
