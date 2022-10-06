# TESTING v1.1.0 WITH FOUNDRY 10 Stable (Build 286)

## BASIC
### METHOD 1 - create JE from selected tokens 
1. Select one friendly token and press QE button -> should ask if you want to add to JE                     ?? in 1.1.0
2. Select multiple friendly and neutral tokens -> should ask...						                        ?? in 1.1.0
3. Select one hostile token and press QE button -> adds to JE	                                            ?? in 1.1.0
4. Select multiple hostile and neutral tokens and press QE button -> adds to JE 				            ?? in 1.1.0

### METHOD 2 - add Actors/Tokens to blank JE
1. Embed actor references in a vanilla Journal Entry ; should re-render with QE dialog                      ?? in 1.1.0
2. Open a vanilla Journal Entry, select tokens, and press the QE button to turn this into a QE -> ADD vs. CREATE dialog   ?? in 1.1.0
3. Add a Compendium Entry "Dire Wolf" to the Journal Entry		                                       	    ?? in 1.1.0

### METHOD 3 - add/remove tokens                                                        
1. Open an existing QE with 1xActor; select 3 of the same tokens - should increase the number to 4          ?? in 1.1.0
2. Change # to random (1d4+2)                                                                               ?? in 1.1.0
3. Hover over Token in QE dialog and remove                                                                 ?? in 1.1.0
4. Hover over Tile in QE dialog and remove		                                                            ?? in 1.1.0

### RUNNING QEs
1. Open QE with QE Dialog and Run                                                                           BROKEN in 1.0.4
2. Close Combat encounter: Show total XP and XP per player token to GM                                      ?? in 1.1.0
3. Alt- or Ctrl- Run to force invisible or visible                                                          ?? in 1.1.0
4. Turn on "Show Add to CT" Module setting; clear for one Actor and check not included in CT                ?? in 1.1.0
5. Turn off "Show Add to CT" Module setting and check all now included in CT                                ?? in 1.1.0

### MAP NOTES
1. Delete Note; should warn there is no Note when you open the Journal Entry                                ?? in 1.1.0
2. Move Note - Generated Actor tokens (but not Saved) should be created at the position of the Note         ?? in 1.1.0
3. Start on another Scene and run an Encounter - should switch scenes     					                ?? in 1.1.0 (didn't work once)
5. Delete the original Map Note and launch from a different Map Note                                        ?? in 1.1.0
7. Launch from the Journal Entry - should find a random Note or prompt to create one                        ?? in 1.1.0
8. Delete the QE Journal Entry - should delete all the related Notes                                        ?? in 1.1.0
### Hide/Show and ShowAuto setting
1. ShowAuto = Yes:
1.1 New QE should show QE first and second time								
1.2 Hide QE; now should not show until you click Show again and then should show always				
2. ShowAuto=No
2.1 Existing QE should not show QE unless you use Show button							
2.2 Linked or Created QE should force show the first time
## 0.9 NEW FEATURES
1. Uncheck "Delete tokens after Add/Link" and verify manual deletion                                        ?? in 1.1.0
2. Check "Show delete dialog after Combat" and verify All/Defeated delete                                   ?? in 1.1.0

## NEW FOUNDRY FEATURE: Multi-Page Journal Entries
- Store a QE with a JE page (check stored per page)                                                         ?? in 1.1.0
- Generate a QE from separate pages (check replaces old one)                                                ?? in 1.1.0
- In JE "flow mode", all QEs should display                                                                 ?? in 1.1.0
- If a JE had a QE, that should display with the first page and be marked as "used"                         ?? in 1.1.0
- If a JE had a QE, it shouldn't display with subsequent pages                                              ?? in 1.1.0

## NEW FEATURE: Instant Encounter
### Create JE with embedded Actors; drag to Scene and verify two choices:
- Drag JE to the map; run Instant Encounter behaves as if you ran QE from a Note                            ?? in 1.1.0
- Open the QE, press [Run QE] and see if creates the default Note at the center of your view                ?? in 1.1.0
- Create QE Note creates a note (Silently) which can be run                                                 ?? in 1.1.0
- Open the QE and use the Run Quick Encounter (should run around the Note)                                  ?? in 1.1.0
### Create a Note for a QE and then re-drag that QE to the Scene in a different location
- Runs the QE in the new locations                                                                          ?? in 1.1.0

### Create a QE with some captured Tokens and some generated Tokens (will place a Note)
- When you drag the QE and Run Instant Encounter, it should place the captured Tokens and move the generated ?? in 1.1.0


## BACKWARD COMPATIBILITY
- Create a QE in v0.9 and make sure it mostly works in Foundry v10
## OLDER TESTING (only on major release)
### BUG FIXES
1. Create 10 saved tokens - check that QE positions saved tokens correctly                                  ?? in 1.1.0
2. Reduce 10 to 5 - check that QE positions saved tokens correctly                                          ?? in 1.1.0
3. Increase 5 back to 10 - extra 5 tokens should be generated next to Map Note                              ?? in 1.1.0
### TUTORIAL
1. Press Quick Encounter button with nothing selected -> should pop up Tutorial					 			?? in 1.1.0
2. With Tutorial open, repeat #1 -> should keep existing Tutorial         						        	?? in 1.1.0
3. Close Tutorial -> should delete the Journal Entry                          						        ?? in 1.1.0
4. Open some Journal Entries with no embedded Actors, press QE button -> should open Tutorial               ?? in 1.1.0
5. Open multiple Journal Entries with embedded Actors, press QE button -> should run the Encounter          ?? in 1.1.0
6. Leave Tutorial Window open; create another Journal Entry, Save, and then close - should be kept		    ?? in 1.1.0	
    - was being deleted in 0.5.2 because it was finding the Tutorial Window

## NO LONGER TESTING
### TEST WITH Foundry 0.7.9
May need to test for version:
- Test CONST.TOKEN_DISPOSITIONS
### USE OLD EMBEDDED METHOD - DEPRECATED
Verify above tests with Use Companion Dialog = TRUE and Use Companion Dialog = FALSE
1. Check that previously created encounters work with new Setting = TRUE
2. Check that previously created encounters work with new Setting = FALSE
3. Create a new Encounter with the "Use new Companion Dialog" = FALSE

