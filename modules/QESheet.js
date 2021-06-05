import {QuickEncounter, dieRollReg, QE} from './QuickEncounter.js';

/*
Reused as EncounterCompanionSheet
15-Oct-2020     Re-created
9-Nov-2020      v0.6.1d: Change constructor to take combinedTokenData (will be a template for actor-generated data)
10-Nov-2020     v0.6.1e: Pass quickEncounter so we can key off extracted Actors not tokens
                v0.6.1f: Change Close to Cancel in dialog (to show it doesn't save) - use i18n tags
11-Nov-2020     v0.6.1g: Remove journalSheet from constructor    
14-Nov-2020     v0.6.1l: If you change the # Actors to 0, remove the Actor completely
15-Nov-2020     v0.6.1m: Pass event from clicking Run
                v0.6.1n: If we removed all the Actors, then remove the whole Quick Encounter
16-Nov-2020     v0.6.3b: Make "number" field a String so we can handle die rolls, a number, and nothing (which means remove the actor)                
                         Add validation and warning if you make a mistake
27-Nov-2020     v0.6.7b: Display compendium info in Companion dialog           
28-Nov-2020     v0.6.8: Use combinedTokensData on each extractedActor; that way we don't have to separate it
                        (but still have to support the pre-0.6 method where it isn't associated with the actor)       
                        combatants, updateObject(): Add rowNum to distinguish between same actorId instances
30-Nov-2020     v0.6.9c: Add get id() so that we get unique identifer for the companion sheet   
1-Dec-2020      v0.6.10: Move calculation/updating of combatants for display to getData() so it is re-rendered after update  
                         Remove passing totalXPLine because it has to be updated as you add/remove combatants     
                v0.6.11: update(): Update to new quickEncounter   
14-Jan-2021     0.7.0c: REnamed to QESheet       
16-Jan-2021     0.7.0d: Show a thumbnail of any saved tiles   
19-Jan-2021     0.7.0f: On hover, show a - and Remove [name] for both Actors and Tiles       
6-Feb-2021      0.7.3b: Put a Hide QE button on the QE dialog
15-Mar-2021     0.8.0a: Proper Compendium Support
                        - See if you can get image info directly from the Compendium index; computeCombatantsForDisplay() now awaits on pack.getIndex
31-Mar-2021     0.8.0b: If you're looking at a Compendium, pop a read-only QESheet                        
        
*/


export class QESheet extends FormApplication {
    constructor(quickEncounter, options = {}) {
        super(options);
        if (!game.user.isGM || !quickEncounter) {return;}
        this.quickEncounter = quickEncounter;

        game.users.apps.push(this)
    }

    /** @override */
//FIXME: Probably would be better to reference the Journal Entry this is for    
	get id() {
	    return `${QE.MODULE_NAME}-${this.appId}`;
    }

    update(quickEncounter) {
        if (quickEncounter) this.quickEncounter = quickEncounter;
    }

