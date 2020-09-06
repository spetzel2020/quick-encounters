"use strict";
// Created from Globals.swift
//  8/17/2020   Created/Copied

//Singleton class for globally managing detail output
export const Output =  {
    _isEnabled : false,
    _output : "",

    add(...strings) {
      this._output += strings.join('');
    },

    initialize() {
      this._output = "";
      this._isEnabled = true;
    },

    get output() {
      return this._output;
    }
}

export var printError = function(error, explicit) {
    console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}

export async function loadReferenceData(...files) {
  var spellReference = [];
  // Load external JSON spell data files
  for (let file of files)  {
    try {
        const spellsJSON = await fetch(file);
        //Format of spells JSON is an embedded array
        const spellsData = await spellsJSON.json();
        //Add all the elements of spells to spellReference
        spellReference = spellReference.concat(spellsData.spells);
    } catch (e) {
        if (e instanceof SyntaxError) {
            printError(e, true);
        } else {
            printError(e, false);
        }
    }
  }
  return spellReference;
}
