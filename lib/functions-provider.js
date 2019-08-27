'use babel';

// data source is an array of objects
import suggestions from '../data/functions';

class FunctionsProvider {
	constructor() {
		// offer suggestions only when editing JS files
		this.selector = '.source.js';
	}

	getSuggestions(options) {
		//const { prefix } = options;
		const { editor, bufferPosition } = options;

		let prefix = this.getPrefix(editor, bufferPosition).toLowerCase();
		// only look for suggestions after 3 characters have been typed
		if (prefix.length >= 3) {
			if (prefix.includes("scanastudio."))
			{
				//console.log("TP2:"+prefix);
				return this.findMatchingSuggestions(prefix);
			}
		}
	}

	getPrefix(editor, bufferPosition) {
		// the prefix normally only includes characters back to the last word break
		// which is problematic if your suggestions include punctuation (like "@")
		// this expands the prefix back until a whitespace character is met
		// you can tweak this logic/regex to suit your needs
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/[A-Za-z_.]+$/);
		return match ? match[0] : '';
	}

	findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.toLowerCase();
		let matchingSuggestions = suggestions.filter((suggestion) => {
			let textLower = "scanastudio."+suggestion.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		});

		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map(this.inflateSuggestion);
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(suggestion) {
		return {
			displayText: suggestion.text,
			snippet: suggestion.snippet,
			description: suggestion.description,
			descriptionMoreURL: suggestion.descriptionMoreURL,
			type: 'function',
			rightLabel: "Context: "+suggestion.context
		};
	}
}
export default new FunctionsProvider();
