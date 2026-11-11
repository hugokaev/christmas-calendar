// This is the starting point. It finds the <div id="root"> in index.html
// and tells React to draw our App inside it.
//
// HashRouter puts the page name after a # , like .../#/day/5 .
// That looks slightly odd, but it is what makes links work on GitHub
// Pages: GitHub only serves real files, so a normal /day/5 address would
// give a 404 when opened directly or refreshed. The part after the # never
// reaches the server, so every page works.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { WhoProvider } from './lib/WhoContext.jsx'
import App from './App.jsx'
import './index.css'
import './forms.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <WhoProvider>
        <App />
      </WhoProvider>
    </HashRouter>
  </React.StrictMode>,
)
