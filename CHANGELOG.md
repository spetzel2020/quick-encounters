# Changelog

## 0.1.2 Clean-up for Foundry package referencing

## 0.1.1 Clean-up for Foundry package referencing

## 0.1.0 Basic Working Version
Delete Map Note if you delete the Quick Encounters Journal Entry

## 0.0.4 Fix problem with recursive creation of Notes (hopefully)
module.json
- Removed EncounterJournal.js

modules\EncounterJournal.js
- Removed createCombat to QuickEncounters
- No longer being called

modules\QuickEncounters.js
- Add deleteAllEQMapNotes()
   Doesn't really work like the button
- Delete the existing tokens used for creating the Encounter

## 0.0.3
- Change flag keys to constants
- Add button in the Journal Entry itself

## 0.0.2 (2020-09-02)
Bug fixes:
- Can't open JE to edit description because only option is "Add to Combat Tracker"
    - add an extra button called [Add to Combat Tracker]

## 0.0.1 (2020-09-01)

- **Created**
-   Save an encounter by selecting Hostile tokens and pressing the Create Quick Encounter button
    Open the Quick Encounter Journal and activate the Encounter in the Combat Tracker
