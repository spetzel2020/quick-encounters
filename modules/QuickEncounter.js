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
*/


import {EncounterNote} from './EncounterNote.js';
import {EncounterCompanionSheet} from './EncounterCompanionSheet.js';

export const MODULE_NAME = "quick-encounters";

export const SCENE_ID_FLAG_KEY = "sceneID";
export const TOKENS_FLAG_KEY = "tokens";
export const COMBATANTS_FLAG_KEY = "combatants";

export function deleteAllEQMapNotes(text="Unknown") {
    QuickEncounter.deleteAllEQMapNotes(text);
}

export class QuickEncounter {
    static init() {
        game.settings.register(MODULE_NAME, "quickEncountersVersion", {
            name: "Quick Encounters Version",
            hint: "",
            scope: "system",
            config: false,
            default: game.i18n.localize("QE.Version"),
            type: String
        });
        game.settings.register(MODULE_NAME, "freezeCapturedTokens", {
            name: "QE.FreezeCapturedTokens.NAME",
            hint: "QE.FreezeCapturedTokens.HINT",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });
        game.settings.register(MODULE_NAME, "displayXPAfterCombat", {
            name: "QE.DisplayXPAfterCombat.NAME",
            hint: "QE.DisplayXPAfterCombat.HINT",
            scope: "world",
            config: true,
            visible: game.system.id === "dnd5e",
            default: true,
            type: Boolean
        });
        game.settings.register(MODULE_NAME, "useEmbeddedMethod", {
            name: game.i18n.localize("QE.UseEmbeddedMethod.NAME"),
            hint: game.i18n.localize("QE.UseEmbeddedMethod.HINT"),
            scope: "world",
            config: true,
            default: true,  //True during Beta
            type: Boolean
        });
    }


    static getSceneControlButtons(buttons) {
        //Hooked on the left-hand set of buttons; add a Create Quick Encounter one
        let notesButton = buttons.find(b => b.name === "token");

        if (notesButton && game.user.isGM) {
            notesButton.tools.push({
                name: "linkEncounter",
                title: game.i18n.localize("QE.CreateQuickEncounter.BUTTON"),
                icon: "fas fa-fist-raised",
                toggle: false,
                button: true,
                visible: game.user.isGM,
                onClick: () => QuickEncounter.createOrRun()
            });
            notesButton.tools.push({
                name: "deleteEncounters",
                title: "Delete all Quick Encounter Map Notes",
                icon: "fas fa-trash",
                toggle: false,
                button: true,
                visible: false, //game.user.isGM,
                onClick: () => QuickEncounter.deleteAllEQMapNotes("Unknown")
            });
        }
    }

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

    static createOrRun() {
        //Called when you press the Quick Encounters button (fist) from the sidebar
        //If you are controlling tokens, it assumes that's the Encounter you want to create
        //Method 1: Get the selected tokens and the scene
        //Exclude friendly tokens unless you say yes to the dialog
        const controlledTokens = Array.from(canvas.tokens.controlled);
        const controlledFriendlyTokens = controlledTokens.filter(t => t.data?.disposition === TOKEN_DISPOSITIONS.FRIENDLY );
        if (controlledTokens && controlledTokens.length) {
            if (controlledFriendlyTokens && controlledFriendlyTokens.length) {
                Dialog.confirm({
                  title: game.i18n.localize("QE.IncludeFriendlies.TITLE"),
                  content: game.i18n.localize("QE.IncludeFriendlies.CONTENT"),
                  yes: () => {QuickEncounter.createFromTokens(controlledTokens)},
                  no: () => {
                      const controlledNonFriendlyTokens = controlledTokens.filter(t => t.data?.disposition !== TOKEN_DISPOSITIONS.FRIENDLY );
                      if (controlledNonFriendlyTokens.length) {QuickEncounter.createFromTokens(controlledNonFriendlyTokens);}
                  }
                });
            } else {
                QuickEncounter.createFromTokens(controlledTokens);
            }

        } else {
            //Method 2: Check for an open Journal with embedded Actors and a map Note
            const quickEncounter = QuickEncounter.findCandidateJournalEntry();
            if (quickEncounter) {QuickEncounter.run(quickEncounter);}
            else {
                //No selected tokens or open Journal Entry
                QuickEncounter.showTutorialJournalEntry();
            }
        }
    }

    /** Method 1: createFromTokens
    * Delete the controlled (selected) tokens and record their tokenData in a created Journal Entry
    * Also embed Actors they represent (for clarity)
    **/

