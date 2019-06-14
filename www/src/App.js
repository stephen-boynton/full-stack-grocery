import { render } from "react-dom";
import React, { Component } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import client from './utility/ApolloClient';
import { ApolloProvider } from "react-apollo";
import Login from './pages/login';
import Main from './pages/Main';

class App extends Component {
  state = {
    isAuthenticated: false,
    user: {}
  };

  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Switch>
            <Route path="/login/" component={Login} />
            <Route path="/" component={Main} />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    )
  }
};

export default App;