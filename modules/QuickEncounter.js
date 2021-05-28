/*
27-Aug-2020     Created
31-Aug-2020     Switch to creating a Journal Entry and then dragging it to the map for the saved Encounter
3-Sep-2020      Try simpler approach, starting with cleaner creation of a Quick Encounter Journal
3-Sep-2020      0.0.3: onClose, check that we don't have a note in the VIEWED scene and then place one
                Save tokens as an array rather than individuals
11-Sep-2020     Have a Create Quick Encounter and Run Quick Encounter button
                If nothing is selected, then pop open a help Dialog - perhaps with an offer to create a template Journal Entry
                Add imports from foundry.js to improve linting
                NOTE: We search the candidate Journal Entries on the fly (in the future, potentially even without opening them)
                An alternative would be to hook on renderJournalSheet and flag it there if it has Actors; might be marginally faster
12-Sep-2020     create() deletes the token from the canvas, not just the token
                runFromJournal doesn't create a token, just puts the tokenData in the Journal
                (and then the create() creates the tokens from the Journal)
                Split createCombat into createTokens and createCombat so that Method 1 and Method 2 are more modular
13-Sep-2020     Slightly adjust the position of the dropped tokens around the base corner of the map Note
14-Sep-2020     Add template info for Encounters - the Journal Entry is shown and then auto-deleted if you don't change it
                0.3.4: Extract Actor information when closing and update the Journal Entry flags
                This can then also trigger storing the Scene if you open the Journal Entry from a Note
                We'd like to record embedded Actors on rendering but that creates a render loop (because setFlag -> refresh -> render)
                So instead we record them on close
                Have to use a timer to wait for the window to be fully closed
15-Sep-2020     v0.4.0: Because deleting a Journal Entry triggers a close of any related Journal Sheet, we have to check in the close Hook
                that we don't delete the Tutorial if it already is deleted
                - Replace forEach with for/of to remove async operation ambiguities
                - Ask Before switching Views
15-Sep-2020     v0.4.0: Refactor to make flow identical for Method 1 or Method 2 (just use saved tokens preferentially)
                v0.4.1 on closeJournalSheet, if we don't find a Map Note then create one
16-Sep-2020     v0.4.1: findCandidateJournalEntry return open sheets without mapNotes
                Pop a dialog if there's no corresponding map note found
                When you drag in tokens, summarize the number of each Actor and (5e) display XP
20-Sep-2020     v0.4.2: extractActors(): Extract # of Actors using previousSibling because parent is confused by having a sentence with a number
                Also, whisper the Total XP to the GM, not to everybody
21-Sep-2020     v0.4.2: Ignore Friendly tokens which might be selected (typically PCs) - this should probably be an option/dialog
25-Sep-2020     v0.5.0: Dialog to check if you want friendlies in your Quick Encounters
26-Sep-2020     v0.5.0: If you previously saved a token to the Encounter, "freeze" its data by updating it back to the saved value
                (This handles the case of Token Mold or other modules adusting its data)
                v0.5.0: Remove putting XP in chat - just put it before the activation button in the Journal Entry
                v0.5.0: Add switchToMapNoteScene() - waits for up to 2s to find the map Note in the other scene
                v0.5.0: Add the Quick Encounters button dynamically when you render the Journal Entry, regardless of Method 1 or 2
                0.5.0 Token.create() was returning a single token if you passed in a single-element array of token data; fixed to check
27-Sep-2020     v0.5.1: Increase the timeout when waiting for tokens to draw before adding to the Combat Tracker
                v0.5.1: run(): Uses saved Tokens if they exist, but otherwise supplements with created ones from the embedded Actors
28-Sep-2020     v0.5.1: Method 1: Put per opponent XP next to each Actor and then (always) put total XP with the button
29-Sep-2020     v0.5.1: FIXED: findOpenQETutorial(): Use Journal Entry name to match instead of jQuery
                v0.5.1: Create a separate dynamic section at the top of a Quick Encounter Journal Entry
3-Oct-2020      v0.5.3: FIXED: If you have the Tutorial Journal Entry open and try to save a Journal Entry and then close it, it will delete the Journal ENTRY
                - because it's searching the WHOLE DOM for QuickEncountersTutorial, not just the particular Journal SHeet being closed
                v0.5.3: FIXED: Remove any existing versions of the dynamic QE Journal button first before recomputing it
                    (because in Foundry v0.7.3 if you save with it, it will get added to the underlying content)
5-Oct-2020      v0.5.3b: Make templates/how-to-use.html based on lang phrases to make translation easier
                Remove QE.ERROR.HowToUse (unused) and rename QE.TITLE.HowToUse to QE.HowToUse.TITLE for consistency
                Rename QE.BUTTON.CreateQuickEncounter to QE.CreateQuickEncounter.BUTTON
                v0.5.3c: No longer asks every time you open a Quick Encounter whether you want a Map Note, instead:
                - Puts a warning in the QE dynamic section
                - Asks you when you go to run it (already did this)
                v0.5.3d: Add option to "freeze" captured tokens so that TokenMold doesn't regenerate HP, name, etc
                (Default is true so that only newly generated tokens are changed )
12-Oct-2020     v0.6.0: Allow Quick Encounters to use Compendium links
15-Oct-2020     v0.6.0c: Handle multipliers that are dice rolls, e.g. 1d4+2 Vampire Spawn
                (Note they must be in Foundry [[/r 1d4+2]] form  to be recognized)
15-Oct-2020     v0.6.1: Prototype embedded vs companion dialog methods
6-Nov-2020      v0.5.5:  When you close/delete the Combat Tracker, pop up a dialog with info about the XP and XP per Player token
                Add a config option to turn this on/off (displayEncounterXPAfterCombat) provided this is DND5E
                Remove implicit localize in name&hint for config options
7-Nov-2020      v0.5.5: Rename putXPInChat to computeTotalXP      
                v0.5.5b: Tweak the dialog
9-Nov-2020      v0.6.1b: Use optional chaining to reduce chained tests for null                
                v0.6.1d: Add isSavedToken flag to generated tokens to distinguish between those generated from Actors and those saved
                createTokenDataFromActors(): Added setting isSavedToken=false
                Removed frozen flag and push that into createTokens where we can use isSavedToken
                NOTE: There should be no upgrade issue here since we do not save this flag - we regenerate it from saved tokenData
                - Increase random placing of generated (not saved) tokens to +/- one full grid square
                - Refactor Map Note related functions to EncounterNote: switchToMapNoteScene(), noMapNoteDialog(), mapNoteIsPlaced()
11-Nov-2020     v0.6.1f: runFromEmbeddedButton: REMOVED (replaced with direct call since we always have the quickEncounter)   
                v0.6.1g: REMOVED addTokenDataToJournalEntry() - one-liner only called from one other function     
                v0.6.1h: More o.o. approach with QuickEncounter instantiation - but allow for backward compatibility        
                If you have token(s) selected AND a Quick Encounter Journal Entry open, ask if you want to run it or add the token to it
                Added QEDialog.buttons3() for 3-button dialog
12-Nov-2020     v0.6.1j: Refactor createFromTokens() into create JournalEntry and call to new instance method addTokens()    
                Remove extractedActorTokenData as a class parameter and make it generated (either in template or full form)           
                - generateTemplateExtractedActorTokenData() or generateFullExtractedActorTokenData() (renamed from createTokenDataFromActors)
                - make combineTokenData() an instance method
13-Nov-2020     0.6.1k: createOrRun(): RENAMED to runAddOrCreate()    
                addTokens(): Add udpateJournalEntryById() to serialize updated quickEncounter  
                extractQuickEncounter(): If quickEncounter is stored, then use that  
                serialize/deserialize QuickEncounter using JSON    
14-Nov-2020     0.6.1l: update(): ADDED to receive changes from Companion dialog
15-Nov-2020     0.6.1m: Alt-Run makes all tokens invisible; Ctrl-Run makes them all Visible
                0.6.1n: If we removed all the Actors, then remove the whole Quick Encounter
                0.6.1o: init(): Remove localized version of QE.Version (which can't be read at this point); add MODULE_VERSION
                Store MODULE_VERSION in the Quick Encounter qeData just in case we make future changes to how it's encoded
                deserializFromJournalEntry(): Push savedTokensData into extractedActors
                extractQuickEncounter(): Code old method with qeVersion=0.5
                v0.6.2a: addTokens(): Ignore undefined savedTokens from old method
                Make useEmbeddedMethod=false the default going forward
                v0.6.2b: Bug fix: Use game.scenes.viewed to populate the name of the created Journal Entry
                Add a try/catch around tokens.update (because of problems with missing data)
                v0.6.3: Switch Use Embedded OPtion to Use Companion Dialog option
16-Nov-2020     v0.6.3b: onDeleteCombat(): Round computed XP per player    
17-Nov-2020     v0.6.4: Method 3: Open a vanilla Journal Entry and ask if you want to add selected tokens to it   
                QEDialog.buttons3: Remove the 3rd button if the 3rd callback isn't provided    
18-Nov-2020     v0.6.4c: Tweaked test for extractedActorIndex to not take this path on 0
                getNumActors: Now takes rollType parameter "full" (which rolls randomly) or "template" which rolls
27-Nov-2020     v0.6.7: BUG: 0.6.5: Wildcard Randomization doesn't work when placing tokens using Method 2   
                generateFullExtractedActorTokenData(): Call Token.fromActor() which does the merge but also handles wildcard token images 
28-Nov-2020     v0.6.8: BUG: If you have a Journal Entry with multiple DIFFERENT mentions of the same creature, you get combinatorial multiplication of tokens etc.                            
                Change expandedTokensData to generatedTokensData and make it per extractedActor (in the same wau the savedTokenData is)
                addTokens(): Search the actor list to see if there's another Actor to add tokens to
                constructor(): Always provide a (possibly empty) savedTokensData array
30-Nov-2020     v0.6.9: Bug: When you add tokens to an existing QE with that Actor, it should fill in all generatedTokens and then increase numActors  
                addTokens(): Add remaining tokens to the 0th element for this actorId; 
                Analyze the added tokens only (was previously adding existing tokens en masse which doesn't work for multiple instances of the same Actor)          
1-Dec-2020      v0.6.10: First attempt to reuse the existing QE dialog (not using app.id)  
                v0.6.11:   Fixed bug: If you were using a die roll, added tokens were added twice    
5-Dec-2020      v0.6.13: Add this.clickedNote. Set QuickEncounter.hoveredNote in Hook.hoverNote and then transfer to this.clickedNote if the Journal Entry matches
6-Dec-2020      v0.6.13c: Keep the same clickedNote as long as the JE is open (even if you hover somewhere else)
7-Dec-2020      v0.6.13f: Apply shift between sourceNote and originalNote (if present) to shift tokens
                (Note that we cannot compare savedTokens[0] coords because we might have moved the original note)
8-Dec-2020      v0.6.13h: checkAndFixOriginalData(): For backward compatibility, if we can recover the originalNote (because it's coordinates
                match one of the tokens) - then do so  
11-Jan-2021     0.7.0a: Namespace constants with QE structure    
                Remove the option to not use the QE Dialog     
                0.7.0b: First cut at saving tiles as well as tokens 
14-Jan-2021     Have to (for now) add the QE button to the Tiles menu - would be better if it created a non-modal dialog that you could use for other assets
                Check throughout for extractedActors?.length (in case you only have tiles)
19-Jan-2021     0.7.0d: Set QE coords from tokens, or if not set, from Tiles
20-Jan-2021     0.7.1a: Fixed: If you run an Encounter and then try to edit the setting, will choke on the JSON save (because of sourceNote)
                - save as sourceNoteData instead
                Move shift calculation to run() and pass to createTokens and createTiles
6-Feb-2021      0.7.3a: Add Setting: Automatic QE on Embedded Actors (open QE with any JE with embedded Actors, even if you haven't saved tokens/tiles)                
                Always put a Show QE button on the JE dialog (in case you close it)
                0.7.3b: Put a Hide QE button on the QE Dialog
7-Feb-2021      0.7.3c: Initialize hideQE null       
                Add journalEntry.showQEOnce to force showing on creation   
                0.7.3e: Re-extract the quickEncounter at show button press time, because otherwise if a QE was created from the HTML, it is not available at button creation time
29-Mar-2021     0.8.0b: If you are viewing the Journal Entry directly out of a Compendium, make a read-only QE dialog without token placement operations
                and instructions about how to use it
25-May-2021     0.8.0c: Testing with Foundry 0.8.5: (but will need to verify/edit for Foundry 0.7.x)
                    - TOKEN_DISPOSITIONS -> CONST.TOKEN_DISPOSITIONS                
                    - canvas.tiles no longer exists; replace with Tile.layer.controlled or Tile.layer.placeables as appropriate
                    - replace deleteMany with canvas.scene.deleteEmbeddedDocuments()
                0.8.0d: createCombat(): Adjust for Token object now being on TokenDocument.object
27-May-2021     0.8.0e: Test for 0.8.x vs 0.7.x and use new methods accordingly                
                - constructor(): Check this.extractedActors (was failing on iteration is extractedActors was null because of old QE method)
28-May-2021     0.8.0f: Use TOKEN_DISPOSITIONS or CONST.TOKEN_DISPOSITIONS as appropriate                
*/


