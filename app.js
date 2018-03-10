"use strict";

const translate = require('google-translate-api'); // https://github.com/matheuss/google-translate-api
const fs = require("fs");
const path = require("path");

/**
 * Translates the values of the specified dictionary.
 * 
 * @param {object} dict The values to translate.
 * @param {string} fromLanguage The language of the values.
 * @param {string} toLanguage The language to translate to.
 * @returns {object} A new dictionary containing the same keys and translated values.
 */
async function translateDictionary(dict, fromLanguage, toLanguage) {
    let result = {};
    let promises = Object.keys(dict).map(key => {
        let value = dict[key];
        return translate(value, {
            from: fromLanguage,
            to: toLanguage
        }).then(res => {
            result[key] = res.text;
        }).catch(err => {
            console.warn(`Error translating '${value}' from '${fromLanguage}' to '${toLanguage}': ${err}`);
        });
    });
    await Promise.all(promises);

    // Keep the original order of the keys
    let finalResult = {};
    for (let key of Object.keys(dict)) {
        finalResult[key] = result[key];
    }

    return finalResult;

    //#region DEPRECATED - Synchronous execution
    /*
    for (let key of Object.keys(dict)) {
        let value = dict[key];
        await translate(value, {
            from: fromLanguage,
            to: toLanguage
        }).then(res => {
            result[key] = res.text;
        }).catch(err => {
            console.warn(`Error translating '${value}' from '${fromLanguage}' to '${toLanguage}': ${err}`);
        });
    }
    */
    //#endregion
}

/**
 * Reads a name-value dictionary from the specified file.
 * @param {string} path Path to the file.
 * @returns The loaded data.
 */
function loadDictionary(path) {
    let data = fs.readFileSync(path);
    return JSON.parse(data);
}

/**
 * Writes a name-value dictionary to the specified file.
 * @param {string} path Path to the file.
 * @param {object} dict The dictionary to write.
 */
function saveDictionary(path, dict) {
    let data = JSON.stringify(dict, null, 4);
    fs.writeFileSync(path, data);
}

async function main(args) {

    //#region Parse command line arguments

    if (args.length != 4) {
        help();
        return;
    }

    let inputFile, outputPath, inputLang, outputLangText;

    [inputFile, outputPath, inputLang, outputLangText] = args;

    let outputLangList = outputLangText.split(",");

    if (false == fs.existsSync(inputFile)) {
        console.log(`File '${inputFile}' not found.`);
        return;
    }
    if (inputLang == ".") {
        inputLang = "auto";
    }
    if (outputLangText.length == 0) {
        console.log(`At least one output language must be specified.`);
        return;
    }
    let isOutputDirectory = fs.lstatSync(outputPath).isDirectory();
    if (outputLangList.length > 1 && false == isOutputDirectory) {
        console.log(`Output directory not found: '${outputPath}'.`);
        return;
    }

    //#endregion

    var data = loadDictionary(inputFile);

    for (let langauge of outputLangList) {
        let outputFile;
        if (isOutputDirectory) {
            outputFile = path.join(outputPath, langauge + ".json");
        } else {
            outputFile = outputPath;
        }

        console.log(`Translating to ${langauge} ...`);
        
        let startTime = process.hrtime();
        let outputData = await translateDictionary(data, inputLang, langauge);
        let elapsedTime = process.hrtime(startTime);
        let elapsedTimeSecondsText = (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed(3);
        console.log(`Translated in ${elapsedTimeSecondsText}s. Saving translation to ${outputFile} ...`);
        saveDictionary(outputFile, outputData);
    }

    console.log("All done.");
}

/** 
 * Displays information about the command-line arguments and their usage.
 */
function help() {
    console.log(`
Translates all values in a JSON file to other language(s) using
Google Translate.
    
Usage: 

    app <input-file> <output-file> {<input-lang>|.} <output-lang>
    app <input-file> <output-path> {<input-lang>|.} <output-lang>[,...]

Arguments:

    input-file                      Input JSON file.
    output-path                     Output JSON file or a directory.
    input-lang                      Input language or '.' to detect the
                                    language automatically.
    output-lang                     Output langauge. If more than one are
                                    specified then 'output-path' must be
                                    be an existing directory.

Examples:

    app en.json fr.json en fr       Translates en.json in English to fr.json in
                                    French.
    app some.json de.json . de      Translates some in some language to de.json
                                    in German.
    app en.json .\ fr,de,es         Translates en.json in English to French,
                                    German and Spanish and stores the result in
                                    fr.json, de.json and es.json in the current
                                    directory.

Example files:

[ input: en.json ]
{
    "Title": "Hello World"
    "Content: "A simple, automated translation."
}
[ output: fr.json ]
{
    "Title": "Bonjour le monde"
    "Content: "Une traduction simple et automatisée."
}

Supported languages:
`);

    Object.keys(translate.languages).forEach((key, index) => {
        let value = translate.languages[key];
        if (typeof (value) == "string") {
            console.log(`    ${key.padEnd(15)} ${translate.languages[key]}`);
        }
    });

    process.exitCode = 1;
}

main(process.argv.slice(2));