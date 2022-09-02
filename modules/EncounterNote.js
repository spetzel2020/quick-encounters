import {QuickEncounter, QE, Dialog3} from './QuickEncounter.js';
/*
Extend the placeable Map Note - select the desired tokens and then tap the Quick Encounters button
Subsequently can add: (a) Drag additional tokens in, (b) populate the Combat Tracker when you open the note?
27-Aug-2020   Created
30-Aug-2020   Added EncounterNoteConfig
13-Sep-2020    QuickEncounter.deleteNote moved/renamed to EncounterNote.delete
                QuickEncounter.placeNote moved/renamed to EncounterNote.place
                Fixed flow of deleteJournalEntry --> delete associated Note
14-Sep-2020     Display simple dialog when you delete the Map Note corresponding to a Quick Encounter Journal Entry
15-Sep-2020     v0.4.0 i18n for deleting Journal Note
                v0.4.1 delete() - rewrite for getEncounterScene returning the scene not the ID
16-Sep-2020     v0.4.1 place() - if there aren't token coords, and option=placeDefault, then place a map note in the center
21-Sep-2020     v0.4.2: BUG: Dialog.prompt doesn't exist in Foundry 0.6.6 - replace with our own
26-Sep-2020     v0.5.0: Use QuickEncounter.switchToMapNoteScene
27-Sep-2020     v0.5.0: Bypass the Note Config sheet - just create it and allow for updating later
                v0.5.0: NYI: Base code for Hook on renderNoteCOnfig to change it to look like a QE Note (but need a way of determining a QE Note)
9-Nov-2020      v0.6.1: Refactor Map Note related functions here: switchToMapNoteScene(), noMapNoteDialog(), mapNoteIsPlaced()
15-Nov-2020     v0.6.2: Refactor to use quickEncounter rather than journalEntry
2-Dec-2020      v0.6.12: Test parameterization of i18n strings, using Localization.format() (but be backward compatible)
7-Dec-2020      v0.6.13: delete(): Delete ALL of the Notes (in this or other Scenes) associated with the delete journal Entry
                        EncounterNote.create() and .place() return newNote so that we can store that in the quickEncounter before serialization
                        Expand the available list of Note icons (perhaps would be good to have a Setting to allow/disallow this)
8-Aug-2021      0.8.3a: If Foundryv8 then don't do Note deletion in the current scene because new Journal._onDelete() method takes care of that  
                        (although because of https://gitlab.com/foundrynet/foundryvtt/-/issues/5700 this won't work at all currently)  
15-Nov-2021     v0.9.1b: Issue #57 Reintroduce deleltion of notes; doesn't seem to be handled in Foundry 0.8.9     
6-Dec-2021      0.9.3a: Check for Foundry 0.9 OR 0.8   
15-Dec-2021     0.9.3f: EncounterNote.create(): Check/fix deprecation warning by using canvas.scene.embeddedDocuments()      
21-Dec-2021     0.9.5a: Use QuickEncounter.isFoundryV8Plus test   
17-Feb-2022     1.0.1a: Add Hook on dropCanvasData to intercept creation of Notes for Quick Encounters      
26-Feb-2022     1.0.1d: checkForInstantEncounter(): pass new options variable with IE information to QuickEncounter.run()  
3-Mar-2022     1.0.1f: Fixed #84 delete(): corrected to use deleteEmbeddedDocuments()              
4-May-2022      1.0.2b: Fixed: Misspelled poison.svg in moreNoteIcons
31-Aug-2022     1.0.4k: Get parent JournalEntry for JournalEntryPage (because Notes are associated with Journal Entries)
1-Sep-2022      1.0.4k: Move getEncounterScene() to EncounterNote from QuickEncounter
                Check journalEntry to see if we should be looking at parent\
                Also in mapNoteIsPlaced
                1.0.4l: place(): Use canvas.stage.hitArea in v10
                delete(): More deprecation warnings
                create(): Typo in entryId
*/