import {EncounterNote} from './EncounterNote.js';
import {QESheet} from './QESheet.js';

export const QE = {
    MODULE_NAME : "quick-encounters",
    MODULE_VERSION : "0.8.0",
    TOKENS_FLAG_KEY : "tokens",
    QE_JSON_FLAG_KEY : "quickEncounter"
}


//Matches "ndx+/-m" with/without spaces at the beginning of the string
export const dieRollReg = /^([0-9]+\s*d[4,6,8,10,12](?:\s*[+,-]\s*[0-9]+)*)/;

export class QuickEncounter {
    constructor(qeData={}) {
        if (!qeData) {return;}
        this.journalEntryId = qeData.journalEntryId;
        //In v0.6 this contains savedTokensData
        this.extractedActors = qeData.extractedActors;
        //0.7 Now has tiles as well
        this.savedTilesData = qeData.savedTilesData;
        this.hideQE = null;     //Means it has never been set, so follow the Auto flag
        
        if (this.extractedActors?.length) {
            for (const [i,eActor] of this.extractedActors.entries()) {
                if (!eActor.savedTokensData) {this.extractedActors[i].savedTokensData = [];}
            }
        }
        
        //VERSION 0.5 (or <= 0.6): savedTokens were stored separately
        if (!qeData.qeVersion || qeData.qeVersion < 0.6) {
            if (qeData.savedTokensData) {
                qeData.savedTokensData.forEach(td => {td.isSavedToken = true;})
                //0.6.8 Bug: If you have multiple of the same Actors, this was assocating saved Tokens with both
                //Instead "use up" the savedTokens for Actors of the same ID
                //Create a map of actors to tokens
                let actorToTokensMap = {}
//FIXME: If you have multiple actors, this will reset the map multiple times  - must be a better way to do this                
                //0.8.0e: Was failing with "this.extractedActors not iterable"; non-fatal, but now check to be cleaner               
                if (!this.extractedActors) {return;}
                for (const eActor of this.extractedActors) {
                    actorToTokensMap[eActor.actorID] = qeData.savedTokensData.filter(td => (td.actorId === eActor.actorID));
                }
                //Now repeat the loop and assign the savedTokens
                for (const [i,eActor] of this.extractedActors.entries()) {
                    //If you have a non-numeric numActors (e.g. a dice roll) assign all the savedTokens
                    const numActors = (typeof eActor.numActors === "number") ? eActor.numActors :  actorToTokensMap[eActor.actorID].length;
                    const savedTokensData = actorToTokensMap[eActor.actorID].slice(0, numActors);
                    this.extractedActors[i].savedTokensData = savedTokensData;
                    //And remove this from the map, so that any further Actor will only get what's left
                    //The side-effect will be that if you have too many tokens, you'll lose some
                    actorToTokensMap[eActor.actorID].splice(0,numActors);
                }
              
            }
        }
    }
    
