This directory will contain apps running on the Samsung Frontier watch.

Use the [Tizen IDE](https://www.tizen.org/) to  build them.

-----------------------------------------------------------

#### Lessons learned
- CSS grid are supported... so-so on the Frontier.

### REST Remote Switch
Drive a Relay connected to a Raspberry Pi.

| Apps | Switch |
|:----:|:------:|
|![Apps](./docimg/RESTSwitch.01.png)|![AWS](./docimg/switch.01.png)|

### Weather Station Client ☁️☀️⛅

| Apps | Client |
|:----:|:------:|
|![Apps](./docimg/weather.station.01.png)|![Apps](./docimg/weather.station.02.png)|

### NMEA Client ⛵
#### <!-- WIP 🚧 --> REST Client for the Nav Server.

| Apps | BSP | AWS | SOG |
|:----:|:---:|:---:|:---:|
|![Apps](./docimg/nmea.client.01.png)|![BSP](./docimg/BSP.png)|![AWS](./docimg/AWS.png)|![SOG](./docimg/SOG.png)|

The rotary detent can be used to change screen, like the left and right arrows and swipes on the screen.

##### The real watch

| BSP  | AWS |
|:----:|:---:|
|![Apps](./docimg/watch.01.jpg)|![BSP](./docimg/watch.02.jpg)|


### NMEA Client ⛵
#### <!-- WIP 🚧 --> REST Client for the Nav Server, V2.

| POS | SOG | COG | Sun Pos | Sun Z | Server IP |
|:----:|:---:|:---:|:---:|:---:|:---:|
|![Apps](./docimg/trackv2.pos.png)|![BSP](./docimg/trackv2.sog.png)|![AWS](./docimg/trackv2.compass.png)|![SOG](./docimg/trackv2.sun.pos.png)|![SOG](./docimg/trackv2.sun.z.png)|![SOG](./docimg/trackv2.ip.png)|

The rotary detent can be used to change screen, like the left and right arrows and swipes on the screen.

---

### TODO
- GPS Location 🛰️. Done &#9989;.
- Street Cleaning 🚗

---

## To install an app on your Frontier watch
- Install Tizen 3.0 and wearable extensions (including the certificate ones)
- Clone the project of your choice in Tizen
- Connect your watch to Tizen
- Generate a Samsung certificate and activate it (with the watch connected)
- Optionally, you might need to modify the hard-coded URLs.
- Re-build the app
- Deploy on the watch, and run.

---
