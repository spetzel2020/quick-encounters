import {QuickEncounter} from './QuickEncounter.js';

/*
Reused as EncounterCompanionSheet
15-Oct-2020     Re-created
9-Nov-2020      v0.6.1d: Change constructor to take combinedTokenData (will be a template for actor-generated data)
10-Nov-2020     v0.6.1e: Pass quickEncounter so we can key off extracted Actors not tokens
                v0.6.1f: Change Close to Cancel in dialog (to show it doesn't save) - use i18n tags
*/


export class EncounterCompanionSheet extends FormApplication {
    constructor(journalSheet, quickEncounter, totalXPLine, options = {}) {
        super(options);
        if (!game.user.isGM || !quickEncounter) {return;}

        const extractedActors = quickEncounter.extractedActors;
        const extractedActorTokenData = quickEncounter.extractedActorTokenData;     //this is just sparse array with the correct numbers
        const savedTokensData = QuickEncounter.getSavedTokensData(quickEncounter);
        const combinedTokenData = QuickEncounter.combineTokenData(extractedActors, extractedActorTokenData, savedTokensData);

        let combatants = [];
        for (const eActor of extractedActors) {
            const actor = game.actors.get(eActor.actorID);
            const tokens = combinedTokenData.filter(t => t.actorId === eActor.actorID);
            //0.4.1: 5e specific: find XP for this number of this actor
            const xp = QuickEncounter.getActorXP(actor);
            const xpString = xp ? `(${xp}XP each)`: "";
            combatants.push({
                num : eActor.numActors,
                numType : typeof eActor.numActors,
                name : actor.name,
                actorId: eActor.actorID,
                xp : xpString,
                img: actor.img,
                tokens: tokens,
                actorName: actor.name //tokens[0].actor?.data?.token?.name
            });
        }

        this.journalSheet = journalSheet;
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
            width : 510,
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
            QuickEncounter.runFromEmbeddedButton(this.journalSheet);
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
        //Capture changes in the number of Actors
        for (const [actorId, numActors] of Object.entries(formData)) {
            const iCombatant = this.combatants.findIndex(c => c.actorId === actorId);
            if (iCombatant !== null) {this.combatants[iCombatant].numActors = numActors;
        }

        //TODO: Capture new Actors added

        //TODO: Capture tokens removed

        
    }



}//end class EncounterCompanionSheet