    async serializeIntoJournalEntry(journalEntryId=null) {
        /*Handles three possibilities as a form of polymorphism:
        1. journalEntryId is non-null and this.journalEntryId is non null; set the qe.journalEntryId and update
        2. journalEntryId is null, but the qe.journalEntryId is non-null - update
        3. journalEntryId is null, and qe.journalEntryId is null - do nothing
        */
        if (!this.journalEntryId) {
            if (!journalEntryId) {return;}
            this.journalEntryId = journalEntryId;
        }

        const qeJournalEntry = game.journal.get(this.journalEntryId);
        //v0.6.1 - store created quickEncounter - but can't store object, so serialize data
        this.qeVersion = QE.MODULE_VERSION;
        //0.7.3 When we've changed the Quick Encounter we want to force showing the QE dialog
        const qeJSON = JSON.stringify(this);
        qeJournalEntry.showQEOnce = true;   //because we made a change
        await qeJournalEntry?.setFlag(QE.MODULE_NAME, QE.QE_JSON_FLAG_KEY, qeJSON);
    }
    static deserializeFromJournalEntry(journalEntry) {
        let quickEncounter = new QuickEncounter();  //makes sure it has functions etc.
        let qeJSON = journalEntry?.getFlag(QE.MODULE_NAME, QE.QE_JSON_FLAG_KEY);
        if (qeJSON) try {
            const quickEncounterFromData = JSON.parse(qeJSON);
            quickEncounter = mergeObject(quickEncounter, quickEncounterFromData);
            //v0.6.1: Backwards compatibility - set the isSavedToken flag
            quickEncounter.extractedActors?.forEach(eActor => {
                eActor.savedTokensData?.forEach(td => {td.isSavedToken = true;});
            });

        } catch {
            console.log(`Invalid JSON: ${qeJSON}`);
        }
        //quickEncounter will ALWAYS be non-null, but we want to make sure it has real data
        //0.7.0b Check now that either extractedActors or savedTiles is non-null
        if (!quickEncounter.extractedActors && !quickEncounter.savedTilesData) {quickEncounter = null;}
        return quickEncounter;
    }
    update(newQEData) {
        mergeObject(this, newQEData);
        //Update into Journal Entry
        this.serializeIntoJournalEntry();
    }
    async remove() {
        const qeJournalEntry = game.journal.get(this.journalEntryId);
        await qeJournalEntry?.setFlag(QE.MODULE_NAME, QE.QE_JSON_FLAG_KEY, null);
    }

    checkAndFixOriginalNoteData(clickedNote) {
        //0.6.13: If originalNoteData is not set, we try to recover it from savedTokens
        if (!clickedNote || this.originalNoteData || !this.extractedActors?.length) {return false;}
        for (const eActor of this.extractedActors) {
            for (const std of eActor.savedTokensData) {
                if ((std.x === clickedNote.data.x) && (std.y === clickedNote.data.y)) {
                    this.originalNoteData = clickedNote.data;
                    return true;    //yes we were able to fix - serialize
                }
            }
        }
        return false;
    }


    static init() {
        game.settings.register(QE.MODULE_NAME, "quickEncountersVersion", {
            name: "Quick Encounters Version",
            hint: "",
            scope: "system",
            config: false,
            default: QE.MODULE_VERSION,
            type: String
        });
        game.settings.register(QE.MODULE_NAME, "freezeCapturedTokens", {
            name: "QE.FreezeCapturedTokens.NAME",
            hint: "QE.FreezeCapturedTokens.HINT",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });
        game.settings.register(QE.MODULE_NAME, "showQEAutomatically", {
            name: "QE.Setting.ShowQEAutomatically.NAME",
            hint: "QE.Setting.ShowQEAutomatically.HINT",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });
       game.settings.register(QE.MODULE_NAME, "displayXPAfterCombat", {
            name: "QE.DisplayXPAfterCombat.NAME",
            hint: "QE.DisplayXPAfterCombat.HINT",
            scope: "world",
            config: true,
            visible: game.system.id === "dnd5e",
            default: true,
            type: Boolean
        });
        //0.6.13 Initialize which Note you are hovering over
        QuickEncounter.hoveredNote = null;
    }


    static getSceneControlButtons(buttons) {
        if (!game.user.isGM) {return;}
        //Hooked on the left-hand set of buttons; add a Create Quick Encounter one
        const basicControlsButton = buttons.find(b => b.name === "token");

        if (basicControlsButton) {
            basicControlsButton.tools.push({
                name: "linkEncounter",
                title: game.i18n.localize("QE.CreateQuickEncounter.BUTTON"),
                icon: "fas fa-fist-raised",
                toggle: false,
                button: true,
                visible: game.user.isGM,
                onClick: event => QuickEncounter.runAddOrCreate(event)
            });
/*DEPRECATED            
            notesButton.tools.push({
                name: "deleteEncounters",
                title: "Delete all Quick Encounter Map Notes",
                icon: "fas fa-trash",
                toggle: false,
                button: true,
                visible: false, //game.user.isGM,
                onClick: () => QuickEncounter.deleteAllEQMapNotes("Unknown")
            });
*/            
        }

        const tileControlsButton = buttons.find(b => b.name === "tiles");

        if (tileControlsButton) {
            tileControlsButton.tools.push({
                name: "linkEncounter",
                title: game.i18n.localize("QE.CreateQuickEncounter.BUTTON"),
                icon: "fas fa-fist-raised",
                toggle: false,
                button: true,
                visible: game.user.isGM,
                onClick: event => QuickEncounter.runAddOrCreate(event)
            });
        }


    }
/*DEPRECATED
    static async deleteAllEQMapNotes(text) {
        let notes = canvas.notes.placeables;
        for (let iNote = 0; iNote < notes.length; iNote++) {
            if (notes[iNote].text === text) {
                canvas.notes.placeables.splice(iNote,1);
                notes[iNote].delete();
                iNote--;
            }
        }
    }
*/
    static runAddOrCreate(event) {
        const isFoundryV8 = game.data.version.startsWith("0.8");
        let FRIENDLY_TOKEN_DISPOSITIONS;
        if (isFoundryV8) {
            FRIENDLY_TOKEN_DISPOSITIONS = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
        } else {//0.7.x
            FRIENDLY_TOKEN_DISPOSITIONS = TOKEN_DISPOSITIONS.FRIENDLY;
        }
        //Called when you press the Quick Encounters button (fist) from the sidebar
        //If you are controlling tokens it creates a new Quick Encounter Journal Entry
        //0.6.4: If there's an open Journal Entry it asks if you want to add the tokens to it or run it
        //Method 1: Get the selected tokens and the scene
        //Exclude friendly tokens unless you say yes to the dialog
        const controlledTokens = Array.from(canvas.tokens?.controlled);
        const controlledNonFriendlyTokens = controlledTokens?.filter(t => t.data?.disposition !== FRIENDLY_TOKEN_DISPOSITIONS );
        const controlledFriendlyTokens = controlledTokens?.filter(t => t.data?.disposition === FRIENDLY_TOKEN_DISPOSITIONS );
        //0.7.0b: Capture controlled tiles (will be one or the other
        const controlledTiles = Array.from(Tile.layer.controlled);

        const candidateJournalEntry = QuickEncounter.findCandidateJournalEntry();
        const quickEncounter = (candidateJournalEntry instanceof QuickEncounter ) ? candidateJournalEntry : null;

        //v0.6.1 If you have both controlledNonFriendly tokens AND an open Quick Encounter, ask if you want to add to it
        //0.7.0 Add tiles; can't have both simultaneously because you have to switch tools in the Control pallette to select tiles
        if (controlledTokens?.length || controlledTiles?.length) {
            const controlledAssets = {
                tokens: controlledTokens, 
                tiles : controlledTiles
            }
            //Existing Quick Encounter: Ask whether to run, add new assets, or create one from scratch
            if (quickEncounter && (controlledNonFriendlyTokens?.length || controlledTiles?.length)) {
                Dialog3.buttons3({
                    title: game.i18n.localize("QE.AddToQuickEncounter.TITLE"),
                    content: game.i18n.localize("QE.AddToQuickEncounter.CONTENT"),
                    button1cb: () => {quickEncounter.run(event);},
                    button2cb: () => {quickEncounter.add(controlledAssets)},
                    button3cb: () => { QuickEncounter.createFrom(controlledAssets)},
                    buttonLabels : ["QE.AddToQuickEncounter.RUN",  "QE.AddToQuickEncounter.ADD",  "QE.AddToQuickEncounter.CREATE"]
                });
            } else if (candidateJournalEntry &&  (controlledNonFriendlyTokens?.length || controlledTiles?.length)) {
                //Existing Journal Entry, ask if you want to create a Quick Encounter out of it
                Dialog3.buttons3({
                    title: game.i18n.localize("QE.LinkToQuickEncounter.TITLE"),
                    content: game.i18n.localize("QE.LinkToQuickEncounter.CONTENT"),
                    button1cb: () => {QuickEncounter.link(candidateJournalEntry,controlledAssets)},
                    button2cb: () => {QuickEncounter.createFrom(controlledAssets)},
                    button3cb: null,
                    buttonLabels : ["QE.LinkToQuickEncounter.LINK",  "QE.AddToQuickEncounter.CREATE"]
                });
            } else if (controlledFriendlyTokens?.length) {
                //Check whether you meant to add friendly tokens
                Dialog.confirm({
                  title: game.i18n.localize("QE.IncludeFriendlies.TITLE"),
                  content: game.i18n.localize("QE.IncludeFriendlies.CONTENT"),
                  yes: () => {QuickEncounter.createFrom(controlledAssets)},
                  no: () => {
                      controlledAssets.tokens = controlledNonFriendlyTokens;
                      if (controlledNonFriendlyTokens?.length) {QuickEncounter.createFrom(controlledAssets);}
                  }
                });
            } else {
                QuickEncounter.createFrom(controlledAssets);
            }
        } else if (quickEncounter) {
            //Run the open Quick Encounter
            quickEncounter.run(event);
        } else {
            //No selected tokens or open Journal Entry => show/reshow the Tutorial
            QuickEncounter.showTutorialJournalEntry();
        }
    }

