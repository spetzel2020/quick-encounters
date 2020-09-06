import {MODULE_NAME} from './QuickEncounter.js';
import {EncounterNote} from './EncounterNote.js';


/*
Extend the placeable Map Note - select the desired tokens and then tap the Quick Encounters button
Subsequently can add: (a) Drag additional tokens in, (b) populate the Combat Tracker when you open the note?
31-Aug-2020   Created
2-Sep-2020      Make EncounterJournalSheet the default sheet for JournalEntry

*/


export class EncounterJournalSheet extends JournalSheet {
    constructor(journalEntry, options) {
        //This is the standard constructor that just passes through to JournalSheet
        super(journalEntry, options);
    }

    static createEJS(journalEntry, selectedTokens, options) {
        //and this factory is used when we create an Encounter Journal using the Quick Encounter buttons
        let eJournalSheet = new EncounterJournalSheet(journalEntry, options);
        eJournalSheet.selectedTokens = selectedTokens;
        return eJournalSheet;
    }

    /** @override */
    async _render(force, options={}) {
        return super._render(force, options);
    }

    /** @override */
    _getHeaderButtons() {
        const journalEntry = this.object;
        const hasEncounter = EncounterJournalSheet.hasEncounter(journalEntry);
        let buttons = super._getHeaderButtons();
        if (hasEncounter) {
            let closeButtonIndex = buttons.findIndex(button => {return button.label === "Close";});
            if (closeButtonIndex !== undefined) {
                buttons[closeButtonIndex].label = "Save & Close";
            }
        }

        return buttons;
    }


    /** @override */
    async _updateObject(event, formData) {
        return super._updateObject(event, formData);
    }



    static getEncounterTokens(ejSheet) {
        const journalEntry = ejSheet.object;
        return EncounterJournalSheet.getEncounterTokensFromJournalEntry(journalEntry);
    }





}//end class EncounterJournalSheet





//Tweak an Encounter Journal Sheet to replace the Save button - this avoids having to override the whole _render function
Hooks.on('renderEncounterJournalSheet', async (journalSheet, html, data) => {
    const combatTokensData = EncounterJournalSheet.getEncounterTokens(journalSheet);
    if (!combatTokensData.length || !game.user.isGM) {return;}

    const addToCombatTrackerTitle = game.i18n.localize("QE.BUTTON.AddToCombatTracker");
    const addToCombatTrackerButton = await renderTemplate('modules/quick-encounters/templates/addToCombatTrackerButton.html');
    //Replace the [Save] button with a [Add to Combat Tracker] button
    if (html) {
        html.find("button[name='submit']").text(addToCombatTrackerTitle);
    }
    //Use the existing Save button
    journalSheet._updateObject = createCombat.bind(journalSheet);
});
