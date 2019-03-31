# Plant Watering System Monitor
#### REST Client for the [PWS Project](https://github.com/OlivierLD/raspberry-coffee/tree/master/Project.Trunk/PlantWateringSystem) for the Samsung Frontier watch.
 
It is a GUI (HTML/JS/CSS) for the REST services of the `/pws` family.

If `192.168.42.27` is the IP address of the PWS server, and `8088` the port the REST server runs on, then
```
 GET http://192.168.42.27:8088/pws/oplist
```
returns
```
[
    {
        "verb": "GET",
        "path": "/pws/oplist",
        "description": "List of all available operations.",
        "fn": {}
    },
    {
        "verb": "GET",
        "path": "/pws/sensor-data",
        "description": "Get device Data. Temperature, humidity",
        "fn": {}
    },
    {
        "verb": "GET",
        "path": "/pws/relay-state",
        "description": "Get relay state - ON or OFF.",
        "fn": {}
    },
    {
        "verb": "GET",
        "path": "/pws/last-watering-time",
        "description": "Get last watering time as a long.",
        "fn": {}
    },
    {
        "verb": "GET",
        "path": "/pws/pws-status",
        "description": "Get device's status.",
        "fn": {}
    },
    {
        "verb": "GET",
        "path": "/pws/pws-parameters",
        "description": "Get program's parameters (humidity threshold, time to resume, etc)",
        "fn": {}
    },
    {
        "verb": "POST",
        "path": "/pws/sensor-data",
        "description": "Set device Data. Temperature, humidity, for simulation",
        "fn": {}
    },
    {
        "verb": "PUT",
        "path": "/pws/relay-state",
        "description": "Flip the relay - ON or OFF.",
        "fn": {}
    },
    {
        "verb": "PUT",
        "path": "/pws/pws-parameters",
        "description": "Set the Program's parameters  (humidity threshold, time to resume, etc).",
        "fn": {}
    }
]
```

### Structure of the App
There is _one_ HTML page named `index.html`, it contains _no_ JavaScript code.

`index.html` contains 4 screens:
- 1/4: The Last Watering Time and the status of the device (Watching the probe, Watering, etc)
- 2/4: The Soil Humidity rendering from 0% to 100%, on a round display with a needle.
- 3/4: A Rocker Switch to set the pump on or off, manually
- 4/4: A small keyboard interface to change the server'IP and port if needed.

To go from screen to screen, you use the ring around the watch (aka `detent`), clockwise or counter-clockwise.

It imports 
- `js/AnalogDisplay.js` for the humidity rendering
- `ls/main.js` _at the end of the page_, to make sure the DOM tree of the page is loaded. This one contains the logic of the application.

In `js/main.js`, you will find
- the `getPromise` method (ES6 Promise management) that will be used to invoke the REST services on the server.
- The subscription to the `detent` events
- The `init` function, used as `window.onload`, that will eventually use a `window.setInterval` to invoke the REST services every second.
See in the `promises` management the way the different screens are populated.

---