    static createQuickEncounterAndAdd(controlledAssets) {
        let quickEncounter = new QuickEncounter();    //empty QuickEncounter   
        quickEncounter.add(controlledAssets);     //This will also update extractedActors etc.
        return quickEncounter;
    }

    static link(openJournalSheet, controlledAssets) {
        let quickEncounter = QuickEncounter.createQuickEncounterAndAdd(controlledAssets);
        const journalEntry = openJournalSheet?.object;
        quickEncounter.serializeIntoJournalEntry(journalEntry.id);
        //Force a re-render which should pop up the QE dialog
        openJournalSheet?.render(true);
    }


    async add(controlledAssets) {
        const controlledTokens = controlledAssets?.tokens;
        const controlledTiles = controlledAssets?.tiles;
        //Either tokens or tiles should be present
        if (!controlledTokens?.length && !controlledTiles?.length) return;

        //0.7.0 Either tokens or tiles are present, but not both (for now) - but we won't depend on this always being true
        if (controlledTokens?.length) {
            //0.6.2: If we don't already have coords, then use the tokens we just added
            //0.7.0d: Set QE coords (where tokens are generated around)
            if (!this.coords) {this.coords = {x: controlledTokens[0].data.x, y: controlledTokens[0].data.y}}
            this.addTokens(controlledTokens);
        }
        if (controlledTiles?.length) {
            //0.7.0d: Set QE coords if not already set
            if (!this.coords) {this.coords = {x: controlledTiles[0].data.x, y: controlledTiles[0].data.y}}
            this.addTiles(controlledTiles);

        }
        //v0.6.1k Update the created/changed QuickEncounter into the Journal Entry
        this.serializeIntoJournalEntry();
    }


    addTokens(controlledTokens) {
        if (!controlledTokens) return;
        //Add the new tokens to the existing ones (or creates new ones)
        //Use tokenData because tokens is too deep to store in flags
        let controlledTokensData = controlledTokens.map(ct => {return ct.data});
    
        const newSavedTokensData = duplicate(controlledTokensData);


        //Find set of distinct actors - some/all of these may be new if the addTokens is being called from create
        let tokenActorIds = new Set();
        for (const tokenData of newSavedTokensData) {
            tokenActorIds.add(tokenData.actorId);
        }

        //And compare against the saved list of Actors to adjust numbers if necessary
        //v0.6.8 Allow for more than one instance of the Actor in the list (must have been originally created from a Journal Entry)
        for (const tokenActorId of tokenActorIds) {
            const tokensData = newSavedTokensData.filter(t => t.actorId === tokenActorId);

            //v0.6.8: Could be more than one instance of an actorId
            const extractedActorsOfThisActorId = this.extractedActors?.filter(eActor => eActor.actorID === tokenActorId);

            if (extractedActorsOfThisActorId?.length) {
                //We found this Actor - allocate the saved tokens
                for (const [i,eActor] of extractedActorsOfThisActorId.entries()) {
                    if (typeof eActor.numActors === "number") {
                        //Option 2: Add as many tokens as we need
                        const numNeededTokens = eActor.numActors - eActor.savedTokensData.length;
                        if (numNeededTokens > 0) {
                            //Note that we have to check min() because the weird behavior is that splice doesn't delete if numNeededTokens>length
                            const tokensDataToTransfer = tokensData.splice(0, Math.min(numNeededTokens,tokensData.length));
                            extractedActorsOfThisActorId[i].savedTokensData = eActor.savedTokensData.concat(tokensDataToTransfer);                            
                        }
                    } else {
                        //In this case the numActors is a diceroll, so we don't change numActors but assign all the tokens
                        //FIXME: Should just fill out to the maxRoll
                        extractedActorsOfThisActorId[i].savedTokensData = eActor.savedTokensData.concat(tokensData);
                        //v0.6.11 - was allocating here and then doing it again below
                        tokensData.length = 0;
                    }
                }//end for 
                //v0.6.9: If there are addedTokensData left over, add them to the 0th element and increase the numActors
                if (tokensData.length) {
                    //Should have savedTokensData already 
                    extractedActorsOfThisActorId[0].savedTokensData = extractedActorsOfThisActorId[0].savedTokensData.concat(tokensData);
                    if (typeof extractedActorsOfThisActorId[0].numActors === "number") {
                        extractedActorsOfThisActorId[0].numActors = extractedActorsOfThisActorId[0].savedTokensData.length;
                    }
                }
            } else {
                //Option 1. We don't find this actor - then add a new Actor with ALL of the relevant tokens
                const actor = game.actors.get(tokenActorId);
                const newExtractedActor = {
                    numActors : tokensData.length,
                    dataPackName : null,              //if non-null then this is a Compendium reference
                    actorID : tokenActorId,           //If Compendium sometimes this is the reference
                    name : actor?.name,
                    savedTokensData : tokensData
                }
                //v0.6.4 No longer setting extractedActors=[] in constructor
                if (!this.extractedActors) {this.extractedActors = [];}
                this.extractedActors.push(newExtractedActor);
            }
        }//end for tokenActorIds

        //Delete the existing tokens (because they will be replaced)
        const controlledTokensIds = controlledTokens.map(ct => {return ct.id});
        const isFoundryV8 = game.data.version.startsWith("0.8");
        if (isFoundryV8) {//Foundry 0.8.x
            canvas.scene.deleteEmbeddedDocuments("Token", controlledTokensIds);
        } else {//Foundry 0.7.x
            canvas.tokens.deleteMany(controlledTokensIds);
        }
        
    }//end addTokens()

    addTiles(controlledTiles) {
        if (!controlledTiles) return;
        //Modelled after addTokens

        //Add the new tiles to the existing ones (or creates new ones)
        //Use tilesData because tiles is too deep to store in flags
        let controlledTilesData = controlledTiles.map(ct => {return ct.data});

        if (!this.savedTilesData) {this.savedTilesData = [];}
        this.savedTilesData = this.savedTilesData.concat(duplicate(controlledTilesData));

        //Delete the existing tokens (because they will be replaced)
        const controlledTilesIds = controlledTiles.map(ct => {return ct.id});
        const isFoundryV8 = game.data.version.startsWith("0.8");
        if (isFoundryV8) {//Foundry 0.8.x
            canvas.scene.deleteEmbeddedDocuments("Tile", controlledTilesIds);
        } else {//Foundry 0.7.x
            canvas.tiles.deleteMany(controlledTilesIds);
        }
    }

