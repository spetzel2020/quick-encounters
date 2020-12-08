# TESTING WITH FOUNDRY 0.7.8

## BASIC
### METHOD 1 - create JE from selected tokens
1. Select one friendly token and press QE button -> should ask if you want to add to JE			            	0.6.13
2. Select multiple friendly and neutral tokens -> should ask...						                            0.6.13
3. Select one hostile token and press QE button -> adds to JE						                            0.6.13
4. Select multiple hostile and neutral tokens and press QE button -> adds to JE 				            	0.6.13

### METHOD 2 - add tokens to blank JE
1. Add Actors to a Journal Entry ; should re-render with QE dialog 				                                0.6.13         	

### METHOD 3 - add tokens to existing
1. Open an existing QE with 1xActor; select 3 of the same tokens - should increase the number to 4			    0.6.13

### NEW FEATURES IN 0.6
0. Open QE with QE Dialog and Run                                                                               0.6.13
1. Open a vanilla Journal Entry, select tokens, and press the QE button to turn this into a QE -> ADD vs. CREATE dialog	0.6.13
2. Random encounters (1d4+2)                                                                                	0.6.13
4. Show total XP and XP per player token to GM                                                              	0.6.13
5. Add a Compendium Entry "Dire Wolf"		                        						                    No Image in 0.6.13

### MAP NOTES
1. Delete Note; should warn there is no Note when you open the Journal Entry 				                    0.6.13
2. Move Note - Actor tokens should be created at the position of the Note			                            0.6.13
3. Start on another Scene and run an Encounter - should switch scenes     					                    0.6.13
4. Copy-paste the original Map Note; saved tokens should be translated                                          0.6.13
5. Delete the original Map Note and launch from a different Map Note                                            0.6.13
6. Drag QE Journal Entry to a new location - should work like #4                                                0.6.13
7. Launch from the Journal Entry - should find a random Note or prompt to create one                            0.6.13
8. Delete the QE Journal Entry - should delete all the related Notes						                    0.6.13



### BACKWARD COMPATIBILITY
- Create a QE in v0.5 and make sure it mostly works in 0.6.8
- Pre 0.6.13 (for originalNote): Copy a pre-0.6.13 Note and confirm token placement (with/without saved)

### BUG FIXES
-  If you have two QEs open with QE dialogs, closing one Journal Entry will close both QE dialogs			
v0.6.6 If you have a Journal Entry with multiple DIFFERENT mentions of the same creature, you get combinatorial multiplication of tokens etc.  


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

### USE OLD EMBEDDED METHOD
Verify above tests with Use Companion Dialog = TRUE and Use Companion Dialog = FALSE
1. Check that previously created encounters work with new Setting = TRUE
2. Check that previously created encounters work with new Setting = FALSE
3. Create a new Encounter with the "Use new Companion Dialog" = FALSE

