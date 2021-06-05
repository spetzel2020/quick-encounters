# TESTING v0.7.3 WITH FOUNDRY 0.8.5

## BASIC
### METHOD 1 - create JE from selected tokens
1. Select one friendly token and press QE button -> should ask if you want to add to JE			            	
2. Select multiple friendly and neutral tokens -> should ask...						                
3. Select one hostile token and press QE button -> adds to JE						               
4. Select multiple hostile and neutral tokens and press QE button -> adds to JE 				            	

### METHOD 2 - add tokens to blank JE
1. Add Actors to a Journal Entry ; should re-render with QE dialog 				                                       	

### METHOD 3 - add tokens to existing
1. Open an existing QE with 1xActor; select 3 of the same tokens - should increase the number to 4			

### NEW FEATURES IN 0.6 - merge into above
0. Open QE with QE Dialog and Run                                                                               			
1. Open a vanilla Journal Entry, select tokens, and press the QE button to turn this into a QE -> ADD vs. CREATE dialog	
2. Random encounters (1d4+2)                                                                                					
4. Show total XP and XP per player token to GM                                                              		    		
5. Add a Compendium Entry "Dire Wolf"		                        						     No Image in 0.6.13

### MAP NOTES
1. Delete Note; should warn there is no Note when you open the Journal Entry 				               
2. Move Note - Generated Actor tokens should be created at the position of the Note			               		
3. Start on another Scene and run an Encounter - should switch scenes     					               
4. Copy-paste the original Map Note; saved tokens should be translated                                     
5. Delete the original Map Note and launch from a different Map Note                                       
6. Drag QE Journal Entry to a new location - should work like #4                                           
7. Launch from the Journal Entry - should find a random Note or prompt to create one                        
8. Delete the QE Journal Entry - should delete all the related Notes						               

## v0.7.0
1. Hover over Token in QE dialog and remove								
2. Hover over Tile in QE dialog and remove                            															

## 0.7.3
1. ShowAuto = Yes:
1.1 New QE should show QE first and second time								
1.2 Hide QE; now should not show until you click Show again and then should show always				
2. ShowAuto=No
2.1 Existing QE should not show QE unless you use Show button							
2.2 Linked or Created QE should force show the first time


### BACKWARD COMPATIBILITY
- Create a QE in v0.5 and make sure it mostly works in 0.6.8
- Pre 0.6.13 (for originalNote): Copy a pre-0.6.13 Note and confirm token placement (with/without saved)

### CHECK VISIBILITY FOR A PLAYER



## OLDER TESTING (only on major release)
### OTHER
3. Alt- or Ctrl- Run to force invisible or visible                                                          	

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

