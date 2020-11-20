let bigString;
let totalSize;

window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked;
    const nameField = document.querySelector("#searchterm");
    const prefix = "ask9458-";
    const nameKey = prefix + "name";
    const storedName = localStorage.getItem(nameKey);

    if (storedName) {
        nameField.value = storedName;
    }
    else {
        nameField.value = "Golos, Tireless Pilgrim"
    }

    nameField.onchange = (e) => { localStorage.setItem(nameKey, e.target.value); }

    searchButtonClicked();
}

function searchButtonClicked() {
    document.querySelector("#status").innerHTML = '<b>Searching...</b><br><img src="images/spinner.gif">';
    document.querySelector("#content").innerHTML = "";
    bigString = "";
    totalSize = 0;

    const MTG_URL = "https://api.scryfall.com/cards/search?order=edhrec&q=is%3ACommander";
    let url = MTG_URL;

    let term = document.querySelector("#searchterm").value;

    term = term.trim();

    term = encodeURIComponent(term);

    if (term.length > 0) {
        url += `+${term}`;
    }

    // Determines color string to be added
    let colorless = true;
    let colorString = ""
    let colors = document.querySelectorAll(".color");
    let strictness = document.querySelector("#strictness").value;
    for (let i = 0; i < colors.length; i++) {
        if (colors[i].checked) {
            colorString += colors[i].value;
            colorless = false;
        }
    }
    if (colorless) {
        if (strictness != "including") {
            colorString += "+color%3Dc";
        }
    }
    else {
        if (strictness == "exact") {
            url += "+color%3D";
        }
        else if (strictness == "including") {
            url += "+color>%3D";
        }
        else {
            url += "+color<%3D";
        }
    }
    url += colorString;

    // Determines mana cost to be added
    let cost = document.querySelector("#manacost").value;
    if (cost != "") {
        url += "+cmc"
        strictness = document.querySelector("#manastrict").value;
        if (strictness == "less") {
            url += "<";
        }
        else if (strictness == "lessequal") {
            url += "<%3D";
        }
        else if (strictness == "equal") {
            url += "%3D";
        }
        else if (strictness == "greater") {
            url += ">";
        }
        else {
            url += ">%3D";
        }
        url += cost;
    }

    // For tribal commanders
    let tribe = document.querySelector("#tribe").value;
    switch (tribe) {
        case "none":
            break;
        case "angel":
            url += "+%28t%3Aangel+or+o%3Aangel%29";
            break;
        case "cat":
            url += "+%28t%3Acat+or+o%3Acat%29";
            break;
        case "eldrazi":
            url += "+%28t%3Aeldrazi+or+morophon%29";
            break;
        case "elemental":
            url += "+%28t%3Aelemental+or+o%3Aelemental%29";
            break;
        case "hydra":
            url += "+%28t%3Ahydra+or+o%3Ahydra%29";
            break;
        case "shapeshifter":
            url += "+t%3Ashapeshifter";
            break;
        default:
            url += `+%28o%3A%2F%28%3F<%21non-%29${tribe}%2F+or+morophon%29`;
    }

    // For specific strategies
    let strat = document.querySelector("#strat").value;
    switch (strat) {
        case "+1/+1":
            url += "+%28o%3A%2Fput.*counters%2F+or+o%3A%2Fcounters.*put%2F+or+o%3Aproliferate%29";
            break;
        case "-1/-1":
            url += "+o%3A-1%2F-1";
            break;
        case "aristocrats":
            url += "+%28o%3A%2Floses+%5Cd%5C+life+and.*gain+%5Cd%5C+life%2F+or+o%3A%2Fsacrifice.*%3A%2F%29";
            break;
        case "artifacts":
            url += "+o%3A%2F%28%3F<%21destroy.*%29artifact%2F";
            break;
        case "auras":
            url += "+o%3Aaura";
            break;
        case "clones":
            url += '+o%3A"copy+of"';
            break;
        case "discard":
            url += '+%28o%3A"discards+a+card"+or+o%3A%2Fopponent.*discard%2F%29';
            break;
        case "draw":
            url += '+o%3A"draw+a+card"';
            break;
        case "enchantments":
            url += "+o%3A%2F%28%3F<%21destroy.*%29enchantment%2F";
            break;
        case "equip":
            url += "+o%3Aequipment";
            break;
        case "flicker":
            url += "+o%3A%2Fexile.*return.*battlefield%2F+-o%3Atransformed";
            break;
        case "flying":
            url += "+o%3A%2F%28%3F<%21token.*%29with+flying%2F";
            break;
        case "lands":
            url += '+%28o%3A"land+enters+the+battlefield+under+your+control"+or+o%3A%2F%28%3F<%21non%29land+card%2F%29';
            break;
        case "legends":
            url += "+o%3A%2F%28%3F<%21non%29legendary%2F";
            break;
        case "mill":
            url += "+o%3Amill";
            break;
        case "reborn":
            url += "+o%3A%2F%28return%7Cplay%29.*from+your+graveyard%2F";
            break;
        case "spells":
            url += '+o%3A"instant+or+sorcery+spell"';
            break;
    }

    //console.log(url);

    getData(url);
}

function getData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e) {
    let xhr = e.target;
    let obj = JSON.parse(xhr.responseText);
    // console.log(obj);

    // If object doesn't parse correctly
    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for the above parameters</b>";
        return;
    }

    // Initialize variables for later
    let results = obj.data;
    totalSize += results.length;

    // Loop through results to display images
    for (let i = 0; i < results.length; i++) {
        let result = results[i];
        let line = `<a href='${result.scryfall_uri}'>`;
        if (result.layout == "transform") {
            line += `<img src='${result.card_faces[0].image_uris.normal}' class='cardimage' alt='${result.name}'></a>`;
        }
        else {
            line += `<img src='${result.image_uris.normal}' class='cardimage' alt='${result.name}'></a>`;
        }
        bigString += line;
    }

    // Recurse to next page
    if (obj.has_more) {
        getData(obj.next_page);
    }
    else {
        // Change inner HTML to display string from above
        document.querySelector("#content").innerHTML = bigString;

        // Change status to display total results
        if (results.length == 1) {
            document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is 1 result for your parameters</i></p>";
        }
        else {
            document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + totalSize + " results for your parameters</i></p>";
        }
    }
}

function dataError(e) {
    console.log("An error occurred.");
}