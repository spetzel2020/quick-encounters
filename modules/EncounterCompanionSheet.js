import {MODULE_NAME} from './QuickEncounter.js';

/*
Reused as EncounterCompanionSheet
15-Oct-2020     Re-created

*/


export class EncounterCompanionSheet extends Application {
    constructor(combatants, options = {}) {
        super(options);
        if (!game.user.isGM) {return;}
        this.combatants = combatants;

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
        let closeButtonIndex = buttons.findIndex(button => {return button.label === "Close";});
        if (closeButtonIndex) {
            buttons[closeButtonIndex].label = "Save & Close";
        }

        return buttons;
    }


    /** @override */
    async getData() {
        return {
           combatants: this.combatants
        };
    }

    /** @override */
    async _updateObject(event, formData) {
        return super._updateObject(event, formData);
    }



}//end class EncounterCompanionSheet