    /* Method 1: createFromTokens
    * Delete the controlled (selected) tokens and record their tokenData in a created Journal Entry
    * Also embed Actors they represent (for clarity)
    **/
    static async createFrom(controlledAssets) {
//Seems inelegant - especially since we'd like to update the journalEntry        
        let quickEncounter = QuickEncounter.createQuickEncounterAndAdd(controlledAssets);

        //Create a new JournalEntry - the corresponding map note gets automatically created too
//FIXME: Replace all this with a renderTemplate section using handlebars
        let content = game.i18n.localize("QE.Instructions.CONTENT");
        //0.7.0 extractedActors could be null if we have just tiles or other (non-Actor/token assets)
        if (quickEncounter.extractedActors) {
            for (const eActor of quickEncounter.extractedActors) {
                const actor = await QuickEncounter.getActor(eActor);
                const xp = QuickEncounter.getActorXP(actor);
                const xpString = xp ? `(${xp}XP each)`: "";
                content += `<li>${eActor.numActors}@Actor[${actor.id}]{${actor.name}} ${xpString}</li>`;
            }
        }

        const journalData = {
            folder: null,
            name:  `Quick Encounter: ${game.scenes?.viewed?.name}`,
            content: content,
            type: "encounter",
            types: "base"
        }
        let journalEntry = await JournalEntry.create(journalData);
        const ejSheet = new JournalSheet(journalEntry);

//REFACTOR: Individual property setting and order is fragile        
        quickEncounter.serializeIntoJournalEntry(journalEntry.id);
        //And create the Map Note - needs journalEntry.id to be set already
        const newNote = await EncounterNote.place(quickEncounter);
        //0.6.13: Record the Map Note data because we will use it to distinguish between the original and copied Scene Notes
        quickEncounter.originalNoteData = newNote?.data;
        
        //v0.6.1k Update the created/changed QuickEncounter into the Journal Entry
        quickEncounter.serializeIntoJournalEntry(journalEntry.id);

        //v0.6.3: Show the Journal Sheet last so it can see the Map Note
        ejSheet.render(true);   //0.6.1: This will also pop-open a QE dialog if you have that setting
    }




    static async showTutorialJournalEntry() {
        //0.5.0: Check if there's an existing open Tutorial
        const existingTutorial = QuickEncounter.findOpenQETutorial();
        if (existingTutorial) {
            existingTutorial.maximize();
            return;
        }

        //Create a new JournalEntry - with info on how to use Quick Encounters
        const howToUseJournalEntry = await renderTemplate('modules/quick-encounters/templates/how-to-use.html');
        const title =  game.i18n.localize("QE.HowToUse.TITLE");

        const content = howToUseJournalEntry;

        const journalData = {
            folder: null,
            name: title,
            content: content,
            type: "encounter",
            types: "base"
        }
        let journalEntry = await JournalEntry.create(journalData);

        const ejSheet = new JournalSheet(journalEntry);
        ejSheet.render(true);
    }


    /* Method 2: Look through open Windows to find a Journal Entry with Actors and a Map Note
    *
    */
    static findCandidateJournalEntry() {
        //Return either a Quick Encounter, a Journal Sheet, or null (in order of priority)
        if (Object.keys(ui.windows).length === 0) {return null;}
        else {
            let openJournalSheet = null;
            for (let w of Object.values(ui.windows)) {
                //Check open windows for a Journal Sheet with a Map Note and embedded Actors
                if (w instanceof JournalSheet) {
                    openJournalSheet = w;
                    const quickEncounter = QuickEncounter.extractQuickEncounter(w);
                    if (quickEncounter) {return quickEncounter;}
                }
                if (openJournalSheet) {return openJournalSheet;}
            }
            return null;
        }
    }

    static findOpenQETutorial() {
        if (Object.keys(ui.windows).length === 0) {return null;}
        else {
            let qeTutorial = null;
            for (let w of Object.values(ui.windows)) {
                //Check open windows for the tutorial Journal Entry
                if (w instanceof JournalSheet) {
                    const journalEntry = w.entity;
                    if (journalEntry && (journalEntry.name === game.i18n.localize("QE.HowToUse.TITLE"))) {
                        qeTutorial = w;
                        break;
                    }
                }
            }
            return qeTutorial;
        }
    }



    static extractQuickEncounter(journalSheet) {
        const journalEntry = journalSheet?.entity;
        if (!journalEntry) {return;}

        //0.6.1k: If quickEncounter is stored, extract that - but you can't store the actual object
        let quickEncounter = QuickEncounter.deserializeFromJournalEntry(journalEntry);

        //If there's no quickEncounter stored, then it's in pieces - also if you are looking at a Journal Entry with Actor links
        if (!quickEncounter) {
            //Extract it the old (v0.5) way - this also still applies if you create a Journal Entry with Actor or Compendium links
            //0.6 this now potentially includes Compendium links
            const extractedActors = QuickEncounter.extractActors(journalSheet.element);
            const savedTokensData =  journalEntry.getFlag(QE.MODULE_NAME, QE.TOKENS_FLAG_KEY);
            //v0.6.1: Backwards compatibility - set the isSavedToken flga
            savedTokensData?.forEach(td => {td.isSavedToken = true;});

            //Minimum Quick Encounter has a Journal Entry, and tokens or actors (or 0.6 Compendium which turns into Actors)
            //If there isn't a map Note we may need to switch scenes
            if ((extractedActors && extractedActors.length) || (savedTokensData && savedTokensData.length)) {
                const qeData = {
                    qeVersion : 0.5,
                    journalEntryId : journalEntry.id,
                    extractedActors : extractedActors,
                    savedTokensData : savedTokensData
                }
                quickEncounter = new QuickEncounter(qeData);
            }
        }//end if !quickEncounter
        return quickEncounter;
    }

    static extractActors(html) {
        const ACTOR = "Actor";
        const entityLinks = html.find(".entity-link");
        if (!entityLinks || !entityLinks.length) {return null;}

        const extractedActors = [];
        const intReg = "([0-9]+)[^0-9]*$"; //Matches last "number followed by non-number at the end of a string"

        entityLinks.each((i, el) => {
            const element = $(el);
            const dataEntity = element.attr("data-entity");
            const dataID = element.attr("data-id");
            //0.6 If it's a Compendium we just have a data.pack attribute
            const dataPackName = element.attr("data-pack"); //Not used if Actor
            const dataLookup = element.attr("data-lookup");
            //Get the dataPack entity type (has to be Actor)
            const dataPack = game.packs.get(dataPackName);
            if ((dataEntity === ACTOR) || (dataPack && (dataPack.entity === ACTOR))) {
                const dataName = element.text();
                const prevSibling = element[0].previousSibling;
                let multiplier = 1;
                //v0.6 Check for a die roll entry
                if (prevSibling) {
                    if (prevSibling.classList && prevSibling.classList.contains("inline-roll")) {
                        //Try to get it from the data-formula attribute
                        try {
                            multiplier = prevSibling.attributes["data-formula"].value;
                            if (!multiplier) {multiplier = 1;}
                        } catch {
                            //Otherwise try to parse it out
                            multiplier = prevSibling.textContent.match(dieRollReg);
                            multiplier = multiplier? multiplier[0] : 1;
                        }
                    } else {
                        const possibleInts = prevSibling.textContent.match(intReg);
                        multiplier = parseInt(possibleInts ? possibleInts[0] : "1",10);
                    }
                }

                //If this is a Compendium, then that may use either data-lookup or data-id depending on the index
                //Although in Foundry 0.7.4 I can't find _replaceCompendiumLink any more
                extractedActors.push({
                    numActors : multiplier  ? multiplier : 1,
                    dataPackName : dataPackName,                    //if non-null then this is a Compendium reference
                    actorID : dataID ? dataID : dataLookup,           //If Compendium sometimes this is the reference
                    name : dataName
                });
            }
        });

        return extractedActors;
    }




    /* RUN the Quick Encounter (by using the embedded button or the side button)
        - Recall the saved tokens data
        - Generate additional token data from the number of Actors
        - Create and place the tokens
        - Add them to the Combat Tracker
    */

