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
		let match = line.match(/[A-Za-z_.]+$/);
		return match ? match[0] : '';
	}

	findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case insensitive
		let input_prefix_lower = prefix.toLowerCase();
		let input_ponctuation_count =  (input_prefix_lower.match(/\./g)||[]).length
		//input_ponctuation_count +=  (input_prefix_lower.match(/\(/g)||[]).length
		//console.log("input: "+input_prefix_lower + ", n ponctuation=" + input_ponctuation_count);
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
			let sugg_prefix_lower = suggestion.prefix.toLowerCase();
			let ndots_sugg =  (sugg_prefix_lower.match(/\./g)||[]).length
			//console.log("from db: " + sugg_prefix_lower);
			if ((sugg_prefix_lower.includes("|")) && (ndots_sugg == input_ponctuation_count))
			{
				//check all possible combinations
				let dotpos = sugg_prefix_lower.lastIndexOf(".",sugg_prefix_lower.length-2);
				let tmptext = sugg_prefix_lower.slice(0,dotpos);
				let combinations = sugg_prefix_lower.slice(dotpos+1,sugg_prefix_lower.length-1).split("|");
				for (var c = 0; c < combinations.length; c++)
				{
					let combination = tmptext+"."+combinations[c]+".";
					//console.log("tmptext="+tmptext+"."+combinations[c]+".");
					if (input_prefix_lower.includes(combination))
					{
						//console.log("*** Found (1)!");
						return true;
					}
				}
				//return false;
			}
			if (input_prefix_lower.includes(sugg_prefix_lower) && (!input_prefix_lower.includes("(")) && (ndots_sugg == input_ponctuation_count) )
			{
				//console.log("*** Found (2)!");
				return true;
			}
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
