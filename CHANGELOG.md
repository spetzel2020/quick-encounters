# Changelog

## 0.4.0 Bug fixes
FIXED

## 0.3.4 Bug fixes
FIXED (v0.3.4) 5. With Method 1, the Journal Entry is re-opened when we create the Map Note
    - Use a timer to wait for the Journal Sheet to be closed
FIXED (v0.3.4) Sometimes the corresponding Map Note is not deleted when you delete the Journal Entry

## 0.3.3 Bug fix
FIXED: If you didn't have a count before the Actor entry, and the Actor description included a number, that's how many copies of the actor you got

## 0.3.2 Show a tutorial Journal Entry if you press Quick Encounters without selected tokens or an applicable open Journal Entry

## 0.3.1 Method 1 inserts actors so both methods produce similar Quick Encounter Journal Entries

## 0.3.0 Working Method 2
- Added the tokens to the Combat tracker (toggleCombat)
- Don't put the tokens on top of each other
- refactor to use same toggleCombat for both methods
- Use # of actors-

## 0.2.0 Proof of concept of Method 2 (open a Journal Entry referencing actors and click the Quick Encounter button)

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
