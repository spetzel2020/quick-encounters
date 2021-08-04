# TESTING v0.8.2 WITH FOUNDRY 0.8.8

## BUG FIXES
1. Create 10 saved tokens - check that QE positions saved tokens correctly                                  OK in 0.8.2c
2. Reduce 10 to 5 - check that QE positions saved tokens correctly                                          OK in 0.8.2c
3. Increase 5 back to 10 - extra 5 tokens should be generated next to Map Note                              OK in 0.8.2c

## BASIC
### METHOD 1 - create JE from selected tokens                                                               OK in 0.8.2
1. Select one friendly token and press QE button -> should ask if you want to add to JE			            	
2. Select multiple friendly and neutral tokens -> should ask...						                
3. Select one hostile token and press QE button -> adds to JE						               
4. Select multiple hostile and neutral tokens and press QE button -> adds to JE 				            	

### METHOD 2 - add tokens to blank JE
1. Embed actor references in a vanilla Journal Entry ; should re-render with QE dialog                       OK in 0.8.2c	
2. Open a vanilla Journal Entry, select tokens, and press the QE button to turn this into a QE -> ADD vs. CREATE dialog   OK in 0.8.2c
3. Add a Compendium Entry "Dire Wolf" to the Journal Entry		                                       	

### METHOD 3 - add/remove tokens                                                        
1. Open an existing QE with 1xActor; select 3 of the same tokens - should increase the number to 4          OK in 0.8.2
2. Change # to random (1d4+2)                                                                               OK in 0.8.2
3. Hover over Token in QE dialog and remove                                                                 OK in 0.8.2								
4. Hover over Tile in QE dialog and remove		                                                            OK in 0.8.2

### RUNNING QEs
1. Open QE with QE Dialog and Run                                                                           OK in 0.8.2
2. Close Combat encounter: Show total XP and XP per player token to GM                                     OK in 0.8.2
3. Alt- or Ctrl- Run to force invisible or visible                                                          **Weird behavior in 0.8.**

### MAP NOTES
1. Delete Note; should warn there is no Note when you open the Journal Entry                                OK in 0.8.2 				               
2. Move Note - Generated Actor tokens should be created at the position of the Note	                        OK in 0.8.2		               		
3. Start on another Scene and run an Encounter - should switch scenes     					               
4. Copy-paste the original Map Note; saved tokens should be translated                                      NO - has this ever worked?
5. Delete the original Map Note and launch from a different Map Note                                       
6. Drag QE Journal Entry to a new location - should work like #4                                           
7. Launch from the Journal Entry - should find a random Note or prompt to create one                        
8. Delete the QE Journal Entry - should delete all the related Notes                                        NO - getting errors						                                      															

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
                                                       	

### TUTORIAL
1. Press Quick Encounter button with nothing selected -> should pop up Tutorial					 			             		
2. With Tutorial open, repeat #1 -> should keep existing Tutorial         						        	                        	
3. Close Tutorial -> should delete the Journal Entry                          						      					    	
4. Open some Journal Entries with no embedded Actors, press QE button -> should open Tutorial   		    	
5. Open multiple Journal Entries with embedded Actors, press QE button -> should run the Encounter		    		
6. Leave Tutorial Window open; create another Journal Entry, Save, and then close - should be kept		    	
    - was being deleted in 0.5.2 because it was finding the Tutorial Window


### TEST WITH Foundry 0.7.9
May need to test for version:
- Test CONST.TOKEN_DISPOSITIONS

### USE OLD EMBEDDED METHOD - DEPRECATED
Verify above tests with Use Companion Dialog = TRUE and Use Companion Dialog = FALSE
1. Check that previously created encounters work with new Setting = TRUE
2. Check that previously created encounters work with new Setting = FALSE
3. Create a new Encounter with the "Use new Companion Dialog" = FALSE

