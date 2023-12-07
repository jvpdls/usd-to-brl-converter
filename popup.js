/**
 * @fileoverview This file contains the logic for the popup window.
 * @version 1.0.0
 * @since 1.0.0
 * @license MIT License. See LICENSE.md for more details.
 */

/**
  * Sends a message to the content script to convert USD values to BRL.
  * Receives a response from the content script with the converted values.
  * @returns {void}
  */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("convertBtn").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "convert" },
        function (response) {
          if (typeof response.content === "string") {
            document.getElementById("response-container").innerHTML =
              "<p>" + response.content + "</p><hr>";
          } else {
            let valuesInUSD = response.content[0].valuesInUSD;
            let valuesInBRL = response.content[1].valuesInBRL;
            let table =
              "<table><thead><tr><th>Valor em USD</th><th>Valor em BRL</th></tr></thead><tbody>";
            for (let i = 0; i < valuesInUSD.length; i++) {
              table +=
                "<tr><td>" +
                valuesInUSD[i] +
                "</td><td>" +
                valuesInBRL[i] +
                "</td></tr>";
            }
            table += "</tbody></table>";
            table += "<hr>";
            document.getElementById("response-container").innerHTML = table;
          }
        }
      );
    });
  });
});