//Expand the available list of Note icons
const moreNoteIcons = {
    "Acid" : "icons/svg/acid.svg",
    "Angel" : "icons/svg/angel.svg",
    "Aura" : "icons/svg/aura.svg",
    "Blind" : "icons/svg/blind.svg",
    "Blood" : "icons/svg/blood.svg",
    "Bones" : "icons/svg/bones.svg",
    "Circle" : "icons/svg/circle.svg",
    "Clockwork" : "icons/svg/clockwork.svg",
    "Combat" : "icons/svg/combat.svg",
    "Cowled" : "icons/svg/cowled.svg",
    "Daze" : "icons/svg/daze.svg",
    "Deaf" : "icons/svg/deaf.svg",
    "Direction" : "icons/svg/direction.svg",
    "Door-Closed" : "icons/svg/door-closed.svg",   
    "Door-Exit" : "icons/svg/door-exit.svg",    
    "Down" : "icons/svg/down.svg",
    "Explosion" : "icons/svg/explosion.svg",
    "Eye" : "icons/svg/eye.svg",
    "Falling" : "icons/svg/falling.svg",    
    "Frozen" : "icons/svg/frozen.svg",
    "Hazard" : "icons/svg/hazard.svg",
    "Heal" : "icons/svg/heal.svg",
    "Holy Shield" : "icons/svg/holy-shield.svg",
    "Ice Aura" : "icons/svg/ice-aura.svg",
    "Lightning" : "icons/svg/lightning.svg",
    "Net" : "icons/svg/net.svg",
    "Padlock" : "icons/svg/padlock.svg",   
    "Paralysis" : "icons/svg/paralysis.svg",
    "Poison" : "icons/svg/poison.svg",
    "Radiation" : "icons/svg/radiation.svg",
    "Sleep" : "icons/svg/sleep.svg",
    "Sound" : "icons/svg/sound.svg",  
    "Sun" : "icons/svg/sun.svg",
    "Terror" : "icons/svg/terror.svg",   
    "Up" : "icons/svg/up.svg",
    "Wing" : "icons/svg/wing.svg"      
}
Object.assign(CONFIG.JournalEntry.noteIcons, moreNoteIcons);



export class EncounterNoteConfig extends NoteConfig {
    /** @override  */
    //WARNING: Do not add submitOnClose=true because that will create a submit loop
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : "encounter-note-config",
            title : game.i18n.localize( "QE.Config.TITLE")
        });
    }
}

export class EncounterNote {
    static async create(quickEncounter, noteAnchor) {
        if (!quickEncounter) {return;}

        const journalEntry = quickEncounter.journalEntry;
        //1.0.4k: Use parent (which is what is saved to the map) is this is JournalEntryPage
        const parentJournalEntry = (journalEntry instanceof JournalEntryPage) ? journalEntry.parent : journalEntry;
        // Create Note data
        const noteData = {
              entryId: parentJournalEntry.id,
              x: noteAnchor.x,
              y: noteAnchor.y,
              icon: CONFIG.JournalEntry.noteIcons.Combat,
              iconSize: 80,
              iconTint: "#FF0000",  //Red
              //Don't specify the name so it inherits from the Journal
              textAnchor: CONST.TEXT_ANCHOR_POINTS.TOP,
              fontSize: 24
        };

        //v0.5.0: Switch to Note.create() to bypass the Note dialog
        //This is different from the JournalEntry._onDropData approach
        //0.9.3f: Remove deprecation warning by using createEmbeddedDocuments()
        let newNote = QuickEncounter.isFoundryV8Plus ? await canvas.scene.createEmbeddedDocuments("Note",[noteData]) : await Note.create(noteData);
        //1.0.2c: createEmbeddedDocuments returns an array, and we just want a single element
        if (Array.isArray(newNote)) {newNote = newNote[0];}
        newNote._sheet = new EncounterNoteConfig(newNote);
        return newNote;
    }

    static async delete(journalEntry) {
        //1.0.4k: This should always be a real parent JournalEntry
        
        if (!game.user.isGM) {return;}
        //Create filtered array of matching Notes for each scene
        let matchingNoteIds;
        let numNotesDeleted = 0;
        for (const scene of game.scenes) {
            if (QuickEncounter.isFoundryV10) {
                matchingNoteIds = Array.from(scene.notes?.values()).filter(nd => nd.entryId === journalEntry.id).map(note => note.id);
            } else if (QuickEncounter.isFoundryV8Plus) {
                matchingNoteIds = Array.from(scene.data.notes.values()).filter(nd => nd.data.entryId === journalEntry.id).map(note => note.id);
            } else {
                matchingNoteIds = scene.data.notes.filter(nd => nd.entryId === journalEntry.id).map(note => note._id);
            }
            if (!matchingNoteIds?.length) {continue;}
            //Deletion is triggered by Scene (because that's where the notes are stored)
            //v0.8.3a: If Foundry v0.8.x then don't delete the Note in the viewed Scene because the Journal._onDelete() trigger does that
            //v0.9.1b: Issue #57 Reintroduce deleltion of notes; doesn't seem to be handled in Foundry 0.8.9
            scene.deleteEmbeddedDocuments("Note", matchingNoteIds);
            numNotesDeleted += matchingNoteIds.length;
        }

        if (numNotesDeleted) {
            //0.4.2: Replaces Dialog.prompt from Foundry 0.7.2
            EncounterNote.dialogPrompt({
                title: game.i18n.localize("QE.DeletedJournalNote.TITLE"),
                content: game.i18n.format("QE.DeletedJournalNote.Multiple.CONTENT",{numNotesDeleted}),
                label : "",
                callback : () => {console.log(`Deleted ${numNotesDeleted} Map Note(s)`);},
                options: {
                top:  window.innerHeight - 350,
                left: window.innerWidth - 720,
                width: 400,
                jQuery: false
                }
            });
        }

    }

