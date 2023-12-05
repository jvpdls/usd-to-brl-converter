/**
 * Retrieves all accepted HTML tags for selection.
 * @returns {NodeList} The list of accepted HTML tags.
 */
function _getAcceptedTags() {
  return document.querySelectorAll(
    "div, a, p, span, h1, h2, h3, h4, h5, h6, strong, b, i, em, u, s, li, strike, small, big, sub, sup, mark, ins, del, q, blockquote, cite, dfn, abbr, code, pre, samp, kbd, var, figcaption, math, table, caption, colgroup, col, tbody, thead, tfoot, tr, td, th, form, fieldset, legend, label, input, button, select, datalist, optgroup, option, textarea, output, progress, meter, details, summary, menuitem, menu"
  );
}

/**
 * Checks if the given array of values in USD exists.
 * @param {Array} valuesInUSD - The array of values in USD.
 * @returns {boolean} - Returns true if the array has values, false otherwise.
 */
function _checkIfUSDvaluesExist(valuesInUSD) {
  return valuesInUSD.length > 0;
}

/**
 * Alerts the number of values converted.
 * @param {number} numberOfValuesConverted - The number of values converted.
 * @returns {void}
 */
function _logNumberOfValuesConverted(numberOfValuesConverted) {
  console.log(
    "Número de valores em USD convertidos para BRL: " + numberOfValuesConverted
  );
}

/**
 * Finds and returns an array of USD values from the HTML content.
 * @returns {string[]} An array of USD values in the format "$X.XX" or "$X".
 */
function findUSDvalues() {
  let elements = _getAcceptedTags();
  let regex = /\$\d+(?:\.\d+)?/g;
  let valuesInUSD = [];

  for (let i = 0; i < elements.length; i++) {
    let value;
    while ((value = regex.exec(elements[i].textContent))) {
      valuesInUSD.push(value[0]);
    }
  }

  return valuesInUSD;
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
      let valueInBRL = parseFloat(valuesInUSD[i].substring(1)) * conversionRate;
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
 * @param {Array<number>} valuesInBRL - An array of values in BRL to replace the USD values.
 * @returns {void}
 */
function replaceUSDvalues(valuesInBRL) {
  let numberOfValuesConverted = valuesInBRL.length / 2;
  let elements = _getAcceptedTags();
  let regex = /\$\d+(?:\.\d+)?/g;

  for (let i = 0; i < elements.length; i++) {
    elements[i].innerHTML = elements[i].innerHTML.replace(regex, function () {
      return valuesInBRL.shift();
    });
  }

  _logNumberOfValuesConverted(numberOfValuesConverted);
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
    if (_checkIfUSDvaluesExist(valuesInUSD)) {
      let valuesInBRL = convertUSDtoBRL(valuesInUSD);
      replaceUSDvalues(valuesInBRL);
    } else {
      alert("Não há valores em dólar americano para serem convertidos.");
    }
  }
});