    static async createFromTokens(controlledTokens) {
        //Create a new JournalEntry - the corresponding map note gets created when you save&close the Journal Sheet
        //0.4.1: Group identical actors with a number before it
        let tokenActorIDs = new Set();
        for (const token of controlledTokens) {
            tokenActorIDs.add(token.actor.id);
        }

        //v0.5.0 The Quick Encounters button now gets added dynamically when we render the relevant Journal Entry
//NOTE: -------- This code chunk should enable us to drag additional encounters or tokens to a single Journal Entry if necessary
//FIXME: Replace all this with a renderTemplate section using handlebars
        let content = game.i18n.localize("QE.Instructions.CONTENT");
        let combatants = [];
        for (const tokenActorID of tokenActorIDs) {
            const tokens = controlledTokens.filter(t => t.actor.id === tokenActorID);
            //0.4.1: 5e specific: find XP for this number of this actor
            const numTokens = tokens.length;
            const xp = QuickEncounter.getActorXP(tokens[0].actor);
            const xpString = xp ? `(${xp}XP each)`: "";
            content += `<li>${tokens.length}@Actor[${tokenActorID}]{${tokens[0].name}} ${xpString}</li>`;
            combatants.push({
                num : numTokens,
                name : tokens[0].name,
                xp : xpString,
                img: tokens[0].data?.img,
                tokens: tokens,
                actorName: tokens[0].actor?.data?.token?.name
            });
        }

        const scene = controlledTokens[0].scene;
        const journalData = {
            folder: null,
            name:  `Quick Encounter: ${scene.name}`,
            content: content,
            type: "encounter",
            types: "base"
        }
        let journalEntry = await JournalEntry.create(journalData);

        //Record the scene for the tokens as a convenience
        await journalEntry.setFlag(MODULE_NAME,SCENE_ID_FLAG_KEY, scene.id);
        await QuickEncounter.addTokensToJournalEntry(journalEntry, controlledTokens);

        const ejSheet = new JournalSheet(journalEntry);
        ejSheet.render(true);
        //0.6.1: This will also pop-open a companion sheet if you have that setting

        //Delete the existing tokens (because they will be replaced)
        for (const token of controlledTokens) {
            canvas.tokens.deleteMany([token.id]);
        }

        //And create the Map Note (otherwise it will ask when you close the Journal Entry)
        EncounterNote.place(journalEntry);
    }

    static async addTokensToJournalEntry(qeJournalEntry, controlledTokens) {
        //Save an array of token data
        let controlledTokensData = [];
        for (const token of controlledTokens) {
            controlledTokensData.push(token.data);
        }
        await qeJournalEntry.setFlag(MODULE_NAME, TOKENS_FLAG_KEY, controlledTokensData);
    }