    async run(event) {
        //0.4.0 Refactored so that both buttons (embedded or external) come here
        //You open the Journal and press the button
        //- Extract the actors (if any)
        //- Find the encounter location based on the Note position
        //- Create tokens (or use existing ones if they exist)
        const qeJournalEntry = game.journal.get(this.journalEntryId);
        if (!qeJournalEntry) return;

        const extractedActors = this.extractedActors;
        const savedTokensData = this.savedTokensData; 
        const savedTilesData = this.savedTilesData;

        //Create tokens from embedded Actors - use saved tokens in their place if you have them
        //0.7.0b Need to have qeJournalEntry plus either Actors, tokens, or tiles
        if (!(extractedActors?.length || savedTokensData?.length || savedTilesData?.length)) {return;}

        //0.6.13 If we have clickedNote specified we know we're in the right scene, otherwise see where there is one
        let mapNote = qeJournalEntry.clickedNote;
        if (!mapNote) {
            // Switch to the correct scene if confirmed
            const qeScene = QuickEncounter.getEncounterScene(qeJournalEntry);
            //If there isn't a Map Note anywhere, prompt to create one in the center of the view
            if (!qeScene) {EncounterNote.noMapNoteDialog(this);}
            const isPlaced = await EncounterNote.mapNoteIsPlaced(qeScene, qeJournalEntry);
            if (!isPlaced ) {return;}
            //Something is desperately wrong if this is null
            mapNote = qeJournalEntry.sceneNote;
        }
        this.sourceNoteData = mapNote.data;
        //v0.6.13 If sourceNote != originalNote, then translate the savedTokens
        //0.7.1 Move shift calculation here (from combineTokenData) so it can be passed to both combineTokenData() and createTiles()
        let shift = {x:0, y:0};
        if ((this.sourceNoteData && this.originalNoteData) && (this.sourceNoteData._id !== this.originalNoteData._id)) {
            shift = {
                x: (this.sourceNoteData.x - this.originalNoteData.x),
                y: (this.sourceNoteData.y - this.originalNoteData.y)
            }
        }

        canvas.tokens.activate();
        //0.6.1: createTokenDataFromActors() sets isSavedToken=false
        //0.6.8: Don't return extractedActorTokenData; add it (as generatedTokensData) to the extractedActors
        //v0.6.13 Use this.sourceNote instead of coords
        await this.generateFullExtractedActorTokenData();
        //0.6.8: combineTokenData now puts the combined generated and saved tokens in combinedTokensData on each eActor
        //0.6.13 Compare this.sourceNote with this.originalNote to see if we should translate savedTokens
        this.combineTokenData(shift);

        //Now create the Tokens
        //v0.6.1 If you used Alt-[Run] then pass that
        //v0.6.8 Make createTokens an instance method because it reference extractedActors
        const options = {
            alt : event?.altKey, 
            ctrl: event?.ctrlKey
        }
        const createdTokens = await this.createTokens(options);

        //And add them to the Combat Tracker (wait 200ms for drawing to finish)
        setTimeout(() => {
            QuickEncounter.createCombat(createdTokens);
        },200);

        if (savedTilesData) {
            canvas.tiles.activate();
            await this.createTiles(savedTilesData, shift, options);
            //0.7.3 Switch back to Basic Controls
            canvas.tokens.activate();
        }
    }


    combineTokenData(shift={x:0, y:0}) {
        //v0.5.1 If we have more actors than saved tokens, create more tokens
        //If we have fewer actors than saved tokens, skip some

        //v0.5.0 We will want to re-create tokens that have been saved but otherwise create them from Actors
        //So set a frozen flag on each saved token that doesn't allow further changes (so that saved tokens don't get re-rolled)
        //Setting directly rather than using setFlag because we don't need this saved between sessions
        //v0.5.1 Create both from the embedded Actors and any saved Tokens and then attempt to reconcile
        //First cut: If you have more actors than saved tokens of that actor (including none), then generate
        //If we have no savedTokens, do none of this checking
        //v0.6.1: savedTokensData is stored with each actor
        //v0.6.8: generatedTokensData and the resulting combinedTokensData is now also stored with each actor

        if (this.extractedActors?.length) {
            for (const [indexExtractedActor, ea] of this.extractedActors.entries()) {
                let combinedTokensData = [];
                //generatedTokensData is as many generated tokens as there are numActors; override them with real savedTokens
                if (ea.savedTokensData) {
                    let shiftedTokensData = ea.savedTokensData.map(std => {
                        std.x += shift.x;
                        std.y += shift.y;
                        return std;
                    });
                    const numExcessActors = ea.generatedTokensData.length -  shiftedTokensData.length;
                    if (numExcessActors >= 0) {
                        //if excessActors > 0 take all of the saved tokens and then as many as necessary from the extracted Actor tokens
                        combinedTokensData =  shiftedTokensData.concat(ea.generatedTokensData.slice(0, numExcessActors));
                    } else if (numExcessActors < 0) {
                        //Take all possible saved tokens up to the number - if it's a dice roll, we rely on it being the max possible
                        combinedTokensData = shiftedTokensData.slice(0, ea.generatedTokensData.length);
                    }
                } else {
                    //No saved tokens - just use the Actor data
                    combinedTokensData = ea.generatedTokensData;
                }
                this.extractedActors[indexExtractedActor].combinedTokensData = combinedTokensData;
            }
        }
    }


    static getEncounterScene(journalEntry) {
        //if sceneNote is available, then we're in the Note Scene already
        if (journalEntry.sceneNote) {return game.scenes.viewed;}
        else {
            //Now we need to search through the available scenes to find a note with this Journal Entry
            for (const scene of game.scenes) {
                const notes = scene.data.notes;
                const foundNote = notes.find(note => note.entryId === journalEntry.id);
                if (foundNote) {
                    return scene;
                }
            }
        }
        return null;
    }

    static getNumActors(extractedActor, options={}) {
        //Get the number of actors including rolling if options.rollRandom=true
        let multiplier = extractedActor.numActors;
        //If numActors didn't/doesn't convert then just create 1 token
        let numActors = 1;

        if (multiplier) {
            if (typeof multiplier === "number") {
                numActors = multiplier;
            } else if ((typeof multiplier === "string") && Roll.validate(multiplier)) {
                //v0.6.4: if options.rollType="full", then roll randomly; if ="template" then compute max
                //v0.6: Pass the multiplier to the roll formula, which allows for a digit or a formula
                let r= new Roll(multiplier);
                if (options?.rollType === "full") {
                    r.evaluate();
                } else {//template or other
                    r.evaluate({minimize: false, maximize: true});
                }
                numActors = r.total ? r.total : 1;
            } 
        }

        return numActors;
    }

    
    static async getActor(eActor) {
        //Could be from Actors or Compendium
        //v0.6 Need to check whether this is a direct Actor reference or from a Compendium
        let actor = null;
        if (eActor.dataPackName) {
            const actorPack = game.packs.get(eActor.dataPackName);
            if (!actorPack) {return null;}
            //Import this actor because otherwise you won't be able to see character sheet etc.
            actor = await game.actors.importFromCollection(eActor.dataPackName, eActor.actorID, {}, {renderSheet: false});
        } else {
            actor = game.actors.get(eActor.actorID);
        }
        return actor;
    }


    generateTemplateExtractedActorTokenData() {
        //0.6.1d: Create a template array so we can tell how many saved vs. generated tokens we will have at display time
        //(without actually extracting Actor/Compendium data every time)
        if (!this.extractedActors?.length) {return;}
        for (let [iExtractedActor, eActor] of this.extractedActors.entries()) {
            this.extractedActors[iExtractedActor].generatedTokensData = [];  //clear this every time
            //v0.6.4: For random rolls, need the max number returned here
            const numActors = QuickEncounter.getNumActors(eActor, {rollType: "template"});
//FIXME: Probably a more efficient way to fill an array 0..numActors-1            
            for (let iToken=0; iToken < numActors; iToken++ ) {
                //0.6.8: Put the generatedTokensData on the extractedActor, just like the savedTokensData
                this.extractedActors[iExtractedActor].generatedTokensData.push({actorId: eActor.actorID, isSavedToken : false});
            }
        }
    }

    async generateFullExtractedActorTokenData() {
        //v0.6.13: sourceNote is either the Scene Note we double-clicked, or the first one we find (if started from the Journal Entry)
        const coords = {x: this.sourceNoteData?.x, y: this.sourceNoteData?.y}

        if (!this.extractedActors?.length || !coords) {return;}
        const gridSize = canvas.dimensions.size;
        for (let [iExtractedActor, eActor] of this.extractedActors.entries()) {
            this.extractedActors[iExtractedActor].generatedTokensData = [];  //clear this every time
            const actor = await QuickEncounter.getActor(eActor);
            if (!actor) {continue;}     //possibly will happen with Compendium
//FIXME: May have to update extractedActor with the imported actorId and then hopefully it won't re-import
            const numActors = QuickEncounter.getNumActors(eActor, {rollType : "full"});

             for (let iToken=0; iToken < numActors; iToken++) {
                 //Slightly vary the (x,y) coords so we don't pile all the tokens on top of each other and make them hard to find
                let tokenData = {
                    name : eActor.name,
                    x: coords.x + (Math.random() * 2*gridSize) - gridSize, //adjust position within +/- full grid increment,
                    y: coords.y + (Math.random() * 2*gridSize) - gridSize, //adjust position within +/- full grid increment,
                    hidden: true,
                    isSavedToken : false
                }
                //Use the prototype token from the Actors
                const isFoundryV8 = game.data.version.startsWith("0.8");
                let tempToken;
                if (isFoundryV8) {//Foundry 0.8.x
                    //0.8.0d: Use new TokenDocument constructor; does it handle token wildcarding?
                    tempToken = new TokenDocument(tokenData, {actor: actor});
                } else {//Foundry 0.7.x
                    //v0.6.7: Call Token.fromActor() which does the merge but also handles wildcard token images
                    tempToken = await Token.fromActor(actor, tokenData);
                }                 

                tokenData = tempToken.data;
                //If from a Compendium, we remember that and the original Compendium actorID
                if (eActor.dataPackName) {tokenData.compendiumActorId = eActor.actorID;}
                //0.6.8: Put the generatedTokensData on the extractedActor, just like the savedTokensData
                this.extractedActors[iExtractedActor].generatedTokensData.push(tokenData);
             }
        }
    }