    static dialogPrompt({title, content, label, callback}={}, options={}) {
        return new Promise(resolve => {
          const dialog = new Dialog({
            title: title,
            content: content,
            buttons: {
              close: {
                icon: '<i class="fas fa-check"></i>',
                label: label,
                callback: callback
              }
            },
            default: "close",
            close: resolve
          }, options);
          dialog.render(true);
        });
    }

    static async place(quickEncounter, options={}) {
        if (!quickEncounter) {return;}
        let qeNote = null;
        //Create a Map Note for this encounter - the default is where the saved Tokens were
        let noteAnchor = {}
        if (quickEncounter.coords) {
            noteAnchor = {
                x: quickEncounter.coords.x,
                y: quickEncounter.coords.y
            }
        } else if (options.placeDefault) {
            //Otherwise, place it in the middle of the canvas stage (current view)
            noteAnchor = {
                x : canvas.stage.pivot.x,
                y : canvas.stage.pivot.y
            }
        } else {return;}
        // Validate the final position is in-bounds
        //1.0.4l: Use canvas.stage.hitArea in v10
        const hitArea = QuickEncounter.isFoundryV10 ? canvas.stage.hitArea : canvas.grid.hitArea;
        if (hitArea.contains(noteAnchor.x, noteAnchor.y)) {
            // Create a Note; we don't pop-up the Note sheet because we really want this Note to be placed
            //(they can always edit it afterwards)
            qeNote = await EncounterNote.create(quickEncounter, noteAnchor);
        }
        return qeNote;
    }

    static getEncounterScene(journalEntry) {
        if (!journalEntry) {return null;}
        //1.0.4k: Use parent (which is what is saved to the map) is this is JournalEntryPage
        const parentJournalEntry = (journalEntry instanceof JournalEntryPage) ? journalEntry.parent : journalEntry;
        //if sceneNote is available, then we're in the Note Scene already
        if (parentJournalEntry.sceneNote) {return game.scenes.viewed;}
        else {          
            //Now we need to search through the available scenes to find a note with this Journal Entry
            for (const scene of game.scenes) {
                let notes;
                if (QuickEncounter.isFoundryV10) {
                    notes = scene.notes;
                } else {
                    notes = scene.data.notes;
                }
                let foundNote;
                if (QuickEncounter.isFoundryV10) {
                    foundNote = Array.from(notes.values()).find(nd => nd.entryId === parentJournalEntry.id);
                } else if (QuickEncounter.isFoundryV8Plus) {
                    foundNote = Array.from(notes.values()).find(nd => nd.data.entryId === parentJournalEntry.id);
                } else {
                    foundNote = notes.find(note => note.entryId === parentJournalEntry.id);
                }
                if (foundNote) {
                    return scene;
                }
            }
        }
        return null;
    }

    static async switchToMapNoteScene(qeScene, qeJournalEntry) {
        if (!qeScene) {return null;}
        await qeScene.view();
        //bail out if the Map Note hasn't been placed after 2s
        let timer = null;
        for (let count=0; count<10; count++) {
            timer = setTimeout(() => {},200);
            if (qeJournalEntry.sceneNote) {break;}
        }
        clearTimeout(timer);
        return qeJournalEntry.sceneNote;
    }

    //1.0.2c: Changed to sync operation (only called if there is no map note when you run)
    static noMapNoteDialog(quickEncounter) {
        Dialog.confirm({
            title: game.i18n.localize("QE.NoMapNote.TITLE"),
            content : game.i18n.localize("QE.NoMapNote.CONTENT"),
            yes : () => {
                EncounterNote.place(quickEncounter, {placeDefault : true});
                return true;
            }
        });
    }

