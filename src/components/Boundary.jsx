// Stops one broken component from blanking the whole site.
//
// You and Gabriel are both pushing code to the same website. Without this,
// a typo in his Christmas tree would white-screen your calendar too. With
// it, his tree shows a small error message and everything else carries on.
//
// This has to be a class component — React has no hook version of it.
import { Component } from 'react'

export default class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Leave the details in the console for whoever is debugging.
    console.error(`[${this.props.name ?? 'component'}] crashed:`, error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <p className="boundary">
          <strong>{this.props.name ?? 'Something'}</strong> stopped working:{' '}
          {this.state.error.message}
          <br />
          The rest of the page is fine. Check the browser console for details.
        </p>
      )
    }

    return this.props.children
  }
}
