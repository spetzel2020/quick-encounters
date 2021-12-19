# TESTING v0.9.3 WITH FOUNDRY 0.8.9

## NEW FEATURES
1. [#54](https://github.com/spetzel2020/quick-encounters/issues/54): Uncheck "Delete tokens after Add/Link" and verify manual deletion      OK in 0.9.?
2. [#53](https://github.com/spetzel2020/quick-encounters/issues/53): Check "Show delete dialog after Combat" and verify All/Defeated delete OK in 0.9.3


## BASIC
### METHOD 1 - create JE from selected tokens                                                               TO TEST with QE 0.9.3
1. Select one friendly token and press QE button -> should ask if you want to add to JE                     OK in 0.9.?			            	
2. Select multiple friendly and neutral tokens -> should ask...						                        OK in 0.9.?
3. Select one hostile token and press QE button -> adds to JE	                                            OK in 0.9.?					               
4. Select multiple hostile and neutral tokens and press QE button -> adds to JE 				            OK in 0.9.?	

### METHOD 2 - add tokens to blank JE
1. Embed actor references in a vanilla Journal Entry ; should re-render with QE dialog                      OK in 0.9.3
2. Open a vanilla Journal Entry, select tokens, and press the QE button to turn this into a QE -> ADD vs. CREATE dialog   OK in 0.9.3
3. Add a Compendium Entry "Dire Wolf" to the Journal Entry		                                       	    OK in 0.9.3

### METHOD 3 - add/remove tokens                                                        
1. Open an existing QE with 1xActor; select 3 of the same tokens - should increase the number to 4          OK in 0.9.3
2. Change # to random (1d4+2)                                                                               OK in 0.9.3
3. Hover over Token in QE dialog and remove                                                                 OK in 0.9.3								
4. Hover over Tile in QE dialog and remove		                                                            TESTED in 0.9.0

### RUNNING QEs
1. Open QE with QE Dialog and Run                                                                           OK in 0.9.3
2. Close Combat encounter: Show total XP and XP per player token to GM                                      OK in 0.9.3
3. Alt- or Ctrl- Run to force invisible or visible                                                          OK in 0.9.3
4. Turn on "Add to CT" setting; clear for one Actor and check not included in CT                            OK in 0.9.3
5. Turn off "Add to CT" and check all now included in CT                                                    OK in 0.9.3

### MAP NOTES
1. Delete Note; should warn there is no Note when you open the Journal Entry                                OK in 0.9.? 				               
2. Move Note - Generated Actor tokens (but not Saved) should be created at the position of the Note         OK in 0.9.3		               		
3. Start on another Scene and run an Encounter - should switch scenes     					                OK in 0.9.3
5. Delete the original Map Note and launch from a different Map Note                                        OK in 0.9.3                                       
7. Launch from the Journal Entry - should find a random Note or prompt to create one                        OK in 0.9.3
8. Delete the QE Journal Entry - should delete all the related Notes                                        OK in 0.9.3						                                      															

### Hide/Show and ShowAuto setting
1. ShowAuto = Yes:
1.1 New QE should show QE first and second time								
1.2 Hide QE; now should not show until you click Show again and then should show always				
2. ShowAuto=No
2.1 Existing QE should not show QE unless you use Show button							
2.2 Linked or Created QE should force show the first time

### BACKWARD COMPATIBILITY
- Create a QE in v0.5 and make sure it mostly works in 0.6.8
- Pre 0.6.13 (for originalNote): Copy a pre-0.6.13 Note and confirm token placement (with/without saved)
## OLDER TESTING (only on major release)
### BUG FIXES
1. Create 10 saved tokens - check that QE positions saved tokens correctly                                  OK in 0.9.3
2. Reduce 10 to 5 - check that QE positions saved tokens correctly                                          OK in 0.9.3
3. Increase 5 back to 10 - extra 5 tokens should be generated next to Map Note                              OK in 0.9.3
### TUTORIAL
1. Press Quick Encounter button with nothing selected -> should pop up Tutorial					 			OK in 0.9.3            		
2. With Tutorial open, repeat #1 -> should keep existing Tutorial         						        	OK in 0.9.3                        	
3. Close Tutorial -> should delete the Journal Entry                          						        OK in 0.9.3				    	
4. Open some Journal Entries with no embedded Actors, press QE button -> should open Tutorial               OK in 0.9.3  		    	
5. Open multiple Journal Entries with embedded Actors, press QE button -> should run the Encounter          OK in 0.9.3
6. Leave Tutorial Window open; create another Journal Entry, Save, and then close - should be kept		    NOT TESTED 	
    - was being deleted in 0.5.2 because it was finding the Tutorial Window


### TEST WITH Foundry 0.7.9
May need to test for version:
- Test CONST.TOKEN_DISPOSITIONS

### USE OLD EMBEDDED METHOD - DEPRECATED
Verify above tests with Use Companion Dialog = TRUE and Use Companion Dialog = FALSE
1. Check that previously created encounters work with new Setting = TRUE
2. Check that previously created encounters work with new Setting = FALSE
3. Create a new Encounter with the "Use new Companion Dialog" = FALSE

