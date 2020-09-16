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
*/


import {EncounterNote} from './EncounterNote.js';

export const MODULE_NAME = "quick-encounters";
export const SCENE_ID_FLAG_KEY = "sceneID";
export const TOKENS_FLAG_KEY = "tokens";
export const TOTAL_XP_KEY = "totalXP";
export const EMBEDDED_ACTORS_KEY = "embeddedActors";



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
    }


    static getSceneControlButtons(buttons) {
        //Hooked on the left-hand set of buttons; add a Create Quick Encounter one
        let notesButton = buttons.find(b => b.name === "token");

        if (notesButton && game.user.isGM) {
            notesButton.tools.push({
                name: "linkEncounter",
                title: game.i18n.localize("QE.BUTTON.CreateQuickEncounter"),
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
                active: false,
                visible: false, // game.user.isGM,
                onClick: () => QuickEncounter.deleteAllEQMapNotes()
            });
        }
    }

    static async deleteAllEQMapNotes() {
        let notes = canvas.notes.placeables;
        for (let iNote = 0; iNote < notes.length; iNote++) {
            if (notes[iNote].text === "Unknown") {
                canvas.notes.placeables.splice(iNote,1);
                iNote--;
            }
        }
    }

    static createOrRun() {
        //Called when you press the Quick Encounters button (fist) from the sidebar
        //If you are controlling tokens, it assumes that's the Encounter you want to create
        //Method 1: Get the selected tokens and the scene
        const controlledTokens = Array.from(canvas.tokens.controlled);
        if (controlledTokens && controlledTokens.length) {
            QuickEncounter.createFromTokens(controlledTokens);
        } else {
            //Method 2: Check for an open Journal with embedded Actors and a map Note
            const quickEncounter = QuickEncounter.findCandidateJournalEntry();
            if (quickEncounter) {QuickEncounter.run(quickEncounter);}
            else {
                //No selected tokens or open Journal Entry
                QuickEncounter.showTemplateJournalEntry();
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

        const addToCombatTrackerTitle = game.i18n.localize("QE.BUTTON.AddToCombatTracker");
        const addToCombatTrackerButton = await renderTemplate('modules/quick-encounters/templates/addToCombatTrackerButton.html');
//NOTE: -------- This code chunk should enable us to drag additional encounters or tokens to a single Journal Entry if necessary
        let content = game.i18n.localize("QE.CONTENT.AddADescription");
        let xpTotal = 0;
        for (const tokenActorID of tokenActorIDs) {
            const tokens = controlledTokens.filter(t => t.actor.id === tokenActorID);
            //0.4.1: 5e specific: find XP for this number of this actor
            const numTokens = tokens.length;
            const xp = QuickEncounter.getActorXPTotal(tokens[0], numTokens);
            xpTotal += xp;
            const xpString = xp ? `(${xp}XP)`: "";
            content += `<li>${tokens.length}@Actor[${tokenActorID}]{${tokens[0].name}} ${xpString}</li>`;
        }
        content += addToCombatTrackerButton;
//--------------

        const instructions = game.i18n.localize("QE.CONTENT.Instructions");
        content += instructions;

        const scene = controlledTokens[0].scene;
        const journalData = {
            folder: null,
            name: `${scene.name}: Quick Encounter`,
            content: content,
            type: "encounter",
            types: "base"
        }
        var journalEntry = await JournalEntry.create(journalData);

        //Record the scene for the tokens as a convenience
        await journalEntry.setFlag(MODULE_NAME,SCENE_ID_FLAG_KEY, scene.id);
        await QuickEncounter.addTokensToJournalEntry(journalEntry, controlledTokens);

        const ejSheet = new JournalSheet(journalEntry);
        ejSheet.render(true);
        //Delete the existing tokens (because they will be replaced)
        for (const token of controlledTokens) {
            canvas.tokens.deleteMany([token.id]);
        }
    }
    static async addTokensToJournalEntry(qeJournalEntry, controlledTokens) {
        //Save an array of token data
        let controlledTokensData = [];
        for (const token of controlledTokens) {
            controlledTokensData.push(token.data);
        }
        await QuickEncounter.addTokenDataToJournalEntry(qeJournalEntry, controlledTokensData);
    }
    static async addTokenDataToJournalEntry(qeJournalEntry, controlledTokensData) {
        await qeJournalEntry.setFlag(MODULE_NAME, TOKENS_FLAG_KEY, controlledTokensData);
    }

    static getActorXPTotal(token, numActors) {
        if ((game.system.id !== "dnd5e") || !token || !numActors) {return null;}
        try {
            return numActors * token.actor.data.data.details.xp.value;
        } catch(err) {
            return null;
        }
    }

    static async showTemplateJournalEntry() {
        //Create a new JournalEntry - with info on how to use Quick Encounters
        const howToUseJournalEntry = await renderTemplate('modules/quick-encounters/templates/how-to-use.html');
        const title =  game.i18n.localize("QE.TITLE.HowToUse");

        const content = howToUseJournalEntry;

        const scene = canvas.viewed;
        const journalData = {
            folder: null,
            name: title,
            content: content,
            type: "encounter",
            types: "base"
        }
        var journalEntry = await JournalEntry.create(journalData);

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

    static extractQuickEncounter(journalSheet) {
        const journalEntry = journalSheet.entity;
        const mapNote = journalEntry.sceneNote;
        const extractedActors = QuickEncounter.extractActors(journalSheet.element);
        const existingTokens =  journalEntry.getFlag(MODULE_NAME, TOKENS_FLAG_KEY);

        //Minimum Quick Encounter has a Journal Entry, and tokens or actors
        //If there isn't a map Note we may need to switch scenes
        if (journalEntry && ((extractedActors && extractedActors.length) || (existingTokens && existingTokens.length))) {
            const quickEncounter = {
                journalEntry : journalEntry,
                mapNote : mapNote,
                extractedActors : extractedActors,
                existingTokens : existingTokens
            }
            return quickEncounter;
        } else {
            return null;
        }
    }

    static extractActors(html) {
        const entityLinks = html.find(".entity-link");
        if (!entityLinks || !entityLinks.length) {return null;}

        const extractedActors = [];
        entityLinks.each((i, el) => {
            const element = $(el);
            const prev = element.parent();
            const dataEntity = element.attr("data-entity");
            if (dataEntity === "Actor") {
                const dataID = element.attr("data-id");
                const dataName = element.text();
                const numActors = parseInt(prev[0].childNodes ? prev[0].childNodes[0].textContent : "1");
                extractedActors.push({
                    numActors : numActors ? numActors : 1,
                    actorID : dataID,
                    name : dataName
                });
            }
        });

        return extractedActors;
    }




    /** Run the Quick Encounter (by using the embedded button or the side button)
    */
    static async runFromEmbeddedButton(qeJournalSheet) {
        const quickEncounter = QuickEncounter.extractQuickEncounter(qeJournalSheet);
        await QuickEncounter.run(quickEncounter);
    }

    static async run(quickEncounter) {
        if (!quickEncounter) {return;}
        //0.4.0 Refactored so that both buttons (embedded or external) come here
        //You open the Journal and press the button
        //- Extract the actors (if any)
        //- Find the encounter location based on the Note position
        //- Create tokens (or use existing ones if they exist)
        const qeJournalEntry = quickEncounter.journalEntry;
        let mapNote = quickEncounter.mapNote;
        const extractedActors = quickEncounter.extractedActors;
        const existingTokens = quickEncounter.existingTokens;


        // This version takes any open Journal with embedded Actors and turns them into tokens at the Journal Entry's map note position
        if (!(qeJournalEntry && ((extractedActors && extractedActors.length) || (existingTokens && existingTokens.length)))) {return;}

        // Switch to the correct scene if confirmed
        const qeScene = QuickEncounter.getEncounterScene(qeJournalEntry);
        //If there isn't a Map Note anywhere, prompt to create one in the center of the view
        if (!qeScene) {QuickEncounter.noMapNoteDialog(qeJournalEntry);}
        if (!await QuickEncounter.viewingCorrectScene(qeScene)) {return;}

        //Something is desperately wrong if this is null
        mapNote = qeJournalEntry.sceneNote;
        const coords = {x: mapNote.data.x, y: mapNote.data.y}
        canvas.tokens.activate();

        //If we have existing tokens, then re-create those, otherwise create them from Actors
        let tokenData = [];
        if (existingTokens && existingTokens.length) {
            tokenData = existingTokens;
        } else {
            tokenData = await QuickEncounter.extractTokenData(extractedActors, coords);
        }

        //Now create the Tokens
        const createdTokens = await QuickEncounter.createTokens(tokenData);

        //If 5e then give GM the total XP
        QuickEncounter.putXPInChat(createdTokens);

        //And add them to the Combat Tracker (wait 100ms for drawing to finish)
        setTimeout(() => {
            QuickEncounter.createCombat(createdTokens);
        },100);
    }

    static async putXPInChat(createdTokens) {
        if ((game.system.id !== "dnd5e") || !createdTokens) {return;}
        let totalXP = null;
        for (const token of createdTokens) {
            totalXP += QuickEncounter.getActorXPTotal(token, 1);
        }
        if (totalXP) {
            const chatMessageData = {
                visible : true,
                content : `Total XP: ${totalXP}`
            }
            const chatMessage = await ChatMessage.create(chatMessageData);
            //Post is unnecessary because create calls onCreate which calls postOne
        }
    }

    static async noMapNoteDialog(qeJournalEntry) {
        Dialog.confirm({
            title: game.i18n.localize("QE.NoMapNote.TITLE"),
            content : game.i18n.localize("QE.NoMapNote.CONTENT"),
            yes : async () => {
                EncounterNote.place(qeJournalEntry, {placeDefault : true});
                return true;
            }
        });
    }


    static async viewingCorrectScene(qeScene) {
        //Get the scene for this Quick Encounter (can't use sceneNote if we're in the wrong scene)
        if (!qeScene) {return false;}
        //If we're viewing the relevant scene, then good
        if (game.scenes.viewed === qeScene) {return true;}

        //Otherwise ask if you want to switch to the scene - default is No/false
        return await Dialog.confirm({
            title: game.i18n.localize("QE.SwitchScene.TITLE"),
            content : `${game.i18n.localize("QE.SwitchScene.CONTENT")} ${qeScene.name}?`,
            yes : async () => {
                await qeScene.view();
                return true;
            }
        });
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

    static async extractTokenData(extractedActors, coords) {
        if (!extractedActors || !extractedActors.length || !coords) {return;}
        const gridSize = canvas.dimensions.size;
        let expandedTokenData = [];
        for (let eActor of extractedActors) {
            let numActors = eActor.numActors;
            const actor = game.actors.get(eActor.actorID);

             //If numActors didn't convert then just create 1 token
             if (!numActors) {numActors = 1;}

             for (let iActor=1; iActor <= numActors; iActor++) {
                 //Slightly vary the (x,y) coords so we don't pile all the tokens on top of each other and make them hard to find
                 let tokenData = {
                     name : eActor.name,
                     x: coords.x + (Math.random() * gridSize) - gridSize/2, //adjust position within +/-5,
                     y: coords.y + (Math.random() * gridSize) - gridSize/2, //adjust position within +/-5,
                     hidden: true
                 }
                 //Use the prototype token from the Actors
                 tokenData = mergeObject(actor.data.token, tokenData, {inplace: false});

                 expandedTokenData.push(tokenData);
             }
        }
        return expandedTokenData;
    }

    static async createTokens(expandedTokenData) {
        if (!expandedTokenData) {return null;}
        //TODO: Match the token in the scene based on its data

        //Or re-create them (automatically get added to the scene)
        //Have to also control them in order to add them to the combat tracker
/*TODO: The normal token workflow (see TokenLayer._onDropActorData) includes:
        1. Get actor data from Compendium if that's what you used (this is probably worth doing)
        2. Positioning the token relative to the drop point (whereas we do it relative to a Map Note or previous position)
        3. Randomizing the token image if that is provided in the Prototype Token
*/
        let createdTokens = [];
        for (let tokenData of expandedTokenData) {
            const newToken = await Token.create(tokenData);
            if (newToken) {createdTokens.push(newToken);}
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

        const tabApp = ui.combat;
        tabApp.renderPopout(tabApp);
        //If the tokens are not on the Scene then add them

        //Load the recovered tokens into the combat Tracker
        //Only have to toggle one of them to add all the controlled tokens
        await createdTokens[0].toggleCombat();

        //Now release control of them as a group, because otherwise the stack is hard to see
        for (const token of createdTokens) {
            token.release();
        }

    }


}


//Add a listener for the embedded Encounter button and record the scene if we can
Hooks.on(`renderJournalSheet`, async (journalSheet, html) => {
    if (!game.user.isGM) {return;}

    //If there's an embedded button, then add a listener
    html.find('button[name="addToCombatTracker"]').click(() => {
        QuickEncounter.runFromEmbeddedButton(journalSheet)
    });
});

//The Journal Sheet places a note if there should be one
//It also looks to see if this is the Tutorial and deletes the Journal Entry if so
Hooks.on('closeJournalSheet', async (journalSheet, html) => {
    if (!game.user.isGM) {return;}
    const journalEntry = journalSheet.object;

    if ($("#QuickEncountersTutorial").length) {
        //This is the tutorial Journal Entry
        //v0.4.0 Check that we haven't already deleted this (because onDelete -> close)
        if (game.journal.get(journalEntry.id)) {await JournalEntry.delete(journalEntry.id);}
    } else if (QuickEncounter.extractQuickEncounter(journalSheet)) {
        //If qeScene is non-null, there is a Map Note *somewhere* (might be on a different scene)
        //So in 0.4.1 we recreate a Note if qeScene is null (change from previous versions)
        const qeScene = QuickEncounter.getEncounterScene(journalEntry);
        if (!qeScene) {await EncounterNote.place(journalEntry);}
    }
});


Hooks.on("init", QuickEncounter.init);
Hooks.on('getSceneControlButtons', QuickEncounter.getSceneControlButtons);
