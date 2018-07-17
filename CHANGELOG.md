# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.3.1](https://github.com/BTMorton/angular2-grid/compare/v2.3.0...v2.3.1) - 2018-07-17
### Changed
- Exposed NgConfigFixDirection interface ([#294](https://github.com/BTMorton/angular2-grid/issues/294))
- Update Angular peer dependecy to support Angular 5 ([#292](https://github.com/BTMorton/angular2-grid/issues/292))

## [2.3.0](https://github.com/BTMorton/angular2-grid/compare/v2.2.4...v2.3.0) - 2018-07-14
### Added
- Configuration of available resize directions ([#290](https://github.com/BTMorton/angular2-grid/pull/290))
- Item overlap support ([#238](https://github.com/BTMorton/angular2-grid/issues/238))

## [2.2.4](https://github.com/BTMorton/angular2-grid/compare/v2.2.3...v2.2.4) - 2018-07-14
### Fixed
- Error in fix position logic ([#289](https://github.com/BTMorton/angular2-grid/issues/289))

## [2.2.3](https://github.com/BTMorton/angular2-grid/compare/v2.2.1...v2.2.3) - 2018-06-11
(Version 2.2.2 was mispublished and did not include any changes)
### Added
- Code linting

## [2.2.1](https://github.com/BTMorton/angular2-grid/compare/v2.2.0...v2.2.1) - 2018-06-10
### Fixed
- Remove debug logging

## [2.2.0](https://github.com/BTMorton/angular2-grid/compare/v2.1.0...v2.2.0) - 2018-06-10
### Added
- Configuration to specify directions to fix item positions
- Top/left resizing for items ([#191](https://github.com/BTMorton/angular2-grid/issues/191))

### Changed
- Handling of items in the grid rework, removing the item grid and replacing it with a set of items currently in the grid ([#267](https://github.com/BTMorton/angular2-grid/pull/267))
- Overhaul algorithm for fixing item positions ([#264](https://github.com/BTMorton/angular2-grid/issues/264))
- Only listen to mouse events when configuration requires it ([#287](https://github.com/BTMorton/angular2-grid/pull/287))

### Fixed
- Change detection of user configuration
- Resize detection on item extremities ([#282](https://github.com/BTMorton/angular2-grid/issues/282))

## [2.1.0](https://github.com/BTMorton/angular2-grid/compare/v2.0.7...v2.1.0) - 2017-10-22
### Added
- Option to center items when using `limit_to_screen` ([#261](https://github.com/BTMorton/angular2-grid/pull/261))

## [2.0.7](https://github.com/BTMorton/angular2-grid/compare/v2.0.6...v2.0.7) - 2017-09-01
### Added
- Config option to allow calculation max rows by element size ([#250](https://github.com/BTMorton/angular2-grid/issues/250))

### Changed
- Update usage steps in Readme ([#248](https://github.com/BTMorton/angular2-grid/pull/248))

### Fixes
- Use explicit exports for better compiler support ([#257](https://github.com/BTMorton/angular2-grid/pull/257))
- Add a check to prevent items being resized larger than the available columns ([#258](https://github.com/BTMorton/angular2-grid/pull/258))
- Improve handling of oversized items ([#260](https://github.com/BTMorton/angular2-grid/issues/260))
- Improve calcuation of drag and resize areas ([#245](https://github.com/BTMorton/angular2-grid/issues/245))

## [2.0.6](https://github.com/BTMorton/angular2-grid/compare/v2.0.5...v2.0.6) - 2017-06-28
### Fixes
- Add verification of item positions when calculating positions

## [2.0.5](https://github.com/BTMorton/angular2-grid/compare/v2.0.4...v2.0.5) - 2017-06-25
### Changed
- Update peer dependencies to support Angular v4

## [2.0.4](https://github.com/BTMorton/angular2-grid/compare/v2.0.3...v2.0.4) - 2017-06-25
### Added
- Add public method to trigger a resize

### Changed
- Use absolute positioning instead of css transform ([#241](https://github.com/BTMorton/angular2-grid/issues/241))

### Fixed
- Revert a bug caused by a change when removing items ([#242](https://github.com/BTMorton/angular2-grid/issues/242))
- Fix Firefox dragHandle issue ([#225](https://github.com/BTMorton/angular2-grid/issues/225))
- Remove debug logging

## [2.0.3](https://github.com/BTMorton/angular2-grid/compare/v2.0.2...v2.0.3) - 2017-06-03
### Changed
- Use [ngGrid] binding instead of [ng-grid] in readme ([#205](https://github.com/BTMorton/angular2-grid/pull/205))

### Fixed
- Several issues with `limit_to_screen` property

## [2.0.2](https://github.com/BTMorton/angular2-grid/compare/v2.0.1...v2.0.2) - 2017-03-05
### Added
- Gitter link in README ([#198](https://github.com/BTMorton/angular2-grid/issues/198))
- Change log ([#195](https://github.com/BTMorton/angular2-grid/issues/195))

### Fixed
- Null item bug in dragStart ([#208](https://github.com/BTMorton/angular2-grid/issues/208))
- Touch events freezing on iDevices ([#190](https://github.com/BTMorton/angular2-grid/issues/190))
- `limit_to_screen` property not being honoured when adding new items ([#199](https://github.com/BTMorton/angular2-grid/issues/199))

## [2.0.1](https://github.com/BTMorton/angular2-grid/compare/v1.1.0...v2.0.1) - 2017-01-26
### Changed
- Distributed bundle files
- Build process

## [1.0.1](https://github.com/BTMorton/angular2-grid/compare/v1.0.0...v1.0.1) - 2017-01-24 [YANKED]
### Added
- Additional demo page ([#177](https://github.com/BTMorton/angular2-grid/pull/177))

### Changed
- Updated readme and demo
- Include margin values for row height calculations ([#174](https://github.com/BTMorton/angular2-grid/pull/174))
- Make host methods public ([#176](https://github.com/BTMorton/angular2-grid/pull/176))

### Fixed
- Null item bug in resizeStart ([#185](https://github.com/BTMorton/angular2-grid/pull/185))

## [1.0.0](https://github.com/BTMorton/angular2-grid/compare/v0.11.2...v1.0.0) - 2015-01-24 [YANKED]
### Changed
- Distributed bundle files

## [0.11.2](https://github.com/BTMorton/angular2-grid/compare/v0.11.1...v0.11.2) - 2016-11-25
### Fixed
- Errors caused by debugging in old commit ([#164](https://github.com/BTMorton/angular2-grid/issues/164))

## [0.11.1](https://github.com/BTMorton/angular2-grid/compare/v0.11.0...v0.11.1) - 2016-11-22
### Changed
- Item change events now also trigger on add item and remove item ([#134](https://github.com/BTMorton/angular2-grid/issues/134))
- Reduced default item drag/resize border size from 50 to 25

### Fixed
- Dragging in safari ([#137](https://github.com/BTMorton/angular2-grid/issues/137))

## [0.11.0](https://github.com/BTMorton/angular2-grid/compare/v0.10.0...v0.11.0) - 2016-11-17
### Changed
- Updated to Angular version 2.0.0

## [0.10.0](https://github.com/BTMorton/angular2-grid/compare/v0.9.1...v0.10.0) - 2016-09-13

## [0.9.1](https://github.com/BTMorton/angular2-grid/compare/v0.9.0...v0.9.1) - 2016-07-30

## [0.9.0](https://github.com/BTMorton/angular2-grid/compare/v0.8.3....v0.9.0) - 2016-07-25


// TODO: Complete changelog with full history