    static async mapNoteIsPlaced(qeScene, journalEntry) {
        //Get the scene for this Quick Encounter (can't use sceneNote if we're in the wrong scene)
        if (!qeScene || !journalEntry) {return false;}
        //1.0.4k: Use parent (which is what is saved to the map) is this is JournalEntryPage
        const parentJournalEntry = (journalEntry instanceof JournalEntryPage) ? journalEntry.parent : journalEntry;
        //If we're viewing the relevant scene and the map note was placed, then good
        if (parentJournalEntry.sceneNote) {return true;}

        //Otherwise ask if you want to switch to the scene - default is No/false
        let shouldSwitch = false;
        //v0.6.12: Testing parameterization of i18n strings, using Localization.format()
        // If there is an 0612 version use that with a parameter, otherwise there isn't a parameter yet and we do it the pre-0.6.12 way
        let content; 
        if (game.i18n.has("QE.SwitchScene.CONTENT_v0612", false)) {
            content = game.i18n.format("QE.SwitchScene.CONTENT_v0612", {sceneName : qeScene.name});
        } else {
            content = game.i18n.localize("QE.SwitchScene.CONTENT") + qeScene.name + "?";
        }
        await Dialog.confirm({
            title: game.i18n.localize("QE.SwitchScene.TITLE"),
            content : content,
            //0.5.0 Need the Yes response to wait until we are in the correct scene (so don't make it async)
            //and in particular, the Journal Note has been drawn
            yes : () => {shouldSwitch = true},
            no : () => {shouldSwitch = false}
        });
        if (shouldSwitch) {return EncounterNote.switchToMapNoteScene(qeScene, parentJournalEntry);}
        else {return false;}
    }

    static async checkForInstantEncounter(quickEncounter, qeAnchor) {
        //already confirmed that the setting is there
        const dialogData = {
            title: game.i18n.localize("QE.CheckInstantEncounter.TITLE"),
            content : game.i18n.localize("QE.CheckInstantEncounter.CONTENT"),
            button1cb : (html, event) => {
                const options = {
                    isInstantEncounter : true,
                    qeAnchor: qeAnchor
                }
                quickEncounter.run(event, options) 
            },
            button2cb : () => EncounterNote.create(quickEncounter, qeAnchor),
            button3cb : null,
            buttonLabels :  [game.i18n.localize("QE.CheckInstantEncounter.BUTTON.RUN_INSTANT"),
                            game.i18n.localize("QE.CheckInstantEncounter.BUTTON.CREATE_QE"),""],
            options : {}
        }

        Dialog3.buttons3(dialogData);
    }


}

//Delete any corresponding Map Notes if you delete the Journal Entry
Hooks.on("deleteJournalEntry", EncounterNote.delete);

//Pretty up the first Map Note (hopefully we can do the same for others)
Hooks.on(`renderEncounterNoteConfig`, async (noteConfig, html, data) => {
    const updateEncounterMapNote = game.i18n.localize("QE.UpdateEncounterMapNote.BUTTON");
    html.find('button[name="submit"]').text(updateEncounterMapNote);
});

//1.0.1: Instant Encounters - intercept Note creation and check if it's an Instant Encounter (initially with a dialog)
//If you drag a Quick Encounter Journal Entry to the Scene, then intercept it to render it similarly,
//and also ask about Instant Encounters
//Note that intercepting preCreateNoteDocument is too late because we are approving the preview at that point
//and renderNoteConfig it's too difficult to change the form of the Note
Hooks.on(`dropCanvasData`, (canvas, data) => {
    //Try to leave quickly if this isn't a Journal Entry
    if (data?.type !== "JournalEntry") {return true;}
    //Or if it isn't a Quick Encounter
    //This is a hack because we're basically replicating canvas.notes._onDropData()
    // Acquire Journal entry 
    //- because it's async and this hook can't be (otherwise it prematurely returns true and creates a preview) use .then chaining
    console.info("Replacing ")
    JournalEntry.fromDropData(data).then(s => {
            let journalEntry = s;
            if ( journalEntry.compendium ) {
                const journalData = game.journal.fromCompendium(journalEntry);
                journalEntry = JournalEntry.implementation.create(journalData);
            }
            //Get the world-transformed drop position - fortuantely these have already been placed in (data.x,data.y) by Canvas._onDrop
            const noteAnchor = {x: data?.x, y: data?.y}

            const quickEncounter = QuickEncounter.extractQuickEncounterFromJEOrEmbedded(journalEntry);
            if (quickEncounter) {
                //Confirmed this is a Quick Encounter
                //If we're checking for Instant Encounters, then pop a dialog
                if (game.settings.get(QE.MODULE_NAME, "checkForInstantEncounter")) {
                    EncounterNote.checkForInstantEncounter(quickEncounter, noteAnchor);
                } else {
                    EncounterNote.create(quickEncounter, noteAnchor);
                }
            } else {
                //create a normal Journal Entry Note
                const noteData = {entryId: journalEntry.id, x: noteAnchor.x, y: noteAnchor.y}
                //Another hack - because we don't have event we recover the raw drop location
                const clientX = (noteAnchor.x * canvas.stage.scale.x) + canvas.notes.worldTransform.tx;
                const clientY = (noteAnchor.y * canvas.stage.scale.y) + canvas.notes.worldTransform.ty;
                return canvas.notes._createPreview(noteData, {top: clientY - 20, left: clientX + 40});
            }
    });

    return false;   // we're replacing Journal Note creation entirely
});