    async createTokens(options) {
        if (!this.extractedActors?.length) {return;}
        //Have to also control tokens in order to add them to the combat tracker
        /* The normal token workflow (see TokenLayer._onDropActorData) includes:
        1. Get actor data from Compendium if that's what you used (this is probably worth doing)
        2. Positioning the token relative to the drop point (whereas we do it relative to a Map Note or previous position)
        3. Randomizing the token image if that is provided in the Prototype Token
        */
        //v0.6.1d: If it's a savedToken (one that was "captured" then check if it should be frozen as is or regenerated for example by Token Mold)
        //Actor-generated tokens are always generated
        //v0.5.3d: Check the value of setting "freezeCapturedTokens"
        const freezeCapturedTokens = game.settings.get(QE.MODULE_NAME, "freezeCapturedTokens");

        let allCombinedTokensData = [];
        for (const ea of this.extractedActors) {
            allCombinedTokensData = allCombinedTokensData.concat(ea.combinedTokensData);
        }

        //v0.5.0 Clone the token data so if the token is "frozen" change from TokenMold (for example) can be recovered
        //Also, use the ability of Token.create to handle an array
        //Annoyingly, Token.create returns a single token if you passed in a single element array
        const tempCreatedTokens = await Token.create(duplicate(allCombinedTokensData));
        let createdTokens = tempCreatedTokens.length ? tempCreatedTokens : [tempCreatedTokens];
        //v0.5.0: Now reset the token data in case it was adjusted (e.g. by Token Mold), just for those that are frozen
        //v0.6.1d: If freezeCapturedTokens = true, then reset the savedTokens
        for (let i=0; i<allCombinedTokensData.length; i++) {
            if (freezeCapturedTokens && allCombinedTokensData[i].isSavedToken) {
                //Ignore errors that happen during this update
                try {
                    createdTokens[i] = await createdTokens[i].update(allCombinedTokensData[i]);
                } catch {}
            }
            //0.6.1: If you use Alt-Run then create all tokens hidden regardless of how they were saved; Ctrl-Run make them visible
            //(generated tokens are hidden by default; saved tokens retain their original visibility unless overridden)
            if (options?.ctrl) {createdTokens[i].data.hidden = false;}  
            if (options?.alt) {createdTokens[i].data.hidden = true;}
        }
        return createdTokens;
    }

    async createTiles(savedTilesData, shift={x:0, y:0}, options=null) {
        if (!savedTilesData?.length) {return;}
        //0.7.1: Translate tiles if appropriate (copy/pasted the Map Note)
        let shiftedTilesData = savedTilesData.map(std => {
            std.x += shift.x;
            std.y += shift.y;
            return std;
        });

        //0.6.1/0.7.1: If you use Alt-Run then create all tiles hidden regardless of how they were saved; Ctrl-Run make them visible
        //saved tiles retain their original visibility unless overridden
        for (let i=0; i<shiftedTilesData.length; i++) {
            if (options?.ctrl) {shiftedTilesData[i].hidden = false;}  
            if (options?.alt) {shiftedTilesData[i].hidden = true;}
        }
        const createdTiles = await Tile.create(duplicate(shiftedTilesData));
        return createdTiles;
    }

    static async createCombat(createdTokens) {
        if (!createdTokens || !createdTokens.length) {return;}

        //Control the tokens (because that is checked in adding them to the Combat Tracker)
        //But release any others first (so that we don't inadvertently add them to combat)
        let createdToken0;
        const isFoundryV8 = game.data.version.startsWith("0.8");
        if (isFoundryV8) {//Foundry 0.8.x
            createdToken0 = createdTokens[0].object;
        } else {//Foundry 0.7.x
            createdToken0 = createdTokens[0];
        }
        createdToken0.control({releaseOthers : true, updateSight : false, pan : true});

        let tokenObject;
        for (const token of createdTokens) {
            if (isFoundryV8) {//0.8.0e: 
                tokenObject = token.object;
            } else {//Foundry 0.7.x
                tokenObject = token;
            }            
            tokenObject.control({releaseOthers : false, updateSight : false});
        }

        //Load the recovered tokens into the combat Tracker
        //Only have to toggle one of them to add all the controlled tokens
        await createdToken0.toggleCombat();

        //0.6: Moved after toggling combat in case that actually creates the combat entity
        const tabApp = ui.combat;
        tabApp.renderPopout(tabApp);
        //If the tokens are not on the Scene then add them

        //Now release control of them as a group, because otherwise the stack is hard to see             
        for (const token of createdTokens) {
            if (isFoundryV8) {//0.8.0e: 
                tokenObject = token.object;
            } else {//Foundry 0.7.x
                tokenObject = token;
            } 
            tokenObject.release();
        }

    }

    static async onDeleteCombat(combat, options, userId) {
        //Only works with 5e
        //If the display XP option is set, work out how many defeated foes and how many Player tokens
        const shouldDisplayXPAfterCombat = game.settings.get(QE.MODULE_NAME, "displayXPAfterCombat");
        if (!shouldDisplayXPAfterCombat || !combat || !game.user.isGM) {return;}

        //Get list of non-friendly NPCs
        const nonFriendlyNPCTokens = combat.turns?.filter(t => ((t.token?.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE) && (!t.actor || !t.players?.length)));
        //And of player-owned tokens
        const pcTokens = combat.turns?.filter(t => (t.actor && t.players?.length));

        //Now compute total XP and XP per player
        if (!nonFriendlyNPCTokens || !nonFriendlyNPCTokens.length || !pcTokens) {return;}
        const totalXP = QuickEncounter.computeTotalXPFromTokens(nonFriendlyNPCTokens);
        if (!totalXP) {return;}
        const xpPerPlayer = pcTokens.length ? Math.round(totalXP/pcTokens.length) : null;
        let content = game.i18n.localize("QE.XPtoAward.TOTAL") + totalXP;
        if (xpPerPlayer) {content += (game.i18n.localize("QE.XPtoAward.PERPLAYER") + xpPerPlayer);}

        EncounterNote.dialogPrompt({
            title: game.i18n.localize("QE.XPtoAward.TITLE"),
            content: content,
            label: "",
            callback: () => { console.log(`XP to award ${content}`); },
            options: {
                top: window.innerHeight - 350,
                left: window.innerWidth - 720,
                width: 400,
                jQuery: false
            }
        });
    }


    static getActorXP(actor) {
        if ((game.system.id !== "dnd5e") || !actor) {return null;}
        try {
            return actor.data?.data?.details?.xp?.value;
        } catch (err) {
            return null;
        }
    }

    static computeTotalXPFromTokens(tokens) {
        if ((game.system.id !== "dnd5e") || !tokens) { return; }
        let totalXP = null;
        for (const token of tokens) {
            totalXP += QuickEncounter.getActorXP(token.actor);
        }
        return totalXP;
    }

    computeTotalXP() {
        //Compute total XP from non-character, fixed-number (non-die-roll) extracted actors
        //The final XP depends on who was non-friendly, computed from what tokens you pass to computeTotalXPFromTokens
        const extractedActors = this.extractedActors;
        let totalXP = null;
        if (extractedActors?.length) {
            for (const eActor of extractedActors) {
                const actor = game.actors.get(eActor.actorID);
                const actorXP = QuickEncounter.getActorXP(actor);
                //Only include non-character tokens in XP
                if (actorXP && (actor.data.type === "npc")) {
                    if (!totalXP) {totalXP = 0;}
                    //Allow for numActors being a roll (e.g. [[/r 1d4]]) in which case we ignore the XP
                    //although we probably should provide a range or average
                    if (typeof eActor.numActors === "number") {
                        totalXP += eActor.numActors * actorXP;
                    }
                }
            }
        }
        return totalXP;
    }