    /** @override  */
    //WARNING: Do not add submitOnClose=true because that will create a submit loop
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            //no longer setting id here because it gives the same element all the time- override get id() so we can have multiple QE JEs open
            title : game.i18n.localize("QE.Name"),
            template : "modules/quick-encounters/templates/qe-sheet.html",
            closeOnSubmit : false,
            submitOnClose : false,
            popOut : true,
            width : 530,
            height : "auto"
        });
    }


    /** @override */
    async _render(force, options={}) {
        return super._render(force, options);
    }

    /** @override */
    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        let closeButtonIndex = buttons.findIndex(button => button.label === game.i18n.localize("Close"));
        if (closeButtonIndex !== null) {
            buttons[closeButtonIndex].label = game.i18n.localize("Cancel");
        }
        //0.7.3b: Add a Hide QE button in case you don't want to see this particular one
        buttons.unshift({
            label: "QE.JEBorder.HideQE",
            class: "hideQE",
            icon: "fas fa-fist-raised",
            onclick: async ev => {
                //Toggle the default to not show from now on (you'll have to click the Show button in the JE)
                this.quickEncounter.hideQE = true;
                this.quickEncounter.serializeIntoJournalEntry();
                this.close();
            }
        });
        return buttons;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.object?.isFromCompendium) {
            html.find('button[name="addToCombatTracker"]').click(event => {
                this.quickEncounter?.run(event);
            });
            //0.7.0: Listeners for when you click - in actor or tile
            html.find("#QEContainers .actor-container").each((i, thumbnail) => {
                //thumbnail.setAttribute("draggable", true);
                //thumbnail.addEventListener("dragstart", this._onDragStart, false);
                thumbnail.addEventListener("click", this._onClickActor.bind(this));
            });
            html.find("#QEContainers .tile-container").each((i, thumbnail) => {
                //thumbnail.setAttribute("draggable", true);
                //thumbnail.addEventListener("dragstart", this._onDragStart, false);
                thumbnail.addEventListener("click", this._onClickTile.bind(this));
            });
        }
    }




    /** @override */
    async getData() {
        //v0.6.10: Because the qeDialog is not (now) being re-created each time, instead we have to recompute combatants here
        await this.computeCombatantsForDisplay();

        //We don't have to store totalXPLine, but this.combatants needs to be referenced in _updateData()
        return {
           combatants: this.combatants,
           tilesData: this.quickEncounter?.savedTilesData,
           totalXPLine : this.totalXPLine,
           isFromCompendium : this.object?.isFromCompendium
        };
    }

    async computeCombatantsForDisplay() {
        //This version of the Quick Encounter is what is extracted from in the Journal Entry
        this.quickEncounter.generateTemplateExtractedActorTokenData();     //this is just sparse array with the correct numbers
        this.quickEncounter.combineTokenData();

        let combatants = [];
        if (this.quickEncounter.extractedActors) {
            for (const [i,eActor] of this.quickEncounter.extractedActors.entries()) {
                const combatant = {
                    rowNum : i,
                    numActors : eActor.numActors,
                    actorName: eActor.name,             //default
                    actorId: eActor.actorID,
                    dataPackName : eActor.dataPackName, //non-null if a Compendium entry
                    tokens: eActor.combinedTokensData,
                    numType : typeof eActor.numActors
                }

                if (eActor.dataPackName) {   
                    //Compendium: for display just use the index (can only get name, id, index)
                    const pack = game.packs.get(eActor.dataPackName);
                    //0.8.0a: Block on getting the name and image information, fortunately from the index
                    //FIXME: Probably could be improved by getting all the indexes in one group so not doing this multiple times for the same index
                    const index = await pack.getIndex();
                    const entry = index.find(e => e._id === combatant.actorId);
                    combatant.img = entry?.img || CONST.DEFAULT_TOKEN;
                    combatant.actorName = entry?.name;
                } else {      //regular actor
                    const actor = game.actors.get(eActor.actorID);
                    //0.4.1: 5e specific: find XP for this number of this actor
                    const xp = QuickEncounter.getActorXP(actor);
                    const xpString = xp ? `(${xp}XP each)`: "";
                    combatant.img = actor?.img;
                    combatant.actorName = actor?.name;
                    combatant.xp = xpString;
                }

                combatants.push(combatant);
            }
        }

        this.combatants = combatants;
        this.totalXPLine = this.quickEncounter.renderTotalXPLine();
    }

    /** @override */
    async _updateObject(event, formData) {
        const checkIntReg = /^[0-9]*$/;   
        //Capture changes in the number of Actors or new Actors added (currently not possible through this dialog)
        let wasChanged = false;
        for (let [rowNum, numActors] of Object.entries(formData)) {
            let combatantWasChanged = false;
            const iCombatant = rowNum;
            if (iCombatant >= this.combatants.length) {
                //New combatant
                combatantWasChanged = true;
                
            } else {
                numActors = numActors.trim();   //trim off whitespace
                combatantWasChanged = (this.combatants[iCombatant].numActors !== numActors);
                if (combatantWasChanged) {
                    //Validate that the change is ok
                    //Option 1: You cleared the field or spaced it out
                    if ((numActors === null) || (numActors === "")) {
                        this.combatants[iCombatant].numActors = 0;
                    } else if (dieRollReg.test(numActors)) {
                        //Option 2: This is a dice roll (not guaranteed because it could just contain a dieRoll)
                        this.combatants[iCombatant].numActors = numActors;
                    } else if (checkIntReg.test(numActors)) {
                        const multiplier = parseInt(numActors,10);
                        if (!Number.isNaN(multiplier)) {
                             this.combatants[iCombatant].numActors = multiplier;
                        }
                       
                    } else {
                        //otherwise leave unchanged - should pop up a dialog or highlight the field in red
                        const warning = game.i18n.localize("QE.QuickEncounterDialog.InvalidNumActors.WARNING") + " " + numActors;
                        ui.notifications.warn(warning);
                    }
                }
            }
            wasChanged = wasChanged || combatantWasChanged;
        }

        //If wasChanged, then update the info into the Quick Encounter
        if (wasChanged) {
            this._onChange();
        }
//TODO: Capture tokens removed
    }

    //0.7.0 Split off changed check so that we can call it from the clicking the - on an Actor or Tile
    async _onChange() {
        //Reconstitute extractedActors and update it, removing those with numActors=0
        //Accept any non-numeric; blank has been replaced with 0
        const extractedActors = this.combatants.filter(c => (typeof c.numActors !== "number") || (c.numActors > 0)).map(c => {
            return {
                numActors : c.numActors,
                dataPackName : c.dataPackName, //if non-null then this is a Compendium reference
                actorID : c.actorId,           //If Compendium sometimes this is the reference
                name : c.actorName,
                savedTokensData : c.tokens.filter(td => td.isSavedToken)
            }
        });
        //0.6.1o: The saved tokens for a removed ExtractedActor will now be discarded also

        //If we removed all the Actors and (0.7.0) all the Tiles, then remove the whole Quick Encounter
        if (extractedActors.length || this.quickEncounter?.savedTilesData?.length) {
            this.quickEncounter?.update({extractedActors : extractedActors});
        } else {
            this.quickEncounter?.remove();
            //And close this sheet
            this.close();
        }
    }

    _onClickActor(event) {
        event.stopPropagation();

        const srcClass = event.srcElement.classList.value;
        const isPortrait = srcClass === "actor-portrait";
        const isHoverIcon = (srcClass === "actor-subtract") || (srcClass === "fas fa-minus");
        if ((isPortrait) || (isHoverIcon)) {
            const rowNum = event.srcElement.id;

            //Handle this by clearing the appropriate combatant field and re-rendering
            if ((rowNum >= 0) && (rowNum < this.combatants.length)) {
                this.combatants.splice(rowNum,1);
            }
            this._onChange();
        }
    }
    _onClickTile(event) {
        event.stopPropagation();

        const srcClass = event.srcElement.classList.value;
        const isPortrait = srcClass === "actor-portrait";
        const isHoverIcon = (srcClass === "actor-subtract") || (srcClass === "fas fa-minus");
        if ((isPortrait) || (isHoverIcon)) {
            const rowNum = event.srcElement.id;

            //Handle this by clearing the appropriate combatant field and re-rendering
            if ((rowNum >= 0) && (rowNum < this.quickEncounter?.savedTilesData.length)) {
                this.quickEncounter.savedTilesData.splice(rowNum,1);
            }
            this._onChange();
        }
            
    }


}//end class QESHeet


