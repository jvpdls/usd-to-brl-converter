/**
 * @fileoverview This file contains the functions responsible for converting USD values to BRL.
 * @version 1.0.0
 * @since 1.0.0
 * @license MIT License. See LICENSE.md for more details.
 */

/**
 * @constant {RegExp} REGEX - The regular expression to find USD values.
 * @constant {string} USD_TO_BRL_API_URL - The URL of the API to get the current exchange rate.
 * @constant {string} CONVERSION_SUCCESS_MESSAGE - The message to be displayed when the conversion is successful.
 * @constant {string} NO_USD_VALUES_FOUND_MESSAGE - The message to be displayed when no USD values are found.
 */
// const REGEX = /(?<!R)(?:US\$|\$)(?:\s| )*\d+(?:[\.,]\d+)*/g;
const REGEX = /(?<!R)(?:US\$|\$)(?:\s| )*\d+(?:[\.,]\d+)*/g;
const USD_TO_BRL_API_URL = "https://economia.awesomeapi.com.br/last/USD-BRL";
const CONVERSION_SUCCESS_MESSAGE =
  "Número de valores em USD convertidos para BRL: ";
const NO_USD_VALUES_FOUND_MESSAGE =
  "Não há valores em dólar americano para serem convertidos.";

/**
 * Retrieves all accepted HTML tags for selection.
 * @returns {NodeList} The list of accepted HTML tags.
 */
function getAcceptedTags() {
  return document.querySelectorAll(
    "div, a, p, span, h1, h2, h3, h4, h5, h6, strong, b, i, em, u, s, li, strike, small, big, sub, sup, mark, ins, del, q, blockquote, cite, dfn, abbr, code, pre, samp, kbd, var, figcaption, math, table, caption, colgroup, col, tbody, thead, tfoot, tr, td, th, form, fieldset, legend, label, input, button, select, datalist, optgroup, option, textarea, output, progress, meter, details, summary, menuitem, menu"
  );
}

/**
 * Checks if the given array of values in USD exists.
 * @param {Array} valuesInUSD - The array of values in USD.
 * @returns {boolean} - Returns true if the array has values, false otherwise.
 */
function checkIfUSDvaluesExist(valuesInUSD) {
  return valuesInUSD.length > 0;
}

/**
 * Alerts the number of values converted.
 * @param {number} numberOfValuesConverted - The number of values converted.
 * @returns {void}
 */
function logNumberOfValuesConverted(numberOfValuesConverted) {
  console.log(CONVERSION_SUCCESS_MESSAGE + numberOfValuesConverted);
}

/**
 * Removes spaces from HTML tags that have values.
 * @param {NodeList} elements - The list of HTML tags.
 * @returns {void}
 */
function removeSpacesFromTagsWithValues(elements) {
  elements.forEach(function (element) {
    let html = element.innerHTML;
    let replaced = html.replace(/&nbsp;/g, " ");
    element.innerHTML = replaced.replace(/(\$)\s+(\d+)/g, "$1$2");
  });
}

/**
 * Finds and returns an array of USD values from the HTML content.
 * @returns {string[]} An array of USD values in the format "$X.XX", "$X,XX", "US$ X.XX" or "US$X,XX".
 */
function findUSDvalues() {
  let elements = getAcceptedTags();
  let valuesInUSD = new Set();

  for (let i = 0; i < elements.length; i++) {
    let value;
    while ((value = REGEX.exec(elements[i].textContent))) {
      valuesInUSD.add(value[0].replace(/\s/g, ""));
    }
  }

  return Array.from(valuesInUSD);
}

/**
 * Converts an array of values in USD to BRL using the current exchange rate.
 * @param {Array<string>} valuesInUSD - The array of values in USD to be converted.
 * @returns {Array<string>} - The array of values converted to BRL.
 */
function convertUSDtoBRL(valuesInUSD) {
  let valuesInBRL = [];
  let xhr = new XMLHttpRequest();
  let url = "https://economia.awesomeapi.com.br/last/USD-BRL";

  xhr.open("GET", url, false);
  xhr.send();

  if (xhr.status === 200) {
    let response = JSON.parse(xhr.responseText);
    let conversionRate = parseFloat(response.USDBRL.bid);

    for (let i = 0; i < valuesInUSD.length; i++) {
      let valueInBRL =
        parseFloat(
          valuesInUSD[i]
            .replace(/,(?=\d{2}$)/g, ".")
            .replace(/,(?=\d{3})/g, "")
            .replace(/,(?=\d{3}\b)/g, "")
            .replace(/[^\d.,]/g, "")
            .replace(/\.(?=.*\.)/g, "")
        ) * conversionRate;
      valuesInBRL.push(
        "R$ " +
          valueInBRL.toLocaleString("pt-br", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
      );
    }
  }
  return valuesInBRL;
}

/**
 * Replaces USD values in the HTML elements with corresponding values in BRL.
 * @param {Array<string>} valuesInUSD - An array of values in USD to be replaced.
 * @param {Array<number>} valuesInBRL - An array of values in BRL to replace the USD values.
 * @returns {void}
 */
function replaceUSDvalues(valuesInUSD, valuesInBRL) {
  let elements = getAcceptedTags();

  removeSpacesFromTagsWithValues(elements);

  for (let i = 0; i < elements.length; i++) {
    let value;
    while ((value = REGEX.exec(elements[i].textContent))) {
      elements[i].innerHTML = elements[i].innerHTML.replace(
        value[0],
        valuesInBRL[valuesInUSD.indexOf(value[0])]
      );
    }
  }

  logNumberOfValuesConverted(valuesInBRL.length);
}

/**
 * Adds a message listener to the extension to perform a conversion.
 * @param {Object} request - The message object.
 * @param {Object} sender - The sender object.
 * @param {Function} sendResponse - The sendResponse function.
 * @returns {void}
 */
chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  _sendResponse
) {
  if (request.action === "convert") {
    let valuesInUSD = findUSDvalues();
    console.log(valuesInUSD);
    if (checkIfUSDvaluesExist(valuesInUSD)) {
      let valuesInBRL = convertUSDtoBRL(valuesInUSD);
      console.log(valuesInBRL);
      replaceUSDvalues(valuesInUSD, valuesInBRL);
    } else {
      alert(NO_USD_VALUES_FOUND_MESSAGE);
    }
  }
});
