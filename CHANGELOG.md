# Release Notes

## 0.6.0ab
- Allow Compendium entries as well as Actors
- Fixed? Combat tracker now pops up more reliably
- Was popping an extra copy of the tutorial every time you pressed the button

## v0.5.4
- Spanish translation of dialogs and messages (thanks https://github.com/lozalojo)
- Move asking about creating a Map Note to when you want to run the Encounter; otherwise put a warning in the dynamic section
- New option: **Freeze "captured" tokens** option to control whether saved tokens are regenerated (for example by TokenMold) or copied as is
- Fixed: If you had the Tutorial Journal Entry open and tried to save a Journal Entry and then close it, it would delete the Journal Entry
- Fixed: Remove any existing versions of the dynamic QE Journal button first before recomputing it
        - in Foundry v0.7.3 it was getting re-added each time        

## v0.5.2
- Fixed: You can now add additional Actors to a Quick Encounter (uses saved Tokens if they exist, or creates new ones from the embedded Actors)
- Fixed: Make the embedded button smaller - width of the text and centered
- Create a separate dynamic section at the top of a Quick Encounter Journal Entry
- Rewrite Tutorial - corrected errors and simplified

## v0.5.0
### Changes
- Now lets you include Friendly tokens (for example Players) in an Encounter (but checks first)
- Dynamically adds a Quick Encounter button at the top of any candidate Quick Encounter Journal Entry
- Automatically adds a Note for Method 1, and asks for Method 2

### Bug Fixes
- Fixed: Works better with Token Mold! Saved tokens are now reproduced exactly (before, saved tokens were re-rolled and changed when you ran the Quick Encounter)
- Fixed: No more ruining a surprise encounter: no longer puts an XP message in the chat, but rather a total in the Quick Encounter Journal Entry
- Fixed: Was opening a second Tutorial window; now re-opens the existing window
- Fixed: Was not waiting long enough to switch to the Quick Encounter scene
- Fixed: "Fist" icon was not being shown on Add Quick Encounter to Combat Tracker button


## v0.4.3
Fixed module.json Description

## v0.4.2 Bug fixes
FIXED 0.4.1 If the number of Actors is part of a sentence, it won't be picked up correctly
FIXED 0.4.1 If you have a Player selected when you open your Quick Encounter, it will create a new one instead
            - Fixed: Ignore Friendly tokens
FIXED 0.4.1 Was using Dialog.prompt which doesn't exist in 0.6.6 - replaced with local implementation

## 0.4.1 Bug fixes
FIXED Delete corresponding Map Note wasn't working

## 0.4.0 Bug fixes
FIXED (v0.4.0) Error in onDelete of Tutorial Journal because oneDelete->close triggers another deletion call
NOT A BUG 6. Why do we sometimes get Unknown tokens being added - seem to be left over from previous interruptions in testing
FIXED (v0.4.0) v0.3.4 If you drag additional Actors to the Journal Entry, they are not getting added

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
