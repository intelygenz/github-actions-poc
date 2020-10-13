import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import config from "./config";

export let API_BASE_URL: string;
config
  .then((envVariables: { API_BASE_URL: string }) => {
    API_BASE_URL = envVariables.API_BASE_URL;
    ReactDOM.render(<App />, document.getElementById("root"));
  })
  .catch((err: any) => {
    console.error("Cannot get configuration file.", err);
  });


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
