/**
 * Updates the response container with the given content.
 * @param {Array<object>|string} content - The content to be displayed.
 * @returns {void}
 */
function updateResponseContainer(content) {
  const container = document.getElementById("response-container");
  if (typeof content === "string") {
    container.innerHTML = `<p>${content}</p><hr>`;
  } else {
    const tableHTML = generateTableHTML(
      content[0].valuesInUSD,
      content[1].valuesInBRL
    );
    container.innerHTML = `${tableHTML}<hr>`;
  }
}

/**
 * Generates an HTML table string with values in USD and BRL.
 *
 * @param {Array<string>} valuesInUSD - An array of values in USD.
 * @param {Array<string>} valuesInBRL - An array of values in BRL.
 * @returns {string} The generated HTML table as a string.
 */
function generateTableHTML(valuesInUSD, valuesInBRL) {
  let table = `
    <table>
      <thead>
        <tr>
          <th>Valor em USD</th>
          <th>Valor em BRL</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (let i = 0; i < valuesInUSD.length; i++) {
    table += `
      <tr>
        <td>${valuesInUSD[i]}</td>
        <td>${valuesInBRL[i]}</td>
      </tr>
    `;
  }
  table += `
      </tbody>
    </table>
  `;
  return table;
}

/**
 * Listens for the convert button click event and sends a message to the content script to convert the values.
 */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("convertBtn").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "convert" },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
          }
          updateResponseContainer(response.content);
        }
      );
    });
  });
});
