import {QuickEncounter, dieRollReg} from './QuickEncounter.js';

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
*/


export class EncounterCompanionSheet extends FormApplication {
    constructor(quickEncounter, totalXPLine, options = {}) {
        super(options);
        if (!game.user.isGM || !quickEncounter) {return;}

//FIXME: Should be able to get this more directly from the quickEncounter
        //Thie version of the Quick Encounter is what is extracted from in the Journal Entry
        const extractedActors = quickEncounter.extractedActors;
        const extractedActorTokenData = quickEncounter.generateTemplateExtractedActorTokenData();     //this is just sparse array with the correct numbers
        const combinedTokenData = quickEncounter.combineTokenData(extractedActorTokenData);

  
        let combatants = [];
        for (const eActor of extractedActors) {
            const tokens = combinedTokenData.filter(t => t.actorId === eActor.actorID);

            combatants.push({
                numActors : eActor.numActors,
                actorName: eActor.name,             //default
                actorId: eActor.actorID,
                dataPackName : eActor.dataPackName, //non-null if a Compendium entry
                tokens: tokens,
                numType : typeof eActor.numActors
            });
        }

        //Regardless of how we built combatants, fill in derived data for display
        //FIXME: Unclear we can't combine these two loops
        for (const [i,c] of combatants.entries()) {
            if (c.dataPackName) {   //Compendium
                const pack = game.packs.get(c.dataPackName);
                pack.getIndex().then(index => {
                    const entry = index.find(e => e._id === c.actorId)
                    combatants[i].img = entry?.img || CONST.DEFAULT_TOKEN;
                    combatants[i].actorName = entry?.name;
                });
            } else {      //regular actor
                const actor = game.actors.get(c.actorId);
                //0.4.1: 5e specific: find XP for this number of this actor
                const xp = QuickEncounter.getActorXP(actor);
                const xpString = xp ? `(${xp}XP each)`: "";
                combatants[i].img = actor?.img;
                combatants[i].actorName = actor?.name;
                combatants[i].xp = xpString;
            }
        }

        this.quickEncounter = quickEncounter;
        this.combatants = combatants;
        this.totalXPLine = totalXPLine;
        game.users.apps.push(this)
    }


    /** @override  */
    //WARNING: Do not add submitOnClose=true because that will create a submit loop
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id : game.i18n.localize("QE.id"),
            title : game.i18n.localize("QE.Name"),
            template : "modules/quick-encounters/templates/quick-encounters-companion.html",
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

        return buttons;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="addToCombatTracker"]').click(event => {
            this.quickEncounter?.run(event);
        });
    }


    /** @override */
    async getData() {
        return {
           combatants: this.combatants,
           totalXPLine : this.totalXPLine
        };
    }

    /** @override */
    async _updateObject(event, formData) {
        const checkIntReg = /^[0-9]*$/;   
        //Capture changes in the number of Actors or new Actors added (currently not possible through this dialog)
        let wasChanged = false;
        for (let [actorId, numActors] of Object.entries(formData)) {
            let combatantWasChanged = false;
            const iCombatant = this.combatants.findIndex(c => c.actorId === actorId);   //returns -1 if nothing found
            if (iCombatant === -1) {
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

            //If we removed all the Actors, then remove the whole Quick Encounter
            if (extractedActors.length) {
                this.quickEncounter?.update({extractedActors : extractedActors});
            } else {
                this.quickEncounter?.remove();
                //And close this sheet
                this.close();
            }
        }


//TODO: Capture tokens removed


    }



}//end class EncounterCompanionSheet
