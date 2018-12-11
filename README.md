# SmartWatches
Smart watches and wearable applications

### Pebble
Was acquired by Fitbit. My [Pebble repo](https://github.com/OlivierLD/pebble) is still here, but might not be there forever.

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
... Soon.
