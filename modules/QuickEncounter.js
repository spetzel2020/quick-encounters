import {EncounterNote} from './EncounterNote.js';

export const MODULE_NAME = "quick-encounters";
export const SCENE_ID_FLAG_KEY = "sceneID";
export const TOKENS_FLAG_KEY = "tokens";

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
*/



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

    static setup() {

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
        //Method 1: Get the selected tokens and the scene
        const controlledTokens = Array.from(canvas.tokens.controlled);
        if (controlledTokens && controlledTokens.length) {
            QuickEncounter.create(controlledTokens);
        } else {
            //Method 2: Check for an open Journal with a map note
            const candidateJournalEntry = QuickEncounter.findCandidateJournalEntry();
            if (candidateJournalEntry) {QuickEncounter.runFromJournal(candidateJournalEntry);}
            else {
                ui.notifications.warn(game.i18n.localize("QE.ERROR.HowToUse"));
                throw new Error("Before using the Quick Encounters button either select hostile tokens, or open a Journal with embedded Actors");
            }
        }
    }

    static extractActors(html) {
        const entityLinks = html.find(".entity-link");
        if (!entityLinks || !entityLinks.length) {return null;}

        const extractedActors = [];
        entityLinks.each((i, el) => {
            const element = $(el);
            const prev = element.parent();
            const prevText = prev.text();
            const dataEntity = element.attr("data-entity");
            if (dataEntity === "Actor") {
                const dataID = element.attr("data-id");
                const dataName = element.text();
                const numActors = prevText.match(/(\d+)/);
                extractedActors.push({
                    numActors : numActors ? numActors[0] : null,
                    entityID : dataID,
                    name : dataName
                });
            }
        });

        return extractedActors;
    }

    static findCandidateJournalEntry() {
        if (Object.keys(ui.windows).length === 0) {return null;}
        else {
            let candidateJournal = null;
            let mapNote = null;
            let embeddedActors = [];
            for (let w of Object.values(ui.windows)) {
                //Check open windows for a Journal Sheet with a Map Note and embedded Actors
                if ((w instanceof JournalSheet) && (w.object.sceneNote)) {
                    embeddedActors = QuickEncounter.extractActors(w.element);
                    candidateJournal = w.object;
                    mapNote = candidateJournal.sceneNote;

                    break;
                }
            }

            //Now check that the Journal Entry has embedded Actors
            return {qeJournalEntry: candidateJournal, mapNote : mapNote, embeddedActors : embeddedActors};
        }
    }

    static async runFromJournal({qeJournalEntry, mapNote, embeddedActors}) {
        // This version takes any open Journal with embedded Actors and turns them into tokens at the Journal Entry's map note position
        if (!qeJournalEntry || !mapNote || !embeddedActors.length) {return;}
        //Future might be able to handle not having a mapNote

        const x = mapNote.data.x;
        const y = mapNote.data.y;
        canvas.tokens.activate();
        const controlledTokensData = [];
        for (let eActor of embeddedActors) {
            let numActors = parseInt(eActor.numActors,10);
            const actor = game.actors.get(eActor.entityID);

             //If numActors didn't convert then just create 1 token

             if (!numActors) {numActors = 1;}
             const gridSize = canvas.dimensions.size;
             for (let iActor=1; iActor <= numActors; iActor++) {
                 //Slightly "shake" the (x,y) coords so we don't pile all the tokens on top of each other and make them hard to find
                 let tokenData = {
                     name : eActor.name,
                     x: x + (Math.random() * gridSize) - gridSize/2, //adjust position within +/-5,
                     y: y + (Math.random() * gridSize) - gridSize/2, //adjust position within +/-5,
                     hidden: true
                 }
                 //Use the prototype token from the Actors
                 tokenData = mergeObject(actor.data.token, tokenData, {inplace: false});

                 controlledTokensData.push(tokenData);
             }
        }
        //Add these tokens to the Journal Entry as flags so that we can use createTokens
        await QuickEncounter.addTokenDataToJournalEntry(qeJournalEntry, controlledTokensData);

        //Use the QuickEncounter Journal Entry to create the tokens and add them to the Combat Tracker
        const createdTokens = await QuickEncounter.createTokens(qeJournalEntry);
        await QuickEncounter.createCombat(createdTokens);
    }

    static async create(controlledTokens) {
        //Create a new JournalEntry - the corresponding map note gets created when you save&close the Journal Sheet

        const addToCombatTrackerTitle = game.i18n.localize("QE.BUTTON.AddToCombatTracker");
        const addToCombatTrackerButton = await renderTemplate('modules/quick-encounters/templates/addToCombatTrackerButton.html');
//NOTE: -------- This code chunk should enable us to drag additional encounters or tokens to a single Journal Entry if necessary
//Perhaps you can even include the Actors and modify the number of tokens
        let content = game.i18n.localize("QE.CONTENT.AddADescription");
        controlledTokens.forEach((token, i) => {
            content += `<li>${token.name}</li>`;
        });
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
        await addTokensToJournalEntry(journalEntry, controlledTokens);

        const ejSheet = new JournalSheet(journalEntry);
        ejSheet.render(true);
        //Delete the existing tokens (because they will be replaced)
        controlledTokens.forEach((token, i) => {
            canvas.tokens.delete(token.id);
        });
    }

    static async addTokensToJournalEntry(qeJournalEntry, controlledTokens) {
        //Save an array of token data
        let controlledTokensData = [];
        controlledTokens.forEach((token, i) => {
            controlledTokensData.push(token.data);
        });
        await QuickEncounter.addTokenDataToJournalEntry(qeJournalEntry, controlledTokensData);
    }

    static async addTokenDataToJournalEntry(qeJournalEntry, controlledTokensData) {
        await qeJournalEntry.setFlag(MODULE_NAME, TOKENS_FLAG_KEY, controlledTokensData);
    }

    static hasEncounter(journalEntry) {
        const encounterScene = journalEntry.getFlag(MODULE_NAME, SCENE_ID_FLAG_KEY);
        return encounterScene !== undefined;
    }

    static getEncounterTokensFromJournalEntry(journalEntry) {
        //Recover token data
        let combatTokensData = journalEntry.getFlag(MODULE_NAME,TOKENS_FLAG_KEY);
        return combatTokensData;
    }

    static async createTokens(qeJournalEntry) {
        //Get the scene for this EncounterJournalEntry and view it
        const sceneID = qeJournalEntry.getFlag(MODULE_NAME, SCENE_ID_FLAG_KEY);
        const scene = game.scenes.get(sceneID);
        if (scene) {await scene.view();}

        //Recover token data
        const combatTokensData = QuickEncounter.getEncounterTokensFromJournalEntry(qeJournalEntry);

        //TODO: Match the token in the scene based on its data

        //Or re-create them (automatically get added to the scene)
        //Have to also control them in order to add them to the combat tracker
//FIXME: We are skipping a lot of the normal onDragDrop workflow for an actor, including what looks like scaling
//of the token size to the Scene - need to also test with Token Mold disabled
        let createdTokens = [];
        for (let tokenData of combatTokensData) {
            const newToken = await Token.create(tokenData);
            if (newToken) {createdTokens.push(newToken);}
        }
        return createdTokens;
    }

    static async createCombat(createdTokens) {
        if (!createdTokens || !createdTokens.length) {return;}

        //Control the tokens (because that is checked in adding them to the Combat Tracker)
        await createdTokens.forEach(token => {token.control({releaseOthers : false, updateSight : false});});

        const tabApp = ui.combat;
        tabApp.renderPopout(tabApp);
        //If the tokens are not on the Scene then add them

        //Load the recovered tokens into the combat Tracker
        //Only have to toggle one of them to add all the controlled tokens
        await createdTokens[0].toggleCombat();

        //Now release control of them as a group, because otherwise the stack is hard to see
        await createdTokens.forEach(token => {token.release();});
    }



}


//Add a listener for the embedded Encounter button
Hooks.on(`renderJournalSheet`, async (journalSheet, html) => {
    if (!game.user.isGM) {return;}
    const qeJournalEntry = journalSheet.entity;
    html.find('button[name="addToCombatTracker"]').click(QuickEncounter.createCombat(qeJournalEntry));
});

//The Journal Sheet places a note if there should be one
Hooks.on('closeJournalSheet', async (journalSheet) => {
    if (!game.user.isGM) {return;}
    const journalEntry = journalSheet.object;
    if (QuickEncounter.hasEncounter(journalEntry)) {
        //If you're on the correct scene and the note doesn't exist in this scene, place it
        //NOTE: This will make it hard to delete the Note - we will keep recreating it
        const sceneID = journalEntry.getFlag(MODULE_NAME, SCENE_ID_FLAG_KEY);
        //Note that .sceneNote only returns a note that exists in the viewed scene
        if ((game.scenes.viewed.id === sceneID) && !journalEntry.sceneNote) {
            await EncounterNote.place(journalEntry);
        }
    }
});


Hooks.on("init", QuickEncounter.init);
Hooks.on('setup', QuickEncounter.setup);
Hooks.on('getSceneControlButtons', QuickEncounter.getSceneControlButtons);
