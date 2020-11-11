import {QuickEncounter, MODULE_NAME, COMBATANTS_FLAG_KEY} from './QuickEncounter.js';

/*
Reused as EncounterCompanionSheet
15-Oct-2020     Re-created
9-Nov-2020      v0.6.1d: Change constructor to take combinedTokenData (will be a template for actor-generated data)
10-Nov-2020     v0.6.1e: Pass quickEncounter so we can key off extracted Actors not tokens
                v0.6.1f: Change Close to Cancel in dialog (to show it doesn't save) - use i18n tags
11-Nov-2020     v0.6.1g: Remove journalSheet from constructor                
*/


export class EncounterCompanionSheet extends FormApplication {
    constructor(quickEncounter, totalXPLine, options = {}) {
        super(options);
        if (!game.user.isGM || !quickEncounter) {return;}

        //This version comes from the flags (this also uses the savedTokenData)
        const savedTokensData = quickEncounter.savedTokensData;
        const combatantsFromQuickEncounter = quickEncounter.combatants;
//FIXME: This should all be encapsulated in extractQuickEncounter
        //Thie version of the Quick Encounter is what is extracted from in the Journal Entry
        const extractedActors = quickEncounter.extractedActors;
        const extractedActorTokenData = quickEncounter.extractedActorTokenData;     //this is just sparse array with the correct numbers
        const combinedTokenData = QuickEncounter.combineTokenData(extractedActors, extractedActorTokenData, savedTokensData);

        //v0.6.1: If combatantsFromQuickEncounter is already set, then use that
        let combatants = [];
        if (combatantsFromQuickEncounter && combatantsFromQuickEncounter.length) {
            combatants = combatantsFromQuickEncounter;
//FIXME: We need a way of generating the tokens             
        } else {
            for (const eActor of extractedActors) {
                const tokens = combinedTokenData.filter(t => t.actorId === eActor.actorID);

                combatants.push({
                    numActors : eActor.numActors,
                    actorId: eActor.actorID,
                    tokens: tokens
                });
            }
        }

        //Regardless of how we built combatants, fill in derived data for display
        combatants?.forEach((c, i) => {
            const actor = game.actors.get(c.actorId);
            //0.4.1: 5e specific: find XP for this number of this actor
            const xp = QuickEncounter.getActorXP(actor);
            const xpString = xp ? `(${xp}XP each)`: "";
            combatants[i].img = actor?.img;
            combatants[i].actorName = actor?.name;
            combatants[i].xp = xpString;
            combatants[i].numType = typeof c.numActors;
        });

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
        html.find('button[name="addToCombatTracker"]').click(() => {
            QuickEncounter.run(this.quickEncounter);
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
//FIXME: Implement this to save changes to stored tokens etc in the Journal Sheet
        //Capture changes in the number of Actors or new Actors added
        let wasChanged = false;
        for (const [actorId, numActors] of Object.entries(formData)) {
            let combatantWasChanged = false;
            const iCombatant = this.combatants.findIndex(c => c.actorId === actorId);
            if (iCombatant === null) {
                //New combatant
                combatantWasChanged = true;
                
            } else {
                combatantWasChanged = (this.combatants[iCombatant].numActors !== numActors);
                if (combatantWasChanged) {this.combatants[iCombatant].numActors = numActors;}
            }
            wasChanged = wasChanged || combatantWasChanged;
        }

        //If wasChanged, then update the info into JE flags
        if (wasChanged) {
            await this.quickEncounter?.journalEntry?.setFlag(MODULE_NAME, COMBATANTS_FLAG_KEY, this.combatants);
        }


//TODO: Capture tokens removed


    }



}//end class EncounterCompanionSheet
