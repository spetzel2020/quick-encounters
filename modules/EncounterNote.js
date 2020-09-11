import {MODULE_NAME} from './QuickEncounter.js';

//Expand the available list of Note icons
const moreNoteIcons = {
    "Combat" : "icons/svg/combat.svg"
}
Object.assign(CONFIG.JournalEntry.noteIcons, moreNoteIcons);


/*
Extend the placeable Map Note - select the desired tokens and then tap the Quick Encounters button
Subsequently can add: (a) Drag additional tokens in, (b) populate the Combat Tracker when you open the note?
27-Aug-2020   Created
30-Aug-2020   Added EncounterNoteConfig


*/
export class EncounterNoteConfig extends NoteConfig {
    /** @override  */
    static get defaultOptions() {
    	  const options = super.defaultOptions;
    	  options.id = "encounter-note-config";
          options.title = game.i18n.localize("QE.NOTE.ConfigTitle");
    	  return options;
    }
}

export class EncounterNote{
    static async create(journalEntry, noteAnchor) {
        if (!journalEntry) {return;}
        // Create Note data
        const noteData = {
              entryId: journalEntry.id,
              x: noteAnchor.x,
              y: noteAnchor.y,
              icon: CONFIG.JournalEntry.noteIcons.Sword,
              iconSize: 80,
              iconTint: "#FF0000",  //Red
              //Don't specify the name so it inherits from the Journal
              textAnchor: CONST.TEXT_ANCHOR_POINTS.TOP,
              fontSize: 24
        };

        //Use new Note rather than Note.create because this won't be persisted
        //Until the GM "saves" the Note
        //This uses the same approach as JournalEntry._onDropData
        let newNote = new Note(noteData);

        newNote._sheet = new EncounterNoteConfig(newNote);

        return newNote;

    }

/*
  constructor(tokens, ...args) {
      super(...args);

      //Clone the passed selected tokens so that we can reproduce them
      //But we store them with the underlying Note so they can be accessed easily
      this.savedTokens = [];
      tokens.forEach((token, i) => {
          this.savedTokens.push(token.clone());
      });
      super.savedTokens = this.savedTokens;

      this._sheet = new EncounterNoteConfig(this);


      //Is the scene saved? Because we will use that to place the Tokens back on the map
  }
*/


  /** @override */
 /*
  _onClickLeft2(event) {
    const sheet = this.sheet;
    //TODO: Populate the Combat Tracker as well as popping-up the associated Encounter Journal

    sheet.render();
    //sheet.render(true, {token: this});
    ///sheet.maximize();


  }
*/

}



Hooks.on(`renderEncounterNoteConfig`, async (noteConfig, html, data) => {
    const saveEncounterMapNote = game.i18n.localize("QE.BUTTON.SaveEncounterMapNote");
    html.find('button[name="submit"]').text(saveEncounterMapNote);
});
