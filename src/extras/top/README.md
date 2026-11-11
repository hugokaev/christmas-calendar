Anything you put in this folder appears ABOVE the calendar on the main page.

Create a .jsx file here that default-exports a component, for example
Countdown.jsx:

    export default function Countdown() {
      return <p>12 sleeps to go</p>
    }

It is picked up automatically. You never edit a shared file, so you and
Gabriel can both add things here without Git conflicts.

Give your file a distinctive name so you do not both create Countdown.jsx.
