// Constants
const REGEX = /(?<!R)(?:US\$|\$)(?:\s| )*\d+(?:[\.,]\d+)*/g;
const USD_TO_BRL_API_URL = "https://economia.awesomeapi.com.br/last/USD-BRL";
const CONVERSION_SUCCESS_MESSAGE =
  "Número de valores em USD convertidos para BRL: ";
const NO_USD_VALUES_FOUND_MESSAGE =
  "❌ Não há valores em dólar americano para serem convertidos.";

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
 * @param {Array<string>} valuesInUSD - The array of values in USD.
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
    const html = element.innerHTML;
    const replaced = html.replace(/&nbsp;/g, " ");
    element.innerHTML = replaced.replace(/(\$)\s+(\d+)/g, "$1$2");
  });
}

/**
 * Finds and returns an array of USD values from the HTML content.
 * @returns {Array<string>} An array of USD values in the format "$X.XX", "$X,XX", "US$ X.XX" or "US$X,XX".
 */
function findUSDvalues() {
  const elements = getAcceptedTags();
  const valuesInUSD = new Set();

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
  const valuesInBRL = [];
  const xhr = new XMLHttpRequest();
  const url = "https://economia.awesomeapi.com.br/last/USD-BRL";

  xhr.open("GET", url, false);
  xhr.send();

  if (xhr.status === 200) {
    const response = JSON.parse(xhr.responseText);
    const conversionRate = parseFloat(response.USDBRL.bid);

    for (let i = 0; i < valuesInUSD.length; i++) {
      const valueInBRL =
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
 * Adds a message listener to the extension to perform a conversion.
 * @param {Object} request - The message object.
 * @param {Object} sender - The sender object.
 * @param {Function} sendResponse - The sendResponse function.
 * @returns {void}
 */
chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.action === "convert") {
    const valuesInUSD = findUSDvalues();
    if (checkIfUSDvaluesExist(valuesInUSD)) {
      const valuesInBRL = convertUSDtoBRL(valuesInUSD);
      sendResponse({
        content: [{ valuesInUSD: valuesInUSD }, { valuesInBRL: valuesInBRL }],
      });
    } else {
      sendResponse({ content: NO_USD_VALUES_FOUND_MESSAGE });
    }
  }
});
