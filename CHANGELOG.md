# [0.12.0](https://github.com/rafamel/supersour/compare/v0.11.0...v0.12.0) (2020-04-06)


### Features

* api redesign ([0726a83](https://github.com/rafamel/supersour/commit/0726a83160c4fe9480ec264c561f776bc299ec78))


### BREAKING CHANGES

* The library api has been almost entirely redesigned; please check the latest docs.



# [0.11.0](https://github.com/rafamel/supersour/compare/v0.10.0...v0.11.0) (2020-03-26)


### Bug Fixes

* **deps:** updates dependencies ([b763398](https://github.com/rafamel/supersour/commit/b763398e6051b8f7c8e6cd458ca1413d9c73f5da))


### Code Refactoring

* **sources:** renames Subject to SourceSubject to prevent conflicts with RxJS ([b5f0906](https://github.com/rafamel/supersour/commit/b5f09060b89c08a80181b83fad471eaaddb4aca0))
* **sources, utils:** removes Operation source; removes operation and match utils; refactors ([c9fbf55](https://github.com/rafamel/supersour/commit/c9fbf556732f5de117bfa1788d013afdd9fe0b3e))


### BREAKING CHANGES

* **sources, utils:** Operation class, as well as the operation and match utils are no longer available
* **sources:** Subject has been renamed to SourceSubject



# [0.10.0](https://github.com/rafamel/supersour/compare/v0.9.0...v0.10.0) (2020-03-25)


### improvement

* **utils:** match takes an observable instead of a source ([96db3dd](https://github.com/rafamel/supersour/commit/96db3ddcd53e47bf0ea6644f0346baa349a75f15))


### BREAKING CHANGES

* **utils:** match takes an Observable as its first argument instead of a Source



# [0.9.0](https://github.com/rafamel/supersour/compare/v0.8.0...v0.9.0) (2020-03-24)


### Bug Fixes

* **deps:** updates dependencies ([d93113c](https://github.com/rafamel/supersour/commit/d93113cd3a6574ff47c75723bf3cbce388aedce9))
* **sources:** fixes Enclosure's state merging ([eeb82bb](https://github.com/rafamel/supersour/commit/eeb82bb0e3d33b69646ffb3a29e4b1ad3f63e6b5))
* **sources:** fixes MachineQueueResource's queue when busy is manually set ([fbefbe9](https://github.com/rafamel/supersour/commit/fbefbe960f54c7396de650b5a9b905b821a13898))
* **utils:** fixes match when state is an array ([c503e52](https://github.com/rafamel/supersour/commit/c503e5224fc4a37c32217b1bd27d63fe1691cb10))


### Code Refactoring

* **sources:** renames methods: raise to report, block to engage ([5e07351](https://github.com/rafamel/supersour/commit/5e073511334b6e94caa994f8ed033fd31e9fe688))


### Features

* **utils:** changes match api ([207e421](https://github.com/rafamel/supersour/commit/207e4218a31d45c04586483ab60da6098c223f90))


### Reverts

* **sources:** removes MachineQueueResource and MachineQueueSubject ([1a62887](https://github.com/rafamel/supersour/commit/1a62887d923e631717f1943264fc0650a6c74f91))


### BREAKING CHANGES

* **sources:** MachineQueueResoource and MachineQueueSubject are no longer part of this module
* **utils:** match, previously taking an "only" option, takes an "omit" option for the same
purpose, with reverse logic
* **sources:** Reporter's raise method is now report; Machine's block method is now engage



# [0.8.0](https://github.com/rafamel/supersour/compare/v0.7.0...v0.8.0) (2020-02-26)


### Features

* Observables emit their current value upon subscription, if there is one ([d25e79e](https://github.com/rafamel/supersour/commit/d25e79e094296f9e59b605096f87ed80156120f3))


### BREAKING CHANGES

* Observables don't wait for a event to emit their first value; they will emit upon
subscription with the current value for the field



# [0.7.0](https://github.com/rafamel/supersour/compare/v0.6.1...v0.7.0) (2020-02-23)


### Features

* **sources:** adds MachineQueueResource and modifies MachineResource api ([143a40c](https://github.com/rafamel/supersour/commit/143a40c2a675b946ac856d769d14920b1e30f8c6))


### BREAKING CHANGES

* **sources:** MachineResource no longer has an enqueue method. See MachineQueueResource.



## [0.6.1](https://github.com/rafamel/supersour/compare/v0.6.0...v0.6.1) (2020-02-22)



# [0.6.0](https://github.com/rafamel/supersour/compare/v0.5.0...v0.6.0) (2020-02-22)


### Bug Fixes

* **deps:** updates dependencies ([fbf3759](https://github.com/rafamel/supersour/commit/fbf3759b907a718e252df3cb9eff74d916b94ef7))


### Features

* **sources:** adds Reporter and Machine fields to Operation ([d931db8](https://github.com/rafamel/supersour/commit/d931db863f4b258dcdcb46db03dafc4e5763e289))
* **sources:** implements new design (see diagram) ([c293b14](https://github.com/rafamel/supersour/commit/c293b14a933a75ab47f953efbd8412035e43d9cd))


### BREAKING CHANGES

* **sources:** Classes names have changed.



# [0.5.0](https://github.com/rafamel/supersour/compare/v0.4.0...v0.5.0) (2020-02-20)


### Features

* **utils:** adds only filter to match ([34b333c](https://github.com/rafamel/supersour/commit/34b333c9fb2f1fffc35c548dfc359114af1d2504))


### BREAKING CHANGES

* **utils:** Third match function argument has changed to an options object



# [0.4.0](https://github.com/rafamel/supersour/compare/v0.3.2...v0.4.0) (2020-02-19)


### Features

* **sources:** adds compare argument to next method ([dd94f9d](https://github.com/rafamel/supersour/commit/dd94f9dd8018ea415df5a719df229a87ae069f1c))



## [0.3.2](https://github.com/rafamel/supersour/compare/v0.3.1...v0.3.2) (2020-02-18)



## [0.3.1](https://github.com/rafamel/supersour/compare/v0.3.0...v0.3.1) (2020-02-14)



# [0.3.0](https://github.com/rafamel/supersour/compare/v0.2.0...v0.3.0) (2020-02-13)


### Features

* **utils:** adds operation util ([10234ff](https://github.com/rafamel/supersour/commit/10234ff5dc0d23f8b6f9c41d40fbcdf832ff9920))


### Reverts

* **utils:** removes until util ([bffd8b9](https://github.com/rafamel/supersour/commit/bffd8b9269b55d7b17aa2334dda0fba019a3c66b))


### BREAKING CHANGES

* **utils:** `until` util has been removed



# [0.2.0](https://github.com/rafamel/supersour/compare/v0.1.0...v0.2.0) (2020-02-12)


### Features

* **utils:** adds until util ([661449e](https://github.com/rafamel/supersour/commit/661449e99470fbe6119a1c1f3ea0604adc75129a))



# [0.1.0](https://github.com/rafamel/supersour/compare/v0.0.1...v0.1.0) (2020-02-12)


### Features

* adds match util ([f694396](https://github.com/rafamel/supersour/commit/f6943969b784b109953068f0cc2e73b8e1fec34d))



