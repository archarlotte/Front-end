import './App.css';
import React, {useState} from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from "./components/header/Header";
import Login from './pages/Login';
import Mainpage from "./pages/Mainpage";
import Register from "./pages/Register";
import Outline from "./pages/CharityProfile"
import Sponsor from "./pages/SponsorProfile"
import Search from "./pages/Search"
import Profile from "./pages/CharityProfileUpdate"
import SponsorProfile from "./pages/SponsorProfileUpdate"
import Recommendation from './pages/Recommendation';
import BiggestSponsor from "./pages/BiggestSponsor"
import BiggestSponsorProfile from "./pages/BiggestSponsorProfile"
import Mail from "./pages/Mail";

function App() {

  return (
    <>
      <BrowserRouter>
      <Header className="App-header" />
        <Switch>
          <Route exact path={'/'} component={Mainpage} />
          <Route path={'/Login'} component={Login} />
          <Route path={'/Search'} component={Search} />
          <Route path={'/Register'} component={Register} />
          <Route path={'/CharityProfile'} component={Outline} />
          <Route path={'/SponsorProfile'} component={Sponsor} />
          <Route path={'/CharityProfileUpdate'} component={Profile} />
          <Route path={'/SponsorProfileUpdate'} component={SponsorProfile} />
          <Route path={'/BiggestSponsorProfile'} component={BiggestSponsorProfile} />
          <Route path={'/biggestsponsor'} component={BiggestSponsor} />
          <Route path={'/recommend'} component={Recommendation} />
          <Route path={'/mail'} component={Mail} />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
