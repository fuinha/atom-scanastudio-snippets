'use babel';

// data source is an array of objects
import suggestions from '../data/variables';

class VariablesProvider {
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
		let match = line.match(/\S+$/);
		return match ? match[0] : '';
	}

	findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.toLowerCase();
		let ndots_input =  (prefixLower.match(/\./g)||[]).length
		console.log("input: "+prefixLower + ", n dots=" + ndots_input);
		let tmp_suggestions = [];
		//Inflate or'ed texts:
		for (var i = 0; i < suggestions.length; i++)
		{
			if (suggestions[i].text.includes("|"))
			{
				var tmp_text = suggestions[i].text.split("|");
				for (var t = 0; t < tmp_text.length; t++)
				{
					tmp_suggestions.push(this.copy_sugg(suggestions[i]));
					tmp_suggestions[tmp_suggestions.length-1].text = tmp_text[t];
				}
			}
			else
			{
				tmp_suggestions.push(suggestions[i]);
			}
		}

		let matchingSuggestions = tmp_suggestions.filter((suggestion) => {
			let textLower = suggestion.prefix.toLowerCase();
			let ndots_sugg =  (textLower.match(/\./g)||[]).length
			console.log("from db: " + textLower);
			if ((textLower.includes("|")) && (ndots_sugg == ndots_input))
			{
				//check all possible combinations
				let dotpos = textLower.lastIndexOf(".",textLower.length-2);
				let tmptext = textLower.slice(0,dotpos);
				let combinations = textLower.slice(dotpos+1,textLower.length-1).split("|");
				for (var c = 0; c < combinations.length; c++)
				{
					let combination = tmptext+"."+combinations[c]+".";
					//console.log("tmptext="+tmptext+"."+combinations[c]+".");
					if (prefixLower.includes(combination))
					{
						return true;
					}
				}
				//return false;
			}
			if (prefixLower.includes(textLower) && (ndots_sugg == ndots_input) )
			{
				console.log("*** Found!");
			}
			return (prefixLower.includes(textLower) && (ndots_sugg == ndots_input) ) ;
		});

		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map(this.inflateSuggestion);
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(suggestion) {
		return {
			displayText: suggestion.text,
			snippet: suggestion.text,
			description: suggestion.description,
			descriptionMoreURL: "",
			type: 'value',
			rightLabel: "Context: Global"
		};
	}

	copy_sugg(s) {
		return {
			text: s.text,
			prefix: s.prefix,
			description: s.description
		}
	}
}
export default new VariablesProvider();
