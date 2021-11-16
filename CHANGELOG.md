# RELEASE NOTES
## 0.9 
- Supports Foundry 0.8.x only
### 0.9.1
- Merged PR#59 from ironmonk88 to work with Enhanced Journals
- Fixed [#57](https://github.com/spetzel2020/quick-encounters/issues/57)
- Fixed [#63](https://github.com/spetzel2020/quick-encounters/issues/63)
- Closed [#58](https://github.com/spetzel2020/quick-encounters/issues/58) (not a bug)
- Fixed [#61](https://github.com/spetzel2020/quick-encounters/issues/61)
- Planned: #34,  
### 0.9.0
- Implemented Issue [#53](https://github.com/spetzel2020/quick-encounters/issues/53) ; new setting to delete All or Defeated hostile tokens after combat
- Implemented Issue [#54](https://github.com/spetzel2020/quick-encounters/issues/54) ; new setting to Delete or Leave tokens after saving them
    - Visual representation of left tokens is small token icon
## 0.8
- Make QE dialog read-only if from QE is in Compendium Journal
- Updated Spanish & Japanese translation
- Compatible with Foundry 0.8.x
- Bug fixes
### 0.8.5
### 0.8.4
- Fixed: Issue [#49](https://github.com/spetzel2020/quick-encounters/issues/49) (again)
### 0.8.4
- Fixed: Issue [#52](https://github.com/spetzel2020/quick-encounters/issues/52)    
### 0.8.3
- Fixed: Issue [#48](https://github.com/spetzel2020/quick-encounters/issues/48), [#50](https://github.com/spetzel2020/quick-encounters/issues/50), [#51](https://github.com/spetzel2020/quick-encounters/issues/51)
- Compatible with Foundry 0.8.8
### 0.8.2
- Fixed: Issue [#46](https://github.com/spetzel2020/quick-encounters/issues/46), [#47](https://github.com/spetzel2020/quick-encounters/issues/47)
- Updated Japanese translation
### 0.8.1
- Updated Spanish translation
- Compatible with Foundry 0.8.6
### 0.8.0
- Updates to support Foundry 0.8.x
- Make QE dialog read-only if from QE is in Compendium Journal
- Support League standard for module.json format (switch to implicit Github latest link)

## 0.7
- Save tiles as well as tokens!
- Quick remove (hover over the token/tile icon)
- Compatible with Foundry 0.7.9
- Removed the option to not use the Quick Encounter Dialog
- Spanish translation updated
- Global setting to auto-show/hide Quick Encounters + buttons to show/hide individual ones

### 0.7.3
- Bug fixes
- Setting to auto-show Quick Encounters (default Yes)
- Hide button on the QE dialog border to hide individual QEs
- Show button on the JE border to re-show a hidden (or closed) QE

### 0.7.1
- Fixed: Tile translation and tile hide/show override also work

## NEW in 0.6
- Quick Encounter dialog which shows which actors have saved tokens and which will be generated
- Add tokens to existing Quick Encounters (open the Journal Entry, select the token(s), and click the Quick Encounter button)
- Keyboard modifiers when you Run the Quick Encounter: Alt adds all invisible; Ctrl adds all visible
- Use die rolls for number of Actors (e.g. 2d6)
- GM display of Combat XP and per player token
- (v0.6.8) Use Compendium links in Method 2 (so you can defer loading of Actors)
- (v0.6.13) Additional Note icons
- (v0.6.13) Support multiple copies of a QE Note for Traps/Roving/Random Encounters
- Translations: en, es, ja, de, it

### 0.6.13
- Fixed: Delete all associated Scene Notes when you delete a JE    (on this Scene or others) 
- Fixed: When you copy-paste a QE Map Note, a Quick Encounter run from it would add tokens either at the original Note or at a random Note   
        - Generated tokens will be generated around the latest clicked Note; saved tokens will be shifted appropriately
- Bonus: Added Note icons to distinguish your Quick Encounters
- Italian translation added (thanks https://github.com/riccisi)

### 0.6.12
- German translation added (thanks @Fallayn#6414!)
### 0.6.11
- Fixed: Wasn't re-rendering when you add new tokens or increase numbers

### 0.6.10
- Fixed: Every change to the contents of the QE dialog popped up a new dialog
- Fixed: Changes to QE dialog contents were not triggering a re-render
- Fixed: Total XP in QE dialog wasn't updating

### 0.6.9
Fixed: two QE Journal Entries would references only one QE dialog

### 0.6.8
- Fixed a bug where two instances of the same actor produced too many token slots
- Fixed a bug where the Tutorial link to Fantasy Grounds was broken
- Tutorial: Added a link to the current README
### 0.6.7
 - Fixed a bug where wildcard token images didn't work in Method 2
 - Fixed a bug where Compendium links in Journal entries weren't working

### 0.6.6
- Spanish translation updated (thanks https://github.com/lozalojo!)
- Japanese translation added (thanks "touge"!)

### 0.6.5
- Fixed bug: Previouly you would get repeats of the actor if you added tokens for the first Actor 
- Changed CompanionDialog to QuickEncounterDialog throughout for consistency
- Fixed bug: Changing number to a dice roll no longer deletes saved tokens
### 0.6.3
- Switch Use Embedded to Use Companion Dialog
### 0.6.2
- Bug fix: An existing Quick Encounter with no saved tokens was adding null tokens
- Edit Tutorial to reflect new abilities

### 0.6.1
- Companion dialog which shows which actors have saved tokens and which will be generated
- Add tokens to existing Quick Encounters (open the Journal Entry, select the token(s), and click the Quick Encounter button)
- Keyboard modifiers when you Run the Quick Encounter: Alt adds all invisible; Ctrl adds all visible
- Use dice rolls for number of Actors
- Bug fix: Combat XP and per player token now only shown to GM

### 0.6.0abc
- Allow Compendium entries as well as Actors
- Combat tracker now pops up more reliably when run a Quick Encounter
- No longer pops up an extra copy of the tutorial every time you press the Quick Encounter button
- Handle multipliers that are dice rolls, e.g. 1d4+2 Vampire Spawn (Note they must be in Foundry [[/r 1d4+2]] form  to be recognized)

## v0.5
### v0.5.5
- Add Display XP after Combat setting to display Encounter XP and XP per player token when you End Combat
- Confirm compatible with Foundry 0.7.6

### v0.5.4
- Spanish translation of dialogs and messages (thanks https://github.com/lozalojo)
- Move asking about creating a Map Note to when you want to run the Encounter; otherwise put a warning in the dynamic section
- New option: **Freeze "captured" tokens** option to control whether saved tokens are regenerated (for example by TokenMold) or copied as is
- Fixed: If you had the Tutorial Journal Entry open and tried to save a Journal Entry and then close it, it would delete the Journal Entry
- Fixed: Remove any existing versions of the dynamic QE Journal button first before recomputing it
        - in Foundry v0.7.3 it was getting re-added each time        

### v0.5.2
- Fixed: You can now add additional Actors to a Quick Encounter (uses saved Tokens if they exist, or creates new ones from the embedded Actors)
- Fixed: Make the embedded button smaller - width of the text and centered
- Create a separate dynamic section at the top of a Quick Encounter Journal Entry
- Rewrite Tutorial - corrected errors and simplified

### v0.5.0
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


### v0.4.3
Fixed module.json Description

### v0.4.2 Bug fixes
FIXED 0.4.1 If the number of Actors is part of a sentence, it won't be picked up correctly
FIXED 0.4.1 If you have a Player selected when you open your Quick Encounter, it will create a new one instead
            - Fixed: Ignore Friendly tokens
FIXED 0.4.1 Was using Dialog.prompt which doesn't exist in 0.6.6 - replaced with local implementation

### 0.4.1 Bug fixes
FIXED Delete corresponding Map Note wasn't working

## 0.4.0 Bug fixes
FIXED (v0.4.0) Error in onDelete of Tutorial Journal because oneDelete->close triggers another deletion call
NOT A BUG 6. Why do we sometimes get Unknown tokens being added - seem to be left over from previous interruptions in testing
FIXED (v0.4.0) v0.3.4 If you drag additional Actors to the Journal Entry, they are not getting added

### 0.3.4 Bug fixes
FIXED (v0.3.4) 5. With Method 1, the Journal Entry is re-opened when we create the Map Note
    - Use a timer to wait for the Journal Sheet to be closed
FIXED (v0.3.4) Sometimes the corresponding Map Note is not deleted when you delete the Journal Entry

### 0.3.3 Bug fix
FIXED: If you didn't have a count before the Actor entry, and the Actor description included a number, that's how many copies of the actor you got

### 0.3.2 Show a tutorial Journal Entry if you press Quick Encounters without selected tokens or an applicable open Journal Entry

### 0.3.1 Method 1 inserts actors so both methods produce similar Quick Encounter Journal Entries

### 0.3.0 Working Method 2
- Added the tokens to the Combat tracker (toggleCombat)
- Don't put the tokens on top of each other
- refactor to use same toggleCombat for both methods
- Use # of actors-

### 0.2.0 Proof of concept of Method 2 (open a Journal Entry referencing actors and click the Quick Encounter button)

### 0.1.2 Clean-up for Foundry package referencing

### 0.1.1 Clean-up for Foundry package referencing

### 0.1.0 Basic Working Version
Delete Map Note if you delete the Quick Encounters Journal Entry

### 0.0.4 Fix problem with recursive creation of Notes (hopefully)
module.json
- Removed EncounterJournal.js

modules\EncounterJournal.js
- Removed createCombat to QuickEncounters
- No longer being called

modules\QuickEncounters.js
- Add deleteAllEQMapNotes()
   Doesn't really work like the button
- Delete the existing tokens used for creating the Encounter

### 0.0.3
- Change flag keys to constants
- Add button in the Journal Entry itself

### 0.0.2 (2020-09-02)
Bug fixes:
- Can't open JE to edit description because only option is "Add to Combat Tracker"
    - add an extra button called [Add to Combat Tracker]

### 0.0.1 (2020-09-01)

- **Created**
-   Save an encounter by selecting Hostile tokens and pressing the Create Quick Encounter button
    Open the Quick Encounter Journal and activate the Encounter in the Combat Tracker