    static getActorXP(actor) {
        if ((game.system.id !== "dnd5e") || !actor) {return null;}
        try {
            return actor.data.data.details.xp.value;
        } catch (err) {
            return null;
        }
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


    /** Method 2: Look through open Windows to find a Journal Entry with Actors and a Map Note
    *
    */
    static findCandidateJournalEntry() {
        if (Object.keys(ui.windows).length === 0) {return null;}
        else {
            let quickEncounter = null;
            for (let w of Object.values(ui.windows)) {
                //Check open windows for a Journal Sheet with a Map Note and embedded Actors
                if (w instanceof JournalSheet) {
                    quickEncounter = QuickEncounter.extractQuickEncounter(w);
                    if (quickEncounter) {break;}
                }
            }
            return quickEncounter;
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

        const mapNote = journalEntry.sceneNote;
        //0.6 this now potentially includes Compendium links
        const extractedActors = QuickEncounter.extractActors(journalSheet.element);
        const savedTokensData =  journalEntry.getFlag(MODULE_NAME, TOKENS_FLAG_KEY);
        const combatants = journalEntry.getFlag(MODULE_NAME, COMBATANTS_FLAG_KEY);
        //v0.6.1: Backwards compatibility - set the isSavedToken flga
        savedTokensData?.forEach(td => {td.isSavedToken = true;});

        //Minimum Quick Encounter has a Journal Entry, and tokens or actors (or 0.6 Compendium which turns into Actors)
        //If there isn't a map Note we may need to switch scenes
        if ((extractedActors && extractedActors.length) || (savedTokensData && savedTokensData.length)) {
            //0.6.1d: Create a template array so we can tell how many saved vs. generated tokens we will have at display time
            //(without actually extracting Actor/Compendium data every time)
            const extractedActorTokenData = [];          
            for (const eActor of extractedActors) {
                const numActors = QuickEncounter.getNumActors(eActor, {rollRandom: false});
                for (let iToken=0; iToken < numActors; iToken++ ) {
                    extractedActorTokenData.push({actorId: eActor.actorID});
                }
            }

            const quickEncounter = {
                journalEntry : journalEntry,
                mapNote : mapNote,
                extractedActors : extractedActors,
                savedTokensData : savedTokensData,
                extractedActorTokenData : extractedActorTokenData,
                combatants : combatants

            }
            return quickEncounter;
        } else {
            return null;
        }
    }

    static extractActors(html) {
        const ACTOR = "Actor";
        const entityLinks = html.find(".entity-link");
        if (!entityLinks || !entityLinks.length) {return null;}

        const extractedActors = [];
        const intReg = "([0-9]+)[^0-9]*$"; //Matches last "number followed by non-number at the end of a string"
        const dieRollReg = /([0-9]+\s*d[4,6,8,10,12](?:\s*\+\s*[0-9]+))/;
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
                            //Otherwise try to prase it out
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

    static async run(quickEncounter) {
        if (!quickEncounter) {return;}
        //0.4.0 Refactored so that both buttons (embedded or external) come here
        //You open the Journal and press the button
        //- Extract the actors (if any)
        //- Find the encounter location based on the Note position
        //- Create tokens (or use existing ones if they exist)
//Should be able to refactor this to make it a true Quick Encounter instance
        const qeJournalEntry = quickEncounter.journalEntry;
        let mapNote = quickEncounter.mapNote;
        const extractedActors = quickEncounter.extractedActors;
        const savedTokensData = quickEncounter.savedTokensData;


        //EITHER take saved tokens and reposition them, OR create tokens from embedded Actors
        if (!(qeJournalEntry && ((extractedActors && extractedActors.length) || (savedTokensData && savedTokensData.length)))) {return;}

        // Switch to the correct scene if confirmed
        const qeScene = QuickEncounter.getEncounterScene(qeJournalEntry);
        //If there isn't a Map Note anywhere, prompt to create one in the center of the view
        if (!qeScene) {EncounterNote.noMapNoteDialog(qeJournalEntry);}
        const isPlaced = await EncounterNote.mapNoteIsPlaced(qeScene, qeJournalEntry);
        if (!isPlaced ) {return;}

        //Something is desperately wrong if this is null
        mapNote = qeJournalEntry.sceneNote;
        const coords = {x: mapNote.data.x, y: mapNote.data.y}
        canvas.tokens.activate();

        //0.6.1: createTokenDataFromActors() sets isSavedToken=false
        let extractedActorTokenData = await QuickEncounter.createTokenDataFromActors(extractedActors, coords);

        if (savedTokensData) {
            savedTokensData.forEach(td => {
                td.isSavedToken = true;
            })
        }

        const combinedTokenData = QuickEncounter.combineTokenData(extractedActors, extractedActorTokenData, savedTokensData);

        //Now create the Tokens
        const createdTokens = await QuickEncounter.createTokens(combinedTokenData);

        //And add them to the Combat Tracker (wait 200ms for drawing to finish)
        setTimeout(() => {
            QuickEncounter.createCombat(createdTokens);
        },200);
    }


    static combineTokenData(extractedActors,  extractedActorTokenData, savedTokensData ) {
        //v0.5.1 If we have more actors than saved tokens, create more tokens
        //If we have fewer actors than saved tokens, skip some
        let combinedTokenData = [];
        //v0.5.0 We will want to re-create tokens that have been saved but otherwise create them from Actors
        //So set a frozen flag on each saved token that doesn't allow further changes (so that saved tokens don't get re-rolled)
        //Setting directly rather than using setFlag because we don't need this saved between sessions
        //v0.5.1 Create both from the embedded Actors and any saved Tokens and then attempt to reconcile
        //First cut: If you have more actors than saved tokens of that actor (including none), then generate
        //If we have no savedTokens, do none of this checking

        for (const ea of extractedActors) {
            const eaTokensData = extractedActorTokenData.filter(eatd => eatd.actorId === ea.actorID);
            const savedTokensForThisActorID = savedTokensData ? savedTokensData.filter(std => std.actorId === ea.actorID) : null;

            if (savedTokensForThisActorID) {
                const numExcessActors = eaTokensData.length - savedTokensForThisActorID.length;
                if (numExcessActors >= 0) {
                    //if excessActors > 0 take all of the saved tokens and then as many as necessary from the extracted Actor tokens
                    combinedTokenData = combinedTokenData.concat(savedTokensForThisActorID);
                    combinedTokenData = combinedTokenData.concat(eaTokensData.slice(0, numExcessActors));
                } else if (numExcessActors < 0) {
                    //Take all possible saved tokens up to the number
                    combinedTokenData = combinedTokenData.concat(savedTokensForThisActorID.slice(0, eaTokensData.length));
                }
            } else {
                //No saved tokens - just use the Actor data
                combinedTokenData = combinedTokenData.concat(eaTokensData);
            }
        }
        return combinedTokenData;
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
            } else if ((typeof multiplier === "string") && Roll.validate(multiplier) && options?.rollRandom) {
                //v0.6: Pass the multiplier to the roll formula, which allows for a digit or a formula
                let r= new Roll(multiplier);
                r.evaluate();
                numActors = r.total ? r.total : 1;
            } 
        }

        return numActors;
    }

    static async createTokenDataFromActors(extractedActors, coords) {
        if (!extractedActors || !extractedActors.length || !coords) {return;}
        const gridSize = canvas.dimensions.size;
        let expandedTokenData = [];
        for (let eActor of extractedActors) {
            let actor = null;
            //v0.6 Need to check whether this is a direct Actor reference or from a Compendium
            if (eActor.dataPackName) {
                const actorPack = game.packs.get(eActor.dataPackName);
                if (!actorPack) {continue;}
                //Import this actor because otherwise you won't be able to see character sheet etc.
                actor = await game.actors.importFromCollection(eActor.dataPackName, eActor.actorID, {}, {renderSheet: false});
                //Try This
                eActor.actorID = actor.id;
            } else {
                actor = game.actors.get(eActor.actorID);
            }
            if (!actor) {continue;}     //possibly will happen with Compemdium

            const numActors = QuickEncounter.getNumActors(eActor, {rollRandom : true});

             for (let iActor=1; iActor <= numActors; iActor++) {
                 //Slightly vary the (x,y) coords so we don't pile all the tokens on top of each other and make them hard to find
                 let tokenData = {
                     name : eActor.name,
                     x: coords.x + (Math.random() * 2*gridSize) - gridSize, //adjust position within +/- full grid increment,
                     y: coords.y + (Math.random() * 2*gridSize) - gridSize, //adjust position within +/- full grid increment,
                     hidden: true,
                     isSavedToken : false
                 }
                 //Use the prototype token from the Actors
                 tokenData = mergeObject(actor.data.token, tokenData, {inplace: false});
                 //If from a Compendium, we remember that and the original Compendium actorID
                 if (eActor.dataPackName) {tokenData.compendiumActorID = eActor.actorID;}
                 expandedTokenData.push(tokenData);
             }
        }
        return expandedTokenData;
    }

    static async createTokens(expandedTokenData) {
        if (!expandedTokenData) {return null;}
        //Have to also control tokens in order to add them to the combat tracker
/*TODO: The normal token workflow (see TokenLayer._onDropActorData) includes:
        1. Get actor data from Compendium if that's what you used (this is probably worth doing)
        2. Positioning the token relative to the drop point (whereas we do it relative to a Map Note or previous position)
        3. Randomizing the token image if that is provided in the Prototype Token
*/
        //v0.6.1d: If it's a savedToken (one that was "captured" then check if it should be frozen as is or regenerated for example by Token Mold)
        //Actor-generated tokens are always generated
        //v0.5.3d: Check the value of setting "freezeCapturedTokens"
        const freezeCapturedTokens = game.settings.get(MODULE_NAME, "freezeCapturedTokens");

        //v0.5.0 Clone the token data so if the token is "frozen" change from TokenMold (for example) can be recovered
        //Also, use the ability of Token.create to handle an array
        //Annoyingly, Token.create returns a single token if you passed in a single element array
        const tempCreatedTokens = await Token.create(duplicate(expandedTokenData));
        let createdTokens = tempCreatedTokens.length ? tempCreatedTokens : [tempCreatedTokens];
        //v0.5.0: Now reset the token data in case it was adjusted (e.g. by Token Mold), just for those that are frozen
        //v0.6.1d: If freezeCapturedTokens = true, then reset the savedTokens
        for (let i=0; i<expandedTokenData.length; i++) {
            if (freezeCapturedTokens && expandedTokenData[i].isSavedToken) {
                createdTokens[i] = await createdTokens[i].update(expandedTokenData[i]);
            }
        }
        return createdTokens;
    }



    static async createCombat(createdTokens) {
        if (!createdTokens || !createdTokens.length) {return;}

        //Control the tokens (because that is checked in adding them to the Combat Tracker)
        //But release any others first (so that we don't inadvertently add them to combat)
        createdTokens[0].control({releaseOthers : true, updateSight : false, pan : true});
        for (const token of createdTokens) {
            token.control({releaseOthers : false, updateSight : false});
        }

        //Load the recovered tokens into the combat Tracker
        //Only have to toggle one of them to add all the controlled tokens
        await createdTokens[0].toggleCombat();

        //0.6: Moved after toggling combat in case that actually creates the combat entity
        const tabApp = ui.combat;
        tabApp.renderPopout(tabApp);
        //If the tokens are not on the Scene then add them

        //Now release control of them as a group, because otherwise the stack is hard to see
        for (const token of createdTokens) {
            token.release();
        }

    }

    static async onDeleteCombat(combat, options, userId) {
        //Only works with 5e
        //If the display XP option is set, work out how many defeated foes and how many Player tokens
        const shouldDisplayXPAfterCombat = game.settings.get(MODULE_NAME, "displayXPAfterCombat");
        if (!shouldDisplayXPAfterCombat || !combat) {return;}

        //Get list of non-friendly NPCs
        const nonFriendlyNPCTokens = combat.turns.filter(t => ((t.token.disposition === TOKEN_DISPOSITIONS.HOSTILE) && (!t.actor || !t.players.length)));
        //And of player-owned tokens
        const pcTokens = combat.turns.filter(t => (t.actor && t.players.length));

        //Now compute total XP and XP per player
        if (!nonFriendlyNPCTokens || !nonFriendlyNPCTokens.length || !pcTokens) {return;}
        const totalXP = await QuickEncounter.computeTotalXP(nonFriendlyNPCTokens);
        if (!totalXP) {return;}
        const xpPerPlayer = pcTokens.length ? totalXP/pcTokens.length : null;
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



    static async computeTotalXP(tokens) {
        if ((game.system.id !== "dnd5e") || !tokens) { return; }
        let totalXP = null;
        for (const token of tokens) {
            totalXP += QuickEncounter.getActorXP(token.actor);
        }
        return totalXP;
        /*        
                if (totalXP) {
                    const chatMessageData = {
                        user: game.user,
                        whisperTo: game.user,
                        visible : true,
                        content : `Total XP: ${totalXP}`
                    }
                    const chatMessage = await ChatMessage.create(chatMessageData);
                    //Post is unnecessary because create calls onCreate which calls postOne
                }
        */
    }

}


/** HOOKS */
//Add a listener for the embedded Encounter button and record the scene if we can
Hooks.on(`renderJournalSheet`, async (journalSheet, html) => {
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
        const extractedActors = quickEncounter.extractedActors;
        let totalXP = null;
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
        let totalXPLine = null;
        if (totalXP) {
            totalXPLine = `${game.i18n.localize("QE.TotalXP.CONTENT")} ${totalXP}XP<br>`;
        }
        //If there's no Map Note, include a warning
        let noMapNoteWarning = null;
        const qeScene = QuickEncounter.getEncounterScene(journalSheet.object);
        if (!qeScene) {
            noMapNoteWarning = `${game.i18n.localize("QE.AddToCombatTracker.NoMapNote")}`;
        }

        //v0.6.1: Also pop open a companion dialog with details about what tokens have been placed and XP
        if (game.settings.get(MODULE_NAME, "useEmbeddedMethod")) {
            const qeJournalEntryIntro = await renderTemplate('modules/quick-encounters/templates/qeJournalEntryIntro.html', {totalXPLine, noMapNoteWarning});
            html.find('.editor-content').prepend(qeJournalEntryIntro);
            //If there's an embedded button, then add a listener
            html.find('button[name="addToCombatTracker"]').click(() => {
                QuickEncounter.run(quickEncounter);
            });
        } else {
            const companionSheet = new EncounterCompanionSheet(quickEncounter, totalXPLine);
            companionSheet.render(true);
            journalSheet.companionSheet = companionSheet;
        }

    }
});//end Hooks.on("renderJournalSheet")


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

    //v0.6.1: If there's a companion dialog open, close that too
    if (journalSheet.companionSheet) {
        journalSheet.companionSheet.close();
        delete journalSheet.companionSheet;
    }
});


Hooks.on("init", QuickEncounter.init);
Hooks.on('getSceneControlButtons', QuickEncounter.getSceneControlButtons);
Hooks.on("deleteCombat", (combat, options, userId) => {
    QuickEncounter.onDeleteCombat(combat, options, userId);
});