    renderTotalXPLine() {
        const totalXP = this.computeTotalXP();
        if (!totalXP) {return null;}
        return `${game.i18n.localize("QE.TotalXP.CONTENT")} ${totalXP}XP<br>`;
    }

    /* Hook on JournalSheet Header buttons */
    static async getJournalSheetHeaderButtons(journalSheet, buttons) {
        //0.7.3: Add a Show QE button if this JE has a Quick Encounter and showQEAutomatically is false OR the QE has been hidden
        const quickEncounter = QuickEncounter.extractQuickEncounter(journalSheet);
        const displayShowQEButton = !game.settings.get(QE.MODULE_NAME,"showQEAutomatically") || quickEncounter?.hideQE;
        //If this is an inferred QE (from the presence of Actors), quickEncounter=null because the the journalSheet HTML hasn't been built yet
        if (displayShowQEButton) {
            buttons.unshift({
                label: "QE.JEBorder.ShowQE",
                class: "showQE",
                icon: "fas fa-fist-raised",
                onclick: async ev => {
                    //re-extract the Quick Encounter because the HTML is now available
                    const qe2 = QuickEncounter.extractQuickEncounter(journalSheet);
                    //Toggle the default to always show from now on (otherwise you have no way of turning it on again)
                    if (qe2) {
                        qe2.hideQE = false;
                        qe2.serializeIntoJournalEntry();
                        journalSheet.qeDialog?.render(true);
                    }
                }
            });
        }
    }

    /* Hook on renderJournalSheet */
    static async onRenderJournalSheet(journalSheet, html) {
        if (!game.user.isGM) {return;}

        //v0.5.0 If this could be a Quick Encounter, add the button at the top and the total XP
        //v0.5.3 Remove any existing versions of this first before recomputing it - limit to 5 checks just in case
        for (let iCheck=0; iCheck < 5; iCheck++) {
            const qeDiv = journalSheet.element.find("#QuickEncounterIntro");
            if (!qeDiv || !qeDiv[0] || !qeDiv[0].parentNode) {break;}
            qeDiv[0].parentNode.removeChild(qeDiv[0]);
        }

        const quickEncounter = QuickEncounter.extractQuickEncounter(journalSheet);
        if (quickEncounter) {
            const qeJournalEntry = journalSheet.object;
            //0.6.13: If we opened this from a Scene Note, then remember that (because you could move off to another Note)
            //But once the Journal Entry is open we don't reset it, even if subsequently we re-render (e.g. adding another Actor)
            //Allows for .entry to be null (if you deleted the Note by itself)
            if (!qeJournalEntry.clickedNote && (QuickEncounter.hoveredNote?.entry?.id === journalSheet.object.id)) {
                qeJournalEntry.clickedNote = QuickEncounter.hoveredNote;
            }
            //0.6.13: If originalNoteData is not set (pre-0.6.13) then we may be able to recover it from a saved Token
            if (quickEncounter.checkAndFixOriginalNoteData(qeJournalEntry.clickedNote)) {
                quickEncounter.serializeIntoJournalEntry();
            }
            const totalXPLine = quickEncounter.renderTotalXPLine();

            //If there's no Map Note, include a warning
            let noMapNoteWarning = null;
            const qeScene = QuickEncounter.getEncounterScene(qeJournalEntry);
            if (!qeScene) {
                noMapNoteWarning = `${game.i18n.localize("QE.AddToCombatTracker.NoMapNote")}`;
            }
            
            //v0.6.1: Also pop open a companion dialog with details about what tokens have been placed and XP
            //0.7.0 Remove option to not use the QE Dialog
            //v0.6.10: First attempt to reuse the existing QE dialog (not using app.id)
            let qeDialog = journalSheet.qeDialog;
            if (qeDialog) {
                qeDialog.update(quickEncounter);    //have to update since we extract a new one each time
            } else {
                //0.8.0: If this is being viewed out of a Compendium, present a different read-only Quick Encounter Dialog with instructions
                //0.8.0d: Relax the null test for qeJournalEntry.compendium
                qeDialog = new QESheet(quickEncounter, {isFromCompendium : qeJournalEntry.compendium});
                journalSheet.qeDialog = qeDialog;
            }

            //0.7.3 OPen the QE automatically (default) in general unless you have hidden it
            const showQEDialog =  ((quickEncounter.hideQE === null) && game.settings.get(QE.MODULE_NAME, "showQEAutomatically")) || !(quickEncounter.hideQE ?? true);
            if (showQEDialog || qeJournalEntry?.showQEOnce) {
                delete qeJournalEntry.showQEOnce;
                qeDialog.render(true);
            }

            const qeJournalEntryIntro = noMapNoteWarning;
            //qeJournalEntryIntro = await renderTemplate('modules/quick-encounters/templates/qeJournalEntryIntro.html', {totalXPLine, noMapNoteWarning});

            html.find('.editor-content').prepend(qeJournalEntryIntro);
            //If there's an embedded button, then add a listener
            html.find('button[name="addToCombatTracker"]').click(event => {
                quickEncounter.run(event);
            });
        }
    }


}

export class Dialog3 extends Dialog {
    static async buttons3({title, content, button1cb, button2cb, button3cb, buttonLabels, options={}}) {
        //Also can function as a generic 2-button dialog by passing button3b=null
            return new Promise((resolve, reject) => {
        const dialog = new this({
            title: title,
            content: content,
            buttons: {
                button1: {
                    icon: null,
                    label: game.i18n.localize(buttonLabels[0]),
                    callback: html => {
                    const result = button1cb ? button1cb(html) : true;
                    resolve(result);
                    }
                },
                button2: {
                    icon: null,
                    label: game.i18n.localize(buttonLabels[1]),
                    callback: html => {
                    const result = button2cb ? button2cb(html) : false;
                    resolve(result);
                    }
                },
                button3: {
                    icon: null,
                    label: game.i18n.localize(buttonLabels[2]),
                    callback: html => {
                    const result = button3cb ? button3cb(html) : false;
                    resolve(result);
                    }
                }
            },
            default: "button1",
            close: () => reject
        }, options);

        if (!button3cb) {
            delete dialog.data.buttons.button3;
        }
        dialog.render(true);
        });
    }
}



/** HOOKS */
//0.6.13: Can't hook on actually clicking on the Note, so on hoverIn/hoverOut we record which Note we're on
//and then set qeJournalEntry.clickedNote in the renderJournalEntry Hook
Hooks.on("hoverNote", (note, startedHover) => {
    if (!note || !game.user.isGM) {return;}
    if (startedHover) {
        QuickEncounter.hoveredNote = note;
    } else {
        QuickEncounter.hoveredNote = null;
    }
});

//Add a listener for the embedded Encounter button and record the scene if we can
Hooks.on(`renderJournalSheet`,  QuickEncounter.onRenderJournalSheet);


//The Journal Sheet  looks to see if this is the Tutorial and deletes the Journal Entry if so
//Placing a map Note is moved to when you actually run the Encounter
Hooks.on('closeJournalSheet', async (journalSheet, html) => {
    if (!game.user.isGM) {return;}
    const journalEntry = journalSheet.object;

    //0.5.3: BUG: If you had the Tutorial JE open it would delete another Journal Entry when you closed it
    //This was happening because $("QuickEncountersTutorial") by itself was searching the whole DOM
    if (journalSheet.element.find("#QuickEncountersTutorial").length) {
        //This is the tutorial Journal Entry
        //v0.4.0 Check that we haven't already deleted this (because onDelete -> close)
        if (game.journal.get(journalEntry.id)) {await JournalEntry.delete(journalEntry.id);}
    }

    //v0.6.1: If there's a QE dialog open, close that too
    if (journalSheet.qeDialog) {
        journalSheet.qeDialog.close();
        delete journalSheet.qeDialog;
    }
    delete journalEntry.clickedNote;
});

Hooks.on("getJournalSheetHeaderButtons", QuickEncounter.getJournalSheetHeaderButtons);
Hooks.on("init", QuickEncounter.init);
Hooks.on('getSceneControlButtons', QuickEncounter.getSceneControlButtons);
Hooks.on("deleteCombat", (combat, options, userId) => {
    QuickEncounter.onDeleteCombat(combat, options, userId);
});
