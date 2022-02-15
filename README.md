Modified Kitronik Air Quality library

The functionality of the board are exposed as Jacdac servers instead of native blocs, so that the user can leverage the jacdac simulation in MakeCode. The Jacdac server are not enabled in the simulator and turned on when running on hardware.

## Development

-   Open project in codespaces or makecode.microbit.org
-   Compile and drop binary.hex in microbit
-   Open https://microsoft.github.io/jacdac-docs/dashboard/ and inspect values

## Todos

-   [ ] CO2 does not work
-   [ ] RTC value is not queried on start (jacdac side issue)
