# google-translate-cli
A tiny NodeJS application to translate JSON files using Google Translate.

Uses the excelent [google-translate-api](https://github.com/matheuss/google-translate-api).

## Installation

- Clone the repository
- Run `npm install`

## Usage

```
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
```
