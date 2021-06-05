![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fspetzel2020%2Fquick-encounters%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fquick-encounters&colorB=4aa94a)

# Quick Encounters
NEW in v0.8! Better Compendium support, updated Spanish, and Foundry 0.8.x compatibility

See [Release Notes](https://github.com/spetzel2020/quick-encounters/blob/master/CHANGELOG.md)

* **Author**: Spetzel#0103
* **Version**: 0.8.0
* **Foundry VTT Compatibility**: 0.6.5-0.8.5
* **System Compatibility (If applicable)**: All; additional features for dnd5e
* **Translation Support**: en, es (thanks [lozalojo!](https://github.com/lozalojo)), ja (thanks "touge"!), de (thanks @Fallayn#6414), it (thanks [riccisi](https://github.com/riccisi))


# Description
Keeps your Scene map clean and your encounters simple by saving tokens/Actors into Quick Encounter Journal Entries:
* Design your encounters by positioning and configuring Hostile tokens, then save the tokens into a Quick Encounter Journal Entry, marked with a single Map Note on the Scene which only you the GM see
* Run your Quick Encounter by clicking the "Run Quick Encounter" button; all your saved tokens will be positioned back on the map and added to the Combat Tracker, ready to fight!
* Run encounters from converted or packaged modules with embedded Actors
* Easily scale-up encounters by changing "3 Zombies" to "10 Zombies"
* Similar to the Encounter ability in Fantasy Grounds
* For Roving Encounters move a single Map Note, not many tokens
* Save your player tokens at the entrance to a new Scene too!

Quick Encounters works well with [TokenMold](https://github.com/Moerill/token-mold#token-mold) to vary your tokens names, HP, etc (although TokenMold is not required for Quick Encounters). Quick Encounters also previews the XP for each group of hostiles if using dnd5e)

# Install
1. Go to the "Add-on Modules" tab in Foundry Setup
2. Click "Install Module" and search for **Quick Encounters** OR paste this link: "https://github.com/spetzel2020/quick-encounters/releases/latest/download/module.json"
3. Open your world and go to Settings>Manage Modules and enable Quick Encounters

# Using Quick Encounters
## Method 1 (like Fantasy Grounds "Encounters")
1. Drag your Hostile tokens (or now Tiles!) to the map and select them
2. Then click the Quick Encounters button (in the Basic Controls palette on the left); a new Journal Entry will be created with your tokens/tiles and their positions saved in it
3. Close the Journal Entry and you will see a new Quick Encounter Map Note on the Scene; double-right-click to edit the icon, color, etc.
4. To run your Quick Encounter, simply double-click the map Note and click the "Add to Combat Tracker" button; all your saved tokens/tiles will be positioned on the map and added to the Combat Tracker, ready to fight!

## Method 2
1. Drag Actors into an existing or new Journal Entry describing the encounter (you can add how many of them you want).
2. Close the Journal Entry
3. Now drag the Journal Entry to the Scene as a Note at the desired encounter position.
4. To run your Quick Encounter, simply double-click the map Note to open the Quick Encounter Journal Entry.
5. Click the Quick Encounter button: your saved tokens will be positioned around the map Note, and added to the Combat Tracker.

### Using Compendium links in Method 2
* In Step 1, you can select Actors from a Compendium and drag them directly into the Journal Entry. This lets you defer importing Actors until you actually need them (for example for rare Encounters). Currently you need to manually remove the imported Actors when and if you run the Quick Encounter.
* Note that you cannot drag the Compendium Actor to the Scene to place tokens, because that will automatically import the Actor and the link will then be to the imported Actor, not to the Compendium.

## Method 3 (save tokens/tiles into existing Journal Entries)
If you have a licensed module with existing Journal Entries you probably don't want to edit all of them to insert Actors (Method 2). Using the new Quick Encounter Dialog instead:
1. Create Hostile tokens (representing the Encounter) and drag them to the Scene
2. Open the Journal Entry you want to associate with the Quick Encounter
3. Click the Quick Encounter button and you will be asked if you want to create a new Encounter (Method 1) or add the tokens to this Journal Entry
4. To run the Encounter later, open the Journal Entry and use the Run Quick Encounter button in the Quick Encounter Dialog

## v0.7: Working with Tokens and Tiles
If you have BOTH Tokens and Tiles you want in your Quick Encounter, create the Quick Encounter with the tokens (and of the above methods). Leave the Quick Encounter open and switch to the Tiles menu (left side-bar). Place and select your tokens and click the Quick Encounter button to add the tiles to the open Quick Encounter.

Coming soon: Drag-and-drop for tokens, tiles, and other stuff!

## The Quick Encounter dialog
![QuickEncounterDialog](https://github.com/spetzel2020/quick-encounters/blob/master/img/CompanionDialog.png)

## Contributions
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T82XFQD)

## License
**Quick Encounters for Foundry VTT** by Jeffrey Pugh is licensed under the [GNU General Public License v3.0](https://github.com/spetzel2020/quick-encounters/blob/master/LICENSE)

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
