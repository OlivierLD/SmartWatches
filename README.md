# SmartWatches
Smart watches and wearable applications

### Pebble
Was acquired by Fitbit. My Pebble repo was moved [here](./pebble), for archiving purpose.

### Samsung Frontier
#### To get started
- Install the [Tizen IDE](https://www.tizen.org/).
    - Also install, through the Package Manager:
        - Wearable Emulator
        - Web app. development (IDE)
        - Extension SDK Samsung Certificate Extension
        - Extension SDK Samsung Wearable Extension
- To connect a remote device (like a Frontier watch):
```
> Settings > Connections > WiFi > WiFi Network > Tap Network Name > IP Address
```
- Tizen Network proxy
```
Preferences > Network Connections, in all packages (Tizen, Certificates Manager, etc)
```
- After generating a Certificate profile, re-start the Tizen IDE for the profile to be taken in account.
- To get the devices DUID, go to Device Manager > right-click on the device, then DUID.
- Build Signed Package, then Run or Debug on the device.

##### Step-by-step, install and run the `Hello Tizen` example
- In Tizen, New Project > Sample > Next > Wearable > Next > Web Application > Next > General > Hello Tizen > Next > Finish
  - **Important** Choose a Tizen version matching the target device !! (Frontier is 3.0.0.2)
- On the watch, Settings > About Gear > Debugging, make sure it is on
- On the watch, Settings > Connections > Wi-Fi > Wi-Fi Networks, find your Network and connect to it.
- On the watch, Settings > Connections > Wi-Fi > Wi-Fi Networks, tap network name, and find your IP address.
- In Tizen, Device Manager > Remote Device Manager > Find your device, and make sure in is ON.
- In Tizen, Certificate Manager > create a new Samsung Certificate > Mobile/Wearable > Create a new profile, give it a name > Next > Create a new author certificate > Next > fill the fields, check the "apply the same password for distributor certificate" box > Next > Logging to your Samsung account when prompted > Next (Backup path not mandatory) > Next > Create a new distributor certificate > Enter passwords, and from the Device Manager, for each device (including Emulators you have started before), right-click on the device name, find the DUID > Click the 'Copy' button > Next > Finish > Make sure the certificate is active (checked). > Close.
- If Tizen is running (and it probably is), re-start it.
- In Tizen, right-click on your app (Hello Tizen) > Build signed packaged
- In the menu bar, select the device or the emulator in the drop-down list
- In the menu bar, from the "Run" poplist or from a right-click on the app name > Run (or Debug) as > Tizen Web App
    - You may be prompted for your account password (to be entered twice, follow the instructions in the popup).
    - The app should be installed on your device.
- Try to modify the code, add some `console` statements, re-build, re-run, and see for yourself!

##### REST Requests
Here is a way (and this is just **_a_** way, look into the code, look for `new Promise`) to make a REST `GET` request to some external resource:
```javascript
    // Do some REST Request here
    let url = "http://donpedro.lediouris.net/php/weather/reports.v2/json.data.php?type=ALL&period=LAST";
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
//          console.log("XHR returns", xhr.responseText);
            let resp = JSON.parse(xhr.responseText);
            if (resp !== undefined && resp.data !== undefined && resp.data.length > 0) {
                console.log(JSON.stringify(resp, null, 2));
            } else {
                console.log(JSON.stringify(resp, null, 2));
            }
        } else {
            let errMess = "XHR: State:" + xhr.status + "\nRS:" + xhr.readyState;
            console.log(errMess);
        }
    };
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
    console.log("Weather data was requested");
```

_Important_: Make sure you use `"use strict";` if you need (or want) to use ES6 syntax.
The IDE seems not to like, it shows syntax like `() => { ... }` as errored, but it works OK, apparently.

As it is a Web Application, your browser's Developer tools are available in `debug` mode. Very cool.

_Note_: Look in the code for more elaborated examples of REST requests, also using ES6 Promises.

#### To check
- Web Socket availability?
- Web Components support for HTML/JS/CSS apps?

